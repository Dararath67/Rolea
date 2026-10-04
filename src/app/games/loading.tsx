import React from 'react';
import { Zap } from 'lucide-react';

export default function GamesLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-white shadow-xl border border-slate-100 max-w-sm w-full mx-4">
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/30 animate-spin border-t-blue-600" />
        </div>

        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          កំពុងទាញយកបញ្ជីហ្គេម...
        </h3>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          សូមរង់ចាំមួយភ្លែត (Loading Games Catalog)
        </p>

        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
