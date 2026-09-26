'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WalletDepositModal from '@/components/WalletDepositModal';
import { useLanguage } from '@/context/LanguageContext';
import { useGlobalLoading } from '@/context/LoadingContext';
import { 
  Terminal, 
  Key, 
  Wallet, 
  TrendingUp, 
  Copy, 
  Plus, 
  Check, 
  ExternalLink, 
  Code, 
  ShoppingBag,
  Trash2,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Store
} from 'lucide-react';

export default function ResellerDashboardPage() {
  const { language, t } = useLanguage();
  const isKm = language === 'km';
  const { showLoading, hideLoading } = useGlobalLoading();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [balanceUsd, setBalanceUsd] = useState(0.00);
  const [estProfitUsd, setEstProfitUsd] = useState(0.00);
  const [b2bOrdersCount, setB2bOrdersCount] = useState(0);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyIp, setNewKeyIp] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [submittingKey, setSubmittingKey] = useState(false);

  // Live Tester State
  const [testGame, setTestGame] = useState('mobile-legends');
  const [testProduct, setTestProduct] = useState('ml-86');
  const [testPlayerId, setTestPlayerId] = useState('123456789');
  const [testServerId, setTestServerId] = useState('1234');
  const [testApiKey, setTestApiKey] = useState('');
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const getAuthToken = () => localStorage.getItem('rolea_token') || localStorage.getItem('rothz_token') || '';

  const fetchResellerOverview = async () => {
    try {
      const res = await fetch('/api/v1/reseller/overview', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const bal = data.data.wallet_usd || 0.00;
        setBalanceUsd(bal);
        setEstProfitUsd(data.data.est_profit_usd || 0.00);
        setB2bOrdersCount(data.data.b2b_orders_count || 0);
        const keys = data.data.api_keys || [];
        setApiKeys(keys);
        if (keys.length > 0 && !testApiKey) {
          setTestApiKey(keys[0].api_key);
        }

        const storedUser = localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.wallet_usd = bal;
            localStorage.setItem('rothz_user', JSON.stringify(parsed));
            localStorage.setItem('rolea_user', JSON.stringify(parsed));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Failed to fetch reseller overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {}
    fetchResellerOverview();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel.trim()) return;

    setSubmittingKey(true);
    try {
      const res = await fetch('/api/v1/reseller/api-keys/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          label: newKeyLabel.trim(),
          ip_whitelist: newKeyIp ? newKeyIp.split(',').map(s => s.trim()) : []
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsCreatingKey(false);
        setNewKeyLabel('');
        setNewKeyIp('');
        fetchResellerOverview();
      }
    } catch (err) {
      console.error('Failed to generate key:', err);
    } finally {
      setSubmittingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm(isKm ? 'តើអ្នកពិតជាចង់លុប/លុបចោល Key នេះមែនទេ?' : 'Are you sure you want to revoke this API key?')) return;
    try {
      const res = await fetch(`/api/v1/reseller/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchResellerOverview();
      }
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const handleExecuteLiveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingApi(true);
    setTestResult(null);

    const apiKey = testApiKey || (apiKeys.find(k => k.is_active)?.api_key || 'rt_live_demo');

    try {
      const res = await fetch('/api/v1/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          game: testGame,
          product_id: testProduct,
          player_id: testPlayerId,
          server_id: testServerId,
          reference: `TEST-${Date.now()}`
        })
      });
      const data = await res.json();
      setTestResult({
        status: res.status,
        data: data
      });
      fetchResellerOverview();
    } catch (err: any) {
      setTestResult({
        status: 500,
        data: { error: err.message || 'API Request Failed' }
      });
    } finally {
      setTestingApi(false);
    }
  };

  // Reseller Application Form State
  const [applyBusinessName, setApplyBusinessName] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyReason, setApplyReason] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApplyReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyBusinessName) {
      setApplyError(isKm ? 'សូមបញ្ចូលឈ្មោះអាជីវកម្ម ឬហាង' : 'Business name is required');
      return;
    }
    setSubmittingApply(true);
    setApplyError(null);

    try {
      const res = await fetch('/api/v1/reseller/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id || currentUser?.username,
          business_name: applyBusinessName,
          phone: applyPhone || currentUser?.phone || '',
          reason: applyReason
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('rolea_user', JSON.stringify(data.user));
      } else {
        setApplyError(data.detail || (isKm ? 'បរាជ័យក្នុងការបញ្ជូនពាក្យស្នើសុំ' : 'Application submission failed'));
      }
    } catch (err) {
      setApplyError(isKm ? 'បរាជ័យក្នុងការតភ្ជាប់ទៅប្រព័ន្ធ' : 'Connection error');
    } finally {
      setSubmittingApply(false);
    }
  };

  const activeApiKey = testApiKey || (apiKeys.find(k => k.is_active)?.api_key || 'rt_live_kh_your_api_key');
  const isApprovedReseller = currentUser && (currentUser.role === 'reseller' || currentUser.role === 'admin' || currentUser.reseller_status === 'approved');
  const isPendingReseller = currentUser && currentUser.reseller_status === 'pending';

  if (!loading && !isApprovedReseller) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-12 flex flex-col justify-center">
          {!currentUser ? (
            /* Not Logged In Screen */
            <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
                <Terminal className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {isKm ? 'ចូលប្រើប្រាស់ ឬចុះឈ្មោះ Reseller B2B' : 'B2B Reseller Portal'}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {isKm 
                    ? 'សូមចូលប្រើប្រាស់គណនីរបស់អ្នក ឬចុះឈ្មោះបង្កើតគណនីថ្មីដើម្បីស្នើសុំសិទ្ធិជាដៃគូលក់បន្ត B2B' 
                    : 'Please sign in or create an account to apply for wholesale B2B Reseller API access.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register?role=reseller" className="flex-1 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors text-center">
                  {isKm ? 'បង្កើតគណនី Reseller' : 'Create Reseller Account'}
                </Link>
                <Link href="/login" className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors text-center">
                  {isKm ? 'ចូលប្រើប្រាស់ (Login)' : 'Sign In'}
                </Link>
              </div>
            </div>
          ) : isPendingReseller ? (
            /* Pending Approval Screen */
            <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider inline-block mb-2">
                  {isKm ? 'រង់ចាំ Admin អនុម័ត (PENDING)' : 'PENDING APPROVAL'}
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {isKm ? 'ពាក្យស្នើសុំដៃគូលក់បន្តត្រូវបានបញ្ជូន!' : 'Reseller Application Submitted!'}
                </h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {isKm 
                    ? 'ពាក្យស្នើសុំដៃគូលក់បន្ត (B2B Reseller) របស់អ្នកកំពុងស្ថិតក្នុងការពិនិត្យពីក្រុមការងារ Admin។ បន្ទាប់ពីការអនុម័តរួច តម្លៃបោះដុំ និងកូដ API នឹងត្រូវបើកដំណើរការដោយស្វ័យប្រវត្តិ។' 
                    : 'Your B2B Reseller application is pending review by our Admin team. Wholesale rates and API credentials will be activated automatically upon approval.'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isKm ? 'ឈ្មោះគណនី:' : 'Account:'}</span>
                  <span className="font-bold text-slate-900">@{currentUser.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isKm ? 'ឈ្មោះអាជីវកម្ម:' : 'Business Name:'}</span>
                  <span className="font-bold text-slate-900">{currentUser.reseller_business_name || currentUser.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isKm ? 'កាលបរិច្ឆេទស្នើសុំ:' : 'Applied Date:'}</span>
                  <span className="text-slate-600">{currentUser.reseller_applied_at?.slice(0, 10) || 'Today'}</span>
                </div>
              </div>
              <Link href="/dashboard" className="inline-flex px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors">
                {isKm ? 'ត្រឡប់ទៅ Dashboard' : 'Return to Dashboard'}
              </Link>
            </div>
          ) : (
            /* Logged-In User Application Form */
            <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-xl space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-purple-500/20">
                  <Store className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  {isKm ? 'ស្នើសុំជាដៃគូលក់បន្ត (Apply for B2B Reseller)' : 'Become a B2B Reseller'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {isKm ? 'បំពេញព័ត៌មានខាងក្រោមដើម្បីស្នើសុំសិទ្ធិដៃគូលក់បន្ត B2B និងទទួលបានតម្លៃបោះដុំ' : 'Submit details to request B2B Wholesale pricing & API key access'}
                </p>
              </div>

              {applyError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {applyError}
                </div>
              )}

              <form onSubmit={handleApplyReseller} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isKm ? 'ឈ្មោះគណនី (Username)' : 'Account Username'}
                  </label>
                  <input 
                    type="text" 
                    readOnly 
                    value={`@${currentUser.username} (${currentUser.email})`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isKm ? 'ឈ្មោះហាង ឬអាជីវកម្ម (Business / Store Name) *' : 'Business / Store Name *'}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="ឧទាហរណ៍: Rotha Game Store"
                    value={applyBusinessName}
                    onChange={(e) => setApplyBusinessName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isKm ? 'លេខទូរស័ព្ទទំនាក់ទំនង (Phone Number) *' : 'Contact Phone Number *'}
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="012 345 678"
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isKm ? 'មូលហេតុនៃការស្នើសុំ ឬ ផែនការលក់បន្ត (Reason / Plan) *' : 'Reason / Resale Plan *'}
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="រៀបរាប់អំពីហាង ឬ ផែនការក្នុងការលក់បន្តកាតហ្គេម..."
                    value={applyReason}
                    onChange={(e) => setApplyReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingApply}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  {submittingApply ? 'កំពុងបញ្ជូន...' : (isKm ? 'បញ្ជូនពាក្យស្នើសុំជាដៃគូលក់បន្ត' : 'Submit Reseller Application')}
                </button>
              </form>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>B2B Reseller Portal</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              {isKm ? 'ប្រព័ន្ធដៃគូលក់បន្ត (B2B Reseller)' : 'Game Top-Up Reseller Platform'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isKm 
                ? 'ភ្ជាប់គេហទំព័រ ឬកម្មវិធីទូរស័ព្ទរបស់អ្នកជាមួយ API ស្វ័យប្រវត្តិ 24/7'
                : 'Connect your gaming website or mobile app directly via our automated high-throughput API.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                showLoading(isKm ? 'កំពុងធ្វើបច្ចុប្បន្នភាពទិន្នន័យ...' : 'Refreshing Data...');
                await fetchResellerOverview();
                setTimeout(() => hideLoading(), 400);
              }}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}</span>
            </button>
            <Link
              href="/reseller/api-docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Code className="w-4 h-4" />
              <span>{isKm ? 'ឯកសារ API' : 'View API Documentation'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Reseller Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Balance */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">{isKm ? 'តុល្យភាពកាបូប' : 'Reseller Balance'}</p>
                <h3 className="text-2xl font-black text-blue-600 mt-1">
                  ${balanceUsd.toFixed(2)}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="mt-3 w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isKm ? 'បញ្ចូលលុយ / Deposit' : 'Deposit Balance'}</span>
            </button>
          </div>

          {/* Profit Savings */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">{isKm ? 'ចំណេញប៉ាន់ស្មាន' : 'Est. Reseller Profit'}</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                ${estProfitUsd.toFixed(2)}
              </h3>
              <p className="text-[10px] text-emerald-700 mt-0.5 font-semibold">{isKm ? 'រឹមចំណេញ (+15% Tier Margin)' : 'Wholesale Tier Margin (+15%)'}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* API Keys */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">{isKm ? 'API Keys សកម្ម' : 'Active API Keys'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {apiKeys.filter(k => k.is_active).length} Keys
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{isKm ? 'IP Whitelist ការពារ' : 'IP Whitelist Enabled'}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Key className="w-6 h-6" />
            </div>
          </div>

          {/* Total B2B Orders */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">{isKm ? 'ការបញ្ជាទិញ B2B' : 'B2B Transactions'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {b2bOrdersCount} Orders
              </h3>
              <p className="text-[10px] text-emerald-700 mt-0.5 font-semibold">{isKm ? 'អត្រាជោគជ័យ ៩៩.៩%' : '99.9% Success Rate'}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* API Keys Management Section */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                <span>{isKm ? 'គ្រប់គ្រង API Key & ផ្ទៀងផ្ទាត់' : 'API Key & Authentication'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isKm 
                  ? 'ប្រើប្រាស់ API Key ក្នុង Header' 
                  : 'Use your API Key in the'}{' '}
                <code className="text-purple-700 font-mono font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">X-API-Key</code>{' '}
                {isKm ? 'ដើម្បីផ្ញើសំណើទិញទំនិញ (API Key ត្រូវបានផ្ដល់ជូនស្វ័យប្រវត្តិ)' : 'request header to authenticate B2B top-up calls (Auto-assigned key).'}
              </p>
            </div>
          </div>

          {/* Active Key List */}
          <div className="space-y-3">
            {apiKeys.filter(k => k.is_active).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                <Key className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-bold text-slate-600">
                  {isKm ? 'កំពុងបង្កើត API Key ស្វ័យប្រវត្តិ...' : 'Auto-generating your B2B API Key...'}
                </p>
              </div>
            ) : (
              apiKeys.filter(k => k.is_active).map((k) => (
                <div
                  key={k.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{k.label || 'B2B Production Key'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {isKm ? 'សកម្ម (ACTIVE)' : 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-700 text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {k.api_key}
                      </span>
                      <button
                        onClick={() => handleCopy(k.api_key, k.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-xs cursor-pointer"
                        title="Copy API Key"
                      >
                        {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">
                      IP Whitelist: {k.ip_whitelist && k.ip_whitelist.length > 0 ? k.ip_whitelist.join(', ') : 'All IPs allowed (127.0.0.1)'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center text-right text-[11px] text-slate-500 font-medium">
                    <div>
                      {isKm ? 'បង្កើតថ្ងៃ:' : 'Created:'} {k.created_at ? k.created_at.split('T')[0] : 'N/A'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick API Snippet Preview */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" />
              <span>{isKm ? 'ឧទាហរណ៍កូដ cURL លឿន' : 'Quick Start Code (cURL Example)'}</span>
            </h3>

            <Link href="/reseller/api-docs" className="text-xs text-blue-600 font-bold hover:underline">
              {isKm ? 'មើលឯកសារពេញលេញ →' : 'Full API Docs →'}
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto shadow-xs">
            <pre className="text-emerald-400">
{`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/v1/topup \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${activeApiKey}" \\
  -d '{
    "game": "${testGame}",
    "product_id": "${testProduct}",
    "player_id": "${testPlayerId}",
    "server_id": "${testServerId}",
    "reference": "MY-STORE-ORDER-001"
  }'`}
            </pre>
          </div>
        </div>
      </main>

      <WalletDepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        onDepositSuccess={(newBal) => {
          setBalanceUsd(newBal);
          fetchResellerOverview();
        }} 
      />

      <Footer />
    </div>
  );
}
