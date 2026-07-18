import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { Briefcase, Globe, Award, ShieldCheck, ArrowRight, Users, CheckCircle } from 'lucide-react';
import { CONTACT_DETAILS } from '@/config/contact';

// Revalidate home page frequently to show new jobs
export const revalidate = 60; 

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch latest 4 open jobs
  let jobs = [];
  try {
    const { data } = await supabase
      .from('jobs')
      .select('*, employers(company_name)')
      .eq('status', 'open')
      .order('posted_at', { ascending: false })
      .limit(4);
      
    jobs = data || [];
  } catch (err) {
    console.error('Failed to fetch featured jobs:', err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section - Widescreen Cover Image with Sapphire Mask */}
      <section className="relative overflow-hidden bg-slate-950 py-32 sm:py-40 text-white border-b border-slate-900">
        {/* Widescreen background cover image */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/talent-bridge-cover.png"
            alt="Sidra Talent Bridge Network Background"
            fill
            priority
            className="object-cover"
          />
          {/* Gradients mask for high contrast readability and Apple aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6 text-center sm:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Global Recruitment Solutions
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              Building Careers.<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200 bg-clip-text text-transparent">
                Bridging Futures.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl drop-shadow-sm">
              Sidra Talent Bridge is your premier gateway to global career progression and customized workforce solutions. We connect top-tier professionals with leading companies across India and abroad.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start pt-4">
              <Link
                href="/jobs"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold px-8 py-4 rounded-xl text-center shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase size={18} />
                Apply for Jobs
              </Link>
              <Link
                href="/employers"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/20 hover:border-white/30 font-bold px-8 py-4 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Hire Talent
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Intro Section - Core Mission and Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-black text-blue-600 mb-2">Who We Are</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ethical Recruitment, Unmatched Quality
            </p>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              We stand for transparent practices, expert matchmaking, and a massive reach spanning pan-India and international recruitment hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ethical Practices</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Transparency and fairness define our operations. We ensure legal safety, ethical candidate onboarding, and compliance with local and foreign hiring regulations.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Industry Expertise</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Specialized placement across Healthcare, IT, Retail, Construction, and Engineering. Our experienced recruiters thoroughly screen and verify candidates.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Pan-India & Abroad</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Placing talented Indians in major cities nationwide and overseas careers in the Gulf, Europe, and Southeast Asia. We bridge borders seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Jobs Section */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-black text-blue-600 mb-2">Latest Openings</h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Careers</p>
            </div>
            <Link 
              href="/jobs" 
              className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-sm font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All Openings
              <ArrowRight size={16} />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
              <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Active Listings Today</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Our team is currently finalizing fresh recruitment requests. Sign up to get notified as soon as positions matching your skills open!
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/10"
              >
                Register Candidate Profile
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job: any) => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase">
                        {job.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase ${
                        job.is_abroad ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {job.is_abroad ? '✈️ Job Abroad' : '📍 India'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mb-4">
                      {job.employers?.company_name || 'Sidra Client'} &bull; {job.location}
                    </p>
                    
                    <p className="text-sm text-slate-600 line-clamp-2 mb-6">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
                      {job.employment_type}
                    </span>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View Details
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Dual CTA Section - Apply vs Hire */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Candidates Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-blue-900/10 group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                    <Users size={24} className="text-blue-200" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3">Looking for a Career?</h3>
                  <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                    Explore high-quality healthcare, technical, and engineering roles. Apply with 1 click or contact our recruiters to find overseas opportunities.
                  </p>
                </div>
                <div>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 active:scale-95 text-blue-900 font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    Browse Jobs Board
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Employers Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-slate-950/15 group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                    <ShieldCheck size={24} className="text-amber-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3">Need to Hire Talent?</h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                    Submit your placement requirements offline. We supply verified, compliant workforce solutions across medical, hospitality, and IT sectors.
                  </p>
                </div>
                <div>
                  <Link
                    href="/employers"
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/10 transition-all duration-300 cursor-pointer"
                  >
                    Submit Requirements
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
