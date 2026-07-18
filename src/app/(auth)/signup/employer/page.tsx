'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Building2, User, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';
import { sendSignupOTP, verifyOTP } from '@/app/auth/actions';

export default function EmployerSignupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !companyName || !contactName) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    startTransition(async () => {
      const res = await sendSignupOTP('employer', {
        email,
        phone,
        companyName,
        contactName,
      });
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: res.message || 'OTP sent successfully!' });
        setStep('otp');
      }
    });
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!otp || otp.length < 6) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }

    startTransition(async () => {
      const res = await verifyOTP({ email, token: otp, role: 'employer' });
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res.success && res.redirectUrl) {
        setMessage({ type: 'success', text: 'Employer account registered! Redirecting...' });
        router.push(res.redirectUrl);
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-2xl p-8 relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-16 mb-2">
            <Image
              src="/logo.jpg"
              alt="Sidra Talent Bridge Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight text-center">
            Employer Registration
          </h1>
          <p className="text-sm text-slate-500 font-medium text-center mt-1">
            Partner with Sidra Talent Bridge to find quality talent.
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm mb-6 font-medium border ${
              message.type === 'error'
                ? 'bg-red-50 border-red-200/50 text-red-700'
                : 'bg-emerald-50 border-emerald-200/50 text-emerald-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Step 1: Employer Details Form */}
        {step === 'details' && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Building2 size={18} />
                </span>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ACME Corp"
                  required
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Jane Smith (HR)"
                  required
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Work Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  required
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  Register Company with OTP
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 'otp' && (
          <div>
            <div className="text-center mb-6">
              <p className="text-sm text-slate-600">
                We sent a 6-digit verification code to{' '}
                <span className="font-semibold text-slate-800">{email}</span>.
              </p>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs font-semibold text-blue-600 hover:underline mt-1.5"
              >
                Change Registration Details
              </button>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Verification Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <KeyRound size={18} />
                  </span>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    required
                    className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium tracking-[0.25em] text-center text-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  'Verify & Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
              <span>Didn't receive the email? Check your spam folder.</span>
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={isPending}
                className="font-semibold text-blue-600 hover:underline disabled:opacity-50"
              >
                Resend verification code
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200/60 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </main>
  );
}
