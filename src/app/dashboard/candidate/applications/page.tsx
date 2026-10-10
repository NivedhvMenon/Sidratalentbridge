import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Briefcase, Calendar, MapPin, Tag, ChevronRight, Sparkles, Inbox } from 'lucide-react';

export const metadata = {
  title: 'My Applications | Sidra Talent Bridge',
  description: 'Track the status of your global job applications.',
};

interface ApplicationItem {
  id: string;
  applied_at: string;
  status: string;
  jobs: {
    title: string;
    location: string;
    category: string;
    employers: {
      company_name: string;
    } | null;
  } | null;
}

export default async function ApplicationsPage() {
  const supabase = await createClient();

  // Get logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch applications
  const { data: rawApps, error } = await supabase
    .from('applications')
    .select(`
      id,
      applied_at,
      status,
      jobs (
        title,
        location,
        category,
        company_name,
        employers (
          company_name
        )
      )
    `)
    .eq('candidate_id', user.id)
    .order('applied_at', { ascending: false });

  const applications = (rawApps || []) as unknown as ApplicationItem[];

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper to get status styles
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Shortlisted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            Rejected
          </span>
        );
      case 'hired':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Hired 🎉
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Applied
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3 border border-blue-100">
          <Sparkles size={12} />
          Application Tracker
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Track, monitor, and view the progress of your submissions to international and domestic opportunities.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm">
          Failed to load applications. Please try again later.
        </div>
      )}

      {/* Applications Listing */}
      {applications.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 text-center rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <Inbox size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No applications found</h3>
            <p className="text-xs text-slate-400 mt-1">
              You haven&apos;t applied to any job listings yet. Start searching on the jobs board!
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-md"
          >
            Explore Jobs Board
            <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
          {applications.map((app) => {
            const jobTitle = app.jobs?.title || 'Unknown Job';
            const companyName = (app.jobs as any)?.company_name || app.jobs?.employers?.company_name || 'Sidra Client';
            const location = app.jobs?.location || 'Unknown Location';
            const category = app.jobs?.category || 'General';

            return (
              <div key={app.id} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {jobTitle}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {companyName}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-300" />
                      {location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Tag size={13} className="text-slate-300" />
                      {category}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-300" />
                      Applied on {formatDate(app.applied_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center self-start sm:self-center gap-3">
                  {getStatusBadge(app.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
