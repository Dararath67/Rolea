import os

file_path = 'src/app/admin/components/OrderDetailModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the content with enhanced invoice slip design
new_modal_code = """import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  RotateCcw, 
  Copy, 
  Check, 
  Clock,
  ShieldCheck,
  CreditCard,
  User,
  ArrowRight,
  Zap,
  FileText,
  Printer
} from 'lucide-react';

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
  onRetryOrder: (orderId: string) => void;
  onRefundOrder: (orderId: string, reason: string) => void;
  onCheckStatus: (orderId: string) => void;
  actionLoading: string | null;
  language?: string;
}

export default function OrderDetailModal({
  order,
  onClose,
  onRetryOrder,
  onRefundOrder,
  onCheckStatus,
  actionLoading,
  language = 'km'
}: OrderDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('Customer entered wrong UID');
  const [showRefundInput, setShowRefundInput] = useState(false);
  const isKm = language === 'km';

  if (!order) return null;

  const handleCopy = (text: string, fieldId: string = 'general') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const isPaid = order.payment_status === 'paid' || order.status === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 font-mono">{order.id}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  order.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  order.status === 'refunded' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isKm && order.status === 'success' ? 'ជោគជ័យ (SUCCESS)' :
                   isKm && order.status === 'processing' ? 'កំពុងដំណើរការ' :
                   isKm && order.status === 'refunded' ? 'បានសងប្រាក់វិញ' :
                   isKm && order.status === 'pending' ? 'រង់ចាំទូទាត់' : order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isKm ? 'វិក្កយបត្រទូទាត់ផ្លូវការ & ព័ត៌មានលម្អិត' : 'Official Payment Invoice & Order Details'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OFFICIAL INVOICE & PAYMENT SLIP CARD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 tracking-wider">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>{isKm ? 'ព័ត៌មានវិក្កយបត្រ & ការទូទាត់ (Invoice & Payment)' : 'Payment & Invoice Summary'}</span>
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}>
              {isPaid ? (isKm ? 'PAID (បានទូទាត់)' : 'PAID') : (isKm ? 'UNPAID (រង់ចាំទូទាត់)' : 'UNPAID')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Invoice Ref ID */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {isKm ? 'លេខវិក្កយបត្រ / Invoice Ref' : 'Invoice Reference ID'}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-black text-slate-900 select-all">{order.reference || order.id}</span>
                <button
                  onClick={() => handleCopy(order.reference || order.id, 'ref')}
                  title="Copy Invoice ID"
                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                >
                  {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {isKm ? 'វិធីសាស្ត្រទូទាត់ / Payment Gateway' : 'Payment Method'}
              </span>
              <div className="font-black text-blue-700 mt-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>{order.payment_method_name || order.payment_method_id || 'Bakong KHQR'}</span>
              </div>
            </div>

            {/* Total Amount USD & KHR */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {isKm ? 'ទឹកប្រាក់សរុប / Total Amount' : 'Total Amount'}
              </span>
              <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                ${order.amount_usd.toFixed(2)} USD 
                <span className="text-[11px] text-slate-500 font-normal ml-1">
                  (៛{order.amount_khr ? order.amount_khr.toLocaleString() : Math.round(order.amount_usd * 4100).toLocaleString()})
                </span>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {isKm ? 'លេខទំនាក់ទំនង / Customer Contact' : 'Customer Phone / Contact'}
              </span>
              <div className="font-mono font-bold text-slate-800 mt-1">
                {order.customer_contact || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              {isKm ? 'ហ្គេម & កញ្ចប់' : 'Game & Item'}
            </span>
            <div className="font-bold text-slate-900">{isKm ? (order.game_name_km || order.game_name_en) : order.game_name_en}</div>
            <div className="text-blue-600 font-semibold">{isKm ? (order.product_name_km || order.product_name_en) : order.product_name_en}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              {isKm ? 'គណនីអ្នកលេង' : 'Player Destination'}
            </span>
            <div className="font-mono font-black text-slate-900">UID: {order.player_id}</div>
            {order.server_id && <div className="text-slate-500 font-mono">Server: {order.server_id}</div>}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              {isKm ? 'កាលបរិច្ឆេទ & ម៉ោង' : 'Order Timestamp'}
            </span>
            <div className="font-bold text-slate-900 text-[11px]">{new Date(order.created_at).toLocaleDateString()}</div>
            <div className="text-[10px] text-slate-500 font-mono">{new Date(order.created_at).toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Provider Dispatch Details & Delivery Token */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600" /> {isKm ? 'អ្នកផ្គត់ផ្គង់ & Route' : 'Upstream Provider & Route'}:
            </span>
            <span className="font-bold text-blue-700 uppercase">{order.provider_id || 'Bay2Game API'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">{isKm ? 'លេខ Order ពី Provider' : 'Provider Order ID'}:</span>
            <span className="font-mono text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {order.provider_order_id || `B2G-${order.id}`}
            </span>
          </div>

          {order.delivery_code && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{isKm ? 'លេខកូដដឹកជញ្ជូន (Delivery Token)' : 'Delivery Code'}:</span>
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 select-all">
                {order.delivery_code}
              </span>
            </div>
          )}
        </div>

        {/* Actions & Troubleshooting */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Check Status */}
            <button
              onClick={() => onCheckStatus(order.id)}
              disabled={actionLoading === `check-${order.id}`}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${actionLoading === `check-${order.id}` ? 'animate-spin' : ''}`} />
              <span>{isKm ? 'ពិនិត្យពី Provider' : 'Check Provider Status'}</span>
            </button>

            {/* Safe Retry Order with Idempotency Guard */}
            {order.status !== 'success' && order.status !== 'refunded' && (
              <button
                onClick={() => onRetryOrder(order.id)}
                disabled={actionLoading === `retry-${order.id}`}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Zap className={`w-3.5 h-3.5 ${actionLoading === `retry-${order.id}` ? 'animate-spin' : ''}`} />
                <span>{isKm ? 'បញ្ជូនម្ដងទៀត (Safe Retry)' : 'Safe Retry Dispatch'}</span>
              </button>
            )}

            {/* Refund Order */}
            {order.status !== 'refunded' && (
              <button
                onClick={() => setShowRefundInput(!showRefundInput)}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors border border-purple-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                <span>{isKm ? 'សងប្រាក់វិញ' : 'Issue Refund'}</span>
              </button>
            )}
          </div>

          {showRefundInput && (
            <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2 animate-in fade-in">
              <label className="text-xs font-bold text-purple-900 block">
                {isKm ? 'មូលហេតុនៃការសងប្រាក់វិញ (Reason for Refund):' : 'Reason for Refund:'}
              </label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder={isKm ? "ឧទាហរណ៍៖ អតិថិជនបញ្ចូលខុស UID" : "e.g. Invalid UID / Server unreachable"}
                className="w-full px-3 py-2 text-xs bg-white border border-purple-300 rounded-xl text-slate-800 focus:outline-none focus:border-purple-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRefundInput(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    onRefundOrder(order.id, refundReason);
                    setShowRefundInput(false);
                  }}
                  disabled={actionLoading === `refund-${order.id}`}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  {actionLoading === `refund-${order.id}` ? (isKm ? 'កំពុងសងប្រាក់...' : 'Refunding...') : (isKm ? 'យល់ព្រមសងប្រាក់' : 'Confirm Refund')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_modal_code)

print('OrderDetailModal updated with official invoice slip!')
