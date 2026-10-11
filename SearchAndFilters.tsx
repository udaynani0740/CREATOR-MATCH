import React, { useMemo } from 'react';
import { Search, X, MapPin, Bookmark, RotateCcw } from 'lucide-react';
import type { CreatorFilterOptions } from '../types.js';
import {
  getCountriesList,
  getStatesForCountry,
  getCitiesForState,
} from '../data/locations.js';

interface SearchAndFiltersProps {
  filters: CreatorFilterOptions;
  onFilterChange: (newFilters: Partial<CreatorFilterOptions>) => void;
  onResetFilters: () => void;
  totalResults: number;
  totalAvailable: number;
  savedCount: number;
  niches: string[];
}

const PLATFORMS = [
  { id: 'all', label: 'All Platforms' },
  { id: 'YouTube', label: 'YouTube' },
  { id: 'Instagram', label: 'Instagram' },
  { id: 'TikTok', label: 'TikTok' },
  { id: 'Podcast', label: 'Podcast' },
];

const FOLLOWER_TIERS = [
  { id: 'all', label: 'Any Audience Size' },
  { id: 'nano', label: 'Nano (<50K)' },
  { id: 'micro', label: 'Micro (50K–250K)' },
  { id: 'mid', label: 'Mid-Tier (250K–1M)' },
  { id: 'macro', label: 'Macro (1M–5M)' },
  { id: 'mega', label: 'Mega (5M+)' },
];

const SORT_OPTIONS: { id: CreatorFilterOptions['sortBy']; label: string }[] = [
  { id: 'followers_desc', label: 'Most Followers' },
  { id: 'engagement_desc', label: 'Highest Engagement' },
  { id: 'views_desc', label: 'Highest Avg Views' },
  { id: 'name_asc', label: 'Name (A to Z)' },
];

