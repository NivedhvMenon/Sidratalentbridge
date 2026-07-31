'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ShieldCheck, KeyRound, ArrowRight, User, Building2, RefreshCw } from 'lucide-react';
import { sendLoginOTP, verifyOTP, loginWithPassword } from '@/app/auth/actions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '';

  const [role, setRole] = useState<'candidate' | 'employer' | 'admin'>('candidate');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    startTransition(async () => {
      const res = await loginWithPassword({ email, password, role });
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res.success && res.redirectUrl) {
        setMessage({ type: 'success', text: 'Successfully authenticated! Redirecting...' });
        router.push(redirectedFrom || res.redirectUrl);
      }
    });
  };

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    startTransition(async () => {
      const res = await sendLoginOTP({ email, role });
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
      const res = await verifyOTP({ email, token: otp, role });
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res.success && res.redirectUrl) {
        setMessage({ type: 'success', text: 'Successfully authenticated! Redirecting...' });
        router.push(redirectedFrom || res.redirectUrl);
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-2xl p-8 relative">
      {/* Logo/Brand Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-44 h-32 mb-2">
          <Image
            src="/logo.png"
            alt="Sidra Talent Bridge Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sidra Talent Bridge</h1>
        <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">
          Bridging Talent. Building Success.
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

      {/* Role Tabs */}
      <div className="flex bg-slate-100/80 p-1 rounded-xl mb-4 border border-slate-200/40">
        <button
          type="button"
          onClick={() => {
            setRole('candidate');
            setMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            role === 'candidate'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={14} />
          Candidate
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('employer');
            setMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            role === 'employer'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 size={14} />
          Employer
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('admin');
            setMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            role === 'admin'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={14} />
          Admin
        </button>
      </div>

      {/* Login Method Toggle */}
      <div className="flex bg-slate-100/40 p-1 rounded-xl mb-6 border border-slate-200/20">
        <button
          type="button"
          onClick={() => {
            setLoginMethod('password');
            setMessage(null);
          }}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 ${
            loginMethod === 'password'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Password Login
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMethod('otp');
            setMessage(null);
          }}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 ${
            loginMethod === 'otp'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          OTP Code Login
        </button>
      </div>

      {/* PASSWORD LOGIN FORM */}
      {loginMethod === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address
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
                placeholder="name@example.com"
                required
                className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <KeyRound size={18} />
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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
                Log In
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {/* OTP LOGIN FLOW */}
      {loginMethod === 'otp' && (
        <div>
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label htmlFor="email-otp" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    id="email-otp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
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
                    Send OTP Code
                    <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <div>
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600">
                  We sent a 6-digit one-time passcode to{' '}
                  <span className="font-semibold text-slate-800">{email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-xs font-semibold text-blue-600 hover:underline mt-1.5"
                >
                  Change Email Address
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
                    'Verify & Log In'
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
        </div>
      )}

      {/* Signup Footer Navigation Links */}
      <div className="mt-8 text-center text-sm text-slate-500">
        {role === 'candidate' && (
          <p>
            New here?{' '}
            <Link href="/signup/candidate" className="font-semibold text-blue-600 hover:underline">
              Create a candidate account
            </Link>
          </p>
        )}
        {role === 'employer' && (
          <p>
            Looking to hire?{' '}
            <Link href="/signup/employer" className="font-semibold text-blue-600 hover:underline">
              Register your company
            </Link>
          </p>
        )}
        {role === 'admin' && (
          <p className="text-xs">
            Admin authorization is restricted to registered system administrators.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl -z-10" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-2xl p-8 flex flex-col items-center justify-center">
          <RefreshCw className="animate-spin text-blue-600 mb-3" size={32} />
          <p className="text-slate-500 font-semibold text-sm">Loading security gate...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
