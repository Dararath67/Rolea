'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Gamepad2, 
  SearchCheck, 
  LifeBuoy, 
  User, 
  LogIn,
  Layers,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isKm = language === 'km';
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [pathname]);

  const navItems = [
    {
      id: 'home',
      label: isKm ? 'ទំព័រដើម' : 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      id: 'games',
      label: isKm ? 'ហ្គេម' : 'Games',
      href: '/games',
      icon: Gamepad2,
      isActive: pathname.startsWith('/games')
    },
    {
      id: 'track',
      label: isKm ? 'ពិនិត្យ Order' : 'Track',
      href: '/order/track',
      icon: SearchCheck,
      isActive: pathname.startsWith('/order/track')
    },
    {
      id: 'support',
      label: isKm ? 'ជំនួយ 24/7' : 'Support',
      href: '/support/tickets',
      icon: LifeBuoy,
      isActive: pathname.startsWith('/support')
    },
    {
      id: 'account',
      label: currentUser ? (isKm ? 'គណនី' : 'Account') : (isKm ? 'ចូលប្រើ' : 'Sign In'),
      href: currentUser ? (currentUser.role === 'admin' ? '/admin' : '/dashboard') : '/login',
      icon: currentUser ? User : LogIn,
      isActive: pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/admin')
    }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl px-2 py-1.5 transition-all print:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-2xl transition-all cursor-pointer ${
                active 
                  ? 'text-blue-600 font-bold scale-105' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${active ? 'bg-blue-50' : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
