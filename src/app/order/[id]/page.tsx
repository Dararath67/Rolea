'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Zap, 
  Copy, 
  RefreshCw, 
  ArrowLeft, 
  Printer, 
  Sparkles,
  Check
} from 'lucide-react';

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { language, formatPrice, t } = useLanguage();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        if (data.data.status === 'success') {
          try {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
        }
        if (data.data.auto_account_notice) {
          const notice = data.data.auto_account_notice;
          const uObj = {
            id: notice.id,
            username: notice.username,
            email: notice.email,
            role: notice.role || 'user',
            wallet_usd: notice.wallet_usd,
            is_auto_created: true,
            need_password_change: true
          };
          localStorage.setItem('rothz_user', JSON.stringify(uObj));
          localStorage.setItem('rolea_user', JSON.stringify(uObj));
          localStorage.setItem('rothz_token', 'token_' + notice.id);
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const timer = setInterval(() => {
      if (order && (order.status === 'pending' || order.status === 'processing')) {
        fetchOrder();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [orderId, order?.status]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await fetch(`/api/v1/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          delivery_code: newStatus === 'success' ? `ROTHZ-AUTO-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined
        })
      });
      await fetchOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h2 className="text-2xl font-black mb-2 text-slate-900">Order Not Found</h2>
          <Link href="/order/track" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs">
            Search Order
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const steps = [
    { key: 'pending', label_km: '១. បានបង្កើតការបញ្ជាទិញ', label_en: '1. Order Created' },
    { key: 'processing', label_km: '២. កំពុងបញ្ចូលតាម API', label_en: '2. Processing via Provider' },
    { key: 'success', label_km: '៣. ជោគជ័យ (បានបញ្ចូល)', label_en: '3. Completed & Delivered' },
  ];

  const getStepStatus = (key: string) => {
    const list = ['pending', 'processing', 'success'];
    const curIdx = list.indexOf(order.status);
    const stepIdx = list.indexOf(key);

    if (order.status === 'failed' || order.status === 'cancelled') return 'error';
    if (stepIdx < curIdx || order.status === 'success') return 'completed';
    if (stepIdx === curIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>{t.storefront}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={fetchOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 text-xs font-bold shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Stepper Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 mb-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 font-medium">Order ID:</span>
                <span className="text-lg font-mono font-black text-blue-600">{order.id}</span>
                <button
                  onClick={() => handleCopy(order.id)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded bg-slate-100 border border-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span className="text-[11px] text-emerald-600 font-bold">Copied!</span>}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            {/* Status Badge */}
            <div>
              {order.status === 'success' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {t.statusSuccess}
                </span>
              )}
              {order.status === 'processing' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold animate-pulse">
                  <Clock className="w-4 h-4 text-blue-600" />
                  {t.statusProcessing}
                </span>
              )}
              {order.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  {t.statusPending}
                </span>
              )}
              {(order.status === 'failed' || order.status === 'cancelled') && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  {order.status === 'failed' ? t.statusFailed : t.statusCancelled}
                </span>
              )}
            </div>
          </div>

          {/* Stepper nodes */}
          <div className="py-8">
            <div className="grid grid-cols-3 gap-4">
              {steps.map((s, idx) => {
                const st = getStepStatus(s.key);
                return (
                  <div key={s.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs mb-2 transition-all ${
                        st === 'completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : st === 'current'
                          ? 'bg-blue-600 text-white shadow-xs animate-pulse'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {st === 'completed' ? <Check className="w-5 h-5 stroke-[3]" /> : idx + 1}
                    </div>
                    <h4 className="font-bold text-xs text-slate-800">
                      {language === 'km' ? s.label_km : s.label_en}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Refund & Auto Account Creation Alert Box */}
          {order.status === 'refunded' && (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  {language === 'km' ? 'ព័ត៌មានបង្វិលប្រាក់ និងគណនីស្វ័យប្រវត្តិ (Refund & Auto Account Notice)' : 'Order Refunded & Account Created Automatically'}
                </span>
              </div>
              
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {language === 'km' 
                  ? `ដោយសារការបញ្ជាទិញលេខ #${order.id} មានការបង្វិលសងទឹកប្រាក់ ($${order.amount_usd.toFixed(2)}) ប្រព័ន្ធបានបង្កើតគណនីបណ្តោះអាសន្នជូនអ្នក និងបានដាក់ទឹកប្រាក់ចូលក្នុងកាបូបលុយរបស់អ្នករួចរាល់!`
                  : `Order #${order.id} was refunded ($${order.amount_usd.toFixed(2)}). An account was created and funds credited to your wallet.`}
              </p>

              {order.auto_account_notice && (
                <div className="p-4 rounded-xl bg-white border border-amber-300 space-y-3 text-xs shadow-2xs">
                  <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>{language === 'km' ? 'ព័ត៌មានគណនីបណ្តោះអាសន្នរបស់អ្នក (Temp Account Credentials)' : 'Your Temporary Account Details'}</span>
                    <span className="font-mono text-emerald-600 font-black text-sm">
                      Wallet: ${order.auto_account_notice.wallet_usd?.toFixed(2) || order.amount_usd.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Username</span>
                      <strong className="text-slate-900 text-xs">{order.auto_account_notice.username}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Email</span>
                      <strong className="text-slate-900 text-xs truncate block">{order.auto_account_notice.email}</strong>
                    </div>
                    <div className="bg-amber-100/70 p-2.5 rounded-lg border border-amber-300">
                      <span className="text-[10px] text-amber-800 font-bold block uppercase">Temp Password</span>
                      <strong className="text-amber-950 text-xs tracking-wider">{order.auto_account_notice.temp_password}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-900 font-bold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    {language === 'km' 
                      ? 'សម្គាល់៖ Password ត្រូវ បានបង្កើតបណ្តោះអាសន្ន (មិនដូច Email ទេ)។ សូមផ្លាស់ប្តូរលេខសម្ងាត់ និងឈ្មោះ Username របស់អ្នកដើម្បីសុវត្ថិភាព!' 
                      : 'Notice: Temporary password generated (differs from email). Please change your username and password for security.'}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                    <Link
                      href="/dashboard?tab=profile"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs text-center"
                    >
                      {language === 'km' ? 'ផ្លាស់ប្តូរលេខសម្ងាត់ និង Username' : 'Change Password & Username'}
                    </Link>
                    <a
                      href="https://t.me/RoleaToP_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs text-center flex items-center justify-center gap-1.5"
                    >
                      <span>{language === 'km' ? 'ទាក់ទង Telegram Support (@RoleaToP_bot)' : 'Contact Telegram Support (@RoleaToP_bot)'}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Box */}
          {order.status === 'success' && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>
                  {language === 'km' ? 'ការបញ្ចូលទឹកប្រាក់បានជោគជ័យ ១០០%!' : 'Top-Up Successfully Completed & Delivered!'}
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {language === 'km' 
                  ? `ពេជ្រត្រូវបានបញ្ចូលដោយស្វ័យប្រវត្តិចូលទៅកាន់គណនី ID: ${order.player_id} (${order.server_id || 'SEA'})` 
                  : `Credits were directly delivered to account UID ${order.player_id}.`}
              </p>

              {order.delivery_code && (
                <div className="p-4 rounded-xl bg-white border border-emerald-300 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Delivery Reference / Voucher Key</div>
                    <div className="font-mono text-sm font-black text-emerald-700">
                      {order.delivery_code}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(order.delivery_code)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              )}
            </div>
          )}


        </div>

        {/* Transaction Breakdown */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            {language === 'km' ? 'សេចក្តីលម្អិតនៃវិក្កយបត្រ' : 'Transaction Summary'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div className="text-slate-500 font-medium">
                {language === 'km' ? 'ហ្គេម' : 'Product'}: <strong className="text-slate-900 block text-sm mt-0.5">{language === 'km' ? order.game_name_km : order.game_name_en}</strong>
              </div>
              <div className="text-slate-500 font-medium">
                {language === 'km' ? 'កញ្ចប់' : 'Package'}: <span className="text-slate-800 font-bold block mt-0.5">{language === 'km' ? order.product_name_km : order.product_name_en}</span>
              </div>
              <div className="text-slate-500 font-medium">
                {language === 'km' ? 'គណនីទទួល' : 'Target Player ID'}:
                <div className="mt-1 font-mono text-blue-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-bold">
                  Player UID: <strong>{order.player_id}</strong> {order.server_id && `(Server: ${order.server_id})`}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-slate-500 font-medium">
                {language === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}: <span className="text-slate-800 font-bold block mt-0.5">{order.payment_method_name}</span>
              </div>
              <div className="text-slate-500 font-medium">
                {language === 'km' ? 'ទំនាក់ទំនង' : 'Contact Phone / Email'}: <span className="text-slate-800 font-bold block mt-0.5">{order.customer_contact || 'N/A'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Price (USD):</span>
                  <span className="text-slate-900 font-bold">${order.amount_usd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Price (KHR):</span>
                  <span className="text-slate-900 font-bold">៛{order.amount_khr.toLocaleString()} KHR</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Paid:</span>
                  <span className="text-blue-600 font-black text-base">${order.amount_usd.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
