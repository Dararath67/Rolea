'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag,
  Gamepad2,
  Gift,
  Flame,
  Sparkles,
  SearchCheck,
  Grid
} from 'lucide-react';

const DEFAULT_BANNER_SLIDES = [
  {
    id: 'slide-1',
    title_km: 'បញ្ជូលប្រាក់ហ្គេមរហ័ស & សុវត្ថិភាព ១០០%',
    title_en: 'Instant & 100% Safe Game Top-Up Platform',
    subtitle_km: 'ទូទាត់តាម Bakong KHQR, ABA Mobile, Wing Bank មិនគិតថ្លៃសេវា ០%',
    subtitle_en: 'Pay with Bakong KHQR, ABA Mobile, Wing Bank with 0% transaction fee',
    badge_km: 'បម្រើសេវាកម្ម ២៤/៧',
    badge_en: '24/7 INSTANT SERVICE',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    target_url: '/games/mobile-legends',
    bg_gradient: 'from-blue-950 via-indigo-950 to-slate-950'
  },
  {
    id: 'slide-2',
    title_km: 'Free Fire Diamond & Membership',
    title_en: 'Free Fire Diamond & Weekly Membership',
    subtitle_km: 'គាំទ្រ Server Cambodia, Malaysia, Singapore ទទួលបានភ្លាមៗ',
    subtitle_en: 'Supports KH, MY, SG Servers with instant auto-delivery',
    badge_km: 'ប្រូម៉ូសិនពិសេស',
    badge_en: 'HOT PROMOTION',
    image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80',
    target_url: '/games/freefire-kh',
    bg_gradient: 'from-red-950 via-amber-950 to-slate-950'
  },
  {
    id: 'slide-3',
    title_km: 'Roblox Robux & Giftcard Voucher',
    title_en: 'Roblox Robux & Giftcard Game Codes',
    subtitle_km: 'កូដសកល ងាយស្រួលប្រើប្រាស់ ទទួលបានកូដភ្លាមៗតាម Telegram',
    subtitle_en: 'Global game codes delivered instantly via Telegram bot',
    badge_km: 'កូដស្វ័យប្រវត្តិ',
    badge_en: 'INSTANT CODE',
    image_url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1600&auto=format&fit=crop&q=80',
    target_url: '/games/roblox',
    bg_gradient: 'from-violet-950 via-purple-950 to-slate-950'
  }
];

