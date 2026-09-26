'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  ShieldCheck, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export default function HeroBanner() {
  const { language, t } = useLanguage();
  const isKm = language === 'km';

  const [heroData, setHeroData] = useState<any | null>(null);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Fetch Hero Banner Config & Promo Photo Banners
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
            setPromoBanners(bannersJson.data.filter((b: any) => b.is_active !== false));
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

  // If promoBanners exist, render the full Photo Carousel Slider (SabayStore style)
  if (promoBanners.length > 0) {
    const currentBanner = promoBanners[currentIndex] || promoBanners[0];
    const bannerTitle = isKm && currentBanner.title_km ? currentBanner.title_km : currentBanner.title_en;
    const bannerSub = isKm && currentBanner.subtitle_km ? currentBanner.subtitle_km : currentBanner.subtitle_en;
    const bannerBadge = isKm && currentBanner.badge_km ? currentBanner.badge_km : currentBanner.badge_en;

    return (
      <div 
        className="relative w-full overflow-hidden rounded-3xl bg-slate-950 text-white mb-10 shadow-2xl border border-blue-500/20 group font-sans select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Banner Slide Content Container */}
        <div className="relative w-full h-[260px] sm:h-[380px] lg:h-[440px] overflow-hidden">
          {promoBanners.map((banner: any, idx: number) => {
            const isSelected = idx === currentIndex;
            const title = isKm && banner.title_km ? banner.title_km : banner.title_en;
            const sub = isKm && banner.subtitle_km ? banner.subtitle_km : banner.subtitle_en;
            const badge = isKm && banner.badge_km ? banner.badge_km : banner.badge_en;

            return (
              <div
                key={banner.id || idx}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  isSelected ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
                }`}
              >
                {/* Full Graphic Photo Image */}
                <img
                  src={banner.image_url}
                  alt={title}
                  className="w-full h-full object-cover object-center"
                />

                {/* Gradient Overlays for High Legibility & Premium Look */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                {/* Overlaid Banner Text & Call to Action */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-10 lg:p-12 max-w-2xl space-y-3 sm:space-y-4">
                  {badge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md border border-blue-400/30 text-[11px] sm:text-xs font-black text-cyan-200 tracking-wider uppercase w-max shadow-md">
                      <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
                      <span>{badge}</span>
                    </div>
                  )}

                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {title}
                  </h2>

                  {sub && (
                    <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 max-w-xl">
                      {sub}
                    </p>
                  )}

                  <div className="pt-2">
                    <Link
                      href={banner.target_url || '/games/mobile-legends'}
                      className="inline-flex items-center gap-2.5 px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4 fill-white" />
                      <span>{isKm ? 'បញ្ជាទិញឥឡូវនេះ' : 'Top Up Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left Chevron Navigation Button */}
        {promoBanners.length > 1 && (
          <button
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 hover:bg-blue-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-90 sm:opacity-75"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>
        )}

        {/* Right Chevron Navigation Button */}
        {promoBanners.length > 1 && (
          <button
            onClick={handleNextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 hover:bg-blue-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-90 sm:opacity-75"
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>
        )}

        {/* Bottom Pagination Dots Indicator (• • •) */}
        {promoBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-lg">
            {promoBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 sm:w-7 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-md'
                    : 'w-2 h-2 bg-white/40 hover:bg-white rounded-full'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback / Standard Hero Banner if no promo photo banners
  const badgeText = heroData
    ? (isKm ? heroData.badge_text_km : heroData.badge_text_en)
    : (isKm ? 'ទូទាត់តាម Bakong KHQR មិនគិតថ្លៃសេវា 0%' : '0% Fee with Bakong KHQR across all Cambodian Banks');

  const titleText = heroData ? (isKm ? heroData.title_km : heroData.title_en) : t.heroTitle;
  const highlightText = heroData ? (isKm ? heroData.highlight_km : heroData.highlight_en) : t.heroTitleHighlight;
  const subtitleText = heroData ? (isKm ? heroData.subtitle_km : heroData.subtitle_en) : t.heroSubtitle;
  const ctaPrimaryText = heroData ? (isKm ? heroData.cta_primary_text_km : heroData.cta_primary_text_en) : `${t.btnTopUpNow} (MLBB)`;
  const ctaPrimaryUrl = heroData?.cta_primary_url || '/games/mobile-legends';
  const ctaSecondaryText = heroData ? (isKm ? heroData.cta_secondary_text_km : heroData.cta_secondary_text_en) : t.btnCheckStatus;
  const ctaSecondaryUrl = heroData?.cta_secondary_url || '/order/track';

  const stat1Val = heroData ? (isKm ? heroData.stat_1_val_km : heroData.stat_1_val_en) : t.statUsers;
  const stat1Label = heroData ? (isKm ? heroData.stat_1_label_km : heroData.stat_1_label_en) : t.statActiveUsers;
  const stat2Val = heroData ? (isKm ? heroData.stat_2_val_km : heroData.stat_2_val_en) : t.statInstant;
  const stat2Label = heroData ? (isKm ? heroData.stat_2_label_km : heroData.stat_2_label_en) : t.statDelivery;
  const stat3Val = heroData ? (isKm ? heroData.stat_3_val_km : heroData.stat_3_val_en) : t.statSuccess;
  const stat3Label = heroData ? (isKm ? heroData.stat_3_label_km : heroData.stat_3_label_en) : t.statSuccessRate;

  const bgImageUrl = heroData?.background_image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80';

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 mb-10 shadow-xl border border-blue-500/20 font-sans">
      {bgImageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={bgImageUrl}
            alt="Hero Banner Photo"
            className="w-full h-full object-cover object-center opacity-35 mix-blend-luminosity hover:scale-105 transition-all duration-1000 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-blue-950/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-cyan-200 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
            <span className="truncate">{badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug py-1">
            {titleText} <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent">
              {highlightText}
            </span>
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
            {subtitleText}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={ctaPrimaryUrl}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] whitespace-nowrap"
            >
              <Zap className="w-4 h-4 fill-blue-900" />
              <span>{ctaPrimaryText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={ctaSecondaryUrl}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition-all whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{ctaSecondaryText}</span>
            </Link>
          </div>

          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/15 max-w-md">
            <div>
              <div className="text-base sm:text-lg font-black text-white whitespace-nowrap">{stat1Val}</div>
              <div className="text-[11px] text-blue-200 font-medium whitespace-nowrap">{stat1Label}</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-cyan-300 whitespace-nowrap">{stat2Val}</div>
              <div className="text-[11px] text-blue-200 font-medium whitespace-nowrap">{stat2Label}</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-emerald-300 whitespace-nowrap">{stat3Val}</div>
              <div className="text-[11px] text-blue-200 font-medium whitespace-nowrap">{stat3Label}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
