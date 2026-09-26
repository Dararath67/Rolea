import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Gamepad2, 
  Award, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface DashboardChartsProps {
  stats: any;
  onNavigateTab: (tab: any) => void;
  language?: string;
}

export default function DashboardCharts({ stats, onNavigateTab, language = 'km' }: DashboardChartsProps) {
  const isKm = language === 'km';
  const dailyRevenue = stats?.chart_daily_revenue || [];
  const dailyProfit = stats?.chart_daily_profit || [];
  const topGames = stats?.chart_top_games || [];
  const statusDist = stats?.chart_status_distribution || {};

  const maxRevenue = Math.max(...dailyRevenue.map((d: any) => d.revenue), 100);

  const totalStatusCount = Object.values(statusDist).reduce((a: any, b: any) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* 14-Day Comparative Revenue & Profit Visual Trend */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>{isKm ? 'ស្ថិតិចំណូល និងប្រាក់ចំណេញ ១៤ ថ្ងៃចុងក្រោយ' : '14-Day Revenue & Net Margin Trend'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isKm 
                ? 'ការប្រៀបធៀបចំណូលលក់សរុប (Gross Sales) និងប្រាក់ចំណេញសុទ្ធ (Net Margin) ពីការបញ្ជាទិញស្វ័យប្រវត្តិ' 
                : 'Comparative daily gross sales vs net profit from automated top-up orders'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded-md bg-blue-600" />
              <span>{isKm ? 'ចំណូលសរុប ($)' : 'Gross Sales ($)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>{isKm ? 'ចំណេញសុទ្ធ ($)' : 'Net Margin ($)'}</span>
            </div>
          </div>
        </div>

        {/* Bar & Area Visual Chart */}
        <div className="h-48 pt-4 flex items-end justify-between gap-1.5 sm:gap-2">
          {dailyRevenue.map((item: any, idx: number) => {
            const rev = item.revenue;
            const prof = dailyProfit[idx]?.profit ?? 0;
            const heightPercent = Math.min(Math.round((rev / maxRevenue) * 100), 100);
            const profitHeightPercent = Math.min(Math.round((prof / maxRevenue) * 100), 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                {/* Tooltip on Hover */}
                <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-20 border border-slate-700">
                  <div>{item.date}</div>
                  <div className="text-blue-300 font-mono">${rev.toFixed(2)} {isKm ? 'ចំណូល' : 'Sales'}</div>
                  <div className="text-emerald-400 font-mono">+${prof.toFixed(2)} {isKm ? 'ចំណេញ' : 'Profit'}</div>
                </div>

                <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36">
                  {/* Revenue Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-blue-600 group-hover:bg-blue-500 rounded-t-md transition-all duration-300"
                  />
                  {/* Profit Bar */}
                  <div
                    style={{ height: `${profitHeightPercent}%` }}
                    className="w-full bg-emerald-500 group-hover:bg-emerald-400 rounded-t-md transition-all duration-300"
                  />
                </div>

                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[36px]">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid for Top Games & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Games (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-purple-600" />
                <span>{isKm ? 'ហ្គេមលក់ដាច់បំផុត (Top Selling)' : 'Top Selling Games'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {isKm ? 'ចំណាត់ថ្នាក់ហ្គេមតាមចំនួនការបញ្ជាទិញ និងចំណូល' : 'Ranked by customer transaction volume and gross value'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('games')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              {isKm ? 'មើលទាំងអស់' : 'View All'}
            </button>
          </div>

          <div className="space-y-3">
            {topGames.map((game: any, idx: number) => {
              const maxCount = topGames[0]?.orders_count || 100;
              const percent = Math.round((game.orders_count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800">{game.game_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-medium">{game.orders_count} {isKm ? 'ដង' : 'orders'}</span>
                      <span className="font-mono font-bold text-slate-900">${game.revenue_usd.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-blue-600' :
                        idx === 1 ? 'bg-purple-600' :
                        idx === 2 ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution (1 col) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>{isKm ? 'ស្ថានភាពការបញ្ជាទិញ' : 'Order Fulfillment'}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              {isKm ? 'មើល' : 'View'}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-emerald-950">
                  {isKm ? 'ជោគជ័យ (Delivered)' : 'Delivered Success'}
                </span>
              </div>
              <span className="font-mono font-black text-emerald-700 text-sm">
                {statusDist.success || 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-bold text-blue-950">
                  {isKm ? 'កំពុងដំណើរការ (Processing)' : 'Processing / Queue'}
                </span>
              </div>
              <span className="font-mono font-black text-blue-700 text-sm">
                {statusDist.processing || 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-950">
                  {isKm ? 'រង់ចាំទូទាត់ (Pending)' : 'Pending Payment'}
                </span>
              </div>
              <span className="font-mono font-black text-amber-700 text-sm">
                {statusDist.pending || 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="font-bold text-red-950">
                  {isKm ? 'បរាជ័យ/បោះបង់' : 'Failed / Cancelled'}
                </span>
              </div>
              <span className="font-mono font-black text-red-700 text-sm">
                {statusDist.failed || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
