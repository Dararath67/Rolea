'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send, 
  User, 
  ShieldCheck, 
  RefreshCw,
  ChevronRight,
  Tag,
  Paperclip,
  Image as ImageIcon,
  Video,
  Mic,
  MicOff,
  X,
  Bot,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  Check,
  ShoppingBag,
  DollarSign,
  Calendar,
  Sparkles,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  AtSign,
  Hash,
  SendHorizontal,
  CornerUpLeft,
  Copy,
  Edit2,
  Pin,
  PinOff,
  MoreVertical,
  CheckCheck,
  Plus
} from 'lucide-react';

interface TicketMessage {
  id: string;
  sender_role: 'user' | 'admin' | 'system';
  sender_name: string;
  message: string;
  attachments?: string[];
  reply_to?: {
    id: string;
    sender_name: string;
    message: string;
  };
  is_edited?: boolean;
  is_deleted?: boolean;
  created_at: string;
}

interface SupportTicket {
  id: string;
  reference?: string;
  ticket_number?: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  username?: string;
  email?: string;
  subject: string;
  category: 'order' | 'deposit' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  telegram_chat_id?: string;
  telegram_username?: string;
  telegram_photo_url?: string;
  channel?: 'website' | 'telegram';
  linked_user_id?: string;
  linked_username?: string;
  linked_email?: string;
  pinned_message_id?: string;
  messages: TicketMessage[];
}

interface UserSummary {
  id: string;
  username: string;
  email: string;
  wallet_usd: number;
  telegram_chat_id?: string;
  telegram_username?: string;
  telegram_photo_url?: string;
}

interface OrderSummary {
  id: string;
  user_id?: string;
  player_id?: string;
  game_slug?: string;
  game_name_en?: string;
  amount_usd?: number;
  price_usd?: number;
  status: string;
  created_at: string;
}

interface SupportTicketsTableProps {
  language?: string;
}

