-- Create private resumes bucket in storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'resumes', 
    'resumes', 
    false, -- Private bucket
    5242880, -- 5MB limit in bytes (5 * 1024 * 1024)
    array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] -- PDF and DOCX only
)
on conflict (id) do nothing;

-- Ensure RLS is active on storage objects
alter table storage.objects enable row level security;

-- Storage Policies for Resumes

-- 1. Candidates can upload their own resumes
create policy "Candidates can upload their own resumes"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'resumes'
    and (auth.uid()::text = (storage.foldername(name))[1])
);

-- 2. Candidates can update their own resumes
create policy "Candidates can update their own resumes"
on storage.objects for update
to authenticated
using (
    bucket_id = 'resumes'
    and (auth.uid()::text = (storage.foldername(name))[1])
);

-- 3. Candidates can delete their own resumes
create policy "Candidates can delete their own resumes"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'resumes'
    and (auth.uid()::text = (storage.foldername(name))[1])
);

-- 4. Candidates can read their own resumes
create policy "Candidates can read their own resumes"
on storage.objects for select
to authenticated
using (
    bucket_id = 'resumes'
    and (auth.uid()::text = (storage.foldername(name))[1])
);

-- 5. System administrators can read all resumes
create policy "Admins can read all resumes"
on storage.objects for select
to authenticated
using (
    bucket_id = 'resumes'
    and (
        exists (
            select 1 from public.admin_users where id = auth.uid()
        )
    )
);

-- 6. Employers can read resumes of candidates who applied to their jobs
create policy "Employers can read resumes of applicants"
on storage.objects for select
to authenticated
using (
    bucket_id = 'resumes'
    and (
        exists (
            select 1 from public.applications app
            join public.jobs j on app.job_id = j.id
            where (storage.foldername(name))[1] = app.candidate_id::text
            and j.employer_id = auth.uid()
        )
    )
);
