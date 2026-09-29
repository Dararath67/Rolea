"use client";

import React, { useState } from "react";
import { Send, MessageSquare, X, ChevronRight, ShieldCheck, Clock, MessageCircle } from "lucide-react";

export default function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end print:hidden">
      {/* Expandable Chat Menu */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-100 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Close support menu"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-center font-bold text-[#0088cc] shadow-xs">
                <Send className="w-5 h-5 text-[#0088cc] -translate-x-0.5 translate-y-0.5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide text-slate-900">ROLEA Customer Support</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-600 font-semibold">24/7 Online Assistance (បម្រើសេវា ២៤/៧)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Options */}
          <div className="p-4 space-y-3 bg-white">
            <p className="text-xs text-slate-500 mb-1 leading-relaxed">
              Need help with your top-up, payment, or player account verification? Reach our dedicated support team directly:
            </p>

            {/* Telegram Direct Support (@RoleaToP_bot) */}
            <a
              href="https://t.me/RoleaToP_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200/90 hover:border-sky-300 transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-center text-[#0088cc] group-hover:bg-[#0088cc] group-hover:text-white transition-colors shadow-xs">
                  <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-[#0088cc] transition-colors">
                    Telegram Support
                  </div>
                  <div className="text-xs font-mono text-[#0088cc] font-semibold">
                    @RoleaToP_bot <span className="text-slate-500 font-normal font-sans">(Instant Response)</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0088cc] transition-colors" />
            </a>

            {/* Support Ticket System Link */}
            <a
              href="/support/tickets"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Support Ticket Portal
                  </div>
                  <div className="text-xs text-blue-700 font-semibold">
                    Submit &amp; Chat with Support <span className="text-slate-500 font-normal">(Voice &amp; Media)</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </div>

          {/* Footer Badge */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Top-Up Partner</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Avg. response &lt; 2 min</span>
            </div>
          </div>
        </div>
      )}

      {/* Circular Floating Trigger Button (Telegram Sky Blue) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-14 h-14 rounded-full bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-2xl shadow-[#0088cc]/40 hover:shadow-[#0088cc]/60 transition-all duration-300 active:scale-95 border-2 border-white/40 flex items-center justify-center"
        aria-label="Customer Support 24/7"
        title="24/7 Online Support (@RoleaToP_bot)"
      >
        {/* Live Online Badge */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>

        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
        ) : (
          <Send className="w-6 h-6 text-white -translate-x-0.5 translate-y-0.5 transition-transform group-hover:scale-110" />
        )}
      </button>
    </div>
  );
}
