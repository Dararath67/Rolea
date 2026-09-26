'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Key, Copy, Check, Lock, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  is2FAEnabled: boolean;
  onSuccess: (updatedUser: any) => void;
}

export default function TwoFactorModal({ isOpen, onClose, is2FAEnabled, onSuccess }: TwoFactorModalProps) {
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [step, setStep] = useState<'initial' | 'setup' | 'disable'>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secret, setSecret] = useState('');
  const [qrUri, setQrUri] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  if (!isOpen) return null;

  const getAuthToken = () => localStorage.getItem('rolea_token') || '';

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/user/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSecret(data.data.secret);
        setQrUri(data.data.qr_uri);
        setRecoveryCodes(data.data.recovery_codes || []);
        setStep('setup');
      } else {
        setError(data.detail || 'Failed to initialize 2FA setup.');
      }
    } catch (err) {
      setError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅ Server' : 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode.trim()) {
      setError(isKm ? 'សូមបញ្ចូលលេខកូដ 2FA 6 ខ្ទង់' : 'Please enter 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/user/2fa/verify-and-enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: verificationCode.trim(),
          secret: secret,
          recovery_codes: recoveryCodes
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.detail || (isKm ? 'លេខកូដ 2FA មិនត្រឹមត្រូវ' : 'Invalid 2FA code'));
      }
    } catch (err) {
      setError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅ Server' : 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/user/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: verificationCode.trim() })
      });
      const data = await res.json();
      if (data.success && data.user) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.detail || (isKm ? 'លេខកូដ 2FA មិនត្រឹមត្រូវ' : 'Invalid 2FA code'));
      }
    } catch (err) {
      setError(isKm ? 'បរាជ័យក្នុងការភ្ជាប់ទៅ Server' : 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isKm ? 'សុវត្ថិភាព 2FA (Two-Factor Authentication)' : 'Two-Factor Authentication (2FA)'}
            </h3>
            <p className="text-xs text-slate-500">
              {isKm ? 'ការពារគណនីរបស់អ្នកជាមួយ Google Authenticator' : 'Protect your account using 6-digit TOTP security code'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {step === 'initial' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>{isKm ? 'ស្ថានភាពបច្ចុប្បន្ន' : 'Current Status'}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${is2FAEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                  {is2FAEnabled ? (isKm ? 'បានបើក' : 'Active') : (isKm ? 'មិនទាន់បើក' : 'Disabled')}
                </span>
              </div>
              <p>
                {isKm 
                  ? '2FA បន្ថែមស្រទាប់ការពារសុវត្ថិភាព 99% ប្រឆាំងនឹងការលួចចូលប្រើគណនី ដោយតម្រូវឱ្យបញ្ចូលលេខកូដ 6 ខ្ទង់រាល់ពេលចូលប្រើប្រាស់។'
                  : '2FA adds a 99% security shield preventing unauthorized access by requiring a 6-digit TOTP code during login.'}
              </p>
            </div>

            {!is2FAEnabled ? (
              <button
                onClick={handleStartSetup}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                <span>{isKm ? 'រៀបចំ និង បើកដំណើរការ 2FA' : 'Setup & Enable 2FA Security'}</span>
              </button>
            ) : (
              <button
                onClick={() => setStep('disable')}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-red-600" />
                <span>{isKm ? 'បិទដំណើរការ 2FA' : 'Disable 2FA Security'}</span>
              </button>
            )}
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">
                {isKm ? '១. សោសម្ងាត់ 2FA (2FA Secret Key)' : '1. 2FA Secret Key'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={secret}
                  className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800"
                />
                <button
                  onClick={() => copyToClipboard(secret, 'secret')}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSecret ? (isKm ? 'បានចម្លង' : 'Copied') : (isKm ? 'ចម្លង' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {recoveryCodes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">
                    {isKm ? '២. លេខកូដសង្គ្រោះ (Recovery Codes)' : '2. Recovery Codes'}
                  </label>
                  <button
                    onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'codes')}
                    className="text-blue-600 hover:underline text-[11px] font-bold flex items-center gap-1"
                  >
                    {copiedCodes ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodes ? 'Saved' : 'Copy All'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-700 font-bold">
                  {recoveryCodes.map((c, idx) => (
                    <div key={idx} className="bg-white px-2 py-1 rounded border border-slate-200 text-center">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">
                {isKm ? '៣. បញ្ចូលលេខកូដ 6 ខ្ទង់ដើម្បីផ្ទៀងផ្ទាត់' : '3. Enter 6-Digit Code to Verify'}
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-base font-bold tracking-widest text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <button
              onClick={handleVerifyAndEnable}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isKm ? 'ផ្ទៀងផ្ទាត់ និង បើក 2FA' : 'Verify & Activate 2FA'}</span>
            </button>
          </div>
        )}

        {step === 'disable' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1">
              <p className="font-bold">{isKm ? 'តើអ្នកពិតជាចង់បិទ 2FA មែនទេ?' : 'Are you sure you want to disable 2FA?'}</p>
              <p className="text-[11px]">
                {isKm ? 'ការបិទ 2FA នឹងកាត់បន្ថយកម្រិតសុវត្ថិភាពគណនីរបស់អ្នក' : 'Disabling 2FA reduces account protection level.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">
                {isKm ? 'បញ្ចូលលេខកូដ 2FA 6 ខ្ទង់ដើម្បីបញ្ជាក់' : 'Enter 6-digit 2FA code to confirm'}
              </label>
              <input
                type="text"
                maxLength={10}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-base font-bold tracking-widest text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{isKm ? 'បញ្ជាក់ការបិទ 2FA' : 'Confirm Disable 2FA'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
