'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { 
  User as UserIcon, 
  Wallet, 
  ShoppingBag, 
  Plus, 
  CheckCircle2, 
  Zap,
  ArrowRight,
  QrCode,
  RefreshCw,
  X,
  LayoutGrid,
  Package,
  Gift,
  Settings,
  Store,
  LogOut,
  ShieldCheck,
  Sparkles,
  Coins,
  Send,
  Check,
  Crown,
  Clock,
  Key,
  VolumeX
} from 'lucide-react';

export default function UserDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [walletData, setWalletData] = useState<any>({
    balance_usd: 0.0,
    transactions: []
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [promoterData, setPromoterData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Deposit Form States
  const [depositAmountInput, setDepositAmountInput] = useState('10');
  const [selectedPreset, setSelectedPreset] = useState<number>(10);
  const [isGeneratingInline, setIsGeneratingInline] = useState(false);
  const [inlineQrData, setInlineQrData] = useState<any | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkStatusMessage, setCheckStatusMessage] = useState<string | null>(null);

  // Profile Settings States
  const [displayNameInput, setDisplayNameInput] = useState('Ratha Dararath');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Telegram Link States
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramCodeInput, setTelegramCodeInput] = useState('');
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const [telegramLinkStatus, setTelegramLinkStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        let loggedUser: any = null;
        const token = localStorage.getItem('rolea_token') || localStorage.getItem('rothz_token');

        try {
          const stored = localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user');
          if (stored) {
            loggedUser = JSON.parse(stored);
          }
        } catch (e) {}

        if (token) {
          try {
            const profileRes = await fetch('/api/v1/user/profile', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await profileRes.json();
            if (profileRes.status === 401 || profileRes.status === 403 || profileData.account_deleted) {
              localStorage.clear();
              alert('គណនីរបស់អ្នកត្រូវបានលុបចេញពីប្រព័ន្ធ! (Your account has been deleted by Admin)');
              router.push('/login');
              return;
            }
            if (profileData.success && profileData.user) {
              loggedUser = profileData.user;
              localStorage.setItem('rothz_user', JSON.stringify(loggedUser));
              localStorage.setItem('rolea_user', JSON.stringify(loggedUser));
            }
          } catch (e) {}
        }

        if (loggedUser) {
          setCurrentUser(loggedUser);
          setDisplayNameInput(loggedUser.username || loggedUser.full_name || 'Ratha Dararath');
          const bal = typeof loggedUser.wallet_usd === 'number' ? loggedUser.wallet_usd : 0.0;
          setWalletData({
            balance_usd: bal,
            transactions: []
          });

          const userId = loggedUser.id || loggedUser.username;
          if (userId) {
            fetch(`/api/v1/promoter/dashboard?user_id=${encodeURIComponent(userId)}`)
              .then(res => res.ok ? res.json() : null)
              .then(pData => { if (pData) setPromoterData(pData); })
              .catch(() => {});
          }
        }

        const res = await fetch('/api/v1/orders');
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.slice(0, 10));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rothz_token');
    localStorage.removeItem('rothz_user');
    localStorage.removeItem('rolea_user');
    setCurrentUser(null);
    router.push('/');
  };

  const handleSaveProfile = async () => {
    if (!displayNameInput.trim()) return;
    setIsSavingProfile(true);
    setProfileSaveSuccess(false);

    try {
      if (currentUser) {
        const updated = { ...currentUser, username: displayNameInput.trim(), full_name: displayNameInput.trim() };
        setCurrentUser(updated);
        localStorage.setItem('rothz_user', JSON.stringify(updated));
        localStorage.setItem('rolea_user', JSON.stringify(updated));
      }
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDepositSuccess = async (newBal: number) => {
    setWalletData((prev: any) => ({
      ...prev,
      balance_usd: newBal
    }));
    if (currentUser) {
      const updated = { ...currentUser, wallet_usd: newBal };
      setCurrentUser(updated);
      localStorage.setItem('rothz_user', JSON.stringify(updated));
      localStorage.setItem('rolea_user', JSON.stringify(updated));

      const token = localStorage.getItem('rolea_token') || localStorage.getItem('rothz_token');
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        await fetch("/api/v1/user/wallet/deposit", {
          method: "POST",
          headers,
          body: JSON.stringify({
            amount_usd: parseFloat(depositAmountInput) || 10.0,
            transaction_id: `DEP-${Date.now()}`,
            user_id: currentUser.id
          }),
        });
      } catch (e) {}
    }
  };

  const handleGenerateKHQR = async () => {
    const amt = parseFloat(depositAmountInput);
    if (isNaN(amt) || amt <= 0) return;
    setIsGeneratingInline(true);
    try {
      const depositOrderId = `DEP-${Date.now()}`;
      const res = await fetch("/api/v1/payments/vngzz/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_usd: amt,
          order_id: depositOrderId,
          currency: "USD",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data.success || data.qr_string || data.qr_image || data.data) {
        const info = data.data || data;
        setInlineQrData({
          order_id: depositOrderId,
          transaction_id: info.transaction_id || depositOrderId,
          qr_image: info.qr_image || "",
          qr_string: info.qr_string || "",
          amount_usd: amt,
        });
      } else {
        setInlineQrData({
          order_id: depositOrderId,
          transaction_id: depositOrderId,
          qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KHQR_ROLEA_DEP_${amt}_USD`,
          qr_string: `KHQR_ROLEA_DEP_${amt}_USD`,
          amount_usd: amt,
        });
      }
    } catch (e) {
      const depositOrderId = `DEP-${Date.now()}`;
      setInlineQrData({
        order_id: depositOrderId,
        transaction_id: depositOrderId,
        qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KHQR_ROLEA_DEP_${amt}_USD`,
        qr_string: `KHQR_ROLEA_DEP_${amt}_USD`,
        amount_usd: amt,
      });
    } finally {
      setIsGeneratingInline(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!inlineQrData || !inlineQrData.transaction_id) return;
    setIsCheckingPayment(true);
    setCheckStatusMessage(null);
    try {
      const res = await fetch("/api/v1/payments/vngzz/check-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: inlineQrData.transaction_id,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.is_paid || data.state === "PAID" || data.status === "PAID" || data.data?.is_paid) {
        const amt = inlineQrData.amount_usd || parseFloat(depositAmountInput) || 10.0;
        const currentBal = walletData.balance_usd || 0.0;
        const newBal = Math.round((currentBal + amt) * 100) / 100;
        handleDepositSuccess(newBal);
        setInlineQrData(null);
      } else {
        setCheckStatusMessage('មិនទាន់ទទួលបានការទូទាត់ទេ សូមព្យាយាមម្តងទៀតក្រោយពេលទូទាត់រួច');
      }
    } catch (err) {
      setCheckStatusMessage('មិនទាន់ទទួលបានការទូទាត់ទេ សូមព្យាយាមម្តងទៀត');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleLinkTelegram = async () => {
    if (!telegramCodeInput.trim()) return;
    setIsLinkingTelegram(true);
    setTelegramLinkStatus(null);
    try {
      const res = await fetch('/api/v1/user/link-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: telegramCodeInput.trim(),
          user_id: currentUser?.id || currentUser?.username || 'user'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramLinkStatus({ success: true, message: data.message });
        if (currentUser && data.data) {
          const updated = {
            ...currentUser,
            telegram_username: data.data.telegram_username,
            telegram_photo_url: data.data.telegram_photo_url,
            telegram_chat_id: data.data.telegram_chat_id
          };
          setCurrentUser(updated);
          localStorage.setItem('rothz_user', JSON.stringify(updated));
          localStorage.setItem('rolea_user', JSON.stringify(updated));
        }
      } else {
        setTelegramLinkStatus({ success: false, message: data.detail || data.message || 'Verification failed' });
      }
    } catch (e) {
      setTelegramLinkStatus({ success: false, message: 'Network connection error' });
    } finally {
      setIsLinkingTelegram(false);
    }
  };

  const currentAmountNum = parseFloat(depositAmountInput) || 0;
  const bonusAmount = currentAmountNum * 0.05;
  const totalReceived = currentAmountNum + bonusAmount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:py-8 w-full">
        
        {/* Main Dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Sidebar Card Component */}
          <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4 text-xs font-semibold space-y-4 shadow-sm text-slate-800">
            
            {/* User Profile Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {currentUser?.avatar_url || currentUser?.telegram_photo_url ? (
                  <img
                    src={currentUser.avatar_url || currentUser.telegram_photo_url}
                    alt={currentUser?.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm uppercase">
                    {currentUser?.username ? currentUser.username.charAt(0) : 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-slate-900 text-sm truncate">
                  {currentUser?.username || currentUser?.full_name || 'Ratha Dararath'}
                </p>
                <p className="text-slate-500 text-xs font-normal truncate mt-0.5">
                  {currentUser?.email || 'rathadararath8@gmail.com'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                    <span className="text-[10px] text-blue-500 font-extrabold uppercase">User ID:</span>
                    <span>{currentUser?.id || 'usr-guest'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Wallet Info */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">WALLET</p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                ${(currentUser?.wallet_usd || walletData.balance_usd || 0).toFixed(2)}
              </p>
            </div>

            <div className="border-t border-slate-100" />

            {/* Nav Menu */}
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>ទិដ្ឋភាពទូទៅ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>ការបញ្ជាទិញ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>ប្រាក់ក្នុងគណនី</span>
              </button>

              <Link
                href="/lucky-draw"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-50 font-semibold transition-colors"
              >
                <Gift className="w-4 h-4 text-amber-600" />
                <span>រង្វាន់</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>ការកំណត់</span>
              </button>
            </nav>

            <div className="border-t border-slate-100" />

            {/* Partner Section */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">PARTNER</p>
              <Link
                href="/reseller"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
              >
                <Store className="w-4 h-4 text-blue-600" />
                <span>Reseller dashboard</span>
              </Link>
            </div>

            <div className="border-t border-slate-100" />

            {/* Actions */}
            <div className="space-y-1">
              <Link
                href="/games"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
              >
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Top up</span>
              </Link>

              {currentUser && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Log out</span>
                </button>
              )}
            </div>

          </aside>

          {/* Right Main Content Panel */}
          <div className="flex-1 w-full space-y-6">

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                      Hi, {currentUser?.username?.split(' ')[0] || 'Ratha'}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Your top-ups, live.
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Top 3 Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Card 1: Available Balance Banner */}
                  <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500">សមតុល្យដែលអាចប្រើបាន</p>
                      <p className="text-3xl font-black text-slate-900 font-mono mt-1">
                        ${(currentUser?.wallet_usd || walletData.balance_usd || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('wallet')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
                      >
                        + បញ្ចូលប្រាក់
                      </button>
                      
                      <Link
                        href="/games"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        ប្រើឥឡូវនេះ
                      </Link>
                    </div>
                  </div>

                  {/* Card 2: Orders Stats */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>ORDERS</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
                      {orders.length}
                    </p>
                  </div>

                  {/* Card 3: Delivered Stats */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>DELIVERED</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
                      {orders.filter(o => o.status === 'Completed' || o.status === 'delivered').length || 0}
                    </p>
                  </div>

                </div>

                {/* Card 4: Lucky Draw Banner */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-4.5 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">Lucky Draw</h2>
                      <p className="text-xs text-slate-600 font-normal mt-0.5">
                        បញ្ចូល ១ ដង = បង្វិល ១ ដង។ 9000 ពិន្ទុ = $1 ចូលគណនី។ 0 pts
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/lucky-draw"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-5 py-2 rounded-full shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    លេង
                  </Link>
                </div>

                {/* Card 5: Level & Rewards Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
                  
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">YOUR LEVEL</p>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Bronze</h2>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      1% back
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-extrabold text-slate-900">$25.00 more to Silver</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-amber-500 rounded-full w-[0%]" />
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      $0.00 spent so far. Levels are earned on delivered orders.
                    </p>
                  </div>

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-200">
                      Instant delivery
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-200">
                      Wallet refunds
                    </span>
                  </div>

                  {/* Action Button */}
                  <div>
                    <Link
                      href="/games"
                      className="bg-slate-900 hover:bg-black text-white font-black text-xs px-6 py-3 rounded-full shadow-xs transition-all inline-flex items-center justify-center cursor-pointer"
                    >
                      Top up and level up
                    </Link>
                  </div>

                </div>

                {/* Partner Accounts Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {language === 'km' ? 'គណនីដៃគូរួមគ្នា (Partner Accounts)' : 'Your partner accounts'}
                    </h2>
                    <span className="text-xs text-slate-500 font-normal ml-2">
                      {language === 'km' ? 'អ៊ីមែលដូចគ្នា ចុចតែម្តង' : 'Same email, one tap'}
                    </span>
                  </div>

                  {/* Grid 2 Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Partner Card 1: Reseller */}
                    {(() => {
                      const isApprovedReseller = currentUser?.role === 'reseller' || currentUser?.role === 'admin' || currentUser?.reseller_status === 'approved';
                      const isPendingReseller = currentUser?.reseller_status === 'pending';

                      return (
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                              <Store className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-extrabold text-slate-900">
                                  {language === 'km' ? 'ដៃគូលក់បន្ត (Reseller B2B)' : 'Reseller'}
                                </span>
                                {isApprovedReseller ? (
                                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>{language === 'km' ? 'បានតភ្ជាប់' : 'LINKED'}</span>
                                  </span>
                                ) : isPendingReseller ? (
                                  <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                    <span>{language === 'km' ? 'រង់ចាំអនុម័ត' : 'PENDING'}</span>
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                                    {language === 'km' ? 'មិនទាន់ស្នើសុំ' : 'NOT APPLIED'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-500 mt-0.5">
                                {currentUser?.username || 'Reseller Account'}
                              </p>
                              <p className="text-[11px] text-slate-400 font-normal">
                                {isApprovedReseller
                                  ? `$${(currentUser?.wallet_usd || 0).toFixed(2)} balance`
                                  : isPendingReseller
                                  ? (language === 'km' ? 'ពាក្យស្នើសុំកំពុងស្ថិតក្នុងការពិនិត្យពី Admin' : 'Application pending Admin review')
                                  : (language === 'km' ? 'ទទួលបានតម្លៃបោះដុំ B2B និងកូដ API' : 'Get wholesale B2B pricing & API access')}
                              </p>
                            </div>
                          </div>

                          {isApprovedReseller ? (
                            <Link
                              href="/reseller"
                              className="w-full bg-slate-900 hover:bg-black text-white font-black text-xs py-3 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>{language === 'km' ? 'បើកផ្ទាំងដៃគូលក់បន្ត' : 'Open Reseller dashboard'}</span>
                            </Link>
                          ) : isPendingReseller ? (
                            <div className="w-full bg-slate-100 text-slate-500 font-bold text-xs py-3 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{language === 'km' ? 'រង់ចាំការអនុម័តពី Admin' : 'Pending Admin Approval'}</span>
                            </div>
                          ) : (
                            <Link
                              href="/reseller"
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Store className="w-3.5 h-3.5" />
                              <span>{language === 'km' ? 'ស្នើសុំជាដៃគូលក់បន្ត (Apply)' : 'Apply for Reseller'}</span>
                            </Link>
                          )}
                        </div>
                      );
                    })()}

                    {/* Partner Card 2: Promoter / Creator */}
                    {(() => {
                      const promoterApp = promoterData?.application;
                      const promoterProf = promoterData?.promoter;
                      const isApprovedPromoter = promoterProf && promoterProf.status === 'approved';
                      const isPendingPromoter = promoterApp && promoterApp.status === 'pending' && !isApprovedPromoter;
                      const isRejectedPromoter = promoterApp && promoterApp.status === 'rejected' && !isApprovedPromoter;

                      return (
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                              <Crown className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-extrabold text-slate-900">
                                  {language === 'km' ? 'ដៃគូ Promoter (Earn Commissions)' : 'Become a Promoter'}
                                </span>
                                {isApprovedPromoter ? (
                                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>{language === 'km' ? 'បានអនុម័ត' : 'APPROVED'}</span>
                                  </span>
                                ) : isPendingPromoter ? (
                                  <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                    <span>{language === 'km' ? 'រង់ចាំពិនិត្យ' : 'PENDING'}</span>
                                  </span>
                                ) : isRejectedPromoter ? (
                                  <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                                    {language === 'km' ? 'បដិសេធ' : 'REJECTED'}
                                  </span>
                                ) : (
                                  <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                                    {language === 'km' ? 'មិនទាន់ស្នើសុំ' : 'NOT APPLIED'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                                {isApprovedPromoter
                                  ? `Code: ${promoterProf.referral_code} | Earned: $${(promoterProf.total_commission_usd || 0).toFixed(2)}`
                                  : language === 'km'
                                  ? 'ចែករំលែកកូដណែនាំ ឬ Link ដើម្បីទទួលបានកម្រៃជើងសាររាល់ពេលមានការទិញ Top-Up'
                                  : 'Share your code, earn commission on every top-up your audience makes.'}
                              </p>
                            </div>
                          </div>

                          <Link
                            href="/promoter"
                            className={`w-full font-bold text-xs py-3 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              isApprovedPromoter
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : isPendingPromoter
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                          >
                            {isApprovedPromoter ? (
                              <>
                                <Crown className="w-3.5 h-3.5" />
                                <span>{language === 'km' ? 'បើកផ្ទាំង Promoter' : 'Open Promoter Portal'}</span>
                              </>
                            ) : isPendingPromoter ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>{language === 'km' ? 'ពិនិត្យពាក្យស្នើសុំ' : 'Check Application Status'}</span>
                              </>
                            ) : (
                              <>
                                <span>{language === 'km' ? 'ស្នើសុំជា Promoter (Apply Now)' : 'Apply Now'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </Link>
                        </div>
                      );
                    })()}

                  </div>
                </div>

              </div>
            )}

            {/* Tab: Wallet */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Wallet
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Store credit from refunds. Spend it on any top-up.
                  </p>
                </div>

                {/* Card 1: Available Balance Banner */}
                <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <p className="text-xs font-black text-slate-400 tracking-wider uppercase">AVAILABLE BALANCE</p>
                    <p className="text-4xl font-black text-slate-900 font-mono mt-1">
                      ${(currentUser?.wallet_usd || walletData.balance_usd || 0).toFixed(2)}
                    </p>
                  </div>

                  <Link
                    href="/games"
                    className="bg-slate-900 hover:bg-black text-white font-extrabold text-sm px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Use it now</span>
                  </Link>
                </div>

                {/* Card 2: Add Funds */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
                  
                  {/* Title & Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add funds</h2>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        Pay once with ABA, then buy any pack in one tap — no QR each time.
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" />
                      <span>+5% first deposit</span>
                    </div>
                  </div>

                  {/* Preset Amount Pill Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {[5, 10, 20, 50, 100].map((amt) => {
                      const isSelected = selectedPreset === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setSelectedPreset(amt);
                            setDepositAmountInput(amt.toString());
                            setInlineQrData(null);
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border border-blue-600 shadow-2xs'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          ${amt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Amount Input & Pay Button Row */}
                  <div className="flex flex-col sm:flex-row items-end gap-3 pt-1">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Amount (USD)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={depositAmountInput}
                        onChange={(e) => {
                          setDepositAmountInput(e.target.value);
                          setSelectedPreset(parseFloat(e.target.value) || 0);
                          setInlineQrData(null);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-extrabold text-base focus:outline-none focus:border-blue-600 focus:bg-white"
                        placeholder="10"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateKHQR}
                      disabled={isGeneratingInline}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-7 py-3.5 rounded-2xl border border-blue-600 shadow-2xs transition-all shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isGeneratingInline ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <span>Pay ${(parseFloat(depositAmountInput) || 0).toFixed(2)}</span>
                      )}
                    </button>
                  </div>

                  {/* KHQR Modal Display */}
                  {inlineQrData && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-3">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>KHQR Fast Deposit</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setInlineQrData(null)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-3 bg-white rounded-2xl inline-block shadow-md border border-slate-200">
                        <img
                          src={inlineQrData.qr_image || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inlineQrData.qr_string || 'KHQR')}`}
                          alt="Bakong KHQR"
                          className="w-44 h-44 mx-auto object-contain"
                        />
                      </div>

                      <div>
                        <div className="text-xl font-black text-slate-900">${(parseFloat(depositAmountInput) || 0).toFixed(2)} USD</div>
                        <p className="text-xs text-slate-500 mt-1">Scan with ABA Mobile or any Bakong Bank App</p>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleCheckPaymentStatus}
                          disabled={isCheckingPayment}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          {isCheckingPayment ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>Check Payment Status</span>
                        </button>
                      </div>

                      {checkStatusMessage && (
                        <div className="text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                          {checkStatusMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary Breakdown */}
                  <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>You pay</span>
                      <span className="text-slate-900 font-bold font-mono">${currentAmountNum.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-emerald-600">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>First deposit bonus +5%</span>
                      </span>
                      <span className="font-bold font-mono">+${bonusAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-900 font-extrabold text-sm border-t border-slate-100 pt-2.5">
                      <span>Added to wallet</span>
                      <span className="font-mono text-slate-900">${totalReceived.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Subtext */}
                  <p className="text-[11px] text-slate-500 font-normal">
                    Deposit $100.00 more in total to unlock Reseller pricing automatically.
                  </p>

                </div>

                {/* Card 3: Callout Notice */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 text-xs text-slate-600 font-normal flex items-start gap-3 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    When a top-up cannot be delivered, the full amount comes back here automatically — usually within a minute. Balance is store credit and is not paid out to a bank.
                  </p>
                </div>

                {/* Card 4: History */}
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-3">History</h2>
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-medium shadow-xs">
                    No wallet activity yet.
                  </div>
                </div>

              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Settings
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Your sign-in methods and profile.
                  </p>
                </div>

                {/* Card 1: Profile Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Profile</h2>

                  {/* Display Name Input & Save Button */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Display name
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                        placeholder="Ratha Dararath"
                      />
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="bg-slate-900 hover:bg-black text-white font-black text-xs px-6 py-3 rounded-2xl transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save'}
                      </button>
                    </div>

                    {profileSaveSuccess && (
                      <p className="text-xs font-bold text-emerald-600 mt-2">
                        Profile updated successfully!
                      </p>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">EMAIL</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {currentUser?.email || 'rathadararath8@gmail.com'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">MEMBER SINCE</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        9/21/2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Sign-in Methods */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Sign-in methods</h2>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Link both so you can always get back in. No passwords are stored.
                    </p>
                  </div>

                  <div className="space-y-3">
                    
                    {/* Google Row */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-sm shadow-2xs">
                          G
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">Google</p>
                          <p className="text-[11px] text-slate-500 font-normal">
                            {currentUser?.email || 'rathadararath8@gmail.com'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>Linked</span>
                      </div>
                    </div>

                    {/* Telegram Row */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-2xs">
                          <Send className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">Telegram</p>
                          <p className="text-[11px] text-slate-500 font-normal">
                            {currentUser?.telegram_username ? `@${currentUser.telegram_username}` : 'Not linked'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowTelegramModal(!showTelegramModal)}
                        className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        {currentUser?.telegram_username ? 'Manage Telegram' : 'Link Telegram'}
                      </button>
                    </div>

                    {/* Inline Telegram Form */}
                    {showTelegramModal && (
                      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-3 animate-in fade-in">
                        <p className="text-xs font-bold text-slate-900">បញ្ចូលលេខកូដ Verification Code ពី Telegram Bot</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={telegramCodeInput}
                            onChange={(e) => setTelegramCodeInput(e.target.value)}
                            placeholder="បញ្ចូល Verification Code"
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                          />
                          <button
                            type="button"
                            onClick={handleLinkTelegram}
                            disabled={isLinkingTelegram}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors disabled:opacity-50"
                          >
                            {isLinkingTelegram ? 'កំពុងភ្ជាប់...' : 'ភ្ជាប់'}
                          </button>
                        </div>
                        {telegramLinkStatus && (
                          <p className={`text-xs font-bold ${telegramLinkStatus.success ? 'text-emerald-600' : 'text-red-600'}`}>
                            {telegramLinkStatus.message}
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Notifications Header */}
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Notifications</h2>
                </div>

                {/* Card 3: Security Section */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Security</h2>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Signed in somewhere you do not recognise? Sign out everywhere at once.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-5 py-2.5 rounded-2xl border border-red-200 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out everywhere</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">ការបញ្ជាទិញ</h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    ប្រវត្តិប្រតិបត្តិការបញ្ជាទិញហ្គេមរបស់អ្នក
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">
                      មិនទាន់មានប្រវត្តិបញ្ជាទិញនៅឡើយទេ
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div key={o.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{o.item_name || 'Game TopUp'}</p>
                            <p className="text-slate-500 text-[11px]">ID: {o.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-slate-900">${(o.price_usd || 0).toFixed(2)}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              {o.status || 'Completed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
