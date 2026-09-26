'use client';

import React from 'react';
import { Category } from '@/types';
import { LayoutGrid, Smartphone, Monitor, Ticket, PhoneCall } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Games (ហ្គេមទាំងអស់)', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'mobile', label: 'Mobile Games (ហ្គេមទូរស័ព្ទ)', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'pc', label: 'PC Games & Steam (ហ្គេម PC)', icon: <Monitor className="w-4 h-4" /> },
    { id: 'voucher', label: 'Game Cards & Keys (កាតហ្គេម)', icon: <Ticket className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
      {categories.map((cat) => {
        const active = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              active
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 scale-[1.02]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