const ENGAGEMENT_PRESETS = [
  { label: 'Any Rate', value: 0 },
  { label: '4%+', value: 4 },
  { label: '6%+', value: 6 },
  { label: '8%+', value: 8 },
];

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  totalAvailable,
  savedCount,
  niches,
}) => {
  const isFiltered =
    Boolean(filters.search) ||
    filters.platform !== 'all' ||
    filters.niche !== 'all' ||
    filters.followerTier !== 'all' ||
    filters.minEngagement > 0 ||
    filters.country !== 'all' ||
    filters.state !== 'all' ||
    filters.city !== 'all' ||
    filters.onlySaved;

  // Hierarchical location options
  const countries = useMemo(() => getCountriesList(), []);

  const availableStates = useMemo(() => {
    if (!filters.country || filters.country === 'all') return [];
    return getStatesForCountry(filters.country);
  }, [filters.country]);

  const availableCities = useMemo(() => {
    if (!filters.country || filters.country === 'all') return [];
    if (!filters.state || filters.state === 'all') return [];
    return getCitiesForState(filters.country, filters.state);
  }, [filters.country, filters.state]);

  const handleCountryChange = (country: string) => {
    onFilterChange({
      country,
      state: 'all',
      city: 'all',
    });
  };

  const handleStateChange = (state: string) => {
    onFilterChange({
      state,
      city: 'all',
    });
  };

  return (
    <div className="space-y-4">
      {/* Primary Search Bar & Platform Tabs */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by creator name, @handle, keywords, city, or niche..."
            className="w-full h-11 rounded-xl border border-stone-200 bg-white pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-600 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-2xs transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-600 hover:text-stone-800 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Platform Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-200/60 rounded-xl border border-stone-200/80">
          {PLATFORMS.map((p) => {
            const isActive = filters.platform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onFilterChange({ platform: p.id })}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/50'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* LOCATION FILTERS ROW (Country, State/Region, City) */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-stone-100/80 border border-stone-200/90 text-xs">
        <div className="flex items-center gap-1 text-stone-700 font-semibold px-1">
          <MapPin className="h-3.5 w-3.5 text-stone-600" />
          <span>Location:</span>
        </div>

        {/* Country Selector */}
        <div className="min-w-[140px] flex-1 sm:flex-initial">
          <select
            value={filters.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full h-8 rounded-lg border border-stone-200 bg-white px-2.5 pr-7 text-xs font-medium text-stone-800 focus:border-stone-900 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">Any Country (Global)</option>
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* State / Region Selector */}
        <div className="min-w-[140px] flex-1 sm:flex-initial">
          <select
            value={filters.state}
            disabled={filters.country === 'all'}
            onChange={(e) => handleStateChange(e.target.value)}
            className={`w-full h-8 rounded-lg border px-2.5 pr-7 text-xs font-medium shadow-2xs cursor-pointer transition-colors ${
              filters.country === 'all'
                ? 'border-stone-200/60 bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'border-stone-200 bg-white text-stone-800 focus:border-stone-900 focus:outline-none'
            }`}
          >
            <option value="all">
              {filters.country === 'all' ? 'Select Country First' : 'Any State / Region'}
            </option>
            {availableStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* City Selector */}
        <div className="min-w-[140px] flex-1 sm:flex-initial">
          <select
            value={filters.city}
            disabled={filters.country === 'all' || filters.state === 'all'}
            onChange={(e) => onFilterChange({ city: e.target.value })}
            className={`w-full h-8 rounded-lg border px-2.5 pr-7 text-xs font-medium shadow-2xs cursor-pointer transition-colors ${
              filters.country === 'all' || filters.state === 'all'
                ? 'border-stone-200/60 bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'border-stone-200 bg-white text-stone-800 focus:border-stone-900 focus:outline-none'
            }`}
          >
            <option value="all">
              {filters.state === 'all' ? 'Select State First' : 'Any City'}
            </option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Clear location filter button if selected */}
        {(filters.country !== 'all' || filters.state !== 'all' || filters.city !== 'all') && (
          <button
            onClick={() => onFilterChange({ country: 'all', state: 'all', city: 'all' })}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 px-2 py-1 transition-colors"
          >
            <X className="h-3 w-3" />
            <span>Clear Location</span>
          </button>
        )}
      </div>

      {/* Secondary Filter Row (Niche, Follower tier, Engagement, Sort) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Niche Dropdown */}
          <div className="relative">
            <select
              value={filters.niche}
              onChange={(e) => onFilterChange({ niche: e.target.value })}
              className="h-9 rounded-lg border border-stone-200 bg-white px-3 pr-8 text-xs font-medium text-stone-800 focus:border-stone-900 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="all">All Niches</option>
              {niches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Follower Tier */}
          <div className="relative">
            <select
              value={filters.followerTier}
              onChange={(e) => onFilterChange({ followerTier: e.target.value })}
              className="h-9 rounded-lg border border-stone-200 bg-white px-3 pr-8 text-xs font-medium text-stone-800 focus:border-stone-900 focus:outline-none shadow-2xs cursor-pointer"
            >
              {FOLLOWER_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>

          {/* Engagement Rate Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-100 px-1 py-0.5 rounded-lg border border-stone-200/70 text-xs">
            <span className="text-[11px] font-medium text-stone-600 px-1.5">Eng.</span>
            {ENGAGEMENT_PRESETS.map((ep) => {
              const isSelected = filters.minEngagement === ep.value;
              return (
                <button
                  key={ep.value}
                  onClick={() => onFilterChange({ minEngagement: ep.value })}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  {ep.label}
                </button>
              );
            })}
          </div>

          {/* Saved Only Filter */}
          <button
            onClick={() => onFilterChange({ onlySaved: !filters.onlySaved })}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-colors shadow-2xs ${
              filters.onlySaved
                ? 'bg-stone-900 border-stone-900 text-white'
                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Shortlisted</span>
            {savedCount > 0 && <span className="opacity-80">({savedCount})</span>}
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 h-9 px-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-stone-600 hidden sm:inline">Sort by:</span>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as CreatorFilterOptions['sortBy'],
                })
              }
              className="h-9 rounded-lg border border-stone-200 bg-white px-3 pr-8 text-xs font-semibold text-stone-800 focus:border-stone-900 focus:outline-none shadow-2xs cursor-pointer"
            >
              {SORT_OPTIONS.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Line (clean typography without pill boxes) */}
      <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-200/50">
        <div className="flex items-center gap-1.5">
          <span>Showing</span>
          <strong className="font-semibold text-stone-900">{totalResults}</strong>
          <span>of {totalAvailable} verified creator profiles</span>
          {isFiltered && <span className="text-stone-600">(filtered)</span>}
        </div>
        <div className="text-[11px] text-stone-600 hidden md:block">
          All profiles verified with live channel analytics & location validation
        </div>
      </div>
    </div>
  );
};
