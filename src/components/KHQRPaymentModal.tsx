'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { 
  X, 
  Clock, 
  Copy, 
  CheckCircle2, 
  Download, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  Globe
} from 'lucide-react';

interface KHQRPaymentModalProps {
  game: any;
  selectedPackage: any;
  selectedPayment: any;
  playerInput: Record<string, string>;
  customerContact: string;
  isOpen: boolean;
  onClose: () => void;
  couponCode?: string;
  discountPercent?: number;
  discountAmountUsd?: number;
  finalPriceUsd?: number;
}

export default function KHQRPaymentModal({
  game,
  selectedPackage,
  selectedPayment,
  playerInput,
  customerContact,
  isOpen,
  onClose,
  couponCode,
  discountPercent,
  discountAmountUsd,
  finalPriceUsd
}: KHQRPaymentModalProps) {
  const router = useRouter();
  const { language, setLanguage, currency, formatPrice, t } = useLanguage();
  const isKm = language === 'km';

  const [timeLeft, setTimeLeft] = useState(300);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQR, setLoadingQR] = useState(true);
  
  // VngZz PayWay Live Data
  const [transactionId, setTransactionId] = useState<string>('');
  const [qrImage, setQrImage] = useState<string>('');
  const [qrString, setQrString] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [paymentPaid, setPaymentPaid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawPriceUsd = selectedPackage?.price_user_usd || 0;
  const priceUsd = finalPriceUsd !== undefined ? finalPriceUsd : rawPriceUsd;
  const priceKhr = Math.round(priceUsd * 4100);

  // Initialize and Generate Live VngZz PayWay QR
  const initPayment = async () => {
    try {
      setLoadingQR(true);
      setTimeLeft(300);
      setPaymentPaid(false);
      
      // Step 1: Extract logged in user if available
      let loggedUser: any = null;
      try {
        const storedStr = typeof window !== 'undefined' ? (localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user')) : null;
        if (storedStr) loggedUser = JSON.parse(storedStr);
      } catch (e) {}

      const contact = customerContact?.trim() || loggedUser?.email || loggedUser?.phone || loggedUser?.username || "customer@example.com";

      const refCode = typeof window !== 'undefined' ? localStorage.getItem("rolea_ref_code") : null;

      // Step 1: Create Order in system
      const orderPayload = {
        game_slug: game.slug,
        product_id: selectedPackage.id,
        player_id: playerInput.player_id || playerInput.user_id || Object.values(playerInput)[0] || "123456",
        server_id: playerInput.server_id || playerInput.zone_id || "",
        currency: currency,
        payment_method_id: selectedPayment.id || "vngzz2game",
        customer_contact: contact,
        user_id: loggedUser?.id || undefined,
        coupon_code: couponCode || undefined,
        referral_code: refCode || undefined
      };

      const orderRes = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      }).catch(() => null);

      const orderData = orderRes && orderRes.ok ? await orderRes.json().catch(() => ({})) : {};
      
      const createdOrderId = orderData.data?.id || `ORD-${Date.now()}`;
      setOrderId(createdOrderId);

      // Step 2: Call VngZz PayWay QR generator
      const qrRes = await fetch('/api/v1/payments/vngzz/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: priceUsd,
          currency: 'USD',
          order_id: createdOrderId,
          idempotency_key: createdOrderId
        })
      }).catch(() => null);

      const qrData = qrRes && qrRes.ok ? await qrRes.json().catch(() => ({})) : {};
      if (qrData.success || qrData.transaction_id) {
        setTransactionId(qrData.transaction_id || createdOrderId);
        setQrImage(qrData.qr_image || '');
        setQrString(qrData.qr_string || '');
        setDeepLink(qrData.deep_link || `abamobilebank://ababank.com?type=payway&qrcode=${qrData.qr_string || ''}`);
        setTimeLeft(Math.max(qrData.expire_in_sec || 300, 300));
      } else {
        // Fallback QR
        setTransactionId(createdOrderId);
        setQrImage(`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=KHQR_ROLEA_${createdOrderId}_USD_${priceUsd}`);
        setQrString(`KHQR_ROLEA_${createdOrderId}_USD_${priceUsd}`);
        setDeepLink(`abamobilebank://ababank.com?type=payway&qrcode=KHQR_ROLEA_${createdOrderId}_USD_${priceUsd}`);
        setTimeLeft(300);
      }
    } catch (err) {
      console.error('Failed to initialize VngZz PayWay payment:', err);
    } finally {
      setLoadingQR(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initPayment();
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || paymentPaid) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, paymentPaid]);

  // Poll Check Transaction
  useEffect(() => {
    if (!isOpen || !transactionId || paymentPaid) return;

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/payments/vngzz/check-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: transactionId,
            order_id: orderId
          })
        }).catch(() => null);
        
        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && (data.is_paid || data.state === 'PAID')) {
            setPaymentPaid(true);
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            setTimeout(() => {
              router.push(`/order/${orderId}`);
            }, 800);
          }
        }
      } catch (e) {
        // silent catch polling error
      }
    }, 2000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, transactionId, orderId, paymentPaid, router]);

  if (!isOpen || !mounted) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadQR = () => {
    const targetUrl = qrImage || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrString)}`;
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `KHQR_Payment_${orderId || 'RoleaTopup'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenMobileApp = () => {
    if (deepLink) {
      window.location.href = deepLink;
    } else {
      window.location.href = `abamobilebank://ababank.com?type=payway&qrcode=${qrString || ''}`;
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      {/* PayWay ABA KHQR Mobile Phone Screen Container */}
      <div 
        className="relative w-full max-w-md my-auto bg-[#f4f5f7] border border-slate-200 rounded-none sm:rounded-3xl shadow-2xl text-slate-900 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Controls Bar */}
        <div className="bg-[#f4f5f7] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-700 hover:bg-slate-200 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Domain Name Pill */}
          <div className="px-3 py-1 rounded-full bg-slate-200/80 border border-slate-300 font-mono text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <span>link.payway.com.kh</span>
          </div>

          {/* Language Switcher Toggle */}
          <div className="flex items-center rounded-full bg-slate-200 p-0.5 border border-slate-300 text-[11px] font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full transition-all ${!isKm ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('km')}
              className={`px-2 py-0.5 rounded-full transition-all ${isKm ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ខ្មែរ
            </button>
          </div>
        </div>

        {/* Merchant Info Banner Header */}
        <div className="bg-[#f4f5f7] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center shadow-xs border border-slate-300 shrink-0">
              R
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                RoleaTopup Cambodia
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Entertainment & Art
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-black tracking-wider text-slate-600 uppercase italic">
              ABA' PAYWAY
            </span>
          </div>
        </div>

        {/* Vibrant RED KHQR Banner Header */}
        <div className="bg-[#e31b23] py-2.5 px-4 flex items-center justify-center relative overflow-hidden shadow-xs">
          <div className="text-white font-black text-xl tracking-widest flex items-center justify-center gap-1 font-mono">
            <span>KHQR</span>
          </div>
        </div>

        {/* MAIN ABA KHQR CONTENT CARD */}
        <div className="bg-white p-5 sm:p-6 space-y-4">
          
          {/* ABA KHQR Title & Timer Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              ABA KHQR
            </h2>

            {timeLeft > 0 ? (
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#0097a7]">
                <div className="w-3.5 h-3.5 border-2 border-[#0097a7] border-t-transparent rounded-full animate-spin"></div>
                <span>{formatTimer(timeLeft)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-red-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Expired</span>
              </div>
            )}
          </div>

          {/* Merchant Subtitle & Big Amount Display */}
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-slate-500">
              RoleaTopup Cambodia
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl sm:text-4xl font-black text-[#0c1c38] tracking-tight">
                {priceUsd.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">
                USD
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400">
              ≈ ៛{priceKhr.toLocaleString()} KHR
            </p>
          </div>

          {/* Dotted Line Divider */}
          <div className="border-b border-dashed border-slate-300 w-full my-3"></div>

          {/* QR Code Center Stage */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative p-2 rounded-2xl bg-white border border-slate-200 shadow-sm w-64 h-64 flex items-center justify-center overflow-hidden">
              {loadingQR ? (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#e31b23]" />
                  <span className="text-xs font-bold">Loading KHQR...</span>
                </div>
              ) : timeLeft === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 text-center bg-white/95 absolute inset-0 z-10 p-4">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                  <p className="text-xs font-bold text-slate-800">
                    {isKm ? 'QR Code បានផុតកំណត់' : 'QR Code Expired'}
                  </p>
                  <button
                    onClick={initPayment}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-[#e31b23] text-white text-xs font-bold shadow-xs"
                  >
                    {isKm ? 'បង្កើត QR ថ្មី' : 'Refresh QR'}
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={qrImage || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qrString)}`}
                    alt="ABA PayWay KHQR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  {/* Red Bakong Center Logo Emblem */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[#e31b23] text-white border-2 border-white flex items-center justify-center font-black text-[9px] shadow-md">
                      KHQR
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Texts & Download QR Button */}
            <div className="mt-3 text-center space-y-1">
              <p className="text-xs font-bold text-slate-800">
                {isKm ? 'ស្កេនដើម្បីទូទាត់ប្រាក់' : 'Scan to pay'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {isKm ? 'ឬ' : 'or'}
              </p>

              {/* Download QR Link */}
              <button
                type="button"
                onClick={handleDownloadQR}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0097a7] hover:text-[#00838f] transition-colors py-1 px-2 rounded-lg hover:bg-cyan-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isKm ? 'ទាញយក QR Code' : 'Download QR'}</span>
              </button>

              <p className="text-[10.5px] text-slate-400 leading-relaxed max-w-xs mx-auto pt-1 font-medium">
                {isKm 
                  ? 'និងបង្ហោះចូលទៅកាន់កម្មវិធីធនាគារចល័តដែលគាំទ្រ KHQR' 
                  : 'and upload to Mobile Banking app supporting KHQR'}
              </p>
            </div>
          </div>

          {/* Payment Success Overlay */}
          {paymentPaid && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-emerald-900">
                {isKm ? 'ទទួលបានការទូទាត់ជោគជ័យ!' : 'Payment Received Successfully!'}
              </p>
            </div>
          )}

          {/* Direct ABA Mobile Banking Launch Button */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleOpenMobileApp}
              className="w-full py-3 bg-[#e31b23] hover:bg-[#c62828] text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isKm ? 'ទូទាត់តាមកម្មវិធី ABA Mobile / ធនាគារ' : 'Pay via ABA Mobile Banking App'}</span>
            </button>

            <button
              onClick={() => {
                if (orderId) router.push(`/order/${orderId}`);
              }}
              className="w-full py-2.5 text-slate-600 hover:text-slate-900 text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors"
            >
              <span>{isKm ? 'តាមដានការបញ្ជាទិញ' : 'Track Order Status'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
