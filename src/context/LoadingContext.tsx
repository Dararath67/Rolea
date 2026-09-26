'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Zap, Loader2 } from 'lucide-react';

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  loadingText: 'កំពុងដំណើរការ...',
  showLoading: () => {},
  hideLoading: () => {},
});

export const useGlobalLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('កំពុងដំណើរការ...');

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hide loading overlay whenever route changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  const showLoading = (text?: string) => {
    if (text) setLoadingText(text);
    else setLoadingText('កំពុងដំណើរការ...');
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, loadingText, showLoading, hideLoading }}>
      {children}
      
      {/* Global Loading Overlay UI */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/75 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-white shadow-2xl border border-slate-100 max-w-sm w-full mx-4 text-center">
            {/* Animated Ring & Logo */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/30 animate-spin border-t-blue-600" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {loadingText}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              សូមរង់ចាំមួយភ្លែត (Please wait a moment)
            </p>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 h-full w-3/4 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}
