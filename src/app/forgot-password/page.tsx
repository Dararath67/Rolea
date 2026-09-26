'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { KeyRound, Mail, ArrowRight, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanInput = email.trim();
    if (!cleanInput) {
      setError(isKm ? 'សូមបញ្ចូលអ៊ីមែល ឬ ឈ្មោះគណនីរបស់អ្នក' : 'Please enter your email or username');
      return;
    }

    if (cleanInput.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanInput)) {
        setError(isKm ? 'ទម្រង់អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ! (ឧទាហរណ៍: name@gmail.com)' : 'Invalid email format. (e.g. name@gmail.com)');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/user/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanInput })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(data.message || (isKm ? 'លេខកូដផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើ!' : 'Verification code sent!'));
        setTimeout(() => {
          const targetEmail = data.email || cleanInput;
          router.push(`/forgot-password/verify?email=${encodeURIComponent(targetEmail)}`);
        }, 1200);
      } else {
        setError(data.detail || (isKm ? 'មិនរកឃើញគណនី ឬ អ៊ីមែលនេះក្នុងប្រព័ន្ធទេ!' : 'Account or email not found in our database'));
      }
    } catch (err) {
      setError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ Server' : 'Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 text-white">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isKm ? 'ភ្លេចពាក្យសម្ងាត់?' : 'Forgot Password?'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isKm ? 'បញ្ចូលអ៊ីមែលរបស់អ្នកដើម្បីទទួលលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់' : 'Enter your registered email to receive a 6-digit verification code'}
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

          <form onSubmit={handleSendCode} className="space-y-4 text-xs">
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
                  placeholder={isKm ? 'បញ្ចូលអ៊ីមែលរបស់អ្នក' : 'your-email@domain.com'}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{isKm ? 'កំពុងផ្ញើលេខកូដ...' : 'Sending Verification Code...'}</span>
              ) : (
                <>
                  <span>{isKm ? 'ផ្ញើលេខកូដផ្ទៀងផ្ទាត់ (Send Verification Code)' : 'Send Verification Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            <Link href="/login" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isKm ? 'ត្រឡប់ទៅទំព័រចូលគណនី (Back to Login)' : 'Back to Login'}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
