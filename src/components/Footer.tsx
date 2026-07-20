import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Shield } from 'lucide-react';
import { CONTACT_DETAILS } from '@/config/contact';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative w-18 h-18 overflow-hidden rounded-xl bg-white p-1 shadow-sm shrink-0">
                <Image
                  src="/logo.png"
                  alt="Sidra Talent Bridge Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-white text-lg tracking-tight group-hover:text-blue-500 transition-colors">
                Sidra Talent Bridge
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              {CONTACT_DETAILS.tagline} Connecting talented professionals with leading employers across India and abroad.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3.5 pt-2">
              <a
                href={CONTACT_DETAILS.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href={CONTACT_DETAILS.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5"
                aria-label="Facebook Page"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href={CONTACT_DETAILS.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-purple-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5"
                aria-label="Instagram Account"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">Find Jobs</Link>
              </li>
              <li>
                <Link href="/employers" className="hover:text-white transition-colors">Hire Talent</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Sectors Serviced */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Industries</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Manufacturing & Retail</li>
              <li>Healthcare & IT Sector</li>
              <li>Hospitality & Tourism</li>
              <li>Construction & Engineering</li>
              <li>Overseas Placement (Jobs Abroad)</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contact Info</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-blue-500 shrink-0 mt-1" size={16} />
                <div className="flex flex-col gap-0.5 text-slate-400">
                  <span className="font-bold text-white text-xs">{CONTACT_DETAILS.companyName}</span>
                  <span className="leading-relaxed text-xs">{CONTACT_DETAILS.address}</span>
                  <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">GSTIN: {CONTACT_DETAILS.gstin}</span>
                </div>
              </li>
              <li className="flex flex-col gap-1">
                {CONTACT_DETAILS.phones.map((phone, idx) => (
                  <a
                    key={idx}
                    href={phone.link}
                    className="flex items-center gap-3 hover:text-white transition-colors"
                  >
                    <Phone className="text-blue-500 shrink-0" size={16} />
                    <span>{phone.value}</span>
                  </a>
                ))}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-blue-500 shrink-0" size={16} />
                <a href={CONTACT_DETAILS.emailLink} className="hover:text-white transition-colors">
                  {CONTACT_DETAILS.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {currentYear} Sidra Talent Bridge. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="flex items-center gap-1 hover:text-white transition-colors text-slate-500">
              <Shield size={12} />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
