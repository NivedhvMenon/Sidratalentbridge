'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Filter, RefreshCw, Globe, MapPin, Briefcase } from 'lucide-react';

interface JobFiltersProps {
  initialFilters: {
    q: string;
    category: string;
    location: string;
    type: string;
    abroad: boolean;
  };
}

export default function JobFilters({ initialFilters }: JobFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialFilters.q);
  const [category, setCategory] = useState(initialFilters.category);
  const [location, setLocation] = useState(initialFilters.location);
  const [type, setType] = useState(initialFilters.type);
  const [abroad, setAbroad] = useState(initialFilters.abroad);

  // Sync state with URL changes (e.g. back navigation or resets)
  useEffect(() => {
    setQ(initialFilters.q);
    setCategory(initialFilters.category);
    setLocation(initialFilters.location);
    setType(initialFilters.type);
    setAbroad(initialFilters.abroad);
  }, [initialFilters]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Construction', label: 'Construction & Engineering' },
    { value: 'IT', label: 'IT & Software' },
    { value: 'Retail', label: 'Retail & Sales' },
    { value: 'Hospitality', label: 'Hospitality & Tourism' },
  ];

  const locations = [
    { value: '', label: 'All Locations' },
    { value: 'Kochi', label: 'Kochi, Kerala' },
    { value: 'Bangalore', label: 'Bangalore, KA' },
    { value: 'Mumbai', label: 'Mumbai, MH' },
    { value: 'Chennai', label: 'Chennai, TN' },
    { value: 'Abroad', label: 'Abroad (Global)' },
  ];

  const types = [
    { value: '', label: 'All Types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (q) params.set('q', q);
    else params.delete('q');

    if (category) params.set('category', category);
    else params.delete('category');

    if (location) params.set('location', location);
    else params.delete('location');

    if (type) params.set('type', type);
    else params.delete('type');

    if (abroad) params.set('abroad', 'true');
    else params.delete('abroad');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Apply filter immediately on select dropdown/checkbox updates
  useEffect(() => {
    applyFilters();
  }, [category, location, type, abroad]);

  const handleReset = () => {
    setQ('');
    setCategory('');
    setLocation('');
    setType('');
    setAbroad(false);
    
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <Filter size={18} className="text-blue-600" />
          Filter Jobs
        </h2>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
          Reset
        </button>
      </div>

      {/* 1. Keyword Search */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search job title, skills..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
        />
        <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
        <button type="submit" className="hidden" />
      </form>

      {/* 2. Category Select */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Briefcase size={12} />
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Location Select */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <MapPin size={12} />
          Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          {locations.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Employment Type Select */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Briefcase size={12} />
          Job Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Abroad Toggle */}
      <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
        <label htmlFor="abroad-toggle" className="flex items-center gap-2 cursor-pointer">
          <Globe size={16} className="text-amber-500" />
          <div>
            <span className="block text-sm font-bold text-slate-800">Jobs Abroad</span>
            <span className="block text-[10px] text-slate-400 leading-none">Show international listings</span>
          </div>
        </label>
        <div className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="abroad-toggle"
            checked={abroad}
            onChange={(e) => setAbroad(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
