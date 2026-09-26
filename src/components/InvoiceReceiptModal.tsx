'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  Gamepad2, 
  CreditCard, 
  ShieldCheck, 
  Zap,
  Building2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function InvoiceReceiptModal({ isOpen, onClose, order }: InvoiceReceiptModalProps) {
  const { language, formatPrice, t } = useLanguage();
  const isKm = language === 'km';

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 480);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, 600, 85);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('RoleaTopup Cambodia', 25, 42);
    ctx.font = '12px sans-serif';
    ctx.fillText('Official Game Top-Up Receipt', 25, 65);

    ctx.textAlign = 'right';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(order.id || 'ORD-RECEIPT', 575, 42);
    ctx.font = '11px sans-serif';
    ctx.fillText(new Date(order.created_at || Date.now()).toLocaleDateString(), 575, 65);

    ctx.textAlign = 'left';

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(25, 105, 550, 180, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Game:', 45, 140);
    ctx.font = '13px sans-serif';
    ctx.fillText(String(order.game_name_en || order.game_slug || 'Game Top-Up'), 120, 140);

    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Package:', 45, 180);
    ctx.font = '13px sans-serif';
    ctx.fillText(String(order.package_name_en || order.package_name || 'Game Package'), 120, 180);

    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Player ID:', 45, 220);
    ctx.font = '13px monospace';
    ctx.fillText(String(order.player_id || 'N/A'), 120, 220);

    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Payment:', 45, 260);
    ctx.font = '13px sans-serif';
    ctx.fillText(String(order.payment_method || 'Bakong KHQR'), 120, 260);

    ctx.fillStyle = '#eff6ff';
    ctx.strokeStyle = '#93c5fd';
    ctx.beginPath();
    ctx.roundRect(25, 305, 550, 95, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Total Amount Paid:', 45, 355);

    ctx.textAlign = 'right';
    const finalUsd = Number(order.price_usd || order.amount_usd || 0);
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`$${finalUsd.toFixed(2)}`, 555, 348);
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`៛${Math.round(finalUsd * 4100).toLocaleString()} KHR`, 555, 375);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('Thank you for using RoleaTopup • Support Telegram @RoleaToP_bot', 300, 445);

    const link = document.createElement('a');
    link.download = `Rolea_Receipt_${order.id || 'ORD'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto font-sans">
        
        {/* Modal Action Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
              {isKm ? 'វិក្កយបត្រផ្លូវការ' : 'Official Receipt'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isKm ? 'ទាញយក PNG' : 'Save PNG'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isKm ? 'បោះពុម្ព (Print)' : 'Print / PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="space-y-6 print:p-0">
          
          {/* Brand & Receipt Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Rolea Logo" className="h-10 w-auto object-contain" />
                <span className="text-lg font-black text-slate-900 tracking-tight">{t.brandName}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">Cambodia Automated Game Top-Up Engine</p>
              <p className="text-[10px] text-slate-400">Phnom Penh, Kingdom of Cambodia</p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-mono font-black text-slate-900 block">{order.id}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {new Date(order.created_at || Date.now()).toLocaleString()}
              </p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                order.status === 'success' || order.payment_status === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : order.status === 'refunded'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {order.status === 'success' ? (isKm ? 'បានទូទាត់ជោគជ័យ' : 'PAID & DELIVERED') : order.status}
              </span>
            </div>
          </div>

          {/* Customer & Gamer Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                {isKm ? 'ព័ត៌មានហ្គេម' : 'Game Info'}
              </span>
              <p className="font-bold text-slate-900">{order.game_name_en || order.game_slug || 'Game Top-Up'}</p>
              <p className="font-mono text-slate-600 font-semibold">Player ID: {order.player_id}</p>
              {order.zone_id && <p className="font-mono text-slate-600">Zone ID: {order.zone_id}</p>}
              {order.player_name && <p className="text-emerald-700 font-bold">Gamer: {order.player_name}</p>}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                {isKm ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}
              </span>
              <p className="font-bold text-slate-900">{order.payment_method || 'Bakong KHQR'}</p>
              <p className="text-slate-600 font-medium">Currency: {order.currency || 'USD'}</p>
              <p className="text-slate-500 text-[10px]">Status: {order.payment_status || 'Paid'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3 font-bold text-slate-900">
                    {order.package_name_en || order.package_name || 'Game Package'}
                  </td>
                  <td className="p-3 text-center font-mono">1</td>
                  <td className="p-3 text-right font-mono">${Number(order.price_usd || order.amount_usd || 0).toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">${Number(order.price_usd || order.amount_usd || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Summary */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <div>
              <span className="text-xs font-bold text-blue-900 block">{isKm ? 'សរុបទឹកប្រាក់ត្រូវទូទាត់:' : 'Total Amount Paid:'}</span>
              <span className="text-[11px] text-blue-700 font-medium">Rate: 1 USD = 4,100 KHR</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black font-mono text-blue-900 block">
                ${Number(order.price_usd || order.amount_usd || 0).toFixed(2)}
              </span>
              <span className="text-xs font-bold font-mono text-blue-700">
                ៛{Math.round(Number(order.price_usd || order.amount_usd || 0) * 4100).toLocaleString()} KHR
              </span>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-center pt-4 border-t border-slate-100 space-y-1 text-[10px] text-slate-400">
            <p className="font-semibold text-slate-600">Thank you for choosing {t.brandName}!</p>
            <p>Automated credit delivery system. Support Telegram @RoleaToP_bot</p>
          </div>

        </div>

      </div>
    </div>
  );
}
