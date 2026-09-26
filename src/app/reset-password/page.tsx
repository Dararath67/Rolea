'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, ArrowRight, Check, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('reset_token');
    if (!token) {
      setError(isKm ? 'មិនមានសិទ្ធិចូលប្រើប្រាស់ទំព័រនេះទេ។ សូមផ្ទៀងផ្ទាត់លេខកូដជាមុនសិន (Unauthorized reset session. Please verify code first.)' : 'Unauthorized reset session. Please request a verification code first.');
      setTimeout(() => {
        router.push('/forgot-password');
      }, 2000);
    } else {
      setResetToken(token);
    }
  }, [router, isKm]);

  // Password Strength Calculation
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 20;
    if (pwd.length >= 8) score += 25;
    if (/\d/.test(pwd)) score += 20;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 20;
    score = Math.min(score, 100);

    if (score < 40) return { score, label: isKm ? 'ខ្សោយ (Low)' : 'Low', color: 'bg-red-500' };
    if (score < 70) return { score, label: isKm ? 'មធ្យម (Medium)' : 'Medium', color: 'bg-amber-500' };
    return { score, label: isKm ? 'រឹងមាំ ៩៩% (High 99%)' : 'High 99%', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(newPassword);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetToken) {
      setError(isKm ? 'មិនមានសិទ្ធិចូលប្រើប្រាស់ទំព័រនេះទេ' : 'Invalid reset session.');
      return;
    }

    if (newPassword.length < 6) {
      setError(isKm ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ' : 'Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(isKm ? 'ពាក្យសម្ងាត់ និងការផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ' : 'Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/user/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.removeItem('reset_token');
        sessionStorage.removeItem('reset_email');
        setSuccess(isKm ? 'ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ! កំពុងបញ្ជូនទៅកាន់ទំព័រចូលគណនី...' : 'Password reset successfully. Please login with your new password.');
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 1500);
      } else {
        setError(data.detail || (isKm ? 'បរាជ័យក្នុងការប្តូរពាក្យសម្ងាត់' : 'Failed to reset password'));
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
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isKm ? 'កំណត់ពាក្យសម្ងាត់ថ្មី' : 'Reset Password'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isKm ? 'សូមបញ្ចូលពាក្យសម្ងាត់ថ្មីរបស់អ្នក (យ៉ាងតិច ៦ តួអក្សរ)' : 'Enter your new password to secure your account'}
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

          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                {isKm ? 'ពាក្យសម្ងាត់ថ្មី (New Password)' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isKm ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៦ តួ)' : 'Enter new password'}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>{isKm ? 'កម្រិតសុវត្ថិភាព' : 'Security Level'}:</span>
                    <span className="font-bold text-slate-700">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                {isKm ? 'ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី (Confirm Password)' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isKm ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មីម្ដងទៀត' : 'Re-enter new password'}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {isKm ? 'ពាក្យសម្ងាត់ទាំងពីរមិនផ្ទៀងផ្ទាត់គ្នាទេ' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>{isKm ? 'កំពុងរក្សាទុកពាក្យសម្ងាត់...' : 'Resetting Password...'}</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isKm ? 'រក្សាទុកពាក្យសម្ងាត់ថ្មី (Reset Password)' : 'Reset Password'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
