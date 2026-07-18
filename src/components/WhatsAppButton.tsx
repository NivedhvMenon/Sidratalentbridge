'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappNumber = "917592833345";
  const defaultText = "Hello Sidra Talent Bridge, I would like to inquire about your services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultText)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} className="transition-transform group-hover:scale-110" />
      
      {/* Minimal Tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md whitespace-nowrap">
        Chat with us
      </span>
    </a>
  );
}
