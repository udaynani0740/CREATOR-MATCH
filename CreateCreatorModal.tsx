import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, AlertCircle } from 'lucide-react';
import type { Creator, PlatformType } from '../types.js';
import {
  getCountriesList,
  getStatesForCountry,
  getCitiesForState,
  getFlagForCountry,
} from '../data/locations.js';

interface CreateCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (creatorData: Partial<Creator>) => Promise<Creator>;
  onSuccess: (newCreator: Creator) => void;
}

const NICHES = [
  'Tech & Electronics',
  'Science & Education',
  'Filmmaking & Photo',
  'Health & Wellness',
  'Fashion & Lifestyle',
  'Food & Culinary',
  'Productivity & Business',
  'Gaming & Entertainment',
];

const PLATFORMS: PlatformType[] = ['YouTube', 'Instagram', 'TikTok', 'Podcast', 'Substack'];

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
];

export const CreateCreatorModal: React.FC<CreateCreatorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [niche, setNiche] = useState(NICHES[0]);
  const [primaryPlatform, setPrimaryPlatform] = useState<PlatformType>('YouTube');
  const [country, setCountry] = useState('United States');
  const [state, setState] = useState('New York');
  const [city, setCity] = useState('New York');
  const [followers, setFollowers] = useState('125000');
  const [engagementRate, setEngagementRate] = useState('4.8');
  const [averageViews, setAverageViews] = useState('45000');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(SAMPLE_AVATARS[0]);
  const [dedicatedRate, setDedicatedRate] = useState('15000');
  const [integratedRate, setIntegratedRate] = useState('8000');
  const [shortFormRate, setShortFormRate] = useState('4500');
  const [tagsStr, setTagsStr] = useState('Tech, Reviews, Creator');
  const [pastBrandsStr, setPastBrandsStr] = useState('Notion, Apple, Sony');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableStates = getStatesForCountry(country);
  const availableCities = getCitiesForState(country, state);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) {
      setError('Please provide at least a creator name and handle.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const pastBrands = pastBrandsStr
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);

      const fCount = Number(followers) || 10000;
      const eng = Number(engagementRate) || 4.5;
      const views = Number(averageViews) || Math.round(fCount * 0.2);

      const creatorData: Partial<Creator> = {
        name: name.trim(),
        handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
        niche,
        primaryPlatform,
        verified: true,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1c1917&color=fafaf9`,
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
        headline: headline.trim() || `${niche} creator producing engaging, authentic content.`,
        bio: bio.trim() || `Creator focused on ${niche.toLowerCase()}, sharing insightful breakdowns and stories with a dedicated global audience.`,
        location: {
          city: city.trim() || 'New York',
          state: state.trim() || 'New York',
          country: country.trim() || 'United States',
          flag: getFlagForCountry(country),
        },
        followers: fCount,
        engagementRate: eng,
        averageViews: views,
        channels: [
          {
            platform: primaryPlatform,
            handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
            followers: fCount,
            url: `https://${primaryPlatform.toLowerCase()}.com`,
          },
        ],
        collaborationRates: {
          dedicatedVideo: Number(dedicatedRate) || undefined,
          integratedSegment: Number(integratedRate) || undefined,
          shortForm: Number(shortFormRate) || undefined,
          currency: 'USD',
        },
        tags: tags.length ? tags : [niche, 'Creator'],
        pastBrands: pastBrands.length ? pastBrands : ['Verified Partners'],
      };

      const created = await onSubmit(creatorData);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save creator profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900">
                Register New Creator Profile
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Published immediately to the verified network directory.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sara Dietschy"
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 placeholder:text-stone-600 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Handle *
                </label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. @saradietschy"
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 placeholder:text-stone-600 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Platform & Niche */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Platform
                </label>
                <select
                  value={primaryPlatform}
                  onChange={(e) => setPrimaryPlatform(e.target.value as PlatformType)}
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Niche / Category
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                >
                  {NICHES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location (Country, State/Region, City) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Location (Country, State/Region, City) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={country}
                  onChange={(e) => {
                    const newC = e.target.value;
                    setCountry(newC);
                    const states = getStatesForCountry(newC);
                    if (states.length) {
                      setState(states[0]);
                      const cities = getCitiesForState(newC, states[0]);
                      setCity(cities[0] || '');
                    } else {
                      setState('');
                      setCity('');
                    }
                  }}
                  className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                >
                  {getCountriesList().map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={state}
                  onChange={(e) => {
                    const newS = e.target.value;
                    setState(newS);
                    const cities = getCitiesForState(country, newS);
                    setCity(cities[0] || '');
                  }}
                  className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Followers
                </label>
                <input
                  type="number"
                  min="1"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  placeholder="125000"
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Engagement %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={engagementRate}
                  onChange={(e) => setEngagementRate(e.target.value)}
                  placeholder="4.8"
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Avg. Views
                </label>
                <input
                  type="number"
                  min="0"
                  value={averageViews}
                  onChange={(e) => setAverageViews(e.target.value)}
                  placeholder="45000"
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Headline / One-Liner
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. High-energy hardware teardowns and workplace setup tours"
                className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Bio / Description
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share the creator background, storytelling style, and audience connection..."
                className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none resize-none"
              />
            </div>

            {/* Avatar URL + presets */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none mb-2"
              />
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <span>Or select a sample portrait:</span>
                <div className="flex items-center gap-1.5">
                  {SAMPLE_AVATARS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Sample"
                      onClick={() => setAvatar(url)}
                      className={`h-7 w-7 rounded-full object-cover cursor-pointer ring-2 transition-all ${
                        avatar === url ? 'ring-stone-900 scale-105' : 'ring-transparent opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Collaboration Rates */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Collaboration Rate Estimates (USD)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="block text-[11px] text-stone-600 mb-1">Dedicated Video</span>
                  <input
                    type="number"
                    value={dedicatedRate}
                    onChange={(e) => setDedicatedRate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-stone-600 mb-1">Integrated (60s)</span>
                  <input
                    type="number"
                    value={integratedRate}
                    onChange={(e) => setIntegratedRate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-stone-600 mb-1">Short-Form</span>
                  <input
                    type="number"
                    value={shortFormRate}
                    onChange={(e) => setShortFormRate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tags and Past Brands */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="Tech, Photography, Gadgets"
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Past Brands (comma separated)
                </label>
                <input
                  type="text"
                  value={pastBrandsStr}
                  onChange={(e) => setPastBrandsStr(e.target.value)}
                  placeholder="Google, Notion, Sony"
                  className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>{loading ? 'Publishing Profile...' : 'Publish Profile'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
