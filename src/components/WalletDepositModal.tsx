"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Wallet, X, QrCode, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck, DollarSign } from "lucide-react";
import Image from "next/image";

interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess?: (newBalance: number) => void;
  initialAmount?: number;
}

const QUICK_AMOUNTS = [1.0, 2.0, 5.0, 6.0, 10.0, 20.0, 50.0];

export default function WalletDepositModal({
  isOpen,
  onClose,
  onDepositSuccess,
  initialAmount = 5.0,
}: WalletDepositModalProps) {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [qrData, setQrData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount);
      setCustomAmount("");
      setQrData(null);
      setIsSuccess(false);
      setErrorMessage("");
      setTimeLeft(900);
    }
  }, [isOpen, initialAmount]);

  // Countdown timer for active QR
  useEffect(() => {
    if (!qrData || isSuccess) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData, isSuccess]);

  // Polling for payment status
  useEffect(() => {
    if (!qrData || isSuccess || !qrData.transaction_id) return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/payments/vngzz/check-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id: qrData.transaction_id,
            order_id: qrData.order_id,
          }),
        });
        const data = await res.json();
        if (data.is_paid || data.state === "PAID") {
          completeDeposit(amount, qrData.transaction_id);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Poll check error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [qrData, isSuccess, amount]);

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomAmount("");
    setQrData(null);
    setErrorMessage("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
      setQrData(null);
      setErrorMessage("");
    }
  };

  const handleGenerateKHQR = async () => {
    if (amount <= 0) {
      setErrorMessage("Please select or enter a valid deposit amount.");
      return;
    }
    setIsGenerating(true);
    setErrorMessage("");

    try {
      const depositOrderId = `DEP-${Date.now()}`;
      const res = await fetch("/api/v1/payments/vngzz/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_usd: amount,
          order_id: depositOrderId,
          currency: "USD",
        }),
      });

      const data = await res.json();
      if (data.success && (data.data?.qr_image || data.data?.qr_string || data.qr_string || data.qr_image)) {
        const info = data.data || data;
        setQrData({
          order_id: depositOrderId,
          transaction_id: info.transaction_id || depositOrderId,
          qr_image: info.qr_image || "",
          qr_string: info.qr_string || "",
          md5: info.md5 || "",
          amount_usd: amount,
          amount_khr: Math.round(amount * 4100),
        });
        setTimeLeft(900);
      } else {
        // Mock / offline fallback QR
        setQrData({
          order_id: depositOrderId,
          transaction_id: depositOrderId,
          qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KHQR_ROLEA_WALLET_DEP_${amount}_USD`,
          qr_string: `KHQR_ROLEA_WALLET_DEP_${amount}_USD`,
          md5: `md5_${depositOrderId}`,
          amount_usd: amount,
          amount_khr: Math.round(amount * 4100),
        });
        setTimeLeft(900);
      }
    } catch (err: any) {
      // Offline fallback
      const depositOrderId = `DEP-${Date.now()}`;
      setQrData({
        order_id: depositOrderId,
        transaction_id: depositOrderId,
        qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KHQR_ROLEA_WALLET_DEP_${amount}_USD`,
        qr_string: `KHQR_ROLEA_WALLET_DEP_${amount}_USD`,
        md5: `md5_${depositOrderId}`,
        amount_usd: amount,
        amount_khr: Math.round(amount * 4100),
      });
      setTimeLeft(900);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeDeposit = async (amt: number, txId: string) => {
    setIsSuccess(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("rolea_token") || localStorage.getItem("rothz_token")) : null;
      let userId = "";
      try {
        const u = localStorage.getItem("rothz_user") || localStorage.getItem("rolea_user");
        if (u) userId = JSON.parse(u).id || "";
      } catch (e) {}

      if (token || userId) {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        const res = await fetch("/api/v1/user/wallet/deposit", {
          method: "POST",
          headers,
          body: JSON.stringify({
            amount_usd: amt,
            transaction_id: txId,
            user_id: userId,
          }),
        });
        const data = await res.json();
        if (data.wallet_usd !== undefined && onDepositSuccess) {
          onDepositSuccess(data.wallet_usd);
        }
      } else {
        // Guest / Demo local balance
        const currentBal = parseFloat(localStorage.getItem("rolea_demo_wallet") || "0.0");
        const nextBal = currentBal + amt;
        localStorage.setItem("rolea_demo_wallet", nextBal.toFixed(2));
        if (onDepositSuccess) {
          onDepositSuccess(nextBal);
        }
      }
    } catch (e) {
      console.error("Deposit confirmation error:", e);
    }
  };

  // Instant simulate payment for admin/demo testing
  const handleSimulatePayment = () => {
    if (!qrData) return;
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      completeDeposit(amount, qrData.transaction_id);
    }, 1200);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg my-auto rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Rolea Wallet Deposit</h2>
              <p className="text-xs text-slate-500 font-medium">បញ្ចូលទឹកប្រាក់ក្នុងកាបូប (ABA PayWay KHQR 0% Fee)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-white max-h-[80vh] overflow-y-auto">
          {isSuccess ? (
            /* Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Deposit Completed!</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  ${amount.toFixed(2)} USD (≈ ៛{(amount * 4100).toLocaleString()} KHR) has been credited to your Rolea Wallet balance.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Transaction ID:</span>
                  <span className="font-mono text-slate-900 font-bold">{qrData?.transaction_id || "TXN-OK"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payment Gateway:</span>
                  <span className="text-slate-900 font-semibold">Rothz Payment ABA PayWay KHQR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="text-emerald-600 font-bold uppercase">Success (Instant)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-xs py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all cursor-pointer"
              >
                Done & Start Top-Up
              </button>
            </div>
          ) : qrData ? (
            /* Active QR View */
            <div className="space-y-4 text-center">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-700 font-bold">
                <span>Scan with ABA Mobile or any Bakong App</span>
                <span className="font-mono font-black">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* QR Container */}
              <div className="p-4 bg-white rounded-2xl inline-block shadow-md border border-slate-200">
                {qrData.qr_image ? (
                  <img
                    src={qrData.qr_image}
                    alt="ABA PayWay KHQR Code"
                    className="w-56 h-56 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl border border-slate-200">
                    <QrCode className="w-20 h-20 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-black text-slate-900">${amount.toFixed(2)} USD</div>
                <div className="text-xs font-bold text-blue-600 font-mono">
                  ≈ ៛{Math.round(amount * 4100).toLocaleString()} KHR
                </div>
                <div className="text-xs text-slate-500 font-medium">Merchant: Rolea TopUp Auto KHQR Hub</div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Listening for automatic payment confirmation...</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setQrData(null)}
                  className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Change Amount
                </button>
              </div>
            </div>
          ) : (
            /* Amount Selection View */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Deposit Amount (ជ្រើសរើសចំនួនទឹកប្រាក់)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {QUICK_AMOUNTS.map((val) => {
                    const isSelected = amount === val && !customAmount;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectAmount(val)}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-base font-black">${val.toFixed(2)}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          ៛{(val * 4100).toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Or Custom USD Amount (ឬ បញ្ចូលចំនួនផ្សេង)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    placeholder="e.g. 15.00"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-slate-900 text-sm font-semibold outline-none transition-all placeholder:text-slate-400 shadow-xs"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Features summary */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-blue-950 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Instant Wallet Balance</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Use your Rolea Wallet balance for 1-Click instant game top-ups without scanning QR codes for every order.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleGenerateKHQR}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating PayWay KHQR...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Generate PayWay KHQR (${amount.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
