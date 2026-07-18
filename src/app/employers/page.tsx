'use client';

import React, { useState } from 'react';
import { submitEmployerRequirement } from '@/app/jobs/actions';
import { Building2, Sparkles, CheckCircle2, ChevronRight, Briefcase, FileText, Send, Loader2 } from 'lucide-react';

export default function EmployersPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    roleNeeded: '',
    description: '',
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await submitEmployerRequirement(formData);
      if (result.error) {
        setStatus({ type: 'error', message: result.error });
      } else {
        setStatus({ type: 'success', message: result.message || 'Submitted successfully!' });
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          roleNeeded: '',
          description: '',
        });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      title: "Permanent Recruitment",
      desc: "Full-time domestic placements with an extensive database and deep screening across medical, tech, and retail sectors."
    },
    {
      title: "Overseas Placements",
      desc: "Comprehensive campaigns, compliance clearance, trade testing, and visa processing for international employment."
    },
    {
      title: "Customized Staffing",
      desc: "Contract-to-hire and temporary staffing models to scale your workforce up or down dynamically."
    }
  ];

  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Information Column (Left) */}
          <div className="lg:col-span-7 space-y-10 text-center lg:text-left">
            <div>
              <span className="text-xs uppercase tracking-widest font-black text-blue-600 mb-2 block">For Employers</span>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                Source Top Talent. Accelerate Growth.
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Partner with Sidra Talent Bridge to fulfill your critical hiring needs. We combine ethical values with advanced candidate assessment methodologies to supply teams that perform from Day 1.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {services.map((svc, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <CheckCircle2 size={16} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-2">{svc.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{svc.desc}</p>
                </div>
              ))}
            </div>

            {/* Ethical Guarantee Box */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-4 text-left">
              <Sparkles className="text-blue-600 shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-extrabold text-blue-900 text-sm mb-1">Our Compliance Promise</h4>
                <p className="text-blue-800 text-xs leading-relaxed">
                  We guarantee full adherence to Indian immigration laws, international labor rules, and strict anti-recruitment-fee protocols. Your brand reputation is fully secure with us.
                </p>
              </div>
            </div>
          </div>

          {/* Form Column (Right) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-lg">Submit Requirement</h2>
                  <p className="text-xs text-slate-500">Provide details and we'll contact you</p>
                </div>
              </div>

              {status.type && (
                <div className={`p-4 rounded-xl text-sm mb-6 ${
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyName" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Company Name *
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Sidra Health"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactName" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Contact Person *
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="e.g. Renjit Nair"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Work Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
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
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="roleNeeded" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Position / Role Needed *
                  </label>
                  <input
                    id="roleNeeded"
                    type="text"
                    required
                    value={formData.roleNeeded}
                    onChange={(e) => setFormData({ ...formData, roleNeeded: e.target.value })}
                    placeholder="e.g. Registered Nurse, Senior Developer"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Job Details & Requirements *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe numbers required, key skills, experience level and timeline."
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
                      Submitting Requirement...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Form
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
