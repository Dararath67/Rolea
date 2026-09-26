'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gamepad2, 
  Search, 
  Filter, 
  Layers, 
  Server, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  Sliders, 
  ArrowUpRight, 
  X, 
  Check, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  Sparkles,
  Zap,
  TrendingUp,
  Tag,
  ChevronRight,
  Power
} from 'lucide-react';

interface ConnectedGamesTableProps {
  language?: string;
  onRefreshParent?: () => void;
}

export default function ConnectedGamesTable({
  language = 'km',
  onRefreshParent
}: ConnectedGamesTableProps) {
  const isKm = language === 'km';

  // Data states
  const [games, setGames] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on' | 'off'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Slide-over Package Drawer State
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [drawerPackages, setDrawerPackages] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch games & providers
  const loadConnectedGames = async () => {
    const safeFetchJson = async (res: Response) => {
      if (!res || !res.ok) return { success: false, data: [] };
      try {
        return await res.json();
      } catch {
        return { success: false, data: [] };
      }
    };

    try {
      setLoading(true);
      const provQuery = providerFilter && providerFilter !== 'all' ? `?provider_id=${encodeURIComponent(providerFilter)}` : '';
      const [gamesRes, provRes] = await Promise.all([
        fetch(`/api/v1/admin/api-games${provQuery}`),
        fetch('/api/v1/admin/providers')
      ]);

      const gamesData = await safeFetchJson(gamesRes);
      const provData = await safeFetchJson(provRes);

      if (gamesData.success) {
        setGames(gamesData.data);
      }
      if (provData.success) {
        setProviders(provData.data);
      }
    } catch (err) {
      console.error('Failed to load connected games', err);
      showToast(isKm ? 'បរាជ័យក្នុងការទាញយកទិន្នន័យហ្គេម API' : 'Failed to fetch API games catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnectedGames();
  }, [providerFilter]);

  // Toggle Game ON/OFF
  const handleToggleGame = async (gameId: string, currentStatus: boolean, gameName: string) => {
    const newStatus = !currentStatus;
    
    // Optimistic local update
    setGames(prev => prev.map(g => {
      if (g.id === gameId || g.slug === gameId) {
        return { ...g, is_active: newStatus, published: newStatus };
      }
      return g;
    }));

    if (selectedGame && (selectedGame.id === gameId || selectedGame.slug === gameId)) {
      setSelectedGame((prev: any) => ({ ...prev, is_active: newStatus, published: newStatus }));
    }

    try {
      setActionLoadingId(`game-${gameId}`);
      const res = await fetch(`/api/v1/admin/api-games/${gameId}/toggle`, {
        method: 'PATCH'
      });
      const data = await res.json();

      if (data.success) {
        const msg = newStatus
          ? (isKm ? `ហ្គេម "${gameName}" ត្រូវបានបើកដំណើរការ (ON) ទៅកាន់ទំព័រមុខ!` : `"${gameName}" is now LIVE (ON) on the storefront!`)
          : (isKm ? `ហ្គេម "${gameName}" ត្រូវបានបិទដំណើរការ (OFF) ពីទំព័រមុខ!` : `"${gameName}" is now HIDDEN (OFF) from storefront.`);
        showToast(msg, 'success');
        if (onRefreshParent) onRefreshParent();
      } else {
        throw new Error(data.message || 'Toggle failed');
      }
    } catch (err: any) {
      // Revert state on error
      setGames(prev => prev.map(g => {
        if (g.id === gameId || g.slug === gameId) {
          return { ...g, is_active: currentStatus, published: currentStatus };
        }
        return g;
      }));
      showToast(isKm ? 'បរាជ័យក្នុងការប្ដូរស្ថានភាពហ្គេម' : 'Failed to toggle game status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Slide-over Package Drawer
  const handleOpenDrawer = async (game: any) => {
    setSelectedGame(game);
    setDrawerLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/api-games/${game.id}/products`);
      const data = await res.json();
      if (data.success) {
        setDrawerPackages(data.data || []);
      } else {
        setDrawerPackages(game.packages || []);
      }
    } catch (err) {
      setDrawerPackages(game.packages || []);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Toggle Individual Product Package ON/OFF
  const handleToggleProduct = async (pkgId: string, currentStatus: boolean, pkgName: string) => {
    const newStatus = !currentStatus;

    // Optimistic update in drawer
    setDrawerPackages(prev => prev.map(p => {
      if (p.id === pkgId) {
        return { ...p, is_active: newStatus };
      }
      return p;
    }));

    // Optimistic update in main games array count
    if (selectedGame) {
      setGames(prev => prev.map(g => {
        if (g.id === selectedGame.id || g.slug === selectedGame.slug) {
          const updatedPackages = (g.packages || []).map((p: any) => p.id === pkgId ? { ...p, is_active: newStatus } : p);
          const activeCount = updatedPackages.filter((p: any) => p.is_active).length;
          return { ...g, packages: updatedPackages, active_products_count: activeCount };
        }
        return g;
      }));
    }

    try {
      setActionLoadingId(`pkg-${pkgId}`);
      const res = await fetch(`/api/v1/admin/products/${pkgId}/toggle?game_slug=${selectedGame?.slug || ''}`, {
        method: 'PATCH'
      });
      const data = await res.json();

      if (data.success) {
        const msg = newStatus
          ? (isKm ? `កញ្ចប់ "${pkgName}" បានបើក (ON)` : `Package "${pkgName}" activated (ON)`)
          : (isKm ? `កញ្ចប់ "${pkgName}" បានបិទ (OFF)` : `Package "${pkgName}" disabled (OFF)`);
        showToast(msg, 'success');
      } else {
        throw new Error(data.message || 'Toggle failed');
      }
    } catch (err) {
      // Revert
      setDrawerPackages(prev => prev.map(p => p.id === pkgId ? { ...p, is_active: currentStatus } : p));
      showToast(isKm ? 'បរាជ័យក្នុងការប្ដូរស្ថានភាពកញ្ចប់' : 'Failed to toggle package status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Sync All Providers
  const handleSyncAll = async () => {
    try {
      setSyncingAll(true);
      const res = await fetch('/api/v1/admin/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(
          isKm 
            ? `Sync បានជោគជ័យ! Games: +${data.summary?.games_imported || 0}, Products: +${data.summary?.products_imported || 0}`
            : `Sync Complete! Games: +${data.summary?.games_imported || 0}, Products: +${data.summary?.products_imported || 0}`,
          'success'
        );
        await loadConnectedGames();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      showToast(isKm ? 'បរាជ័យក្នុងការ Sync API' : 'Failed to sync API catalog', 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  // Filtered games
  const filteredGames = games.filter(game => {
    // Provider filter
    if (providerFilter !== 'all' && game.provider_id !== providerFilter) {
      return false;
    }
    // Status filter
    if (statusFilter === 'on' && !game.is_active) {
      return false;
    }
    if (statusFilter === 'off' && game.is_active) {
      return false;
    }
    // Category filter
    if (categoryFilter !== 'all') {
      const slug = (game.slug || '').toLowerCase();
      const cat = (game.category || '').toLowerCase();
      const name = (game.name_en || '').toLowerCase();
      if (categoryFilter === 'mlbb' && !(slug.includes('mlbb') || slug.includes('mobile-legends') || cat === 'mlbb')) return false;
      if (categoryFilter === 'freefire' && !(slug.includes('freefire') || slug.includes('free_fire') || slug.includes('free-fire') || cat === 'freefire')) return false;
      if (categoryFilter === 'pubg' && !(slug.includes('pubg') || cat === 'pubg')) return false;
      if (categoryFilter === 'bloodstrike' && !(slug.includes('bloodstrike') || cat === 'bloodstrike')) return false;
      if (categoryFilter === 'hok' && !(slug.includes('hok') || slug.includes('honor') || cat === 'hok')) return false;
      if (categoryFilter === 'eafc' && !(slug.includes('eafc') || slug.includes('fcmobile') || slug.includes('fc_mobile') || cat === 'eafc')) return false;
      if (categoryFilter === 'genshin' && !(slug.includes('genshin') || slug.includes('honkai') || cat === 'genshin')) return false;
      if (categoryFilter === 'roblox' && !(slug.includes('roblox') || cat === 'roblox')) return false;
      if (categoryFilter === 'pc' && !(cat === 'pc' || slug.includes('steam') || slug.includes('valorant'))) return false;
      if (categoryFilter === 'voucher' && !(cat === 'voucher' || slug.includes('voucher') || slug.includes('card') || slug.includes('gift'))) return false;
      if (categoryFilter === 'mobile' && (cat === 'pc' || cat === 'voucher' || slug.includes('steam'))) return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = game.name_en?.toLowerCase().includes(q);
      const matchKm = game.name_km?.toLowerCase().includes(q);
      const matchSlug = game.slug?.toLowerCase().includes(q);
      const matchPub = game.publisher?.toLowerCase().includes(q);
      const matchExt = game.external_game_id?.toLowerCase().includes(q);
      return matchEn || matchKm || matchSlug || matchPub || matchExt;
    }
    return true;
  });

  // Calculate high-level stats
  const totalGamesCount = games.length;
  const activeGamesCount = games.filter(g => g.is_active).length;
  const inactiveGamesCount = totalGamesCount - activeGamesCount;
  const totalActivePackages = games.reduce((acc, g) => acc + (g.active_products_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10' :
          toastMessage.type === 'error' ? 'bg-red-50 text-red-800 border-red-200 shadow-red-500/10' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
           toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
           <Zap className="w-4 h-4 text-blue-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  {isKm ? 'ហ្គេមតភ្ជាប់ពី API ផ្គត់ផ្គង់ (Connected Games)' : 'Auto API Connected Games'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                  {isKm ? 'ប្រព័ន្ធបិទ/បើកស្វ័យប្រវត្តិ' : 'Auto ON/OFF Catalog'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isKm 
                  ? 'ហ្គេមថ្មីដែល Sync ពី API នឹងបង្ហាញជា OFF ជាមុន។ ចុចបើក ON ដើម្បីបង្ហាញលើ Storefront ភ្លាមៗ!' 
                  : 'Newly synced games default to OFF. Toggle ON to publish them instantly to the customer storefront.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadConnectedGames}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title={isKm ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Reload games'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? (isKm ? 'កំពុង Sync...' : 'Syncing All...') : (isKm ? 'ទាញយក API ទាំងអស់' : 'Sync All Provider Feeds')}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {isKm ? 'ហ្គេមតភ្ជាប់សរុប' : 'Total Connected'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {totalGamesCount}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              {providers.length} {isKm ? 'អ្នកផ្គត់ផ្គង់ API' : 'Active Providers'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              {isKm ? 'កំពុងបើកដំណើរការ (ON)' : 'Published (ON)'}
            </p>
            <h3 className="text-2xl font-black text-emerald-700 mt-0.5">
              {activeGamesCount}
            </h3>
            <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
              {isKm ? 'បង្ហាញលើ Storefront' : 'Live on Storefront'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {isKm ? 'មិនទាន់បើក (OFF)' : 'Unpublished (OFF)'}
            </p>
            <h3 className="text-2xl font-black text-slate-700 mt-0.5">
              {inactiveGamesCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {isKm ? 'លាក់ពី Storefront' : 'Hidden from customers'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-300">
            <Power className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
              {isKm ? 'កញ្ចប់ពេជ្រសកម្ម' : 'Active Diamond SKUs'}
            </p>
            <h3 className="text-2xl font-black text-blue-700 mt-0.5">
              {totalActivePackages}
            </h3>
            <p className="text-[10px] text-blue-600 mt-0.5 font-medium">
              {isKm ? 'អាចទិញបានភ្លាមៗ' : 'Ready for purchase'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKm ? 'ស្វែងរកឈ្មោះហ្គេម, Publisher, ID...' : 'Search game title, publisher, ID...'}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'all' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {isKm ? 'ទាំងអស់' : 'All'} ({totalGamesCount})
              </button>
              <button
                onClick={() => setStatusFilter('on')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  statusFilter === 'on' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ON</span> ({activeGamesCount})
              </button>
              <button
                onClick={() => setStatusFilter('off')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'off' 
                    ? 'bg-slate-700 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>OFF</span> ({inactiveGamesCount})
              </button>
            </div>

            {/* Provider Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{isKm ? 'គ្រប់អ្នកផ្គត់ផ្គង់ (Providers)' : 'All Providers'}</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{isKm ? 'គ្រប់ប្រភេទ (All Games)' : 'All Games'}</option>
                <option value="mlbb">Mobile Legends (MLBB)</option>
                <option value="freefire">Free Fire (FF)</option>
                <option value="pubg">PUBG Mobile</option>
                <option value="bloodstrike">Blood Strike</option>
                <option value="hok">Honor of Kings</option>
                <option value="eafc">EAFC Mobile</option>
                <option value="genshin">Genshin Impact</option>
                <option value="roblox">Roblox</option>
                <option value="mobile">{isKm ? 'ហ្គេមទូរស័ព្ទផ្សេងៗ' : 'Other Mobile Games'}</option>
                <option value="pc">{isKm ? 'ហ្គេមកុំព្យូទ័រ (PC & Steam)' : 'PC Games & Steam'}</option>
                <option value="voucher">{isKm ? 'កាតវ៉ាយឆ័រ (Vouchers & Cards)' : 'Vouchers & Cards'}</option>
              </select>
            </div>

            {/* Quick Bulk Toggle ON/OFF */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={async () => {
                  const targetGames = filteredGames.filter(g => !g.is_active);
                  if (targetGames.length === 0) {
                    showToast(isKm ? 'ហ្គេមទាំងអស់បានបើក ON រួចហើយ' : 'All filtered games are already ON', 'info');
                    return;
                  }
                  const targetIds = new Set(targetGames.map(g => g.id));
                  setGames(prev => prev.map(g => targetIds.has(g.id) ? { ...g, is_active: true, published: true } : g));
                  showToast(isKm ? `បានបើក ON លើ ${targetGames.length} ហ្គេម!` : `Turned ON ${targetGames.length} games!`, 'success');
                  try {
                    await Promise.all(targetGames.map(g => fetch(`/api/v1/admin/api-games/${g.id}/toggle`, { method: 'PATCH' })));
                    if (onRefreshParent) onRefreshParent();
                  } catch {
                    loadConnectedGames();
                  }
                }}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                title={isKm ? 'បើក ON ហ្គេមដែលកំពុង Filter ទាំងអស់' : 'Turn ON all filtered games'}
              >
                {isKm ? 'បើក ON ទាំងអស់' : 'All ON'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetGames = filteredGames.filter(g => g.is_active);
                  if (targetGames.length === 0) {
                    showToast(isKm ? 'ហ្គេមទាំងអស់បានបិទ OFF រួចហើយ' : 'All filtered games are already OFF', 'info');
                    return;
                  }
                  const targetIds = new Set(targetGames.map(g => g.id));
                  setGames(prev => prev.map(g => targetIds.has(g.id) ? { ...g, is_active: false, published: false } : g));
                  showToast(isKm ? `បានបិទ OFF លើ ${targetGames.length} ហ្គេម!` : `Turned OFF ${targetGames.length} games!`, 'info');
                  try {
                    await Promise.all(targetGames.map(g => fetch(`/api/v1/admin/api-games/${g.id}/toggle`, { method: 'PATCH' })));
                    if (onRefreshParent) onRefreshParent();
                  } catch {
                    loadConnectedGames();
                  }
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                title={isKm ? 'បិទ OFF ហ្គេមដែលកំពុង Filter ទាំងអស់' : 'Turn OFF all filtered games'}
              >
                {isKm ? 'បិទ OFF ទាំងអស់' : 'All OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Connected Games Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-5">{isKm ? 'ហ្គេម & ក្រុមហ៊ុន' : 'Game & Publisher'}</th>
                <th className="py-3.5 px-4">{isKm ? 'អ្នកផ្គត់ផ្គង់ API' : 'Connected API Provider'}</th>
                <th className="py-3.5 px-4 text-center">{isKm ? 'កញ្ចប់ពេជ្រ (SKUs)' : 'Diamonds / SKUs'}</th>
                <th className="py-3.5 px-4 text-center">{isKm ? 'ស្ថានភាពផ្សាយ (Publish)' : 'Storefront Status'}</th>
                <th className="py-3.5 px-5 text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="font-semibold">{isKm ? 'កំពុងទាញយកទិន្នន័យពី Database...' : 'Loading connected games catalog...'}</p>
                  </td>
                </tr>
              ) : filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Gamepad2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">{isKm ? 'រកមិនឃើញហ្គេមដែលត្រូវគ្នានឹងការស្វែងរកទេ' : 'No games match the current filters'}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isKm ? 'សូមផ្លាស់ប្ដូរពាក្យស្វែងរក ឬចុច Sync All ដើម្បីទាញយកពី API' : 'Try adjusting filters or click "Sync All" to import feeds.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => {
                  const isActionLoading = actionLoadingId === `game-${game.id}`;
                  const isActive = !!game.is_active;
                  const totalPkgs = game.products_count || (game.packages?.length || 0);
                  const activePkgs = game.active_products_count !== undefined 
                    ? game.active_products_count 
                    : (game.packages || []).filter((p: any) => p.is_active).length;

                  return (
                    <tr 
                      key={game.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isActive ? 'bg-slate-50/40 opacity-80' : ''
                      }`}
                    >
                      {/* Game Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-2xl bg-slate-900 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            <img 
                              src={game.thumbnail || '/images/games/default.png'} 
                              alt={game.name_en} 
                              className="w-full h-full object-contain"
                              onError={(e: any) => {
                                const s = (game.slug || game.id || '').toLowerCase();
                                if (s.includes('pubg')) e.target.src = '/images/games/pubg.png';
                                else if (s.includes('free-fire') || s.includes('ff')) e.target.src = '/images/games/freefire.png';
                                else if (s.includes('honor-of-kings') || s.includes('hok')) e.target.src = '/images/games/hok.png';
                                else if (s.includes('valorant') || s.includes('val')) e.target.src = '/images/games/valorant.png';
                                else if (s.includes('genshin')) e.target.src = '/images/games/genshin.png';
                                else if (s.includes('call-of-duty') || s.includes('codm')) e.target.src = '/images/games/codm.png';
                                else if (s.includes('wild-rift') || s.includes('wildrift')) e.target.src = '/images/games/wildrift.png';
                                else if (s.includes('roblox')) e.target.src = '/images/games/roblox.png';
                                else if (s.includes('steam')) e.target.src = '/images/games/steam.png';
                                else if (s.includes('aov')) e.target.src = '/images/games/aov.png';
                                else if (s.includes('fc-mobile') || s.includes('fcmobile')) e.target.src = '/images/games/fcmobile.png';
                                else e.target.src = '/images/games/mlbb.png';
                              }}
                            />
                            {!isActive && (
                              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                                <Power className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                                {game.publisher || 'Direct API'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {game.category || 'mobile'}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm truncate mt-0.5">
                              {isKm && game.name_km ? game.name_km : game.name_en}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate font-mono">
                              Slug: {game.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Connected Provider */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                            (game.provider_id === 'fazercards' || (game.provider_name || '').toLowerCase().includes('fazer'))
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            <Server className={`w-3 h-3 ${
                              (game.provider_id === 'fazercards' || (game.provider_name || '').toLowerCase().includes('fazer'))
                              ? 'text-purple-500'
                              : 'text-blue-500'
                            }`} />
                            <span>{game.provider_name || 'Active Wholesale API Provider'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ext ID: <span className="text-slate-600 font-semibold">{game.external_game_id && game.external_game_id !== '-' ? game.external_game_id : game.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Package Count Badge */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenDrawer(game)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 font-bold text-xs transition-all group"
                        >
                          <Layers className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>{activePkgs} / {totalPkgs} {isKm ? 'កញ្ចប់' : 'SKUs'}</span>
                        </button>
                      </td>

                      {/* ON / OFF Switch */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleToggleGame(game.id, isActive, game.name_en)}
                            disabled={isActionLoading}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full p-1 transition-all duration-300 focus:outline-none shadow-inner ${
                              isActive 
                                ? 'bg-emerald-500 shadow-emerald-500/20' 
                                : 'bg-slate-300'
                            } ${isActionLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:scale-105'}`}
                            title={isActive ? (isKm ? 'ចុចដើម្បីបិទ (OFF)' : 'Click to turn OFF') : (isKm ? 'ចុចដើម្បីបើក (ON)' : 'Click to turn ON')}
                          >
                            <span
                              className={`flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                                isActive ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-slate-400'
                              }`}
                            >
                              {isActionLoading ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : isActive ? (
                                <Check className="w-3 h-3 stroke-[3]" />
                              ) : (
                                <X className="w-3 h-3 stroke-[3]" />
                              )}
                            </span>
                          </button>

                          <span className={`text-[10px] font-black tracking-wider uppercase ${
                            isActive ? 'text-emerald-700 font-bold' : 'text-slate-400'
                          }`}>
                            {isActive ? 'ON (Live)' : 'OFF (Hidden)'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDrawer(game)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isKm ? 'គ្រប់គ្រងតម្លៃ' : 'Manage SKUs'}</span>
                          </button>

                          {isActive && (
                            <Link
                              href={`/games/${game.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                              title={isKm ? 'មើលលើ Storefront' : 'Preview on Storefront'}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            {isKm ? `បង្ហាញ ${filteredGames.length} ក្នុងចំណោម ${totalGamesCount} ហ្គេម API` : `Showing ${filteredGames.length} of ${totalGamesCount} connected games`}
          </span>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              {isKm ? 'ON: បង្ហាញលើ Storefront' : 'ON: Visible to Customers'}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              {isKm ? 'OFF: លាក់ពី Storefront (ទិន្នន័យរក្សាទុក ១០០%)' : 'OFF: Hidden (Data 100% Preserved)'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: DIAMOND / PRODUCT PACKAGES MANAGEMENT */}
      {/* ========================================================================= */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  <img 
                    src={selectedGame.thumbnail || '/images/games/default.png'} 
                    alt={selectedGame.name_en} 
                    className="w-full h-full object-contain"
                    onError={(e: any) => { e.target.src = '/images/games/mlbb.png'; }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      {isKm && selectedGame.name_km ? selectedGame.name_km : selectedGame.name_en}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedGame.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedGame.is_active ? 'GAME IS ON' : 'GAME IS OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isKm ? 'គ្រប់គ្រងកញ្ចប់ពេជ្រ និងកំណត់បិទ/បើក (ON/OFF) តាមកញ្ចប់នីមួយៗ' : 'Manage individual diamond/currency packages and pricing'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-500">
                    <span>Provider: <b className="text-purple-600">{selectedGame.provider_name || selectedGame.provider_id || 'SmileOne'}</b></span>
                    <span>•</span>
                    <span>Ext Game ID: <b className="text-slate-800">{selectedGame.external_game_id || selectedGame.id}</b></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedGame(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Game-Level Switch Bar */}
            <div className="px-6 py-3.5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">
                  {isKm ? 'ស្ថានភាពផ្សាយហ្គេមទាំងមូលលើ Storefront' : 'Master Game Publishing Switch'}
                </span>
              </div>

              <button
                onClick={() => handleToggleGame(selectedGame.id, selectedGame.is_active, selectedGame.name_en)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs ${
                  selectedGame.is_active 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-slate-700 text-white hover:bg-slate-800'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{selectedGame.is_active ? (isKm ? 'ហ្គេមកំពុងបើក (ON)' : 'Game is ON') : (isKm ? 'ហ្គេមកំពុងបិទ (OFF)' : 'Game is OFF')}</span>
              </button>
            </div>

            {/* Drawer Body / Packages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {isKm ? 'បញ្ជីកញ្ចប់ពេជ្រ / Denominations' : 'Diamond Packages & Pricing Matrix'} ({drawerPackages.length})
                </h4>
                <span className="text-xs font-bold text-emerald-700">
                  {drawerPackages.filter(p => p.is_active).length} {isKm ? 'កញ្ចប់កំពុងបើក (ON)' : 'Active SKUs'}
                </span>
              </div>

              {drawerLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-semibold">{isKm ? 'កំពុងផ្ទុកកញ្ចប់ពេជ្រ...' : 'Loading packages...'}</p>
                </div>
              ) : drawerPackages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">{isKm ? 'មិនទាន់មានកញ្ចប់ពេជ្រត្រូវបាន Sync ពី API ទេ' : 'No packages synced yet'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drawerPackages.map((pkg, idx) => {
                    const isPkgActive = pkg.is_active !== false;
                    const isPkgActionLoading = actionLoadingId === `pkg-${pkg.id}`;
                    const cost = pkg.cost_usd || 0;
                    const userPrice = pkg.price_user_usd || 0;
                    const resellerPrice = pkg.price_reseller_usd || 0;
                    const profit = Math.max(0, userPrice - cost);
                    const profitPercent = cost > 0 ? ((profit / cost) * 100).toFixed(1) : '15.0';

                    return (
                      <div 
                        key={`${pkg.id || pkg.external_product_id || 'pkg'}-${idx}`} 
                        className={`p-4 rounded-2xl border transition-all ${
                          isPkgActive 
                            ? 'bg-white border-slate-200 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-black text-slate-900 text-sm">
                                {isKm && pkg.name_km ? pkg.name_km : pkg.name_en}
                              </h5>
                              {pkg.popular && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              SKU / ID: <span className="text-slate-600 font-semibold">{pkg.provider_sku || pkg.id}</span>
                            </div>
                          </div>

                          {/* Individual SKU Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleProduct(pkg.id, isPkgActive, pkg.name_en)}
                              disabled={isPkgActionLoading}
                              className={`relative inline-flex h-6 w-12 items-center rounded-full p-0.5 transition-all duration-300 focus:outline-none shadow-inner ${
                                isPkgActive 
                                  ? 'bg-emerald-500 shadow-emerald-500/20' 
                                  : 'bg-slate-300'
                              } ${isPkgActionLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                              title={isPkgActive ? (isKm ? 'ចុចដើម្បីបិទកញ្ចប់នេះ (OFF)' : 'Click to disable SKU (OFF)') : (isKm ? 'ចុចដើម្បីបើកកញ្ចប់នេះ (ON)' : 'Click to enable SKU (ON)')}
                            >
                              <span
                                className={`flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                                  isPkgActive ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-slate-400'
                                }`}
                              >
                                {isPkgActionLoading ? (
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                ) : isPkgActive ? (
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                ) : (
                                  <X className="w-2.5 h-2.5 stroke-[3]" />
                                )}
                              </span>
                            </button>

                            <span className={`text-[10px] font-black uppercase w-8 ${
                              isPkgActive ? 'text-emerald-700' : 'text-slate-400'
                            }`}>
                              {isPkgActive ? 'ON' : 'OFF'}
                            </span>
                          </div>
                        </div>

                        {/* Pricing breakdown pill */}
                        <div className="mt-3 grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center text-xs">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{isKm ? 'ថ្លៃដើម API' : 'API Cost'}</p>
                            <p className="font-mono font-bold text-slate-700 mt-0.5">${cost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{isKm ? 'តម្លៃលក់រាយ' : 'Retail Price'}</p>
                            <p className="font-mono font-black text-blue-600 mt-0.5">${userPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{isKm ? 'លក់បន្ត B2B' : 'Reseller'}</p>
                            <p className="font-mono font-bold text-purple-600 mt-0.5">${resellerPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{isKm ? 'ចំណេញដុល្លារ' : 'Margin'}</p>
                            <p className="font-mono font-black text-emerald-600 mt-0.5">+${profit.toFixed(2)} ({profitPercent}%)</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {isKm ? 'ការកែប្រែនឹងចូលជាធរមានភ្លាមៗលើ Storefront' : 'All changes take effect in real-time'}
              </span>
              <button
                onClick={() => setSelectedGame(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                {isKm ? 'រួចរាល់' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
