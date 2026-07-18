import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { User, Briefcase, ChevronRight, LogOut, Globe } from 'lucide-react';
import { logOut } from '@/app/auth/actions';

export default async function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch candidate profile info
  const { data: candidate } = await supabase
    .from('candidates')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  const candidateName = candidate?.full_name || 'Candidate';
  const candidateEmail = candidate?.email || user.email || '';

  async function handleLogout() {
    'use server';
    await logOut();
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shadow-md">
        <div className="flex flex-col">
          {/* Header Branding */}
          <div className="px-6 py-6 border-b border-slate-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              S
            </div>
            <div>
              <span className="font-extrabold text-[14px] tracking-tight text-white block">
                Sidra Talent Bridge
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Candidate Panel
              </span>
            </div>
          </div>

          {/* User Brief Card */}
          <div className="px-6 py-5 border-b border-slate-800/40 bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                {candidateName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[13px] font-bold text-white truncate">{candidateName}</span>
                <span className="text-[10px] text-slate-400 truncate">{candidateEmail}</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            <Link
              href="/dashboard/candidate/profile"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <User size={15} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                Profile Completion
              </div>
              <ChevronRight size={12} className="text-slate-500 group-hover:text-slate-300" />
            </Link>

            <Link
              href="/dashboard/candidate/applications"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase size={15} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                My Applications
              </div>
              <ChevronRight size={12} className="text-slate-500 group-hover:text-slate-300" />
            </Link>
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-slate-800/50 space-y-1 bg-slate-950/10">
          <Link
            href="/jobs"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors group"
          >
            <Globe size={14} className="text-slate-500 group-hover:text-blue-400" />
            View Jobs Board
          </Link>

          <form action={handleLogout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut size={14} />
              Logout Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        <div className="p-6 md:p-10 max-w-5xl w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
