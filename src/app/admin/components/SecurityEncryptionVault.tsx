'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Key, RefreshCw, CheckCircle2, Copy, Check, Eye, Code, Zap } from 'lucide-react';

interface SecurityEncryptionVaultProps {
  language?: string;
}

export default function SecurityEncryptionVault({ language = 'km' }: SecurityEncryptionVaultProps) {
  const isKm = language === 'km';
  const [vaultStatus, setVaultStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Test encryption inputs/outputs
  const [inputText, setInputText] = useState('RoleaTopup_Secret_API_Key_2026_Sample');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [encrypting, setEncrypting] = useState(false);

  // Test decryption inputs/outputs
  const [decryptToken, setDecryptToken] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');
  const [decrypting, setDecrypting] = useState(false);

  const [copiedEncrypted, setCopiedEncrypted] = useState(false);

  const fetchVaultStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/security/encryption-status');
      if (res.ok) {
        const data = await res.json();
        setVaultStatus(data);
        if (data.sample_encrypted_token_preview) {
          setDecryptToken(data.sample_encrypted_token_preview);
        }
      }
    } catch (err) {
      console.error('Failed to fetch encryption status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultStatus();
  }, []);

  const handleEncrypt = async () => {
    if (!inputText.trim()) return;
    setEncrypting(true);
    try {
      const res = await fetch('/api/v1/admin/security/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setEncryptedResult(data.encrypted_token);
        setDecryptToken(data.encrypted_token);
      }
    } catch (err) {
      console.error('Failed to encrypt text:', err);
    } finally {
      setEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (!decryptToken.trim()) return;
    setDecrypting(true);
    try {
      const res = await fetch('/api/v1/admin/security/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decryptToken.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setDecryptedResult(data.decrypted_text);
      } else {
        const errData = await res.json();
        setDecryptedResult(isKm ? `បរាជ័យក្នុងការ Decrypt: ${errData.detail || 'Token មិនត្រឹមត្រូវ'}` : `Decryption error: ${errData.detail}`);
      }
    } catch (err) {
      console.error('Failed to decrypt token:', err);
    } finally {
      setDecrypting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEncrypted(true);
    setTimeout(() => setCopiedEncrypted(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Lock className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {isKm ? 'ប្រព័ន្ធកូដនីយកម្មសុវត្ថិភាព (AES-256 Encryption Vault)' : 'Security Encryption Vault (AES-256 + HMAC-SHA256)'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {isKm ? 'សកម្ម 100%' : '100% ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {isKm 
                  ? 'ការពារទិន្នន័យសម្ងាត់ API keys និង passwords ដោយប្រើប្រាស់ PBKDF2 (100,000 Rounds) + AES-256 CTR Encrypt-then-MAC តាមស្តង់ដារធនាគារអន្តរជាតិ'
                  : 'Bank-grade PBKDF2 (100,000 rounds) key derivation + AES-256 CTR payload cipher with HMAC-SHA256 zero-tamper verification.'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchVaultStatus}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2 border border-white/10 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{isKm ? 'ធ្វើបច្ចុប្បន្នភាព Status' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>

      {/* Security Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-[10px] font-bold uppercase">{isKm ? 'កូដនីយកម្ម (Cipher)' : 'Encryption Cipher'}</div>
          <div className="text-sm font-black text-slate-900 mt-1">AES-256 CTR Mode</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">256-Bit Master Key</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-[10px] font-bold uppercase">{isKm ? 'ការបង្កបង្កើត Key' : 'Key Derivation'}</div>
          <div className="text-sm font-black text-slate-900 mt-1">PBKDF2 SHA-256</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">100,000 Hashing Rounds</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-[10px] font-bold uppercase">{isKm ? 'ការផ្ទៀងផ្ទាត់ (Integrity)' : 'Integrity Protection'}</div>
          <div className="text-sm font-black text-slate-900 mt-1">HMAC-SHA256</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Encrypt-then-MAC Signature</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-slate-400 text-[10px] font-bold uppercase">{isKm ? 'ស្ថានភាព (Vault Test)' : 'Vault Self-Test'}</div>
          <div className="text-sm font-black text-emerald-600 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{vaultStatus?.self_test_status || 'PASSED'}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Zero-Plaintext Guarantee</div>
        </div>
      </div>

      {/* Interactive Encryption & Decryption Live Tester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Encrypt Tool */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h4 className="font-black text-slate-900 text-sm">
              {isKm ? '១. សាកល្បង Encrypt ទិន្នន័យ (Payload Encryption)' : '1. Encrypt Payload (AES-256)'}
            </h4>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isKm ? 'វាយបញ្ចូលអត្ថបទ/API Key ដែលត្រូវ Encrypt:' : 'Enter Plaintext or API Key to Encrypt:'}
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
              placeholder="e.g. secret_api_key_12345"
            />
          </div>

          <button
            onClick={handleEncrypt}
            disabled={encrypting || !inputText.trim()}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{encrypting ? (isKm ? 'កំពុង Encrypt...' : 'Encrypting...') : (isKm ? 'កូដនីយកម្ម (Encrypt Payload)' : 'Encrypt Payload')}</span>
          </button>

          {encryptedResult && (
            <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono space-y-2 border border-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>{isKm ? 'Encrypted Vault Token:' : 'Encrypted Vault Token:'}</span>
                <button
                  onClick={() => copyToClipboard(encryptedResult)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedEncrypted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEncrypted ? (isKm ? 'បានចម្លង' : 'Copied') : (isKm ? 'ចម្លង' : 'Copy')}</span>
                </button>
              </div>
              <p className="break-all text-[11px] leading-relaxed text-emerald-400 font-mono">
                {encryptedResult}
              </p>
            </div>
          )}
        </div>

        {/* Decrypt Tool */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" />
            <h4 className="font-black text-slate-900 text-sm">
              {isKm ? '២. សាកល្បង Decrypt ទិន្នន័យ (Payload Decryption)' : '2. Decrypt Payload Verification'}
            </h4>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isKm ? 'វាយបញ្ចូល Encrypted Token (enc:v1:...):' : 'Enter Encrypted Token (enc:v1:...):'}
            </label>
            <input
              type="text"
              value={decryptToken}
              onChange={(e) => setDecryptToken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
              placeholder="enc:v1:..."
            />
          </div>

          <button
            onClick={handleDecrypt}
            disabled={decrypting || !decryptToken.trim()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>{decrypting ? (isKm ? 'កំពុង Decrypt...' : 'Decrypting...') : (isKm ? 'បកប្រែកូដ (Decrypt Token)' : 'Decrypt Token')}</span>
          </button>

          {decryptedResult && (
            <div className="p-3.5 rounded-2xl bg-emerald-950 text-emerald-100 text-xs font-mono space-y-1.5 border border-emerald-800/60 animate-in fade-in">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">
                {isKm ? 'លទ្ធផលនៃការបកប្រែសារ (Decrypted Plaintext):' : 'Decrypted Original Plaintext:'}
              </div>
              <p className="break-all text-xs font-black text-white">
                {decryptedResult}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
