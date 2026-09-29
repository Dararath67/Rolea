'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Gamepad2, 
  Gift, 
  Flame, 
  Sparkles, 
  SearchCheck 
} from 'lucide-react';

export default function HeroBanner() {
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Fetch Promo Photo Banners from backend
  useEffect(() => {
    async function loadBannerData() {
      try {
        const res = await fetch('/api/v1/banners').catch(() => null);

        if (res && res.ok) {
          const bannersJson = await res.json().catch(() => null);
          if (bannersJson && bannersJson.success && Array.isArray(bannersJson.data)) {
            const active = bannersJson.data.filter((b: any) => b.is_active !== false);
            setPromoBanners(active);
          }
        }
      } catch (err) {
        console.error('Failed to load banner slider data:', err);
      }
    }
    loadBannerData();
  }, []);

  // Auto-Play Carousel Timer (every 4 seconds) - Auto scroll to the right
  useEffect(() => {
    if (promoBanners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoBanners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [promoBanners.length, isHovered]);

  // Quick Category items with REAL Game Logos
  const quickCategories = [
    {
      id: 'games',
      label: isKm ? 'ហ្គេម' : 'Games',
      href: '/games',
      iconSrc: '/images/games/hok.png',
      fallbackIcon: Gamepad2,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'giftcards',
      label: isKm ? 'Giftcard' : 'Giftcards',
      href: '/games?category=giftcard',
      iconSrc: '/images/games/steam.png',
      fallbackIcon: Gift,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'mlbb',
      label: isKm ? 'Mobile Legends' : 'MLBB',
      href: '/games/mobile-legends',
      iconSrc: '/images/games/mlbb.png',
      fallbackIcon: Sparkles,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'freefire',
      label: isKm ? 'Free Fire' : 'Free Fire',
      href: '/games/freefire-kh',
      iconSrc: '/images/games/freefire.png',
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
      {/* Pure Graphic Banner Slider - NO overlay buttons, NO overlay text */}
      {promoBanners.length > 0 && (
        <div 
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 shadow-xl border border-slate-200/60 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Banner Container Aspect Ratio */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[3/1] overflow-hidden">
            {promoBanners.map((banner: any, idx: number) => {
              const isSelected = idx === currentIndex;
              const bannerContent = (
                <img
                  src={banner.image_url}
                  alt={banner.title_en || 'Promo Banner'}
                  className="w-full h-full object-cover object-center"
                />
              );

              return (
                <div
                  key={banner.id || idx}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    isSelected ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
                  }`}
                >
                  {banner.target_url ? (
                    <Link href={banner.target_url} className="block w-full h-full">
                      {bannerContent}
                    </Link>
                  ) : (
                    bannerContent
                  )}
                </div>
              );
            })}
          </div>

          {/* Clean Pagination Dots Indicator */}
          {promoBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-md">
              {promoBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 h-2 bg-blue-500 rounded-full shadow-xs'
                      : 'w-2 h-2 bg-white/50 hover:bg-white rounded-full'
                  }`}
                  aria-label={`Go to banner ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Category Bar */}
      <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 backdrop-blur-sm">
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
