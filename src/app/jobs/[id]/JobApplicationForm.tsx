'use client';

import React, { useState } from 'react';
import { submitApplication } from '@/app/jobs/actions';
import { UserCheck, FileText, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  isAuthenticated: boolean;
  candidateProfile: any;
}

export default function JobApplicationForm({
  jobId,
  jobTitle,
  isAuthenticated,
  candidateProfile,
}: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: candidateProfile?.full_name || '',
    email: candidateProfile?.email || '',
    phone: candidateProfile?.phone || '',
    resumeUrl: candidateProfile?.resume_file_url || '',
    experienceSummary: candidateProfile?.experience_summary || '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await submitApplication(jobId, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        resumeUrl: formData.resumeUrl,
        experienceSummary: formData.experienceSummary,
      });

      if (result.error) {
        setStatus({ type: 'error', message: result.error });
      } else {
        setStatus({ type: 'success', message: result.message || 'Application submitted!' });
        if (!isAuthenticated) {
          // Clear form for guests on success
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            resumeUrl: '',
            experienceSummary: '',
          });
        }
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">Apply for this Role</h3>
          <p className="text-xs text-slate-500">
            {isAuthenticated ? 'Authenticated Application' : 'Apply as Guest / Candidate'}
          </p>
        </div>
      </div>

      {status.type && (
        <div
          className={`p-4 rounded-xl text-sm mb-6 flex items-start gap-2.5 ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
              : 'bg-rose-50 text-rose-800 border border-rose-100'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {status.type === 'success' && isAuthenticated ? (
        <div className="text-center py-6">
          <p className="text-slate-600 text-sm font-semibold mb-4">
            You have successfully applied for the <span className="font-bold text-slate-900">{jobTitle}</span> position.
          </p>
          <Link
            href="/dashboard/candidate"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all"
          >
            Go to Candidate Dashboard
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isAuthenticated ? (
            /* Authenticated Form Fields */
            <div className="space-y-4">
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 space-y-2">
                <div className="flex justify-between items-center text-xs text-blue-800 font-bold uppercase tracking-wider">
                  <span>Profile Loaded</span>
                  <span className="flex items-center gap-0.5 text-blue-600">
                    <UserCheck size={12} />
                    Verified
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  <p>{candidateProfile?.full_name}</p>
                  <p className="text-xs text-slate-500 font-normal">{candidateProfile?.email}</p>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Confirm Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="resumeUrl" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Resume URL (Google Drive, Dropbox, etc.) *
                </label>
                <input
                  id="resumeUrl"
                  type="url"
                  required
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/.../your-resume.pdf"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Ensure the link is viewable by anyone with the link.
                </p>
              </div>

              <div>
                <label htmlFor="experienceSummary" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Experience Summary
                </label>
                <textarea
                  id="experienceSummary"
                  rows={3}
                  value={formData.experienceSummary}
                  onChange={(e) => setFormData({ ...formData, experienceSummary: e.target.value })}
                  placeholder="e.g. 5+ years of experience as ICU Nurse in leading hospitals."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-700 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 disabled:bg-slate-400 active:scale-95 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-900/10"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit 1-Click Application
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Unauthenticated / Guest Form Fields */
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543215"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="resumeUrl" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Resume Link (Google Drive, Dropbox, etc.) *
                </label>
                <input
                  id="resumeUrl"
                  type="url"
                  required
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/.../your-resume.pdf"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="experienceSummary" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Brief Professional Summary
                </label>
                <textarea
                  id="experienceSummary"
                  rows={3}
                  value={formData.experienceSummary}
                  onChange={(e) => setFormData({ ...formData, experienceSummary: e.target.value })}
                  placeholder="Summarize your key skills, years of experience, and past companies."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 active:scale-95 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-900/10"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Apply as Guest
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 font-medium pt-2">
                Or,{' '}
                <Link href="/signup" className="text-blue-600 hover:underline font-bold">
                  create a candidate profile
                </Link>{' '}
                to enable 1-click apply.
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