export default function HeroBanner() {
  const { language, t } = useLanguage();
  const isKm = language === 'km';

  const [heroData, setHeroData] = useState<any | null>(null);
  const [promoBanners, setPromoBanners] = useState<any[]>(DEFAULT_BANNER_SLIDES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Fetch Hero Banner Config & Promo Photo Banners from backend
  useEffect(() => {
    async function loadBannerData() {
      try {
        const [heroRes, bannersRes] = await Promise.all([
          fetch('/api/v1/banners/hero').catch(() => null),
          fetch('/api/v1/banners').catch(() => null)
        ]);

        if (heroRes && heroRes.ok) {
          const heroJson = await heroRes.json().catch(() => null);
          if (heroJson && heroJson.success && heroJson.data) {
            setHeroData(heroJson.data);
          }
        }

        if (bannersRes && bannersRes.ok) {
          const bannersJson = await bannersRes.json().catch(() => null);
          if (bannersJson && bannersJson.success && Array.isArray(bannersJson.data) && bannersJson.data.length > 0) {
            const active = bannersJson.data.filter((b: any) => b.is_active !== false);
            if (active.length > 0) {
              setPromoBanners(active);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load banner slider data:', err);
      }
    }
    loadBannerData();
  }, []);

  // Auto-Play Carousel Timer (every 4.5 seconds)
  useEffect(() => {
    if (promoBanners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [promoBanners.length, isHovered]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? promoBanners.length - 1 : prev - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % promoBanners.length);
  };

  const activeBanners = promoBanners.length > 0 ? promoBanners : DEFAULT_BANNER_SLIDES;

  // Quick Category items matching Image 1 UX
  const quickCategories = [
    {
      id: 'games',
      label: isKm ? 'ហ្គេម' : 'Games',
      href: '/games',
      iconSrc: '/images/kira-logo.png',
      fallbackIcon: Gamepad2,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'giftcards',
      label: isKm ? 'Giftcard' : 'Giftcards',
      href: '/games?category=giftcard',
      iconSrc: '/images/rolea-logo.png',
      fallbackIcon: Gift,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'mlbb',
      label: isKm ? 'Mobile Legends' : 'MLBB',
      href: '/games/mobile-legends',
      iconSrc: '/images/logo.png',
      fallbackIcon: Sparkles,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'freefire',
      label: isKm ? 'Free Fire' : 'Free Fire',
      href: '/games/freefire-kh',
      iconSrc: '/images/favicon.png',
      fallbackIcon: Flame,
      color: 'from-red-500 to-rose-600'
    },
    {
      id: 'track',
      label: isKm ? 'ពិនិត្យ Order' : 'Track Order',
      href: '/order/track',
      iconSrc: '',
      fallbackIcon: SearchCheck,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <div className="w-full mb-8 font-sans select-none">
      {/* 1. Main Graphic Banner Slider (Kira Game Store style) */}
      <div 
        className="relative w-full overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl border border-blue-500/20 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Banner Slide Content Container */}
        <div className="relative w-full min-h-[280px] sm:min-h-[340px] lg:min-h-[380px] overflow-hidden">
          {activeBanners.map((banner: any, idx: number) => {
            const isSelected = idx === currentIndex;
            const title = isKm && banner.title_km ? banner.title_km : banner.title_en;
            const sub = isKm && banner.subtitle_km ? banner.subtitle_km : banner.subtitle_en;
            const badge = isKm && banner.badge_km ? banner.badge_km : banner.badge_en;
            const bgGrad = banner.bg_gradient || 'from-blue-950 via-indigo-950 to-slate-950';

            return (
              <div
                key={banner.id || idx}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  isSelected ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
                }`}
              >
                {/* Background Banner Image */}
                {banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={title}
                    className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${bgGrad}`} />
                )}

                {/* Gradient Overlays for Ultra Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

                {/* Content Area - Responsive padding and button layout */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-8 lg:p-10 max-w-2xl space-y-2.5 sm:space-y-3.5">
                  {badge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-400/30 text-[10px] sm:text-xs font-black text-cyan-200 tracking-wider uppercase w-max shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
                      <span>{badge}</span>
                    </div>
                  )}

                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {title}
                  </h2>

                  {sub && (
                    <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 max-w-xl">
                      {sub}
                    </p>
                  )}

                  {/* CTA Action Buttons - Guaranteed full visibility on Mobile */}
                  <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                    <Link
                      href={banner.target_url || '/games/mobile-legends'}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap min-h-[44px]"
                    >
                      <ShoppingBag className="w-4 h-4 fill-white" />
                      <span>{isKm ? 'បញ្ជាទិញឥឡូវនេះ' : 'Top Up Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/order/track"
                      className="inline-flex items-center justify-center gap-2 px-4.5 py-3 sm:py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition-all whitespace-nowrap min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isKm ? 'ពិនិត្យ Order' : 'Track Order'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left Chevron Navigation Button */}
        {activeBanners.length > 1 && (
          <button
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
            className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/70 hover:bg-blue-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 group-hover:opacity-100 opacity-90 sm:opacity-75"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Right Chevron Navigation Button */}
        {activeBanners.length > 1 && (
          <button
            onClick={handleNextSlide}
            aria-label="Next Slide"
            className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/70 hover:bg-blue-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 group-hover:opacity-100 opacity-90 sm:opacity-75"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Bottom Pagination Dots Indicator (• • •) */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-md">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-xs'
                    : 'w-2 h-2 bg-white/40 hover:bg-white rounded-full'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Quick Category Bar matching Image 1 UX */}
      <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 backdrop-blur-sm">
        {quickCategories.map((cat) => {
          const FallbackIcon = cat.fallbackIcon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex flex-col items-center text-center p-2 rounded-xl hover:bg-white transition-all duration-200 active:scale-95"
            >
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center p-1.5 group-hover:border-blue-400 group-hover:shadow-md transition-all">
                {cat.iconSrc ? (
                  <Image
                    src={cat.iconSrc}
                    alt={cat.label}
                    width={36}
                    height={36}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white`}>
                    <FallbackIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-blue-600 mt-1.5 truncate max-w-full">
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
