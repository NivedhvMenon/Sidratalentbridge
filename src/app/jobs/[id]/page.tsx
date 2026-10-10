import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import JobApplicationForm from './JobApplicationForm';
import { Briefcase, MapPin, Globe, Calendar, ArrowLeft, ArrowUpRight, MessageCircle } from 'lucide-react';
import { CONTACT_DETAILS } from '@/config/contact';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate dynamic title/description tags for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase
    .from('jobs')
    .select('title, category, location')
    .eq('id', id)
    .single();

  if (!job) {
    return {
      title: 'Job Not Found | Sidra Talent Bridge',
    };
  }

  return {
    title: `${job.title} in ${job.location} | Sidra Talent Bridge`,
    description: `Apply for ${job.title} (${job.category}) in ${job.location}. Find career growth with Sidra Talent Bridge.`,
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Job Info
  const { data: job } = await supabase
    .from('jobs')
    .select('*, employers(company_name, email)')
    .eq('id', id)
    .single();

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Job Listing Not Found</h1>
        <p className="text-slate-500 text-sm mb-6">
          The position you are looking for may have been filled, deleted, or has expired.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all"
        >
          <ArrowLeft size={16} />
          Back to Jobs Board
        </Link>
      </div>
    );
  }

  // 2. Fetch User & Profile if authenticated candidate
  const { data: { user } } = await supabase.auth.getUser();
  let candidateProfile = null;
  const isAuthenticated = !!user;

  if (user && user.user_metadata?.role === 'candidate') {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    candidateProfile = data;
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  // WhatsApp apply message
  const whatsappMsg = `Hello, I want to apply for the "${job.title}" role (ID: ${job.id}) listed on Sidra Talent Bridge. Please guide me on the next steps.`;
  const whatsappUrl = `https://wa.me/${CONTACT_DETAILS.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="bg-slate-50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Jobs Board
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main details panel (Left) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
              
              {/* Header Info */}
              <div className="border-b border-slate-100 pb-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-extrabold uppercase tracking-wide">
                    {job.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wide ${
                    job.is_abroad ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {job.is_abroad ? '✈️ Job Abroad' : '📍 Domestic Placement'}
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {job.title}
                  </h1>
                  <p className="text-sm font-semibold text-slate-500 mt-2">
                    {job.company_name || job.employers?.company_name || 'Sidra Client'} &bull; {job.location}
                  </p>
                </div>

                {/* Spec row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs font-bold text-slate-600">
                  <div className="bg-slate-50 p-3 rounded-xl flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Employment Type</span>
                    <span className="flex items-center gap-1 mt-0.5">
                      <Briefcase size={12} className="text-slate-400" />
                      {job.employment_type}
                    </span>
                  </div>
                  {job.salary_range && (
                    <div className="bg-slate-50 p-3 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">Salary / Package</span>
                      <span className="flex items-center gap-1 mt-0.5">
                        💰 {job.salary_range}
                      </span>
                    </div>
                  )}
                  <div className="bg-slate-50 p-3 rounded-xl flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Date Posted</span>
                    <span className="flex items-center gap-1 mt-0.5">
                      <Calendar size={12} className="text-slate-400" />
                      {formatDate(job.posted_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">Job Description & Scope</h3>
                <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Instant WhatsApp Quick Apply CTA */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Have quick questions about this role?</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Apply directly or chat with our recruiter via WhatsApp.</p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={18} />
                  Apply via WhatsApp
                  <ArrowUpRight size={14} />
                </a>
              </div>

            </div>
          </div>

          {/* Form column (Right) */}
          <div className="lg:col-span-4">
            <JobApplicationForm
              jobId={job.id}
              jobTitle={job.title}
              isAuthenticated={isAuthenticated}
              candidateProfile={candidateProfile}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
