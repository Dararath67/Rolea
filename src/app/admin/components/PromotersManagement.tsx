'use client';

import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  DollarSign, 
  Edit2, 
  Copy, 
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Sliders,
  CreditCard,
  Eye,
  Globe,
  User,
  Mail
} from 'lucide-react';

interface PromotersManagementProps {
  language?: string;
}

export default function PromotersManagement({ language = 'km' }: PromotersManagementProps) {
  const isKm = language === 'km';

  const [subTab, setSubTab] = useState<'applications' | 'promoters' | 'withdrawals'>('applications');
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [promoters, setPromoters] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // User Details Modal State
  const [detailApp, setDetailApp] = useState<any | null>(null);

  // Review Application Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [commissionRateInput, setCommissionRateInput] = useState('0.3');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Edit Promoter Modal State
  const [editingPromoter, setEditingPromoter] = useState<any | null>(null);
  const [editRate, setEditRate] = useState('0.3');
  const [editCode, setEditCode] = useState('');
  const [editStatus, setEditStatus] = useState('approved');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Review Withdrawal Modal State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [withdrawalAction, setWithdrawalAction] = useState<'approved' | 'rejected'>('approved');
  const [withdrawalRejectReason, setWithdrawalRejectReason] = useState('');
  const [isSubmittingWithdrawalReview, setIsSubmittingWithdrawalReview] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [appsRes, promsRes, withsRes] = await Promise.all([
        fetch('/api/v1/admin/promoters/applications'),
        fetch('/api/v1/admin/promoters'),
        fetch('/api/v1/admin/promoters/withdrawals')
      ]);

      if (appsRes.ok) setApplications(await appsRes.json());
      if (promsRes.ok) setPromoters(await promsRes.json());
      if (withsRes.ok) setWithdrawals(await withsRes.json());
    } catch (err) {
      console.error("Failed to load promoter admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setIsSubmittingReview(true);

    try {
      const payload = {
        status: reviewStatus,
        reject_reason: reviewStatus === 'rejected' ? rejectReasonInput : undefined,
        commission_rate: reviewStatus === 'approved' ? parseFloat(commissionRateInput) : undefined,
        referral_code: reviewStatus === 'approved' && referralCodeInput ? referralCodeInput : undefined
      };

      const res = await fetch(`/api/v1/admin/promoters/applications/${selectedApp.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSelectedApp(null);
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.detail || 'បរាជ័យក្នុងការពិនិត្យពាក្យស្នើសុំ');
      }
    } catch (err) {
      alert('មានបញ្ហាក្នុងការតភ្ជាប់ប្រព័ន្ធ');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditPromoterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromoter) return;
    setIsSubmittingEdit(true);

    try {
      const payload = {
        commission_rate: parseFloat(editRate),
        referral_code: editCode,
        status: editStatus
      };

      const res = await fetch(`/api/v1/admin/promoters/${editingPromoter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingPromoter(null);
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.detail || 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាព');
      }
    } catch (err) {
      alert('មានបញ្ហាក្នុងការតភ្ជាប់ប្រព័ន្ធ');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleReviewWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;
    setIsSubmittingWithdrawalReview(true);

    try {
      const payload = {
        status: withdrawalAction,
        reject_reason: withdrawalAction === 'rejected' ? withdrawalRejectReason : undefined
      };

      const res = await fetch(`/api/v1/admin/promoters/withdrawals/${selectedWithdrawal.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSelectedWithdrawal(null);
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.detail || 'បរាជ័យក្នុងការពិនិត្យសំណើដកប្រាក់');
      }
    } catch (err) {
      alert('មានបញ្ហាក្នុងការតភ្ជាប់ប្រព័ន្ធ');
    } finally {
      setIsSubmittingWithdrawalReview(false);
    }
  };

  const filteredApps = applications.filter(a => 
    a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone?.includes(searchQuery)
  );

  const filteredPromoters = promoters.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.referral_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  const filteredWithdrawals = withdrawals.filter(w => 
    w.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>គ្រប់គ្រង Promoter & Referral System</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">បញ្ជីពាក្យស្នើសុំ និង Promoter ផ្លូវការ</h2>
          <p className="text-xs text-slate-500 mt-1">ពិនិត្យពាក្យស្នើសុំ អនុម័តកូដណែនាំ និងគ្រប់គ្រងការដកកម្រៃជើងសារ</p>
        </div>

        <button
          onClick={loadAllData}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>ធ្វើបច្ចុប្បន្នភាព</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setSubTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'applications' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>ពាក្យស្នើសុំ Promoter</span>
            {pendingAppsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
                {pendingAppsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('promoters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'promoters' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Promoter ផ្លូវការ</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {promoters.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'withdrawals' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>សំណើដកប្រាក់</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ/លេខ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3.5 py-2 text-xs font-semibold outline-none focus:border-blue-600 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-semibold">កំពុងទាញយកទិន្នន័យ Promoter...</p>
        </div>
      ) : (
        <>
          {/* 1. APPLICATIONS TAB */}
          {subTab === 'applications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {filteredApps.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  មិនមានពាក្យស្នើសុំ Promoter ក្នុងប្រព័ន្ធទេ
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">ឈ្មោះបេក្ខជន</th>
                        <th className="py-3 px-4">ទំនាក់ទំនង & លីងអាខោន</th>
                        <th className="py-3 px-4">អាខោនទូទាត់</th>
                        <th className="py-3 px-4">មូលហេតុស្នើសុំ</th>
                        <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                        <th className="py-3 px-4">ស្ថានភាព</th>
                        <th className="py-3 px-4 text-right">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.map((app) => {
                        const tgClean = app.telegram_username ? app.telegram_username.replace('@', '').trim() : '';
                        const tgUrl = tgClean ? `https://t.me/${tgClean}` : null;
                        const socialUrl = app.social_links ? (app.social_links.startsWith('http') ? app.social_links : `https://${app.social_links}`) : null;

                        return (
                          <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div>{app.full_name}</div>
                              <div className="text-[11px] font-normal text-slate-400">@{app.username}</div>
                            </td>
                            <td className="py-3.5 px-4 space-y-0.5">
                              <div className="font-semibold text-slate-800">{app.phone}</div>
                              {tgUrl && (
                                <div>
                                  <a 
                                    href={tgUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <span>Telegram: {app.telegram_username}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              )}
                              {socialUrl && (
                                <div>
                                  <a 
                                    href={socialUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-800 font-semibold hover:underline inline-flex items-center gap-1 text-[11px] max-w-[180px] truncate"
                                    title={app.social_links}
                                  >
                                    <span>Social: {app.social_links}</span>
                                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                  </a>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-800">{app.payment_method}</span>
                              <div className="text-[11px] text-slate-500 font-mono">{app.payment_account}</div>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs truncate" title={app.reason}>
                              {app.reason}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {app.applied_at.slice(0, 10)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                app.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {app.status === 'approved' ? 'អនុម័ត (APPROVED)' :
                                 app.status === 'rejected' ? 'បដិសេធ (REJECTED)' :
                                 'រង់ចាំ (PENDING)'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setDetailApp(app)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-colors inline-flex items-center gap-1"
                                title="មើលព័ត៌មានលម្អិត"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>មើលលម្អិត</span>
                              </button>

                              {app.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setReviewStatus('approved');
                                      setCommissionRateInput('0.3');
                                      setReferralCodeInput('');
                                    }}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-colors"
                                  >
                                    អនុម័ត (Approve)
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setReviewStatus('rejected');
                                      setRejectReasonInput('');
                                    }}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl transition-colors"
                                  >
                                    បដិសេធ (Reject)
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. ACTIVE PROMOTERS TAB */}
          {subTab === 'promoters' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {filteredPromoters.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  មិនទាន់មាន Promoter ផ្លូវការក្នុងប្រព័ន្ធទេ
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Promoter</th>
                        <th className="py-3 px-4">កូដណែនាំ</th>
                        <th className="py-3 px-4">អត្រាកម្រៃ (%)</th>
                        <th className="py-3 px-4">ការបញ្ជាទិញសរុប</th>
                        <th className="py-3 px-4">សរុបការលក់ ($)</th>
                        <th className="py-3 px-4">សរុបកម្រៃ ($)</th>
                        <th className="py-3 px-4">សមតុល្យដក ($)</th>
                        <th className="py-3 px-4">ស្ថានភាព</th>
                        <th className="py-3 px-4 text-right">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPromoters.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{p.full_name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{p.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            {p.referral_code}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-600">
                            {p.commission_rate}%
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {p.total_orders}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            ${(p.total_sales_usd || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">
                            ${(p.total_commission_usd || 0).toFixed(4)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-indigo-600">
                            ${(p.available_balance_usd || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {p.status === 'approved' ? 'សកម្ម (Active)' : 'ផ្អាក (Suspended)'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setEditingPromoter(p);
                                setEditRate(String(p.commission_rate));
                                setEditCode(p.referral_code);
                                setEditStatus(p.status);
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-colors inline-flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>កែប្រែ</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. WITHDRAWALS TAB */}
          {subTab === 'withdrawals' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {filteredWithdrawals.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  មិនមានសំណើដកប្រាក់ក្នុងប្រព័ន្ធទេ
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">លេខកូដសំណើ</th>
                        <th className="py-3 px-4">Promoter</th>
                        <th className="py-3 px-4">ចំនួនទឹកប្រាក់ ($)</th>
                        <th className="py-3 px-4">អាខោនទទួលប្រាក់</th>
                        <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                        <th className="py-3 px-4">ស្ថានភាព</th>
                        <th className="py-3 px-4 text-right">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredWithdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{w.id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{w.full_name}</td>
                          <td className="py-3.5 px-4 font-black text-emerald-600">${w.amount_usd.toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{w.payment_method}</span>
                            <div className="text-[11px] text-slate-500 font-mono">{w.payment_account}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{w.requested_at.slice(0, 10)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              w.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {w.status === 'approved' ? 'បានទូទាត់ (Approved)' :
                               w.status === 'rejected' ? 'បដិសេធ (Rejected)' :
                               'រង់ចាំ (Pending)'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {w.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(w);
                                    setWithdrawalAction('approved');
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-colors"
                                >
                                  អនុម័តទូទាត់
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(w);
                                    setWithdrawalAction('rejected');
                                    setWithdrawalRejectReason('');
                                  }}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl transition-colors"
                                >
                                  បដិសេធ
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Review Application Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {reviewStatus === 'approved' ? 'អនុម័តពាក្យស្នើសុំ Promoter' : 'បដិសេធពាក្យស្នើសុំ Promoter'}
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewAppSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                <div><strong>ឈ្មោះ:</strong> {selectedApp.full_name}</div>
                <div><strong>លេខទូរស័ព្ទ:</strong> {selectedApp.phone}</div>
                <div><strong>អាខោនទូទាត់:</strong> {selectedApp.payment_method} - {selectedApp.payment_account}</div>
              </div>

              {reviewStatus === 'approved' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">អត្រាកម្រៃជើងសារ (% Commission Rate)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={commissionRateInput}
                      onChange={(e) => setCommissionRateInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">ឧទាហរណ៍: 0.3% សម្រាប់រាល់ការបញ្ជាទិញជោគជ័យ</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">កូដណែនាំ (Referral Code - ទុកទំនេរដើម្បីបង្កើតស្វ័យប្រវត្តិ)</label>
                    <input 
                      type="text"
                      placeholder="ឧទាហរណ៍: RATHA10"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none uppercase"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">មូលហេតុនៃការបដិសេធ</label>
                  <textarea 
                    rows={3}
                    placeholder="បញ្ជាក់មូលហេតុបដិសេធ..."
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-xl ${
                    reviewStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmittingReview ? 'កំពុងដំណើរការ...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Promoter Modal */}
      {editingPromoter && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">កែប្រែព័ត៌មាន Promoter ({editingPromoter.full_name})</h3>
              <button onClick={() => setEditingPromoter(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPromoterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">អត្រាកម្រៃជើងសារ (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">កូដណែនាំ (Referral Code)</label>
                <input 
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ស្ថានភាព</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none"
                >
                  <option value="approved">សកម្ម (Active / Approved)</option>
                  <option value="suspended">ផ្អាក (Suspended)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPromoter(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  {isSubmittingEdit ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Withdrawal Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {withdrawalAction === 'approved' ? 'អនុម័តការទូទាត់ដកប្រាក់' : 'បដិសេធសំណើដកប្រាក់'}
              </h3>
              <button onClick={() => setSelectedWithdrawal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewWithdrawalSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-600 space-y-2 border border-slate-100">
                <div><strong>Promoter:</strong> {selectedWithdrawal.full_name}</div>
                <div><strong>ចំនួនទឹកប្រាក់:</strong> ${selectedWithdrawal.amount_usd.toFixed(2)}</div>
                <div><strong>គណនី:</strong> {selectedWithdrawal.payment_method} - {selectedWithdrawal.payment_account}</div>
                {selectedWithdrawal.qr_code_url && (
                  <div className="border-t border-slate-200 pt-2 text-center">
                    <span className="block font-bold text-slate-700 text-left mb-1">រូបភាព QR Code:</span>
                    <div className="w-44 h-44 rounded-2xl border border-slate-200 bg-white p-1 mx-auto shadow-sm overflow-hidden">
                      <img src={selectedWithdrawal.qr_code_url} alt="Withdrawal QR Code" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {withdrawalAction === 'rejected' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">មូលហេតុបដិសេធ (ប្រាក់នឹងត្រូវបង្វិលចូលសមតុល្យ Promoter វិញ)</label>
                  <textarea 
                    rows={3}
                    placeholder="បញ្ជាក់មូលហេតុ..."
                    value={withdrawalRejectReason}
                    onChange={(e) => setWithdrawalRejectReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedWithdrawal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdrawalReview}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-xl ${
                    withdrawalAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmittingWithdrawalReview ? 'កំពុងដំណើរការ...' : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Applicant Detail Info Modal */}
      {detailApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">ព័ត៌មានលម្អិតបេក្ខជន Promoter</h3>
                <p className="text-[11px] text-slate-400">ID: {detailApp.id}</p>
              </div>
              <button onClick={() => setDetailApp(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {detailApp.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">{detailApp.full_name}</div>
                  <div className="text-slate-400 font-medium">@{detailApp.username}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">User ID: {detailApp.user_id}</div>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    detailApp.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    detailApp.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {detailApp.status === 'approved' ? 'APPROVED' :
                     detailApp.status === 'rejected' ? 'REJECTED' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Contact & Social Links */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span>ទំនាក់ទំនង & បណ្តាញសង្គម</span>
                </h4>
                <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">លេខទូរស័ព្ទ:</span>
                    <span className="font-bold text-slate-800">{detailApp.phone || '-'}</span>
                  </div>
                  
                  {detailApp.telegram_username && (
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                      <span className="text-slate-500 font-medium">Telegram:</span>
                      <a 
                        href={`https://t.me/${detailApp.telegram_username.replace('@', '').trim()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                      >
                        <span>{detailApp.telegram_username}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {detailApp.social_links && (
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                      <span className="text-slate-500 font-medium">Social Link:</span>
                      <a 
                        href={detailApp.social_links.startsWith('http') ? detailApp.social_links : `https://${detailApp.social_links}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 font-bold hover:underline inline-flex items-center gap-1 text-xs max-w-[220px] truncate"
                        title={detailApp.social_links}
                      >
                        <span className="truncate">{detailApp.social_links}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Account */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">គណនីទូទាត់កម្រៃជើងសារ</h4>
                <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">វិធីសាស្ត្រទូទាត់:</span>
                    <span className="font-bold text-slate-900">{detailApp.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ឈ្មោះ/លេខគណនី:</span>
                    <span className="font-mono font-bold text-slate-900">{detailApp.payment_account}</span>
                  </div>
                  {detailApp.qr_code_url && (
                    <div className="border-t border-slate-100 pt-2 flex flex-col items-center">
                      <span className="text-slate-500 font-medium mb-1 self-start">រូបភាព QR Code:</span>
                      <div className="w-40 h-40 rounded-2xl border border-slate-200 overflow-hidden bg-white p-1 shadow-sm">
                        <img src={detailApp.qr_code_url} alt="Payment QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">មូលហេតុនៃការស្នើសុំ</h4>
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {detailApp.reason || 'គ្មានមូលហេតុ'}
                </div>
              </div>

              {/* Reject reason if any */}
              {detailApp.reject_reason && (
                <div className="space-y-1 p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-800">
                  <span className="font-bold text-xs block">មូលហេតុនៃការបដិសេធ:</span>
                  <p className="text-xs">{detailApp.reject_reason}</p>
                </div>
              )}

              {/* Meta */}
              <div className="text-[11px] text-slate-400 pt-1 flex justify-between border-t border-slate-100">
                <span>កាលបរិច្ឆេទស្នើសុំ: {detailApp.applied_at.slice(0, 10)}</span>
                {detailApp.reviewed_at && <span>ពិនិត្យនៅ: {detailApp.reviewed_at.slice(0, 10)}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                បិទ (Close)
              </button>
              
              {detailApp.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const appToReview = detailApp;
                      setDetailApp(null);
                      setSelectedApp(appToReview);
                      setReviewStatus('approved');
                      setCommissionRateInput('0.3');
                      setReferralCodeInput('');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    អនុម័ត (Approve)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const appToReview = detailApp;
                      setDetailApp(null);
                      setSelectedApp(appToReview);
                      setReviewStatus('rejected');
                      setRejectReasonInput('');
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    បដិសេធ (Reject)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
