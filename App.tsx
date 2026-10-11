/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Users,
  TrendingUp,
  ShieldCheck,
  Search,
  AlertCircle,
  RefreshCw,
  Briefcase,
  User,
  UserCheck,
  ArrowRight,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import type { Creator, CreatorFilterOptions, CollaborationInquiry, UserSession } from './types.js';
import {
  fetchCreators,
  deleteCreator,
  resetDatabase,
  submitInquiry,
  fetchInquiries,
} from './api.js';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';
import { Navbar } from './components/Navbar.js';
import { SearchAndFilters } from './components/SearchAndFilters.js';
import { CreatorCard } from './components/CreatorCard.js';
import { CreatorDetailView } from './components/CreatorDetailView.js';
import { CollaborationModal } from './components/CollaborationModal.js';
import { SavedCreatorsDrawer } from './components/SavedCreatorsDrawer.js';
import { InquiriesListModal } from './components/InquiriesListModal.js';
import { AuthPage } from './components/AuthPage.js';
import { LoginModal } from './components/LoginModal.js';
import { formatFollowers } from './utils/formatters.js';

const INITIAL_FILTERS: CreatorFilterOptions = {
  search: '',
  platform: 'all',
  niche: 'all',
  followerTier: 'all',
  minEngagement: 0,
  country: 'all',
  state: 'all',
  city: 'all',
  sortBy: 'followers_desc',
  onlySaved: false,
};

