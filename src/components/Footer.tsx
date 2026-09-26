'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Zap, Send } from 'lucide-react';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 text-xs mt-auto font-sans">
      {/* Payment methods row */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-slate-800 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
              {language === 'km' ? 'វិធីសាស្ត្រទូទាត់ផ្លូវការ:' : 'Official Payment Methods:'}
            </span>
            
            <div className="flex flex-wrap items-center justify-center gap-2 font-bold text-[11px]">
              <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                Bakong KHQR
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                ABA PAY
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 whitespace-nowrap">
                ACLEDA Mobile
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                Wing Bank
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap">
                Visa / Mastercard
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                Rolea Wallet
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="Rolea Logo" 
                className="h-12 w-auto object-contain drop-shadow-xs" 
              />
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 tracking-tight">{t.brandName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Cambodia
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 max-w-md font-medium">
              {t.footerDesc}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a
                href="https://t.me/RoleaToP_bot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram Support @RoleaToP_bot</span>
              </a>
              <a
                href="https://t.me/RothzTopup"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-bold text-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Channel @RothzTopup</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-black text-xs uppercase tracking-wider mb-3">
              {language === 'km' ? 'ហ្គេមពេញនិយម' : 'Popular Games'}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/games/mobile-legends" className="hover:text-blue-600 transition-colors">Mobile Legends (MLBB)</Link></li>
              <li><Link href="/games/pubg-mobile" className="hover:text-blue-600 transition-colors">PUBG Mobile (UC)</Link></li>
              <li><Link href="/games/free-fire" className="hover:text-blue-600 transition-colors">Free Fire Diamonds</Link></li>
              <li><Link href="/games/honor-of-kings" className="hover:text-blue-600 transition-colors">Honor of Kings (HoK)</Link></li>
              <li><Link href="/games/call-of-duty-mobile" className="hover:text-blue-600 transition-colors">Call of Duty Mobile</Link></li>
            </ul>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-slate-900 font-black text-xs uppercase tracking-wider mb-3">
              {language === 'km' ? 'គណនី & សេវាកម្ម' : 'Account & Access'}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">{t.storefront}</Link></li>
              <li><Link href="/games" className="hover:text-blue-600 transition-colors">{t.allGames}</Link></li>
              <li><Link href="/order/track" className="hover:text-blue-600 transition-colors">{t.trackOrder}</Link></li>
              <li><Link href="/support/tickets" className="hover:text-blue-600 transition-colors">{language === 'km' ? 'សំបុត្រជំនួយ (Support Ticket)' : 'Support Tickets'}</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 transition-colors">{t.login}</Link></li>
              <li><Link href="/register" className="hover:text-blue-600 transition-colors">{t.register}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {t.brandName}. {t.allRightsReserved}.</p>
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Bakong KHQR & Gateway Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
