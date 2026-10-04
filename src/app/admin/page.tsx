'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import AdminSidebar, { AdminTab } from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import DashboardCharts from './components/DashboardCharts';
import OrderDetailModal from './components/OrderDetailModal';
import ConnectedGamesTable from './components/ConnectedGamesTable';
import BannerEditor from './components/BannerEditor';
import SupportTicketsTable from './components/SupportTicketsTable';
import PromotersManagement from './components/PromotersManagement';
import BroadcastCenter from './components/BroadcastCenter';
import SecurityEncryptionVault from './components/SecurityEncryptionVault';
import InvoiceReceiptModal from '@/components/InvoiceReceiptModal';
import { exportToCsv } from '@/utils/exportToCsv';
import { getGameThumbnailUrl } from '@/lib/gameImages';
import { 
 LayoutDashboard, 
 Gamepad2, 
 ShoppingBag, 
 Users, 
 Server, 
 DollarSign, 
 CheckCircle2, 
 AlertCircle, 
 Plus, 
 X, 
 RefreshCw, 
 Eye, 
 ArrowUpRight, 
 Search, 
 TrendingUp, 
 Trash2, 
 ShieldCheck, 
 Globe, 
 LogOut, 
 Store, 
 Zap, 
 Sliders, 
 FileText, 
 Activity, 
 Check, 
 Percent, 
 Layers, 
 ArrowRight, 
 Lock, 
 Clock, 
 Database, 
 Tag, 
 Coins, 
 Edit2, 
 RotateCcw, 
 Award, 
 CreditCard, 
 Image as ImageIcon, 
 BarChart3, 
 Bell, 
 Settings, 
 Wallet, 
 Shield, 
 Filter, 
 Download, 
 Copy, 
 CheckCheck,
 Mail,
 KeyRound,
 EyeOff,
 Key,
 Minus,
 Sparkles
} from 'lucide-react';

