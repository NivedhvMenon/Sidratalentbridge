


-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- 1. Candidates Table
create table public.candidates (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text not null,
    email text not null unique,
    phone text,
    resume_file_url text,
    skills text[] default '{}'::text[] not null,
    experience_summary text,
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Employers Table
create table public.employers (
    id uuid references auth.users(id) on delete cascade primary key,
    company_name text not null,
    contact_name text not null,
    email text not null unique,
    phone text,
    verified boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Admin Users Table
create table public.admin_users (
    id uuid references auth.users(id) on delete cascade primary key,
    email text not null unique,
    role text default 'admin' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Jobs Table
create table public.jobs (
    id uuid default gen_random_uuid() primary key,
    employer_id uuid references public.employers(id) on delete cascade not null,
    title text not null,
    description text not null,
    category text not null, -- e.g. IT, Healthcare, Manufacturing, Retail, Construction
    location text not null,
    is_abroad boolean default false not null,
    salary_range text,
    employment_type text not null, -- e.g. Full-time, Part-time, Contract, Internship
    status text default 'open' not null, -- open, closed
    posted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Applications Table
create table public.applications (
    id uuid default gen_random_uuid() primary key,
    job_id uuid references public.jobs(id) on delete cascade not null,
    candidate_id uuid references public.candidates(id) on delete cascade not null,
    status text default 'applied' not null, -- applied, shortlisted, rejected, hired
    applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_job_candidate unique(job_id, candidate_id)
);

-- 6. Blog Posts Table
create table public.blog_posts (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    slug text not null unique,
    content text not null,
    category text not null, -- career-tips, interview-guidance, hiring-trends, recruitment-insights
    author text not null,
    published_at timestamp with time zone,
    is_published boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Employer Requirements Table (leads / offline requests)
create table public.employer_requirements (
    id uuid default gen_random_uuid() primary key,
    company_name text not null,
    contact_name text not null,
    email text not null,
    phone text,
    role_needed text not null,
    description text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.candidates enable row level security;
alter table public.employers enable row level security;
alter table public.admin_users enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.blog_posts enable row level security;
alter table public.employer_requirements enable row level security;

-- Setup RLS Policies

-- Helpers functions to check roles
create or replace function public.is_admin()
returns boolean as $$
begin
    return exists (
        select 1 from public.admin_users where id = auth.uid()
    );
end;
$$ language plpgsql security definer;

create or replace function public.is_employer()
returns boolean as $$
begin
    return exists (
        select 1 from public.employers where id = auth.uid()
    );
end;
$$ language plpgsql security definer;

-- Candidates Policies
create policy "Admins can view and manage all candidates" 
    on public.candidates for all using (public.is_admin());

create policy "Candidates can view and edit their own profile" 
    on public.candidates for all using (auth.uid() = id);

create policy "Employers can view candidate info if they have applied to their job"
    on public.candidates for select using (
        exists (
            select 1 from public.applications app
            join public.jobs j on app.job_id = j.id
            where app.candidate_id = public.candidates.id and j.employer_id = auth.uid()
        )
    );

-- Employers Policies
create policy "Admins can view and manage all employers" 
    on public.employers for all using (public.is_admin());

create policy "Employers can view and edit their own profile" 
    on public.employers for all using (auth.uid() = id);

create policy "Anyone can view employer profiles"
    on public.employers for select using (true);

-- Admin Users Policies
create policy "Admins can view and manage admin list" 
    on public.admin_users for all using (public.is_admin());

create policy "Admins can read their own row"
    on public.admin_users for select using (auth.uid() = id);

-- Jobs Policies
create policy "Anyone can view open jobs" 
    on public.jobs for select using (status = 'open');

create policy "Employers can view and manage their own jobs" 
    on public.jobs for all using (employer_id = auth.uid());

create policy "Admins can manage all jobs" 
    on public.jobs for all using (public.is_admin());

-- Applications Policies
create policy "Candidates can view and create their own applications" 
    on public.applications for all using (candidate_id = auth.uid());

create policy "Employers can view applications for their own jobs" 
    on public.applications for select using (
        exists (
            select 1 from public.jobs j where j.id = public.applications.job_id and j.employer_id = auth.uid()
        )
    );

create policy "Employers can update status of applications for their own jobs"
    on public.applications for update using (
        exists (
            select 1 from public.jobs j where j.id = public.applications.job_id and j.employer_id = auth.uid()
        )
    ) with check (
        exists (
            select 1 from public.jobs j where j.id = public.applications.job_id and j.employer_id = auth.uid()
        )
    );

create policy "Admins can manage all applications" 
    on public.applications for all using (public.is_admin());

-- Blog Posts Policies
create policy "Anyone can view published blog posts" 
    on public.blog_posts for select using (is_published = true);

create policy "Admins can manage all blog posts" 
    on public.blog_posts for all using (public.is_admin());

-- Employer Requirements Policies
create policy "Anyone can submit employer requirements" 
    on public.employer_requirements for insert with check (true);

create policy "Admins can view and manage all requirements" 
    on public.employer_requirements for all using (public.is_admin());


-- Trigger function to automatically handle new auth user signups
create or replace function public.handle_new_user()
returns trigger as $$
declare
    user_role text;
    full_name_val text;
    company_name_val text;
    contact_name_val text;
    phone_val text;
begin
    -- Get user role from metadata, default to 'candidate' if not specified
    user_role := coalesce(new.raw_user_meta_data->>'role', 'candidate');
    phone_val := new.raw_user_meta_data->>'phone';

    if user_role = 'candidate' then
        full_name_val := coalesce(new.raw_user_meta_data->>'full_name', 'New Candidate');
        insert into public.candidates (id, full_name, email, phone)
        values (new.id, full_name_val, new.email, phone_val)
        on conflict (id) do update 
        set full_name = excluded.full_name, phone = excluded.phone;
    elsif user_role = 'employer' then
        company_name_val := coalesce(new.raw_user_meta_data->>'company_name', 'New Company');
        contact_name_val := coalesce(new.raw_user_meta_data->>'contact_name', 'New Contact');
        insert into public.employers (id, company_name, contact_name, email, phone)
        values (new.id, company_name_val, contact_name_val, new.email, phone_val)
        on conflict (id) do update 
        set company_name = excluded.company_name, contact_name = excluded.contact_name, phone = excluded.phone;
    elsif user_role = 'admin' then
        insert into public.admin_users (id, email, role)
        values (new.id, new.email, 'admin')
        on conflict (id) do nothing;
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
