"use client";

import React from "react";
import Image from "next/image";

interface MascotParticle {
  id: number;
  src: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  duration: number;
  delay: number;
  opacity: number;
  blur?: string;
}

const MASCOT_ITEMS: MascotParticle[] = [
  { id: 1, src: "/images/rolea-logo.png", size: 48, top: "8%", left: "3%", duration: 7, delay: 0, opacity: 0.35 },
  { id: 2, src: "/images/logo-solid.png", size: 42, top: "22%", right: "4%", duration: 9, delay: 1.5, opacity: 0.35 },
  { id: 3, src: "/images/logo.png", size: 38, top: "45%", left: "2%", duration: 8, delay: 0.8, opacity: 0.3 },
  { id: 4, src: "/images/rolea-logo.png", size: 54, top: "62%", right: "3%", duration: 11, delay: 2, opacity: 0.3 },
  { id: 5, src: "/images/logo-solid.png", size: 44, top: "80%", left: "4%", duration: 7.5, delay: 0.5, opacity: 0.35 },
  { id: 6, src: "/images/logo.png", size: 36, top: "15%", left: "12%", duration: 10, delay: 3, opacity: 0.2 },
  { id: 7, src: "/images/rolea-logo.png", size: 40, top: "35%", right: "10%", duration: 8.5, delay: 1, opacity: 0.25 },
  { id: 8, src: "/images/logo-solid.png", size: 50, top: "72%", right: "12%", duration: 9.5, delay: 2.5, opacity: 0.25 },
  { id: 9, src: "/images/logo.png", size: 32, top: "90%", right: "6%", duration: 6.5, delay: 0.2, opacity: 0.3 },
  { id: 10, src: "/images/rolea-logo.png", size: 46, top: "52%", left: "5%", duration: 10.5, delay: 1.8, opacity: 0.28 },
];

export default function FloatingMascots() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      <style jsx global>{`
        @keyframes mascotFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-12px) rotate(4deg) scale(1.03);
          }
          50% {
            transform: translateY(-20px) rotate(-3deg) scale(1.05);
          }
          75% {
            transform: translateY(-8px) rotate(2deg) scale(1.02);
          }
        }
      `}</style>
      {MASCOT_ITEMS.map((item) => (
        <div
          key={item.id}
          className="absolute transition-transform ease-in-out"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            opacity: item.opacity,
            animation: `mascotFloat ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
            filter: item.blur ? `blur(${item.blur})` : "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08))",
          }}
        >
          <div className="relative rounded-full p-1 bg-white/40 backdrop-blur-[2px] border border-white/60 shadow-sm">
            <Image
              src={item.src}
              alt="Rolea Mascot particle"
              width={item.size}
              height={item.size}
              className="rounded-full object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
