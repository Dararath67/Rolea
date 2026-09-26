'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  X, 
  Send, 
  Headphones, 
  HelpCircle, 
  FileText, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LiveChatWidget() {
  const { language } = useLanguage();
  const isKm = language === 'km';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: isKm 
        ? 'ជំរាបសួរ! តើខ្ញុំអាចជួយអ្វីលោកអ្នកបានខ្លះអំពីការបញ្ចូលប្រាក់ហ្គេម ឬការពិនិត្យ Order?' 
        : 'Hello! How can I assist you today with game top-ups or order status?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    { label: isKm ? 'របៀបបញ្ចូលលុយតាម Bakong' : 'How to top up via Bakong', answer: isKm ? 'លោកអ្នកគ្រាន់តែជ្រើសរើសកញ្ចប់ហ្គេម បញ្ចូល Player ID រួច Scan Bakong KHQR នោះប្រព័ន្ធនឹងបញ្ចូលហ្គេមស្វ័យប្រវត្តក្នុង 30វិនាទី។' : 'Select your game package, enter Player ID, and scan the Bakong KHQR code. Delivery takes under 30 seconds automatically.' },
    { label: isKm ? 'ពិនិត្យស្ថានភាព Order' : 'Track Order Status', answer: isKm ? 'លោកអ្នកអាចចូលទៅកាន់ទំព័រ Track Order ឬចុច Menu "ពិនិត្យ Order" ដើម្បីស្វែងរកតាម Order ID របស់អ្នក។' : 'Go to Track Order page or click "Track Order" from the menu to search by your Order ID.' },
    { label: isKm ? 'ទាក់ទង Telegram Support' : 'Telegram Support', answer: isKm ? 'លោកអ្នកអាចទាក់ទងមកកាន់ Telegram Support ផ្លូវការ @RoleaToP_bot ឬ Channel @RothzTopup បាន 24/7។' : 'Contact our official Telegram Support @RoleaToP_bot or join Channel @RothzTopup 24/7.' }
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Auto bot response
    setTimeout(() => {
      let botAnswer = isKm 
        ? 'សូមអរគុណសម្រាប់សាររបស់អ្នក! ប្រសិនបើលោកអ្នកត្រូវការជំនួយផ្ទាល់ សូមបង្កើត Support Ticket ឬទាក់ទង Telegram @RoleaToP_bot' 
        : 'Thank you for your inquiry! For direct human assistance, please create a Support Ticket or contact Telegram @RoleaToP_bot';

      const match = quickQuestions.find(q => q.label === text);
      if (match) {
        botAnswer = match.answer;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botAnswer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-2xl transition-all transform hover:scale-105 cursor-pointer ring-4 ring-blue-600/20"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-blue-600 animate-pulse" />
          </div>
          <span>{isKm ? 'ជំនួយផ្ទាល់ 24/7' : 'Live Support'}</span>
        </button>
      )}

      {/* Expanded Live Chat Window */}
      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-3xl w-80 sm:w-96 shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight">{isKm ? 'Rolea Support Assistant' : 'Rolea Support Assistant'}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-blue-100 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online 24/7</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-xl hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Support Links Banner */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold px-4">
            <Link
              href="/support/tickets"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isKm ? 'បង្កើត Ticket' : 'Support Ticket'}</span>
            </Link>
            <a
              href="https://t.me/RoleaToP_bot"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline flex items-center gap-1"
            >
              <span>Telegram @RoleaToP_bot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-mono px-1">{msg.time}</span>
              </div>
            ))}

            {/* Quick Questions Buttons */}
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                {isKm ? 'សំណួរញឹកញាប់:' : 'Quick Questions:'}
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.label)}
                  className="w-full text-left p-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-700 transition-colors flex items-center justify-between gap-2 shadow-2xs"
                >
                  <span className="truncate">{q.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isKm ? 'សរសេរសារ...' : 'Type a message...'}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
