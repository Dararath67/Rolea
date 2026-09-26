'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  X,
  Sparkles,
  Zap
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'user' | 'reseller'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resellerSubmitted, setResellerSubmitted] = useState(false);
  const [submittedUser, setSubmittedUser] = useState<any | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlRef = new URLSearchParams(window.location.search).get('ref');
      const storedRef = localStorage.getItem('rolea_ref_code');
      if (urlRef) {
        setReferralCode(urlRef.toUpperCase());
      } else if (storedRef) {
        setReferralCode(storedRef.toUpperCase());
      }
    }
  }, []);

  // Real-time password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200', text: 'text-slate-400' };
    
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 8) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[A-Z]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 24;

    score = Math.min(score, 99);

    if (score < 40) {
      return { 
        score, 
        label: isKm ? 'ខ្សោយ (Weak)' : 'Weak', 
        color: 'bg-red-500', 
        text: 'text-red-600',
        badge: 'bg-red-50 text-red-700 border-red-200'
      };
    } else if (score < 75) {
      return { 
        score, 
        label: isKm ? 'មធ្យម (Medium)' : 'Medium', 
        color: 'bg-amber-500', 
        text: 'text-amber-600',
        badge: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    } else {
      return { 
        score, 
        label: isKm ? 'រឹងមាំ ៩៩% (99% Secure)' : '99% Secure', 
        color: 'bg-emerald-500', 
        text: 'text-emerald-600',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
  }, [password, isKm]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(isKm ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role,
          referral_code: referralCode.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.status === 'pending_approval' || role === 'reseller') {
          setSubmittedUser(data.user || { username, email, phone });
          setResellerSubmitted(true);
        } else {
          localStorage.setItem('rolea_token', data.token);
          localStorage.setItem('rolea_user', JSON.stringify(data.user));
          router.push('/dashboard');
        }
      } else {
        setError(data.detail || (isKm ? 'ការចុះឈ្មោះមិនបានជោគជ័យ' : 'Registration failed'));
      }
    } catch (err) {
      setError(isKm ? 'បរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ Server' : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-10 flex flex-col justify-center">
        {/* Top Security Pill */}
        <div className="mb-4 flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mx-auto shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isKm ? 'ប្រព័ន្ធការពារសុវត្ថិភាព ៩៩% (PBKDF2 SHA-256)' : '99% High Security: Salted PBKDF2 Password Protection'}</span>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          {resellerSubmitted ? (
            /* Reseller Pending Confirmation Screen */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h1 className="text-xl font-black text-slate-900">
                  {isKm ? 'ពាក្យស្នើសុំត្រូវបានដាក់ជូន!' : 'Application Submitted!'}
                </h1>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {isKm
                    ? 'គណនីដៃគូលក់បន្ត (Reseller) របស់អ្នកត្រូវបានបញ្ជូនទៅ Admin ដើម្បីពិនិត្យ និងអនុម័ត។'
                    : 'Your Reseller application has been submitted and is pending Admin review and approval.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isKm ? 'ឈ្មោះគណនី:' : 'Username:'}</span>
                  <span className="font-mono font-bold text-slate-900">{submittedUser?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isKm ? 'អ៊ីមែល:' : 'Email:'}</span>
                  <span className="text-slate-900">{submittedUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isKm ? 'ស្ថានភាព:' : 'Status:'}</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold uppercase text-[10px]">
                    {isKm ? 'រង់ចាំ Admin អនុម័ត' : 'Pending Approval'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 text-left space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isKm ? 'ដំណាក់កាលបន្ទាប់' : 'Next Steps'}</span>
                </div>
                <p className="text-slate-600 leading-normal">
                  {isKm
                    ? 'ក្រុមការងារ Admin នឹងពិនិត្យពាក្យស្នើសុំរបស់អ្នក។ បន្ទាប់ពីការអនុម័តរួច អ្នកអាចចូលប្រើ Reseller B2B Hub និង API បានភ្លាមៗ។'
                    : 'Our admin team will review your application. Once approved, you will have immediate access to wholesale pricing and API keys.'}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>{isKm ? 'ទៅកាន់ទំព័រចូលគណនី' : 'Go to Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors"
                >
                  <span>{isKm ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Standard Registration Form */
            <>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 text-white">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {isKm ? 'បង្កើតគណនីថ្មី' : 'Create an Account'}
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {isKm ? 'សុវត្ថិភាពខ្ពស់ ៩៩% សម្រាប់ Gamer & Reseller' : 'High-security registration for Gamers & Resellers'}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold space-y-1">
                  <div className="flex items-center gap-1.5 text-red-700 font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{isKm ? 'ការជូនដំណឹង' : 'Notice'}</span>
                  </div>
                  <p className="leading-relaxed pl-5">{error}</p>
                </div>
              )}

              {/* Account Type Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2.5 rounded-xl transition-all ${
                    role === 'user'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isKm ? 'អ្នកប្រើទូទៅ (Gamer)' : 'Normal Gamer'}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('reseller')}
                  className={`py-2.5 rounded-xl transition-all ${
                    role === 'reseller'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isKm ? 'ដៃគូលក់បន្ត (Reseller)' : 'Reseller (B2B API)'}
                </button>
              </div>

              {/* Reseller Info Badge */}
              {role === 'reseller' && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-purple-800">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isKm ? 'តម្រូវឱ្យ Admin អនុម័ត' : 'Admin Approval Required'}</span>
                  </div>
                  <p className="text-slate-600">
                    {isKm
                      ? 'គណនីដៃគូលក់បន្តនឹងត្រូវបញ្ជូនទៅកាន់ Admin ដើម្បីពិនិត្យ និងអនុម័ត មុនពេលអាចចូលប្រើប្រាស់បាន។'
                      : 'Reseller accounts receive wholesale discounts & API access, and are reviewed by Admin before activation.'}
                  </p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                {/* Username */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {isKm ? 'ឈ្មោះគណនី (Username)' : 'Username'}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={role === 'reseller' ? 'e.g. rotha_store' : 'e.g. cambodia_gamer'}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {isKm ? 'អ៊ីមែល (Email Address)' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {isKm ? 'លេខទូរស័ព្ទ (Phone Number - ស្រេចចិត្ត)' : 'Phone Number (Optional)'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08X-XXX-XXX"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Referral Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 font-bold">
                      {isKm ? 'កូដណែនាំ (Referral Code - ស្រេចចិត្ត)' : 'Referral Code (Optional)'}
                    </label>
                    {referralCode && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {isKm ? 'បានស្វែងរកកូដ' : 'Code Applied'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="ឧទាហរណ៍: RATHAD16"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Password with Strength Meter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 font-bold">
                      {isKm ? 'ពាក្យសម្ងាត់ (Password)' : 'Password'}
                    </label>
                    {password && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${passwordStrength.badge}`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
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

                  {/* Real-Time Password Strength Bar */}
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>{isKm ? 'កម្រិតសុវត្ថិភាព' : 'Security Strength'}: {passwordStrength.score}%</span>
                        <span>{password.length >= 8 ? '8+ chars' : 'Min 6 chars'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                    role === 'reseller'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{role === 'reseller' ? (isKm ? 'កំពុងបញ្ជូនពាក្យស្នើសុំ...' : 'Submitting Application...') : (isKm ? 'កំពុងបង្កើតគណនី...' : 'Creating Account...')}</span>
                    </>
                  ) : role === 'reseller' ? (
                    isKm ? 'ដាក់ពាក្យស្នើសុំជាដៃគូលក់បន្ត (Submit Application)' : 'Submit Reseller Application'
                  ) : (
                    <>
                      <span>{isKm ? 'ចុះឈ្មោះគណនីសុវត្ថិភាព ៩៩%' : 'Create 99% Secure Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
                {isKm ? 'មានគណនីរួចហើយ?' : 'Already have an account?'}{' '}
                <Link href="/login" className="text-blue-600 font-bold hover:underline ml-1">
                  {isKm ? 'ចូលគណនី (Sign in)' : 'Sign in'}
                </Link>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
                <div className="text-left leading-tight">
                  <div className="font-bold text-slate-900">{isKm ? 'ចង់ក្លាយជា Promoter?' : 'Want to become a Promoter?'}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{isKm ? 'ណែនាំមិត្តភក្តិទទួលបានកម្រៃជើងសារ' : 'Earn commissions by referring gamers'}</div>
                </div>
                <Link href="/promoter" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] transition-colors whitespace-nowrap">
                  {isKm ? 'ស្នើសុំ Promoter' : 'Apply Now'}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
