import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  UserCheck,
  Building2,
  Globe,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  DollarSign,
  AlertCircle,
  X,
  Compass,
} from 'lucide-react';
import type { UserSession, PlatformType } from '../types.js';
import {
  WORLD_LOCATIONS,
  getCountriesList,
  getStatesForCountry,
  getCitiesForState,
  getFlagForCountry,
} from '../data/locations.js';
import { loginBrand, loginCreator } from '../api.js';

interface AuthPageProps {
  onSuccess: (session: UserSession) => void;
  onCancel?: () => void;
  initialRole?: 'brand' | 'creator';
}

const BRAND_INDUSTRIES = [
  'Fashion & Apparel',
  'Technology & Software',
  'Health, Wellness & Fitness',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Gaming & Entertainment',
  'Travel & Hospitality',
  'Consumer Electronics',
  'Home & Design',
  'Finance & Crypto',
];

const BRAND_GOALS = [
  'Brand Awareness & Reach',
  'Product Launch Campaigns',
  'Direct Conversions & Sales',
  'Content Whitelisting / Paid Ads',
  'Long-Term Ambassadorships',
  'Event Coverage & Activations',
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

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onCancel,
  initialRole = 'brand',
}) => {
  const [role, setRole] = useState<'brand' | 'creator'>(initialRole);
  const [isSignInOnly, setIsSignInOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // BRAND FIELDS
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
  const [selectedBrandGoals, setSelectedBrandGoals] = useState<string[]>([BRAND_GOALS[0], BRAND_GOALS[1]]);

  // CREATOR FIELDS
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
  const [creatorEngagement, setCreatorEngagement] = useState('5.4');
  const [creatorViews, setCreatorViews] = useState('28000');
  const [creatorBio, setCreatorBio] = useState('');
  const [creatorDedicatedRate, setCreatorDedicatedRate] = useState('12000');
  const [creatorIntegratedRate, setCreatorIntegratedRate] = useState('6500');
  const [creatorShortRate, setCreatorShortRate] = useState('3500');

  // Location helpers for Brand
  const brandStates = getStatesForCountry(brandCountry);
  const brandCities = getCitiesForState(brandCountry, brandState);

  // Location helpers for Creator
  const creatorStates = getStatesForCountry(creatorCountry);
  const creatorCities = getCitiesForState(creatorCountry, creatorState);

  const toggleBrandGoal = (goal: string) => {
    setSelectedBrandGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
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
        goals: selectedBrandGoals,
        password: brandPassword.trim() || undefined,
      });

      onSuccess({ role: 'brand', data: brand });
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate brand account');
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
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate creator account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Top bar with back to explore */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-stone-100 font-semibold text-sm">
              CM
            </div>
            <span className="font-bold tracking-tight text-base text-stone-900">
              CreatorMatch
            </span>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Explore Directory as Guest</span>
            </button>
          )}
        </div>

        {/* Card Container */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 sm:p-10 shadow-xs">
          {/* Header */}
          <div className="text-center max-w-lg mx-auto">
            <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
              Welcome to CreatorMatch AI—choose your path :
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
              Brands can set up company profiles to find top talent, while creators can register channels to land direct sponsorships.
            </p>
          </div>

          {/* Role Selector Segmented Controls */}
          <div className="mt-6 grid grid-cols-2 gap-3 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
            <button
              type="button"
              onClick={() => {
                setRole('brand');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold transition-all ${
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
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold transition-all ${
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
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* DYNAMIC FORM BASED ON ROLE */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {role === 'brand' ? (
                /* BRAND LOGIN & COMPANY ONBOARDING FORM */
                <motion.form
                  key="brand-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={handleBrandSubmit}
                  className="space-y-5"
                >
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      Brand & Company Profile
                    </h2>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Tell us about your brand to tailor talent recommendations and partnership briefs.
                    </p>
                  </div>

                  {/* Company & Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={brandCompany}
                        onChange={(e) => setBrandCompany(e.target.value)}
                        placeholder="e.g. Acme Studio, Gymshark, Nike"
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Your Name / Team Lead
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email & Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={brandEmail}
                        onChange={(e) => setBrandEmail(e.target.value)}
                        placeholder="partnerships@company.com"
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={brandWebsite}
                        onChange={(e) => setBrandWebsite(e.target.value)}
                        placeholder="https://company.com"
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
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

                  {/* Industry & Monthly Spend */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Brand Industry
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

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Target Creator Spend
                      </label>
                      <select
                        value={brandBudget}
                        onChange={(e) => setBrandBudget(e.target.value)}
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {BUDGET_RANGES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Headquarters Location: Country, State, City */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Company Headquarters Location
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Country */}
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
                        className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {getCountriesList().map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>

                      {/* State */}
                      <select
                        value={brandState}
                        onChange={(e) => {
                          const newS = e.target.value;
                          setBrandState(newS);
                          const cities = getCitiesForState(brandCountry, newS);
                          setBrandCity(cities[0] || '');
                        }}
                        className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {brandStates.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {/* City */}
                      <select
                        value={brandCity}
                        onChange={(e) => setBrandCity(e.target.value)}
                        className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {brandCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Campaign Objectives */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Key Marketing Objectives
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BRAND_GOALS.map((goal) => {
                        const isSelected = selectedBrandGoals.includes(goal);
                        return (
                          <button
                            type="button"
                            key={goal}
                            onClick={() => toggleBrandGoal(goal)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-colors ${
                              isSelected
                                ? 'border-stone-900 bg-stone-900 text-white font-medium'
                                : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:border-stone-300'
                            }`}
                          >
                            <CheckCircle2
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isSelected ? 'text-white' : 'text-stone-400'
                              }`}
                            />
                            <span>{goal}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-600">
                      Access verified creators and send partnership briefs
                    </span>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xs"
                    >
                      <span>{loading ? 'Entering...' : 'Enter Brand Workspace'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* CREATOR LOGIN & PAGE ONBOARDING FORM */
                <motion.form
                  key="creator-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={handleCreatorSubmit}
                  className="space-y-5"
                >
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      Creator Channel & Location Details
                    </h2>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Publish your creator presence so leading brands can discover your channel and book sponsorships.
                    </p>
                  </div>

                  {/* Name & Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Full Name / Creator Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={creatorName}
                        onChange={(e) => setCreatorName(e.target.value)}
                        placeholder="e.g. Maya Chen"
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Primary Handle *
                      </label>
                      <input
                        type="text"
                        required
                        value={creatorHandle}
                        onChange={(e) => setCreatorHandle(e.target.value)}
                        placeholder="e.g. @mayamakes"
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email & Primary Platform */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Creator Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={creatorEmail}
                        onChange={(e) => setCreatorEmail(e.target.value)}
                        placeholder="creator@channel.com"
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
                      Primary Platform
                    </label>
                    <select
                      value={creatorPlatform}
                      onChange={(e) => setCreatorPlatform(e.target.value as PlatformType)}
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Channel URL & Niche */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Channel / Social Profile Link
                      </label>
                      <input
                        type="url"
                        value={creatorProfileUrl}
                        onChange={(e) => setCreatorProfileUrl(e.target.value)}
                        placeholder="https://youtube.com/@mayamakes"
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Main Niche / Category
                      </label>
                      <select
                        value={creatorNiche}
                        onChange={(e) => setCreatorNiche(e.target.value)}
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {CREATOR_NICHES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location Filter Fields: Country, State, City */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Creator Location (Country, State/Region, City) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Country */}
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
                        className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {getCountriesList().map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>

                      {/* State */}
                      <select
                        value={creatorState}
                        onChange={(e) => {
                          const newS = e.target.value;
                          setCreatorState(newS);
                          const cities = getCitiesForState(creatorCountry, newS);
                          setCreatorCity(cities[0] || '');
                        }}
                        className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {creatorStates.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {/* City */}
                      <select
                        value={creatorCity}
                        onChange={(e) => setCreatorCity(e.target.value)}
                        className="h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                      >
                        {creatorCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reach, Engagement, Avg Views */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Followers / Subs
                      </label>
                      <input
                        type="number"
                        min="100"
                        value={creatorFollowers}
                        onChange={(e) => setCreatorFollowers(e.target.value)}
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Engagement Rate %
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={creatorEngagement}
                        onChange={(e) => setCreatorEngagement(e.target.value)}
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
                        value={creatorViews}
                        onChange={(e) => setCreatorViews(e.target.value)}
                        className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* About Content Bio */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      About Your Content & Audience
                    </label>
                    <textarea
                      rows={2}
                      value={creatorBio}
                      onChange={(e) => setCreatorBio(e.target.value)}
                      placeholder="What topics do you create about, and who is your community?"
                      className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Estimated Rates */}
                  <div className="pt-2 border-t border-stone-100">
                    <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                      Your Target Deliverable Rates (USD)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <span className="block text-[11px] text-stone-600 mb-1">Dedicated Video</span>
                        <input
                          type="number"
                          value={creatorDedicatedRate}
                          onChange={(e) => setCreatorDedicatedRate(e.target.value)}
                          className="w-full h-9 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] text-stone-600 mb-1">Integrated 60s</span>
                        <input
                          type="number"
                          value={creatorIntegratedRate}
                          onChange={(e) => setCreatorIntegratedRate(e.target.value)}
                          className="w-full h-9 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] text-stone-600 mb-1">Short-Form Reel</span>
                        <input
                          type="number"
                          value={creatorShortRate}
                          onChange={(e) => setCreatorShortRate(e.target.value)}
                          className="w-full h-9 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-600">
                      Creates your verified profile for brand partnerships
                    </span>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xs"
                    >
                      <span>{loading ? 'Creating...' : 'Publish & Enter Dashboard'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
