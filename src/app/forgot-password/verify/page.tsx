'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Mail, ArrowRight, ShieldAlert, CheckCircle2, RotateCcw, Clock, ArrowLeft } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const isKm = language === 'km';

  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Timers
  const [cooldown, setCooldown] = useState(60); // 60s resend cooldown
  const [expiryTimer, setExpiryTimer] = useState(600); // 10 minutes (600s) expiry

  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const cdTimer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(cdTimer);
  }, [cooldown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (expiryTimer <= 0) {
      setError(isKm ? 'លេខកូដផ្ទៀងផ្ទាត់បានផុតកំណត់។ សូមស្នើសុំលេខកូដថ្មី (Verification code has expired. Please request a new code.)' : 'Verification code has expired. Please request a new code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/user/forgot-password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success && data.reset_token) {
        sessionStorage.setItem('reset_token', data.reset_token);
        sessionStorage.setItem('reset_email', email.trim());
        setSuccess(isKm ? 'ផ្ទៀងផ្ទាត់លេខកូដជោគជ័យ! កំពុងបញ្ជូន...' : 'Verification successful! Redirecting...');
        setTimeout(() => {
          router.push('/reset-password');
        }, 1000);
      } else {
        const msg = data.detail || (isKm ? 'លេខកូដផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ' : 'Invalid verification code');
        setError(msg);
      }
    } catch (err) {
      setError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ Server' : 'Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const res = await fetch('/api/v1/user/forgot-password/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(data.message || (isKm ? 'លេខកូដថ្មីត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នក!' : 'A new verification code has been sent to your email!'));
        setCooldown(60);
        setExpiryTimer(600); // Reset 10-minute expiry
      } else {
        setError(data.detail || (isKm ? 'បរាជ័យក្នុងការផ្ញើលេខកូដឡើងវិញ' : 'Failed to resend code'));
      }
    } catch (err) {
      setError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ Server' : 'Failed to connect to server.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 text-white">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isKm ? 'ផ្ទៀងផ្ទាត់លេខកូដ ៦ ខ្ទង់' : 'Verify 6-Digit Code'}
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          {isKm ? `លេខកូដផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើទៅកាន់: ${email || 'អ៊ីមែលរបស់អ្នក'}` : `Enter the 6-digit verification code sent to ${email || 'your email'}`}
        </p>
      </div>

      {/* Countdown Timer Badge */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>{isKm ? 'រយៈពេលពលភាពកូដ' : 'Code Expires In'}:</span>
        </div>
        <span className={`font-mono font-bold text-sm ${expiryTimer < 120 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
          {formatTime(expiryTimer)}
        </span>
      </div>

      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed space-y-0.5">
        <div className="font-bold flex items-center gap-1.5 text-amber-800">
          <Mail className="w-3.5 h-3.5 text-amber-600" />
          <span>{isKm ? 'ការរំលឹកពិនិត្យអ៊ីមែល' : 'Email Check Tip'}</span>
        </div>
        <p className="text-[11px] text-amber-800/90">
          {isKm
            ? 'ប្រសិនបើមិនឃើញសារក្នុង Inbox ទេ សូមពិនិត្យមើលក្នុងប្រអប់ Spam / Junk ឬ Promotions Folder នៃ Gmail របស់អ្នក។'
            : 'If not seen in your Primary Inbox, please check your Spam, Junk, or Promotions folder.'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4 text-xs">
        {!initialEmail && (
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              {isKm ? 'អាសយដ្ឋានអ៊ីមែល' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@domain.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-slate-700 font-bold mb-1.5 text-center">
            {isKm ? 'លេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ (OTP Code)' : '6-Digit Verification Code'}
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full text-center tracking-widest text-2xl font-mono py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-blue-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || expiryTimer <= 0}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span>{isKm ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Verifying Code...'}</span>
          ) : (
            <>
              <span>{isKm ? 'ផ្ទៀងផ្ទាត់លេខកូដ (Verify Code)' : 'Verify Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <Link href="/forgot-password" className="text-slate-500 font-semibold hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isKm ? 'ប្តូរអ៊ីមែល' : 'Change Email'}</span>
        </Link>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={cooldown > 0 || resending}
          className="text-blue-600 font-bold hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>
            {resending
              ? (isKm ? 'កំពុងផ្ញើ...' : 'Sending...')
              : cooldown > 0
              ? (isKm ? `ផ្ញើម្ដងទៀត (${cooldown}s)` : `Resend Code (${cooldown}s)`)
              : (isKm ? 'ផ្ញើលេខកូដឡើងវិញ (Resend Code)' : 'Resend Code')}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <Suspense fallback={
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center text-xs text-slate-500">
            Loading verification page...
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
