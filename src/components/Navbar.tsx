'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Zap, 
  Search, 
  SearchCheck, 
  Menu, 
  X, 
  Globe, 
  Gamepad2, 
  Layers, 
  User as UserIcon, 
  Terminal,
  LayoutDashboard,
  LayoutGrid,
  Package,
  Gift,
  Store,
  LogOut,
  LogIn,
  UserPlus,
  Wallet,
  Plus,
  LifeBuoy,
  ChevronDown,
  Crown
} from 'lucide-react';
import WalletDepositModal from '@/components/WalletDepositModal';

export default function Navbar() {
  const router = useRouter();
  const { language, currency, t, toggleLanguage, toggleCurrency } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    try {
      const stored = localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user');
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);

        // Fetch live wallet balance & account status from backend DB
        if (u && u.id) {
          fetch(`/api/v1/user/wallet?user_id=${u.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.account_deleted || (data.message && data.message.includes('deleted'))) {
                // Auto-logout deleted user immediately!
                localStorage.removeItem('rothz_token');
                localStorage.removeItem('rothz_user');
                localStorage.removeItem('rolea_user');
                localStorage.removeItem('rolea_token');
                setCurrentUser(null);
                alert('គណនីរបស់អ្នកត្រូវបានលុបចេញពីប្រព័ន្ធ! (Your account has been deleted by Admin)');
                router.push('/');
                return;
              }
              if (data.success && data.data && typeof data.data.balance_usd === 'number') {
                const freshBal = data.data.balance_usd;
                if (u.wallet_usd !== freshBal) {
                  const updated = { ...u, wallet_usd: freshBal };
                  setCurrentUser(updated);
                  localStorage.setItem('rothz_user', JSON.stringify(updated));
                  localStorage.setItem('rolea_user', JSON.stringify(updated));
                }
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rothz_token');
    localStorage.removeItem('rothz_user');
    localStorage.removeItem('rolea_user');
    setCurrentUser(null);
    router.push('/');
  };

  const handleDepositSuccess = (newBal: number) => {
    if (currentUser) {
      const updated = { ...currentUser, wallet_usd: newBal };
      setCurrentUser(updated);
      localStorage.setItem('rothz_user', JSON.stringify(updated));
      localStorage.setItem('rolea_user', JSON.stringify(updated));
    }
    setIsDepositOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 sm:h-26 gap-3 py-2">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3.5 group shrink-0 max-w-[60%] sm:max-w-none">
            <div className="h-10 sm:h-16 flex items-center justify-center py-0.5">
              <img 
                src="/images/logo.png" 
                alt="Rolea TopUp Logo" 
                className="h-10 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-md" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-base sm:text-2xl font-black tracking-tight text-slate-900 truncate">
                  {t.brandName}
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 font-extrabold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                  KH
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-semibold whitespace-nowrap">Cambodia Game Top-Up</p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </form>
          </div>

          {/* Clean Visitor Navigation Items */}
          <div className="hidden lg:flex items-center gap-1.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
            >
              <Gamepad2 className="w-4 h-4 text-blue-600" />
              <span>{t.storefront}</span>
            </Link>

            <Link
              href="/games"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>{t.allGames}</span>
            </Link>

            <Link
              href="/order/track"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
            >
              <SearchCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.trackOrder}</span>
            </Link>

            <Link
              href="/support/tickets"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
            >
              <LifeBuoy className="w-4 h-4 text-blue-600" />
              <span>{language === 'km' ? 'សំបុត្រជំនួយ' : 'Support Tickets'}</span>
            </Link>
          </div>

          {/* Auth & Currency/Language Right Actions */}
          <div className="flex items-center gap-2">

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 transition-colors shadow-2xs whitespace-nowrap"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="whitespace-nowrap">{language === 'km' ? 'ភាសាខ្មែរ' : language === 'zh' ? '中文 (ZH)' : 'English (EN)'}</span>
            </button>

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="relative">
                {/* White Pill Capsule Menu Button */}
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2.5 p-1 pr-2.5 sm:pr-3.5 rounded-full bg-white border border-slate-200 hover:border-blue-500 hover:bg-slate-50 text-slate-900 shadow-sm transition-all cursor-pointer group"
                >
                  {/* User Profile Avatar Circle */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    {currentUser.avatar_url || currentUser.telegram_photo_url || currentUser.photo_url ? (
                      <img
                        src={currentUser.avatar_url || currentUser.telegram_photo_url || currentUser.photo_url}
                        alt={currentUser.username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs uppercase">
                        {currentUser.username ? currentUser.username.charAt(0) : 'U'}
                      </div>
                    )}
                  </div>

                  {/* Wallet Balance Display */}
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                    ${(currentUser.wallet_usd || 0).toFixed(2)}
                  </span>

                  {/* Dropdown Chevron Icon */}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Popover matching clean bright white theme */}
                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 p-3.5 text-sm text-slate-900 animate-fadeIn">
                      
                      {/* User Header Details */}
                      <div className="px-1 pt-1 pb-1">
                        <p className="font-extrabold text-slate-900 text-base tracking-tight truncate">
                          {currentUser.username || currentUser.full_name || 'Roth Dararath'}
                        </p>
                        <p className="text-slate-500 text-xs font-medium truncate mt-0.5">
                          {currentUser.email || 'rothdararath@gmail.com'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                            <span className="text-[10px] text-blue-500 font-extrabold uppercase">User ID:</span>
                            <span>{currentUser.id || 'usr-guest'}</span>
                          </span>
                        </div>

                        {/* Inner Wallet Card */}
                        <Link 
                          href="/dashboard?tab=wallet"
                          onClick={() => setUserDropdownOpen(false)}
                          className="bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl p-3 mt-3 flex items-center justify-between border border-slate-200 cursor-pointer group/wallet"
                        >
                          <div className="flex items-center gap-2.5">
                            <Wallet className="w-4.5 h-4.5 text-slate-700" />
                            <span className="font-bold text-slate-900 text-sm">Wallet</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-sm tracking-tight">
                            ${(currentUser.wallet_usd || 0).toFixed(2)}
                          </span>
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100 my-2.5" />

                      {/* Navigation Items */}
                      <div className="space-y-0.5">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-sm transition-colors"
                        >
                          <LayoutGrid className="w-4 h-4 text-blue-600" />
                          <span>{language === 'km' ? 'ផ្ទាំងគ្រប់គ្រង Dashboard' : 'Dashboard'}</span>
                        </Link>

                        <Link
                          href="/dashboard?tab=orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-sm transition-colors"
                        >
                          <Package className="w-4 h-4 text-blue-600" />
                          <span>{language === 'km' ? 'ការបញ្ជាទិញរបស់ខ្ញុំ' : 'My orders'}</span>
                        </Link>

                        <Link
                          href="/dashboard?tab=wallet"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-sm transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-blue-600" />
                          <span>{language === 'km' ? 'កាបូបប្រាក់ Wallet' : 'Wallet'}</span>
                        </Link>

                        <Link
                          href="/lucky-draw"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-amber-700 font-bold text-sm transition-colors"
                        >
                          <Gift className="w-4 h-4 text-amber-600" />
                          <span>{language === 'km' ? 'រង្វាន់ Lucky Draw' : 'Lucky Draw'}</span>
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100 my-2.5" />

                      {/* Reseller Dashboard */}
                      <div>
                        <Link
                          href="/reseller"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-sm transition-colors"
                        >
                          <Store className="w-4 h-4 text-blue-600" />
                          <span>{language === 'km' ? 'ដៃគូលក់បន្ត (Reseller)' : 'Reseller dashboard'}</span>
                        </Link>

                        <Link
                          href="/promoter"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-bold text-sm transition-colors"
                        >
                          <Crown className="w-4 h-4 text-amber-500" />
                          <span>{language === 'km' ? 'ដៃគូ Promoter' : 'Promoter Portal'}</span>
                        </Link>
                      </div>

                      {/* Admin link if user role is admin */}
                      {currentUser.role === 'admin' && (
                        <div className="mt-1">
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-amber-800 font-bold text-sm transition-colors border border-amber-200"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-600" />
                            <span>{language === 'km' ? 'ផ្ទាំងគ្រប់គ្រង Admin' : 'Admin Portal'}</span>
                          </Link>
                        </div>
                      )}

                      {/* Bottom Logout Button Box */}
                      <div className="mt-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm border border-red-100 transition-all text-left cursor-pointer"
                        >
                          <LogOut className="w-4.5 h-4.5 text-red-600" />
                          <span>{language === 'km' ? 'ចាកចេញ' : 'Log out'}</span>
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.login}</span>
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.register}</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-3">
            
            {/* User Profile Card inside Mobile Drawer */}
            {currentUser ? (
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl mb-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-blue-300 bg-white flex items-center justify-center text-slate-800 shrink-0 shadow-xs">
                    {currentUser.avatar_url || currentUser.telegram_photo_url || currentUser.photo_url ? (
                      <img
                        src={currentUser.avatar_url || currentUser.telegram_photo_url || currentUser.photo_url}
                        alt={currentUser.username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm uppercase">
                        {currentUser.username ? currentUser.username.charAt(0) : 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">
                      {currentUser.username || currentUser.full_name || 'អ្នកប្រើប្រាស់'}
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium truncate">
                      {currentUser.email || 'rothz@topup.com'}
                    </p>
                  </div>
                  <div className="text-right shrink-0 bg-white px-2.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
                    <span className="text-[9px] font-extrabold text-slate-500 block uppercase tracking-wider">
                      {language === 'km' ? 'សមតុល្យ' : 'BALANCE'}
                    </span>
                    <span className="font-mono font-black text-blue-700 text-xs sm:text-sm tracking-tight">
                      ${(currentUser.wallet_usd || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quick Dashboard & Wallet Links */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-blue-200/60">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white border border-blue-200 text-blue-900 font-bold text-xs hover:bg-blue-100 transition-colors shadow-2xs"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'km' ? 'គណនីរបស់ខ្ញុំ' : 'Dashboard'}</span>
                  </Link>
                  <Link
                    href="/dashboard?tab=wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white border border-blue-200 text-blue-900 font-bold text-xs hover:bg-blue-100 transition-colors shadow-2xs"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'km' ? 'កាបូបប្រាក់' : 'Wallet'}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-3">
                <p className="text-xs font-bold text-slate-700 text-center mb-2">
                  {language === 'km' ? 'សូមចូលគណនីដើម្បីគ្រប់គ្រងសមតុល្យ និងការទិញ' : 'Please login to manage wallet & orders'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold text-xs shadow-2xs"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-600" />
                    <span>{t.login}</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t.register}</span>
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400"
              />
            </form>

            <div className="grid grid-cols-1 gap-2 pt-1 text-xs font-bold">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-white text-slate-800 border border-slate-200"
              >
                <Gamepad2 className="w-4 h-4 text-blue-600" />
                <span>{t.storefront}</span>
              </Link>

              <Link
                href="/games"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-white text-slate-800 border border-slate-200"
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{t.allGames}</span>
              </Link>

              <Link
                href="/order/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-white text-slate-800 border border-slate-200"
              >
                <SearchCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.trackOrder}</span>
              </Link>

              <Link
                href="/support/tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-white text-slate-800 border border-slate-200"
              >
                <LifeBuoy className="w-4 h-4 text-blue-600" />
                <span>{language === 'km' ? 'សំបុត្រជំនួយ Support' : 'Support Tickets'}</span>
              </Link>

              {currentUser && (
                <>
                  <Link
                    href="/dashboard?tab=orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white text-slate-800 border border-slate-200"
                  >
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>{language === 'km' ? 'ការបញ្ជាទិញរបស់ខ្ញុំ' : 'My Orders'}</span>
                  </Link>

                  <Link
                    href="/reseller"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 text-purple-900 border border-purple-200"
                  >
                    <Store className="w-4 h-4 text-purple-600" />
                    <span>{t.resellerHub}</span>
                  </Link>

                  {currentUser.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-600" />
                      <span>{t.adminPortal}</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
