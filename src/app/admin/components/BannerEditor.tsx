'use client';

import React, { useState, useEffect } from 'react';
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Check, 
  Eye, 
  Layers, 
  Edit3, 
  Power,
  Link as LinkIcon,
  Globe,
  X
} from 'lucide-react';

interface BannerEditorProps {
  language?: string;
  onRefreshParent?: () => void;
}

export default function BannerEditor({
  language = 'km',
  onRefreshParent
}: BannerEditorProps) {
  const isKm = language === 'km';

  // Hero Config state
  const [heroConfig, setHeroConfig] = useState<any>({
    badge_text_en: "0% Fee with Bakong KHQR across all Cambodian Banks",
    badge_text_km: "ទូទាត់តាម Bakong KHQR មិនគិតថ្លៃសេវា 0%",
    title_en: "Instant Game Top-Up",
    title_km: "បញ្ចូលទឹកប្រាក់ហ្គេម",
    highlight_en: "Fast & Secure",
    highlight_km: "លឿនរហ័ស & សុវត្ថិភាព",
    subtitle_en: "Automated instant credit delivery via Bakong KHQR, ABA Mobile, Wing Bank and ACLEDA into your game account.",
    subtitle_km: "ផ្ទេរប្រាក់តាមរយៈ Bakong KHQR, ABA Mobile, Wing Bank និង ACLEDA ចូលគណនីដោយស្វ័យប្រវត្តិ។",
    cta_primary_text_en: "Top Up Now (MLBB)",
    cta_primary_text_km: "បញ្ចូលប្រាក់ឥឡូវនេះ (MLBB)",
    cta_primary_url: "/games/mobile-legends",
    cta_secondary_text_en: "Check Order Status",
    cta_secondary_text_km: "ពិនិត្យស្ថានភាព",
    cta_secondary_url: "/order/track",
    stat_1_val_en: "Official",
    stat_1_val_km: "ផ្លូវការ",
    stat_1_label_en: "API Partner",
    stat_1_label_km: "ដៃគូផ្គត់ផ្គង់",
    stat_2_val_en: "< 30s",
    stat_2_val_km: "ក្រោម ៣០ វិនាទី",
    stat_2_label_en: "Instant Delivery",
    stat_2_label_km: "ល្បឿនបញ្ចូល",
    stat_3_val_en: "99.9%",
    stat_3_val_km: "៩៩.៩%",
    stat_3_label_en: "Success Rate",
    stat_3_label_km: "អត្រាជោគជ័យ",
    quick_cards: [
      { id: 'qc-1', badge_en: 'POPULAR', badge_km: 'POPULAR', badge_color: 'cyan', game_slug: 'mobile-legends', game_name_en: 'Mobile Legends', game_name_km: 'Mobile Legends', package_name_en: 'Weekly Pass', package_name_km: 'Weekly Pass', price_usd: 1.85, price_khr: 7585, target_url: '/games/mobile-legends', is_active: true },
      { id: 'qc-2', badge_en: 'TOP PICK', badge_km: 'TOP PICK', badge_color: 'yellow', game_slug: 'pubg-mobile', game_name_en: 'PUBG Mobile', game_name_km: 'PUBG Mobile', package_name_en: '325 UC', package_name_km: '325 UC', price_usd: 4.80, price_khr: 19680, target_url: '/games/pubg-mobile', is_active: true },
      { id: 'qc-3', badge_en: 'PROMO', badge_km: 'PROMO', badge_color: 'orange', game_slug: 'free-fire', game_name_en: 'Free Fire', game_name_km: 'Free Fire', package_name_en: '310 + 31 Diamonds', package_name_km: '310 + 31 Diamonds', price_usd: 2.95, price_khr: 12095, target_url: '/games/free-fire', is_active: true },
      { id: 'qc-4', badge_en: 'PC SEA', badge_km: 'PC SEA', badge_color: 'emerald', game_slug: 'valorant', game_name_en: 'VALORANT VP', game_name_km: 'VALORANT VP', package_name_en: '1,000 VP', package_name_km: '1,000 VP', price_usd: 7.99, price_khr: 32759, target_url: '/games/valorant', is_active: true }
    ],
    background_gradient: "from-blue-900 via-indigo-900 to-slate-900",
    background_image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
    is_active: true
  });

  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<'hero' | 'promo'>('promo');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Promo Banner Form Modal State
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleKm, setNewTitleKm] = useState('');
  const [newSubtitleEn, setNewSubtitleEn] = useState('');
  const [newSubtitleKm, setNewSubtitleKm] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80');
  const [newTargetUrl, setNewTargetUrl] = useState('/games/mobile-legends');
  const [newBadgeEn, setNewBadgeEn] = useState('HOT PROMO');
  const [newBadgeKm, setNewBadgeKm] = useState('ប្រូម៉ូសិនក្តៅៗ');
  const [newSortOrder, setNewSortOrder] = useState(1);

  // Edit Promo Banner Modal State
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleKm, setEditTitleKm] = useState('');
  const [editSubtitleEn, setEditSubtitleEn] = useState('');
  const [editSubtitleKm, setEditSubtitleKm] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editTargetUrl, setEditTargetUrl] = useState('');
  const [editBadgeEn, setEditBadgeEn] = useState('');
  const [editBadgeKm, setEditBadgeKm] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(1);
  const [editIsActive, setEditIsActive] = useState(true);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadBannerData = async () => {
    try {
      const safeFetchJson = async (res: Response) => {
        if (!res || !res.ok) return { success: false };
        try {
          return await res.json();
        } catch {
          return { success: false };
        }
      };

      setLoading(true);
      const [heroRes, bannersRes] = await Promise.all([
        fetch('/api/v1/admin/banners/hero'),
        fetch('/api/v1/admin/banners')
      ]);

      const heroData = await safeFetchJson(heroRes);
      const bannersData = await safeFetchJson(bannersRes);

      if (heroData.success && heroData.data) {
        setHeroConfig(heroData.data);
      }
      if (bannersData.success && bannersData.data) {
        setPromoBanners(bannersData.data);
      }
    } catch (err) {
      console.error('Failed to fetch banner data', err);
      showToast(isKm ? 'បរាជ័យក្នុងការទាញយកទិន្នន័យ Banner' : 'Failed to load banner settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBannerData();
  }, []);

  // Save Hero Banner Config
  const handleSaveHeroConfig = async () => {
    try {
      setSavingHero(true);
      const res = await fetch('/api/v1/admin/banners/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroConfig)
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          isKm 
            ? 'រក្សាទុក Banner និងព័ត៌មានទំព័រមុខបានជោគជ័យ! បង្ហាញលើ Storefront ភ្លាមៗ។' 
            : 'Hero Banner settings saved! Changes live on Storefront immediately.',
          'success'
        );
        if (onRefreshParent) onRefreshParent();
      } else {
        throw new Error(data.message || 'Save failed');
      }
    } catch (err) {
      showToast(isKm ? 'បរាជ័យក្នុងការរក្សាទុក' : 'Failed to save Hero Banner settings', 'error');
    } finally {
      setSavingHero(false);
    }
  };

  // Add Promo Banner
  const handleCreatePromoBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: newTitleEn,
          title_km: newTitleKm || newTitleEn,
          subtitle_en: newSubtitleEn,
          subtitle_km: newSubtitleKm || newSubtitleEn,
          image_url: newImageUrl,
          target_url: newTargetUrl,
          badge_en: newBadgeEn,
          badge_km: newBadgeKm || newBadgeEn,
          sort_order: Number(newSortOrder) || 1,
          is_active: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(isKm ? 'បានបន្ថែម Photo Banner ថ្មីបានជោគជ័យ' : 'New photo promo banner created successfully', 'success');
        setIsAddingBanner(false);
        setNewTitleEn('');
        setNewTitleKm('');
        setNewSubtitleEn('');
        setNewSubtitleKm('');
        loadBannerData();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      showToast(isKm ? 'បរាជ័យក្នុងការបន្ថែម Banner' : 'Failed to create banner', 'error');
    }
  };

  // Open Edit Banner Modal
  const openEditBannerModal = (banner: any) => {
    setEditingBanner(banner);
    setEditTitleEn(banner.title_en || '');
    setEditTitleKm(banner.title_km || '');
    setEditSubtitleEn(banner.subtitle_en || '');
    setEditSubtitleKm(banner.subtitle_km || '');
    setEditImageUrl(banner.image_url || '');
    setEditTargetUrl(banner.target_url || '/games/mobile-legends');
    setEditBadgeEn(banner.badge_en || 'HOT PROMO');
    setEditBadgeKm(banner.badge_km || 'ប្រូម៉ូសិន');
    setEditSortOrder(banner.sort_order || 1);
    setEditIsActive(banner.is_active !== false);
  };

  // Update Existing Promo Banner
  const handleUpdatePromoBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    try {
      const res = await fetch(`/api/v1/admin/banners/${editingBanner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: editTitleEn,
          title_km: editTitleKm || editTitleEn,
          subtitle_en: editSubtitleEn,
          subtitle_km: editSubtitleKm || editSubtitleEn,
          image_url: editImageUrl,
          target_url: editTargetUrl,
          badge_en: editBadgeEn,
          badge_km: editBadgeKm || editBadgeEn,
          sort_order: Number(editSortOrder) || 1,
          is_active: editIsActive
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(isKm ? 'កែប្រែទិន្នន័យ Banner រួចរាល់!' : 'Photo banner updated successfully!', 'success');
        setEditingBanner(null);
        loadBannerData();
        if (onRefreshParent) onRefreshParent();
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      showToast(isKm ? 'បរាជ័យក្នុងការកែប្រែ Banner' : 'Failed to update banner', 'error');
    }
  };

  // Toggle Promo Banner Active/Hidden Status
  const handleTogglePromoBanner = async (bannerId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/banners/${bannerId}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setPromoBanners(prev => prev.map(b => b.id === bannerId ? { ...b, is_active: data.is_active } : b));
        showToast(isKm ? 'ប្ដូរស្ថានភាព Banner រួចរាល់' : 'Banner status toggled', 'success');
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      showToast('Toggle failed', 'error');
    }
  };

  // Delete Promo Banner
  const handleDeletePromoBanner = async (bannerId: string) => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដថាលុប Photo Banner នេះចេញពីប្រព័ន្ធ?' : 'Are you sure you want to delete this photo banner?')) return;
    try {
      await fetch(`/api/v1/admin/banners/${bannerId}`, { method: 'DELETE' });
      setPromoBanners(prev => prev.filter(b => b.id !== bannerId));
      showToast(isKm ? 'បានលុប Banner រួចរាល់' : 'Photo banner deleted successfully', 'success');
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  // Delete All Promo Banners
  const handleDeleteAllBanners = async () => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដថាលុប Photo Banners ទាំងអស់ចេញពីប្រព័ន្ធ?' : 'Are you sure you want to delete ALL photo banners?')) return;
    try {
      const res = await fetch('/api/v1/admin/banners', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPromoBanners([]);
        showToast(isKm ? 'បានលុប Banner ទាំងអស់រួចរាល់' : 'All photo banners deleted successfully', 'success');
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      showToast('Delete all failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isKm ? 'គ្រប់គ្រង Photo Banners & Hero Slider Manager' : 'Hero Banners & Photo Slider Manager'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isKm 
                ? 'បន្ថែម កែប្រែ លុប និងកំណត់រូបភាព Photo Banners បង្ហាញលើទំព័រដើម Storefront' 
                : 'Add, edit, delete, set active status, and reorder full photo promo banners.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTabSub('promo')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTabSub === 'promo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{isKm ? 'ស្លាយរូបភាព Promo Photo Banners' : 'Photo Banners'} ({promoBanners.length})</span>
            </button>
            <button
              onClick={() => setActiveTabSub('hero')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTabSub === 'hero' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isKm ? 'Hero Config & Quick Cards' : 'Hero Headlines'}</span>
            </button>
          </div>

          {activeTabSub === 'promo' ? (
            <button
              onClick={() => setIsAddingBanner(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{isKm ? 'បន្ថែម Photo Banner ថ្មី' : 'Add Photo Banner'}</span>
            </button>
          ) : (
            <button
              onClick={handleSaveHeroConfig}
              disabled={savingHero}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
            >
              <Save className={`w-4 h-4 ${savingHero ? 'animate-spin' : ''}`} />
              <span>{savingHero ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុក Hero Config' : 'Save Hero Config')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PHOTO PROMO BANNERS MANAGER (FULL CRUD: ADD / EDIT / DELETE) */}
      {/* ========================================================================= */}
      {activeTabSub === 'promo' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100 gap-3 text-xs text-blue-900 font-medium">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{isKm ? 'គ្រប់ Banners ទាំងអស់ដែលបើក (ON) នឹងបង្ហាញក្នុង Hero Photo Carousel Slider នៅលើទំព័រដើមចម្បង' : 'All active (ON) banners auto-slide in the homepage hero carousel.'}</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {promoBanners.length > 0 && (
                <button
                  onClick={handleDeleteAllBanners}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isKm ? 'លុប Banners ទាំងអស់ (Delete All)' : 'Delete All Banners'}</span>
                </button>
              )}
              <button
                onClick={() => setIsAddingBanner(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isKm ? 'បន្ថែម Photo Banner' : 'Add Photo Banner'}</span>
              </button>
            </div>
          </div>

          {promoBanners.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-base">
                  {isKm ? 'មិនទាន់មាន Photo Banner នៅឡើយទេ' : 'No Photo Banners Found'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isKm 
                    ? 'ចុចប៊ូតុងខាងក្រោមដើម្បីបន្ថែម Photo Banner ថ្មីសម្រាប់បង្ហាញលើទំព័រដើម Storefront' 
                    : 'Click the button below to add your first high quality photo banner.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddingBanner(true)}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>{isKm ? 'បន្ថែម Photo Banner ថ្មី' : 'Add New Photo Banner'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promoBanners.map((b) => (
                <div key={b.id} className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between space-y-3 group hover:border-blue-300 transition-all">
                  <div className="h-44 bg-slate-900 relative overflow-hidden">
                    <img src={b.image_url} alt={b.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/20">
                      {b.badge_km || b.badge_en || 'PROMO'}
                    </span>

                    <button
                      onClick={() => handleTogglePromoBanner(b.id)}
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md transition-all ${
                        b.is_active ? 'bg-emerald-500 text-white border border-emerald-300' : 'bg-slate-900/80 text-slate-300 border border-slate-600'
                      }`}
                    >
                      {b.is_active ? 'ON (Active)' : 'OFF (Hidden)'}
                    </button>

                    <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                      Order: #{b.sort_order || 1}
                    </div>
                  </div>

                  <div className="p-5 space-y-2 flex-1">
                    <h4 className="font-black text-slate-900 text-sm">{isKm && b.title_km ? b.title_km : b.title_en}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{isKm && b.subtitle_km ? b.subtitle_km : b.subtitle_en}</p>
                    
                    <div className="text-[11px] text-blue-600 font-mono truncate flex items-center gap-1 pt-1">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{b.target_url}</span>
                    </div>
                  </div>

                  {/* Banner Actions: EDIT | TOGGLE | DELETE */}
                  <div className="p-5 pt-0 flex items-center gap-2 border-t border-slate-100">
                    <button
                      onClick={() => openEditBannerModal(b)}
                      className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isKm ? 'កែប្រែ (Edit)' : 'Edit'}</span>
                    </button>

                    <button
                      onClick={() => handleTogglePromoBanner(b.id)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1 transition-colors ${
                        b.is_active ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                      title="Toggle Status"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{b.is_active ? (isKm ? 'បិទ' : 'OFF') : (isKm ? 'បើក' : 'ON')}</span>
                    </button>

                    <button
                      onClick={() => handleDeletePromoBanner(b.id)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition-colors"
                      title="Delete Banner Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PROMO BANNER MODAL */}
      {/* ========================================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {isKm ? 'កែប្រែទិន្នន័យ Photo Banner' : 'Edit Photo Promo Banner'}
                </h3>
              </div>
              <button onClick={() => setEditingBanner(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePromoBanner} className="space-y-4 text-xs">
              {/* Photo Image URL & Presets */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>{isKm ? 'រូបភាព Banner Photo URL (Image URL)' : 'Banner Photo URL'} <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-blue-600">High Quality Photo</span>
                </label>
                <input
                  type="url"
                  required
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://example.com/photo-banner.jpg"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 text-xs"
                />

                {/* Preset Photo Image Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">{isKm ? 'រូបភាពគំរូ៖' : 'Presets:'}</span>
                  <button
                    type="button"
                    onClick={() => setEditImageUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 font-bold"
                  >
                    MLBB
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditImageUrl('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-orange-100 text-orange-800 hover:bg-orange-200 font-bold"
                  >
                    Free Fire
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditImageUrl('https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1600&auto=format&fit=crop&q=80')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-bold"
                  >
                    PUBG Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditImageUrl('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold"
                  >
                    VALORANT
                  </button>
                </div>

                {/* Preview Thumbnail */}
                {editImageUrl && (
                  <div className="h-28 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-300 mt-2">
                    <img src={editImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">Preview</span>
                  </div>
                )}
              </div>

              {/* Title Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title (KM) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editTitleKm}
                    onChange={(e) => setEditTitleKm(e.target.value)}
                    placeholder="ប្រូម៉ូសិន ពេជ្រ MLBB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title (EN) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editTitleEn}
                    onChange={(e) => setEditTitleEn(e.target.value)}
                    placeholder="MLBB Promo Diamonds"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Subtitle Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtitle (KM)</label>
                  <input
                    type="text"
                    value={editSubtitleKm}
                    onChange={(e) => setEditSubtitleKm(e.target.value)}
                    placeholder="បញ្ចូលស្វ័យប្រវត្តិតាម KHQR 24/7"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtitle (EN)</label>
                  <input
                    type="text"
                    value={editSubtitleEn}
                    onChange={(e) => setEditSubtitleEn(e.target.value)}
                    placeholder="Instant Auto-Delivery via KHQR"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Target Link & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Link URL <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editTargetUrl}
                    onChange={(e) => setEditTargetUrl(e.target.value)}
                    placeholder="/games/mobile-legends"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 mb-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    <button type="button" onClick={() => setEditTargetUrl('/games/mobile-legends')} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono">MLBB</button>
                    <button type="button" onClick={() => setEditTargetUrl('/games/free-fire')} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono">Free Fire</button>
                    <button type="button" onClick={() => setEditTargetUrl('/games/pubg-mobile')} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono">PUBG</button>
                    <button type="button" onClick={() => setEditTargetUrl('/games/honor-of-kings')} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono">HoK</button>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Text (KM / EN)</label>
                  <input
                    type="text"
                    value={editBadgeKm}
                    onChange={(e) => setEditBadgeKm(e.target.value)}
                    placeholder="ប្រូម៉ូសិន / HOT PROMO"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Sort Order & Active Switch */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sort Order Position</label>
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                    />
                    <span>{isKm ? 'បើកបង្ហាញ (Active Status ON)' : 'Active Status (ON)'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isKm ? 'រក្សាទុកការប្រែ' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW PROMO BANNER MODAL */}
      {/* ========================================================================= */}
      {isAddingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">{isKm ? 'បន្ថែម Photo Banner ថ្មី' : 'Add New Photo Promo Banner'}</h3>
              </div>
              <button onClick={() => setIsAddingBanner(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromoBanner} className="space-y-4 text-xs">
              {/* Photo Image URL & Presets */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>{isKm ? 'រូបភាព Banner Photo URL (Image URL)' : 'Banner Photo URL'} <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-blue-600">High Quality Photo</span>
                </label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/photo-banner.jpg"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 text-xs"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">{isKm ? 'រូបភាពគំរូ៖' : 'Presets:'}</span>
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 font-bold"
                  >
                    MLBB
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-orange-100 text-orange-800 hover:bg-orange-200 font-bold"
                  >
                    Free Fire
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1600&auto=format&fit=crop&q=80')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-bold"
                  >
                    PUBG Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold"
                  >
                    VALORANT
                  </button>
                </div>

                {newImageUrl && (
                  <div className="h-28 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-300 mt-2">
                    <img src={newImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">Preview</span>
                  </div>
                )}
              </div>

              {/* Title Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title (KM) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newTitleKm}
                    onChange={(e) => setNewTitleKm(e.target.value)}
                    placeholder="ប្រូម៉ូសិន ពេជ្រ MLBB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title (EN) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    placeholder="MLBB Promo Diamonds"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Subtitle Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtitle (KM)</label>
                  <input
                    type="text"
                    value={newSubtitleKm}
                    onChange={(e) => setNewSubtitleKm(e.target.value)}
                    placeholder="បញ្ចូលស្វ័យប្រវត្តិតាម KHQR 24/7"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtitle (EN)</label>
                  <input
                    type="text"
                    value={newSubtitleEn}
                    onChange={(e) => setNewSubtitleEn(e.target.value)}
                    placeholder="Instant Auto-Delivery via KHQR"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Target Link & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Link URL <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newTargetUrl}
                    onChange={(e) => setNewTargetUrl(e.target.value)}
                    placeholder="/games/mobile-legends"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 mb-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    <button type="button" onClick={() => setNewTargetUrl('/games/mobile-legends')} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono">MLBB</button>
                    <button type="button" onClick={() => setNewTargetUrl('/games/free-fire')} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono">Free Fire</button>
                    <button type="button" onClick={() => setNewTargetUrl('/games/pubg-mobile')} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono">PUBG</button>
                    <button type="button" onClick={() => setNewTargetUrl('/games/honor-of-kings')} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono">HoK</button>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Text (KM / EN)</label>
                  <input
                    type="text"
                    value={newBadgeKm}
                    onChange={(e) => setNewBadgeKm(e.target.value)}
                    placeholder="ប្រូម៉ូសិន / HOT PROMO"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sort Order Position</label>
                <input
                  type="number"
                  value={newSortOrder}
                  onChange={(e) => setNewSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingBanner(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md"
                >
                  Create Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: HERO BANNER LIVE EDITOR & HEADLINE CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTabSub === 'hero' && (
        <div className="space-y-6">
          {/* Live Preview Header Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>{isKm ? 'ការបង្ហាញសាកល្បងជាក់ស្ដែង (Live Storefront Preview)' : 'Live Storefront Preview'}</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Dynamic Real-time Sync
              </span>
            </div>

            {/* Simulated Hero Banner */}
            <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 font-sans border border-blue-500/20 shadow-lg">
              {heroConfig.background_image_url && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={heroConfig.background_image_url}
                    alt="Hero Photo Background"
                    className="w-full h-full object-cover object-center opacity-35 mix-blend-luminosity pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-blue-950/60 pointer-events-none" />
                </div>
              )}

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-cyan-200">
                    <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
                    <span>{isKm ? heroConfig.badge_text_km : heroConfig.badge_text_en}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                    {isKm ? heroConfig.title_km : heroConfig.title_en} <br />
                    <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent">
                      {isKm ? heroConfig.highlight_km : heroConfig.highlight_en}
                    </span>
                  </h1>

                  <p className="text-blue-100 text-xs leading-relaxed max-w-lg">
                    {isKm ? heroConfig.subtitle_km : heroConfig.subtitle_en}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="px-4 py-2.5 rounded-xl bg-white text-blue-900 font-black text-xs flex items-center gap-1.5 shadow-sm">
                      <Zap className="w-3.5 h-3.5 fill-blue-900" />
                      <span>{isKm ? heroConfig.cta_primary_text_km : heroConfig.cta_primary_text_en}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>

                    <div className="px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{isKm ? heroConfig.cta_secondary_text_km : heroConfig.cta_secondary_text_en}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  {(heroConfig.quick_cards || []).slice(0, 4).map((card: any, idx: number) => (
                    <div key={idx} className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3">
                      <div className="text-[10px] font-bold uppercase text-cyan-300">{isKm ? card.badge_km : card.badge_en}</div>
                      <div className="text-xs font-bold text-white truncate">{isKm ? card.game_name_km : card.game_name_en}</div>
                      <div className="text-[10px] text-blue-200 truncate">{isKm ? card.package_name_km : card.package_name_en}</div>
                      <div className="mt-1 text-white font-black text-xs">${card.price_usd} <span className="text-[9px] text-blue-200">/ ៛{(card.price_khr || 0).toLocaleString()}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>1. {isKm ? 'ចំណងជើង & រូបភាព Hero Photo' : 'Hero Headline & Photo Image'}</span>
              </h3>

              {/* Hero Background Photo Editor */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    {isKm ? 'រូបភាព Hero Banner (Hero Photo Image URL)' : 'Hero Banner Photo URL'}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">{heroConfig.background_image_url ? 'Photo Set' : 'Default Photo'}</span>
                </label>
                <input
                  type="text"
                  value={heroConfig.background_image_url || ''}
                  onChange={(e) => setHeroConfig({ ...heroConfig, background_image_url: e.target.value })}
                  placeholder="https://example.com/banner-photo.jpg"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">{isKm ? 'រូបភាពគំរូ៖' : 'Presets:'}</span>
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, background_image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80' })}
                    className="text-[10px] px-2 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 font-bold"
                  >
                    MLBB
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, background_image_url: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1600&auto=format&fit=crop&q=80' })}
                    className="text-[10px] px-2 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-bold"
                  >
                    PUBG Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, background_image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80' })}
                    className="text-[10px] px-2 py-1 rounded-lg bg-orange-100 text-orange-800 hover:bg-orange-200 font-bold"
                  >
                    Free Fire
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, background_image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80' })}
                    className="text-[10px] px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold"
                  >
                    VALORANT
                  </button>
                </div>
              </div>

              {/* Badge Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {isKm ? 'អត្ថបទ Promo Ticker Badge (ខាងលើ)' : 'Top Badge Ticker Text'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={heroConfig.badge_text_km || ''}
                    onChange={(e) => setHeroConfig({ ...heroConfig, badge_text_km: e.target.value })}
                    placeholder="ភាសាខ្មែរ (ឧ. ទូទាត់តាម Bakong...)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                  <input
                    type="text"
                    value={heroConfig.badge_text_en || ''}
                    onChange={(e) => setHeroConfig({ ...heroConfig, badge_text_en: e.target.value })}
                    placeholder="English (0% Fee with Bakong...)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Title & Highlight */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {isKm ? 'ចំណងជើងចម្បង (Title & Highlight)' : 'Main Title & Highlight Text'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Title (KM / EN)</span>
                    <input
                      type="text"
                      value={heroConfig.title_km || ''}
                      onChange={(e) => setHeroConfig({ ...heroConfig, title_km: e.target.value })}
                      placeholder="បញ្ចូលទឹកប្រាក់ហ្គេម"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold mb-2 text-slate-900"
                    />
                    <input
                      type="text"
                      value={heroConfig.title_en || ''}
                      onChange={(e) => setHeroConfig({ ...heroConfig, title_en: e.target.value })}
                      placeholder="Instant Game Top-Up"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Highlight Gradient (KM / EN)</span>
                    <input
                      type="text"
                      value={heroConfig.highlight_km || ''}
                      onChange={(e) => setHeroConfig({ ...heroConfig, highlight_km: e.target.value })}
                      placeholder="លឿនរហ័ស & សុវត្ថិភាព"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold mb-2 text-blue-600"
                    />
                    <input
                      type="text"
                      value={heroConfig.highlight_en || ''}
                      onChange={(e) => setHeroConfig({ ...heroConfig, highlight_en: e.target.value })}
                      placeholder="Fast & Secure"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {isKm ? 'អត្ថបទពន្យល់ (Subtitle Description)' : 'Subtitle Description'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    value={heroConfig.subtitle_km || ''}
                    onChange={(e) => setHeroConfig({ ...heroConfig, subtitle_km: e.target.value })}
                    placeholder="ភាសាខ្មែរ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                  <textarea
                    rows={2}
                    value={heroConfig.subtitle_en || ''}
                    onChange={(e) => setHeroConfig({ ...heroConfig, subtitle_en: e.target.value })}
                    placeholder="English description..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
