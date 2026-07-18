import React from 'react';
import { Target, Compass, Sparkles, Award, ShieldAlert, Globe2, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  const pillars = [
    {
      icon: <Award size={20} className="text-amber-500" />,
      title: "Quality Talent",
      description: "Every candidate undergoes strict background checks, qualification verification, and multi-layered assessments before recommendation."
    },
    {
      icon: <HeartHandshake size={20} className="text-blue-500" />,
      title: "Ethical Practices",
      description: "We are committed to honest billing, regulatory compliance, and protecting candidates' rights against illegal recruitment fees."
    },
    {
      icon: <ShieldAlert size={20} className="text-indigo-500" />,
      title: "Industry Expertise",
      description: "Recruiters with hands-on domain experience lead our screening processes, assuring the perfect technical and behavioral fit."
    },
    {
      icon: <Globe2 size={20} className="text-emerald-500" />,
      title: "Pan-India & Global Reach",
      description: "With strong local networks in Southern and Central India and tie-ups in Gulf and European markets, we bridge domestic and overseas borders."
    }
  ];

  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-widest font-black text-blue-600 mb-2 block">Our Story</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Connecting Aspirations with Opportunity
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Sidra Talent Bridge was founded with a singular purpose: to establish a high-trust pathway for skilled professionals seeking domestic and overseas careers, while providing businesses with exceptionally verified, compliant workforce solutions.
          </p>
        </div>

        {/* Mission & Vision Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 text-base leading-relaxed">
              To empower candidates by matching them with ethical employers who value their skills, while offering organizations a premium, reliable recruitment service built on legal integrity, swift delivery, and expert talent evaluation.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-6">
              <Compass size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Our Vision</h2>
            <p className="text-slate-600 text-base leading-relaxed">
              To be recognized globally as the most trusted talent bridge between India and international employment markets, creating a transparent ecosystem where skill meets deserving progress.
            </p>
          </div>
        </div>

        {/* Core Values / Why Choose Us */}
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-16 text-white relative overflow-hidden shadow-xl">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl transform translate-x-20 translate-y-20" />
          <div className="relative z-10">
            <div className="max-w-3xl mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles size={12} className="text-amber-400" />
                The Sidra Standard
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Why Choose Sidra Talent Bridge?
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed text-sm sm:text-base">
                We go beyond traditional recruitment agencies. We treat placement as a partnership, ensuring both candidates and hiring managers have absolute confidence in the match.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              {pillars.map((pillar, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white">
                    {pillar.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg mb-2">{pillar.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
