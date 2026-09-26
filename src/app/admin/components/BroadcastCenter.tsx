'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Send, Trash2, Megaphone, CheckCircle2, ShieldAlert, Info, Sparkles, RefreshCw, Users, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  target_role: string;
  type: string;
  send_telegram: boolean;
  recipients_count: number;
  created_at: string;
  banner_url?: string;
  link?: string;
}

interface BroadcastCenterProps {
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export default function BroadcastCenter({ showToast }: BroadcastCenterProps) {
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'reseller' | 'user' | 'telegram'>('all');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'promo'>('info');
  const [sendTelegram, setSendTelegram] = useState(true);
  const [link, setLink] = useState('');

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/broadcasts');
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast(isKm ? 'សូមបញ្ចូលចំណងជើង និងសាររាយការណ៍' : 'Title and message are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          target_role: targetRole,
          type,
          send_telegram: sendTelegram,
          link: link.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || (isKm ? 'បានផ្ញើការជូនដំណឹង Broadcast រួចរាល់!' : 'Broadcast sent successfully!'), 'success');
        setTitle('');
        setMessage('');
        setLink('');
        loadBroadcasts();
      } else {
        showToast(data.detail || (isKm ? 'បរាជ័យក្នុងការផ្ញើ Broadcast' : 'Failed to send broadcast'), 'error');
      }
    } catch (err) {
      showToast(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ Server' : 'Failed to connect to server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដថាចង់លុប Broadcast នេះឬ?' : 'Delete this broadcast entry?')) return;
    try {
      const res = await fetch(`/api/v1/admin/broadcasts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(isKm ? 'បានលុប Broadcast រួចរាល់' : 'Broadcast removed', 'success');
        loadBroadcasts();
      }
    } catch (err) {
      showToast(isKm ? 'បរាជ័យក្នុងការលុប' : 'Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-black tracking-tight">
              {isKm ? 'មជ្ឈមណ្ឌលផ្សព្វផ្សាយសារ (Broadcast Center)' : 'Platform Broadcast Center'}
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            {isKm ? 'ផ្ញើសារប្រកាសអាសន្ន ការបញ្ចុះតម្លៃ ឬ ព័ត៌មានសំខាន់ៗទៅកាន់សមាជិកទាំងអស់តាម App និង Telegram' : 'Broadcast announcements, special promotions, or alerts to users via In-App & Telegram'}
          </p>
        </div>
        <button
          onClick={loadBroadcasts}
          className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isKm ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Radio className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-black text-slate-900">
              {isKm ? 'បង្កើតសារ Broadcast ថ្មី' : 'Compose New Broadcast'}
            </h3>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isKm ? 'ចំណងជើងសារ' : 'Broadcast Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isKm ? 'ឧទាហរណ៍: ការបញ្ចុះតម្លៃពិសេស ៥០%' : 'e.g. Special Weekend Promotion 50% Off'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isKm ? 'ក្រុមគោលដៅទទួលសារ (Target Audience)' : 'Target Audience'}
              </label>
              <select
                value={targetRole}
                onChange={(e: any) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="all">{isKm ? 'សមាជិកទាំងអស់ (All Users & Resellers)' : 'All Users & Resellers'}</option>
                <option value="reseller">{isKm ? 'តែ Resellers ប៉ុណ្ណោះ (Resellers Only)' : 'Resellers Only'}</option>
                <option value="user">{isKm ? 'តែ អតិថិជនធម្មតា (Regular Customers)' : 'Regular Customers Only'}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isKm ? 'ប្រភេទសារ (Notification Type)' : 'Notification Type'}
              </label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="info">{isKm ? 'ព័ត៌មានទូទៅ (General Info)' : 'General Info'}</option>
                <option value="promo">{isKm ? 'ការផ្សព្វផ្សាយ/បញ្ចុះតម្លៃ (Promotion)' : 'Promotion'}</option>
                <option value="warning">{isKm ? 'ការប្រុងប្រយ័ត្ន/ថែទាំប្រព័ន្ធ (Warning/Maintenance)' : 'Warning / Maintenance'}</option>
                <option value="success">{isKm ? 'ការជូនដំណឹងជោគជ័យ (Success Notice)' : 'Success Notice'}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isKm ? 'ខ្លឹមសារសារ (Message Content)' : 'Message Content'}
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isKm ? 'បញ្ចូលខ្លឹមសារលម្អិតនៃការប្រកាសផ្សព្វផ្សាយ...' : 'Write your announcement message here...'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-slate-900 leading-relaxed"
              />
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between">
              <span className="font-bold text-blue-900 text-xs">
                {isKm ? 'ផ្ញើតាម Telegram Bot ផងដែរ' : 'Send via Telegram Bot'}
              </span>
              <input
                type="checkbox"
                checked={sendTelegram}
                onChange={(e) => setSendTelegram(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>{isKm ? 'កំពុងផ្ញើ Broadcast...' : 'Sending Broadcast...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isKm ? 'ផ្ញើការជូនដំណឹង Broadcast' : 'Send Broadcast Announcement'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>{isKm ? 'ប្រវត្តិសាស្ត្រការផ្ញើ Broadcast' : 'Broadcast History'}</span>
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
              {broadcasts.length} {isKm ? 'សារ' : 'entries'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-medium">
              {isKm ? 'កំពុងទាញយកប្រវត្តិ Broadcast...' : 'Loading broadcast history...'}
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium space-y-1">
              <Megaphone className="w-10 h-10 mx-auto text-slate-300" />
              <p>{isKm ? 'មិនទាន់មានប្រវត្តិ Broadcast នៅឡើយទេ' : 'No broadcasts sent yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        b.type === 'promo' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        b.type === 'warning' ? 'bg-red-100 text-red-800 border border-red-200' :
                        b.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {b.type}
                      </span>
                      <span className="text-xs font-black text-slate-900">{b.title}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {b.message}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isKm ? `អ្នកទទួល: ${b.recipients_count} នាក់` : `Target: ${b.target_role} (${b.recipients_count})`}</span>
                      </span>
                      {b.send_telegram && (
                        <span className="text-blue-600 font-bold">Telegram Active</span>
                      )}
                      <span className="font-mono text-slate-400">
                        {new Date(b.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBroadcast(b.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors self-end sm:self-center"
                    title={isKm ? 'លុបសារនេះ' : 'Delete entry'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
