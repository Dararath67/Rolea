'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface CompactAppItem {
  id: string;
  name_en: string;
  name_km: string;
  slug: string;
  icon: string;
}

const compactApps: CompactAppItem[] = [
  {
    id: 'ff',
    name_en: 'Free Fire',
    name_km: 'Free Fire',
    slug: 'free-fire',
    icon: '/images/games/freefire.png'
  },
  {
    id: 'mlbb',
    name_en: 'MLBB',
    name_km: 'MLBB',
    slug: 'mobile-legends',
    icon: '/images/games/mlbb.png'
  },
  {
    id: 'pubg',
    name_en: 'PUBG Mobile',
    name_km: 'PUBG Mobile',
    slug: 'pubg-mobile',
    icon: '/images/games/pubg.png'
  },
  {
    id: 'hok',
    name_en: 'Honor of Kings',
    name_km: 'HoK',
    slug: 'honor-of-kings',
    icon: '/images/games/hok.png'
  },
  {
    id: 'val',
    name_en: 'VALORANT',
    name_km: 'VALORANT',
    slug: 'valorant',
    icon: '/images/games/valorant.png'
  },
  {
    id: 'genshin',
    name_en: 'Genshin Impact',
    name_km: 'Genshin',
    slug: 'genshin-impact',
    icon: '/images/games/genshin.png'
  },
  {
    id: 'roblox',
    name_en: 'Roblox',
    name_km: 'Roblox',
    slug: 'roblox',
    icon: '/images/games/roblox.png'
  },
  {
    id: 'codm',
    name_en: 'Call of Duty',
    name_km: 'CODM',
    slug: 'call-of-duty-mobile',
    icon: '/images/games/codm.png'
  },
  {
    id: 'wildrift',
    name_en: 'Wild Rift',
    name_km: 'Wild Rift',
    slug: 'lol-wild-rift',
    icon: '/images/games/wildrift.png'
  },
  {
    id: 'fcmobile',
    name_en: 'FC Mobile',
    name_km: 'FC Mobile',
    slug: 'fc-mobile',
    icon: '/images/games/fcmobile.png'
  },
  {
    id: 'brawlstars',
    name_en: 'Brawl Stars',
    name_km: 'Brawl Stars',
    slug: 'brawl-stars',
    icon: '/images/games/brawlstars.png'
  },
  {
    id: 'clashofclans',
    name_en: 'Clash of Clans',
    name_km: 'Clash of Clans',
    slug: 'clash-of-clans',
    icon: '/images/games/clashofclans.png'
  },
  {
    id: 'aov',
    name_en: 'Arena of Valor',
    name_km: 'AoV',
    slug: 'arena-of-valor',
    icon: '/images/games/aov.png'
  },
  {
    id: 'steam',
    name_en: 'Steam Wallet',
    name_km: 'Steam',
    slug: 'steam-wallet',
    icon: '/images/games/steam.png'
  }
];

export default function AutoGameSlider() {
  const { language } = useLanguage();

  // Duplicate items array to create seamless infinite loop marquee
  const marqueeItems = [...compactApps, ...compactApps];

  return (
    <div className="w-full mb-6 overflow-hidden relative font-sans">
      <style>{`
        @keyframes customMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-compact-marquee {
          display: flex;
          width: max-content;
          animation: customMarquee 35s linear infinite;
        }
        .animate-compact-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Edge gradient masks */}
      <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

      {/* Continuous Marquee Track */}
      <div className="overflow-hidden py-2">
        <div className="animate-compact-marquee flex items-center gap-5 sm:gap-7">
          {marqueeItems.map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              href={`/games/${item.slug}`}
              className="group flex flex-col items-center gap-1.5 shrink-0 transition-transform duration-200 hover:-translate-y-1"
            >
              {/* Squircle App Icon Tile with edge-to-edge real game artwork */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden group-hover:shadow-md group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200">
                <img
                  src={item.icon}
                  alt={item.name_en}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* App Label */}
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 group-hover:text-blue-600 group-hover:font-bold transition-colors whitespace-nowrap text-center max-w-[76px] truncate">
                {language === 'km' ? item.name_km : item.name_en}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
