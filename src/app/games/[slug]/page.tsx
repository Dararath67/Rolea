'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KHQRPaymentModal from '@/components/KHQRPaymentModal';
import WalletDepositModal from '@/components/WalletDepositModal';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  ArrowLeft, 
  CreditCard, 
  UserCheck, 
  Check, 
  ChevronRight,
  Flame,
  Sparkles,
  Tag,
  X,
  Percent,
  RefreshCw,
  AlertCircle,
  Wallet
} from 'lucide-react';

export default function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { language, currency, formatPrice, t } = useLanguage();

  const [game, setGame] = useState<any | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [playerInput, setPlayerInput] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [customerContact, setCustomerContact] = useState('');

  // User & Wallet States
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0.0);
  const [isWalletDepositOpen, setIsWalletDepositOpen] = useState(false);
  const [isProcessingWallet, setIsProcessingWallet] = useState(false);

  // Discount & Coupon Code States
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Nickname checker
  const [isValidating, setIsValidating] = useState(false);
  const [verifiedNickname, setVerifiedNickname] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Payment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        let loggedUser: any = null;
        let currentBal = 0.0;
        try {
          const stored = localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user');
          if (stored) {
            loggedUser = JSON.parse(stored);
            currentBal = typeof loggedUser.wallet_usd === 'number' ? loggedUser.wallet_usd : 0.0;
          }
        } catch (e) {}

        setCurrentUser(loggedUser);
        setUserBalance(currentBal);

        const [gameRes, payRes] = await Promise.all([
          fetch(`/api/v1/games/${resolvedParams.slug}`).catch(() => null),
          fetch('/api/v1/payment-methods').catch(() => null)
        ]);

        if (gameRes && gameRes.ok) {
          const gameData = await gameRes.json().catch(() => null);
          if (gameData && gameData.success && gameData.data) {
            setGame(gameData.data);
            const popularPkg = gameData.data.packages?.find((p: any) => p.popular) || gameData.data.packages?.[0];
            setSelectedPackage(popularPkg || null);
          }
        }

        let rawPayMethods: any[] = [];
        if (payRes && payRes.ok) {
          const payData = await payRes.json().catch(() => null);
          if (payData && payData.success && payData.data) {
            rawPayMethods = payData.data.filter((p: any) => p.id !== 'wallet');
          }
        }

        if (loggedUser) {
          const walletPayOption = {
            id: 'wallet',
            name_en: 'Rolea Wallet (1-Click Instant Balance Pay)',
            name_km: 'Rolea Wallet (កាត់ប្រាក់ពីសមតុល្យ ១-Click)',
            badge_en: `Balance: $${currentBal.toFixed(2)}`,
            badge_km: `សមតុល្យ: $${currentBal.toFixed(2)}`,
            fee_percent: 0
          };
          const allMethods = [walletPayOption, ...rawPayMethods];
          setPaymentMethods(allMethods);
          setSelectedPayment(allMethods[0] || null);
        } else {
          // Guest User (Not logged in) -> Standard KHQR Flow Only
          setPaymentMethods(rawPayMethods);
          setSelectedPayment(rawPayMethods[0] || null);
        }
      } catch (err) {
        console.error('Error loading game topup page data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [resolvedParams.slug]);

  const handleInputChange = (fieldId: string, val: string) => {
    setPlayerInput(prev => ({ ...prev, [fieldId]: val }));
    setVerifiedNickname(null);
    setAccountError(null);
  };

  const handleCheckAccount = async () => {
    if (!game) return;
    const missing = game.fields.some((f: any) => f.required && !playerInput[f.id]?.trim());
    if (missing) {
      const msg = language === 'km' ? 'សូមបំពេញព័ត៌មានគណនីឱ្យបានត្រឹមត្រូវជាមុនសិន' : 'Please enter your account ID field(s) first.';
      setAccountError(msg);
      setVerifiedNickname(null);
      return;
    }

    setIsValidating(true);
    setAccountError(null);
    try {
      const res = await fetch(`/api/v1/games/${resolvedParams.slug}/check-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerInput)
      });
      const data = await res.json();
      const foundName = data.nickname || data.gamer_name || data.playerName || '';
      const isAuthentic = foundName && !foundName.toLowerCase().startsWith('player (') && !foundName.toLowerCase().startsWith('gamer (') && foundName !== 'Verified Gamer';
      const isSuccess = res.ok && data.success && (data.verified || data.valid) && isAuthentic;
      if (isSuccess) {
        setVerifiedNickname(foundName);
        setAccountError(null);
      } else {
        setVerifiedNickname(null);
        setAccountError(data.detail || data.message || (language === 'km' ? 'គណនី ID មិនត្រឹមត្រូវ ឬរកមិនឃើញឈ្មោះអ្នកលេង' : 'Invalid player account ID. Please re-check.'));
      }
    } catch (e) {
      setVerifiedNickname(null);
      setAccountError(language === 'km' ? 'មិនអាចផ្ទៀងផ្ទាត់ឈ្មោះបានទេ សូមព្យាយាមម្តងទៀត' : 'Failed to check account. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const baseAmt = selectedPackage ? selectedPackage.price_user_usd : 0;
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          amount_usd: baseAmt,
          game_slug: resolvedParams.slug
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.data) {
        setAppliedCoupon(data.data);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.detail || (language === 'km' ? 'កូដមិនត្រឹមត្រូវ ឬផុតកំណត់' : 'Invalid or expired discount code'));
      }
    } catch (e) {
      setAppliedCoupon(null);
      setCouponError(language === 'km' ? 'មិនអាចផ្ទៀងផ្ទាត់កូដបានទេ' : 'Unable to validate code. Please try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handleProceedCheckout = async () => {
    if (!game || !selectedPackage || !selectedPayment) return;

    for (const field of game.fields) {
      if (field.required && !playerInput[field.id]?.trim()) {
        const fieldLabel = language === 'km' ? field.label_km : field.label_en;
        const msg = language === 'km' ? `សូមបញ្ចូល ${fieldLabel}` : `Please enter ${fieldLabel}`;
        setAccountError(msg);
        const el = document.getElementById(`field-${field.id}`);
        if (el) el.focus();
        return;
      }
    }

    if (!verifiedNickname) {
      setIsValidating(true);
      setAccountError(null);
      try {
        const res = await fetch(`/api/v1/games/${resolvedParams.slug}/check-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerInput)
        });
        const data = await res.json().catch(() => ({}));
        const foundName = data.nickname || data.gamer_name || data.playerName || '';
        const isAuthentic = foundName && !foundName.toLowerCase().startsWith('player (') && !foundName.toLowerCase().startsWith('gamer (') && foundName !== 'Verified Gamer';
        const isSuccess = res.ok && data.success && (data.verified || data.valid) && isAuthentic;
        if (isSuccess) {
          setVerifiedNickname(foundName);
          setAccountError(null);
        } else {
          setVerifiedNickname(null);
          setAccountError(data.detail || data.message || (language === 'km' ? 'គណនី ID មិនត្រឹមត្រូវ ឬរកមិនឃើញឈ្មោះអ្នកលេង' : 'Invalid player account ID. Please re-check.'));
          return;
        }
      } catch (e) {
        // Continue if check endpoint error
      } finally {
        setIsValidating(false);
      }
    }

    // 1-Click Rolea Wallet Direct Checkout
    if (currentUser && selectedPayment?.id === 'wallet') {
      if (userBalance < priceUsd) {
        setIsWalletDepositOpen(true);
        return;
      }
      setIsProcessingWallet(true);
      try {
        const refCode = typeof window !== 'undefined' ? localStorage.getItem("rolea_ref_code") : null;
        const orderPayload = {
          game_slug: game.slug,
          product_id: selectedPackage.id,
          player_id: playerInput.player_id || playerInput.user_id || Object.values(playerInput)[0] || "123456",
          server_id: playerInput.server_id || playerInput.zone_id || "",
          currency: currency,
          payment_method_id: "wallet",
          customer_contact: customerContact || currentUser.email || `${currentUser.username}@roleatopup.com`,
          user_id: currentUser.id || currentUser.username,
          coupon_code: appliedCoupon?.code || undefined,
          referral_code: refCode || undefined
        };

        const res = await fetch('/api/v1/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });

        const data = await res.json();
        if (data.success && data.data) {
          const newBal = Math.max(0, Math.round((userBalance - priceUsd) * 100) / 100);
          setUserBalance(newBal);
          try {
            const updated = { ...currentUser, wallet_usd: newBal };
            setCurrentUser(updated);
            localStorage.setItem('rothz_user', JSON.stringify(updated));
            localStorage.setItem('rolea_user', JSON.stringify(updated));
          } catch (e) {}
          router.push(`/order/${data.data.id}`);
          return;
        } else {
          setAccountError(data.detail || (language === 'km' ? 'បរាជ័យក្នុងការកាត់ប្រាក់' : 'Payment failed'));
        }
      } catch (err) {
        console.error('Wallet order failed:', err);
        setAccountError(language === 'km' ? 'បញ្ហាការតភ្ជាប់ សូមព្យាយាមម្តងទៀត' : 'Connection error. Please try again.');
      } finally {
        setIsProcessingWallet(false);
      }
      return;
    }

    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading RoleaTopup...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black mb-2 text-slate-900">
            {language === 'km' ? 'ហ្គេមមិនទាន់បើកដំណើរការ ឬរកមិនឃើញ' : 'Game Unavailable or Unpublished'}
          </h2>
          <p className="text-xs text-slate-500 mb-6 max-w-xs">
            {language === 'km' 
              ? 'ហ្គេមនេះបច្ចុប្បន្នកំពុងស្ថិតក្នុងការថែទាំ ឬមិនទាន់បានផ្សាយជាសាធារណៈដោយ Admin ទេ។' 
              : 'This game is currently unpublished or temporarily undergoing catalog maintenance.'}
          </p>
          <Link href="/games" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors">
            {language === 'km' ? 'ត្រឡប់ទៅបញ្ជីហ្គេមទាំងអស់' : 'Browse All Active Games'}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = language === 'km' ? game.name_km : game.name_en;
  const subtitle = language === 'km' ? game.subtitle_km : game.subtitle_en;
  const guide = language === 'km' ? game.guide_km : game.guide_en;
  const rawPriceUsd = selectedPackage ? selectedPackage.price_user_usd : 0;
  const discountAmountUsd = appliedCoupon ? Math.round((rawPriceUsd * (appliedCoupon.discount_percent / 100.0)) * 100) / 100 : 0;
  const priceUsd = Math.max(0, Math.round((rawPriceUsd - discountAmountUsd) * 100) / 100);
  const priceKhr = Math.round(priceUsd * 4100);



  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.storefront}
          </Link>
          <span>/</span>
          <Link href="/games" className="hover:text-blue-600">{t.allGames}</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Game Info & Instruction Guide */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 overflow-hidden relative shadow-xs">
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-slate-100 border border-slate-200 flex items-center justify-center">
                <img
                  src={game.thumbnail || game.banner}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 text-[10px] font-bold text-white shadow-xs border border-white/10">
                  {game.region}
                </div>
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                {game.publisher}
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">{title}</h1>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">{subtitle}</p>

              {/* Guarantees */}
              <div className="space-y-3 pt-4 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>{language === 'km' ? 'បញ្ចូលផ្ទាល់ទៅក្នុងគណនីក្នុងរយៈពេល ៣០ វិនាទី' : 'Instant delivery in under 30 seconds'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>{language === 'km' ? 'សុវត្ថិភាព ១០០% មិនទាមទារ Password ឡើយ' : '100% Official partner API (No password)'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span>{language === 'km' ? 'ទូទាត់តាម Bakong KHQR, ABA, Wing, ACLEDA' : 'Bakong KHQR & Cambodian Mobile Banking'}</span>
                </div>
              </div>

              {/* Instructions Guide */}
              {guide && (
                <div className="mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-950">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-700">
                    <HelpCircle className="w-4 h-4" />
                    <span>{language === 'km' ? 'របៀបស្វែងរក User ID & Server' : 'How to find your Player ID?'}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">{guide}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 4-Step Top-Up Ordering Flow */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: Account Information (Sabay Store Flow) */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{t.stepAccountInfo}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'km' ? 'សូមបំពេញ User ID និង Zone ID របស់អ្ន' : 'Enter Player UID and Server ID'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {game.fields.map((field: any) => {
                  const label = language === 'km' ? field.label_km : field.label_en;
                  const placeholder = language === 'km' ? field.placeholder_km : field.placeholder_en;
                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        id={`field-${field.id}`}
                        type={field.type || 'text'}
                        value={playerInput[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-600 shadow-xs"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Sabay Store-style Gamer Verification Button & Result Badge */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleCheckAccount}
                    disabled={isValidating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all disabled:opacity-50"
                  >
                    <UserCheck className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                    <span>{isValidating ? (language === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Checking Name...') : (language === 'km' ? 'ពិនិត្យមើលឈ្មោះ' : 'Check Name')}</span>
                  </button>
                </div>

                {/* Confirmed Sabay-style Badge */}
                {verifiedNickname && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span>Confirmed: <span className="text-slate-900 font-extrabold">{verifiedNickname}</span></span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-200/80 text-[10px] font-black text-emerald-900 uppercase tracking-wider">
                      {game.region || 'VERIFIED'}
                    </span>
                  </div>
                )}

                {accountError && (
                  <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-800 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-red-600 font-black text-sm">
                      <span>{language === 'km' ? 'មិនអាចផ្ទៀងផ្ទាត់ឈ្មោះបានទេ' : 'Unable to verify player'}</span>
                    </div>
                    <p className="font-medium text-red-700">
                      {accountError}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: Select Package */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{t.stepSelectPackage}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'km' ? 'ជ្រើសរើសចំនួនកញ្ចប់ដែលចង់បាន' : `Choose denomination of ${game.currency_name_en}`}
                  </p>
                </div>
              </div>

              {/* MLBB In-Game Event Recharge Guide Banner */}
              {((resolvedParams.slug || '').toLowerCase().includes('mlbb') || (game.name_en || '').toLowerCase().includes('mobile legends')) && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 flex items-start gap-3 shadow-2xs">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white font-black shrink-0">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>
                  <div className="text-xs">
                    <div className="font-black text-slate-900 text-sm mb-1">
                      {language === 'km' ? 'ណែនាំសម្រាប់ Event Recharge ក្នុងហ្គេម MLBB' : 'MLBB In-Game Event Recharge Guide'}
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {language === 'km'
                        ? 'ដើម្បីទទួលបាន Full Tickets ក្នុង Event ហ្គេម MLBB (ត្រូវការ ២៥០ ពេជ្រដើម)៖ អ្នកអាចទិញ Weekly Diamond Pass (រាប់ ១០០ ពេជ្រដើម/សំបុត្រ) ឬ បញ្ចូលកញ្ចប់ ២៥៧ / ៣៤៣ ពេជ្រ ទទួលបាន Ticket គ្រប់ ១០០%!'
                        : 'To get Full Event Tickets (250 Base Diamonds required): Top up 2x Weekly Pass (counts as 200 base diamonds) + 55 Diamonds, or purchase 257 / 343 Diamonds package!'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {game.packages.map((pkg: any) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const pkgName = language === 'km' ? pkg.name_km : pkg.name_en;
                  const bonus = language === 'km' ? (pkg.bonus_km || pkg.bonus_en) : pkg.bonus_en;

                  const isMLBB = (resolvedParams.slug || '').toLowerCase().includes('mlbb') || (game.name_en || '').toLowerCase().includes('mobile legends');
                  const isEventPkg = isMLBB && (
                    pkgName.toLowerCase().includes('weekly') ||
                    pkgName.includes('257') ||
                    pkgName.includes('343') ||
                    pkgName.includes('565') ||
                    pkg.id?.includes('257') ||
                    pkg.id?.includes('343')
                  );

                  const getCurrencyLogo = (slug: string, name: string = '', pkgId: string = '') => {
                    const s = (slug || '').toLowerCase();
                    const n = (name || '').toLowerCase();
                    const id = (pkgId || '').toLowerCase();

                    // 1. Weekly Pass & Bundles from Kira Game Store
                    if (n.includes('weekly') || id.includes('weekly')) {
                      if (n.includes('5x') || id.includes('weeklyx5')) return '/images/packages/weekly-5.png';
                      if (n.includes('4x') || id.includes('weeklyx4')) return '/images/packages/weekly-4.png';
                      if (n.includes('3x') || id.includes('weeklyx3')) return '/images/packages/weekly-3.png';
                      if (n.includes('2x') || id.includes('weeklyx2')) return '/images/packages/weekly-2.png';
                      if (n.includes('elite') || id.includes('elite')) return '/images/packages/weekly-elite.jpg';
                      if (s.includes('free-fire') || s.includes('ff') || s.includes('freefire')) return '/images/currencies/freefire-weekly.png';
                      return '/images/packages/weekly-1.png';
                    }
                    if (n.includes('twilight') || id.includes('twilight')) return '/images/packages/twilight-pass.png';
                    if (n.includes('monthly') || id.includes('monthly')) return '/images/packages/monthly-epic.jpg';

                    // 2. Specific Diamond Denomination Chests from Kira Game Store
                    const numMatch = n.match(/\d+/);
                    const diaNum = numMatch ? numMatch[0] : '';
                    const knownPacks: Record<string, string> = {
                      '55': '/images/packages/diamond-55.png',
                      '86': '/images/packages/diamond-86.png',
                      '165': '/images/packages/diamond-165.png',
                      '172': '/images/packages/diamond-172.png',
                      '257': '/images/packages/diamond-257.png',
                      '312': '/images/packages/diamond-343.png',
                      '343': '/images/packages/diamond-343.png',
                      '565': '/images/packages/diamond-565.png',
                      '706': '/images/packages/diamond-706.png',
                      '792': '/images/packages/diamond-792.png',
                      '1049': '/images/packages/diamond-1049.png',
                      '1412': '/images/packages/diamond-1412.png',
                      '1755': '/images/packages/diamond-1755.png',
                      '2195': '/images/packages/diamond-2195.png',
                      '2901': '/images/packages/diamond-2901.png',
                      '3688': '/images/packages/diamond-3688.png',
                      '4394': '/images/packages/diamond-4394.png',
                      '5532': '/images/packages/diamond-5532.png',
                      '6238': '/images/packages/diamond-6238.png',
                      '9288': '/images/packages/diamond-9288.png',
                    };

                    if (diaNum && knownPacks[diaNum]) {
                      return knownPacks[diaNum];
                    }

                    // 3. Fallback Currencies
                    if (s.includes('free-fire') || s.includes('ff') || s.includes('freefire')) return '/images/currencies/freefire-diamond.png';
                    if (s.includes('pubg')) return '/images/currencies/pubg-uc.png';
                    if (s.includes('hok') || s.includes('honor')) return '/images/currencies/hok-token.png';
                    if (s.includes('roblox')) return '/images/currencies/roblox-robux.png';
                    return '/images/currencies/mlbb-diamond.png';
                  };

                  const isWeeklyPass = pkgName.toLowerCase().includes('weekly') || pkg.id?.toLowerCase().includes('weekly');

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative flex flex-col p-4 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-sm -translate-y-0.5'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {(pkg.popular || isEventPkg) && (
                        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase shadow-xs">
                          {isEventPkg ? 'EVENT TASK' : isWeeklyPass ? 'BEST SELLING' : 'POPULAR'}
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 p-1 shrink-0 shadow-2xs overflow-hidden">
                          <img 
                            src={getCurrencyLogo(resolvedParams.slug, pkgName, pkg.id)} 
                            alt={pkgName} 
                            className="w-full h-full object-contain drop-shadow-sm transition-transform hover:scale-110" 
                          />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{pkgName}</span>
                      </div>

                      {bonus && (
                        <div className="text-[10px] font-bold text-emerald-600 mb-1">
                          {bonus}
                        </div>
                      )}

                      {isEventPkg && (
                        <div className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block mb-2 w-fit">
                          {language === 'km' ? 'គ្រប់គ្រាន់សម្រាប់ Event Task' : 'Counts for Event Tasks'}
                        </div>
                      )}

                      <div className="mt-auto pt-2 flex flex-col border-t border-slate-100">
                        <span className="text-sm sm:text-base font-black text-blue-600">
                          {formatPrice(pkg.price_user_usd)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ≈ ៛{Math.round(pkg.price_user_usd * 4100).toLocaleString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: Payment Method */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{t.stepPaymentMethod}</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {language === 'km' ? 'ជ្រើសរើសវិធីសាស្ត្រទូទាត់ដែលអ្នកពេញចិត្ត' : 'Select payment option'}
                    </p>
                  </div>
                </div>

                {/* Logged in User Wallet Balance Widget */}
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setIsWalletDepositOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span>{language === 'km' ? `សមតុល្យ: $${userBalance.toFixed(2)}` : `Balance: $${userBalance.toFixed(2)}`}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black">+ បញ្ចូលលុយ</span>
                  </button>
                )}
              </div>

              {/* Logged in User Balance Status Card */}
              {currentUser && selectedPayment?.id === 'wallet' && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  userBalance >= priceUsd 
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        userBalance >= priceUsd ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black">
                          {userBalance >= priceUsd 
                            ? (language === 'km' ? `សមតុល្យគ្រប់គ្រាន់ ($${userBalance.toFixed(2)}) សម្រាប់ទូទាត់ 1-Click` : `Sufficient balance ($${userBalance.toFixed(2)}) for 1-Click Instant Pay`)
                            : (language === 'km' ? `សមតុល្យខ្វះ $${(priceUsd - userBalance).toFixed(2)} (មាន $${userBalance.toFixed(2)} / ត្រូវការ $${priceUsd.toFixed(2)})` : `Insufficient balance ($${userBalance.toFixed(2)} / Need $${priceUsd.toFixed(2)})`)
                          }
                        </div>
                        <div className="text-[11px] opacity-80 font-medium">
                          {userBalance >= priceUsd 
                            ? (language === 'km' ? 'ប្រព័ន្ធនឹងកាត់ប្រាក់ចេញពីគណនីរបស់អ្នកភ្លាមៗ ដោយមិនបាច់ស្កេន KHQR ម្តងទៀតឡើយ' : 'Funds will be deducted from your account balance instantly with zero QR scanning needed.')
                            : (language === 'km' ? 'សូមចុចប៊ូតុងខាងស្តាំដើម្បីបញ្ចូលលុយតាម KHQR ឬ ជ្រើសរើសទូទាត់តាម KHQR ផ្ទាល់' : 'Please deposit funds via KHQR or choose direct KHQR payment.')
                          }
                        </div>
                      </div>
                    </div>

                    {userBalance < priceUsd && (
                      <button
                        type="button"
                        onClick={() => setIsWalletDepositOpen(true)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shrink-0 shadow-xs transition-colors cursor-pointer"
                      >
                        {language === 'km' ? '+ បញ្ចូលលុយ (Deposit)' : '+ Deposit Funds'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((m: any) => {
                  const isSelected = selectedPayment?.id === m.id;
                  const name = language === 'km' ? m.name_km : m.name_en;
                  const badge = language === 'km' ? (m.badge_km || m.badge_en) : m.badge_en;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedPayment(m)}
                      className={`relative flex items-center gap-3.5 p-4 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-800 border border-slate-200 shrink-0">
                        {m.id === 'wallet' ? <Wallet className="w-5 h-5 text-blue-600" /> : m.id === 'bakong_khqr' ? 'KHQR' : m.id === 'aba_pay' ? 'ABA' : m.id === 'wing_pay' ? 'WING' : m.id === 'acleda_pay' ? 'ACLEDA' : 'PAY'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {m.id === 'wallet' ? (
                            <span className="text-blue-600 font-bold">1-Click Instant Deduction</span>
                          ) : m.fee_percent === 0 ? (
                            <span className="text-emerald-600 font-bold">0% Fee (Free)</span>
                          ) : (
                            <span>Fee: {m.fee_percent}%</span>
                          )}
                        </div>
                      </div>

                      {badge && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[9px] font-black text-blue-700 shrink-0">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: Discount & Promo Code (កូដបញ្ចុះតម្លៃ) */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  4
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {language === 'km' ? 'កូដបញ្ចុះតម្លៃ (Discount & Promo Code)' : 'Discount & Promo Code'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'km' ? 'បញ្ចូលកូដប្រូម៉ូសិនដើម្បីទទួលបានការបញ្ចុះតម្លៃពិសេស' : 'Have a promo or voucher code? Enter it below'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    value={couponInput}
                    disabled={!!appliedCoupon}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    placeholder={language === 'km' ? 'ឧទាហរណ៍៖ ROTHZ10, FLASH50, WELCOME' : 'e.g. ROTHZ10, FLASH50, WELCOME'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white uppercase tracking-wider"
                  />
                </div>

                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-5 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>{language === 'km' ? 'លុបកូដ' : 'Remove Code'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isValidatingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                    <span>{isValidatingCoupon ? (language === 'km' ? 'កំពុងពិនិត្យ...' : 'Checking...') : (language === 'km' ? 'អនុវត្តកូដ' : 'Apply Code')}</span>
                  </button>
                )}
              </div>

              {/* Applied Coupon Success Card */}
              {appliedCoupon && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-emerald-900">
                        {language === 'km' ? `កូដ '${appliedCoupon.code}' ត្រូវបានអនុវត្តជោគជ័យ!` : `Coupon '${appliedCoupon.code}' Applied!`}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium block">
                        {language === 'km' ? `ទទួលបានការបញ្ចុះតម្លៃ ${appliedCoupon.discount_percent}% (-$${discountAmountUsd.toFixed(2)})` : `You saved ${appliedCoupon.discount_percent}% (-$${discountAmountUsd.toFixed(2)})`}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-200/80 text-[10px] font-black text-emerald-900 uppercase">
                    -{appliedCoupon.discount_percent}% OFF
                  </span>
                </div>
              )}

              {/* Coupon Error Banner */}
              {couponError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* Sticky summary bar */}
            <div className="rounded-3xl bg-white border-2 border-blue-600 p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span>{language === 'km' ? 'កញ្ចប់ជ្រើសរើស' : 'Selected'}:</span>
                  <span className="font-bold text-slate-900">{language === 'km' ? selectedPackage?.name_km : selectedPackage?.name_en}</span>
                  {appliedCoupon && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      Code: {appliedCoupon.code} (-{appliedCoupon.discount_percent}%)
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs text-slate-500 font-semibold">{t.totalAmount}:</span>
                  {appliedCoupon && (
                    <span className="text-sm font-bold text-slate-400 line-through">
                      ${rawPriceUsd.toFixed(2)}
                    </span>
                  )}
                  <span className="text-3xl font-black text-blue-600">${priceUsd.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-500">
                    (≈ ៛{priceKhr.toLocaleString()} KHR)
                  </span>
                  {appliedCoupon && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      Save ${discountAmountUsd.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedCheckout}
                disabled={isProcessingWallet || isValidating}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 ${
                  currentUser && selectedPayment?.id === 'wallet'
                    ? userBalance >= priceUsd 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessingWallet ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                ) : currentUser && selectedPayment?.id === 'wallet' ? (
                  <Wallet className="w-5 h-5 fill-white" />
                ) : (
                  <Zap className="w-5 h-5 fill-white" />
                )}
                
                <span>
                  {isProcessingWallet 
                    ? (language === 'km' ? 'កំពុងកាត់ប្រាក់ & បញ្ចូលពេជ្រ...' : 'Processing 1-Click Top-Up...')
                    : currentUser && selectedPayment?.id === 'wallet'
                      ? userBalance >= priceUsd
                        ? (language === 'km' ? `កាត់ប្រាក់ពីសមតុល្យ ($${priceUsd.toFixed(2)}) - បញ្ជាក់ទិញ 1-Click` : `Pay with Wallet ($${priceUsd.toFixed(2)}) - 1-Click`)
                        : (language === 'km' ? `សមតុល្យមិនគ្រប់ - ចុចបញ្ចូលលុយ (Deposit)` : `Insufficient Balance - Deposit Funds`)
                      : (language === 'km' ? `ទូទាត់តាម KHQR ($${priceUsd.toFixed(2)})` : `Pay with KHQR ($${priceUsd.toFixed(2)})`)
                  }
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* KHQR Bakong Payment Modal */}
      {selectedPackage && selectedPayment && (
        <KHQRPaymentModal
          game={game}
          selectedPackage={selectedPackage}
          selectedPayment={selectedPayment}
          playerInput={playerInput}
          customerContact={customerContact}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          couponCode={appliedCoupon?.code}
          discountPercent={appliedCoupon?.discount_percent}
          discountAmountUsd={discountAmountUsd}
          finalPriceUsd={priceUsd}
        />
      )}

      {/* Rolea Wallet Deposit Modal */}
      <WalletDepositModal
        isOpen={isWalletDepositOpen}
        onClose={() => setIsWalletDepositOpen(false)}
        initialAmount={Math.max(1.0, Math.ceil(priceUsd - userBalance))}
        onDepositSuccess={(newBal) => {
          setUserBalance(newBal);
          setIsWalletDepositOpen(false);
        }}
      />
    </div>
  );
}
