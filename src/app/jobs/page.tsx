import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import JobFilters from './JobFilters';
import { Briefcase, MapPin, Globe, ArrowRight, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    location?: string;
    type?: string;
    abroad?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  
  // Resolve search parameters
  const params = await searchParams;
  const q = params.q || '';
  const category = params.category || '';
  const location = params.location || '';
  const type = params.type || '';
  const abroad = params.abroad === 'true';

  // Build supabase query
  let query = supabase
    .from('jobs')
    .select('*, employers(company_name)')
    .eq('status', 'open');

  if (category) {
    query = query.eq('category', category);
  }
  
  if (type) {
    query = query.eq('employment_type', type);
  }
  
  if (abroad) {
    query = query.eq('is_abroad', true);
  }

  if (location) {
    if (location === 'Abroad') {
      query = query.eq('is_abroad', true);
    } else {
      query = query.ilike('location', `%${location}%`);
    }
  }

  if (q) {
    // search in title or description
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: jobs, error } = await query.order('posted_at', { ascending: false });

  // Fallback for query parameters representation in client filters
  const activeFilters = {
    q,
    category,
    location,
    type,
    abroad,
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="bg-slate-50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Find Your Next Opportunity
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Explore verified professional vacancies in healthcare, engineering, technology, and administration.
          </p>
        </div>

        {/* Board Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filters Sidebar (Left) */}
          <div className="lg:col-span-3">
            <JobFilters initialFilters={activeFilters} />
          </div>

          {/* Job Listings Column (Right) */}
          <div className="lg:col-span-9 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 text-sm">
                Error loading jobs. Please try refreshing.
              </div>
            )}

            {!jobs || jobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Matching Positions Found</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  We couldn't find any active vacancies matching your search query or filters. Try adjusting your filter parameters or resetting the form.
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md"
                >
                  View All Openings
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">
                  Showing {jobs.length} open position{jobs.length === 1 ? '' : 's'}
                </p>
                
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between gap-6"
                  >
                    <div className="flex-1 space-y-4">
                      {/* Badge Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase tracking-wider">
                          {job.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                          job.is_abroad ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {job.is_abroad ? '✈️ Overseas' : '📍 Domestic'}
                        </span>
                      </div>

                      {/* Header Title */}
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                          {job.title}
                        </h2>
                        <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>{job.company_name || job.employers?.company_name || 'Sidra Client'}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {job.location}
                          </span>
                        </p>
                      </div>

                      {/* Snippet Description */}
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Footer Specs */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={14} className="text-slate-400" />
                          {job.employment_type}
                        </span>
                        {job.salary_range && (
                          <span className="flex items-center gap-1.5">
                            💰 {job.salary_range}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDate(job.posted_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button Row */}
                    <div className="flex md:flex-col justify-end items-end shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        View & Apply
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
