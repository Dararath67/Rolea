'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Lock, User as UserIcon, Eye, EyeOff, ShieldAlert, Zap, CheckCircle2, ArrowRight, KeyRound, Fingerprint, Activity, X, Mail, RotateCcw, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = { 
        username_or_email: username.trim(), 
        password 
      };
      if (requires2FA && twoFactorCode) {
        payload.two_factor_code = twoFactorCode.trim();
      }

      const res = await fetch('/api/v1/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.requires_2fa) {
        setRequires2FA(true);
        setError(data.message || (isKm ? 'សូមបញ្ចូលលេខកូដ 2FA 6 ខ្ទង់' : 'Please enter your 6-digit 2FA code'));
        setLoading(false);
        return;
      }

      if (data.success && data.token) {
        localStorage.setItem('rolea_token', data.token);
        localStorage.setItem('rolea_user', JSON.stringify(data.user));
        
        if (data.user.role === 'admin' || data.user.role === 'super_admin') {
          router.push('/admin');
        } else if (data.user.role === 'reseller') {
          router.push('/reseller');
        } else {
          router.push('/dashboard');
        }
      } else {
        const errorDetail = data.detail || (isKm ? 'ឈ្មោះគណនី ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ' : 'Invalid credentials');
        setError(errorDetail);
        
        if (errorDetail.includes('attempts remaining')) {
          const match = errorDetail.match(/(\d+)\s+attempts remaining/);
          if (match) setAttemptsRemaining(parseInt(match[1]));
        }
      }
    } catch (err) {
      setError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ Server' : 'Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/v1/user/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_or_username: forgotIdentifier.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotMaskedEmail(data.masked_email || '');
        if (data.debug_code) {
          setForgotOtpCode(data.debug_code);
        }
        setForgotStep(2);
        setForgotSuccess(data.message || (isKm ? 'លេខកូដផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើ!' : 'Verification code sent!'));
      } else {
        setForgotError(data.detail || (isKm ? 'បរាជ័យក្នុងការស្នើសុំលេខកូដ' : 'Failed to request reset code'));
      }
    } catch (err) {
      setForgotError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ Server' : 'Failed to connect to server.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/v1/user/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_username: forgotIdentifier.trim(),
          code: forgotOtpCode.trim(),
          new_password: forgotNewPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotSuccess(data.message || (isKm ? 'ផ្លាស់ប្តូរពាក្យសម្ងាត់បានជោគជ័យ!' : 'Password reset successfully!'));
        setTimeout(() => {
          setUsername(forgotIdentifier.trim());
          setPassword(forgotNewPassword);
          setForgotModalOpen(false);
          setForgotStep(1);
          setForgotIdentifier('');
          setForgotOtpCode('');
          setForgotNewPassword('');
        }, 1200);
      } else {
        setForgotError(data.detail || (isKm ? 'បរាជ័យក្នុងការប្តូរពាក្យសម្ងាត់' : 'Failed to reset password'));
      }
    } catch (err) {
      setForgotError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ Server' : 'Failed to connect to server.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 text-white">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isKm ? 'ចូលប្រើប្រាស់គណនី' : 'Sign In to Your Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isKm ? 'ប្រព័ន្ធការពារសុវត្ថិភាព និងទិន្នន័យផ្ទាល់ខ្លួន' : 'Protected by enterprise security & instant verification'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold space-y-1">
              <div className="flex items-center gap-1.5 text-red-700 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{isKm ? 'ការជូនដំណឹងសុវត្ថិភាព' : 'Security Notice'}</span>
              </div>
              <p className="leading-relaxed pl-5">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                {isKm ? 'ឈ្មោះគណនី ឬ អ៊ីមែល' : 'Username or Email'}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isKm ? 'បញ្ចូលឈ្មោះគណនី ឬ អ៊ីមែល' : 'Enter username or email'}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 font-bold">
                  {isKm ? 'ពាក្យសម្ងាត់' : 'Password'}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  {isKm ? 'ភ្លេចពាក្យសម្ងាត់?' : 'Forgot Password?'}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {requires2FA && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 animate-fadeIn">
                <label className="block text-blue-900 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{isKm ? 'លេខកូដ 2FA 6 ខ្ទង់ (Google Authenticator)' : '6-Digit 2FA Code'}</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-white border border-blue-300 rounded-xl font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-[11px] text-blue-700">
                  {isKm ? 'បញ្ចូលលេខកូដពីកម្មវិធី Authenticator ឬលេខកូដសង្គ្រោះ' : 'Enter 6-digit code from Google Authenticator or a recovery code'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{isKm ? 'កំពុងផ្ទៀងផ្ទាត់សុវត្ថិភាព...' : 'Authenticating...'}</span>
              ) : (
                <>
                  <span>{isKm ? 'ចូលគណនីសុវត្ថិភាព (Sign In)' : 'Secure Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            {isKm ? 'មិនទាន់មានគណនី?' : "Don't have an account?"}{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline ml-1">
              {isKm ? 'ចុះឈ្មោះបង្កើតគណនីថ្មី' : 'Register now'}
            </Link>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-scaleIn">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {isKm ? 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ' : 'Reset Password'}
                </h2>
                <p className="text-xs text-slate-500">
                  {forgotStep === 1
                    ? (isKm ? 'ជំហានទី ១: ផ្ញើលេខកូដផ្ទៀងផ្ទាត់ទៅអ៊ីមែល' : 'Step 1: Send verification code to email')
                    : (isKm ? 'ជំហានទី ២: ផ្ទៀងផ្ទាត់កូដ និងកំណត់ពាក្យសម្ងាត់ថ្មី' : 'Step 2: Verify OTP & set new password')}
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {isKm ? 'ឈ្មោះគណនី ឬ អ៊ីមែលរបស់អ្នក' : 'Your Username or Email'}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder={isKm ? 'បញ្ចូលឈ្មោះគណនី ឬ អ៊ីមែល' : 'Enter username or email'}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <span>{isKm ? 'កំពុងផ្ញើលេខកូដ...' : 'Sending Verification Code...'}</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>{isKm ? 'ផ្ញើលេខកូដផ្ទៀងផ្ទាត់ (Send Code)' : 'Send Verification Code'}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                {forgotMaskedEmail && (
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{isKm ? `លេខកូដត្រូវបានផ្ញើទៅកាន់: ${forgotMaskedEmail}` : `Code sent to: ${forgotMaskedEmail}`}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {isKm ? 'លេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ (Email OTP Code)' : '6-Digit Verification Code'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtpCode}
                    onChange={(e) => setForgotOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {isKm ? 'ពាក្យសម្ងាត់ថ្មី' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={forgotShowPassword ? 'text' : 'password'}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder={isKm ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៦ តួ)' : 'Enter new password (min 6 chars)'}
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setForgotShowPassword(!forgotShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {forgotShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isKm ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <span>{isKm ? 'កំពុងផ្លាស់ប្តូរ...' : 'Resetting Password...'}</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isKm ? 'រក្សាទុកពាក្យសម្ងាត់ថ្មី (Reset)' : 'Save New Password'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

