import React from 'react';
import { Loader2, Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md transition-all duration-300">
      <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-white/95 shadow-2xl border border-slate-100 max-w-sm w-full mx-4 text-center">
        {/* Animated Icon Container */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/30 animate-spin border-t-blue-600" />
        </div>

        {/* Loading Text */}
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          កំពុងទាញយកទិន្នន័យ...
        </h3>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          សូមរង់ចាំមួយភ្លែត (Loading, please wait)
        </p>

        {/* Subtitle Progress Indicator */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
