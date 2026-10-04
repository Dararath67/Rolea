'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Layers } from 'lucide-react';

function GamesDirectoryContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { language, t } = useLanguage();

  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    async function loadGames() {
      try {
        if (typeof window !== 'undefined') {
          const cached = sessionStorage.getItem('rolea_games_cache');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setGames(parsed);
                setLoading(false);
              }
            } catch (e) {}
          }
        }

        const res = await fetch('/api/v1/games');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setGames(data.data);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('rolea_games_cache', JSON.stringify(data.data));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  // Game Franchise and Type Category Tabs
  const categories = [
    { id: 'all', label_en: 'All Games', label_km: 'ហ្គេមទាំងអស់' },
    { id: 'freefire', label_en: 'Free Fire', label_km: 'Free Fire (KH / MY / SG)' },
    { id: 'mlbb', label_en: 'Mobile Legends', label_km: 'Mobile Legends (MLBB)' },
    { id: 'pubg', label_en: 'PUBG Mobile', label_km: 'PUBG Mobile' },
    { id: 'hok', label_en: 'Honor of Kings', label_km: 'Honor of Kings' },
    { id: 'roblox', label_en: 'Roblox', label_km: 'Roblox' },
    { id: 'pc', label_en: 'PC Games', label_km: 'ហ្គេម PC' },
    { id: 'mobile', label_en: 'Other Mobile Games', label_km: 'ហ្គេមទូរស័ព្ទផ្សេងៗ' },
  ];

  const filteredGames = games.filter((g) => {
    const slug = (g.slug || '').toLowerCase();
    const nameEn = (g.name_en || '').toLowerCase();
    const nameKm = (g.name_km || '').toLowerCase();
    const cat = (g.category || '').toLowerCase();
    const pub = (g.publisher || '').toLowerCase();
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch = !query || 
      nameEn.includes(query) ||
      nameKm.includes(query) ||
      pub.includes(query) ||
      slug.includes(query);

    // If searching, search across all games regardless of active category tab
    if (query) {
      return matchesSearch;
    }

    if (activeCategory === 'all') return true;

    if (activeCategory === 'freefire') {
      return slug.includes('freefire') || slug.includes('free_fire') || slug.includes('ff') || nameEn.includes('free fire');
    }
    if (activeCategory === 'mlbb') {
      return slug.includes('mlbb') || slug.includes('mobile_legends') || nameEn.includes('mobile legends');
    }
    if (activeCategory === 'pubg') {
      return slug.includes('pubg') || nameEn.includes('pubg');
    }
    if (activeCategory === 'hok') {
      return slug.includes('hok') || nameEn.includes('honor of kings');
    }
    if (activeCategory === 'roblox') {
      return slug.includes('roblox') || nameEn.includes('roblox');
    }
    if (activeCategory === 'pc') {
      return cat === 'pc' || slug.includes('valorant') || slug.includes('pc');
    }
    if (activeCategory === 'mobile') {
      return cat === 'mobile' && !slug.includes('freefire') && !slug.includes('mlbb') && !slug.includes('pubg') && !slug.includes('hok');
    }

    return cat === activeCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'កាតាឡុកហ្គេម' : 'Games Catalog'}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              {t.allGames}
            </h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim()) {
                  setActiveCategory('all');
                }
              }}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>
        </div>

        {/* Categories Tab */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const active = activeCategory === cat.id && !searchQuery.trim();
            const label = language === 'km' ? cat.label_km : cat.label_en;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 my-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-200 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl bg-white border border-slate-200 shadow-xs">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {language === 'km' ? 'មិនមានហ្គេមសម្រាប់ API នេះទេ' : 'No games available from this API.'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'km' ? 'API ដែលកំពុងភ្ជាប់មិនទាន់មានហ្គេម ឬមិនមានហ្គេមដែលត្រូវគ្នានឹងការស្វែងរក' : 'The currently connected API has no active games available.'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function GamesDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">Loading...</div>}>
      <GamesDirectoryContent />
    </Suspense>
  );
}
