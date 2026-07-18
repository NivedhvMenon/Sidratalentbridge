# Sidra Talent Bridge Website (Phase 1 Setup)

This is a modern Next.js 16 recruitment agency web application designed for Sidra Talent Bridge, styling with Tailwind CSS 4, and powered by Supabase Auth (via Email OTP/Magic Links) & PostgreSQL.

---

## 🔑 Environment Variables

To run this application locally or in production, create a `.env.local` file in the root directory and define the following variables:

```ini
# Supabase Project API Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Transactional Email Service
RESEND_API_KEY=re_your_resend_api_key

# Routing Configurations
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🗄️ Database Schema Migration

The initial PostgreSQL schema migration script is saved under:
📂 [`supabase/migrations/20260712000000_init_schema.sql`](file:///c:/Users/ROG%20STRIX/OneDrive%20-%20Amrita%20vishwa%20vidyapeetham/Desktop/Sidratelentbridge/supabase/migrations/20260712000000_init_schema.sql)

### How to apply it:
1. **Supabase Console**:
   - Go to your Supabase Project dashboard.
   - Click on the **SQL Editor** tab on the left sidebar.
   - Copy-paste the content of `20260712000000_init_schema.sql` into a new query window.
   - Click **Run** to set up the tables, Row Level Security (RLS) policies, triggers, and helper functions.

2. **Supabase CLI** (if configured):
   - Run `supabase db push` to push local migrations to your active remote instance.

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view the application.
4. Try visiting protected pathways like `/dashboard/candidate` or `/dashboard/employer` to test the auth middleware redirects.