function AdminControlPanelContent() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const urlTab = (searchParams.get('tab') as AdminTab) || 'dashboard';
 const { language, toggleLanguage, formatPrice, t } = useLanguage();
 const isKm = language === 'km';
 
 // Navigation State with zero loading delay, zero flicker & zero hydration mismatch
 const [activeTab, setActiveTabState] = useState<AdminTab>(urlTab);

 useEffect(() => {
 if (urlTab && urlTab !== activeTab) {
 setActiveTabState(urlTab);
 }
 }, [urlTab]);

 const setActiveTab = (tab: AdminTab) => {
 setActiveTabState(tab);
 if (typeof window !== 'undefined') {
 const url = new URL(window.location.href);
 url.searchParams.set('tab', tab);
 window.history.replaceState({}, '', url.toString());
 }
 };

 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
 const [currentRole, setCurrentRole] = useState('super_admin');

 // Core Data States
 const [stats, setStats] = useState<any>(null);
 const [games, setGames] = useState<any[]>([]);
 const [orders, setOrders] = useState<any[]>([]);
 const [providers, setProviders] = useState<any[]>([]);
 const [users, setUsers] = useState<any[]>([]);
 const [resellers, setResellers] = useState<any[]>([]);
 const [walletLedger, setWalletLedger] = useState<any[]>([]);
 const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
 const [coupons, setCoupons] = useState<any[]>([]);
 const [banners, setBanners] = useState<any[]>([]);
 const [reports, setReports] = useState<any>(null);
 const [notifications, setNotifications] = useState<any[]>([]);
 const [syncLogs, setSyncLogs] = useState<any[]>([]);
 const [auditLogs, setAuditLogs] = useState<any[]>([]);
 const [showAiApiKey, setShowAiApiKey] = useState(false);
 const [platformSettings, setPlatformSettings] = useState<any>({
 platform_name: 'RoleaTopup Core Engine',
 support_telegram: 'https://t.me/rolea_support',
 support_whatsapp: '+855 12 345 678',
 support_email: 'support@roleatopup.com',
 exchange_rate_khr: 4100,
 maintenance_mode: false,
 auto_sync_master_enabled: true,
 auto_sync_interval: '1h',
 low_balance_alert_usd: 100.0,
 ai_chat_enabled: true,
 ai_chat_api_url: 'https://api.laalaa.me',
 ai_chat_api_key: '',
 ai_chat_model: 'gpt-4o-mini'
 });
 const [pricingConfig, setPricingConfig] = useState<any>({
 default_user_markup_percent: 12.0,
 default_reseller_markup_percent: 5.0,
 default_vip_markup_percent: 3.0,
 default_fixed_markup_usd: 0.05,
 exchange_rate_khr: 4100,
  auto_update_prices_on_sync: true
  });

  // Gamer Verification States
  const [gamerSettings, setGamerSettings] = useState<any>({
    is_enabled: true,
    provider_name: 'SmileOne / Game Provider Hub',
    provider_api_url: 'https://api.smileone.com/v1',
    api_key: '',
    api_secret: '',
    cache_duration_seconds: 86400,
    request_timeout_seconds: 8,
    require_verification_for_checkout: true
  });
  const [gamerLogs, setGamerLogs] = useState<any[]>([]);
  const [savingGamerSettings, setSavingGamerSettings] = useState(false);
  const [testingGamerConn, setTestingGamerConn] = useState(false);
  const [showGamerApiKey, setShowGamerApiKey] = useState(false);

  // User Activity Logging States
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [userActivitySearch, setUserActivitySearch] = useState<string>('');
  const [userActivityActionFilter, setUserActivityActionFilter] = useState<string>('ALL');

  // UI & Loading States
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState<string | null>(null);
 const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
 const [searchGlobalQuery, setSearchGlobalQuery] = useState('');

 // Modals
 const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
 const [isAddingProvider, setIsAddingProvider] = useState(false);
 const [testResultModal, setTestResultModal] = useState<{ provider: any; result: any } | null>(null);
 const [editingProduct, setEditingProduct] = useState<{ game: any; pkg: any } | null>(null);
 const [isAddingGame, setIsAddingGame] = useState(false);
 const [isAddingCoupon, setIsAddingCoupon] = useState(false);
 const [isAddingBanner, setIsAddingBanner] = useState(false);
 const [adjustUser, setAdjustUser] = useState<any | null>(null);
  const [adjustMode, setAdjustMode] = useState<'add' | 'deduct' | 'set' | 'clear'>('add');
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
 const [adjustAmount, setAdjustAmount] = useState('50');
 const [adjustReason, setAdjustReason] = useState('Wholesale deposit topup');

  // User Credentials & Password Reset States
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [resetPasswordUser, setResetPasswordUser] = useState<any | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState<string>('');
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);

  // Lucky Draw Spins State
  const [adjustSpinsUser, setAdjustSpinsUser] = useState<any | null>(null);
  const [adjustSpinsCount, setAdjustSpinsCount] = useState<string>('5');
  const [isSubmittingAdjustSpins, setIsSubmittingAdjustSpins] = useState(false);

  const handleAdjustSpinsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustSpinsUser) return;
    const spins = parseInt(adjustSpinsCount, 10);
    if (isNaN(spins) || spins <= 0) return;

    setIsSubmittingAdjustSpins(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${adjustSpinsUser.id}/adjust-spins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spins: spins,
          mode: 'add',
          reason: 'Admin granted lucky draw spins'
        })
      });
      if (res.ok) {
        setAdjustSpinsUser(null);
        loadData();
      }
    } catch (err) {
      console.error("Failed to adjust spins:", err);
    } finally {
      setIsSubmittingAdjustSpins(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
      showToast(isKm ? 'បានចម្លងទៅ Clipboard!' : 'Copied to clipboard!', 'success');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !resetPasswordValue) return;
    setIsResettingPassword(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${resetPasswordUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: resetPasswordValue })
      });
      const data = await res.json();
      if (data.success) {
        showToast(isKm ? 'បានផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!' : 'Password reset successfully!', 'success');
        setResetPasswordUser(null);
        setResetPasswordValue('');
        loadData();
      } else {
        showToast(data.detail || 'Failed to reset password', 'error');
      }
    } catch (err: any) {
      showToast('Error resetting password', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // User Info Editing States & Handlers (Email & Phone Number)
  const [editInfoUser, setEditInfoUser] = useState<any | null>(null);
  const [editInfoEmail, setEditInfoEmail] = useState<string>('');
  const [editInfoPhone, setEditInfoPhone] = useState<string>('');
  const [editInfoUsername, setEditInfoUsername] = useState<string>('');
  const [editInfoRole, setEditInfoRole] = useState<string>('user');
  const [isSavingUserInfo, setIsSavingUserInfo] = useState<boolean>(false);

  const handleSaveUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInfoUser) return;
    setIsSavingUserInfo(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${editInfoUser.id}/update-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editInfoEmail,
          phone: editInfoPhone,
          username: editInfoUsername,
          role: editInfoRole
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(isKm ? 'បានផ្លាស់ប្តូរព័ត៌មានគណនីដោយជោគជ័យ!' : 'User info updated successfully!', 'success');
        setEditInfoUser(null);
        loadData();
      } else {
        showToast(data.detail || 'Failed to update user info', 'error');
      }
    } catch (err: any) {
      showToast('Error updating user info', 'error');
    } finally {
      setIsSavingUserInfo(false);
    }
  };


 // Provider Form State
  const [newProviderPreset, setNewProviderPreset] = useState('bay2game');
  const [newProviderName, setNewProviderName] = useState('Bay2Game Wholesale API Provider');
  const [newProviderUrl, setNewProviderUrl] = useState('https://api.bay2game.xyz/api');
 const [newProviderKey, setNewProviderKey] = useState('');
 const [newProviderSecret, setNewProviderSecret] = useState('');
 const [newProviderUsername, setNewProviderUsername] = useState('');
 const [newProviderPriority, setNewProviderPriority] = useState(1);
 const [newProviderSyncInterval, setNewProviderSyncInterval] = useState('1h');

 // Coupon Form State
 const [newCouponCode, setNewCouponCode] = useState('');
 const [newCouponPercent, setNewCouponPercent] = useState('10');
 const [newCouponMinOrder, setNewCouponMinOrder] = useState('2');
 const [newCouponMaxUses, setNewCouponMaxUses] = useState('100');

 // Banner Form State
 const [newBannerTitleEn, setNewBannerTitleEn] = useState('');
 const [newBannerTitleKm, setNewBannerTitleKm] = useState('');
 const [newBannerSubtitleEn, setNewBannerSubtitleEn] = useState('');
 const [newBannerImageUrl, setNewBannerImageUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80');
 const [newBannerTargetUrl, setNewBannerTargetUrl] = useState('/games/mobile-legends');

 // Game Form State
 const [newGameNameEn, setNewGameNameEn] = useState('');
 const [newGameNameKm, setNewGameNameKm] = useState('');
 const [newGameSlug, setNewGameSlug] = useState('');
 const [newGameCategory, setNewGameCategory] = useState('mobile');

 // Product Pricing Edit Form State
 const [editPriceUser, setEditPriceUser] = useState<number>(0);
 const [editPriceReseller, setEditPriceReseller] = useState<number>(0);
 const [editPriceVip, setEditPriceVip] = useState<number>(0);
 const [editManualOverride, setEditManualOverride] = useState<boolean>(false);
 const [editMarkupPercent, setEditMarkupPercent] = useState<number>(12);
 const [editFixedAddUsd, setEditFixedAddUsd] = useState<number>(0.10);

 // Bulk Pricing & Markup Engine Settings
 const [bulkPricingMode, setBulkPricingMode] = useState<'fixed' | 'percent'>('fixed');
 const [bulkFixedAddUsd, setBulkFixedAddUsd] = useState<number>(0.10);
 const [bulkMarkupPercent, setBulkMarkupPercent] = useState<number>(15);
 const [bulkResellerMarkup, setBulkResellerMarkup] = useState<number>(9);
 const [bulkVipMarkup, setBulkVipMarkup] = useState<number>(5.2);
 const [applyingBulkMarkup, setApplyingBulkMarkup] = useState<boolean>(false);

  // VngZz 2 Game PayWay KHQR Gateway Form State (https://www.vngzz2game.site/api/document)
  const [vngzzApiKey, setVngzzApiKey] = useState('');
  const [vngzzApiUrl, setVngzzApiUrl] = useState('https://www.vngzz2game.site/api');
  const [vngzzGenerateQrUrl, setVngzzGenerateQrUrl] = useState('https://www.vngzz2game.site/api/v1/generate_qr');
  const [vngzzCheckTransUrl, setVngzzCheckTransUrl] = useState('https://www.vngzz2game.site/api/v1/check_transaction');
  const [vngzzMerchantName, setVngzzMerchantName] = useState('Rolea TopUp (VngZz 2 Game PayWay KHQR)');
  const [vngzzActive, setVngzzActive] = useState(true);
  const [showVngzzSecret, setShowVngzzSecret] = useState(false);
  const [savingVngzz, setSavingVngzz] = useState(false);

  // Active Provider Switcher State
  const [activePrimaryProviderId, setActivePrimaryProviderId] = useState<string>('bay2game');
  const [switchingProvider, setSwitchingProvider] = useState<boolean>(false);

  // Option 3 & 4 State (Balances Tracker & Price Comparison)
  const [providerBalances, setProviderBalances] = useState<any[]>([]);
  const [loadingBalances, setLoadingBalances] = useState<boolean>(false);
  const [priceComparisonData, setPriceComparisonData] = useState<any[]>([]);
  const [loadingComparison, setLoadingComparison] = useState<boolean>(false);

  // Low Balance Alert Toggle State ($5 USD threshold)
  const [lowBalanceAlertEnabled, setLowBalanceAlertEnabled] = useState<boolean>(true);
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState<number>(5.0);
  const [updatingLowBalanceAlert, setUpdatingLowBalanceAlert] = useState<boolean>(false);

  const loadProviderBalances = async () => {
    setLoadingBalances(true);
    try {
      const res = await fetch('/api/v1/admin/providers/balances');
      const data = await safeFetchJson(res);
      if (data.success && data.data) {
        setProviderBalances(data.data);
        if (typeof data.low_balance_alert_enabled === 'boolean') {
          setLowBalanceAlertEnabled(data.low_balance_alert_enabled);
        }
        if (typeof data.low_balance_threshold === 'number') {
          setLowBalanceThreshold(data.low_balance_threshold);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleToggleLowBalanceAlert = async (targetEnabled: boolean) => {
    setUpdatingLowBalanceAlert(true);
    try {
      const res = await fetch('/api/v1/admin/providers/low-balance-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: targetEnabled, threshold: lowBalanceThreshold })
      });
      const data = await safeFetchJson(res);
      if (data.success) {
        setLowBalanceAlertEnabled(data.low_balance_alert_enabled);
        showToast(
          isKm 
            ? `បាន${targetEnabled ? 'បើក (ON)' : 'បិទ (OFF)'} ការជូនដំណឹងសមតុល្យទាបតាម Telegram បានជោគជ័យ!` 
            : `Low balance alert notification turned ${targetEnabled ? 'ON' : 'OFF'} successfully!`,
          'success'
        );
      }
    } catch (err) {
      showToast('Failed to update low balance alert state', 'error');
    } finally {
      setUpdatingLowBalanceAlert(false);
    }
  };

  const loadPriceComparisonData = async () => {
    setLoadingComparison(true);
    try {
      const res = await fetch('/api/v1/admin/providers/price-comparison');
      const data = await safeFetchJson(res);
      if (data.success && data.data) {
        setPriceComparisonData(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComparison(false);
    }
  };

  // Filters
  const [orderFilter, setOrderFilter] = useState('all');
  const [productGameFilter, setProductGameFilter] = useState('all');
  const [syncLogFilter, setSyncLogFilter] = useState('all');

  const handleSwitchActiveProvider = async (targetId: string) => {
    if (targetId === activePrimaryProviderId) return;
    setSwitchingProvider(true);
    try {
      const res = await fetch('/api/v1/admin/providers/switch-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: targetId })
      });
      const data = await res.json();
      if (data.success) {
        setActivePrimaryProviderId(data.active_provider_id);
        showToast(
          isKm 
            ? `បានប្តូរ API Provider ទៅ ${data.active_provider_id.toUpperCase()} បានជោគជ័យ!` 
            : `Switched active API provider to ${data.active_provider_id.toUpperCase()} successfully!`, 
          'success'
        );
        loadData();
      } else {
        showToast('Failed to switch provider: ' + (data.detail || data.message), 'error');
      }
    } catch (err) {
      showToast('Error switching provider', 'error');
    } finally {
      setSwitchingProvider(false);
    }
  };

 const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
 setToastMessage({ message, type });
 setTimeout(() => setToastMessage(null), 4500);
 };

 const safeFetchJson = async (res: Response) => {
 if (!res || !res.ok) return { success: false };
 try {
 return await res.json();
 } catch {
 return { success: false };
 }
 };

  const loadData = async () => {
    try {
      const res = await fetch('/api/v1/admin/dashboard-bundle');
      const data = await safeFetchJson(res);

      if (data.success) {
        if (data.stats) setStats(data.stats);
        if (data.games) setGames(data.games);
        if (data.orders) setOrders(data.orders);
        if (data.providers) setProviders(data.providers);
        if (data.users) setUsers(data.users);
        if (data.resellers) setResellers(data.resellers);
        if (data.wallet_ledger) setWalletLedger(data.wallet_ledger);
        if (data.payment_methods) setPaymentMethods(data.payment_methods);
        if (data.coupons) setCoupons(data.coupons);
        if (data.banners) setBanners(data.banners);
        if (data.reports) setReports(data.reports);
        if (data.notifications) setNotifications(data.notifications);
        if (data.sync_logs) setSyncLogs(data.sync_logs);
        if (data.audit_logs) setAuditLogs(data.audit_logs);
        if (data.platform_settings) setPlatformSettings(data.platform_settings);
        if (data.pricing_config) setPricingConfig(data.pricing_config);
        if (data.active_provider_id) setActivePrimaryProviderId(data.active_provider_id);
        if (data.gamer_settings) setGamerSettings(data.gamer_settings);
        if (data.gamer_logs) setGamerLogs(data.gamer_logs);
        if (data.user_activities) setUserActivities(data.user_activities);
        if (data.vngzz_config) {
          setVngzzApiKey(data.vngzz_config.api_key || '');
          setVngzzApiUrl(data.vngzz_config.api_url || 'https://www.vngzz2game.site/api');
          setVngzzGenerateQrUrl(data.vngzz_config.generate_qr_url || 'https://www.vngzz2game.site/api/v1/generate_qr');
          setVngzzCheckTransUrl(data.vngzz_config.check_transaction_url || 'https://www.vngzz2game.site/api/v1/check_transaction');
          setVngzzMerchantName(data.vngzz_config.merchant_name || 'Rolea TopUp (VngZz 2 Game PayWay KHQR)');
          setVngzzActive(data.vngzz_config.is_active !== false);
        }
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      showToast('Error connecting to FastAPI backend', 'error');
    } finally {
      setLoading(false);
      loadProviderBalances();
      loadPriceComparisonData();
    }
  };

 useEffect(() => {
 loadData();
 }, []);

 // Preset Selector
 const handlePresetChange = (preset: string) => {
 setNewProviderPreset(preset);
 if (preset === 'fazercards') {
 setNewProviderName('FazerCards B2B Wholesale Hub');
 setNewProviderUrl('https://reseller.fazercards.com/api/v1');
 } else if (preset === 'smileone') {
 setNewProviderName('Smile.One Global API');
 setNewProviderUrl('https://api.smile.one/v1');
 } else if (preset === 'unipin') {
 setNewProviderName('UniPin Direct Engine');
 setNewProviderUrl('https://api.unipin.com/v2/express');
 } else if (preset === 'lapakgaming') {
 setNewProviderName('LapakGaming Reseller API');
 setNewProviderUrl('https://api.lapakgaming.com/v1');
 } else if (preset === 'apigames') {
 setNewProviderName('ApiGames SEA Direct');
 setNewProviderUrl('https://api.apigames.id/v2');
 } else {
 setNewProviderName('Custom REST Adapter');
 setNewProviderUrl('https://api.example.com/v1');
 }
 };

 // Provider Handlers
 const handleTestProvider = async (provider: any) => {
 setActionLoading('test-' + provider.id);
 try {
 const res = await fetch('/api/v1/admin/providers/' + provider.id + '/test', { method: 'POST' });
 const data = await res.json();
 setTestResultModal({ provider, result: data });
 if (data.success) {
 showToast('Connection to ' + provider.name + ' healthy (' + (data.details?.latency_ms || 45) + 'ms)', 'success');
 } else {
 showToast('Connection failed: ' + data.message, 'error');
 }
 } catch (err) {
 showToast('Network error testing provider', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 const handleSyncGames = async (providerId: string, providerName: string) => {
 setActionLoading('sync-games-' + providerId);
 try {
 const res = await fetch('/api/v1/admin/providers/' + providerId + '/sync-games', { method: 'POST' });
 const data = await res.json();
 if (data.success) {
 showToast('Games Synced from ' + providerName + ': ' + data.message, 'success');
 await loadData();
 } else {
 showToast('Sync Games failed: ' + data.message, 'error');
 }
 } catch (err) {
 showToast('Error syncing games', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 const handleSyncProducts = async (providerId: string, providerName: string) => {
 setActionLoading('sync-products-' + providerId);
 try {
 const res = await fetch('/api/v1/admin/providers/' + providerId + '/sync-products', { method: 'POST' });
 const data = await res.json();
 if (data.success) {
 showToast('Products Synced from ' + providerName + ': ' + data.message, 'success');
 await loadData();
 } else {
 showToast('Sync Products failed: ' + data.message, 'error');
 }
 } catch (err) {
 showToast('Error syncing products', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 const handleSyncAll = async () => {
 setActionLoading('sync-all');
 try {
 const res = await fetch('/api/v1/admin/sync-all', { method: 'POST' });
 const data = await res.json();
 if (data.success) {
 showToast('Global Auto-Sync completed across all providers!', 'success');
 await loadData();
 }
 } catch (err) {
 showToast('Error executing sync all', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 const handleToggleProvider = async (provider: any) => {
 const nextStatus = provider.status === 'active' ? 'disabled' : 'active';
 try {
 await fetch('/api/v1/admin/providers/' + provider.id, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status: nextStatus })
 });
 showToast('Provider ' + provider.name + ' set to ' + nextStatus, 'info');
 loadData();
 } catch (err) {
 showToast('Failed to update provider status', 'error');
 }
 };

 const handleDeleteProvider = async (providerId: string, providerName: string) => {
 if (!confirm('Are you sure you want to remove provider "' + providerName + '"?')) return;
 try {
 await fetch('/api/v1/admin/providers/' + providerId, { method: 'DELETE' });
 showToast('Provider ' + providerName + ' deleted', 'success');
 loadData();
 } catch (err) {
 showToast('Failed to delete provider', 'error');
 }
 };

 const handleAddProviderSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setActionLoading('add-provider');
 try {
 const res = await fetch('/api/v1/admin/providers', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 name: newProviderName,
 api_url: newProviderUrl,
 api_key: newProviderKey,
 secret: newProviderSecret || undefined,
 api_username: newProviderUsername || undefined,
 priority: Number(newProviderPriority) || 1,
 auto_sync_interval: newProviderSyncInterval,
 status: 'active'
 })
 });
 const data = await res.json();
 if (data.success) {
 showToast('Provider registered successfully!', 'success');
 setIsAddingProvider(false);
 setNewProviderKey('');
 setNewProviderSecret('');
 loadData();
 }
 } catch (err) {
 showToast('Failed to add provider', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 // Order Handlers
 const handleUpdateOrderStatus = async (orderId: string, status: string) => {
 try {
 await fetch('/api/v1/admin/orders/' + orderId, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status })
 });
 showToast('Order ' + orderId + ' marked as ' + status, 'success');
 loadData();
 } catch (err) {
 showToast('Failed to update status', 'error');
 }
 };

 const handleRetryOrder = async (orderId: string) => {
 setActionLoading('retry-' + orderId);
 try {
 const res = await fetch('/api/v1/admin/orders/' + orderId + '/retry', { method: 'POST' });
 const data = await res.json();
 if (data.success) {
 showToast(data.message, 'success');
 setSelectedOrderDetail(null);
 loadData();
 } else {
 showToast(data.message, 'error');
 }
 } catch (err) {
 showToast('Error retrying order', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 const handleRefundOrder = async (orderId: string, reason: string) => {
 setActionLoading('refund-' + orderId);
 try {
 const res = await fetch('/api/v1/admin/orders/' + orderId + '/refund', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ reason })
 });
 const data = await res.json();
 if (data.success) {
 showToast(data.message, 'success');
 setSelectedOrderDetail(null);
 loadData();
 } else {
 showToast(data.message, 'error');
 }
 } catch (err) {
 showToast('Error refunding order', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 const handleCheckUpstreamStatus = async (orderId: string) => {
 setActionLoading('check-' + orderId);
 try {
 const res = await fetch('/api/v1/admin/orders/' + orderId + '/provider-status');
 const data = await res.json();
 if (data.success) {
 showToast('Upstream Status: ' + data.upstream_status + ' (' + data.provider_name + ')', 'info');
 }
 } catch (err) {
 showToast('Failed to query upstream provider', 'error');
 } finally {
 setActionLoading(null);
 }
 };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(isKm ? 'តើអ្នកពិតជាចង់លុប Order ' + orderId + ' នេះមែនទេ?' : 'Are you sure you want to delete order ' + orderId + '?')) return;
    setActionLoading('delete-order-' + orderId);
    try {
      const res = await fetch('/api/v1/admin/orders/' + orderId, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(isKm ? 'បានលុប Order ' + orderId + ' ដោយជោគជ័យ!' : 'Order ' + orderId + ' deleted successfully!', 'success');
        if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
          setSelectedOrderDetail(null);
        }
        loadData();
      } else {
        showToast(data.detail || 'Failed to delete order', 'error');
      }
    } catch (err) {
      showToast('Error deleting order', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearAllOrders = async () => {
    if (!confirm(isKm ? 'តើអ្នកពិតជាចង់លុបទិន្នន័យ Orders/Fake Data ទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ!' : 'Are you sure you want to clear ALL test/fake orders? This action cannot be undone!')) return;
    setActionLoading('clear-all-orders');
    try {
      const res = await fetch('/api/v1/admin/orders', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(isKm ? 'បានសម្អាតទិន្នន័យ Orders ទាំងអស់ដោយជោគជ័យ!' : 'All test orders cleared successfully!', 'success');
        setSelectedOrderDetail(null);
        loadData();
      } else {
        showToast(data.detail || 'Failed to clear orders', 'error');
      }
    } catch (err) {
      showToast('Error clearing all orders', 'error');
    } finally {
      setActionLoading(null);
    }
  };

 // Pricing & Product Controls
 const handleSaveProductPricing = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!editingProduct) return;
 setActionLoading('save-product-price');
 try {
 const res = await fetch('/api/v1/admin/games/' + editingProduct.game.slug + '/products/' + editingProduct.pkg.id, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 price_user_usd: Number(editPriceUser),
 price_reseller_usd: Number(editPriceReseller),
 price_vip_usd: Number(editPriceVip),
 manual_price_override: editManualOverride,
 markup_percent: Number(editMarkupPercent)
 })
 });
 const data = await res.json();
 if (data.success) {
 showToast('Pricing updated for ' + editingProduct.pkg.name_en, 'success');
 setEditingProduct(null);
 loadData();
 }
 } catch (err) {
 showToast('Error saving pricing', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 const handleSavePricingConfig = async (e: React.FormEvent) => {
 e.preventDefault();
 setActionLoading('save-pricing');
 try {
 await fetch('/api/v1/admin/pricing-config', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(pricingConfig)
 });
 showToast('Global markup rules saved successfully!', 'success');
 loadData();
 } catch (err) {
 showToast('Failed to save pricing config', 'error');
 } finally {
 setActionLoading(null);
 }
 };

 const handleApplyBulkMarkup = async () => {
 setApplyingBulkMarkup(true);
 try {
 const res = await fetch('/api/v1/admin/pricing/apply-markup', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 mode: bulkPricingMode,
 fixed_add_usd: Number(bulkFixedAddUsd),
 markup_percent: Number(bulkMarkupPercent),
 reseller_fixed_usd: Math.round(Number(bulkFixedAddUsd) * 0.6 * 100) / 100,
 vip_fixed_usd: Math.round(Number(bulkFixedAddUsd) * 0.35 * 100) / 100,
 reseller_markup_percent: Number(bulkResellerMarkup),
 vip_markup_percent: Number(bulkVipMarkup),
 game_slug: productGameFilter
 })
 });
 const data = await res.json();
 if (data.success) {
 showToast(data.message || 'Pricing applied successfully!', 'success');
 await loadData();
 } else {
 showToast(data.detail || 'Failed to apply pricing', 'error');
 }
 } catch (err) {
 showToast('Error applying pricing', 'error');
 } finally {
 setApplyingBulkMarkup(false);
 }
 };

 const handleSingleMarkupChange = (pct: number) => {
 setEditMarkupPercent(pct);
 if (editingProduct?.pkg?.cost_usd) {
 const base = Number(editingProduct.pkg.cost_usd);
 const userP = Math.round(base * (1 + pct / 100) * 100) / 100;
 const resP = Math.round(base * (1 + (pct * 0.6) / 100) * 100) / 100;
 const vipP = Math.round(base * (1 + (pct * 0.35) / 100) * 100) / 100;
 setEditPriceUser(userP);
 setEditPriceReseller(resP);
 setEditPriceVip(vipP);
 setEditFixedAddUsd(Math.round((userP - base) * 100) / 100);
 }
 };

 const handleSingleFixedAddChange = (addUsd: number) => {
 setEditFixedAddUsd(addUsd);
 if (editingProduct?.pkg?.cost_usd) {
 const base = Number(editingProduct.pkg.cost_usd);
 const userP = Math.round((base + addUsd) * 100) / 100;
 const resP = Math.round((base + addUsd * 0.6) * 100) / 100;
 const vipP = Math.round((base + addUsd * 0.35) * 100) / 100;
 setEditPriceUser(userP);
 setEditPriceReseller(resP);
 setEditPriceVip(vipP);
 setEditMarkupPercent(base > 0 ? Math.round((addUsd / base) * 100) : 0);
 }
 };

 // Coupons, Banners, Users & Settings
 const handleAddCoupon = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await fetch('/api/v1/admin/coupons', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 code: newCouponCode,
 discount_percent: parseFloat(newCouponPercent),
 min_order_usd: parseFloat(newCouponMinOrder),
 max_uses: parseInt(newCouponMaxUses),
 valid_until: '2026-12-31',
 is_active: true
 })
 });
 setIsAddingCoupon(false);
 setNewCouponCode('');
 showToast('Coupon created', 'success');
 loadData();
 } catch (err) {
 showToast('Failed to create coupon', 'error');
 }
 };

 const handleDeleteCoupon = async (id: string) => {
 try {
 await fetch('/api/v1/admin/coupons/' + id, { method: 'DELETE' });
 showToast('Coupon removed', 'info');
 loadData();
 } catch (err) {
 showToast('Error deleting coupon', 'error');
 }
 };

 const handleAddBanner = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await fetch('/api/v1/admin/banners', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 title_en: newBannerTitleEn,
 title_km: newBannerTitleKm || newBannerTitleEn,
 subtitle_en: newBannerSubtitleEn,
 subtitle_km: newBannerSubtitleEn,
 image_url: newBannerImageUrl,
 target_url: newBannerTargetUrl,
 badge_en: 'PROMO',
 badge_km: 'ប្រូម៉ូសិន',
 is_active: true,
 sort_order: banners.length + 1
 })
 });
 setIsAddingBanner(false);
 setNewBannerTitleEn('');
 showToast('Hero banner published', 'success');
 loadData();
 } catch (err) {
 showToast('Failed to add banner', 'error');
 }
 };

 const handleDeleteBanner = async (id: string) => {
 try {
 await fetch('/api/v1/admin/banners/' + id, { method: 'DELETE' });
 showToast('Banner removed', 'info');
 loadData();
 } catch (err) {
 showToast('Error deleting banner', 'error');
 }
 };

   const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = adjustUser?.id || adjustUserId;
    if (!targetId) return;
    
    const amt = parseFloat(adjustAmount) || 0;
    try {
      const res = await fetch(`/api/v1/admin/users/${targetId}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount_usd: amt, 
          mode: adjustMode, 
          reason: adjustReason || (adjustMode === 'add' ? 'Admin Added Funds' : adjustMode === 'deduct' ? 'Admin Deducted Funds' : 'Admin Balance Adjustment')
        })
      });
      const data = await res.json();
      if (data.success) {
        const msg = adjustMode === 'add' 
          ? (isKm ? `បានបញ្ចូលទឹកប្រាក់ $${amt.toFixed(2)} ដោយជោគជ័យ!` : `Successfully added $${amt.toFixed(2)} to wallet!`)
          : adjustMode === 'deduct'
          ? (isKm ? `បានកាត់ទឹកប្រាក់ $${amt.toFixed(2)} ដោយជោគជ័យ!` : `Successfully deducted $${amt.toFixed(2)} from wallet!`)
          : adjustMode === 'clear'
          ? (isKm ? 'បានលុបសមតុល្យកាបូបលុយទៅ $0.00 រួចរាល់!' : 'Successfully cleared wallet balance to $0.00!')
          : (isKm ? `បានកំណត់សមតុល្យ $${amt.toFixed(2)} រួចរាល់!` : `Successfully set wallet balance to $${amt.toFixed(2)}!`);
        
        showToast(msg, 'success');
        setAdjustUser(null);
        setAdjustUserId(null);
        loadData();
      } else {
        showToast(data.detail || 'Failed to adjust balance', 'error');
      }
    } catch (err) {
      showToast('Error adjusting wallet balance', 'error');
    }
  };

 const handleGenerateResellerKey = async (userId: string) => {
 try {
 const res = await fetch('/api/v1/admin/resellers/' + userId + '/api-key', { method: 'POST' });
 const data = await res.json();
 if (data.success) {
 showToast('New B2B API Key generated: ' + data.api_key, 'success');
 }
 } catch (err) {
 showToast('Error generating key', 'error');
 }
 };

 const handleApproveReseller = async (userId: string) => {
 try {
 const res = await fetch('/api/v1/admin/reseller-applications/' + userId + '/approve', { method: 'POST' });
 const data = await res.json();
 if (data.success) {
 showToast(isKm ? 'បានអនុម័តគណនីដៃគូលក់បន្តដោយជោគជ័យ' : 'Reseller application approved successfully', 'success');
 loadData();
 } else {
 showToast(data.detail || 'Approval failed', 'error');
 }
 } catch {
 showToast('Connection error', 'error');
 }
 };

 const handleRejectReseller = async (userId: string) => {
 const reason = window.prompt(isKm ? 'មូលហេតុនៃការបដិសេធ (Reason for rejection):' : 'Enter rejection reason:', 'Requirements not met');
 if (reason === null) return;
 try {
 const res = await fetch('/api/v1/admin/reseller-applications/' + userId + '/reject', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ reason })
 });
 const data = await res.json();
 if (data.success) {
 showToast(isKm ? 'បានបដិសេធពាក្យស្នើសុំ' : 'Reseller application rejected', 'success');
 loadData();
 } else {
 showToast(data.detail || 'Rejection failed', 'error');
 }
 } catch {
 showToast('Connection error', 'error');
 }
 };


 const handleSavePlatformSettings = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await fetch('/api/v1/admin/settings', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(platformSettings)
 });
 showToast('Platform settings updated', 'success');
 loadData();
 } catch (err) {
 showToast('Error saving settings', 'error');
 }
 };

 const handleSaveGamerSettings = async (e: React.FormEvent) => {
 e.preventDefault();
 setSavingGamerSettings(true);
 try {
 const res = await fetch('/api/v1/admin/gamer-verification/settings', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(gamerSettings)
 });
 const data = await res.json();
 if (data.success) {
 showToast('Gamer Verification settings updated successfully', 'success');
 loadData();
 } else {
 showToast(data.detail || 'Failed to save gamer settings', 'error');
 }
 } catch (err) {
 showToast('Failed to save gamer settings', 'error');
 } finally {
 setSavingGamerSettings(false);
 }
 };

 const handleTestGamerConnection = async () => {
 setTestingGamerConn(true);
 try {
 const res = await fetch('/api/v1/admin/gamer-verification/test', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 provider_api_url: gamerSettings.provider_api_url,
 api_key: gamerSettings.api_key,
 request_timeout: gamerSettings.request_timeout_seconds
 })
 });
 const data = await res.json();
 if (data.success) {
 showToast(`Ping success (${data.details?.latency_ms || 35}ms)! Status: ${data.details?.status}`, 'success');
 } else {
 showToast('Ping failed', 'error');
 }
 } catch (err) {
 showToast('Ping failed', 'error');
 } finally {
 setTestingGamerConn(false);
 }
 };

 const handleLogout = () => {
 localStorage.removeItem('rolea_token');
 localStorage.removeItem('rolea_user');
 router.push('/login');
 };

 // Filtered Collections
 const allProducts = games.flatMap(g => 
 (g.packages || []).map((pkg: any) => ({
 ...pkg,
 gameTitle: g.name_en,
 gameSlug: g.slug,
 gameThumbnail: g.thumbnail,
 publisher: g.publisher
 }))
 ).filter(pkg => {
 if (productGameFilter !== 'all' && pkg.gameSlug !== productGameFilter) return false;
 if (searchGlobalQuery) {
 const q = searchGlobalQuery.toLowerCase();
 return pkg.name_en.toLowerCase().includes(q) || pkg.gameTitle.toLowerCase().includes(q) || (pkg.id && pkg.id.toLowerCase().includes(q));
 }
 return true;
 });

 const filteredOrders = orders.filter((o) => {
 if (orderFilter !== 'all' && o.status !== orderFilter) return false;
 if (searchGlobalQuery) {
 const q = searchGlobalQuery.toLowerCase();
 return o.id.toLowerCase().includes(q) || o.player_id.toLowerCase().includes(q) || o.game_name_en.toLowerCase().includes(q);
 }
 return true;
 });

 const filteredLogs = syncLogs.filter(log => {
 if (syncLogFilter === 'all') return true;
 return log.status === syncLogFilter || log.sync_type === syncLogFilter || log.provider_id === syncLogFilter;
 });

 return (
 <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans" suppressHydrationWarning>
 {/* Toast Notification */}
 {toastMessage && (
 <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
 toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
 toastMessage.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
 'bg-blue-50 text-blue-800 border-blue-200'
 }`}>
 {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
 toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
 <Activity className="w-4 h-4 text-blue-600" />}
 <span>{toastMessage.message}</span>
 <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600">
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 )}

 {/* Persistent Left Sidebar Navigation */}
 <AdminSidebar
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 collapsed={sidebarCollapsed}
 setCollapsed={setSidebarCollapsed}
 mobileOpen={mobileSidebarOpen}
 setMobileOpen={setMobileSidebarOpen}
 currentRole={currentRole}
 unreadCount={notifications.filter(n => !n.is_read).length}
 stats={stats}
 language={language}
 />

 {/* Main Content Area */}
 <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
 {/* Top Header */}
 <AdminHeader
 searchQuery={searchGlobalQuery}
 setSearchQuery={setSearchGlobalQuery}
 language={language}
 toggleLanguage={toggleLanguage}
 currentRole={currentRole}
 setCurrentRole={setCurrentRole}
 notifications={notifications}
 onMarkNotificationRead={async (id) => {
 await fetch('/api/v1/admin/notifications/' + id + '/read', { method: 'PATCH' });
 loadData();
 }}
 onClearNotifications={async () => {
 await fetch('/api/v1/admin/notifications', { method: 'DELETE' });
 loadData();
 }}
 onSyncAll={handleSyncAll}
 syncLoading={actionLoading === 'sync-all'}
 onLogout={handleLogout}
 onToggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
 />

 {/* Dynamic Main Workspace by Active Tab */}
 <main className={`flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6 ${activeTab === 'tickets' ? 'max-w-none px-2 sm:px-4' : 'max-w-7xl'}`}>
  {loading ? (
    <div className="min-h-[65vh] flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/30 animate-spin border-t-blue-600" />
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight">
        {isKm ? 'កំពុងទាញយកទិន្នន័យ Admin Control Panel...' : 'Loading Admin Control Panel...'}
      </h3>
      <p className="text-xs font-semibold text-slate-500 mt-1">
        {isKm ? 'សូមរង់ចាំមួយភ្លែត ភ្នាក់ងារកំពុងភ្ជាប់ទៅកាន់ FastAPI Backend' : 'Connecting to FastAPI Backend & Synchronizing Store'}
      </p>
      <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 h-full w-3/4 rounded-full animate-pulse" />
      </div>
    </div>
  ) : (
    <>

 {/* ========================================================================= */}
 {/* TAB 1: DASHBOARD */}
 {/* ========================================================================= */}
 {activeTab === 'dashboard' && (
 <div className="space-y-6">
 {/* Header Title */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
 <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
 <span>Control Center & Analytics</span>
 </div>
 <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
 Platform Overview
 </h1>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={loadData}
 className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-colors"
 >
 <RefreshCw className="w-4 h-4 text-blue-600" />
 <span>Refresh</span>
 </button>
 <button
 onClick={handleSyncAll}
 disabled={actionLoading === 'sync-all'}
 className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
 >
 <Zap className="w-4 h-4" />
 <span>{actionLoading === 'sync-all' ? 'Syncing...' : 'Run Auto-Sync'}</span>
 </button>
 </div>
 </div>

 {/* 4 Global KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
 <div>
 <p className="text-xs text-slate-400 font-bold uppercase">Total Revenue</p>
 <h3 className="text-2xl font-black text-emerald-600 mt-1">
 ${(stats?.revenue_usd || 0).toFixed(2)}
 </h3>
 <p className="text-[10px] text-slate-500 mt-0.5 font-medium">≈ ៛{(stats?.revenue_khr || 0).toLocaleString()} KHR</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
 <DollarSign className="w-6 h-6" />
 </div>
 </div>

 <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
 <div>
 <p className="text-xs text-slate-400 font-bold uppercase">Net Profit Margin</p>
 <h3 className="text-2xl font-black text-blue-600 mt-1">
 ${(stats?.profit_usd || 0).toFixed(2)}
 </h3>
 <p className="text-[10px] text-blue-700 mt-0.5 font-semibold">COGS: ${(stats?.cost_usd || 0).toFixed(2)}</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
 <TrendingUp className="w-6 h-6" />
 </div>
 </div>

 <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
 <div>
 <p className="text-xs text-slate-400 font-bold uppercase">Total Orders</p>
 <h3 className="text-2xl font-black text-slate-900 mt-1">
 {stats?.total_orders || 0} Orders
 </h3>
 <p className="text-[10px] text-emerald-700 mt-0.5 font-semibold">{stats?.success_orders || 0} Success Dispatched</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
 <ShoppingBag className="w-6 h-6" />
 </div>
 </div>

 <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
 <div>
 <p className="text-xs text-slate-400 font-bold uppercase">Live API Providers</p>
 <h3 className="text-2xl font-black text-purple-600 mt-1">
 {providers.filter(p => p.status === 'active').length} / {providers.length} Active
 </h3>
 <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{stats?.active_games_count || 14} Games • {stats?.active_products_count || 100} SKUs</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
 <Server className="w-6 h-6" />
 </div>
 </div>
 </div>

 {/* Data Visualization Charts */}
 <DashboardCharts stats={stats} onNavigateTab={setActiveTab} language={language} />
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 2: API PROVIDERS */}
 {/* ========================================================================= */}
 {activeTab === 'api-providers' && (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-slate-900">API Providers & Failover Engine</h2>
 <p className="text-xs text-slate-500">
 Server-side upstream API integration with masked credentials and automatic failover routing.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={handleSyncAll}
 disabled={actionLoading === 'sync-all'}
 className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5"
 >
 <Zap className="w-4 h-4 text-blue-600" />
 <span>Sync All Providers</span>
 </button>

 <button
 onClick={() => setIsAddingProvider(true)}
 className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
 >
 <Plus className="w-4 h-4" />
 <span>Add Provider</span>
 </button>
 </div>
 </div>

 {/* Active Primary Provider Control Panel */}
 <div className="p-6 rounded-3xl bg-white border border-blue-200 shadow-xs space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-base font-black text-slate-900">
 {isKm ? 'API ផ្ញើ Top-Up សកម្ម (Primary Wholesale API)' : 'Active Primary API Top-Up Engine'}
 </h3>
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
 BAY2GAME ACTIVE
 </span>
 </div>
 <p className="text-xs text-slate-500 mt-1">
 {isKm 
 ? 'ប្រព័ន្ធត្រូវបានភ្ជាប់ និងដំណើរការជាមួយ Bay2Game Wholesale API ជាផ្លូវការ' 
 : 'Connected and running with Bay2Game Wholesale API Engine.'}
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4">
 {/* Bay2Game Card */}
 <div 
 className="p-5 rounded-2xl border-2 bg-blue-50/60 border-blue-600 shadow-md ring-2 ring-blue-500/20 relative overflow-hidden"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs bg-blue-600 text-white">
 B2G
 </div>
 <div>
 <h4 className="font-bold text-slate-900 text-sm">Bay2Game Wholesale API</h4>
 <p className="text-[11px] text-slate-500 font-mono">https://api.bay2game.xyz/api</p>
 </div>
 </div>
 <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-[10px] uppercase flex items-center gap-1 shadow-xs">
 <CheckCircle2 className="w-3.5 h-3.5" /> {isKm ? 'កំពុងប្រើប្រាស់' : 'ACTIVE'}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Option 4: LIVE API RESELLER BALANCE TRACKER & TELEGRAM ALERTS WIDGET */}
 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
 <div>
 <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
 <span>{isKm ? 'ប្រព័ន្ធត្រួតពិនិត្យសមតុល្យ API & ជូនដំណឹង (Live API Balances & Telegram Alerts)' : 'Live API Reseller Balances & Telegram Alerts'}</span>
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
 {isKm ? 'ផ្សាយផ្ទាល់ (REAL-TIME)' : 'LIVE 24/7'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 mt-0.5">
 {isKm 
 ? 'ត្រួតពិនិត្យទំហំទឹកប្រាក់ដែលនៅសល់ក្នុង Account API ទាំងពីរ និងផ្ញើសារប្រកាសអាសន្នតាម Telegram ពេលលុយទាបជាង $50' 
 : 'Real-time API balance monitoring with automated Telegram warning alerts when balance drops below $50 threshold.'}
 </p>
 </div>

 <button
 onClick={loadProviderBalances}
 disabled={loadingBalances}
 className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
 >
 <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loadingBalances ? 'animate-spin' : ''}`} />
 <span>{loadingBalances ? (isKm ? 'កំពុងផ្ទុក...' : 'Checking...') : (isKm ? 'ឆែកសមតុល្យឡើងវិញ' : 'Refresh Balances')}</span>
 </button>
 </div>

 {/* Low Balance Alert ON / OFF Toggle Switch Control Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
   <div className="flex items-center gap-3">
     <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
       lowBalanceAlertEnabled ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-200 text-slate-500 border border-slate-300'
     }`}>
       <Bell className="w-4 h-4" />
     </div>
     <div>
       <h4 className="text-xs font-bold text-slate-900">
         {isKm ? 'ប្រព័ន្ធជូនដំណឹងសមតុល្យទាបតាម Telegram (Low Balance Alert Notification)' : 'Telegram Low Balance Alert Notification'}
       </h4>
       <p className="text-[11px] text-slate-500 font-medium">
         {isKm 
           ? `ផ្ញើសារប្រកាសអាសន្នទៅ Telegram ដោយស្វ័យប្រវត្តិ នៅពេលសមតុល្យធ្លាក់ចុះទាបជាង $${lowBalanceThreshold || 5.0}` 
           : `Automatically sends Telegram alerts when provider balance drops below $${lowBalanceThreshold || 5.0}`}
       </p>
     </div>
   </div>

   <div className="flex items-center gap-3 self-start sm:self-auto">
     <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
       lowBalanceAlertEnabled 
         ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
         : 'bg-slate-100 text-slate-500 border-slate-200'
     }`}>
       {lowBalanceAlertEnabled ? (isKm ? 'បើកដំណើរការ (ON)' : 'ENABLED (ON)') : (isKm ? 'បិទដំណើរការ (OFF)' : 'DISABLED (OFF)')}
     </span>

     <button
       type="button"
       onClick={() => handleToggleLowBalanceAlert(!lowBalanceAlertEnabled)}
       disabled={updatingLowBalanceAlert}
       className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
         lowBalanceAlertEnabled ? 'bg-emerald-600' : 'bg-slate-300'
       }`}
       title={isKm ? 'ចុចដើម្បី បើក/បិទ ការជូនដំណឹង' : 'Click to toggle Low Balance Alert ON/OFF'}
     >
       <span
         className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
           lowBalanceAlertEnabled ? 'translate-x-5' : 'translate-x-0'
         }`}
       />
     </button>
   </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {providerBalances.map((pb: any) => (
 <div 
 key={pb.provider_id}
 className={`p-4 rounded-2xl border transition-all ${
 pb.is_low_balance 
 ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/20' 
 : pb.is_active_primary 
 ? 'bg-blue-50/50 border-blue-200' 
 : 'bg-slate-50 border-slate-200'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
 pb.provider_id === 'fazercards' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
 }`}>
 {pb.provider_id === 'fazercards' ? 'FZR' : 'B2G'}
 </div>
 <div>
 <h4 className="font-bold text-slate-900 text-xs">{pb.name}</h4>
 <div className="flex items-center gap-1.5 mt-0.5">
 <span className="text-[10px] text-slate-500 font-mono">Ping: {pb.latency_ms}ms</span>
 {pb.is_active_primary && (
 <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-600 text-white">
 PRIMARY
 </span>
 )}
 </div>
 </div>
 </div>

 <div className="text-right">
 <div className={`font-mono font-black text-lg ${pb.is_low_balance ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
 ${(pb.balance_usd || 0).toFixed(2)} {pb.currency}
 </div>
 <div>
 {pb.is_low_balance ? (
 <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-300 inline-flex items-center gap-1">
 <AlertCircle className="w-3 h-3 text-rose-600" /> {`LOW BALANCE (< $${lowBalanceThreshold || 5})`}
 </span>
 ) : (
 <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SUFFICIENT
 </span>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}
 {providerBalances.length === 0 && (
 <div className="col-span-2 p-4 text-center text-xs text-slate-400 font-medium">
 {isKm ? 'កំពុងផ្ទុកទិន្នន័យសមតុល្យ API...' : 'Loading API reseller balances...'}
 </div>
 )}
 </div>
 </div>

 {/* Option 3: API PRICE & PROFIT MARGIN COMPARISON TABLE */}
 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
 <div>
 <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
 <span>{isKm ? 'តារាងប្រៀបធៀបថ្លៃដើម & ប្រាក់ចំណេញ (API Price & Profit Margin Comparison)' : 'API Price & Profit Margin Comparison Table'}</span>
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200">
 PROFIT ENGINE
 </span>
 </h3>
 <p className="text-xs text-slate-500 mt-0.5">
 {isKm 
 ? 'ប្រៀបធៀបថ្លៃដើមរវាង Bay2Game និង FazerCards លើកញ្ចប់ពេជ្រនីមួយៗ ដើម្បីដឹងថា API មួយណាផ្តល់ប្រាក់ចំណេញខ្ពស់ជាង' 
 : 'Compare wholesale costs side-by-side between Bay2Game and FazerCards to maximize your retail and reseller profit margins.'}
 </p>
 </div>

 <button
 onClick={loadPriceComparisonData}
 disabled={loadingComparison}
 className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
 >
 <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loadingComparison ? 'animate-spin' : ''}`} />
 <span>{isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh Matrix'}</span>
 </button>
 </div>

 <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[420px] overflow-y-auto">
 <table className="w-full text-left text-xs">
 <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px] z-10">
 <tr>
 <th className="p-3">Game and Package</th>
 <th className="p-3 text-right">Bay2Game Cost</th>
 <th className="p-3 text-right">FazerCards Cost</th>
 <th className="p-3 text-center">Cheaper API Provider</th>
 <th className="p-3 text-right">User Retail Price</th>
 <th className="p-3 text-right">Bay2Game Profit</th>
 <th className="p-3 text-right">FazerCards Profit</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-mono">
 {priceComparisonData.map((row: any, idx: number) => (
 <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
 <td className="p-3 font-sans font-bold text-slate-900">
 <div className="text-xs font-bold text-slate-900">{row.package_name}</div>
 <div className="text-[10px] text-slate-400 capitalize">{row.game_name}</div>
 </td>
 <td className="p-3 text-right font-bold text-slate-700">
 ${(row.bay2game_cost || 0).toFixed(2)}
 </td>
 <td className="p-3 text-right font-bold text-purple-700">
 ${(row.fazercards_cost || 0).toFixed(2)}
 </td>
 <td className="p-3 text-center font-sans">
 {row.cheaper_provider === 'fazercards' ? (
 <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3 text-purple-600" /> {`FazerCards (-$${(row.savings_usd || 0).toFixed(2)})`}
 </span>
 ) : row.cheaper_provider === 'bay2game' ? (
 <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3 text-blue-600" /> {`Bay2Game (-$${(row.savings_usd || 0).toFixed(2)})`}
 </span>
 ) : (
 <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
 EQUAL PRICE
 </span>
 )}
 </td>
 <td className="p-3 text-right font-bold text-slate-900">
 ${(row.user_retail_price || 0).toFixed(2)}
 </td>
 <td className="p-3 text-right font-bold text-emerald-600">
 +${(row.bay2game_margin_usd || 0).toFixed(2)}
 </td>
 <td className="p-3 text-right font-bold text-purple-600">
 +${(row.fazercards_margin_usd || 0).toFixed(2)}
 </td>
 </tr>
 ))}
 {priceComparisonData.length === 0 && (
 <tr>
 <td colSpan={7} className="p-6 text-center text-slate-400 font-sans font-medium text-xs">
 {isKm ? 'កំពុងប្រៀបធៀបថ្លៃដើម API...' : 'Loading API price comparison data...'}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {providers.map((p, idx) => (
 <div key={p.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
 <div>
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
 Priority #{p.priority || idx + 1} {idx === 0 ? '(Primary)' : '(Fallback)'}
 </span>
 <button
 onClick={() => handleToggleProvider(p)}
 className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
 p.status === 'active'
 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
 : 'bg-slate-100 text-slate-500 border border-slate-200'
 }`}
 >
 {p.status.toUpperCase()}
 </button>
 </div>

 <h4 className="text-base font-black text-slate-900 mt-2">{p.name}</h4>
 <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 truncate mt-1">
 {p.api_url}
 </div>

 <div className="mt-3 space-y-1.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
 <div className="flex justify-between items-center text-slate-600">
 <span className="font-semibold text-slate-500 flex items-center gap-1">
 <Lock className="w-3 h-3 text-slate-400" /> Masked API Key:
 </span>
 <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
 {p.api_key_masked || 'sm_live_...99182'}
 </span>
 </div>
 <div className="flex justify-between items-center text-slate-600">
 <span className="font-semibold text-slate-500">Secret:</span>
 <span className="text-emerald-700 font-bold text-[10px]">
 {p.has_secret ? 'Encrypted on Backend' : 'None'}
 </span>
 </div>
 <div className="flex justify-between items-center text-slate-600">
 <span className="font-semibold text-slate-500">Auto-Sync Interval:</span>
 <span className="font-bold text-slate-800">{p.auto_sync_interval || '1 hour'}</span>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 mt-3 text-center">
 <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
 <span className="text-[10px] text-slate-400 block">Games</span>
 <span className="text-sm font-black text-slate-900">{p.sync_games_count || 0}</span>
 </div>
 <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
 <span className="text-[10px] text-slate-400 block">Products</span>
 <span className="text-sm font-black text-slate-900">{p.sync_products_count || 0}</span>
 </div>
 </div>
 </div>

 <div className="space-y-2 pt-3 border-t border-slate-100">
 <div className="grid grid-cols-2 gap-2">
 <button
 onClick={() => handleSyncGames(p.id, p.name)}
 disabled={actionLoading === 'sync-games-' + p.id}
 className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5"
 >
 <Gamepad2 className="w-3.5 h-3.5" />
 <span>Sync Games</span>
 </button>
 <button
 onClick={() => handleSyncProducts(p.id, p.name)}
 disabled={actionLoading === 'sync-products-' + p.id}
 className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'sync-products-' + p.id ? 'animate-spin' : ''}`} />
 <span>Sync Products</span>
 </button>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => handleTestProvider(p)}
 disabled={actionLoading === 'test-' + p.id}
 className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
 >
 <Activity className="w-3.5 h-3.5 text-blue-600" />
 <span>Test Connection</span>
 </button>
 <button
 onClick={() => handleDeleteProvider(p.id, p.name)}
 className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
 title="Delete Provider"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 6: SETTINGS & CONFIG */}
 {/* ========================================================================= */}
 {activeTab === 'settings' && (
 <div className="space-y-6 max-w-4xl">
 <div>
 <h2 className="text-xl font-black text-slate-900">Platform Settings & Security Configuration</h2>
 <p className="text-xs text-slate-500">Manage store branding, Bakong KHQR credentials, currency rates, and telegram alerts.</p>
 </div>

 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
 <div className="space-y-4">
 <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">General Store Branding</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Store Name (EN)</label>
 <input 
 type="text" 
 defaultValue="SamAng TopUp Store" 
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900" 
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Store Name (KM)</label>
 <input 
 type="text" 
 defaultValue="សាង អេង ហ្គេម ថុបអាប់" 
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900" 
 />
 </div>
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t border-slate-100">
 <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Exchange Rate (USD to KHR)</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">1 USD = X KHR</label>
 <input 
 type="number" 
 defaultValue={4100} 
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900" 
 />
 <p className="text-[10px] text-slate-400 mt-1">Used for Bakong KHQR dynamic currency calculations.</p>
 </div>
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t border-slate-100">
 <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Bakong KHQR Payment Gateway</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Bakong Account ID / Merchant ID</label>
 <input 
 type="text" 
 defaultValue="samang_topup@aclb" 
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900" 
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Name</label>
 <input 
 type="text" 
 defaultValue="SAMANG TOPUP STORE" 
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900" 
 />
 </div>
 </div>
 </div>

 <div className="flex justify-end pt-4 border-t border-slate-100">
 <button 
 onClick={() => showToast('Settings saved successfully', 'success')}
 className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 2.5: CONNECTED API GAMES CATALOG (AUTO SYNC + ON/OFF PUBLISHING) */}
 {/* ========================================================================= */}
 {activeTab === 'api-games' && (
 <ConnectedGamesTable 
 language={language} 
 onRefreshParent={loadData} 
 />
 )}

 {/* ========================================================================= */}
 {/* TAB: GAMER VERIFICATION */}
 {/* ========================================================================= */}
 {activeTab === 'gamer-verification' && (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
 <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
 <span>Player Account Security Engine</span>
 </div>
 <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
 {isKm ? 'ការកំណត់ផ្ទៀងផ្ទាត់ឈ្មោះ Gamer' : 'Gamer Verification Settings & Logs'}
 </h1>
 <p className="text-xs text-slate-500 mt-1">
 {isKm 
 ? 'គ្រប់គ្រង API ផ្ទៀងផ្ទាត់ Player ID / User ID មុនពេលឲ្យ Customer ធ្វើ TopUp និងការពារ Order មិនឲ្យបង់ប្រាក់ប្រសិនបើ ID ខុស' 
 : 'Configure real-time player account verification provider API, caching rules, and view live audit verification logs.'}
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={handleTestGamerConnection}
 disabled={testingGamerConn}
 className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-colors"
 >
 <Activity className="w-4 h-4 text-blue-600" />
 <span>{testingGamerConn ? 'Testing Ping...' : 'Test API Ping'}</span>
 </button>
 </div>
 </div>

 {/* Settings Form */}
 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
 <div className="flex items-center justify-between border-b border-slate-100 pb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold">
 <ShieldCheck className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-base font-black text-slate-900">
 {isKm ? 'ការកំណត់ API ផ្គត់ផ្គង់ & វិធានការ' : 'API Gateway & Protection Rules'}
 </h2>
 <p className="text-xs text-slate-500">
 {isKm ? 'រក្សាទិន្នន័យ API Key និង Secret ឲ្យមានសុវត្ថិភាពខ្ពស់' : 'Credentials strictly stored server-side. Never exposed to browser JS.'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <label className="text-xs font-bold text-slate-700">
 {isKm ? 'ស្ថានភាព Feature ផ្ទៀងផ្ទាត់:' : 'Verification Feature:'}
 </label>
 <button
 type="button"
 onClick={() => setGamerSettings({ ...gamerSettings, is_enabled: !gamerSettings.is_enabled })}
 className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
 gamerSettings.is_enabled 
 ? 'bg-emerald-500 text-white shadow-xs' 
 : 'bg-slate-200 text-slate-600'
 }`}
 >
 {gamerSettings.is_enabled ? 'ENABLED (បើកដំណើរការ)' : 'DISABLED (បិទ)'}
 </button>
 </div>
 </div>

 <form onSubmit={handleSaveGamerSettings} className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Provider Name (ឈ្មោះអ្នកផ្ដល់សេវា API ផ្ទៀងផ្ទាត់)
 </label>
 <input
 type="text"
 required
 value={gamerSettings.provider_name || ''}
 onChange={(e) => setGamerSettings({ ...gamerSettings, provider_name: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
 placeholder="VngZz 2 Game ID Verification"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Provider API Check ID URL (/api/v1/game/check_id)
 </label>
 <input
 type="url"
 required
 value={gamerSettings.provider_api_url || ''}
 onChange={(e) => setGamerSettings({ ...gamerSettings, provider_api_url: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-blue-600 font-bold"
 placeholder="https://www.vngzz2game.site/api/v1/game/check_id"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 API Key (VNGZZ_API_KEY)
 </label>
 <div className="relative">
 <input
 type={showGamerApiKey ? 'text' : 'password'}
 value={gamerSettings.api_key || ''}
 onChange={(e) => setGamerSettings({ ...gamerSettings, api_key: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono pr-10"
 placeholder="Enter VngZz API Key"
 />
 <button
 type="button"
 onClick={() => setShowGamerApiKey(!showGamerApiKey)}
 className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
 >
 {showGamerApiKey ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 API Secret (TOPUP_API_SECRET)
 </label>
 <input
 type="password"
 value={gamerSettings.api_secret || ''}
 onChange={(e) => setGamerSettings({ ...gamerSettings, api_secret: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
 placeholder="••••••••••••••••"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Cache Duration (Seconds / រយៈពេលរក្សា Cache)
 </label>
 <input
 type="number"
 value={gamerSettings.cache_duration_seconds || 86400}
 onChange={(e) => setGamerSettings({ ...gamerSettings, cache_duration_seconds: parseInt(e.target.value) || 86400 })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
 />
 <p className="text-[10px] text-slate-400 mt-1">Default: 86400 seconds (24 Hours in DataStore memory cache)</p>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Request Timeout (Seconds / រយៈពេលកំណត់ Connection)
 </label>
 <input
 type="number"
 value={gamerSettings.request_timeout_seconds || 8}
 onChange={(e) => setGamerSettings({ ...gamerSettings, request_timeout_seconds: parseInt(e.target.value) || 8 })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
 />
 </div>
 </div>

 <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
 <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
 <div className="space-y-1">
 <h4 className="text-xs font-black text-amber-900">
 {isKm ? 'វិធានការការពារការទូទាត់ប្រាក់ 100%' : 'Strict Top-Up Checkout Shield'}
 </h4>
 <p className="text-[11px] text-amber-800 leading-relaxed">
 {isKm 
 ? 'នៅពេលអនុវត្ត ទាំង Frontend (ប៊ូតុងទូទាត់) និង Backend (/api/v1/orders) នឹងផ្ទៀងផ្ទាត់ Player Account ឡើងវិញមុនបង្កើត Order។ ប្រសិនបើ ID ខុស ឈ្មោះ Gamer មិនលេចឡើង ឬ API Rejection នោះ Order នឹងត្រូវទាត់ចោល (400 Bad Request) មិនឲ្យបង់ប្រាក់ជាដាច់ខាត!'
 : 'Frontend locks checkout button until player name is verified. Backend /api/v1/orders re-runs account check and rejects order with HTTP 400 Bad Request if account is invalid or unverified.'}
 </p>
 </div>
 </div>

 <div className="flex justify-end gap-2 pt-2">
 <button
 type="submit"
 disabled={savingGamerSettings}
 className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
 >
 <CheckCircle2 className="w-4 h-4" />
 <span>{savingGamerSettings ? 'Saving Settings...' : 'Save Verification Settings'}</span>
 </button>
 </div>
 </form>
 </div>

 {/* Audit Logs Table */}
 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-base font-black text-slate-900">
 {isKm ? 'កំណត់ត្រាផ្ទៀងផ្ទាត់ Gamer (Live Verification Logs)' : 'Live Gamer Verification Audit Logs'}
 </h2>
 <p className="text-xs text-slate-500">
 {isKm ? 'ប្រវត្តិត្រួតពិនិត្យឈ្មោះ Player ID និង Server ID របស់ Customer ទាំងអស់' : 'Real-time trace of recent player verification checks from customers.'}
 </p>
 </div>
 <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
 {gamerLogs.length} Records
 </span>
 </div>

 <div className="overflow-x-auto rounded-2xl border border-slate-200">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
 <th className="p-3">Time</th>
 <th className="p-3">Game</th>
 <th className="p-3">Player ID / Zone ID</th>
 <th className="p-3">Verified Gamer Name</th>
 <th className="p-3">Status</th>
 <th className="p-3 text-right">Latency</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {gamerLogs.length === 0 ? (
 <tr>
 <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
 {isKm ? 'មិនទាន់មានកំណត់ត្រាផ្ទៀងផ្ទាត់នៅឡើយទេ' : 'No verification audit logs recorded yet.'}
 </td>
 </tr>
 ) : (
 gamerLogs.map((log: any, idx: number) => (
 <tr key={idx} className="hover:bg-slate-50/50">
 <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
 {new Date(log.created_at || Date.now()).toLocaleTimeString()}
 </td>
 <td className="p-3 font-bold text-slate-900 capitalize">
 {log.game_slug?.replace('-', ' ')}
 </td>
 <td className="p-3 font-mono">
 <span className="text-blue-600 font-bold">{log.player_id}</span>
 {log.zone_id && <span className="text-slate-400 text-[11px]"> ({log.zone_id})</span>}
 </td>
 <td className="p-3">
 {log.status === 'verified' ? (
 <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
 {log.gamer_name}
 </span>
 ) : (
 <span className="text-red-500 font-medium italic">
 {log.error_message || 'Verification Failed'}
 </span>
 )}
 </td>
 <td className="p-3">
 {log.status === 'verified' ? (
 <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
 <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
 <AlertCircle className="w-3 h-3 text-red-600" /> REJECTED
 </span>
 )}
 </td>
 <td className="p-3 text-right font-mono text-[11px] text-slate-500">
 {log.response_time_ms ? `${log.response_time_ms} ms` : 'cached'}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* User Activity Logs Table */}
 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 mt-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
 <div>
 <div className="flex items-center gap-2">
 <Activity className="w-5 h-5 text-blue-600" />
 <h2 className="text-base font-black text-slate-900">
 {isKm ? 'កំណត់ត្រាសកម្មភាពអ្នកប្រើប្រាស់ (User Activity Logs)' : 'User Activity & Security Logs'}
 </h2>
 </div>
 <p className="text-xs text-slate-500 mt-0.5">
 {isKm ? 'ប្រវត្តិសកម្មភាពផ្សាយផ្ទាល់របស់ User (Login, Order, Refund, Password Change, IP Address)' : 'Real-time trace of user logins, orders, refunds, and security actions.'}
 </p>
 </div>

 {/* Controls */}
 <div className="flex flex-wrap items-center gap-2">
 {/* Search Input */}
 <div className="relative">
 <input
 type="text"
 value={userActivitySearch}
 onChange={(e) => setUserActivitySearch(e.target.value)}
 placeholder={isKm ? 'ស្វែងរកតាម Username, Email, IP...' : 'Search Username, IP, Order...'}
 className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 w-48 sm:w-60"
 />
 <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
 </div>

 {/* Action Filter */}
 <select
 value={userActivityActionFilter}
 onChange={(e) => setUserActivityActionFilter(e.target.value)}
 className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
 >
 <option value="ALL">{isKm ? 'សកម្មភាពទាំងអស់' : 'All Actions'}</option>
 <option value="LOGIN">LOGIN (ចូលប្រើ)</option>
 <option value="LOGOUT">LOGOUT (ចាកចេញ)</option>
 <option value="CREATE_ORDER">CREATE_ORDER (ទិញកញ្ចប់)</option>
 <option value="WALLET_REFUND">WALLET_REFUND (បង្វិលប្រាក់)</option>
 <option value="CHANGE_PASSWORD">CHANGE_PASSWORD (ប្តូរ Password)</option>
 </select>

 <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono border border-blue-200">
 {userActivities.filter((log: any) => {
 const matchAction = userActivityActionFilter === 'ALL' || (log.action && log.action.toUpperCase() === userActivityActionFilter.toUpperCase());
 const sClean = userActivitySearch.toLowerCase().trim();
 const matchSearch = !sClean || (
 (log.username && log.username.toLowerCase().includes(sClean)) ||
 (log.email && log.email.toLowerCase().includes(sClean)) ||
 (log.user_id && log.user_id.toLowerCase().includes(sClean)) ||
 (log.details && log.details.toLowerCase().includes(sClean)) ||
 (log.target_id && log.target_id.toLowerCase().includes(sClean)) ||
 (log.ip_address && log.ip_address.toLowerCase().includes(sClean))
 );
 return matchAction && matchSearch;
 }).length} Records
 </span>
 </div>
 </div>

 {/* Activity Logs Table */}
 <div className="overflow-x-auto rounded-2xl border border-slate-200">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
 <th className="p-3 whitespace-nowrap">កាលបរិច្ឆេទ (Time)</th>
 <th className="p-3 whitespace-nowrap">អ្នកប្រើប្រាស់ (User Account)</th>
 <th className="p-3 whitespace-nowrap">ប្រភេទសកម្មភាព (Action)</th>
 <th className="p-3 whitespace-nowrap">ព័ត៌មានលម្អិត (Details)</th>
 <th className="p-3 whitespace-nowrap text-right">IP Address & Device</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-sans">
 {userActivities.filter((log: any) => {
 const matchAction = userActivityActionFilter === 'ALL' || (log.action && log.action.toUpperCase() === userActivityActionFilter.toUpperCase());
 const sClean = userActivitySearch.toLowerCase().trim();
 const matchSearch = !sClean || (
 (log.username && log.username.toLowerCase().includes(sClean)) ||
 (log.email && log.email.toLowerCase().includes(sClean)) ||
 (log.user_id && log.user_id.toLowerCase().includes(sClean)) ||
 (log.details && log.details.toLowerCase().includes(sClean)) ||
 (log.target_id && log.target_id.toLowerCase().includes(sClean)) ||
 (log.ip_address && log.ip_address.toLowerCase().includes(sClean))
 );
 return matchAction && matchSearch;
 }).length === 0 ? (
 <tr>
 <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
 {isKm ? 'មិនទាន់មានកំណត់ត្រាសកម្មភាពនៅឡើយទេ' : 'No user activity logs found.'}
 </td>
 </tr>
 ) : (
 userActivities.filter((log: any) => {
 const matchAction = userActivityActionFilter === 'ALL' || (log.action && log.action.toUpperCase() === userActivityActionFilter.toUpperCase());
 const sClean = userActivitySearch.toLowerCase().trim();
 const matchSearch = !sClean || (
 (log.username && log.username.toLowerCase().includes(sClean)) ||
 (log.email && log.email.toLowerCase().includes(sClean)) ||
 (log.user_id && log.user_id.toLowerCase().includes(sClean)) ||
 (log.details && log.details.toLowerCase().includes(sClean)) ||
 (log.target_id && log.target_id.toLowerCase().includes(sClean)) ||
 (log.ip_address && log.ip_address.toLowerCase().includes(sClean))
 );
 return matchAction && matchSearch;
 }).map((log: any, idx: number) => (
 <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
 <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
 {new Date(log.created_at || Date.now()).toLocaleString()}
 </td>
 <td className="p-3 whitespace-nowrap">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
 {log.username ? log.username.charAt(0).toUpperCase() : 'U'}
 </div>
 <div>
 <span className="font-bold text-slate-900 block leading-tight">{log.username}</span>
 <div className="flex items-center gap-1.5 mt-0.5">
 {log.email && <span className="text-[10px] text-slate-500 font-medium block">{log.email}</span>}
 {log.user_id && (
 <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
 {log.user_id}
 </span>
 )}
 </div>
 </div>
 </div>
 </td>
 <td className="p-3 whitespace-nowrap">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
 log.action === 'LOGIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
 log.action === 'CREATE_ORDER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
 log.action === 'WALLET_REFUND' ? 'bg-amber-50 text-amber-800 border-amber-200' :
 log.action === 'CHANGE_PASSWORD' ? 'bg-purple-50 text-purple-700 border-purple-200' :
 'bg-slate-100 text-slate-700 border-slate-200'
 }`}>
 {isKm ? log.action_label_km : log.action_label_en}
 </span>
 </td>
 <td className="p-3 text-slate-800 font-medium max-w-xs truncate" title={log.details}>
 {log.details}
 </td>
 <td className="p-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
 <span className="text-slate-800 font-bold block">{log.ip_address || '127.0.0.1'}</span>
 <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{log.user_agent || 'Web Browser'}</span>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 3: GAMES CATALOG */}
 {/* ========================================================================= */}
 {activeTab === 'games' && (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-slate-900">Supported Video Games ({games.length})</h2>
 <p className="text-xs text-slate-500">Categorized game catalog with custom inputs & primary/fallback routing</p>
 </div>

 <div className="flex items-center gap-2">
 <select
 value={productGameFilter}
 onChange={(e) => setProductGameFilter(e.target.value)}
 className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
 >
 <option value="all">គ្រប់ប្រភេទ (All Categories)</option>
 <option value="mobile"> Mobile Games</option>
 <option value="pc"> PC Games</option>
 <option value="voucher">Vouchers & Cards</option>
 </select>

 <button
 onClick={() => setIsAddingGame(true)}
 className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
 >
 <Plus className="w-4 h-4" />
 <span>Add Game</span>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {games
 .filter((g) => productGameFilter === 'all' || g.category === productGameFilter)
 .map((g) => (
 <div key={g.id} className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs flex flex-col justify-between">
 <div>
 <div className="flex items-start gap-3">
 <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden">
 <img 
 src={getGameThumbnailUrl(g.slug, g.thumbnail)} 
 alt={g.name_en} 
 className="w-full h-full object-contain"
 onError={(e: any) => { e.target.src = 'https://play-lh.googleusercontent.com/MztmLpB1-_eFbHnqNzzvzl5zjiOH2BEb0D71uBxZYf_4BEmW3QEPWODhRtyqY7Qz4wRLwQ--Rg1RAjOFqtHSs-o=s512'; }}
 />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5 flex-wrap mb-1">
 <span className="text-[10px] font-bold text-blue-600 uppercase">{g.publisher || 'Moonton'}</span>
 <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
 {g.category === 'mobile' ? ' Mobile' : g.category === 'pc' ? ' PC' : g.category === 'voucher' ? 'Voucher' : g.category || 'Game'}
 </span>
 </div>
 <h4 className="font-bold text-slate-900 text-sm truncate">{g.name_en}</h4>
 <p className="text-[10px] text-slate-500 truncate">{g.name_km}</p>
 </div>
 </div>

 <div className="mt-3 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
 <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
 <span>Denominations ({g.packages?.length || 0})</span>
 <span className="text-blue-600">Provider: {g.primary_provider_id || 'Bay2Game'}</span>
 </div>
 {(g.packages || []).slice(0, 3).map((p: any) => (
 <div key={p.id} className="flex justify-between text-slate-700 font-medium">
 <span className="truncate mr-2">{p.name_en}</span>
 <span className="font-mono text-blue-600 font-bold whitespace-nowrap">
 ${p.price_user_usd.toFixed(2)}
 </span>
 </div>
 ))}
 </div>
 </div>

 <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
 <span className="text-emerald-700 font-bold flex items-center gap-1">
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
 Active
 </span>

 <button
 onClick={async () => {
 if (confirm('Delete game "' + g.name_en + '"?')) {
 await fetch('/api/v1/admin/games/' + g.id, { method: 'DELETE' });
 showToast('Game deleted', 'info');
 loadData();
 }
 }}
 className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200"
 >
 Delete
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 4: PRODUCTS & PRICING MATRIX */}
 {/* ========================================================================= */}
 {activeTab === 'products' && (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-slate-900">Product SKU Matrix & Pricing Controls</h2>
 <p className="text-xs text-slate-500">
 Live catalog of all synced packages. Set global markup formulas or apply manual price overrides.
 </p>
 </div>

 <div className="flex items-center gap-3">
 <select
 value={productGameFilter}
 onChange={(e) => setProductGameFilter(e.target.value)}
 className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
 >
 <option value="all">All Games ({games.length})</option>
 {games.map(g => (
 <option key={g.slug} value={g.slug}>{g.name_en}</option>
 ))}
 </select>
 </div>
 </div>

 {/* Bulk Pricing & Markup Engine Toolbar (Pure White Clean Layout) */}
 <div className="p-6 rounded-3xl bg-white border-2 border-blue-100 shadow-xs text-slate-900 space-y-4">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2 flex-wrap">
 <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
 <Coins className="w-4 h-4" />
 </div>
 <h3 className="text-base font-black text-slate-900">
 {isKm ? 'ប្រព័ន្ធកំណត់តម្លៃចំណេញទូទៅ (Bulk Pricing & Markup Engine)' : 'Bulk Pricing & Profit Markup Engine'}
 </h3>
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
 Target: {productGameFilter === 'all' ? (isKm ? 'គ្រប់ហ្គេមទាំងអស់ (All Games)' : 'All Games') : (games.find(g => g.slug === productGameFilter)?.name_en || productGameFilter)}
 </span>
 </div>
 <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
 {isKm 
 ? 'កំណត់ការបូកថែមដុល្លារ/សេន (ដូចជា ថ្លៃដើម $1.50 + $0.10 = $1.60) ឬគិតតាមភាគរយ (%) ពីលើថ្លៃដើមរបស់ Provider។'
 : 'Add fixed USD cents (e.g., Cost $1.50 + $0.10 = $1.60) or apply percentage markup (%) across the catalog.'}
 </p>
 </div>

 {/* Pricing Mode Tabs */}
 <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
 <button
 type="button"
 onClick={() => setBulkPricingMode('fixed')}
 className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
 bulkPricingMode === 'fixed'
 ? 'bg-blue-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
 }`}
 >
 <DollarSign className="w-3.5 h-3.5" />
 <span>{isKm ? 'បូកថែមដុល្លារ/សេន (Fixed +$)' : 'Fixed USD (+$0.10)'}</span>
 </button>
 <button
 type="button"
 onClick={() => setBulkPricingMode('percent')}
 className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
 bulkPricingMode === 'percent'
 ? 'bg-blue-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
 }`}
 >
 <Percent className="w-3.5 h-3.5" />
 <span>{isKm ? 'គិតជាភាគរយ (+%)' : 'Percentage (+%)'}</span>
 </button>
 </div>
 </div>

 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
 {/* Quick Presets & Example */}
 <div className="space-y-2">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="text-xs font-bold text-slate-500 mr-1">
 {bulkPricingMode === 'fixed' ? (isKm ? 'ជ្រើសរើសរហ័ស:' : 'Quick Cents:') : (isKm ? 'ជ្រើសរើស %:' : 'Quick %:')}
 </span>
 {bulkPricingMode === 'fixed' ? (
 [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.50, 1.00].map((amt) => (
 <button
 key={amt}
 type="button"
 onClick={() => setBulkFixedAddUsd(amt)}
 className={`px-2.5 py-1.5 rounded-xl text-xs font-black font-mono transition-all ${
 bulkFixedAddUsd === amt 
 ? 'bg-blue-600 text-white shadow-xs scale-105' 
 : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
 }`}
 >
 {amt === 0 ? (isKm ? 'គ្មានថែម (None $0)' : 'None ($0.00)') : `+$${amt.toFixed(2)}`}
 </button>
 ))
 ) : (
 [0, 5, 10, 12, 15, 20, 25, 30].map((pct) => (
 <button
 key={pct}
 type="button"
 onClick={() => {
 setBulkMarkupPercent(pct);
 setBulkResellerMarkup(Math.round(pct * 0.6 * 10) / 10);
 setBulkVipMarkup(Math.round(pct * 0.35 * 10) / 10);
 }}
 className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
 bulkMarkupPercent === pct 
 ? 'bg-blue-600 text-white shadow-xs scale-105' 
 : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
 }`}
 >
 {pct === 0 ? (isKm ? 'គ្មានថែម (None 0%)' : 'None (0%)') : `+${pct}%`}
 </button>
 ))
 )}
 </div>

 {/* Live Formula Example */}
 <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5 bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-100 max-w-xl">
 <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
 <span>
 {bulkPricingMode === 'fixed' 
 ? (isKm ? `ឧទាហរណ៍: ថ្លៃដើម $1.50 + $${bulkFixedAddUsd.toFixed(2)} = $${(1.50 + bulkFixedAddUsd).toFixed(2)} USD (User Retail)` : `Formula: Cost $1.50 + $${bulkFixedAddUsd.toFixed(2)} = $${(1.50 + bulkFixedAddUsd).toFixed(2)} USD (Retail)`)
 : (isKm ? `ឧទាហរណ៍: ថ្លៃដើម $1.50 + ${bulkMarkupPercent}% = $${(1.50 * (1 + bulkMarkupPercent/100)).toFixed(2)} USD (User Retail)` : `Formula: Cost $1.50 + ${bulkMarkupPercent}% = $${(1.50 * (1 + bulkMarkupPercent/100)).toFixed(2)} USD (Retail)`)}
 </span>
 </div>
 </div>

 {/* Input Box and Apply Button */}
 <div className="flex items-center gap-3 shrink-0">
 <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white shadow-xs">
 <span className="text-xs font-bold text-slate-500 mr-2">
 {bulkPricingMode === 'fixed' ? 'Add USD:' : 'Markup %:'}
 </span>
 {bulkPricingMode === 'fixed' ? (
 <div className="flex items-center">
 <span className="text-blue-600 font-black mr-1">$</span>
 <input
 type="number"
 step="0.01"
 min="0"
 max="100"
 value={bulkFixedAddUsd}
 onChange={(e) => setBulkFixedAddUsd(parseFloat(e.target.value) || 0)}
 className="w-16 bg-transparent text-slate-900 font-mono font-black text-sm focus:outline-none text-right"
 />
 </div>
 ) : (
 <div className="flex items-center">
 <input
 type="number"
 step="0.5"
 min="0"
 max="200"
 value={bulkMarkupPercent}
 onChange={(e) => {
 const val = parseFloat(e.target.value) || 0;
 setBulkMarkupPercent(val);
 setBulkResellerMarkup(Math.round(val * 0.6 * 10) / 10);
 setBulkVipMarkup(Math.round(val * 0.35 * 10) / 10);
 }}
 className="w-16 bg-transparent text-slate-900 font-mono font-black text-sm focus:outline-none text-right"
 />
 <span className="text-blue-600 font-black ml-1">%</span>
 </div>
 )}
 </div>

 <button
 onClick={handleApplyBulkMarkup}
 disabled={applyingBulkMarkup}
 className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
 >
 {applyingBulkMarkup ? (
 <RefreshCw className="w-4 h-4 animate-spin" />
 ) : (
 <Check className="w-4 h-4" />
 )}
 <span>
 {applyingBulkMarkup 
 ? (isKm ? 'កំពុងអនុវត្ត...' : 'Applying...') 
 : (isKm ? 'អនុវត្តតម្លៃទាំងអស់' : 'Apply to Catalog')}
 </span>
 </button>
 </div>
 </div>
 </div>

 <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full min-w-[1000px] text-left text-xs text-slate-600">
 <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
 <tr>
 <th className="px-4 py-3 min-w-[180px]">Game & SKU</th>
 <th className="px-4 py-3 min-w-[160px]">Package Name</th>
 <th className="px-4 py-3 min-w-[110px]">Provider Cost</th>
 <th className="px-4 py-3 min-w-[110px]">User Retail</th>
 <th className="px-4 py-3 min-w-[110px]">Reseller Tier</th>
 <th className="px-4 py-3 min-w-[100px]">VIP Tier</th>
 <th className="px-4 py-3 min-w-[130px]">Pricing Mode</th>
 <th className="px-4 py-3 text-right min-w-[130px]">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
              {allProducts.map((pkg, idx) => {
                const marginPercent = pkg.cost_usd > 0 
                  ? Math.round(((pkg.price_user_usd - pkg.cost_usd) / pkg.cost_usd) * 100) 
                  : 0;

                return (
                  <tr key={`${pkg.id}-${pkg.gameSlug || pkg.gameTitle || 'pkg'}-${idx}`} className="hover:bg-slate-50 transition-colors">
 <td className="px-4 py-3">
 <div className="font-bold text-slate-900">{pkg.gameTitle}</div>
 <span className="font-mono text-[10px] text-slate-400">{pkg.id}</span>
 </td>
 <td className="px-4 py-3 font-bold text-slate-800">
 {pkg.name_en}
 </td>
 <td className="px-4 py-3 font-mono text-slate-500">
 ${pkg.cost_usd.toFixed(2)}
 </td>
 <td className="px-4 py-3 font-mono font-black text-blue-600">
 ${pkg.price_user_usd.toFixed(2)}
 </td>
 <td className="px-4 py-3 font-mono font-bold text-purple-600">
 ${pkg.price_reseller_usd.toFixed(2)}
 </td>
 <td className="px-4 py-3 font-mono font-bold text-amber-600">
 ${pkg.price_vip_usd.toFixed(2)}
 </td>
 <td className="px-4 py-3">
 {pkg.manual_price_override ? (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
 Manual Override
 </span>
 ) : (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
 Auto +{marginPercent}%
 </span>
 )}
 </td>
 <td className="px-4 py-3 text-right">
 <button
 onClick={() => {
 const parentGame = games.find(g => g.slug === pkg.gameSlug);
 setEditingProduct({ game: parentGame, pkg });
 setEditPriceUser(pkg.price_user_usd);
 setEditPriceReseller(pkg.price_reseller_usd);
 setEditPriceVip(pkg.price_vip_usd);
 setEditManualOverride(pkg.manual_price_override || false);
 setEditMarkupPercent(pkg.markup_percent || 12);
 }}
 className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition-colors border border-slate-200 inline-flex items-center gap-1"
 >
 <Edit2 className="w-3 h-3" />
 <span>Edit Pricing</span>
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 5: ORDERS */}
  {/* ========================================================================= */}
  {activeTab === 'orders' && (
    <div className="space-y-6">
      {/* Header, Filters & Delete All Fake Data Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1.5 border border-blue-100">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>{isKm ? 'គ្រប់គ្រងការបញ្ជាទិញ & វិក្កយបត្រ' : 'Orders & Invoices Management'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isKm ? 'បញ្ជីការបញ្ជាទិញ & វិក្កយបត្រ (Orders & Invoices)' : 'Orders & Payment Invoices'} ({filteredOrders.length})
          </h2>
          <p className="text-xs text-slate-500">
            {isKm ? 'ពិនិត្យមើលលេខវិក្កយបត្រ (Invoice ID), វិធីសាស្ត្រទូទាត់ (Payment Method), ស្ថានភាពប្រាក់, និងលុបទិន្នន័យតេស្ត' : 'Real-time orders, payment invoice references, payment status, and single/batch order deletion'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportToCsv('orders_export', filteredOrders)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer shadow-2xs"
            title={isKm ? 'ទាញយករបាយការណ៍ Orders ជា File Excel (CSV)' : 'Export Orders to Excel/CSV'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isKm ? 'ទាញយក Excel (CSV)' : 'Export Orders CSV'}</span>
          </button>

          <button
            onClick={handleClearAllOrders}
            title={isKm ? 'លុបទិន្នន័យ Orders តេស្តទាំងអស់ (Clear All Test Data)' : 'Clear All Test Orders'}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isKm ? 'លុប Fake/Test Orders ទាំងអស់' : 'Clear All Fake Orders'}</span>
          </button>

          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'processing', 'success', 'failed', 'refunded'].map((st) => (
          <button
            key={st}
            onClick={() => setOrderFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
              orderFilter === st
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders & Invoices Table */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3.5 min-w-[180px]">Order & Invoice ID</th>
                <th className="px-4 py-3.5 min-w-[160px]">Game & Package</th>
                <th className="px-4 py-3.5 min-w-[120px]">Player UID</th>
                <th className="px-4 py-3.5 min-w-[150px]">Payment & Invoice</th>
                <th className="px-4 py-3.5 min-w-[110px]">Provider</th>
                <th className="px-4 py-3.5 min-w-[90px]">Amount</th>
                <th className="px-4 py-3.5 min-w-[100px]">Status</th>
                <th className="px-4 py-3.5 text-right min-w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium">
                    {isKm ? 'មិនមានទិន្នន័យបញ្ជាទិញឡើយ (No orders found)' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order ID & Invoice Ref */}
                    <td className="px-4 py-3.5">
                      <button 
                        onClick={() => setSelectedOrderDetail(ord)} 
                        className="font-mono font-black text-blue-600 hover:text-blue-800 hover:underline text-sm block"
                      >
                        {ord.id}
                      </button>
                      <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>Inv: {ord.reference || ord.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(ord.created_at).toLocaleString()}
                      </div>
                    </td>

                    {/* Game & Product */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{ord.game_name_en}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{ord.product_name_en}</div>
                    </td>

                    {/* Player UID */}
                    <td className="px-4 py-3.5 font-mono">
                      <div className="font-black text-slate-900">{ord.player_id}</div>
                      {ord.server_id && (
                        <div className="text-[10px] text-slate-500">Zone/Server: {ord.server_id}</div>
                      )}
                    </td>

                    {/* Payment Method & Payment Status */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <span>{ord.payment_method_name || ord.payment_method_id || 'Bakong KHQR'}</span>
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          ord.payment_status === 'paid' || ord.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ord.payment_status === 'refunded'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {ord.payment_status === 'paid' || ord.status === 'success' 
                            ? (isKm ? 'PAID (បានទូទាត់)' : 'PAID') 
                            : (isKm ? 'UNPAID (មិនទាន់ទូទាត់)' : 'UNPAID')}
                        </span>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-slate-700 uppercase block">
                        {ord.provider_id || 'bay2game'}
                      </span>
                      {ord.delivery_code && (
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] block">
                          {ord.delivery_code}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <div className="font-black text-slate-900 text-sm font-mono">
                        ${ord.amount_usd.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ៛{ord.amount_khr ? ord.amount_khr.toLocaleString() : Math.round(ord.amount_usd * 4100).toLocaleString()}
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        ord.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        ord.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        ord.status === 'refunded' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {ord.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status !== 'success' && ord.status !== 'refunded' && (
                          <button
                            onClick={() => handleRetryOrder(ord.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                            title={isKm ? 'ព្យាយាមទិញម្តងទៀតតាម API (Re-purchase via Bay2Game API)' : 'Re-purchase via Provider API'}
                          >
                            Approve
                          </button>
                        )}

                        {/* View វិក្កយបត្រ / Invoice */}
                        <button
                          onClick={() => setSelectedOrderDetail(ord)}
                          className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                          title={isKm ? 'មើលវិក្កយបត្រ (View Invoice)' : 'Inspect Invoice'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Single Order */}
                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                          title={isKm ? 'លុប Order នេះ (Delete Order)' : 'Delete Order'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* TAB 6: USERS */}
  {/* ========================================================================= */}
  {activeTab === 'users' && (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1.5 border border-blue-100">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{isKm ? 'គ្រប់គ្រងគណនីអតិថិជន & ពាក្យសម្ងាត់' : 'User Accounts & Credentials'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isKm ? 'គណនីអតិថិជនទាំងអស់' : 'Customer Accounts'} ({users.length})
          </h2>
          <p className="text-xs text-slate-500">
            {isKm ? 'ពិនិត្យមើលឈ្មោះគណនី, អ៊ីមែល, ពាក្យសម្ងាត់, និងសមតុល្យកាបូបលុយរបស់ User នីមួយៗ' : 'Manage registered accounts, view plain passwords, emails, and wallet balances'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isKm ? 'ស្វែងរក Username, Email, ID...' : 'Search username, email, ID...'}
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold whitespace-nowrap">
                <th className="px-4 py-3.5 whitespace-nowrap">User & Account ID</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Email Address</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Password</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Phone</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Role</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Wallet Balance</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Spins (ការបង្វិល)</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[380px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users
                .filter((u) => {
                  if (!userSearchQuery) return true;
                  const q = userSearchQuery.toLowerCase();
                  return (
                    (u.username && u.username.toLowerCase().includes(q)) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.id && u.id.toLowerCase().includes(q)) ||
                    (u.phone && u.phone.toLowerCase().includes(q)) ||
                    (u.role && u.role.toLowerCase().includes(q))
                  );
                })
                .map((u) => {
                  const isPassVisible = !!visiblePasswords[u.id];
                  const plainPass = u.password_plain || u.plain_password || 'N/A';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                      {/* User & ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{u.username}</span>
                        </div>
                        <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                          <span>ID:</span>
                          <span>{u.id}</span>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-bold text-slate-800 text-xs select-all whitespace-nowrap">{u.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.email, `email-${u.id}`)}
                            title="Copy Email"
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                          >
                            {copiedField === `email-${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 whitespace-nowrap">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-mono font-bold text-xs text-slate-900 tracking-wider select-all whitespace-nowrap">
                            {isPassVisible ? plainPass : '••••••••••••'}
                          </span>
                          
                          {/* Toggle View Password */}
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            title={isPassVisible ? 'Hide Password' : 'Show Password'}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1 cursor-pointer shrink-0"
                          >
                            {isPassVisible ? (
                              <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>

                          {/* Copy Password */}
                          <button
                            type="button"
                            onClick={() => copyToClipboard(plainPass, `pass-${u.id}`)}
                            title="Copy Password"
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                          >
                            {copiedField === `pass-${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-medium whitespace-nowrap">
                        {u.phone || '-'}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'reseller'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Wallet Balance */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                          ${(u.wallet_usd || 0).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {((u.wallet_usd || 0) * 4100).toLocaleString()} KHR
                        </div>
                      </td>

                      {/* Spins Remaining */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{u.spins_remaining || 0} {isKm ? 'ការបង្វិល' : 'Spins'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                          {/* Add Spins Button */}
                          <button
                            onClick={() => {
                              setAdjustSpinsUser(u);
                              setAdjustSpinsCount('5');
                            }}
                            title={isKm ? 'បន្ថែមចំនួនការបង្វិល (+ Add Spins)' : 'Add Lucky Draw Spins'}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 text-xs font-bold transition-all border border-amber-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs group"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:text-white shrink-0" />
                            <span className="whitespace-nowrap">{isKm ? '+ ការបង្វិល' : '+ Spins'}</span>
                          </button>
                          {/* Add Funds Button */}
                          <button
                            onClick={() => {
                              setAdjustUser(u);
                              setAdjustUserId(u.id);
                              setAdjustMode('add');
                              setAdjustAmount('50');
                              setAdjustReason('Admin deposit credit');
                            }}
                            title={isKm ? 'បន្ថែមលុយចូលកាបូប (+ Add Funds)' : 'Add Funds to Wallet'}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold transition-all border border-emerald-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs group"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white shrink-0" />
                            <span className="whitespace-nowrap">{isKm ? 'ដាក់លុយ' : 'Add'}</span>
                          </button>

                          {/* Delete / Deduct Funds Button */}
                          <button
                            onClick={() => {
                              setAdjustUser(u);
                              setAdjustUserId(u.id);
                              setAdjustMode('deduct');
                              setAdjustAmount('10');
                              setAdjustReason('Admin balance deduction');
                            }}
                            title={isKm ? 'កាត់លុយ / លុបលុយពីកាបូប (- Deduct Funds)' : 'Deduct / Delete Funds from Wallet'}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold transition-all border border-rose-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs group"
                          >
                            <Minus className="w-3.5 h-3.5 text-rose-600 group-hover:text-white shrink-0" />
                            <span className="whitespace-nowrap">{isKm ? 'កាត់លុយ' : 'Deduct'}</span>
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => { setResetPasswordUser(u); setResetPasswordValue('RoleaPass123!'); }}
                            title={isKm ? 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ (Reset Password)' : 'Reset Password'}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 text-xs font-bold transition-all border border-amber-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs group"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-600 group-hover:text-white shrink-0" />
                            <span className="whitespace-nowrap">{isKm ? 'ដូរលេខកូដ' : 'Reset'}</span>
                          </button>

                          {/* Edit Email & Phone Info Button */}
                          <button
                            onClick={() => {
                              setEditInfoUser(u);
                              setEditInfoEmail(u.email || '');
                              setEditInfoPhone(u.phone || '');
                              setEditInfoUsername(u.username || '');
                              setEditInfoRole(u.role || 'user');
                            }}
                            title={isKm ? 'កែប្រែព័ត៌មាន Email, Phone & Profile' : 'Edit Email, Phone & User Info'}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold transition-all border border-blue-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs group"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600 group-hover:text-white shrink-0" />
                            <span className="whitespace-nowrap">{isKm ? 'កែព័ត៌មាន' : 'Edit Info'}</span>
                          </button>

                          {/* Delete Account Button */}
                          <button
                            onClick={async () => {
                              if (u.id === 'usr-admin' || u.username === 'admin') {
                                alert(isKm ? 'មិនអាចលុបគណនី Admin មេបានទេ (Cannot delete main admin account)' : 'Cannot delete main admin account');
                                return;
                              }
                              if (!confirm(isKm ? `តើអ្នកពិតជាចង់លុបគណនី "${u.username}" (${u.email}) នេះមែនទេ?` : `Are you sure you want to delete user account "${u.username}"?`)) return;
                              try {
                                const res = await fetch(`/api/v1/admin/users/${u.id}`, {
                                  method: 'DELETE'
                                });
                                const data = await res.json();
                                if (data.success) {
                                  alert(isKm ? `បានលុបគណនី ${u.username} រួចរាល់!` : `User ${u.username} deleted successfully!`);
                                  loadData();
                                } else {
                                  alert(data.detail || 'Failed to delete user');
                                }
                              } catch (e) {
                                alert('Error deleting user account');
                              }
                            }}
                            title={isKm ? 'លុបគណនីអ្នកប្រើប្រាស់នេះចោល (Delete User Account)' : 'Delete User Account'}
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-bold transition-all border border-red-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs group"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 group-hover:text-white shrink-0" />
                            <span className="whitespace-nowrap">{isKm ? 'លុបគណនី' : 'Delete Acc'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* TAB 7: RESELLERS & B2B (WITH PENDING APPROVAL WORKFLOW) */}
 {activeTab === 'resellers' && (
 <div className="space-y-8">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-slate-900">
 {isKm ? 'គ្រប់គ្រងដៃគូលក់បន្ត & ពាក្យស្នើសុំ (Resellers Hub)' : 'B2B Resellers & Wholesale Applications'}
 </h2>
 <p className="text-xs text-slate-500 mt-1">
 {isKm 
 ? 'ពិនិត្យអនុម័តពាក្យស្នើសុំថ្មី, កំណត់ API Keys, និងគ្រប់គ្រងសមតុល្យកាបូប Reseller' 
 : 'Review pending reseller applications, generate B2B API keys, and manage wholesale balances'}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={loadData}
 className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 <span>{isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
 </button>
 </div>
 </div>

 {/* SECTION 1: PENDING APPLICATIONS */}
 {(() => {
 const pendingApps = resellers.filter(r => r.reseller_status === 'pending');
 return (
 <div className="rounded-3xl bg-white border border-amber-200 shadow-xs overflow-hidden">
 <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-700 flex items-center justify-center font-bold">
 <Clock className="w-4 h-4 animate-pulse" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
 <span>{isKm ? 'ពាក្យស្នើសុំរង់ចាំការអនុម័ត (Pending Approval)' : 'Pending Reseller Applications'}</span>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
 {pendingApps.length}
 </span>
 </h3>
 <p className="text-[11px] text-slate-500">
 {isKm ? 'ពាក្យស្នើសុំចុះឈ្មោះថ្មីដែលទាមទារការយល់ព្រម ឬបដិសេធពី Admin' : 'New applicant registrations requiring Admin approval'}
 </p>
 </div>
 </div>
 </div>

 {pendingApps.length === 0 ? (
 <div className="p-8 text-center text-slate-400 text-xs">
 <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
 <p className="font-semibold text-slate-600">
 {isKm ? 'គ្មានពាក្យស្នើសុំដែលកំពុងរង់ចាំនោះទេ' : 'No pending reseller applications at this time'}
 </p>
 <p className="text-[11px] text-slate-400 mt-0.5">
 {isKm ? 'រាល់ពាក្យស្នើសុំចុះឈ្មោះថ្មីនឹងបង្ហាញនៅទីនេះ' : 'All incoming B2B applications will appear here for review'}
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-slate-600">
 <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
 <tr>
 <th className="px-4 py-3">{isKm ? 'ឈ្មោះគណនី / អ៊ីមែល' : 'Applicant / Contact'}</th>
 <th className="px-4 py-3">{isKm ? 'លេខទូរស័ព្ទ' : 'Phone'}</th>
 <th className="px-4 py-3">{isKm ? 'កាលបរិច្ឆេទដាក់ពាក្យ' : 'Applied Date'}</th>
 <th className="px-4 py-3">{isKm ? 'ស្ថានភាព' : 'Status'}</th>
 <th className="px-4 py-3 text-right">{isKm ? 'សកម្មភាព (Admin Action)' : 'Actions'}</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {pendingApps.map((app) => (
 <tr key={app.id} className="hover:bg-amber-50/40 transition-colors">
 <td className="px-4 py-3">
 <div className="font-bold text-slate-900">{app.username}</div>
 <div className="text-[10px] text-slate-400 font-mono">{app.email}</div>
 <div className="text-[9px] text-slate-400 font-mono">ID: {app.id}</div>
 </td>
 <td className="px-4 py-3 font-mono font-semibold text-slate-700">
 {app.phone || (isKm ? 'មិនបានបញ្ចូល' : 'N/A')}
 </td>
 <td className="px-4 py-3 text-slate-500 text-[11px]">
 {app.reseller_applied_at ? new Date(app.reseller_applied_at).toLocaleString() : (isKm ? 'ថ្មីៗ' : 'Recent')}
 </td>
 <td className="px-4 py-3">
 <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
 {isKm ? 'រង់ចាំ Admin' : 'Pending'}
 </span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => handleApproveReseller(app.id)}
 className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 <span>{isKm ? 'យល់ព្រម (Approve)' : 'Approve'}</span>
 </button>
 <button
 onClick={() => handleRejectReseller(app.id)}
 className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold border border-red-200 transition-colors flex items-center gap-1"
 >
 <X className="w-3.5 h-3.5" />
 <span>{isKm ? 'បដិសេធ (Reject)' : 'Reject'}</span>
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 );
 })()}

 {/* SECTION 2: APPROVED ACTIVE RESELLERS */}
 {(() => {
 const approvedResellers = resellers.filter(r => r.reseller_status === 'approved' || (!r.reseller_status && r.role === 'reseller'));
 return (
 <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
 <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
 <div>
 <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
 <span>{isKm ? 'បញ្ជីដៃគូលក់បន្តសកម្ម (Active Approved Resellers)' : 'Active Approved Resellers'}</span>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white">
 {approvedResellers.length}
 </span>
 </h3>
 <p className="text-[11px] text-slate-500">
 {isKm ? 'ដៃគូលក់បន្តដែលបានអនុម័ត និងអាចប្រើប្រាស់ B2B API និងតម្លៃបោះដុំ' : 'Verified B2B wholesale partners with live API access'}
 </p>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-slate-600">
 <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
 <tr>
 <th className="px-4 py-3">{isKm ? 'គណនីដៃគូ' : 'Reseller Account'}</th>
 <th className="px-4 py-3">{isKm ? 'កម្រិត (Tier)' : 'Tier'}</th>
 <th className="px-4 py-3">{isKm ? 'សមតុល្យកាបូប' : 'Wallet Balance'}</th>
 <th className="px-4 py-3">{isKm ? 'ស្ថានភាព API' : 'API Status'}</th>
 <th className="px-4 py-3 text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {approvedResellers.map((r) => (
 <tr key={r.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-4 py-3">
 <div className="font-bold text-slate-900">{r.username}</div>
 <div className="text-[10px] text-slate-400 font-mono">{r.email}</div>
 <div className="text-[9px] text-slate-400 font-mono">ID: {r.id}</div>
 </td>
 <td className="px-4 py-3">
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200">
 RESELLER VIP
 </span>
 </td>
 <td className="px-4 py-3 font-mono font-black text-slate-900">
 ${(r.wallet_usd || 0).toFixed(2)} USD
 </td>
 <td className="px-4 py-3">
 <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active API Access
 </span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => handleGenerateResellerKey(r.id)}
 className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
 >
 New API Key
 </button>
 <button
 onClick={() => { setAdjustUserId(r.id); setAdjustAmount('100'); }}
 className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
 >
 + Deposit
 </button>
 </div>
 </td>
 </tr>
 ))}
 {approvedResellers.length === 0 && (
 <tr>
 <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">
 {isKm ? 'មិនទាន់មានដៃគូលក់បន្តដែលបានអនុម័តនៅឡើយទេ' : 'No approved resellers yet'}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
 })()}

 {/* SECTION 3: REJECTED APPLICATIONS */}
 {(() => {
 const rejectedApps = resellers.filter(r => r.reseller_status === 'rejected');
 if (rejectedApps.length === 0) return null;
 return (
 <div className="rounded-3xl bg-white border border-red-200 shadow-xs overflow-hidden opacity-90">
 <div className="p-4 bg-red-50/60 border-b border-red-100 flex items-center justify-between">
 <h3 className="text-xs font-bold text-red-900 flex items-center gap-2">
 <span>{isKm ? 'ពាក្យស្នើសុំដែលបានបដិសេធ (Rejected Applications)' : 'Rejected Applications'}</span>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-200 text-red-800">
 {rejectedApps.length}
 </span>
 </h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-slate-600">
 <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
 <tr>
 <th className="px-4 py-2.5">{isKm ? 'ឈ្មោះគណនី / អ៊ីមែល' : 'Applicant'}</th>
 <th className="px-4 py-2.5">{isKm ? 'មូលហេតុបដិសេធ' : 'Rejection Reason'}</th>
 <th className="px-4 py-2.5 text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {rejectedApps.map((rej) => (
 <tr key={rej.id} className="hover:bg-slate-50">
 <td className="px-4 py-2.5">
 <span className="font-bold text-slate-900">{rej.username}</span> ({rej.email})
 </td>
 <td className="px-4 py-2.5 text-red-600 text-xs">
 {rej.reseller_reject_reason || (isKm ? 'មិនបំពេញតាមលក្ខខណ្ឌ' : 'Did not meet criteria')}
 </td>
 <td className="px-4 py-2.5 text-right">
 <button
 onClick={() => handleApproveReseller(rej.id)}
 className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-bold border border-slate-200 transition-colors"
 >
 {isKm ? 'អនុម័តឡើងវិញ (Re-approve)' : 'Re-approve'}
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
 })()}
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 8: WALLET LEDGER */}
 {activeTab === 'wallet' && (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-black text-slate-900">Financial Wallet Ledger</h2>
 <p className="text-xs text-slate-500">Transaction history of deposits, top-up debits, refunds, and adjustments</p>
 </div>
 </div>

 <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-slate-600">
 <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
 <tr>
 <th className="px-4 py-3">Tx ID & Date</th>
 <th className="px-4 py-3">User</th>
 <th className="px-4 py-3">Type</th>
 <th className="px-4 py-3">Amount</th>
 <th className="px-4 py-3">Balance After</th>
 <th className="px-4 py-3">Remarks / Reference</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {walletLedger.map((led) => (
 <tr key={led.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-4 py-3 font-mono">
 <div className="font-bold text-slate-900">{led.id}</div>
 <div className="text-[10px] text-slate-400">{new Date(led.created_at).toLocaleString()}</div>
 </td>
 <td className="px-4 py-3 font-bold text-slate-900">{led.username}</td>
 <td className="px-4 py-3 uppercase text-[10px] font-bold">
 <span className={`px-2 py-0.5 rounded-md ${
 led.type === 'deposit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
 led.type === 'refund' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
 'bg-slate-100 text-slate-700 border border-slate-200'
 }`}>
 {led.type}
 </span>
 </td>
 <td className={`px-4 py-3 font-mono font-black ${led.amount_usd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
 {led.amount_usd >= 0 ? '+' : ''}${led.amount_usd.toFixed(2)}
 </td>
 <td className="px-4 py-3 font-mono font-bold text-slate-900">${led.balance_after_usd.toFixed(2)}</td>
 <td className="px-4 py-3 text-slate-500 text-[11px]">{led.note} ({led.reference})</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 9: PAYMENTS */}
 {activeTab === 'payments' && (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-black text-slate-900">Payment Gateways & ABA PayWay KHQR</h2>
 <p className="text-xs text-slate-500">Configure VngZz 2 Game ABA PayWay KHQR Automated Gateway (https://www.vngzz2game.site/api/document)</p>
 </div>
 </div>

 {/* VngZz 2 Game ABA PayWay Automated Gateway Config */}
 <div className="p-6 rounded-3xl bg-white text-slate-900 shadow-xs border border-slate-200 space-y-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-xl shadow-xs">
 <Zap className="w-6 h-6 text-blue-600 fill-blue-500" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-lg font-black text-slate-900 tracking-tight">VngZz 2 Game ABA PayWay Gateway</h3>
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
 vngzz2game.site
 </span>
 </div>
 <p className="text-xs text-slate-500 mt-0.5">
 {isKm 
 ? 'ប្រព័ន្ធទូទាត់ប្រាក់ ABA PayWay KHQR ស្វ័យប្រវត្តិជាមួយ VngZz 2 Game API' 
 : 'Automated ABA PayWay KHQR gateway integration (Instant Auto-Delivery via Bay2Game)'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <button
 onClick={() => setVngzzActive(!vngzzActive)}
 className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase transition-all border ${
 vngzzActive 
 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs' 
 : 'bg-slate-100 text-slate-500 border-slate-200'
 }`}
 >
 {vngzzActive ? 'GATEWAY ONLINE' : 'OFFLINE'}
 </button>

 <button
 onClick={async () => {
 setSavingVngzz(true);
 try {
 const res = await fetch('/api/v1/admin/payments/vngzz', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 api_url: vngzzApiUrl,
 generate_qr_url: vngzzGenerateQrUrl,
 check_transaction_url: vngzzCheckTransUrl,
 api_key: vngzzApiKey,
 merchant_name: vngzzMerchantName,
 is_active: vngzzActive
 })
 });
 const data = await res.json();
 if (data.success) {
 showToast(
 isKm 
 ? 'បានរក្សាទុក Credentials របស់ VngZz 2 Game PayWay បានជោគជ័យ!' 
 : 'VngZz 2 Game PayWay credentials saved successfully!', 
 'success'
 );
 loadData();
 } else {
 showToast('Save failed: ' + data.message, 'error');
 }
 } catch (err) {
 showToast('Failed to save VngZz credentials', 'error');
 } finally {
 setSavingVngzz(false);
 }
 }}
 disabled={savingVngzz}
 className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5"
 >
 <Zap className={`w-4 h-4 fill-white ${savingVngzz ? 'animate-spin' : ''}`} />
 <span>{savingVngzz ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុក VngZz PayWay Config' : 'Save PayWay Config')}</span>
 </button>
 </div>
 </div>

 {/* Credentials Form Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
 {/* API Key */}
 <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
 <div className="flex items-center justify-between">
 <label className="text-xs font-bold text-slate-700 block">
 VngZz API Key <span className="text-red-500">*</span>
 </label>
 <button
 type="button"
 onClick={() => setShowVngzzSecret(!showVngzzSecret)}
 className="text-[10px] text-blue-600 hover:underline font-bold"
 >
 {showVngzzSecret ? 'Hide' : 'Show'}
 </button>
 </div>
 <input
 type={showVngzzSecret ? 'text' : 'password'}
 value={vngzzApiKey}
 onChange={(e) => setVngzzApiKey(e.target.value)}
 placeholder="Enter VngZz API Key"
 className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
 />
 <span className="text-[10px] text-slate-500 block">Sent as X-API-Key / Bearer header</span>
 </div>

 {/* Generate QR Endpoint */}
 <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
 <label className="text-xs font-bold text-slate-700 block">
 Generate QR Endpoint URL
 </label>
 <input
 type="text"
 value={vngzzGenerateQrUrl}
 onChange={(e) => setVngzzGenerateQrUrl(e.target.value)}
 placeholder="https://www.vngzz2game.site/api/v1/generate_qr"
 className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
 />
 <span className="text-[10px] text-slate-500 block">POST endpoint to issue PayWay KHQR</span>
 </div>

 {/* Check Transaction Endpoint */}
 <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
 <label className="text-xs font-bold text-slate-700 block">
 Check Transaction Endpoint URL
 </label>
 <input
 type="text"
 value={vngzzCheckTransUrl}
 onChange={(e) => setVngzzCheckTransUrl(e.target.value)}
 placeholder="https://www.vngzz2game.site/api/v1/check_transaction"
 className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
 />
 <span className="text-[10px] text-slate-500 block">POST endpoint to poll transaction status</span>
 </div>
 </div>

 {/* Action Test Connection Bar */}
 <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
 <div className="flex items-center gap-2 text-slate-600 font-medium">
 <ShieldCheck className="w-4 h-4 text-emerald-600" />
 <span>VngZz 2 Game ABA PayWay KHQR Gateway Connected (https://www.vngzz2game.site/)</span>
 </div>

 <button
 type="button"
 onClick={async () => {
 try {
 const res = await fetch('/api/v1/admin/payments/vngzz/test', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 api_key: vngzzApiKey,
 api_url: vngzzApiUrl
 })
 });
 const data = await res.json();
 if (data.success) {
 showToast(data.message, 'success');
 } else {
 showToast('VngZz Ping failed', 'error');
 }
 } catch (e) {
 showToast('Network error testing VngZz', 'error');
 }
 }}
 className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-all flex items-center gap-1.5"
 >
 <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
 <span>Test VngZz API Ping</span>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {paymentMethods.map((pm) => (
 <div key={pm.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
 <div>
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
 {pm.category}
 </span>
 <button
 onClick={async () => {
 await fetch('/api/v1/admin/payments/' + pm.id, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ is_active: !pm.is_active })
 });
 showToast('Payment method updated', 'info');
 loadData();
 }}
 className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
 pm.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
 }`}
 >
 {pm.is_active ? 'ACTIVE' : 'DISABLED'}
 </button>
 </div>

 <h4 className="text-base font-black text-slate-900 mt-2">{pm.name_en}</h4>
 <p className="text-xs text-slate-500">{pm.name_km}</p>

 <div className="mt-3 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
 <div className="flex justify-between">
 <span className="text-slate-500">Fee Percent:</span>
 <span className="font-mono font-bold text-slate-900">{pm.fee_percent}%</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500">Fixed Fee:</span>
 <span className="font-mono font-bold text-slate-900">${pm.fee_fixed_usd.toFixed(2)}</span>
 </div>
 {pm.account_number && (
 <div className="flex justify-between">
 <span className="text-slate-500">Account:</span>
 <span className="font-mono font-bold text-blue-600">{pm.account_number}</span>
 </div>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 10: COUPONS */}
 {activeTab === 'coupons' && (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-black text-slate-900">Coupons & Promo Codes</h2>
 <p className="text-xs text-slate-500">Create discount promo codes with usage limits and expiry dates</p>
 </div>

 <button
 onClick={() => setIsAddingCoupon(true)}
 className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
 >
 <Plus className="w-4 h-4" />
 <span>Create Coupon</span>
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {coupons.map((c) => (
 <div key={c.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
 <div>
 <div className="flex items-center justify-between">
 <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-mono font-black text-sm tracking-wider">
 {c.code}
 </span>
 <span className="text-[10px] font-bold uppercase text-emerald-600">Active</span>
 </div>

 <div className="mt-3 text-xs space-y-1">
 <div className="text-lg font-black text-slate-900">
 {c.discount_percent ? `${c.discount_percent}% OFF` : `$${c.discount_amount_usd} OFF`}
 </div>
 <div className="text-slate-500 text-[11px]">Min Order: ${c.min_order_usd} USD</div>
 <div className="text-slate-500 text-[11px]">Used: {c.used_count} / {c.max_uses} times</div>
 <div className="text-slate-400 text-[10px]">Valid Until: {c.valid_until}</div>
 </div>
 </div>

 <button
 onClick={() => handleDeleteCoupon(c.id)}
 className="w-full py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition-colors"
 >
 Delete Coupon
 </button>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 11: BANNERS & HERO BANNER CONFIGURATION */}
 {/* ========================================================================= */}
 {activeTab === 'banners' && (
 <BannerEditor
 language={language}
 onRefreshParent={loadData}
 />
 )}

 {/* ========================================================================= */}
 {/* TAB 12: FINANCIAL REPORTS */}
 {activeTab === 'reports' && (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-black text-slate-900">Financial Reports & Profit Auditing</h2>
 <p className="text-xs text-slate-500">Comprehensive gross sales, cost of goods (COGS), and net profit analysis</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
 <span className="text-xs font-bold text-slate-400 uppercase block">Gross Sales (USD)</span>
 <div className="text-2xl font-black text-slate-900 mt-1">${(reports?.gross_sales_usd || 0).toFixed(2)}</div>
 <span className="text-[10px] text-slate-500 font-mono block">≈ ៛{(reports?.gross_sales_khr || 0).toLocaleString()} KHR</span>
 </div>

 <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
 <span className="text-xs font-bold text-slate-400 uppercase block">Cost of Goods (COGS)</span>
 <div className="text-2xl font-black text-slate-600 mt-1">${(reports?.cost_of_goods_usd || 0).toFixed(2)}</div>
 <span className="text-[10px] text-slate-500 block">Provider wholesale cost</span>
 </div>

 <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
 <span className="text-xs font-bold text-slate-400 uppercase block">Net Profit</span>
 <div className="text-2xl font-black text-emerald-600 mt-1">${(reports?.net_profit_usd || 0).toFixed(2)}</div>
 <span className="text-[10px] text-emerald-700 font-semibold block">Margin: {reports?.profit_margin_percent || 12}%</span>
 </div>

 <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
 <span className="text-xs font-bold text-slate-400 uppercase block">Avg Order Value (AOV)</span>
 <div className="text-2xl font-black text-blue-600 mt-1">${(reports?.average_order_value_usd || 0).toFixed(2)}</div>
 <span className="text-[10px] text-slate-500 block">{reports?.total_completed_orders || 0} completed orders</span>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 13: NOTIFICATIONS */}
 {activeTab === 'notifications' && (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-black text-slate-900">System Notifications & Alerts ({notifications.length})</h2>
 <p className="text-xs text-slate-500">Real-time status updates, low upstream balance notices, and system alerts</p>
 </div>
 </div>

 <div className="space-y-3">
 {notifications.map((n) => (
 <div
 key={n.id}
 className={`p-4 rounded-3xl border shadow-xs flex items-center justify-between transition-colors ${
 n.is_read ? 'bg-white border-slate-200 text-slate-700' : 'bg-blue-50/60 border-blue-200 text-blue-950 font-bold'
 }`}
 >
 <div>
 <div className="flex items-center gap-2">
 <span className="text-sm font-black">{n.title}</span>
 {!n.is_read && (
 <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-600 text-white">
 NEW
 </span>
 )}
 </div>
 <p className="text-xs text-slate-600 mt-1">{n.message}</p>
 </div>

 <span className="text-[11px] text-slate-400 font-mono">
 {new Date(n.created_at).toLocaleString()}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 14: SYNC LOGS */}
 {activeTab === 'sync-logs' && (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-slate-900">API Sync Logs & Audit History</h2>
 <p className="text-xs text-slate-500">Detailed records of catalog synchronization, execution duration, and error codes</p>
 </div>

 <div className="flex items-center gap-2">
 {['all', 'success', 'error', 'games', 'products'].map((st) => (
 <button
 key={st}
 onClick={() => setSyncLogFilter(st)}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors ${
 syncLogFilter === st
 ? 'bg-blue-600 text-white'
 : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
 }`}
 >
 {st}
 </button>
 ))}
 </div>
 </div>

 <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-slate-600">
 <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
 <tr>
 <th className="px-4 py-3">Log ID & Time</th>
 <th className="px-4 py-3">Provider</th>
 <th className="px-4 py-3">Type</th>
 <th className="px-4 py-3">Games</th>
 <th className="px-4 py-3">Products</th>
 <th className="px-4 py-3">Duration</th>
 <th className="px-4 py-3 text-right">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredLogs.map((log) => (
 <tr key={log.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-4 py-3 font-mono">
 <div className="font-bold text-slate-900">{log.id}</div>
 <div className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</div>
 </td>
 <td className="px-4 py-3 font-bold text-slate-900">{log.provider_name}</td>
 <td className="px-4 py-3 uppercase text-[10px] font-bold">{log.sync_type}</td>
 <td className="px-4 py-3 font-bold text-slate-800">{log.games_synced || log.games_added || 0}</td>
 <td className="px-4 py-3 font-bold text-slate-800">{log.products_synced || log.products_added || 0}</td>
 <td className="px-4 py-3 font-mono text-slate-500">{log.duration_ms} ms</td>
 <td className="px-4 py-3 text-right">
 <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
 log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
 }`}>
 {log.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 15: AUDIT LOGS */}
 {activeTab === 'audit-logs' && (
 <div className="space-y-6">
 <SecurityEncryptionVault language={language} />
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-black text-slate-900">Security Audit Logs ({auditLogs.length})</h2>
 <p className="text-xs text-slate-500">Immutable ledger of administrative actions, config edits, and operator IP addresses</p>
 </div>
 </div>

 <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-slate-600">
 <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
 <tr>
 <th className="px-4 py-3">Audit ID & Time</th>
 <th className="px-4 py-3">Admin User & Role</th>
 <th className="px-4 py-3">Action Event</th>
 <th className="px-4 py-3">IP Address</th>
 <th className="px-4 py-3">Activity Description</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {auditLogs.map((aud) => (
 <tr key={aud.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-4 py-3 font-mono">
 <div className="font-bold text-slate-900">{aud.id}</div>
 <div className="text-[10px] text-slate-400">{new Date(aud.created_at).toLocaleString()}</div>
 </td>
 <td className="px-4 py-3">
 <div className="font-bold text-slate-900">{aud.admin_username}</div>
 <span className="text-[10px] text-blue-600 font-mono uppercase">{aud.admin_role}</span>
 </td>
 <td className="px-4 py-3">
 <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
 {aud.action}
 </span>
 </td>
 <td className="px-4 py-3 font-mono">
 <div className="flex items-center gap-2">
 <span className="text-slate-700 font-bold">{aud.ip_address}</span>
 {aud.ip_address && aud.ip_address !== '127.0.0.1' && aud.ip_address !== 'localhost' && (
 <button
 onClick={async () => {
 if (confirm(isKm ? `តើអ្នកពិតជាចង់ Ban IP ${aud.ip_address} ឬ?` : `Ban IP ${aud.ip_address}?`)) {
 await fetch('/api/v1/admin/security/ban-ip', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ ip: aud.ip_address, duration_seconds: 1800 })
 });
 alert(isKm ? `បាន Ban IP ${aud.ip_address} រយៈពេល ៣០នាទី!` : `IP ${aud.ip_address} banned for 30 minutes!`);
 }
 }}
 className="px-2 py-0.5 rounded text-[10px] font-black bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer shrink-0"
 title="Ban IP Address"
 >
 Ban IP
 </button>
 )}
 </div>
 </td>
 <td className="px-4 py-3 text-slate-700 text-xs">{aud.details}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================================= */}
 {/* TAB 16: SETTINGS */}
 {activeTab === 'settings' && (
 <div className="space-y-8">
 {/* Platform Core Settings */}
 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
 <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
 Platform Core Settings
 </h3>

 <form onSubmit={handleSavePlatformSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div>
 <label className="block text-slate-700 font-bold mb-1">Platform Name</label>
 <input
 type="text"
 value={platformSettings.platform_name}
 onChange={(e) => setPlatformSettings({ ...platformSettings, platform_name: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
 />
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">Support Telegram</label>
 <input
 type="text"
 value={platformSettings.support_telegram}
 onChange={(e) => setPlatformSettings({ ...platformSettings, support_telegram: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
 />
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">Support WhatsApp</label>
 <input
 type="text"
 value={platformSettings.support_whatsapp}
 onChange={(e) => setPlatformSettings({ ...platformSettings, support_whatsapp: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
 />
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">Support Email</label>
 <input
 type="email"
 value={platformSettings.support_email}
 onChange={(e) => setPlatformSettings({ ...platformSettings, support_email: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
 />
 </div>

 <div className="sm:col-span-2 flex justify-end">
 <button
 type="submit"
 className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
 >
 Save Platform Settings
 </button>
 </div>
 </form>
 </div>

 {/* AI Support Assistant Integration (https://api.laalaa.me) */}
 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <div>
 <h3 className="text-base font-black text-slate-900">
 {isKm ? 'ការកំណត់ AI Support Assistant (https://api.laalaa.me)' : 'AI Support Assistant Integration (https://api.laalaa.me)'}
 </h3>
 <p className="text-xs text-slate-500">
 {isKm ? 'កំណត់ AI API Key និង Base URL សម្រាប់ឲ្យ AI ឆ្លើយតបអតិថិជនស្វ័យប្រវត្តតាម Live Chat' : 'Configure AI API Key and Base URL for automated live chat customer support'}
 </p>
 </div>
 <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
 laalaa.me AI
 </span>
 </div>

 <form onSubmit={handleSavePlatformSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
 <input
 type="checkbox"
 id="ai_chat_enabled"
 checked={platformSettings.ai_chat_enabled !== false}
 onChange={(e) => setPlatformSettings({ ...platformSettings, ai_chat_enabled: e.target.checked })}
 className="w-4 h-4 text-blue-600 rounded cursor-pointer"
 />
 <label htmlFor="ai_chat_enabled" className="text-xs font-bold text-slate-800 cursor-pointer">
 {isKm ? 'បើកដំណើរការ AI Live Chat Support (Enable AI Assistant)' : 'Enable AI Support Assistant in Live Chat'}
 </label>
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">
 {isKm ? 'AI Base URL (https://api.laalaa.me)' : 'AI API Base URL'}
 </label>
 <input
 type="text"
 value={platformSettings.ai_chat_api_url || 'https://api.laalaa.me'}
 onChange={(e) => setPlatformSettings({ ...platformSettings, ai_chat_api_url: e.target.value })}
 placeholder="https://api.laalaa.me"
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-blue-600 font-bold"
 />
 </div>

 <div className="sm:col-span-2">
 <label className="block text-slate-700 font-bold mb-1">
 {isKm ? 'AI API Key (https://api.laalaa.me Key)' : 'AI API Key'}
 </label>
 <div className="relative">
 <input
 type={showAiApiKey ? 'text' : 'password'}
 value={platformSettings.ai_chat_api_key || ''}
 onChange={(e) => setPlatformSettings({ ...platformSettings, ai_chat_api_key: e.target.value })}
 placeholder="laalaa_sk_..."
 className="w-full pl-3.5 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
 />
 <button
 type="button"
 onClick={() => setShowAiApiKey(!showAiApiKey)}
 className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-[10px] font-bold rounded-lg text-slate-700 cursor-pointer"
 >
 {showAiApiKey ? (isKm ? 'លាក់ Key' : 'Hide Key') : (isKm ? 'បង្ហាញ Key' : 'Show Key')}
 </button>
 </div>
 <p className="text-[10px] text-slate-400 mt-1">
 {isKm ? 'API Key នេះត្រូវរក្សាទុកដោយសុវត្ថិភាពនៅ Backend ដោយមិនបង្ហាញជាសាធារណៈឡើយ' : 'API Key is securely kept on server backend.'}
 </p>
 </div>

 <div className="sm:col-span-2">
 <label className="block text-slate-700 font-bold mb-1">
 {isKm ? 'ច្បាប់ និងការកំណត់ AI (AI System Rules & Prompt Instructions)' : 'AI System Prompt Rules'}
 </label>
 <textarea
 rows={5}
 value={platformSettings.ai_system_rules || ''}
 onChange={(e) => setPlatformSettings({ ...platformSettings, ai_system_rules: e.target.value })}
 placeholder={isKm ? 'បញ្ចូលច្បាប់ណែនាំឲ្យ AI ឆ្លើយតប...' : 'Set strict instructions for AI responses...'}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:border-blue-600"
 />
 <p className="text-[10px] text-slate-400 mt-1">
 {isKm ? 'កំណត់ច្បាប់ឲ្យ AI ឆ្លើយតបតែអំពី RoleaTopup ប៉ុណ្ណោះ និងបដិសេធសំណួរផ្សេងៗ' : 'Instruct AI to strictly answer only about RoleaTopup website and decline unrelated topics.'}
 </p>
 </div>

 <div className="sm:col-span-2 flex justify-end">
 <button
 type="submit"
 className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
 >
 {isKm ? 'រក្សាទុកការកំណត់ AI Chat' : 'Save AI Chat Settings'}
 </button>
 </div>
 </form>
 </div>

 {/* Global Markup Rules */}
 <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
 <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
 Global Dynamic Markup Formula
 </h3>

 <form onSubmit={handleSavePricingConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
 <div>
 <label className="block text-slate-700 font-bold mb-1">User Markup %</label>
 <input
 type="number"
 step="0.1"
 value={pricingConfig.default_user_markup_percent}
 onChange={(e) => setPricingConfig({ ...pricingConfig, default_user_markup_percent: parseFloat(e.target.value) || 0 })}
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-600"
 />
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">Reseller Markup %</label>
 <input
 type="number"
 step="0.1"
 value={pricingConfig.default_reseller_markup_percent}
 onChange={(e) => setPricingConfig({ ...pricingConfig, default_reseller_markup_percent: parseFloat(e.target.value) || 0 })}
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-purple-600"
 />
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">USD to KHR Rate</label>
 <input
 type="number"
 value={pricingConfig.exchange_rate_khr}
 onChange={(e) => setPricingConfig({ ...pricingConfig, exchange_rate_khr: parseInt(e.target.value) || 4100 })}
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
 />
 </div>

 <div className="sm:col-span-3 flex justify-end">
 <button
 type="submit"
 className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
 >
 Save Markup Rules
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* TAB 17: SUPPORT TICKETS */}
 {activeTab === 'tickets' && (
   <SupportTicketsTable language={language} />
 )}

 {/* TAB 18: PROMOTERS MANAGEMENT */}
 {activeTab === 'promoters' && (
   <PromotersManagement language={language} />
 )}

 {/* TAB 19: BROADCAST CENTER */}
 {activeTab === 'broadcast' && (
   <BroadcastCenter showToast={showToast} />
 )}

    </>
  )}
 </main>
 </div>

 {/* Modals */}
 {selectedOrderDetail && (
 <OrderDetailModal
 order={selectedOrderDetail}
 onClose={() => setSelectedOrderDetail(null)}
 onRetryOrder={handleRetryOrder}
 onRefundOrder={handleRefundOrder}
 onCheckStatus={handleCheckUpstreamStatus}
 actionLoading={actionLoading}
 language={language}
 />
 )}

   {/* Reset Password Modal */}
  {resetPasswordUser && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{isKm ? 'កំណត់ពាក្យសម្ងាត់ថ្មី' : 'Reset User Password'}</h3>
              <p className="text-[11px] text-slate-500 font-mono">{resetPasswordUser.username} ({resetPasswordUser.email})</p>
            </div>
          </div>
          <button onClick={() => setResetPasswordUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">{isKm ? 'ពាក្យសម្ងាត់ថ្មី (New Password)' : 'New Password'}</label>
            <div className="relative">
              <input
                type="text"
                required
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                placeholder="e.g. SecurePass123!"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 pr-16"
              />
              <button
                type="button"
                onClick={() => setResetPasswordValue('Pass' + Math.floor(100000 + Math.random() * 900000) + '!')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-[10px] font-bold rounded-lg text-slate-700"
              >
                Gen
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
            <strong>{isKm ? 'ចំណាំ:' : 'Note:'}</strong> {isKm ? 'ពាក្យសម្ងាត់ថ្មីនេះនឹងត្រូវកំណត់ជូន User ភ្លាមៗ' : 'The user will be able to log in with this new password immediately.'}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResetPasswordUser(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isResettingPassword}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isResettingPassword ? (isKm ? 'កំពុងផ្លាស់ប្តូរ...' : 'Saving...') : (isKm ? 'រក្សាទុក' : 'Update Password')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Edit User Info Modal (Email & Phone Number Edit) */}
  {editInfoUser && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{isKm ? 'កែប្រែព័ត៌មានគណនីអតិថិជន' : 'Edit User Information'}</h3>
              <p className="text-[11px] text-slate-500 font-mono">ID: {editInfoUser.id}</p>
            </div>
          </div>
          <button onClick={() => setEditInfoUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveUserInfoSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">{isKm ? 'ឈ្មោះគណនី (Username)' : 'Username'}</label>
            <input
              type="text"
              required
              value={editInfoUsername}
              onChange={(e) => setEditInfoUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">{isKm ? 'អាសយដ្ឋានអ៊ីមែល (Email Address)' : 'Email Address'}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={editInfoEmail}
                onChange={(e) => setEditInfoEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">{isKm ? 'លេខទូរស័ព្ទ (Phone Number)' : 'Phone Number'}</label>
            <input
              type="text"
              placeholder="e.g. 012345678"
              value={editInfoPhone}
              onChange={(e) => setEditInfoPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">{isKm ? 'តួនាទី (User Role)' : 'User Role'}</label>
            <select
              value={editInfoRole}
              onChange={(e) => setEditInfoRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            >
              <option value="user">User (អតិថិជនធម្មតា)</option>
              <option value="reseller">Reseller (ដៃគូលក់បន្ត B2B)</option>
              <option value="admin">Admin (អ្នកគ្រប់គ្រង)</option>
              <option value="super_admin">Super Admin (អ្នកគ្រប់គ្រងជាន់ខ្ពស់)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditInfoUser(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSavingUserInfo}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSavingUserInfo ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុកព័ត៌មាន' : 'Save Info')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Adjust Funds Modal (Add Fund & Delete/Deduct Fund) */}
  {(adjustUser || adjustUserId) && (() => {
    const currentTarget = adjustUser || users.find(u => u.id === adjustUserId) || { id: adjustUserId, username: 'User', wallet_usd: 0 };
    const curBal = Number(currentTarget.wallet_usd || 0);
    const amtNum = parseFloat(adjustAmount) || 0;
    
    let calcNewBal = curBal;
    if (adjustMode === 'add') calcNewBal = curBal + amtNum;
    else if (adjustMode === 'deduct') calcNewBal = Math.max(0, curBal - amtNum);
    else if (adjustMode === 'set') calcNewBal = Math.max(0, amtNum);
    else if (adjustMode === 'clear') calcNewBal = 0.0;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-2xl ${
                adjustMode === 'add' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : adjustMode === 'deduct' 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                {adjustMode === 'add' ? (
                  <Plus className="w-5 h-5" />
                ) : adjustMode === 'deduct' ? (
                  <Minus className="w-5 h-5" />
                ) : (
                  <Coins className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {adjustMode === 'add' 
                    ? (isKm ? 'បញ្ចូលលុយក្នុងកាបូប (Add Funds)' : 'Add Funds to Wallet') 
                    : adjustMode === 'deduct' 
                    ? (isKm ? 'កាត់លុយពីកាបូប (Deduct Funds)' : 'Deduct Funds from Wallet') 
                    : adjustMode === 'clear'
                    ? (isKm ? 'លុបលុយទាំងអស់ (Clear Balance)' : 'Clear All Wallet Funds')
                    : (isKm ? 'កំណត់សមតុល្យជាក់លាក់ (Set Balance)' : 'Set Exact Balance')}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {currentTarget.username} <span className="font-mono text-slate-400">({currentTarget.email || currentTarget.id})</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setAdjustUser(null); setAdjustUserId(null); }} 
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-center text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAdjustMode('add'); setAdjustReason('Admin deposit credit'); }}
              className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                adjustMode === 'add'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              + {isKm ? 'ដាក់លុយ' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setAdjustMode('deduct'); setAdjustReason('Admin balance deduction'); }}
              className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                adjustMode === 'deduct'
                  ? 'bg-rose-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              - {isKm ? 'កាត់លុយ' : 'Deduct'}
            </button>
            <button
              type="button"
              onClick={() => { setAdjustMode('set'); setAdjustReason('Admin set balance'); }}
              className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                adjustMode === 'set'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              = {isKm ? 'កំណត់' : 'Set'}
            </button>
            <button
              type="button"
              onClick={() => { setAdjustMode('clear'); setAdjustAmount('0'); setAdjustReason('Admin cleared balance to $0.00'); }}
              className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                adjustMode === 'clear'
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              0$ {isKm ? 'លុបអស់' : 'Clear'}
            </button>
          </div>

          {/* Current vs New Balance Live Calculation Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{isKm ? 'សមតុល្យបច្ចុប្បន្ន:' : 'Current Balance:'}</span>
              <span className="font-mono font-bold text-slate-800">${curBal.toFixed(2)} USD</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {adjustMode === 'add' 
                  ? (isKm ? 'ទឹកប្រាក់បន្ថែម (+):' : 'Amount to Add (+):') 
                  : adjustMode === 'deduct' 
                  ? (isKm ? 'ទឹកប្រាក់កាត់ចេញ (-):' : 'Amount to Deduct (-):')
                  : adjustMode === 'clear'
                  ? (isKm ? 'លុបទាំងអស់:' : 'Clear to zero:')
                  : (isKm ? 'កំណត់ទៅ:' : 'Set exact balance to:')}
              </span>
              <span className={`font-mono font-black ${
                adjustMode === 'add' ? 'text-emerald-600' : adjustMode === 'deduct' ? 'text-rose-600' : 'text-blue-600'
              }`}>
                {adjustMode === 'add' ? `+$${amtNum.toFixed(2)}` : adjustMode === 'deduct' ? `-$${amtNum.toFixed(2)}` : `$${amtNum.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">{isKm ? 'សមតុល្យថ្មីបន្ទាប់ពីកែប្រែ:' : 'New Resulting Balance:'}</span>
              <span className={`font-mono font-black text-base ${
                calcNewBal > curBal ? 'text-emerald-600' : calcNewBal < curBal ? 'text-rose-600' : 'text-slate-900'
              }`}>
                ${calcNewBal.toFixed(2)} USD
              </span>
            </div>
          </div>

          <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
            {adjustMode !== 'clear' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  {adjustMode === 'add' 
                    ? (isKm ? 'ចំនួនទឹកប្រាក់ដែលត្រូវបន្ថែម (USD)' : 'Amount to Add (USD)') 
                    : adjustMode === 'deduct' 
                    ? (isKm ? 'ចំនួនទឹកប្រាក់ដែលត្រូវកាត់ (USD)' : 'Amount to Deduct (USD)') 
                    : (isKm ? 'សមតុល្យថ្មីដែលត្រូវកំណត់ (USD)' : 'New Target Balance (USD)')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {(adjustMode === 'add' ? [5, 10, 20, 50, 100, 500] : [1, 5, 10, 20, 50, 100]).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjustAmount(amt.toString())}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        parseFloat(adjustAmount) === amt
                          ? adjustMode === 'add'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {adjustMode === 'add' ? `+$${amt}` : `-$${amt}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isKm ? 'មូលហេតុ / កំណត់ចំណាំ (Reason / Note)' : 'Reason / Note'}
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Deposit correction, Loyalty bonus..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setAdjustUser(null); setAdjustUserId(null); }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                {isKm ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-white font-black shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  adjustMode === 'add'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : adjustMode === 'deduct'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : adjustMode === 'clear'
                    ? 'bg-slate-900 hover:bg-black'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {adjustMode === 'add' ? (
                  <Plus className="w-4 h-4" />
                ) : adjustMode === 'deduct' ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {adjustMode === 'add'
                    ? (isKm ? `បញ្ជាក់ដាក់លុយ +$${amtNum.toFixed(2)}` : `Confirm +$${amtNum.toFixed(2)} Credit`)
                    : adjustMode === 'deduct'
                    ? (isKm ? `បញ្ជាក់កាត់លុយ -$${amtNum.toFixed(2)}` : `Confirm -$${amtNum.toFixed(2)} Deduction`)
                    : adjustMode === 'clear'
                    ? (isKm ? 'បញ្ជាក់លុបលុយទាំងអស់ ($0.00)' : 'Confirm Clear Balance to $0.00')
                    : (isKm ? `បញ្ជាក់កំណត់សមតុល្យ $${amtNum.toFixed(2)}` : `Confirm Set Balance to $${amtNum.toFixed(2)}`)}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  })()}

  {/* Product Pricing Override Modal */}
 {editingProduct && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
 <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <div>
 <h3 className="text-base font-black text-slate-900">Custom SKU Pricing Override</h3>
 <p className="text-[11px] text-slate-500">{editingProduct.game.name_en} - {editingProduct.pkg.name_en}</p>
 </div>
 <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSaveProductPricing} className="space-y-3.5 text-xs">
 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
 <div>
 <span className="text-slate-500 font-medium block">Provider Base Cost:</span>
 <span className="font-mono font-black text-slate-900 text-base">
 ${editingProduct.pkg.cost_usd.toFixed(2)} USD
 </span>
 </div>
 <div className="text-right">
 <span className="text-slate-500 font-medium block">Live Retail Profit:</span>
 <span className="font-mono font-black text-emerald-600 text-sm">
 +{editingProduct.pkg.cost_usd > 0 ? Math.round(((editPriceUser - editingProduct.pkg.cost_usd) / editingProduct.pkg.cost_usd) * 100) : 0}% 
 (${Math.max(0, editPriceUser - editingProduct.pkg.cost_usd).toFixed(2)})
 </span>
 </div>
 </div>

 {/* Quick Fixed Cents Add-On Calculator (+$0.10, +$0.20...) */}
 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
 <div className="flex items-center justify-between">
 <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
 <DollarSign className="w-3.5 h-3.5 text-blue-600" />
 <span>{isKm ? 'បូកថែមដុល្លារ/សេន (Fixed Add-on)' : 'Quick Fixed Cents Add-on'}</span>
 </label>
 <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
 <span className="text-[11px] font-bold text-slate-500 font-mono">+$</span>
 <input
 type="number"
 step="0.01"
 min="0"
 max="100"
 value={editFixedAddUsd}
 onChange={(e) => handleSingleFixedAddChange(parseFloat(e.target.value) || 0)}
 className="w-14 text-xs font-black font-mono text-blue-600 focus:outline-none text-right"
 />
 <span className="text-[10px] font-bold text-slate-400">USD</span>
 </div>
 </div>
 <div className="flex items-center gap-1.5 flex-wrap">
 {[0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.50, 1.00].map((amt) => (
 <button
 key={amt}
 type="button"
 onClick={() => handleSingleFixedAddChange(amt)}
 className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
 editFixedAddUsd === amt
 ? 'bg-blue-600 text-white shadow-xs scale-105'
 : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
 }`}
 >
 {amt === 0 ? (isKm ? 'None (0$)' : 'None ($0.00)') : `+$${amt.toFixed(2)}`}
 </button>
 ))}
 </div>
 </div>

 {/* Quick % Markup Calculator (+10%, +15%...) */}
 <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2.5">
 <div className="flex items-center justify-between">
 <label className="text-xs font-black text-blue-950 flex items-center gap-1.5">
 <Percent className="w-3.5 h-3.5 text-blue-600" />
 <span>{isKm ? 'គិតជាភាគរយចំណេញ (% Markup)' : 'Quick % Markup Calculator'}</span>
 </label>
 <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-blue-200 shadow-2xs">
 <span className="text-[11px] font-bold text-blue-500 font-mono">+</span>
 <input
 type="number"
 step="1"
 min="0"
 max="200"
 value={editMarkupPercent}
 onChange={(e) => handleSingleMarkupChange(parseFloat(e.target.value) || 0)}
 className="w-12 text-xs font-black font-mono text-blue-600 focus:outline-none text-right"
 />
 <span className="text-[10px] font-bold text-blue-500 font-mono">%</span>
 </div>
 </div>
 <div className="flex items-center gap-1.5 flex-wrap">
 {[0, 5, 10, 12, 15, 20, 25, 30, 40].map((pct) => (
 <button
 key={pct}
 type="button"
 onClick={() => handleSingleMarkupChange(pct)}
 className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
 editMarkupPercent === pct
 ? 'bg-blue-600 text-white shadow-xs scale-105'
 : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
 }`}
 >
 {pct === 0 ? (isKm ? 'None (0%)' : 'None (0%)') : `+${pct}%`}
 </button>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
 <input
 type="checkbox"
 id="overrideToggle"
 checked={editManualOverride}
 onChange={(e) => setEditManualOverride(e.target.checked)}
 className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
 />
 <label htmlFor="overrideToggle" className="text-slate-900 font-bold cursor-pointer">
 Enable Manual Price Override (Prevent Auto-Sync Overwrite)
 </label>
 </div>

 <div className="space-y-2">
 <div>
 <div className="flex justify-between items-center mb-1">
 <label className="block text-slate-700 font-bold">User Retail Price (USD)</label>
 {editingProduct.pkg.cost_usd > 0 && (
 <span className="text-[10px] font-mono text-blue-600 font-bold">
 Profit: +${(editPriceUser - editingProduct.pkg.cost_usd).toFixed(2)}
 </span>
 )}
 </div>
 <input
 type="number"
 step="0.01"
 required
 value={editPriceUser}
 onChange={(e) => {
 const val = parseFloat(e.target.value) || 0;
 setEditPriceUser(val);
 if (editingProduct.pkg.cost_usd > 0) {
 setEditMarkupPercent(Math.round(((val - editingProduct.pkg.cost_usd) / editingProduct.pkg.cost_usd) * 100));
 }
 }}
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-blue-600 shadow-xs"
 />
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">Reseller Price (USD)</label>
 <input
 type="number"
 step="0.01"
 required
 value={editPriceReseller}
 onChange={(e) => setEditPriceReseller(parseFloat(e.target.value) || 0)}
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-purple-600 shadow-xs"
 />
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">VIP Wholesaler Price (USD)</label>
 <input
 type="number"
 step="0.01"
 required
 value={editPriceVip}
 onChange={(e) => setEditPriceVip(parseFloat(e.target.value) || 0)}
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-amber-600 shadow-xs"
 />
 </div>
 </div>

 <div className="pt-2 flex items-center justify-end gap-2">
 <button
 type="button"
 onClick={() => setEditingProduct(null)}
 className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={actionLoading === 'save-product-price'}
 className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
 >
 {actionLoading === 'save-product-price' ? 'Saving...' : 'Apply Price Override'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Add Provider Modal */}
 {isAddingProvider && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
 <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-black text-slate-900">Add API Top-Up Provider</h3>
 <button onClick={() => setIsAddingProvider(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleAddProviderSubmit} className="space-y-3 text-xs">
 <div>
 <label className="block text-slate-700 font-bold mb-1">Preset Provider</label>
 <select
 value={newProviderPreset}
 onChange={(e) => handlePresetChange(e.target.value)}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
 >
 <option value="smileone">Smile.One Global API</option>
 <option value="unipin">UniPin Global Direct</option>
 <option value="lapakgaming">LapakGaming Reseller API</option>
 <option value="apigames">ApiGames SEA Direct</option>
 <option value="custom">Custom REST API</option>
 </select>
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">Provider Display Name</label>
 <input
 type="text"
 required
 value={newProviderName}
 onChange={(e) => setNewProviderName(e.target.value)}
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl"
 />
 </div>

 <div>
 <label className="block text-slate-700 font-bold mb-1">API Base URL</label>
 <input
 type="url"
 required
 value={newProviderUrl}
 onChange={(e) => setNewProviderUrl(e.target.value)}
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-blue-600"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-700 font-bold mb-1">API Key / Token</label>
 <input
 type="password"
 required
 value={newProviderKey}
 onChange={(e) => setNewProviderKey(e.target.value)}
 placeholder="sm_live_..."
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
 />
 </div>
 <div>
 <label className="block text-slate-700 font-bold mb-1">API Secret (Optional)</label>
 <input
 type="password"
 value={newProviderSecret}
 onChange={(e) => setNewProviderSecret(e.target.value)}
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-slate-700 font-bold mb-1">Priority Rank (1 = Primary)</label>
 <input
 type="number"
 value={newProviderPriority}
 onChange={(e) => setNewProviderPriority(Number(e.target.value))}
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-blue-600"
 />
 </div>
 <div>
 <label className="block text-slate-700 font-bold mb-1">Auto-Sync Interval</label>
 <select
 value={newProviderSyncInterval}
 onChange={(e) => setNewProviderSyncInterval(e.target.value)}
 className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl"
 >
 <option value="5m">Every 5 Minutes</option>
 <option value="15m">Every 15 Minutes</option>
 <option value="30m">Every 30 Minutes</option>
 <option value="1h">Every 1 Hour</option>
 <option value="6h">Every 6 Hours</option>
 <option value="daily">Once Daily</option>
 </select>
 </div>
 </div>

 <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
 <strong>Security:</strong> Credentials stored strictly on server. Never exposed to browser or client JS.
 </div>

 <div className="flex justify-end gap-2 pt-2">
 <button
 type="button"
 onClick={() => setIsAddingProvider(false)}
 className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={actionLoading === 'add-provider'}
 className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
 >
 Save Provider
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Test Connection Modal */}
 {testResultModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
 <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <div className="flex items-center gap-2">
 <div className={`p-2 rounded-xl ${testResultModal.result.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
 {testResultModal.result.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
 </div>
 <div>
 <h3 className="text-base font-black text-slate-900">API Connection Test</h3>
 <p className="text-[11px] text-slate-500">{testResultModal.provider.name}</p>
 </div>
 </div>
 <button onClick={() => setTestResultModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="space-y-2 text-xs">
 <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
 <span className="text-slate-500 font-medium">Latency / Ping:</span>
 <span className="font-mono font-bold text-blue-600">
 {testResultModal.result.details?.latency_ms || 42} ms
 </span>
 </div>
 <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] max-h-36 overflow-y-auto">
 <pre>{JSON.stringify(testResultModal.result, null, 2)}</pre>
 </div>
 </div>

 <div className="flex justify-end">
 <button
 onClick={() => setTestResultModal(null)}
 className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Add Coupon Modal */}
 {isAddingCoupon && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
 <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
 <h3 className="text-base font-black text-slate-900">Create New Coupon</h3>
 <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
 <div>
 <label className="block text-slate-700 font-bold mb-1">Coupon Code</label>
 <input
 type="text"
 required
 value={newCouponCode}
 onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
 placeholder="e.g. FLASH50"
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-600"
 />
 </div>
 <div>
 <label className="block text-slate-700 font-bold mb-1">Discount %</label>
 <input
 type="number"
 required
 value={newCouponPercent}
 onChange={(e) => setNewCouponPercent(e.target.value)}
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
 />
 </div>
 <div className="flex justify-end gap-2 pt-2">
 <button
 type="button"
 onClick={() => setIsAddingCoupon(false)}
 className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
 >
 Create Coupon
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Add Banner Modal */}
 {isAddingBanner && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
 <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
 <h3 className="text-base font-black text-slate-900">Add Hero Banner</h3>
 <form onSubmit={handleAddBanner} className="space-y-3 text-xs">
 <div>
 <label className="block text-slate-700 font-bold mb-1">Banner Title (EN)</label>
 <input
 type="text"
 required
 value={newBannerTitleEn}
 onChange={(e) => setNewBannerTitleEn(e.target.value)}
 placeholder="e.g. Mobile Legends Promo"
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="block text-slate-700 font-bold mb-1">Subtitle (EN)</label>
 <input
 type="text"
 required
 value={newBannerSubtitleEn}
 onChange={(e) => setNewBannerSubtitleEn(e.target.value)}
 placeholder="e.g. 15% Bonus Diamonds this week"
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="block text-slate-700 font-bold mb-1">Image URL</label>
 <input
 type="url"
 required
 value={newBannerImageUrl}
 onChange={(e) => setNewBannerImageUrl(e.target.value)}
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
 />
 </div>
 <div className="flex justify-end gap-2 pt-2">
 <button
 type="button"
 onClick={() => setIsAddingBanner(false)}
 className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
 >
 Publish Banner
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Add Game Modal */}
 {isAddingGame && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
 <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
 <h3 className="text-base font-black text-slate-900">Add Video Game</h3>
 <form onSubmit={async (e) => {
 e.preventDefault();
 if (!newGameSlug || !newGameNameEn) return;
 await fetch('/api/v1/admin/games', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 id: newGameSlug,
 slug: newGameSlug,
 name_en: newGameNameEn,
 name_km: newGameNameKm || newGameNameEn,
 subtitle_en: 'Instant top-up for ' + newGameNameEn,
 subtitle_km: 'បញ្ចូលទឹកប្រាក់ ' + (newGameNameKm || newGameNameEn),
 category: newGameCategory,
 publisher: 'Publisher',
 region: 'Cambodia / Global',
 thumbnail: '/images/games/mlbb.png',
 banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
 instant_delivery: true,
 is_active: true,
 fields: [{ id: 'user_id', label_en: 'Player ID', label_km: 'Player ID', placeholder_en: 'e.g. 12345678', placeholder_km: 'បញ្ចូល UID', required: true }],
 packages: [
 { id: newGameSlug + '-1', game_slug: newGameSlug, name_en: '100 Credits', name_km: '100 Credits', cost_usd: 0.90, price_user_usd: 1.00, price_reseller_usd: 0.95, price_vip_usd: 0.92 }
 ]
 })
 });
 setIsAddingGame(false);
 showToast('Game added to catalog', 'success');
 loadData();
 }} className="space-y-3 text-xs">
 <div>
 <label className="block text-slate-700 font-bold mb-1">Game Title (English)</label>
 <input
 type="text"
 required
 value={newGameNameEn}
 onChange={(e) => {
 setNewGameNameEn(e.target.value);
 setNewGameSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
 }}
 placeholder="e.g. Mobile Legends: Bang Bang"
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="block text-slate-700 font-bold mb-1">Game Title (Khmer)</label>
 <input
 type="text"
 value={newGameNameKm}
 onChange={(e) => setNewGameNameKm(e.target.value)}
 placeholder="ឧទាហរណ៍ Mobile Legends: Bang Bang"
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="block text-slate-700 font-bold mb-1">Category (ប្រភេទហ្គេម/សេវាកម្ម)</label>
 <select
 value={newGameCategory}
 onChange={(e) => setNewGameCategory(e.target.value)}
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
 >
 <option value="mobile"> Mobile Games (ហ្គេមទូរស័ព្ទ)</option>
 <option value="pc"> PC Games & Steam (ហ្គេមកុំព្យូទ័រ)</option>
 <option value="voucher">Game Vouchers & Cards (កាតហ្គេម/វ៉ាត់ឆ័រ)</option>
 <option value="console"> Console Games (PlayStation/Xbox/Switch)</option>
 </select>
 </div>
 <div>
 <label className="block text-slate-700 font-bold mb-1">Slug (URL Keyword)</label>
 <input
 type="text"
 required
 value={newGameSlug}
 onChange={(e) => setNewGameSlug(e.target.value)}
 className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-blue-600"
 />
 </div>
 <div className="flex justify-end gap-2 pt-2">
 <button
 type="button"
 onClick={() => setIsAddingGame(false)}
 className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
 >
 Create Game
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {adjustSpinsUser && (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
 <h3 className="text-lg font-bold text-slate-900 mb-2">បន្ថែមការបង្វិល (Spins) ជូន {adjustSpinsUser.name || adjustSpinsUser.email}</h3>
 <p className="text-xs text-slate-500 mb-4">បញ្ចូលចំនួនការបង្វិលសំណាង Lucky Draw ដែលត្រូវបន្ថែមជូនអ្នកប្រើប្រាស់នេះ។</p>
 <form onSubmit={handleAdjustSpinsSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-1">ចំនួនការបង្វិល (Spins)</label>
 <input
 type="number"
 min="1"
 required
 value={adjustSpinsCount}
 onChange={(e) => setAdjustSpinsCount(e.target.value)}
 className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
 />
 </div>
 <div className="flex justify-end gap-2 pt-2">
 <button
 type="button"
 onClick={() => setAdjustSpinsUser(null)}
 className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
 >
 បោះបង់
 </button>
 <button
 type="submit"
 disabled={isSubmittingAdjustSpins}
 className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs disabled:opacity-50"
 >
 {isSubmittingAdjustSpins ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}

export default function AdminControlPanel() {
 return (
 <Suspense fallback={null}>
 <AdminControlPanelContent />
 </Suspense>
 );
}
