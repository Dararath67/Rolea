'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WalletDepositModal from '@/components/WalletDepositModal';
import { 
  Sparkles, 
  LayoutGrid, 
  Package, 
  Wallet, 
  Gift, 
  Settings, 
  Store, 
  Zap, 
  LogOut, 
  Coins, 
  Trophy, 
  Gamepad2, 
  VolumeX, 
  Volume2
} from 'lucide-react';

export default function LuckyDrawPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [spinsCount, setSpinsCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    let uObj: any = null;
    try {
      const stored = localStorage.getItem('rothz_user') || localStorage.getItem('rolea_user');
      if (stored) {
        uObj = JSON.parse(stored);
        setCurrentUser(uObj);
      }
    } catch (e) {
      console.error(e);
    }
    
    if (uObj?.id || uObj?.username) {
      fetchLuckyDrawStatus(uObj.id || uObj.username);
    }
  }, []);

  const fetchLuckyDrawStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/v1/user/lucky-draw/status?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setSpinsCount(data.spins_remaining || 0);
        setPoints(data.reward_points || 0);
      }
    } catch (err) {
      console.error("Failed to fetch lucky draw status:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rothz_token');
    localStorage.removeItem('rothz_user');
    localStorage.removeItem('rolea_user');
    setCurrentUser(null);
    router.push('/');
  };

  const wheelSegments = [
    { label: 'PS4', color: '#0d9488', textColor: '#ffffff' },       // Teal
    { label: '+50', color: '#059669', textColor: '#ffffff' },       // Emerald
    { label: '+1', color: '#334155', textColor: '#ffffff' },        // Slate
    { label: '+10', color: '#b45309', textColor: '#ffffff' },       // Amber Dark
    { label: 'LITE', color: '#7c3aed', textColor: '#ffffff' },      // Purple
    { label: 'L+', color: '#3b0764', textColor: '#ffffff' },        // Dark Purple
    { label: '+100', color: '#dc2626', textColor: '#ffffff' },      // Red
    { label: '+10', color: '#ea580c', textColor: '#ffffff' },       // Orange
  ];

  const handleSpin = async () => {
    if (spinning) return;
    if (spinsCount <= 0) {
      setIsDepositOpen(true);
      return;
    }

    setSpinning(true);
    setSelectedPrize(null);

    let winLabel = 'PS4';
    try {
      const res = await fetch('/api/v1/user/lucky-draw/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser?.id || currentUser?.username })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.prize) {
          winLabel = data.data.prize;
          setSpinsCount(data.data.spins_remaining);
          setPoints(data.data.reward_points);
        }
      }
    } catch (err) {
      console.error("Spin error:", err);
    }

    const matchedIdx = wheelSegments.findIndex(s => s.label === winLabel);
    const randomIndex = matchedIdx >= 0 ? matchedIdx : Math.floor(Math.random() * wheelSegments.length);
    const extraRotations = 360 * 5;
    const segmentAngle = 360 / wheelSegments.length;
    const targetDegree = extraRotations + (randomIndex * segmentAngle);

    setWheelRotation((prev) => prev + targetDegree);

    setTimeout(() => {
      setSpinning(false);
      setSelectedPrize(wheelSegments[randomIndex].label);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:py-8 w-full">
        
        {/* Main Grid Layout: Sidebar + Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Sidebar Card */}
          <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4 text-xs font-semibold space-y-4 shadow-sm text-slate-800">
            
            {/* User Details */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {currentUser?.avatar_url || currentUser?.telegram_photo_url ? (
                  <img
                    src={currentUser.avatar_url || currentUser.telegram_photo_url}
                    alt={currentUser?.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm uppercase">
                    {currentUser?.username ? currentUser.username.charAt(0) : 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-slate-900 text-sm truncate">
                  {currentUser?.username || currentUser?.full_name || 'Ratha Dararath'}
                </p>
                <p className="text-slate-500 text-xs font-normal truncate mt-0.5">
                  {currentUser?.email || 'rathadararath8@gmail.com'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Wallet Info */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">WALLET</p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                ${(currentUser?.wallet_usd || 0).toFixed(2)}
              </p>
            </div>

            <div className="border-t border-slate-100" />

            {/* Nav List */}
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
              >
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span>ទិដ្ឋភាពទូទៅ</span>
              </Link>

              <Link
                href="/dashboard?tab=orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
              >
                <Package className="w-4 h-4 text-blue-600" />
                <span>ការបញ្ជាទិញ</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors text-left"
              >
                <Wallet className="w-4 h-4 text-blue-600" />
                <span>ប្រាក់ក្នុងគណនី</span>
              </button>

              {/* Active Tab */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-800 font-extrabold border border-amber-200 shadow-2xs">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>រង្វាន់</span>
              </div>

              <Link
                href="/dashboard?tab=settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>ការកំណត់</span>
              </Link>
            </nav>

            <div className="border-t border-slate-100" />

            {/* Partner Section */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">PARTNER</p>
              <Link
                href="/reseller"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
              >
                <Store className="w-4 h-4 text-blue-600" />
                <span>Reseller dashboard</span>
              </Link>
            </div>

            <div className="border-t border-slate-100" />

            {/* Actions */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors text-left cursor-pointer"
              >
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Top up</span>
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Log out</span>
                </button>
              )}
            </div>

          </aside>

          {/* Right Main Content */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Main Header */}
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Lucky Draw
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                សម្រាប់អ្នកមានគណនីប៉ុណ្ណោះ។ រាល់ការបញ្ចូលទឹកប្រាក់ដែលបានជោគជ័យ ទទួលបានបង្វិល ១ ដង។
              </p>
            </div>

            {/* Main Two-Column Layout (Wheel + Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Center Wheel Card */}
              <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col items-center justify-between min-h-[520px] shadow-xs relative overflow-hidden">
                
                {/* Stats Row */}
                <div className="w-full flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500">ការបង្វិលនៅសល់</p>
                    <p className="text-3xl font-black text-slate-900 mt-0.5">{spinsCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-600">ពិន្ទុ</p>
                    <p className="text-3xl font-black text-amber-600 mt-0.5">{points}</p>
                  </div>
                </div>

                {/* SVG Wheel Graphic */}
                <div className="my-6 relative flex flex-col items-center justify-center">
                  
                  {/* Top Pointer Arrow */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-amber-500 filter drop-shadow-sm" />

                  {/* Glowing Ring */}
                  <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-amber-500 shadow-md relative flex items-center justify-center overflow-hidden bg-slate-900">
                    
                    {/* Rotating Wheel Container */}
                    <div 
                      className="w-full h-full rounded-full transition-transform duration-[3000ms] ease-out"
                      style={{ transform: `rotate(${wheelRotation}deg)` }}
                    >
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {wheelSegments.map((segment, index) => {
                          const numSegments = wheelSegments.length;
                          const angle = 360 / numSegments;
                          const startAngle = index * angle;
                          const endAngle = (index + 1) * angle;

                          const x1 = 100 + 100 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                          const y1 = 100 + 100 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                          const x2 = 100 + 100 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                          const y2 = 100 + 100 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                          const textAngle = startAngle + angle / 2;
                          const textRad = (Math.PI * (textAngle - 90)) / 180;
                          const textX = 100 + 62 * Math.cos(textRad);
                          const textY = 100 + 62 * Math.sin(textRad);

                          return (
                            <g key={index}>
                              <path
                                d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                                fill={segment.color}
                                stroke="#121215"
                                strokeWidth="1.5"
                              />
                              <text
                                x={textX}
                                y={textY}
                                fill={segment.textColor}
                                fontSize="11"
                                fontWeight="900"
                                textAnchor="middle"
                                dominantBaseline="central"
                                transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                              >
                                {segment.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Center Wheel Hub */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Spin Result Alert */}
                {selectedPrize && (
                  <div className="mb-3 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs animate-bounce">
                    អ្នកបានឈ្នះ៖ {selectedPrize}!
                  </div>
                )}

                {/* Main Action Button */}
                <div className="w-full text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={spinning}
                    className="w-full max-w-sm py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer border border-amber-500 mx-auto disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>{spinning ? 'កំពុងបង្វិល...' : 'បញ្ចូលទឹកប្រាក់ដើម្បីបានបង្វិល'}</span>
                  </button>

                  <div>
                    <button
                      type="button"
                      onClick={() => setIsDepositOpen(true)}
                      className="text-amber-600 underline text-xs font-bold hover:text-amber-700 transition-colors cursor-pointer"
                    >
                      បញ្ចូលកូដទូទាត់
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side Cards */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Card 1: Points & Redeem */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-xs font-semibold space-y-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4.5 h-4.5 text-amber-500" />
                    <h2 className="text-sm font-extrabold text-slate-900">ពិន្ទុ</h2>
                  </div>

                  <p className="text-slate-500 text-xs font-normal">
                    9000 ពិន្ទុ = $1 ក្នុងគណនី។ ប្តូរបានចាប់ពី 9000 ឡើងទៅ។
                  </p>

                  <p className="text-3xl font-black text-slate-900 font-mono py-0.5">
                    {points}
                  </p>

                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (points / 9000) * 100)}%` }} />
                    </div>
                    <p className="text-slate-500 text-[11px] font-normal">
                      ខ្វះ 10000 ពិន្ទុទៀត ដើម្បីបាន $1
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={points < 9000}
                    className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-extrabold text-xs cursor-not-allowed border border-slate-200 mt-1"
                  >
                    ប្តូរជាប្រាក់
                  </button>
                </div>

                {/* Card 2: Prizes on Wheel */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-xs font-semibold space-y-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4.5 h-4.5 text-amber-500" />
                    <h2 className="text-sm font-extrabold text-slate-900">រង្វាន់នៅលើកង់</h2>
                  </div>

                  {/* Item List */}
                  <div className="space-y-3.5">
                    
                    {/* Item 1: Points */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">ពិន្ទុ</p>
                        <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                          ភាគច្រើនទទួលបាន ១ ឬ ៩០ ពិន្ទុប្រមូលសរុបដើម្បីប្តូរប្រាក់។
                        </p>
                      </div>
                    </div>

                    {/* Item 2: Weekly Lite */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Weekly Lite</p>
                        <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                          Free Fire Weekly Lite សម្រាប់អ្នកសំណាង។
                        </p>
                      </div>
                    </div>

                    {/* Item 3: PS4 */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0 mt-0.5">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-slate-900">PS4</p>
                        <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                          រង្វាន់ធំ។ កម្រណាស់។ គោលដៅហោច 14% — PS4 នឹងចូលកុងពេលអ្នកលេងឡើងដល់ 100% ក្នុងខែនេះ។
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mt-2">
                          <div className="h-full bg-cyan-500 w-[14%]" />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-[10px] text-slate-400 font-normal">
                      ខេនរង្វាន់ថែមគិតថ្លៃពិន្ទុមិនមែនឆ្នោតបង់ប្រាក់ទេ 9000 ពិន្ទុ = $1
                    </p>
                  </div>
                </div>

                {/* Card 3: Winners */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-xs font-semibold space-y-2 shadow-xs">
                  <h2 className="text-sm font-extrabold text-slate-900">អ្នកឈ្នះ: Weekly Lite</h2>
                  <p className="text-slate-500 text-xs font-normal">
                    មិនទាន់មានអ្នកឈ្នះ Weekly Lite ទេ — ឈ្មោះអ្នកអាចជាដំបូង។
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}
