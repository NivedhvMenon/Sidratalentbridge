'use client';

import React, { useState } from 'react';
import { sendContactEmail } from '@/app/contact/actions';
import { CONTACT_DETAILS } from '@/config/contact';
import { Phone, Mail, MapPin, Send, Loader2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await sendContactEmail(formData);
      if (result.error) {
        setStatus({ type: 'error', message: result.error });
      } else {
        setStatus({ type: 'success', message: result.message || 'Message sent!' });
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-black text-blue-600 mb-2 block">Get In Touch</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            We'd Love to Hear From You
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Have questions about applying for roles or sourcing candidate databases? Contact our representatives today.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Details Column (Left) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Contact cards */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-4">
                Office Information
              </h2>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">Phone Numbers</h3>
                    <div className="space-y-1 text-slate-600 text-sm">
                      {CONTACT_DETAILS.phones.map((phone, idx) => (
                        <p key={idx}>
                          <a href={phone.link} className="hover:text-blue-600 transition-colors">
                            {phone.value} ({phone.label})
                          </a>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Email Inquiry</h3>
                    <a
                      href={CONTACT_DETAILS.emailLink}
                      className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                    >
                      {CONTACT_DETAILS.email}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">Office Address</h3>
                    <div className="text-slate-600 text-sm leading-relaxed flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 text-xs">{CONTACT_DETAILS.companyName}</span>
                      <span>{CONTACT_DETAILS.address}</span>
                      <span className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">GSTIN: {CONTACT_DETAILS.gstin}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Iframe */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.4069352936746!2d76.08253167484924!3d11.608035287680016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba60c23945ea451%3A0xb3fc30164c05e197!2sKalpetta%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="280"
                style={{ border: 0, borderRadius: '1.25rem' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sidra Talent Bridge Wayanad Office Location"
              ></iframe>
            </div>

          </div>

          {/* Form Column (Right) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-lg">Send Message</h2>
                  <p className="text-xs text-slate-500">Expect a reply within 24 hours</p>
                </div>
              </div>

              {status.type && (
                <div className={`p-4 rounded-xl text-sm mb-6 ${
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Renjit Nair"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Your Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Subject *
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Sourcing Candidate Database, Overseas Placements Inquiry"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Message Body *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your query or placement requirements."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 active:scale-95 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-900/10"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
