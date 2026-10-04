'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Zap } from 'lucide-react';

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
  const [progress, setProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading & complete top progress bar whenever route finishes changing
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsNavigating(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept click on internal links for instant page navigation loading indicator
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const url = new URL(target.href);
        // Only trigger if going to a different route/page
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          if (!target.getAttribute('target') && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            setIsNavigating(true);
            setProgress(30);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  }, []);

  // Animate top progress bar while navigating
  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 15;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isNavigating]);

  // Safety timeout to reset loading state if navigation stalls
  useEffect(() => {
    if (!isNavigating && !isLoading) return;
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setIsNavigating(false);
      setProgress(0);
    }, 4000);
    return () => clearTimeout(timeout);
  }, [isNavigating, isLoading]);

  const showLoading = (text?: string) => {
    if (text) setLoadingText(text);
    else setLoadingText('កំពុងដំណើរការ...');
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setIsNavigating(false);
    setProgress(0);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, loadingText, showLoading, hideLoading }}>
      {/* Top Page Progress Loading Bar */}
      {(isNavigating || progress > 0) && (
        <div className="fixed top-0 left-0 right-0 z-[10000] h-1 bg-transparent pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-md shadow-blue-500/50 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {children}

      {/* Global Full-Screen Modal Loading Overlay */}
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
