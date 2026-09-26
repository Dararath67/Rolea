'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import AutoGameSlider from '@/components/AutoGameSlider';
import GameCard from '@/components/GameCard';
import { useLanguage } from '@/context/LanguageContext';
import { 
  HelpCircle, 
  Zap, 
  Search, 
  ChevronDown, 
  Flame, 
  ArrowRight,
  LayoutGrid
} from 'lucide-react';

function HomeContent() {
  const { language, t } = useLanguage();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/api/v1/games');
        const data = await res.json();
        if (data.success) {
          setGames(data.data);
        }
      } catch (err) {
        console.error('Error fetching games:', err);
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

  const popularGames = games.filter((g: any) => g.is_popular);

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Auto-running Game Logos Slider (រត់ដោយស្វ័យប្រវត្តិ) */}
        <AutoGameSlider />

        {/* Hero Promotional Banner */}
        <HeroBanner />

        {/* Section 1: Popular Games in Cambodia */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Flame className="w-5 h-5 fill-blue-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t.popularGames}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'km' ? 'ហ្គេមដែលពេញនិយមបំផុតក្នុងប្រទេសកម្ពុជា' : 'Top trending games played in Cambodia'}
                </p>
              </div>
            </div>

            <Link
              href="/games"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{language === 'km' ? 'មើលទាំងអស់' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {popularGames.slice(0, 4).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* Section 2: All Games Directory with Tabs */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                <LayoutGrid className="w-4 h-4" />
                <span>{language === 'km' ? 'រាយនាមហ្គេមទាំងអស់' : 'Explore All Supported Games'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {language === 'km' ? 'ស្វែងរកហ្គេមដែលអ្នកចង់បញ្ចូលប្រាក់' : 'Browse Catalog by Category'}
              </h2>
            </div>

            {/* Inline search */}
            <div className="relative w-full md:w-72">
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

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
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
                      : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Games Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 my-8">
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
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 shadow-xs">
              <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {language === 'km' ? 'មិនមានហ្គេមសម្រាប់ API នេះទេ' : 'No games available from this API.'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {language === 'km' ? 'API ដែលកំពុងភ្ជាប់មិនទាន់មានហ្គេម ឬត្រលប់បញ្ជីទិន្នន័យទទេ' : 'The currently connected API has no active games available.'}
              </p>
            </div>
          )}
        </section>

        {/* Section 4: How It Works */}
        <section className="my-16 rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
              <Zap className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ងាយស្រួល ៣ ជំហាន' : '3 Easy Steps'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{t.howItWorksTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base mb-4 shadow-xs">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{t.step1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{t.step1Desc}</p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base mb-4 shadow-xs">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{t.step2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{t.step2Desc}</p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-base mb-4 shadow-xs">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{t.step3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{t.step3Desc}</p>
            </div>
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section className="my-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-200">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ចម្ងល់ & ចម្លើយ' : 'FAQ'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{t.faqTitle}</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-800 hover:text-blue-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
