import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Globe, 
  Store, 
  LogOut, 
  Zap, 
  Bell, 
  Menu, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  X,
  UserCheck
} from 'lucide-react';

interface AdminHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  language: string;
  toggleLanguage: () => void;
  currentRole: string;
  setCurrentRole: (role: string) => void;
  notifications: any[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onSyncAll: () => void;
  syncLoading: boolean;
  onLogout: () => void;
  onToggleSidebarMobile: () => void;
}

export default function AdminHeader({
  searchQuery,
  setSearchQuery,
  language,
  toggleLanguage,
  currentRole,
  setCurrentRole,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onSyncAll,
  syncLoading,
  onLogout,
  onToggleSidebarMobile
}: AdminHeaderProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const isKm = language === 'km';

  const unreadNotifs = notifications.filter(n => !n.is_read);

  const roles = [
    { id: 'super_admin', label: isKm ? 'Super Admin' : 'Super Admin', desc: isKm ? 'សិទ្ធិគ្រប់គ្រងពេញលេញទាំងអស់' : 'Full root access' },
    { id: 'admin', label: isKm ? 'Admin' : 'Admin', desc: isKm ? 'ប្រតិបត្តិការទូទៅនៃប្រព័ន្ធ' : 'Standard operations' },
    { id: 'manager', label: isKm ? 'Operations Manager' : 'Operations Manager', desc: isKm ? 'គ្រប់គ្រងហ្គេម និងការបញ្ជាទិញ' : 'Catalog & orders' },
    { id: 'finance', label: isKm ? 'Finance Specialist' : 'Finance Specialist', desc: isKm ? 'កាបូបលុយ និងរបាយការណ៍' : 'Wallets & reports' },
    { id: 'support', label: isKm ? 'Customer Support' : 'Customer Support', desc: isKm ? 'ពិនិត្យបញ្ជាទិញ & ដោះស្រាយបញ្ហា' : 'Orders & troubleshooting' }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile Toggle & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onToggleSidebarMobile}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 sm:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKm ? "ស្វែងរកការបញ្ជាទិញ ហ្គេម ផលិតផល អតិថិជន Provider..." : "Search across orders, games, products, users, providers..."}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 shadow-xs transition-colors"
            />
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sync All Button */}
          <button
            onClick={onSyncAll}
            disabled={syncLoading}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors shadow-xs"
            title={isKm ? "ដំណើរការ Auto-Sync គ្រប់ Provider ទាំងអស់" : "Trigger global auto-sync across all providers"}
          >
            <Zap className={`w-3.5 h-3.5 text-blue-600 ${syncLoading ? 'animate-spin' : ''}`} />
            <span>{syncLoading ? (isKm ? 'កំពុង Sync...' : 'Syncing...') : (isKm ? 'Sync ទាំងអស់' : 'Sync All')}</span>
          </button>

          {/* Role Switcher Demo */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-200"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline capitalize">{currentRole.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                  {isKm ? 'ប្ដូរតួនាទីគ្រប់គ្រង (Role Demo)' : 'Switch Demo Role'}
                </div>
                {roles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentRole(r.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold flex flex-col hover:bg-slate-50 ${
                      currentRole === r.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              title={isKm ? "ការជូនដំណឹង" : "Notifications"}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      {isKm ? 'ការជូនដំណឹងប្រព័ន្ធ' : 'System Alerts'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700">
                      {unreadNotifs.length} {isKm ? 'ថ្មី' : 'unread'}
                    </span>
                  </div>
                  <button
                    onClick={onClearNotifications}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    {isKm ? 'សម្អាតទាំងអស់' : 'Clear All'}
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      {isKm ? 'មិនមានការជូនដំណឹងថ្មីទេ' : 'No active notifications'}
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-colors ${
                          n.is_read
                            ? 'bg-slate-50 border-slate-200 text-slate-600'
                            : 'bg-blue-50/50 border-blue-200 text-blue-950 font-bold'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-black">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-normal">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 font-normal">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{language === 'km' ? 'ភាសាខ្មែរ (KM)' : 'English (EN)'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold transition-colors border border-slate-200"
            title={isKm ? "ចាកចេញ" : "Logout"}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isKm ? 'ចាកចេញ' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