const getCleanName = (rawName?: string) => {
  if (!rawName) return 'Customer';
  return rawName.replace(/\s*\(@[^)]+\)/, '').trim() || 'Customer';
};

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
              className="max-w-[340px] max-h-[260px] object-cover rounded-xl border border-slate-200 cursor-pointer shadow-xs hover:scale-[1.02] transition-transform"
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
              className="max-w-[380px] max-h-[260px] rounded-xl border border-slate-200 shadow-xs bg-black"
            />
          );
        }

        if (isAudio) {
          return (
            <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 border border-slate-200 max-w-[320px]">
              <audio src={url} controls className="w-full h-8" />
            </div>
          );
        }

        return (
          <a
            key={idx}
            href={url}
            download={`file-${idx + 1}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-emerald-700 hover:bg-slate-200"
          >
            <Paperclip className="w-4 h-4" />
            <span>Attachment #{idx + 1}</span>
          </a>
        );
      })}
    </div>
  );
}

interface QuickReplyItem {
  id: string;
  title: string;
  text: string;
}

const DEFAULT_QUICK_REPLIES: QuickReplyItem[] = [
  { id: '1', title: 'Send payment QR', text: 'សូមផ្ញើរូបភាព ឬកូដ KHQR សម្រាប់ការទូទាត់។' },
  { id: '2', title: 'Confirm payment', text: 'ប្រព័ន្ធបានទទួលការទូទាត់ និងកំពុងដំណើរការ top-up ជូនលោកអ្នក!' },
  { id: '3', title: 'Share catalog', text: 'លោកអ្នកអាចមើលបញ្ជីហ្គេម និងកញ្ចប់តម្លៃបាននៅលើគេហទំព័ររបស់យើង។' },
  { id: '4', title: 'Out of stock', text: 'សូមអភ័យទោស កញ្ចប់នេះកំពុងដាច់ស្តុកបណ្តោះអាសន្ន។' },
];

export default function SupportTicketsTable({ language = 'km' }: SupportTicketsTableProps) {
  const isKm = language === 'km';
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [websiteUsers, setWebsiteUsers] = useState<UserSummary[]>([]);
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick replies state with localStorage persistence
  const [quickReplies, setQuickReplies] = useState<QuickReplyItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('admin_quick_replies');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Failed to load quick replies', e);
      }
    }
    return DEFAULT_QUICK_REPLIES;
  });

  // Quick reply modal state
  const [quickReplyModalOpen, setQuickReplyModalOpen] = useState(false);
  const [editingQuickReply, setEditingQuickReply] = useState<QuickReplyItem | null>(null);
  const [quickReplyForm, setQuickReplyForm] = useState({ title: '', text: '' });

  const saveQuickReplies = (newReplies: QuickReplyItem[]) => {
    setQuickReplies(newReplies);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('admin_quick_replies', JSON.stringify(newReplies));
      } catch (e) {
        console.error('Failed to save quick replies', e);
      }
    }
  };

  const handleOpenAddQuickReply = () => {
    setEditingQuickReply(null);
    setQuickReplyForm({ title: '', text: '' });
    setQuickReplyModalOpen(true);
  };

  const handleOpenEditQuickReply = (qr: QuickReplyItem) => {
    setEditingQuickReply(qr);
    setQuickReplyForm({ title: qr.title, text: qr.text });
    setQuickReplyModalOpen(true);
  };

  const handleDeleteQuickReply = (id: string) => {
    if (confirm(isKm ? 'តើអ្នកប្រាកដជាចង់លុប Quick Reply នេះមែនទេ?' : 'Are you sure you want to delete this quick reply?')) {
      const updated = quickReplies.filter(q => q.id !== id);
      saveQuickReplies(updated);
    }
  };

  const handleSaveQuickReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplyForm.title.trim() || !quickReplyForm.text.trim()) return;

    if (editingQuickReply) {
      const updated = quickReplies.map(q => q.id === editingQuickReply.id ? { ...q, title: quickReplyForm.title.trim(), text: quickReplyForm.text.trim() } : q);
      saveQuickReplies(updated);
    } else {
      const newItem: QuickReplyItem = {
        id: 'qr_' + Date.now(),
        title: quickReplyForm.title.trim(),
        text: quickReplyForm.text.trim()
      };
      saveQuickReplies([...quickReplies, newItem]);
    }
    setQuickReplyModalOpen(false);
  };

  // Widescreen Expansion Toggle
  const [isWidescreen, setIsWidescreen] = useState(false);

  // Filters & Search
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Manual Reply Toggle state per ticket
  const [manualReplyMap, setManualReplyMap] = useState<Record<string, boolean>>({});

  // Rich Chat Features State (Reply, Edit, Delete, Copy, Pin)
  const [replyToMessage, setReplyToMessage] = useState<TicketMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // User linking state
  const [selectedLinkUser, setSelectedLinkUser] = useState<string>('');
  const [linkingAccount, setLinkingAccount] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<string[]>([]);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevTicketIdRef = useRef<string | number | null>(null);
  const prevMsgCountRef = useRef<number>(0);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => {
      fetchTicketsSilently();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;

    const currentMsgCount = selectedTicket.messages?.length || 0;
    const ticketChanged = prevTicketIdRef.current !== selectedTicket.id;
    const msgCountIncreased = currentMsgCount > prevMsgCountRef.current;

    let isNearBottom = true;
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      isNearBottom = (scrollHeight - scrollTop - clientHeight) < 150;
    }

    if (ticketChanged || (msgCountIncreased && isNearBottom)) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }

    prevTicketIdRef.current = selectedTicket.id;
    prevMsgCountRef.current = currentMsgCount;
  }, [selectedTicket?.id, selectedTicket?.messages?.length]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        const tList: SupportTicket[] = data.data || data.tickets || [];
        setTickets(tList);
        if (data.users) setWebsiteUsers(data.users);
        if (data.all_orders) setAllOrders(data.all_orders);

        setSelectedTicket(prev => {
          if (!prev) return tList.length > 0 ? tList[0] : null;
          const updated = tList.find(t => t.id === prev.id);
          return updated || prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsSilently = async () => {
    try {
      const res = await fetch('/api/v1/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        const tList: SupportTicket[] = data.data || data.tickets || [];
        setTickets(tList);
        if (data.users) setWebsiteUsers(data.users);
        if (data.all_orders) setAllOrders(data.all_orders);

        setSelectedTicket(prev => {
          if (!prev) return null;
          const updated = tList.find(t => t.id === prev.id);
          return updated || prev;
        });
      }
    } catch (err) {
      // silent catch
    }
  };

  const startVoiceRecording = async () => {
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
          setReplyAttachments(prev => [...prev, base64Audio]);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setReplyAttachments(prev => [...prev, reader.result as string]);
        }
      };
    });
    e.target.value = '';
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!replyText.trim() && replyAttachments.length === 0) || submittingReply) return;

    setSubmittingReply(true);
    try {
      const payload: any = {
        message: replyText.trim() || (isKm ? 'បានផ្ញើប្រព័ន្ធផ្សព្វផ្សាយ/សំឡេង' : 'Sent media attachment'),
        attachments: replyAttachments
      };

      if (replyToMessage) {
        payload.reply_to = {
          id: replyToMessage.id,
          sender_name: replyToMessage.sender_name,
          message: replyToMessage.message
        };
      }

      const res = await fetch(`/api/v1/admin/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resData = await res.json();
        const updated = resData.data || resData;
        if (updated && updated.status === 'open') {
          updated.status = 'in_progress';
        }
        setSelectedTicket(updated);
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        setReplyText('');
        setReplyAttachments([]);
        setReplyToMessage(null);
      }
    } catch (err) {
      console.error('Failed to reply to ticket:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !editingMessage || !editingMessage.text.trim()) return;

    try {
      const res = await fetch(`/api/v1/admin/tickets/${selectedTicket.id}/messages/${editingMessage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editingMessage.text.trim() })
      });

      if (res.ok) {
        const resData = await res.json();
        const updated = resData.data;
        if (updated) {
          setSelectedTicket(updated);
          setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        }
        setEditingMessage(null);
      }
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedTicket || !confirm(isKm ? 'តើអ្នកពិតជាចង់លុបសារនេះមែនទេ?' : 'Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/v1/admin/tickets/${selectedTicket.id}/messages/${msgId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const resData = await res.json();
        const updated = resData.data;
        if (updated) {
          setSelectedTicket(updated);
          setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        }
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handlePinMessage = async (msgId: string | null) => {
    if (!selectedTicket) return;

    try {
      const res = await fetch(`/api/v1/admin/tickets/${selectedTicket.id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msgId })
      });

      if (res.ok) {
        const resData = await res.json();
        const updated = resData.data;
        if (updated) {
          setSelectedTicket(updated);
          setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        }
      }
    } catch (err) {
      console.error('Failed to pin message:', err);
    }
  };

  const handleCopyMessage = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket || updatingStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/v1/admin/tickets/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const resData = await res.json();
        const updated = resData.data || resData;
        setSelectedTicket(updated);
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        if (newStatus === 'closed' || newStatus === 'resolved') {
          alert(isKm ? 'បានបិទ Ticket និងផ្ញើសារប្រាប់អតិថិជនរួចរាល់!' : 'Ticket closed and alert sent to customer!');
        }
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLinkUserSubmit = async (userIdToLink: string) => {
    if (!selectedTicket || !userIdToLink || linkingAccount) return;

    setLinkingAccount(true);
    try {
      const res = await fetch(`/api/v1/admin/tickets/${selectedTicket.id}/link-user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userIdToLink })
      });

      if (res.ok) {
        const resData = await res.json();
        const updated = resData.data;
        if (updated) {
          setSelectedTicket(updated);
          setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
          alert(isKm ? 'បានភ្ជាប់ Ticket ជាមួយគណនីគេហទំព័រជោគជ័យ!' : 'Successfully linked ticket to website user!');
        }
      }
    } catch (err) {
      console.error('Failed to link user:', err);
    } finally {
      setLinkingAccount(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដជាចង់លុប Ticket នេះមែនទេ?' : 'Are you sure you want to delete this ticket?')) return;
    try {
      const res = await fetch(`/api/v1/admin/tickets/${ticketId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    }
  };

  const toggleManualReply = (ticketId: string) => {
    setManualReplyMap(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const insertQuickReply = (text: string) => {
    setReplyText(prev => (prev ? `${prev} ${text}` : text));
  };

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesRead = 
        readFilter === 'all' || 
        (readFilter === 'unread' && ticket.status === 'open') ||
        (readFilter === 'read' && ticket.status !== 'open');
      const refNum = (ticket.reference || ticket.ticket_number || ticket.id || '').toLowerCase();
      const uname = (ticket.username || ticket.user_name || '').toLowerCase();
      const tgUname = (ticket.telegram_username || '').toLowerCase();
      const matchesSearch = 
        refNum.includes(searchQuery.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uname.includes(searchQuery.toLowerCase()) ||
        tgUname.includes(searchQuery.toLowerCase());
      return matchesRead && matchesSearch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.updated_at || a.created_at).getTime();
      const timeB = new Date(b.updated_at || b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const getLinkedCustomer = () => {
    if (!selectedTicket) return null;
    const linkedId = selectedTicket.linked_user_id;
    if (linkedId) {
      return websiteUsers.find(u => u.id === linkedId || u.username === linkedId) || null;
    }
    if (selectedTicket.telegram_chat_id) {
      return websiteUsers.find(u => u.telegram_chat_id === selectedTicket.telegram_chat_id) || null;
    }
    return null;
  };

  const activeCustomer = getLinkedCustomer();

  const getCustomerOrders = () => {
    if (!selectedTicket) return [];
    if (activeCustomer) {
      return allOrders.filter(o => o.user_id === activeCustomer.id);
    }
    const tgId = selectedTicket.telegram_chat_id ? String(selectedTicket.telegram_chat_id) : '';
    const uId = selectedTicket.user_id ? String(selectedTicket.user_id) : '';
    if (tgId || uId) {
      return allOrders.filter(o => 
        (tgId && (String(o.player_id) === tgId || String((o as any).chat_id) === tgId || String((o as any).telegram_chat_id) === tgId)) ||
        (uId && String(o.user_id) === uId)
      );
    }
    return [];
  };

  const customerOrders = getCustomerOrders();
  const totalSpent = customerOrders.reduce((acc, o) => acc + (o.amount_usd || o.price_usd || 0), 0);
  const unreadCount = tickets.filter(t => t.status === 'open').length;
  const isSelectedManualReply = selectedTicket ? !!manualReplyMap[selectedTicket.id] : false;

  const pinnedMsg = selectedTicket?.pinned_message_id 
    ? selectedTicket.messages.find(m => m.id === selectedTicket.pinned_message_id) 
    : null;

  return (
    <div className="space-y-4">
      {/* Toast Alert for Copying Message */}
      {copiedToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          {isKm ? 'បានចម្លងសាររៀបរយ!' : 'Copied message to clipboard!'}
        </div>
      )}

      {/* Pixel-Perfect Widescreen Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Inbox</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isKm ? 'គ្រប់សារសន្ទនាទាំងអស់រៀបចំយ៉ាងស្អាតទូលាយ' : 'All caught up'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white shadow-2xs">
              All {tickets.length}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white text-emerald-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
              <span>Rolea Topup</span>
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center">
                {unreadCount || 1}
              </span>
            </span>
          </div>

          <button
            onClick={fetchTickets}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title={isKm ? 'ថ្មីឡើងវិញ' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsWidescreen(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {isWidescreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isWidescreen ? (isKm ? 'បង្ហាញ Sidebar' : 'Show Sidebar') : (isKm ? 'ពង្រីក Full Width' : 'Full Widescreen')}</span>
          </button>
        </div>
      </div>

      {/* 3-Panel Main Widescreen Layout Container */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 min-h-[860px]">
        
        {/* PANEL 1: Left Chat List (3 cols - pushed neatly to the side!) */}
        <div className="lg:col-span-3 border-r border-slate-200 bg-white flex flex-col">
          {/* Search, Filter Tabs & Sort Controls */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isKm ? 'ស្វែងរកសារ...' : 'Search messages...'}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100/90 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setReadFilter('all')}
                className={`flex-1 py-1.5 text-center rounded-lg transition-colors ${readFilter === 'all' ? 'bg-white text-emerald-800 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {isKm ? 'ទាំងអស់' : 'All'}
              </button>
              <button
                onClick={() => setReadFilter('unread')}
                className={`flex-1 py-1.5 text-center rounded-lg transition-colors ${readFilter === 'unread' ? 'bg-white text-emerald-800 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {isKm ? 'មិនទាន់អាន' : 'Unread'}
              </button>
              <button
                onClick={() => setReadFilter('read')}
                className={`flex-1 py-1.5 text-center rounded-lg transition-colors ${readFilter === 'read' ? 'bg-white text-emerald-800 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {isKm ? 'បានអាន' : 'Read'}
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1 font-medium">
              <span>Sort</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Ticket List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[820px]">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {isKm ? 'កំពុងទាញយក...' : 'Loading...'}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                {isKm ? 'មិនមានសារសន្ទនាទេ' : 'No messages found'}
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
                const photoUrl = t.telegram_photo_url;
                const cleanDisplayName = getCleanName(t.username || t.user_name);
                const initialLetter = cleanDisplayName[0].toUpperCase();
                const isManual = !!manualReplyMap[t.id];

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3.5 cursor-pointer relative ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : ''
                    }`}
                  >
                    {/* Extra Large Avatar with Telegram Overlay Badge */}
                    <div className="relative shrink-0 mt-0.5">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Telegram Profile"
                          className="w-13 h-13 rounded-full object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-full bg-emerald-800 text-white font-black text-lg flex items-center justify-center border border-emerald-900 shadow-2xs">
                          {initialLetter}
                        </div>
                      )}
                      {/* Telegram Plane Icon Badge Overlay */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-sky-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-2xs">
                        <SendHorizontal className="w-2.5 h-2.5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className="text-sm font-black text-slate-900 truncate">
                            {cleanDisplayName}
                          </h4>
                          {isManual && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                              Manual
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          {new Date(t.updated_at || t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate font-medium">
                        {lastMsg ? lastMsg.message : t.subject}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: Middle Active Chat Thread (6 cols normally or 9 cols in Widescreen Mode - EXPANDED WIDE!) */}
        <div className={`${isWidescreen ? 'lg:col-span-9' : 'lg:col-span-6'} border-r border-slate-200 bg-white flex flex-col justify-between transition-all duration-300 overflow-hidden`}>
          {selectedTicket ? (
            <>
              {/* Active Thread Header */}
              <div className="p-4.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    {selectedTicket.telegram_photo_url ? (
                      <img
                        src={selectedTicket.telegram_photo_url}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-black text-lg flex items-center justify-center">
                        {getCleanName(selectedTicket.username)[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        {getCleanName(selectedTicket.username || selectedTicket.user_name)}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                      <span>Telegram</span>
                      <span>-</span>
                      {selectedTicket.telegram_username ? (
                        <a
                          href={`https://t.me/${selectedTicket.telegram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          @{selectedTicket.telegram_username}
                        </a>
                      ) : (
                        <span>@{selectedTicket.telegram_chat_id || 'user'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed (Alert Telegram User)</option>
                  </select>

                  <button
                    type="button"
                    onClick={async () => {
                      const defaultOrd = selectedTicket.reference || selectedTicket.ticket_number || '';
                      const orderIdInput = prompt(isKm ? 'សូមបញ្ចូល Order ID ដែលត្រូវ Refund (ឧទាហរណ៍: RT-92066):' : 'Enter Order ID to refund for this ticket:', defaultOrd);
                      if (!orderIdInput || !orderIdInput.trim()) return;
                      try {
                        const res = await fetch(`/api/v1/admin/tickets/${selectedTicket.id}/attach-refund`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            order_id: orderIdInput.trim(),
                            reason: `Refund processed via Ticket #${selectedTicket.id}`
                          })
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(isKm ? `បាន Refund ទឹកប្រាក់សម្រាប់ Order ${orderIdInput} ចូល Wallet រួចរាល់ និងប្តូរស្ថានភាព Ticket ទៅជា Resolved!` : `Successfully refunded order ${orderIdInput} and resolved ticket!`);
                          fetchTickets();
                        } else {
                          alert(data.detail || data.message || 'Failed to refund order');
                        }
                      } catch (e) {
                        alert('Error processing refund for ticket');
                      }
                    }}
                    title={isKm ? 'Refund ទឹកប្រាក់តាម Order ID និងបញ្ចប់ Ticket' : 'Refund Order & Resolve Ticket'}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 text-xs font-bold transition-all border border-amber-200 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    <span>{isKm ? 'Refund & Resolve' : 'Refund Order'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                    title={isKm ? 'លុបសារនេះ' : 'Delete chat'}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Pinned Message Banner (If Any Message is Pinned) */}
              {pinnedMsg && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
                  <div className="flex items-center gap-2 truncate">
                    <Pin className="w-4 h-4 text-amber-600 shrink-0 fill-amber-500" />
                    <span className="font-bold shrink-0">{isKm ? 'សារប្រដាស់ទុក (Pinned):' : 'Pinned:'}</span>
                    <span className="truncate font-medium italic">"{pinnedMsg.message}"</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePinMessage(null)}
                    className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold shrink-0 cursor-pointer"
                    title={isKm ? 'ដោះ Pin' : 'Unpin'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Inline Edit Modal */}
              {editingMessage && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-emerald-800 shrink-0">{isKm ? 'កែប្រែសារ:' : 'Edit Message:'}</span>
                  <input
                    type="text"
                    value={editingMessage.text}
                    onChange={(e) => setEditingMessage({ ...editingMessage, text: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-medium text-slate-900 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleEditMessageSubmit}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 cursor-pointer shrink-0"
                  >
                    {isKm ? 'រក្សាទុក' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMessage(null)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Chat Messages Viewport (With FB-Style Reply, Edit, Delete, Copy, Pin Action Bar) */}
              <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto overflow-x-hidden space-y-4 max-h-[640px] bg-slate-50/50 no-scrollbar scrollbar-none [scrollbar-width:none]">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg) => {
                    const isAdmin = msg.sender_role === 'admin';
                    const isSystem = msg.sender_role === 'system';
                    const isPinned = selectedTicket.pinned_message_id === msg.id;

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center py-2">
                          <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-300">
                            {msg.message}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        {/* Header Info */}
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1 px-1">
                          <span>{isAdmin ? 'Portal' : getCleanName(msg.sender_name)}</span>
                          <span>•</span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.is_edited && <span className="text-[10px] text-amber-600 font-medium italic">(edited)</span>}
                        </div>

                        {/* Relative Message Bubble Container */}
                        <div className="relative group max-w-[80%] sm:max-w-[75%]">
                          {/* FB-Style Quick Hover Action Menu Toolbar */}
                          <div className={`absolute top-1/2 -translate-y-1/2 ${
                            isAdmin ? '-left-2 -translate-x-full' : '-right-2 translate-x-full'
                          } opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-md z-20 shrink-0 whitespace-nowrap`}>
                            {/* Reply Button */}
                            <button
                              type="button"
                              onClick={() => setReplyToMessage(msg)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-emerald-700 cursor-pointer"
                              title={isKm ? 'ឆ្លើយតប (Reply)' : 'Reply'}
                            >
                              <CornerUpLeft className="w-3.5 h-3.5" />
                            </button>
                            {/* Copy Button */}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.message)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 cursor-pointer"
                              title={isKm ? 'ចម្លងសារ (Copy)' : 'Copy'}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {/* Pin Button */}
                            <button
                              type="button"
                              onClick={() => handlePinMessage(isPinned ? null : msg.id)}
                              className={`p-1 rounded hover:bg-slate-100 cursor-pointer ${isPinned ? 'text-amber-600 fill-amber-500' : 'text-slate-600 hover:text-amber-600'}`}
                              title={isPinned ? (isKm ? 'ដោះ Pin' : 'Unpin') : (isKm ? 'Pin សារនេះ' : 'Pin message')}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            {/* Edit Button (Admin Only) */}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setEditingMessage({ id: msg.id, text: msg.message })}
                                className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-indigo-600 cursor-pointer"
                                title={isKm ? 'កែប្រែ (Edit)' : 'Edit'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-red-600 cursor-pointer"
                              title={isKm ? 'លុបសារ (Delete)' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Message Bubble */}
                          <div className={`p-4 rounded-2xl shadow-2xs space-y-1 ${
                            isAdmin 
                              ? 'bg-emerald-800 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                          }`}>
                            {/* Quote Replied Message preview inside bubble */}
                            {msg.reply_to && (
                              <div className={`p-2.5 rounded-lg mb-2 text-xs border-l-4 ${
                                isAdmin ? 'bg-emerald-900/80 border-emerald-300 text-emerald-100' : 'bg-slate-100 border-emerald-600 text-slate-700'
                              }`}>
                                <span className="font-bold block text-[10px] uppercase">{msg.reply_to.sender_name}</span>
                                <p className="truncate italic">{msg.reply_to.message}</p>
                              </div>
                            )}

                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            <AttachmentRenderer attachments={msg.attachments} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-slate-400">
                    {isKm ? 'មិនទាន់មានប្រវត្តិសារសន្ទនាទេ' : 'No message history'}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Replying-To Banner, Quick Action Chips & Reply Form Footer */}
              <div className="p-4.5 border-t border-slate-200 bg-white space-y-3">
                {/* Replying To Message Banner */}
                {replyToMessage && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                    <div className="flex items-center gap-2 truncate">
                      <CornerUpLeft className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-bold shrink-0">{isKm ? 'ឆ្លើយតបទៅកាន់' : 'Replying to'} {replyToMessage.sender_name}:</span>
                      <span className="truncate italic font-medium">"{replyToMessage.message}"</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyToMessage(null)}
                      className="p-1 text-slate-500 hover:text-slate-800 font-bold shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Action Chips with Add / Edit / Delete Controls */}
                <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-1.5 pt-0.5 text-xs font-bold no-scrollbar scrollbar-none [scrollbar-width:none]">
                  {quickReplies.map((qr) => (
                    <div key={qr.id} className="relative group shrink-0 inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => insertQuickReply(qr.text)}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors border border-slate-200 cursor-pointer pr-12 text-xs font-semibold"
                        title={qr.text}
                      >
                        {qr.title}
                      </button>
                      <div className="absolute right-1.5 flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenEditQuickReply(qr); }}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                          title={isKm ? 'កែប្រែ' : 'Edit'}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteQuickReply(qr.id); }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                          title={isKm ? 'លុប' : 'Delete'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleOpenAddQuickReply}
                    className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 whitespace-nowrap transition-colors border border-emerald-200 cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0"
                    title={isKm ? 'បន្ថែម Quick Reply ថ្មី' : 'Add new quick reply'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isKm ? 'បន្ថែម' : 'Add'}</span>
                  </button>
                </div>

                {/* Attachments Preview */}
                {replyAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {replyAttachments.map((att, idx) => (
                      <div key={idx} className="relative group inline-block">
                        {att.startsWith('data:image/') ? (
                          <img src={att} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                        ) : (
                          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 text-xs font-bold">
                            <Mic className="w-5 h-5" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Box Container */}
                <form onSubmit={handleReplySubmit} className="flex items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*,audio/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-emerald-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    title={isKm ? 'បញ្ចូលរូបថត ឬ File' : 'Attach file'}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold animate-pulse cursor-pointer"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>{recordingSeconds}s</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-slate-200 transition-colors cursor-pointer"
                      title={isKm ? 'ថតសំឡេង' : 'Voice note'}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={isKm ? 'សរសេរសារឆ្លើយតប...' : 'Write a message...'}
                      className="w-full pl-4 pr-32 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-900"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none hidden sm:inline">
                      Sends via Telegram bot
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={(!replyText.trim() && replyAttachments.length === 0) || submittingReply}
                    className="w-11 h-11 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <SendHorizontal className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {isKm ? 'ជ្រើសរើសសារដើម្បីចាប់ផ្តើមសន្ទនា' : 'Select a message to start conversation'}
              </h3>
            </div>
          )}
        </div>

        {/* PANEL 3: Right Sidebar Customer Profile & Link Account (3 cols, hidden when isWidescreen is true) */}
        {!isWidescreen && (
          <div className="lg:col-span-3 bg-white p-5 space-y-6 overflow-y-auto max-h-[820px] relative border-l border-slate-100">
            {selectedTicket ? (
              <>
                {/* Close Button Top Right */}
                <button
                  type="button"
                  onClick={() => setIsWidescreen(true)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Large Profile Header Circle & Handle */}
                <div className="text-center space-y-3 pb-4 border-b border-slate-100 pt-2">
                  <div className="relative inline-block">
                    {selectedTicket.telegram_photo_url ? (
                      <img
                        src={selectedTicket.telegram_photo_url}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-emerald-800 text-white font-black text-4xl flex items-center justify-center border-4 border-slate-100 shadow-md mx-auto">
                        {getCleanName(selectedTicket.username)[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {getCleanName(selectedTicket.username || selectedTicket.user_name)}
                    </h3>
                    {selectedTicket.telegram_username && (
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        @{selectedTicket.telegram_username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Stats Grid (3 columns) */}
                <div className="grid grid-cols-3 gap-2 text-center py-2.5 bg-slate-50/80 rounded-xl p-2 border border-slate-100">
                  <div>
                    <span className="block text-base font-black text-slate-900">{customerOrders.length}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">ORDERS</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="block text-base font-black text-emerald-600">${totalSpent.toFixed(2)}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">SPENT</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 truncate mt-1">
                      {customerOrders.length > 0 ? new Date(customerOrders[0].created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">LAST ORDER</span>
                  </div>
                </div>

                {/* Past Orders List */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    PAST ORDERS
                  </h4>
                  {customerOrders.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {customerOrders.slice(0, 5).map(o => (
                        <div key={o.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <span className="font-mono font-bold text-slate-800">#{o.id}</span>
                            <span className="block text-[10px] text-slate-400 font-medium">{o.game_name_en || o.game_slug}</span>
                          </div>
                          <span className="font-bold text-emerald-600">${(o.amount_usd || o.price_usd || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-center text-slate-400 font-medium">
                      No past orders recorded
                    </div>
                  )}
                </div>

                {/* Details Section with Green Circle Badges */}
                <div className="space-y-3.5 pt-3 border-t border-slate-100 text-xs">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    DETAILS
                  </h4>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      @
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] font-black text-slate-400 uppercase">USERNAME</span>
                      <span className="font-bold text-slate-900 truncate block text-xs">
                        {selectedTicket.telegram_username ? `@${selectedTicket.telegram_username}` : (selectedTicket.username || 'N/A')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      #
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] font-black text-slate-400 uppercase">TELEGRAM ID</span>
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        {selectedTicket.telegram_chat_id || selectedTicket.user_id || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <Clock className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] font-black text-slate-400 uppercase">FIRST SEEN</span>
                      <span className="font-medium text-slate-800 block text-xs">
                        {new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(selectedTicket.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* LINKED WEBSITE ACCOUNT ITEM */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="block text-[9px] font-black text-emerald-800 uppercase">
                        LINKED WEBSITE ACCOUNT
                      </span>
                    </div>
                    {activeCustomer ? (
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{activeCustomer.username}</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-emerald-700 text-white">
                            Linked
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">Balance: ${activeCustomer.wallet_usd.toFixed(2)} USD</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-1">
                        <span className="text-xs font-bold text-amber-800 block">Not Linked Yet</span>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={selectedLinkUser}
                            onChange={(e) => setSelectedLinkUser(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 w-full font-medium"
                          >
                            <option value="">-- Select User --</option>
                            {websiteUsers.map(u => (
                              <option key={u.id} value={u.id}>{u.username} (${u.wallet_usd.toFixed(2)})</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleLinkUserSubmit(selectedLinkUser)}
                            disabled={!selectedLinkUser || linkingAccount}
                            className="px-2.5 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-900 shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button: Open Telegram Profile */}
                <div className="pt-2">
                  <a
                    href={selectedTicket.telegram_username ? `https://t.me/${selectedTicket.telegram_username}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-2xs"
                  >
                    <span>Open Telegram profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 font-medium">
                Select a chat to view customer details
              </div>
            )}
          </div>
        )}

      </div>

      {/* Quick Reply Add / Edit Modal */}
      {quickReplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuickReply 
                  ? (isKm ? 'កែប្រែ Quick Reply' : 'Edit Quick Reply')
                  : (isKm ? 'បន្ថែម Quick Reply ថ្មី' : 'Add New Quick Reply')}
              </h3>
              <button
                type="button"
                onClick={() => setQuickReplyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickReplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isKm ? 'ចំណងជើង Pill (Label)' : 'Pill Title (Label)'}
                </label>
                <input
                  type="text"
                  required
                  value={quickReplyForm.title}
                  onChange={(e) => setQuickReplyForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={isKm ? 'ឧ. Send payment QR, Out of stock' : 'e.g. Send payment QR, Out of stock'}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isKm ? 'សារឆ្លើយតប (Message Content)' : 'Reply Message Content'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={quickReplyForm.text}
                  onChange={(e) => setQuickReplyForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder={isKm ? 'សរសេរសារដែលត្រូវផ្ញើទៅកាន់អតិថិជន...' : 'Write message text to send to customer...'}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickReplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {isKm ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl cursor-pointer shadow-xs"
                >
                  {isKm ? 'រក្សាទុក' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
