'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function HeroSlideshow() {
  const images = [
    '/hero-1.png',
    '/hero-2.png',
    '/hero-3.png'
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 z-0 bg-slate-950">
      {images.map((src, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-90' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              alt={`Sidra Talent Bridge Banner ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        );
      })}
      
      {/* Gradients mask for high contrast readability and Apple aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/65 z-10" />
    </div>
  );
}
