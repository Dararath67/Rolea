'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { Search, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';

function OrderTrackContent() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrders([data.data]);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'km' ? 'ប្រព័ន្ធតាមដានការបញ្ជាទិញ' : 'Order Tracking'}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">{t.trackOrder}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            {language === 'km' 
              ? 'បញ្ចូលលេខកូដបញ្ជាទិញ (Order ID ឧទាហរណ៍៖ RT-94821) ឬលេខយោង Reference ដើម្បីពិនិត្យស្ថានភាព។' 
              : 'Enter Order ID (e.g. RT-94821) or transaction reference to check fulfillment status.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. RT-94821"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xs transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Quick chips */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Sample Orders:</span>
            <button
              onClick={() => {
                setSearchQuery('RT-94821');
                handleSearch('RT-94821');
              }}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-600 font-mono hover:border-blue-500 shadow-xs"
            >
              RT-94821
            </button>
            <button
              onClick={() => {
                setSearchQuery('RT-94822');
                handleSearch('RT-94822');
              }}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-600 font-mono hover:border-blue-500 shadow-xs"
            >
              RT-94822
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching order...</span>
          </div>
        ) : hasSearched && orders.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-xs">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {language === 'km' ? 'រកមិនឃើញការបញ្ជាទិញ' : 'No Order Found'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'km' ? 'សូមពិនិត្យលេខសម្គាល់ Order ID ឡើងវិញ' : 'Please check your Order ID.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-blue-600 text-base">{ord.id}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ord.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {ord.game_name_en} - {ord.product_name_en}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Player UID: <span className="font-mono font-bold text-slate-800">{ord.player_id}</span> • Method: {ord.payment_method_name}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-medium">Total</span>
                    <span className="text-base font-black text-slate-900">${ord.amount_usd.toFixed(2)}</span>
                  </div>

                  <Link
                    href={`/order/${ord.id}`}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors"
                  >
                    <span>View Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function OrderTrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">Loading...</div>}>
      <OrderTrackContent />
    </Suspense>
  );
}
