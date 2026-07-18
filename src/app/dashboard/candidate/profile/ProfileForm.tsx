'use client';

import React, { useState, useRef } from 'react';
import { updateCandidateProfile, uploadResumeAction, getResumeSignedUrlAction } from './actions';
import { FileText, Upload, Trash2, CheckCircle2, AlertCircle, Sparkles, Plus, X } from 'lucide-react';

interface CandidateProfile {
  full_name: string;
  phone: string | null;
  location: string | null;
  skills: string[];
  experience_summary: string | null;
  resume_file_url: string | null;
}

export default function ProfileForm({ initialProfile }: { initialProfile: CandidateProfile }) {
  const [fullName, setFullName] = useState(initialProfile.full_name);
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [location, setLocation] = useState(initialProfile.location || '');
  const [experienceSummary, setExperienceSummary] = useState(initialProfile.experience_summary || '');
  const [skills, setSkills] = useState<string[]>(initialProfile.skills);
  const [skillInput, setSkillInput] = useState('');
  
  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Resume states
  const [resumePath, setResumePath] = useState<string | null>(initialProfile.resume_file_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Skill tag management
  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  // Profile save action
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const res = await updateCandidateProfile({
      fullName,
      phone,
      location,
      skills,
      experienceSummary,
    });

    setIsSaving(false);
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: res.message || 'Profile saved successfully!' });
    }
  };

  // Resume file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await processFile(file);
  };

  const processFile = async (file: File) => {
    // 1. Validation
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file format. Only PDF and Word (.docx) files are supported.' });
      return;
    }

    if (file.size > 5242880) { // 5MB
      setMessage({ type: 'error', text: 'File size exceeds the 5MB limit.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    // 2. Base64 conversion
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await uploadResumeAction({
        base64,
        name: file.name,
        type: file.type,
      });

      setIsUploading(false);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: res.message || 'Resume uploaded!' });
        // Simulating matching state refresh
        setResumePath(userPathFromFile(file.name));
      }
    };
    reader.readAsDataURL(file);
  };

  const userPathFromFile = (name: string) => {
    const ext = name.split('.').pop();
    return `resume.${ext}`;
  };

  // Download / View Resume via secure signed URL
  const handleViewResume = async () => {
    const res = await getResumeSignedUrlAction();
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else if (res.signedUrl) {
      window.open(res.signedUrl, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3 border border-blue-100">
          <Sparkles size={12} />
          Complete Your Profile
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Candidate Profile Info
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Build your professional identity to stand out and apply for top-tier global jobs seamlessly.
        </p>
      </div>

      {/* Action Messages */}
      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="flex-shrink-0 text-emerald-600" size={18} />
          ) : (
            <AlertCircle className="flex-shrink-0 text-red-600" size={18} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side - Profile Form */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-8 space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800 transition-all"
                placeholder="Jane Doe"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800 transition-all"
                placeholder="+91 9876543210"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Location (City, State / Country)
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800 transition-all"
                placeholder="Kochi, Kerala, India"
              />
            </div>
          </div>

          {/* Skills Management */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Professional Skills
            </label>
            
            {/* Tag container */}
            <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl bg-slate-50 min-h-[46px] items-center">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 pl-2">No skills added yet. Add skills below.</span>
              ) : (
                skills.map((skill, index) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200/80 shadow-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Tag adder input */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. ICU Nursing, Next.js"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-slate-800"
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>

          {/* Experience Summary */}
          <div className="space-y-1.5">
            <label htmlFor="experienceSummary" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Experience Summary
            </label>
            <textarea
              id="experienceSummary"
              rows={5}
              value={experienceSummary}
              onChange={(e) => setExperienceSummary(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800 transition-all resize-y"
              placeholder="Provide a brief summary of your work experience, certifications, and career highlights..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-6 py-3.5 rounded-xl text-xs tracking-wider uppercase transition-colors shadow-md hover:shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </div>
        </form>

        {/* Right Side - Resume Uploader */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Candidate Resume
            </h3>

            {resumePath ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-slate-800 truncate">
                      Saved Resume
                    </span>
                    <span className="block text-[10px] text-slate-400 truncate">
                      Stored in secure resumes folder
                    </span>
                  </div>
                </div>

                {/* Secure Signed URL View Trigger */}
                <button
                  type="button"
                  onClick={handleViewResume}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-2 px-3 border border-slate-200 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Upload size={13} className="rotate-180" />
                  View/Download Resume
                </button>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/50 border border-dashed border-amber-200 text-amber-800 rounded-xl text-center">
                <span className="block text-xs font-bold">No resume uploaded</span>
                <span className="block text-[10px] text-amber-600 mt-0.5">
                  Upload a resume below so employers can review your details.
                </span>
              </div>
            )}

            {/* Upload Zone */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Upload New Resume
              </label>

              {/* Fake dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50 ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Upload className="text-slate-400" size={24} />
                <div className="text-center">
                  <span className="block text-xs font-bold text-slate-700">
                    {isUploading ? 'Uploading...' : 'Click to Upload'}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Supports PDF, DOCX (Max 5MB)
                  </span>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