export default function App() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<CreatorFilterOptions>(INITIAL_FILTERS);

  // User session (Brand or Creator login)
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('creatorindex_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Saved / shortlisted IDs (stored in localStorage)
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('creatorindex_saved');
      return stored ? JSON.parse(stored) : ['cre_mkbhd', 'cre_cleo_abram'];
    } catch {
      return ['cre_mkbhd', 'cre_cleo_abram'];
    }
  });

  // Modal / Screen states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<'brand' | 'creator'>('brand');
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isInquiriesOpen, setIsInquiriesOpen] = useState(false);
  const [pitchModalCreator, setPitchModalCreator] = useState<Creator | null>(null);
  const [pitchDefaultDeliverable, setPitchDefaultDeliverable] = useState<string | undefined>();

  // Inquiries list
  const [inquiries, setInquiries] = useState<CollaborationInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  // Persist user session
  useEffect(() => {
    try {
      if (userSession) {
        localStorage.setItem('creatorindex_session', JSON.stringify(userSession));
      } else {
        localStorage.removeItem('creatorindex_session');
      }
    } catch (e) {
      console.error('Failed to persist session:', e);
    }
  }, [userSession]);

  // Persist saved IDs
  useEffect(() => {
    try {
      localStorage.setItem('creatorindex_saved', JSON.stringify(savedIds));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedIds]);

  // Load creators from server
  const loadCreators = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCreators(filters);
      setCreators(data);
    } catch (err: any) {
      console.error('Error fetching creators:', err);
      setError(err?.message || 'Failed to load creators directory');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  // Check URL hash for direct creator deep-linking
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#creator=')) {
        const id = hash.replace('#creator=', '');
        const found = creators.find((c) => c.id === id);
        if (found) setSelectedCreator(found);
      }
    };
    if (creators.length > 0) {
      checkHash();
    }
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [creators]);

  // Keyboard navigation: Escape key returns to directory
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAuthOpen) {
          setIsAuthOpen(false);
        } else if (selectedCreator) {
          setSelectedCreator(null);
          window.location.hash = '';
        } else if (isSavedDrawerOpen) {
          setIsSavedDrawerOpen(false);
        } else if (isInquiriesOpen) {
          setIsInquiriesOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCreator, isSavedDrawerOpen, isInquiriesOpen, isAuthOpen]);

  // Unique niches extracted from creators
  const availableNiches = useMemo(() => {
    const set = new Set(creators.map((c) => c.niche));
    return Array.from(set).sort();
  }, [creators]);

  // Filtered creators for display (including client-side location & saved filtering)
  const displayedCreators = useMemo(() => {
    let list = creators;

    if (filters.onlySaved) {
      list = list.filter((c) => savedIds.includes(c.id));
    }

    if (filters.country && filters.country !== 'all') {
      list = list.filter(
        (c) => c.location.country.toLowerCase() === filters.country.toLowerCase()
      );
    }

    if (filters.state && filters.state !== 'all') {
      list = list.filter(
        (c) => (c.location.state || '').toLowerCase() === filters.state.toLowerCase()
      );
    }

    if (filters.city && filters.city !== 'all') {
      list = list.filter(
        (c) => c.location.city.toLowerCase() === filters.city.toLowerCase()
      );
    }

    return list;
  }, [creators, filters.onlySaved, filters.country, filters.state, filters.city, savedIds]);

  // Saved creator objects
  const savedCreatorsList = useMemo(() => {
    return creators.filter((c) => savedIds.includes(c.id));
  }, [creators, savedIds]);

  // Total stats
  const aggregateStats = useMemo(() => {
    const totalReach = creators.reduce((acc, c) => acc + c.followers, 0);
    const avgEng = creators.length
      ? (creators.reduce((acc, c) => acc + c.engagementRate, 0) / creators.length).toFixed(1)
      : '0.0';
    return {
      totalReach,
      avgEng,
      count: creators.length,
    };
  }, [creators]);

  // Toggle save
  const handleToggleSave = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const isAlready = prev.includes(id);
      const next = isAlready ? prev.filter((i) => i !== id) : [...prev, id];
      showToast(isAlready ? 'Removed from shortlist' : 'Added to campaign shortlist');
      return next;
    });
  }, [showToast]);

  // Handle select creator for detailed view
  const handleSelectCreator = useCallback((creator: Creator) => {
    setSelectedCreator(creator);
    window.location.hash = `creator=${creator.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToSearch = useCallback(() => {
    setSelectedCreator(null);
    window.location.hash = '';
  }, []);

  // Delete creator
  const handleDeleteCreator = async (id: string) => {
    try {
      await deleteCreator(id);
      setSelectedCreator(null);
      window.location.hash = '';
      await loadCreators();
      showToast('Creator profile removed.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove profile');
    }
  };

  // Reset directory to default roster
  const handleResetDb = async () => {
    if (confirm('Reset creator directory to verified original roster?')) {
      try {
        await resetDatabase();
        await loadCreators();
        showToast('Creator directory reset to verified default roster.');
      } catch (err: any) {
        showToast(err?.message || 'Failed to reset directory');
      }
    }
  };

  // Open inquiries modal
  const handleOpenInquiries = async () => {
    setIsInquiriesOpen(true);
    setInquiriesLoading(true);
    try {
      const data = await fetchInquiries();
      setInquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setInquiriesLoading(false);
    }
  };

  // Submit inquiry
  const handleSubmitInquiry = async (inquiryData: Partial<CollaborationInquiry>) => {
    const created = await submitInquiry(inquiryData);
    showToast(`Proposal dispatched successfully (Ref: ${created.id})`);
    return created;
  };

  // Sign out / switch account
  const handleSignOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign-out notice:', e);
      }
    }
    setUserSession(null);
    showToast('Signed out of account.');
  };


  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Sticky Minimal Navbar */}
      <Navbar
        savedCount={savedIds.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onOpenInquiries={handleOpenInquiries}
        onResetDb={handleResetDb}
        onOpenAuth={() => {
          setAuthInitialRole('brand');
          setIsAuthOpen(true);
        }}
        onSignOut={handleSignOut}
        totalCreators={creators.length}
        userSession={userSession}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <AnimatePresence mode="wait">
          {selectedCreator ? (
            /* DETAILED CREATOR DOSSIER VIEW (Seamless transition) */
            <CreatorDetailView
              key={`detail-${selectedCreator.id}`}
              creator={selectedCreator}
              onBack={handleBackToSearch}
              isSaved={savedIds.includes(selectedCreator.id)}
              onToggleSave={handleToggleSave}
              onOpenPitch={(cr, deliv) => {
                setPitchModalCreator(cr);
                setPitchDefaultDeliverable(deliv);
              }}
              onDelete={handleDeleteCreator}
            />
          ) : (
            /* DISCOVERY & SEARCH SCREEN */
            <motion.div
              key="search-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 pb-16"
            >
              {/* Logged-In Persona Workspace Banner (Tailored for Brand or Creator) */}
              {userSession ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white font-bold text-sm">
                      {userSession.role === 'brand' ? (
                        <Briefcase className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm sm:text-base">
                          {userSession.role === 'brand'
                            ? userSession.data.company
                            : userSession.data.name}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          {userSession.role} account
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 mt-0.5">
                        {userSession.role === 'brand' ? (
                          <span>
                            Industry: <strong className="text-stone-800">{userSession.data.industry}</strong> · Budget: {userSession.data.budgetRange} · HQ: {userSession.data.location.city}, {userSession.data.location.country}
                          </span>
                        ) : (
                          <span>
                            Handle: <strong className="text-stone-800">{userSession.data.handle}</strong> · {formatFollowers(userSession.data.followers)} reach · {userSession.data.location.city}, {userSession.data.location.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {userSession.role === 'creator' && (
                      <button
                        onClick={() => {
                          const found = creators.find(
                            (c) =>
                              c.handle.toLowerCase() ===
                              userSession.data.handle.toLowerCase()
                          );
                          if (found) handleSelectCreator(found);
                          else showToast('Your profile is active in the directory.');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 transition-colors"
                      >
                        <span>View My Public Dossier</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="text-xs font-medium text-stone-600 hover:text-stone-900 underline px-2 py-1"
                    >
                      Switch Profile
                    </button>
                  </div>
                </div>
              ) : (
                /* Welcome Banner: Quick Brand & Creator Access */
                <div className="rounded-2xl border border-stone-200/90 bg-gradient-to-r from-stone-100/80 via-white to-stone-100/50 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                      Welcome to CreatorMatch AI—choose your path :
                    </h2>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Brands can set up company profiles to find top talent, while creators can register channels to land direct sponsorships.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        setAuthInitialRole('brand');
                        setIsAuthOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors shadow-2xs"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>Brand Sign Up</span>
                    </button>
                    <button
                      onClick={() => {
                        setAuthInitialRole('creator');
                        setIsAuthOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 font-bold text-xs text-stone-800 transition-colors shadow-2xs"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Creator Sign Up</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Header Hero Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/80 pb-6 pt-1">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 tracking-wider uppercase mb-1.5">
                    <span>Creator Match Intelligence</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-emerald-800 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
                      Live Verified Metrics & Global Locations
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
                    Creator Match — Find & Partner with Top Creators
                  </h1>
                  <p className="mt-2 text-sm text-stone-600 max-w-2xl leading-relaxed">
                    Search authenticated profiles across YouTube, TikTok, and Instagram with real engagement rates, audience demographics, and location-based discovery.
                  </p>
                </div>

                {/* Key Overview Metrics (Clean unboxed statistics) */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0 bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600">
                      <Users className="h-3.5 w-3.5 text-stone-600" />
                      <span>Collective Reach</span>
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-stone-900 tracking-tight">
                      {formatFollowers(aggregateStats.totalReach)}
                    </div>
                  </div>

                  <div className="h-8 w-px bg-stone-200" />

                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-800" />
                      <span>Avg. Engagement</span>
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-stone-900 tracking-tight">
                      {aggregateStats.avgEng}%
                    </div>
                  </div>

                  <div className="h-8 w-px bg-stone-200" />

                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600">
                      <ShieldCheck className="h-3.5 w-3.5 text-stone-600" />
                      <span>Verified Roster</span>
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-stone-900 tracking-tight">
                      {aggregateStats.count}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search & Hierarchical Location / Niche Filters */}
              <SearchAndFilters
                filters={filters}
                onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
                onResetFilters={() => setFilters(INITIAL_FILTERS)}
                totalResults={displayedCreators.length}
                totalAvailable={creators.length}
                savedCount={savedIds.length}
                niches={availableNiches}
              />

              {/* Creators Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-64 rounded-2xl border border-stone-200/70 bg-white p-5 animate-pulse"
                    >
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded-full bg-stone-200" />
                        <div className="space-y-2 flex-1 pt-1">
                          <div className="h-4 w-28 bg-stone-200 rounded" />
                          <div className="h-3 w-16 bg-stone-100 rounded" />
                        </div>
                      </div>
                      <div className="mt-5 space-y-2">
                        <div className="h-3 w-full bg-stone-100 rounded" />
                        <div className="h-3 w-4/5 bg-stone-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
                  <h3 className="font-bold text-red-900">Unable to load creators</h3>
                  <p className="text-xs text-red-700 max-w-md mx-auto">{error}</p>
                  <button
                    onClick={loadCreators}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-900 text-white text-xs font-bold hover:bg-red-800 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Try again</span>
                  </button>
                </div>
              ) : displayedCreators.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-3 shadow-2xs">
                  <Search className="mx-auto h-8 w-8 text-stone-400" />
                  <h3 className="text-base font-bold text-stone-900">
                    No creators match your current filter criteria
                  </h3>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    Try adjusting your location (country, state, city), widening follower thresholds, or publish a new profile.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setFilters(INITIAL_FILTERS)}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-2xs"
                    >
                      Reset all filters
                    </button>
                    <button
                      onClick={() => {
                        setAuthInitialRole('creator');
                        setIsAuthOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors shadow-2xs"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Creator Sign Up</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedCreators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      isSaved={savedIds.includes(creator.id)}
                      onToggleSave={handleToggleSave}
                      onSelect={handleSelectCreator}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL: Book / Inquire Collaboration */}
      <CollaborationModal
        isOpen={Boolean(pitchModalCreator)}
        onClose={() => {
          setPitchModalCreator(null);
          setPitchDefaultDeliverable(undefined);
        }}
        creator={pitchModalCreator}
        defaultDeliverable={pitchDefaultDeliverable}
        onSubmitInquiry={handleSubmitInquiry}
      />

      {/* DRAWER: Saved Shortlist */}
      <SavedCreatorsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedCreators={savedCreatorsList}
        onRemove={(id) => {
          setSavedIds((prev) => prev.filter((i) => i !== id));
          showToast('Removed from shortlist');
        }}
        onSelectCreator={handleSelectCreator}
      />

      {/* MODAL: Collaboration Proposals */}
      <InquiriesListModal
        isOpen={isInquiriesOpen}
        onClose={() => setIsInquiriesOpen(false)}
        inquiries={inquiries}
        loading={inquiriesLoading}
      />

      {/* MODAL: Login Function for Brand and Creator */}
      <LoginModal
        isOpen={isAuthOpen}
        initialRole={authInitialRole}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={async (session) => {
          setUserSession(session);
          setIsAuthOpen(false);
          await loadCreators();
          if (session.role === 'creator' && session.createdCreator) {
            handleSelectCreator(session.createdCreator);
            showToast(`Added @${session.createdCreator.handle.replace('@', '')} to Creator Match database!`);
          } else {
            const label =
              session.role === 'brand' ? session.data.company : session.data.name;
            showToast(`Signed in to ${label} (${session.role} account).`);
          }
        }}
      />

      {/* Minimal Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
