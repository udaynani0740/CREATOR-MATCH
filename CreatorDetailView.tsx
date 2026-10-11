import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Share2,
  Send,
  Trash2,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  Globe,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Creator } from '../types.js';
import { formatFollowers, formatCurrency } from '../utils/formatters.js';

interface CreatorDetailViewProps {
  creator: Creator;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onOpenPitch: (creator: Creator, defaultDeliverable?: string) => void;
  onDelete?: (id: string) => void;
}

type TabType = 'overview' | 'demographics' | 'content' | 'rates';

export const CreatorDetailView: React.FC<CreatorDetailViewProps> = ({
  creator,
  onBack,
  isSaved,
  onToggleSave,
  onOpenPitch,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="pb-16"
    >
      {/* Top Navigation & Breadcrumb */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors py-1 px-2 rounded-lg hover:bg-stone-100"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to directory</span>
          <kbd className="hidden sm:inline-block rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-stone-600">
            Esc
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copied ? 'Copied link!' : 'Share'}</span>
          </button>

          {/* Save / Shortlist */}
          <button
            onClick={(e) => onToggleSave(creator.id, e)}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors shadow-2xs ${
              isSaved
                ? 'bg-stone-900 border-stone-900 text-white'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Shortlisted' : 'Save to Shortlist'}</span>
          </button>

          {/* Book Collaboration */}
          <button
            onClick={() => onOpenPitch(creator)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-4 py-1.5 rounded-lg transition-all shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Book Collaboration</span>
          </button>

          {/* Delete custom creator */}
          {creator.isCustom && onDelete && (
            <button
              onClick={() => {
                if (confirm(`Delete custom profile for "${creator.name}"?`)) {
                  onDelete(creator.id);
                }
              }}
              title="Delete profile"
              className="text-stone-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner & Avatar Card */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
        {/* Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-stone-900">
          <img
            src={creator.banner}
            alt={`${creator.name} cover`}
            className="h-full w-full object-cover opacity-85"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
        </div>

        {/* Profile Info Header */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover ring-4 ring-white shadow-md bg-stone-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      creator.name
                    )}&background=1c1917&color=fafaf9`;
                  }}
                />
                {creator.verified && (
                  <div
                    title="Verified Creator Profile"
                    className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-xs"
                  >
                    <CheckCircle2 className="h-6 w-6 fill-emerald-100 text-emerald-800" />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                    {creator.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                  <span>{creator.handle}</span>
                  <span className="text-stone-300">·</span>
                  <span className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3 text-stone-600" />
                    {creator.location.city}, {creator.location.country} {creator.location.flag}
                  </span>
                </div>
              </div>
            </div>

            {/* Channels External Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {creator.channels.map((ch) => (
                <a
                  key={ch.platform}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-xs font-semibold text-stone-800 transition-colors"
                >
                  <span>{ch.platform}</span>
                  <span className="text-stone-600 font-normal">
                    ({formatFollowers(ch.followers)})
                  </span>
                  <ExternalLink className="h-3 w-3 text-stone-600" />
                </a>
              ))}
            </div>
          </div>

          {/* Headline & Metadata */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-sm font-medium text-stone-800 sm:text-base leading-relaxed">
              {creator.headline}
            </p>

            {/* Unboxed Metadata (Anti-slop rule) */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-600">
              <span className="font-semibold text-stone-800">{creator.niche}</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>Primary platform: {creator.primaryPlatform}</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>Verified partner network</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>Member since {new Date(creator.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights Grid */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reach */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Total Audience</span>
            <Users className="h-4 w-4 text-stone-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            {formatFollowers(creator.followers)}
          </div>
          <div className="mt-1 text-[11px] text-stone-600">
            Across {creator.channels.length} active channels
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Verified Engagement</span>
            <TrendingUp className="h-4 w-4 text-emerald-800" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-stone-900 flex items-baseline gap-1.5">
            <span>{creator.engagementRate}%</span>
            <span className="text-xs font-semibold text-emerald-800">High tier</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-600">
            Platform benchmark: 2.4% avg
          </div>
        </div>

        {/* Average Views */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Average Views</span>
            <Eye className="h-4 w-4 text-stone-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            {formatFollowers(creator.averageViews)}
          </div>
          <div className="mt-1 text-[11px] text-stone-600">
            Estimated 30-day view baseline
          </div>
        </div>

        {/* Benchmark Integration Rate */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Integrated Segment</span>
            <DollarSign className="h-4 w-4 text-stone-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            {formatCurrency(creator.collaborationRates.integratedSegment)}
          </div>
          <div className="mt-1 text-[11px] text-stone-600">
            Standard 60-second integration
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="mt-8">
        <div className="flex items-center gap-1 border-b border-stone-200/90 pb-px">
          {[
            { id: 'overview', label: 'Biography & Focus' },
            { id: 'demographics', label: 'Audience Demographics' },
            { id: 'content', label: 'Recent Top Content' },
            { id: 'rates', label: 'Rate Card & Packages' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative px-4 py-2.5 text-xs font-semibold transition-colors ${
                  isActive ? 'text-stone-950 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="mt-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Biography */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    About the Creator
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700 whitespace-pre-line">
                    {creator.bio}
                  </p>

                  <div className="mt-6 pt-5 border-t border-stone-100">
                    <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Content Topics & Expertise
                    </h4>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-stone-700">
                      {creator.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Past Brand Partnerships */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Verified Past Brand Collaborations
                  </h3>
                  <p className="mt-1 text-xs text-stone-600">
                    Brands that have successfully partnered with {creator.name}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {creator.pastBrands.map((brand) => (
                      <div
                        key={brand}
                        className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs font-semibold text-stone-850"
                      >
                        <Sparkles className="h-3 w-3 text-stone-600" />
                        <span>{brand}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar: Channel Breakdown */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Channel Breakdown
                  </h3>
                  <div className="mt-4 divide-y divide-stone-100">
                    {creator.channels.map((channel) => (
                      <div
                        key={channel.platform}
                        className="flex items-center justify-between py-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-stone-900">{channel.platform}</div>
                          <div className="text-stone-600">{channel.handle}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-stone-900">
                            {formatFollowers(channel.followers)}
                          </div>
                          <a
                            href={channel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[11px] text-stone-600 hover:text-stone-900"
                          >
                            <span>Visit</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fast Pitch Action */}
                <div className="rounded-2xl border border-stone-900 bg-stone-950 p-6 text-white shadow-md">
                  <h3 className="text-base font-bold tracking-tight">Work with {creator.name}</h3>
                  <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
                    Submit your campaign brief and reserve deliverables directly with guaranteed response time.
                  </p>
                  <button
                    onClick={() => onOpenPitch(creator)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-stone-950 font-bold text-xs hover:bg-stone-100 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Inquire Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIENCE DEMOGRAPHICS */}
          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Geographic distribution */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      Top Audience Countries
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Geographic distribution of active subscribers & followers
                    </p>
                  </div>
                  <Globe className="h-4 w-4 text-stone-600" />
                </div>

                <div className="mt-5 space-y-3.5">
                  {creator.audienceDemographics.topCountries.map((country) => (
                    <div key={country.country}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-stone-800">{country.country}</span>
                        <span className="font-mono text-stone-600">{country.percent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-stone-900 transition-all duration-500"
                          style={{ width: `${country.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age & Gender Split */}
              <div className="space-y-6">
                {/* Age brackets */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Age Brackets
                  </h3>
                  <div className="mt-4 space-y-3">
                    {creator.audienceDemographics.ageRanges.map((age) => (
                      <div key={age.range}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-stone-700">{age.range} yrs</span>
                          <span className="font-semibold text-stone-900">{age.percent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-stone-700"
                            style={{ width: `${age.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender breakdown */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Gender Distribution
                  </h3>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="text-xs text-stone-600">Male</div>
                      <div className="text-lg font-bold text-stone-900 mt-0.5">
                        {creator.audienceDemographics.genderSplit.male}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="text-xs text-stone-600">Female</div>
                      <div className="text-lg font-bold text-stone-900 mt-0.5">
                        {creator.audienceDemographics.genderSplit.female}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="text-xs text-stone-600">Other</div>
                      <div className="text-lg font-bold text-stone-900 mt-0.5">
                        {creator.audienceDemographics.genderSplit.other}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECENT CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Recent representative videos and high-performing publications</span>
                <span>Verified view counts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {creator.recentContent.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xs hover:border-stone-400 transition-all"
                  >
                    <div className="relative aspect-video w-full bg-stone-100 overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
                        {item.views} views
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1.5">
                        <span>{item.platform}</span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="mt-3 flex items-center justify-end">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950"
                        >
                          <span>Watch</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RATE CARD & PACKAGES */}
          {activeTab === 'rates' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dedicated Video */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    <span>Full Feature</span>
                    <span className="text-[11px] font-normal text-stone-600">Primary Channel</span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 mt-2">
                    Dedicated Full-Length Video
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Entire video conceptualized and tailored around your brand message or product integration.
                  </p>
                  <div className="mt-6 text-3xl font-extrabold tracking-tight text-stone-900">
                    {formatCurrency(creator.collaborationRates.dedicatedVideo)}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    Includes 30-day digital usage rights
                  </div>
                </div>

                <button
                  onClick={() => onOpenPitch(creator, 'Dedicated Full-Length Video')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
                >
                  Select & Request
                </button>
              </div>

              {/* Integrated Segment */}
              <div className="rounded-2xl border-2 border-stone-900 bg-stone-50/50 p-6 shadow-sm flex flex-col justify-between relative">
                <div className="absolute -top-3 left-6 bg-stone-900 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                  Most Popular
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    <span>Mid-Roll Segment</span>
                    <span className="text-[11px] font-normal text-stone-600">60-90 Seconds</span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 mt-2">
                    Integrated Sponsor Segment
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Seamless mid-roll endorsement with dedicated trackable link and call-to-action in description.
                  </p>
                  <div className="mt-6 text-3xl font-extrabold tracking-tight text-stone-900">
                    {formatCurrency(creator.collaborationRates.integratedSegment)}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    Guaranteed link placement in top comments
                  </div>
                </div>

                <button
                  onClick={() => onOpenPitch(creator, 'Integrated Sponsor Segment')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
                >
                  Select & Request
                </button>
              </div>

              {/* Short Form / Vertical */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    <span>Vertical Video</span>
                    <span className="text-[11px] font-normal text-stone-600">Reels / Shorts / TikTok</span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 mt-2">
                    Dedicated Short-Form
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    High-energy vertical reel with sound design, storytelling, and viral reach potential.
                  </p>
                  <div className="mt-6 text-3xl font-extrabold tracking-tight text-stone-900">
                    {formatCurrency(creator.collaborationRates.shortForm)}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    Multi-platform cross-posting options available
                  </div>
                </div>

                <button
                  onClick={() => onOpenPitch(creator, 'Dedicated Short-Form (Reels / TikTok / Shorts)')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
                >
                  Select & Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
