import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Server, 
  Gamepad2, 
  Layers, 
  ShoppingBag, 
  Users, 
  Award, 
  Wallet, 
  CreditCard, 
  Tag, 
  Image as ImageIcon, 
  BarChart3, 
  Bell, 
  RefreshCw, 
  ShieldCheck, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Shield,
  Store,
  LifeBuoy,
  Crown,
  Megaphone
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard'
  | 'api-providers'
  | 'api-games'
  | 'gamer-verification'
  | 'games'
  | 'products'
  | 'orders'
  | 'users'
  | 'resellers'
  | 'wallet'
  | 'payments'
  | 'coupons'
  | 'banners'
  | 'reports'
  | 'notifications'
  | 'sync-logs'
  | 'audit-logs'
  | 'settings'
  | 'tickets'
  | 'promoters'
  | 'broadcast';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  currentRole: string;
  unreadCount: number;
  stats?: any;
  language?: string;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  currentRole,
  unreadCount,
  stats,
  language = 'km'
}: AdminSidebarProps) {
  const isKm = language === 'km';

  const menuSections = [
    {
      title: isKm ? 'ផ្ទាំងទិន្នន័យ & វិភាគ' : 'Main & Analytics',
      items: [
        { id: 'dashboard', label: isKm ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard', icon: LayoutDashboard, badge: stats?.today_orders_count ? `${stats.today_orders_count} ${isKm ? 'ថ្ងៃនេះ' : 'today'}` : undefined },
        { id: 'reports', label: isKm ? 'របាយការណ៍ហិរញ្ញវត្ថុ' : 'Financial Reports', icon: BarChart3 },
        { id: 'notifications', label: isKm ? 'ការជូនដំណឹង' : 'Notifications', icon: Bell, badge: unreadCount > 0 ? `${unreadCount}` : undefined, badgeColor: 'bg-red-500 text-white' }
      ]
    },
    {
      title: isKm ? 'ប្រព័ន្ធតភ្ជាប់ API ផ្គត់ផ្គង់' : 'Supplier Engine',
      items: [
        { id: 'api-providers', label: isKm ? 'អ្នកផ្ដល់សេវា API' : 'API Providers', icon: Server, badge: stats?.active_providers ? `${stats.active_providers} ${isKm ? 'ដំណើរការ' : 'active'}` : undefined },
        { id: 'gamer-verification', label: isKm ? 'ផ្ទៀងផ្ទាត់ឈ្មោះ Gamer' : 'Gamer Verification', icon: ShieldCheck, badge: isKm ? 'Real API' : 'Real API' },
        { id: 'api-games', label: isKm ? 'ហ្គេមតភ្ជាប់ API (ON/OFF)' : 'Connected Games', icon: Gamepad2, badge: isKm ? 'Auto Catalog' : 'Auto Catalog' },
        { id: 'sync-logs', label: isKm ? 'កំណត់ត្រា Sync Logs' : 'Sync Logs', icon: RefreshCw }
      ]
    },
    {
      title: isKm ? 'កាតាឡុក & ការលក់' : 'Catalog & Commerce',
      items: [
        { id: 'games', label: isKm ? 'បញ្ជីហ្គេមទាំងអស់' : 'Games Catalog', icon: Gamepad2, badge: stats?.active_games_count ? `${stats.active_games_count}` : undefined },
        { id: 'products', label: isKm ? 'កញ្ចប់តម្លៃផលិតផល' : 'Products & Pricing', icon: Layers, badge: stats?.active_products_count ? `${stats.active_products_count}` : undefined },
        { id: 'orders', label: isKm ? 'ការបញ្ជាទិញ' : 'Orders', icon: ShoppingBag, badge: stats?.pending_orders ? `${stats.pending_orders} ${isKm ? 'រង់ចាំ' : 'pending'}` : undefined, badgeColor: 'bg-amber-500 text-white' }
      ]
    },
    {
      title: isKm ? 'ហិរញ្ញវត្ថុ & គណនី' : 'Finance & Accounts',
      items: [
        { id: 'users', label: isKm ? 'គណនីអតិថិជន' : 'Users', icon: Users },
        { id: 'resellers', label: isKm ? 'ដៃគូលក់បន្ត B2B' : 'Resellers & B2B', icon: Award, badge: stats?.total_resellers ? `${stats.total_resellers}` : undefined },
        { id: 'wallet', label: isKm ? 'កំណត់ត្រាកាបូបលុយ' : 'Wallet Ledger', icon: Wallet },
        { id: 'payments', label: isKm ? 'ច្រកទូទាត់ប្រាក់' : 'Payment Gateways', icon: CreditCard },
        { id: 'tickets', label: isKm ? 'សំបុត្រគាំទ្រ Support' : 'Support Tickets', icon: LifeBuoy, badge: stats?.open_tickets_count ? `${stats.open_tickets_count}` : undefined, badgeColor: 'bg-blue-600 text-white' }
      ]
    },
    {
      title: isKm ? 'ទីផ្សារ & មាតិកា' : 'Marketing & Content',
      items: [
        { id: 'coupons', label: isKm ? 'ប័ណ្ណបញ្ចុះតម្លៃ' : 'Coupons & Promos', icon: Tag },
        { id: 'banners', label: isKm ? 'បដាផ្សព្វផ្សាយ Hero' : 'Hero Banners', icon: ImageIcon },
        { id: 'promoters', label: isKm ? 'កម្មវិធី Promoter' : 'Promoter Portal', icon: Crown },
        { id: 'broadcast', label: isKm ? 'មជ្ឈមណ្ឌល Broadcast' : 'Broadcast Center', icon: Megaphone, badge: 'New', badgeColor: 'bg-indigo-600 text-white' }
      ]
    },
    {
      title: isKm ? 'ប្រព័ន្ធ & សុវត្ថិភាព' : 'System & Security',
      items: [
        { id: 'audit-logs', label: isKm ? 'កំណត់ត្រាសុវត្ថិភាព Audit' : 'Audit Logs', icon: ShieldCheck },
        { id: 'settings', label: isKm ? 'ការកំណត់ប្រព័ន្ធ' : 'Platform Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside
      className={`sticky top-0 h-screen bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-14 w-auto shrink-0 flex items-center justify-center">
            <img src="/images/logo.png" alt="Rolea Admin Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-base tracking-tight truncate">
                  Rolea<span className="text-blue-600">Admin</span>
                </span>
              </div>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:block"
          title={collapsed ? (isKm ? "ពង្រីក Sidebar" : "Expand sidebar") : (isKm ? "បង្រួម Sidebar" : "Collapse sidebar")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 leading-snug">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold leading-relaxed transition-all relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {!collapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : item.badgeColor || 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {!collapsed && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                {isKm ? 'ស្ថានភាព API ផ្គត់ផ្គង់' : 'Upstream Health'}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isKm ? 'ធម្មតា' : 'ONLINE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">FastAPI Engine v2.0</p>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            title={isKm ? "ទៅកាន់ទំព័រមុខហាង" : "Go to customer storefront"}
          >
            <Store className="w-4 h-4" />
            {!collapsed && <span>{isKm ? 'ទំព័រមុខហាង' : 'Storefront'}</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
