'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Headphones, 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search,
  Send,
  User,
  ShieldCheck,
  RefreshCw,
  X,
  FileText,
  Paperclip,
  Image as ImageIcon,
  Video,
  Mic,
  MicOff,
  Trash2
} from 'lucide-react';

function AttachmentRenderer({ attachments }: { attachments?: string[] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((url, idx) => {
        const isImage = url.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
        const isVideo = url.startsWith('data:video/') || /\.(mp4|webm|mov)$/i.test(url);
        const isAudio = url.startsWith('data:audio/') || /\.(mp3|wav|ogg|webm|m4a)$/i.test(url);

        if (isImage) {
          return (
            <img
              key={idx}
              src={url}
              alt="Uploaded photo"
              className="max-w-[240px] max-h-[180px] object-cover rounded-xl border border-slate-200 cursor-pointer shadow-xs hover:scale-[1.02] transition-transform"
              onClick={() => {
                const win = window.open();
                win?.document.write(`<img src="${url}" style="max-width:100%;height:auto;" />`);
              }}
            />
          );
        }

        if (isVideo) {
          return (
            <video
              key={idx}
              src={url}
              controls
              className="max-w-[280px] max-h-[180px] rounded-xl border border-slate-200 shadow-xs bg-black"
            />
          );
        }

        if (isAudio) {
          return (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 border border-slate-200 max-w-[280px]">
              <audio src={url} controls className="w-full h-8" />
            </div>
          );
        }

        return (
          <a
            key={idx}
            href={url}
            download={`file-${idx + 1}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-blue-600 hover:bg-slate-200"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attachment #{idx + 1}</span>
          </a>
        );
      })}
    </div>
  );
}

export default function SupportTicketsPage() {
  const { language } = useLanguage();
  const isKm = language === 'km';
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Create Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('order');
  const [priority, setPriority] = useState('medium');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [message, setMessage] = useState('');
  const [createAttachments, setCreateAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reply Form State
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<string[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

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
    loadTickets(uObj);
  }, []);

  const loadTickets = async (userOverride?: any) => {
    setLoading(true);
    try {
      const u = userOverride || currentUser;
      const userId = u?.id || u?.username || '';
      
      let localTicketIds: string[] = [];
      try {
        localTicketIds = JSON.parse(localStorage.getItem('my_created_tickets') || '[]');
      } catch (e) {}

      if (userId) {
        const res = await fetch(`/api/v1/tickets?user_id=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setTickets(data.data || []);
        }
      } else if (localTicketIds.length > 0) {
        // Fetch tickets created locally by ID for guest
        const fetched: any[] = [];
        for (const tId of localTicketIds) {
          try {
            const res = await fetch(`/api/v1/tickets/${encodeURIComponent(tId)}`);
            if (res.ok) {
              const d = await res.json();
              if (d.data) fetched.push(d.data);
            }
          } catch (e) {}
        }
        setTickets(fetched);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecording = async (target: 'create' | 'reply') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (target === 'reply') {
            setReplyAttachments(prev => [...prev, base64Audio]);
          } else {
            setCreateAttachments(prev => [...prev, base64Audio]);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert(isKm ? 'មិនអាចប្រើ Microphone បានទេ សូមពិនិត្យការអនុញ្ញាត Browser' : 'Microphone access denied or unavailable');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'create' | 'reply') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.size > 20 * 1024 * 1024) {
        alert(isKm ? 'ទំហំ File ត្រូវតែតូចជាង 20MB' : 'File size limit is 20MB');
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (reader.result) {
          if (target === 'reply') {
            setReplyAttachments(prev => [...prev, reader.result as string]);
          } else {
            setCreateAttachments(prev => [...prev, reader.result as string]);
          }
        }
      };
    });
    e.target.value = '';
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        subject: subject.trim(),
        category,
        priority,
        order_id: orderIdInput.trim() || undefined,
        message: message.trim(),
        attachments: createAttachments,
        user_id: currentUser?.id || 'guest',
        username: currentUser?.username || 'Gamer',
        email: currentUser?.email || 'customer@roleatopup.com'
      };

      const res = await fetch('/api/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreateOpen(false);
        setSubject('');
        setOrderIdInput('');
        setMessage('');
        setCreateAttachments([]);
        
        if (data.data && data.data.id) {
          try {
            const myIds = JSON.parse(localStorage.getItem('my_created_tickets') || '[]');
            if (!myIds.includes(data.data.id)) {
              myIds.push(data.data.id);
              localStorage.setItem('my_created_tickets', JSON.stringify(myIds));
            }
          } catch (e) {}
        }
        
        loadTickets();
        setSelectedTicket(data.data);
      } else {
        setFormError(data.detail || 'Failed to create support ticket');
      }
    } catch (err) {
      setFormError(isKm ? 'មិនអាចបង្កើត Ticket បានទេ' : 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!replyMessage.trim() && replyAttachments.length === 0)) return;

    setIsReplying(true);
    try {
      const payload = {
        message: replyMessage.trim() || (isKm ? 'បានផ្ញើប្រព័ន្ធផ្សព្វផ្សាយ/សំឡេង' : 'Sent media attachment'),
        attachments: replyAttachments,
        sender_role: 'user',
        sender_name: currentUser?.username || 'Customer'
      };

      const res = await fetch(`/api/v1/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReplyMessage('');
        setReplyAttachments([]);
        setSelectedTicket(data.data);
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'open':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">OPEN</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">IN PROGRESS</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">RESOLVED</span>;
      case 'closed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">CLOSED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">{st.toUpperCase()}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Headphones className="w-3.5 h-3.5 text-blue-600" />
              <span>{isKm ? 'ប្រព័ន្ធជំនួយអតិថិជន ២៤/៧' : 'Customer Helpdesk 24/7'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isKm ? 'ប្រព័ន្ធ Support Ticket' : 'Support Ticket Center'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {isKm ? 'ផ្ញើសំបុត្ររាយការណ៍បញ្ហាការទូទាត់ ឬ ស្នើសុំជំនួយពីក្រុមការងារ 24/7' : 'Submit tickets for order issues, payment deposits, or reseller inquiries'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <a
              href="https://t.me/RoleaToP_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-md transition-all cursor-pointer"
            >
              <span>{isKm ? 'Telegram Support (@RoleaToP_bot)' : 'Telegram Support (@RoleaToP_bot)'}</span>
            </a>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isKm ? 'បង្កើត Ticket ថ្មី' : 'Create New Ticket'}</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Layout: Ticket List + Conversation Thread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Ticket List */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{isKm ? 'ប្រវត្តិ Ticket របស់អ្នក' : 'Your Support Tickets'}</span>
              </div>
              <button
                onClick={loadTickets}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
                title={isKm ? 'ទាញយកឡើងវិញ' : 'Reload'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">
                  {isKm ? 'កំពុងទាញយកប្រវត្តិ...' : 'Loading ticket history...'}
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">
                  {isKm ? 'មិនទាន់មាន Support Ticket ទេ' : 'No support tickets found'}
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-blue-600">{t.reference || t.id}</span>
                          {getStatusBadge(t.status)}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{t.subject}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 uppercase font-bold text-[9px]">
                            {t.category}
                          </span>
                          <span>{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation View */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col min-h-[550px]">
            {selectedTicket ? (
              <>
                {/* Header detail */}
                <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-black text-blue-600">{selectedTicket.reference || selectedTicket.id}</span>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <h2 className="text-lg font-black text-slate-900">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {isKm ? 'ប្រភេទ:' : 'Category:'} <strong className="text-slate-800 uppercase">{selectedTicket.category}</strong> • 
                      {isKm ? ' កាលបរិច្ឆេទ:' : ' Created:'} <strong className="text-slate-800">{new Date(selectedTicket.created_at).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>

                {/* Message Thread History */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[480px]">
                  {selectedTicket.messages && selectedTicket.messages.map((msg: any) => {
                    const isAdmin = msg.sender_role === 'admin';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                          isAdmin ? 'bg-blue-600' : 'bg-slate-800'
                        }`}>
                          {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        <div className={`space-y-1 ${isAdmin ? 'text-left' : 'text-right'}`}>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
                            <span>{msg.sender_name}</span>
                            <span>•</span>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`p-4 rounded-2xl max-w-md text-xs font-medium leading-relaxed ${
                              isAdmin
                                ? 'bg-blue-50 text-slate-900 border border-blue-100 rounded-tl-none'
                                : 'bg-slate-900 text-white rounded-tr-none shadow-2xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            <AttachmentRenderer attachments={msg.attachments} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form Footer with Photo/Video/Audio recorder */}
                {selectedTicket.status !== 'closed' ? (
                  <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                    {/* Attachments Preview Bar */}
                    {replyAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-slate-200">
                        {replyAttachments.map((att, idx) => (
                          <div key={idx} className="relative group inline-block">
                            {att.startsWith('data:image/') ? (
                              <img src={att} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                            ) : att.startsWith('data:video/') ? (
                              <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px]">
                                <Video className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-blue-600 text-[10px]">
                                <Mic className="w-5 h-5" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,video/*,audio/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'reply')}
                      />

                      {/* Photo / Video / File Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                        title={isKm ? 'បញ្ចូលរូបថត ឬវីដេអូ' : 'Attach photo or video'}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>

                      {/* Microphone Voice Recorder */}
                      {isRecording ? (
                        <button
                          type="button"
                          onClick={stopVoiceRecording}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold animate-pulse"
                        >
                          <MicOff className="w-4 h-4" />
                          <span>{recordingSeconds}s (Stop)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startVoiceRecording('reply')}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors"
                          title={isKm ? 'ថតសំឡេង (Voice Note)' : 'Record voice note'}
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      )}

                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder={isKm ? 'វាយសារឆ្លើយតបនៅទីនេះ...' : 'Type your reply message...'}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
                      />

                      <button
                        type="submit"
                        disabled={isReplying || (!replyMessage.trim() && replyAttachments.length === 0)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isReplying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{isKm ? 'ផ្ញើសារ' : 'Send'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 border-t border-slate-200 text-center text-xs font-bold text-slate-500 bg-slate-50">
                    {isKm ? 'Ticket នេះត្រូវបិទបញ្ចប់ហើយ' : 'This ticket has been closed.'}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
                <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
                <h3 className="font-bold text-sm text-slate-700 mb-1">
                  {isKm ? 'ជ្រើសរើស Ticket ដើម្បីមើលការសន្ទនា' : 'Select a ticket to view messages'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  {isKm 
                    ? 'សូមចុចលើ Ticket ខាងឆ្វេង ឬ ចុចប៊ូតុង បង្កើត Ticket ថ្មី ដើម្បីផ្ញើសំនួរទៅកាន់ក្រុមការងារ' 
                    : 'Click on a ticket from the left panel or click Create New Ticket to start a conversation.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Create New Support Ticket */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isKm ? 'បង្កើត Support Ticket ថ្មី' : 'Create New Support Ticket'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isKm ? 'ប្រធានបទ (Subject):' : 'Subject:'}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={isKm ? 'ឧទាហរណ៍: មិនទាន់ទទួលបានពេជ្រក្នុងហ្គេម MLBB' : 'e.g. Diamond top-up delayed'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isKm ? 'ប្រភេទបញ្ហា (Category):' : 'Category:'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="order">{isKm ? 'បញ្ហាការបញ្ជាទិញ (Order)' : 'Order Issue'}</option>
                      <option value="deposit">{isKm ? 'បញ្ហាបញ្ចូលលុយ (Deposit)' : 'Payment Deposit'}</option>
                      <option value="account">{isKm ? 'បញ្ហាគណនី (Account)' : 'Account / Reseller'}</option>
                      <option value="general">{isKm ? 'សំនួរទូទៅ (General)' : 'General Inquiry'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isKm ? 'អាទិភាព (Priority):' : 'Priority:'}
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="low">{isKm ? 'ទាប (Low)' : 'Low'}</option>
                      <option value="medium">{isKm ? 'មធ្យម (Medium)' : 'Medium'}</option>
                      <option value="high">{isKm ? 'ខ្ពស់ (High)' : 'High'}</option>
                      <option value="urgent">{isKm ? 'បន្ទាន់ (Urgent)' : 'Urgent'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isKm ? 'Order ID (បើមាន):' : 'Order ID (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    placeholder="e.g. ORD-17272019"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isKm ? 'ព័ត៌មានលម្អិត (Message):' : 'Message Details:'}
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isKm ? 'រៀបរាប់ពីបញ្ហាដែលលោកអ្នកបានជួបប្រទះ...' : 'Describe your issue or question in detail...'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                {/* Create Ticket File & Voice Attachment */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    {isKm ? 'ភ្ជាប់រូបថត វីដេអូ ឬសំឡេង (Attachment):' : 'Attach Photo, Video or Voice Note:'}
                  </label>
                  
                  {createAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {createAttachments.map((att, idx) => (
                        <div key={idx} className="relative group inline-block">
                          {att.startsWith('data:image/') ? (
                            <img src={att} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                          ) : (
                            <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-blue-600 text-[10px]">
                              <Paperclip className="w-4 h-4" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setCreateAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>{isKm ? 'ជ្រើសរើស File' : 'Select Files'}</span>
                      <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'create')}
                      />
                    </label>

                    {isRecording ? (
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold animate-pulse"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>{recordingSeconds}s (Stop)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startVoiceRecording('create')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                      >
                        <Mic className="w-4 h-4 text-red-600" />
                        <span>{isKm ? 'ថតសំឡេង' : 'Voice Note'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                    {formError}
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    {isKm ? 'បោះបង់' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (isKm ? 'កំពុងបង្កើត...' : 'Creating...') : (isKm ? 'ផ្ញើសំបុត្រ' : 'Submit Ticket')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
