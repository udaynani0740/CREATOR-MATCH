import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  LogIn,
  Briefcase,
  UserCheck,
  Building2,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type { UserSession, PlatformType } from '../types.js';
import {
  getCountriesList,
  getStatesForCountry,
  getCitiesForState,
  getFlagForCountry,
} from '../data/locations.js';
import { loginBrand, loginCreator } from '../api.js';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: UserSession) => void;
  initialRole?: 'brand' | 'creator';
}

const BRAND_INDUSTRIES = [
  'Fashion & Apparel',
  'Technology & Software',
  'Health, Wellness & Fitness',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Gaming & Entertainment',
  'Consumer Electronics',
];

const BUDGET_RANGES = [
  'Under $10,000 / mo',
  '$10,000 – $50,000 / mo',
  '$50,000 – $150,000 / mo',
  '$150,000+ / mo',
];

const CREATOR_NICHES = [
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

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'brand',
}) => {
  const [role, setRole] = useState<'brand' | 'creator'>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // BRAND LOGIN FIELDS
  const [brandEmail, setBrandEmail] = useState('');
  const [brandCompany, setBrandCompany] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandIndustry, setBrandIndustry] = useState(BRAND_INDUSTRIES[0]);
  const [brandWebsite, setBrandWebsite] = useState('');
  const [brandBudget, setBrandBudget] = useState(BUDGET_RANGES[1]);
  const [brandCountry, setBrandCountry] = useState('United States');
  const [brandState, setBrandState] = useState('New York');
  const [brandCity, setBrandCity] = useState('New York');
  const [brandPassword, setBrandPassword] = useState('');

  // CREATOR LOGIN FIELDS
  const [creatorEmail, setCreatorEmail] = useState('');
  const [creatorPassword, setCreatorPassword] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [creatorPlatform, setCreatorPlatform] = useState<PlatformType>('YouTube');
  const [creatorProfileUrl, setCreatorProfileUrl] = useState('');
  const [creatorNiche, setCreatorNiche] = useState(CREATOR_NICHES[0]);
  const [creatorCountry, setCreatorCountry] = useState('United States');
  const [creatorState, setCreatorState] = useState('California');
  const [creatorCity, setCreatorCity] = useState('Los Angeles');
  const [creatorFollowers, setCreatorFollowers] = useState('85000');
  const [creatorEngagement, setCreatorEngagement] = useState('5.2');
  const [creatorViews, setCreatorViews] = useState('32000');
  const [creatorBio, setCreatorBio] = useState('');
  const [creatorDedicatedRate, setCreatorDedicatedRate] = useState('15000');
  const [creatorIntegratedRate, setCreatorIntegratedRate] = useState('7500');
  const [creatorShortRate, setCreatorShortRate] = useState('4000');

  if (!isOpen) return null;

  // Location helpers
  const brandStates = getStatesForCountry(brandCountry);
  const brandCities = getCitiesForState(brandCountry, brandState);

  const creatorStates = getStatesForCountry(creatorCountry);
  const creatorCities = getCitiesForState(creatorCountry, creatorState);

  // Quick 1-click Demo presets
  const handleQuickBrandDemo = () => {
    setBrandCompany('Acme Studio');
    setBrandName('Alex Morgan');
    setBrandEmail('alex@acmestudio.com');
    setBrandIndustry('Technology & Software');
    setBrandWebsite('https://acmestudio.com');
    setBrandBudget('$50,000 – $150,000 / mo');
    setBrandCountry('United States');
    setBrandState('New York');
    setBrandCity('New York');
  };

  const handleQuickCreatorDemo = () => {
    setCreatorName('Maya Lin');
    setCreatorHandle('@mayalin');
    setCreatorEmail('maya@mayalin.com');
    setCreatorPlatform('YouTube');
    setCreatorProfileUrl('https://youtube.com/@mayalin');
    setCreatorNiche('Tech & Electronics');
    setCreatorCountry('United States');
    setCreatorState('California');
    setCreatorCity('San Francisco');
    setCreatorFollowers('165000');
    setCreatorEngagement('5.8');
    setCreatorViews('48000');
    setCreatorBio('High-energy product breakdowns, industrial design reviews, and modern hardware setup tours.');
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandEmail.trim()) {
      setError('Please provide your work email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const brand = await loginBrand({
        email: brandEmail.trim().toLowerCase(),
        name: brandName.trim() || brandCompany || 'Brand Partner',
        company: brandCompany.trim() || 'Partner Company',
        industry: brandIndustry,
        website: brandWebsite.trim(),
        budgetRange: brandBudget,
        location: {
          country: brandCountry,
          state: brandState,
          city: brandCity,
        },
        goals: ['Brand Awareness', 'Direct Conversions'],
        password: brandPassword.trim() || undefined,
      });

      onSuccess({ role: 'brand', data: brand });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Brand login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorEmail.trim() || !creatorName.trim() || !creatorHandle.trim()) {
      setError('Please provide your name, handle, and email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cleanHandle = creatorHandle.startsWith('@') ? creatorHandle.trim() : `@${creatorHandle.trim()}`;
      const res = await loginCreator({
        name: creatorName.trim(),
        handle: cleanHandle,
        email: creatorEmail.trim().toLowerCase(),
        password: creatorPassword.trim() || undefined,
        primaryPlatform: creatorPlatform,
        profileUrl: creatorProfileUrl.trim(),
        niche: creatorNiche,
        location: {
          country: creatorCountry,
          state: creatorState,
          city: creatorCity,
          flag: getFlagForCountry(creatorCountry),
        },
        followers: Number(creatorFollowers) || 10000,
        engagementRate: Number(creatorEngagement) || 4.5,
        averageViews: Number(creatorViews) || 5000,
        bio: creatorBio.trim() || `${creatorNiche} creator focused on high quality storytelling.`,
        rates: {
          dedicatedVideo: Number(creatorDedicatedRate) || undefined,
          integratedSegment: Number(creatorIntegratedRate) || undefined,
          shortForm: Number(creatorShortRate) || undefined,
        },
      });

      onSuccess({ role: 'creator', data: res.user, createdCreator: res.creatorProfile });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Creator login failed');
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
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white font-bold text-xs">
                CM
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-stone-900">
                  Welcome to CreatorMatch AI—choose your path :
                </h2>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Brands can set up company profiles to find top talent, while creators can register channels to land direct sponsorships.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Toggle */}
          <div className="mt-5 grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
            <button
              type="button"
              onClick={() => {
                setRole('brand');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                role === 'brand'
                  ? 'bg-white text-stone-950 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Brand Sign Up</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('creator');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                role === 'creator'
                  ? 'bg-white text-stone-950 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Creator Sign Up</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORMS */}
          <div className="mt-5">
            {role === 'brand' ? (
              /* BRAND LOGIN */
              <form onSubmit={handleBrandSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-600 pb-1">
                  <span>Enter your company details to tailor creator matches</span>
                  <button
                    type="button"
                    onClick={handleQuickBrandDemo}
                    className="text-stone-800 font-semibold underline hover:text-stone-950"
                  >
                    Fill sample brand
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandCompany}
                      onChange={(e) => setBrandCompany(e.target.value)}
                      placeholder="e.g. Acme Studio"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={brandEmail}
                      onChange={(e) => setBrandEmail(e.target.value)}
                      placeholder="alex@acmestudio.com"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={brandIndustry}
                      onChange={(e) => setBrandIndustry(e.target.value)}
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {BRAND_INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Account Password <span className="text-[10px] text-stone-600 font-normal">(Optional for demo)</span>
                  </label>
                  <input
                    type="password"
                    value={brandPassword}
                    onChange={(e) => setBrandPassword(e.target.value)}
                    placeholder="Enter or create account password"
                    className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                  />
                </div>

                {/* HQ Location */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Company Location (Country, State, City)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={brandCountry}
                      onChange={(e) => {
                        const newC = e.target.value;
                        setBrandCountry(newC);
                        const states = getStatesForCountry(newC);
                        if (states.length) {
                          setBrandState(states[0]);
                          const cities = getCitiesForState(newC, states[0]);
                          setBrandCity(cities[0] || '');
                        } else {
                          setBrandState('');
                          setBrandCity('');
                        }
                      }}
                      className="h-10 rounded-xl border border-stone-200 px-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {getCountriesList().map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={brandState}
                      onChange={(e) => {
                        const newS = e.target.value;
                        setBrandState(newS);
                        const cities = getCitiesForState(brandCountry, newS);
                        setBrandCity(cities[0] || '');
                      }}
                      className="h-10 rounded-xl border border-stone-200 px-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {brandStates.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <select
                      value={brandCity}
                      onChange={(e) => setBrandCity(e.target.value)}
                      className="h-10 rounded-xl border border-stone-200 px-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {brandCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>{loading ? 'Logging In...' : 'Log In as Brand'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* CREATOR LOGIN */
              <form onSubmit={handleCreatorSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-600 pb-1">
                  <span>Your profile will be added to the Creator Match database</span>
                  <button
                    type="button"
                    onClick={handleQuickCreatorDemo}
                    className="text-stone-800 font-semibold underline hover:text-stone-950"
                  >
                    Fill sample creator
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Creator Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Channel Handle *
                    </label>
                    <input
                      type="text"
                      required
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value)}
                      placeholder="@mayalin"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Creator Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={creatorEmail}
                      onChange={(e) => setCreatorEmail(e.target.value)}
                      placeholder="maya@mayalin.com"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Account Password <span className="text-[10px] text-stone-600 font-normal">(Optional for demo)</span>
                    </label>
                    <input
                      type="password"
                      value={creatorPassword}
                      onChange={(e) => setCreatorPassword(e.target.value)}
                      placeholder="Enter or create account password"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Platform & Niche
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={creatorPlatform}
                      onChange={(e) => setCreatorPlatform(e.target.value as PlatformType)}
                      className="h-10 rounded-xl border border-stone-200 px-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <select
                        value={creatorNiche}
                        onChange={(e) => setCreatorNiche(e.target.value)}
                        className="h-10 rounded-xl border border-stone-200 px-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {CREATOR_NICHES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location (Country, State, City) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Creator Location (Country, State/Region, City) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={creatorCountry}
                      onChange={(e) => {
                        const newC = e.target.value;
                        setCreatorCountry(newC);
                        const states = getStatesForCountry(newC);
                        if (states.length) {
                          setCreatorState(states[0]);
                          const cities = getCitiesForState(newC, states[0]);
                          setCreatorCity(cities[0] || '');
                        } else {
                          setCreatorState('');
                          setCreatorCity('');
                        }
                      }}
                      className="h-10 rounded-xl border border-stone-200 px-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {getCountriesList().map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={creatorState}
                      onChange={(e) => {
                        const newS = e.target.value;
                        setCreatorState(newS);
                        const cities = getCitiesForState(creatorCountry, newS);
                        setCreatorCity(cities[0] || '');
                      }}
                      className="h-10 rounded-xl border border-stone-200 px-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {creatorStates.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <select
                      value={creatorCity}
                      onChange={(e) => setCreatorCity(e.target.value)}
                      className="h-10 rounded-xl border border-stone-200 px-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {creatorCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Followers, Engagement, Views */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Followers
                    </label>
                    <input
                      type="number"
                      value={creatorFollowers}
                      onChange={(e) => setCreatorFollowers(e.target.value)}
                      className="w-full h-9 rounded-xl border border-stone-200 px-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Eng. Rate %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={creatorEngagement}
                      onChange={(e) => setCreatorEngagement(e.target.value)}
                      className="w-full h-9 rounded-xl border border-stone-200 px-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Avg. Views
                    </label>
                    <input
                      type="number"
                      value={creatorViews}
                      onChange={(e) => setCreatorViews(e.target.value)}
                      className="w-full h-9 rounded-xl border border-stone-200 px-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>{loading ? 'Adding & Logging In...' : 'Log In & Add to Database'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
