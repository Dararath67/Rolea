'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Zap, ChevronRight } from 'lucide-react';

interface GameProps {
  game: {
    id: string;
    slug: string;
    name_en: string;
    name_km: string;
    subtitle_en: string;
    subtitle_km: string;
    category: string;
    publisher: string;
    region: string;
    thumbnail: string;
    badge_en?: string;
    badge_km?: string;
    instant_delivery: boolean;
    packages: Array<{ price_user_usd: number }>;
  };
}

import { getGameThumbnailUrl } from '@/lib/gameImages';

export default function GameCard({ game }: GameProps) {
  const { language, formatPrice, t } = useLanguage();

  const initialSrc = getGameThumbnailUrl(game.slug, game.thumbnail);
  const [imgSrc, setImgSrc] = useState(initialSrc);

  const minPriceUsd = game.packages.length > 0
    ? Math.min(...game.packages.map(p => p.price_user_usd))
    : 0;

  const title = language === 'km' ? game.name_km : game.name_en;
  const subtitle = language === 'km' ? game.subtitle_km : game.subtitle_en;
  const badge = language === 'km' ? (game.badge_km || game.badge_en) : game.badge_en;

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:-translate-y-1 hover:shadow-md font-sans"
    >
      {/* Thumbnail Aspect */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
        <img
          src={imgSrc}
          alt={title}
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            setImgSrc('https://play-lh.googleusercontent.com/QqZj22aXblAyYDxLQw-Gg0ycW0QkKhrDnwqgERZU9BMRXZnMlgXfq-94sikG5mEpt_I0lzZxcUzfLblmQgwYzUE=s512');
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badge */}
        {badge && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-600 text-white shadow-xs whitespace-nowrap">
              {badge}
            </span>
          </div>
        )}

        {/* Region */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs whitespace-nowrap">
          <span>{game.region}</span>
        </div>

        {game.instant_delivery && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
            <Zap className="w-3 h-3 fill-white" />
            <span>{t.instantBadge}</span>
          </div>
        )}
      </div>

      {/* Game info */}
      <div className="flex flex-col flex-1 p-4">
        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 whitespace-nowrap truncate">
          {game.publisher}
        </div>
        <h3 className="font-extrabold text-slate-900 text-sm leading-snug py-0.5 truncate group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
          {subtitle}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium whitespace-nowrap">{t.startsFrom}</span>
            <span className="text-sm font-black text-slate-900 whitespace-nowrap">
              {formatPrice(minPriceUsd)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
            <span>{language === 'km' ? 'បញ្ចូលប្រាក់' : 'Top-Up'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
