'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Crown, 
  Share2, 
  Copy, 
  Check, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  Upload,
  X
} from 'lucide-react';

export default function PromoterPortalPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Application Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ABA Bank');
  const [paymentAccount, setPaymentAccount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [reason, setReason] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('ABA Bank');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawQrUrl, setWithdrawQrUrl] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ success?: boolean; text?: string } | null>(null);

  useEffect(() => {
    let loggedUser: any = null;
    try {
      const stored = localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user');
      if (stored) {
        loggedUser = JSON.parse(stored);
        setCurrentUser(loggedUser);
        setFullName(loggedUser.username || '');
        setPhone(loggedUser.phone || '');
        setWithdrawAccount(loggedUser.payment_account || '');
      }
    } catch (e) {}

    if (loggedUser?.id || loggedUser?.username) {
      const uId = loggedUser.id || loggedUser.username;
      fetchPromoterDashboard(uId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPromoterDashboard = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/promoter/dashboard?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        if (data.promoter) {
          setWithdrawAccount(data.promoter.payment_account || '');
          setWithdrawMethod(data.promoter.payment_method || 'ABA Bank');
          if (data.promoter.qr_code_url) {
            setWithdrawQrUrl(data.promoter.qr_code_url);
            setQrCodeUrl(data.promoter.qr_code_url);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load promoter dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !paymentAccount || !reason) {
      setAppError('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់ (Please fill all required fields)');
      return;
    }
    setIsSubmittingApp(true);
    setAppError(null);

    try {
      const payload = {
        user_id: currentUser?.id || currentUser?.username,
        full_name: fullName,
        phone: phone,
        telegram_username: telegramUsername,
        payment_method: paymentMethod,
        payment_account: paymentAccount,
        qr_code_url: qrCodeUrl || undefined,
        reason: reason,
        social_links: socialLinks,
        avatar_url: avatarUrl
      };

      const res = await fetch('/api/v1/promoter/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        fetchPromoterDashboard(currentUser?.id || currentUser?.username);
      } else {
        setAppError(data.detail || 'បរាជ័យក្នុងការដាក់ពាក្យស្នើសុំ (Application failed)');
      }
    } catch (err) {
      setAppError('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធ (Connection error)');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawMsg({ success: false, text: 'ចំនួនទឹកប្រាក់ត្រូវតែច្រើនជាង 0 (Amount must be greater than 0)' });
      return;
    }
    setIsSubmittingWithdraw(true);
    setWithdrawMsg(null);

    try {
      const payload = {
        user_id: currentUser?.id || currentUser?.username,
        amount_usd: amt,
        payment_method: withdrawMethod,
        payment_account: withdrawAccount,
        qr_code_url: withdrawQrUrl || undefined
      };

      const res = await fetch('/api/v1/promoter/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg({ success: true, text: 'សំណើដកប្រាក់ត្រូវបានបញ្ជូនដោយជោគជ័យ! (Withdrawal request submitted successfully!)' });
        setWithdrawAmount('');
        fetchPromoterDashboard(currentUser?.id || currentUser?.username);
      } else {
        setWithdrawMsg({ success: false, text: data.detail || 'បរាជ័យក្នុងការស្នើសុំដកប្រាក់ (Withdrawal request failed)' });
      }
    } catch (err) {
      setWithdrawMsg({ success: false, text: 'មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធ (Connection error)' });
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black mb-2 text-slate-900">សូមចូលប្រើប្រាស់គណនី</h2>
          <p className="text-xs text-slate-500 mb-6">អ្នកត្រូវតែចូលប្រើប្រាស់គណនីដើម្បីដាក់ពាក្យស្នើសុំធ្វើជា Promoter ឬពិនិត្យផ្ទាំងគ្រប់គ្រង Promoter។</p>
          <Link href="/login" className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm">
            ចូលប្រើប្រាស់គណនី
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const app = dashboardData?.application;
  const promoter = dashboardData?.promoter;
  const isApprovedPromoter = promoter && promoter.status === 'approved';
  const isPendingApp = app && app.status === 'pending' && !isApprovedPromoter;
  const isRejectedApp = app && app.status === 'rejected' && !isApprovedPromoter;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>កម្មវិធីដៃគូ Promoter កម្ពុជា</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Promoter Portal & Approval System
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              ណែនាំមិត្តភក្តិ និងអ្នកលេងហ្គេមមកកាន់ RoleaTopup ដើម្បីទទួលបានកម្រៃជើងសាររាល់ការទិញពេញលេញ!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isApprovedPromoter ? (
          /* 1. OFFICIAL PROMOTER DASHBOARD */
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold">សរុបការណែនាំ</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{promoter.total_referrals || 0}</div>
                <p className="text-[11px] text-slate-400 mt-1">អ្នកប្រើប្រាស់ដែលបានណែនាំ</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold">សរុបការបញ្ជាទិញ</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{promoter.total_orders || 0}</div>
                <p className="text-[11px] text-slate-400 mt-1">ការទិញជោគជ័យតាមកូដ</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold">សរុបកម្រៃជើងសារ</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600">${(promoter.total_commission_usd || 0).toFixed(2)}</div>
                <p className="text-[11px] text-slate-400 mt-1">អត្រាកម្រៃ: {promoter.commission_rate}%</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-emerald-800 font-bold">សមតុល្យអាចដកបាន</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700">${(promoter.available_balance_usd || 0).toFixed(2)}</div>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">បានដកសរុប: ${(promoter.withdrawn_amount_usd || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Referral Link & Code Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">តំណភ្ជាប់ណែនាំ និងកូដ Promoter</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                  បានអនុម័ត (APPROVED)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">កូដណែនាំ (Referral Code)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={promoter.referral_code} 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-blue-600 outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(promoter.referral_code, 'code')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'បានចម្លង' : 'ចម្លងកូដ'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">តំណភ្ជាប់ណែនាំ (Referral Link)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={promoter.referral_link} 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 outline-none truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(promoter.referral_link, 'link')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'បានចម្លង' : 'ចម្លង Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Tabs / Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Commission History */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>ប្រវត្តិកម្រៃជើងសារ (Commission History)</span>
                </h3>

                {dashboardData?.commissions?.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    មិនទាន់មានប្រវត្តិកម្រៃជើងសារនៅឡើយទេ។ ចែករំលែកតំណភ្ជាប់របស់អ្នកដើម្បីចាប់ផ្តើមរកចំណូល!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">លេខកូដបញ្ជាទិញ</th>
                          <th className="py-2.5 px-3">អតិថិជន</th>
                          <th className="py-2.5 px-3">ចំនួនទឹកប្រាក់</th>
                          <th className="py-2.5 px-3">កម្រៃជើងសារ</th>
                          <th className="py-2.5 px-3">កាលបរិច្ឆេទ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dashboardData?.commissions?.map((comm: any) => (
                          <tr key={comm.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3 font-mono font-semibold text-slate-900">{comm.order_id}</td>
                            <td className="py-3 px-3">{comm.customer_name}</td>
                            <td className="py-3 px-3 font-semibold">${comm.order_amount_usd.toFixed(2)}</td>
                            <td className="py-3 px-3 font-bold text-emerald-600">+${comm.commission_amount_usd.toFixed(4)}</td>
                            <td className="py-3 px-3 text-slate-400">{comm.created_at.slice(0, 10)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Column: Withdrawal Request & History */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>ស្នើសុំដកប្រាក់ (Withdrawal Request)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">ដកកម្រៃជើងសាររបស់អ្នកចូលទៅកាន់គណនីធនាគារ ABA ឬ Wing</p>

                  <form onSubmit={handleWithdraw} className="space-y-3">
                    {withdrawMsg && (
                      <div className={`p-3 rounded-xl text-xs font-semibold ${withdrawMsg.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {withdrawMsg.text}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">ចំនួនទឹកប្រាក់ដក ($ USD)</label>
                      <input 
                        type="number"
                        step="0.01"
                        max={promoter.available_balance_usd}
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">វិធីសាស្ត្រទូទាត់</label>
                      <select
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                      >
                        <option value="ABA Bank">ABA Bank</option>
                        <option value="Wing Bank">Wing Bank</option>
                        <option value="Acleda Bank">Acleda Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">លេខគណនី / ឈ្មោះគណនី</label>
                      <input 
                        type="text"
                        placeholder="ឧទាហរណ៍: 000 123 456 (RATHA DARARATH)"
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        រូបភាព QR Code សម្រាប់ទទួលប្រាក់ (Payment QR Code - ស្រេចចិត្ត)
                      </label>
                      <div className="space-y-2">
                        {withdrawQrUrl ? (
                          <div className="relative w-28 h-28 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center group mx-auto">
                            <img src={withdrawQrUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setWithdrawQrUrl('')}
                              className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                              title="លុបរូបភាព"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors p-2 text-center">
                            <Upload className="w-4 h-4 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-600">ចុចទីនេះដើម្បីបញ្ចូលរូបភាព QR Code</span>
                            <span className="text-[9px] text-slate-400">PNG, JPG ឬ WEBP</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setWithdrawQrUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingWithdraw || promoter.available_balance_usd <= 0}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      {isSubmittingWithdraw ? 'កំពុងដំណើរការ...' : 'បញ្ជូនសំណើដកប្រាក់'}
                    </button>
                  </form>
                </div>

                {/* Withdrawal History */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-800 mb-3">ប្រវត្តិនៃការដកប្រាក់</h4>
                  {dashboardData?.withdrawals?.length === 0 ? (
                    <p className="text-[11px] text-slate-400">មិនទាន់មានសំណើដកប្រាក់នៅឡើយទេ</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dashboardData?.withdrawals?.map((w: any) => (
                        <div key={w.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                          <div>
                            <div className="font-bold text-slate-900">${w.amount_usd.toFixed(2)}</div>
                            <div className="text-slate-400">{w.payment_method} - {w.requested_at.slice(0, 10)}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            w.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {w.status === 'approved' ? 'ជោគជ័យ' : w.status === 'rejected' ? 'បដិសេធ' : 'រង់ចាំ'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isPendingApp ? (
          /* 2. PENDING APPLICATION STATE */
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-amber-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              ស្ថានភាព: កំពុងរង់ចាំ (PENDING)
            </span>
            <h2 className="text-xl font-black text-slate-900">ពាក្យស្នើសុំរបស់អ្នកកំពុងស្ថិតក្នុងការពិនិត្យ</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              ពាក្យស្នើសុំធ្វើជា Promoter របស់អ្នកត្រូវបានបញ្ជូនទៅកាន់ក្រុម Admin រួចរាល់ហើយ។ អ្នកមិនទាន់មានសិទ្ធិជា Promoter ឬទទួលបានតំណភ្ជាប់ណែនាំនៅឡើយទេ រហូតទាល់តែបានទទួលការអនុម័ត (Approve) ផ្លូវការ។
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-1">
              <div><strong>ឈ្មោះអ្នកស្នើសុំ:</strong> {app.full_name}</div>
              <div><strong>លេខទូរស័ព្ទ:</strong> {app.phone}</div>
              <div><strong>អាខោនទូទាត់:</strong> {app.payment_method} - {app.payment_account}</div>
              <div><strong>កាលបរិច្ឆេទស្នើសុំ:</strong> {app.applied_at.slice(0, 10)}</div>
            </div>
          </div>
        ) : (
          /* 3. APPLICATION FORM (NOT YET APPLIED OR REJECTED) */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span>ពាក្យស្នើសុំធ្វើជា Promoter (Become a Promoter)</span>
              </h2>
              <p className="text-xs text-slate-500">
                សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីដាក់ពាក្យស្នើសុំ។ Admin នឹងពិនិត្យពាក្យស្នើសុំរបស់អ្នកមុននឹងផ្ដល់សិទ្ធិ Promoter ផ្លូវការ។
              </p>
            </div>

            {isRejectedApp && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>ពាក្យស្នើសុំមុននេះត្រូវបានបដិសេធ (REJECTED)</span>
                </div>
                {app?.reject_reason && <div><strong>មូលហេតុ:</strong> {app.reject_reason}</div>}
                <p className="text-[11px] text-rose-600 mt-1">អ្នកអាចកែសម្រួលព័ត៌មាន និងដាក់ពាក្យស្នើសុំឡើងវិញបាន។</p>
              </div>
            )}

            <form onSubmit={handleApplyPromoter} className="space-y-4">
              {appError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {appError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ឈ្មោះពេញ (Full Name) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="ឧទាហរណ៍: រ៉ាថា ដារ៉ារ៉ាត់"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">លេខទូរស័ព្ទ (Phone Number) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="012 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">អាខោន Telegram (Telegram Username)</label>
                  <input 
                    type="text"
                    placeholder="@ratha_rolea"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ធនាគារទទួលប្រាក់ (Payment Method) *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    <option value="ABA Bank">ABA Bank</option>
                    <option value="Wing Bank">Wing Bank</option>
                    <option value="Acleda Bank">Acleda Bank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">លេខគណនី និងឈ្មោះគណនីធនាគារ (Payment Account) *</label>
                <input 
                  type="text"
                  required
                  placeholder="ឧទាហរណ៍: ABA 000 123 456 (RATHA DARARATH)"
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  រូបភាព QR Code សម្រាប់ទទួលប្រាក់ (Payment QR Code - ស្រេចចិត្ត)
                </label>
                <div className="space-y-2">
                  {qrCodeUrl ? (
                    <div className="relative w-32 h-32 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center group">
                      <img src={qrCodeUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setQrCodeUrl('')}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                        title="លុបរូបភាព"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:bg-slate-50 cursor-pointer transition-colors p-3 text-center">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">ចុចទីនេះដើម្បីជ្រើសរើសរូបភាព QR Code</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG ឬ WEBP</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setQrCodeUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">មូលហេតុចង់ក្លាយជា Promoter (Reason) *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="រៀបរាប់អំពីមូលហេតុ ឬផែនការក្នុងការណែនាំអតិថិជនមកកាន់ RoleaTopup..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">តំណភ្ជាប់បណ្តាញសង្គម (Social Media Links - ជម្រើស)</label>
                <input 
                  type="text"
                  placeholder="TikTok / Facebook Page / YouTube Channel"
                  value={socialLinks}
                  onChange={(e) => setSocialLinks(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingApp}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingApp ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនពាក្យស្នើសុំ'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
