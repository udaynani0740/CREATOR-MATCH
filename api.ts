import type {
  Creator,
  CollaborationInquiry,
  CreatorFilterOptions,
  BrandProfile,
  CreatorUserProfile,
} from './types.js';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';
import initialCreatorsData from './data/creators.json';

const INITIAL_CREATORS: Creator[] = initialCreatorsData as Creator[];

// Local storage keys for resilient offline/mock fallback
const LOCAL_CUSTOM_CREATORS_KEY = 'creatorindex_custom_creators';
const LOCAL_INQUIRIES_KEY = 'creatorindex_inquiries';
const LOCAL_BRANDS_KEY = 'creatorindex_brands';

function getLocalCustomCreators(): Creator[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_CREATORS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomCreator(creator: Creator): void {
  try {
    const current = getLocalCustomCreators().filter((c) => c.id !== creator.id && c.handle.toLowerCase() !== creator.handle.toLowerCase());
    current.unshift(creator);
    localStorage.setItem(LOCAL_CUSTOM_CREATORS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save creator to localStorage:', e);
  }
}

function deleteLocalCreator(id: string): void {
  try {
    const current = getLocalCustomCreators().filter((c) => c.id !== id);
    localStorage.setItem(LOCAL_CUSTOM_CREATORS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to remove creator from localStorage:', e);
  }
}

// Convert DB snake_case to TS camelCase
function fromDbCreator(row: any): Creator {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    verified: Boolean(row.verified),
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    banner: row.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
    headline: row.headline || '',
    bio: row.bio || '',
    niche: row.niche || 'Tech & Electronics',
    location: row.location || { country: 'United States', city: 'New York', flag: '🇺🇸' },
    primaryPlatform: row.primary_platform || row.primaryPlatform || 'YouTube',
    followers: Number(row.followers) || 0,
    engagementRate: Number(row.engagement_rate || row.engagementRate) || 0,
    averageViews: Number(row.average_views || row.averageViews) || 0,
    channels: Array.isArray(row.channels) ? row.channels : [],
    audienceDemographics: row.audience_demographics || row.audienceDemographics || {
      topCountries: [{ country: 'United States', percent: 50 }],
      ageRanges: [{ range: '25-34', percent: 45 }],
      genderSplit: { male: 50, female: 50, other: 0 },
    },
    collaborationRates: row.collaboration_rates || row.collaborationRates || { currency: 'USD' },
    pastBrands: Array.isArray(row.past_brands) ? row.past_brands : row.pastBrands || [],
    recentContent: Array.isArray(row.recent_content) ? row.recent_content : row.recentContent || [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    isCustom: Boolean(row.is_custom !== undefined ? row.is_custom : row.isCustom),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

// Convert TS Creator to DB row
function toDbCreator(c: Partial<Creator>, userId?: string | null): any {
  return {
    id: c.id,
    user_id: userId || null,
    name: c.name,
    handle: c.handle,
    verified: c.verified !== undefined ? c.verified : true,
    avatar: c.avatar,
    banner: c.banner,
    headline: c.headline,
    bio: c.bio,
    niche: c.niche,
    primary_platform: c.primaryPlatform,
    followers: c.followers,
    engagement_rate: c.engagementRate,
    average_views: c.averageViews,
    location: c.location,
    channels: c.channels,
    audience_demographics: c.audienceDemographics,
    collaboration_rates: c.collaborationRates,
    past_brands: c.pastBrands,
    recent_content: c.recentContent,
    tags: c.tags,
    is_custom: true,
    created_at: c.createdAt || new Date().toISOString(),
  };
}

export async function fetchCreators(options?: Partial<CreatorFilterOptions>): Promise<Creator[]> {
  let allCreators: Creator[] = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('followers', { ascending: false });

      if (error) {
        console.warn('Supabase query error, falling back to local dataset:', error.message);
        allCreators = [...getLocalCustomCreators(), ...INITIAL_CREATORS];
      } else if (data && data.length > 0) {
        allCreators = data.map(fromDbCreator);
      } else {
        // Table is empty, use initial creators
        allCreators = [...getLocalCustomCreators(), ...INITIAL_CREATORS];
      }
    } catch (e) {
      console.error('Failed to fetch from Supabase:', e);
      allCreators = [...getLocalCustomCreators(), ...INITIAL_CREATORS];
    }
  } else {
    // Local / fallback mode
    allCreators = [...getLocalCustomCreators(), ...INITIAL_CREATORS];
  }

  // Deduplicate creators by handle
  const uniqueMap = new Map<string, Creator>();
  for (const c of allCreators) {
    const key = c.handle.toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, c);
    }
  }
  let filtered = Array.from(uniqueMap.values());

  // Apply filters
  if (options?.search) {
    const query = options.search.toLowerCase().trim();
    filtered = filtered.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      c.handle.toLowerCase().includes(query) ||
      c.headline.toLowerCase().includes(query) ||
      c.bio.toLowerCase().includes(query) ||
      c.niche.toLowerCase().includes(query) ||
      c.location.city.toLowerCase().includes(query) ||
      (c.location.state && c.location.state.toLowerCase().includes(query)) ||
      c.location.country.toLowerCase().includes(query) ||
      c.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  if (options?.platform && options.platform !== 'all') {
    filtered = filtered.filter(
      (c) =>
        c.primaryPlatform.toLowerCase() === options.platform!.toLowerCase() ||
        c.channels.some((ch) => ch.platform.toLowerCase() === options.platform!.toLowerCase())
    );
  }

  if (options?.niche && options.niche !== 'all') {
    filtered = filtered.filter((c) => c.niche.toLowerCase() === options.niche!.toLowerCase());
  }

  if (options?.followerTier && options.followerTier !== 'all') {
    filtered = filtered.filter((c) => {
      if (options.followerTier === 'nano') return c.followers < 50000;
      if (options.followerTier === 'micro') return c.followers >= 50000 && c.followers < 250000;
      if (options.followerTier === 'mid') return c.followers >= 250000 && c.followers < 1000000;
      if (options.followerTier === 'macro') return c.followers >= 1000000 && c.followers < 5000000;
      if (options.followerTier === 'mega') return c.followers >= 5000000;
      return true;
    });
  }

  if (options?.minEngagement && options.minEngagement > 0) {
    filtered = filtered.filter((c) => c.engagementRate >= options.minEngagement!);
  }

  if (options?.country && options.country !== 'all') {
    filtered = filtered.filter((c) => c.location.country.toLowerCase() === options.country!.toLowerCase());
  }

  if (options?.state && options.state !== 'all') {
    filtered = filtered.filter((c) => (c.location.state || '').toLowerCase() === options.state!.toLowerCase());
  }

  if (options?.city && options.city !== 'all') {
    filtered = filtered.filter((c) => c.location.city.toLowerCase() === options.city!.toLowerCase());
  }

  // Sorting
  if (options?.sortBy === 'followers_desc') {
    filtered.sort((a, b) => b.followers - a.followers);
  } else if (options?.sortBy === 'engagement_desc') {
    filtered.sort((a, b) => b.engagementRate - a.engagementRate);
  } else if (options?.sortBy === 'views_desc') {
    filtered.sort((a, b) => b.averageViews - a.averageViews);
  } else if (options?.sortBy === 'name_asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return filtered;
}

export async function fetchCreatorById(id: string): Promise<Creator> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return fromDbCreator(data);
      }
    } catch (e) {
      console.warn('Error fetching creator by id from Supabase:', e);
    }
  }

  const all = [...getLocalCustomCreators(), ...INITIAL_CREATORS];
  const found = all.find((c) => c.id === id);
  if (found) return found;

  throw new Error('Creator profile not found');
}

export async function createCreator(creatorData: Partial<Creator>): Promise<Creator> {
  const followers = Number(creatorData.followers) || 10000;
  const engagementRate = Number(creatorData.engagementRate) || 4.5;
  const averageViews = Number(creatorData.averageViews) || Math.round(followers * 0.15);
  const handle = creatorData.handle?.startsWith('@') ? creatorData.handle.trim() : `@${(creatorData.handle || 'creator').trim()}`;
  const id = `cre_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newCreator: Creator = {
    id,
    name: creatorData.name?.trim() || 'New Creator',
    handle,
    verified: creatorData.verified !== undefined ? Boolean(creatorData.verified) : true,
    avatar: creatorData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
    banner: creatorData.banner || `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80`,
    headline: creatorData.headline?.trim() || `${creatorData.niche || 'Digital'} creator sharing authentic insights & stories.`,
    bio: creatorData.bio?.trim() || `Creator dedicated to ${(creatorData.niche || 'creative').toLowerCase()} content and high-quality audience connections.`,
    niche: creatorData.niche || 'Tech & Electronics',
    location: creatorData.location || {
      city: 'New York',
      state: 'New York',
      country: 'United States',
      flag: '🇺🇸',
    },
    primaryPlatform: creatorData.primaryPlatform || 'YouTube',
    followers,
    engagementRate,
    averageViews,
    channels: creatorData.channels?.length ? creatorData.channels : [
      {
        platform: creatorData.primaryPlatform || 'YouTube',
        handle,
        followers,
        url: `https://${(creatorData.primaryPlatform || 'youtube').toLowerCase()}.com`,
      },
    ],
    audienceDemographics: creatorData.audienceDemographics || {
      topCountries: [
        { country: creatorData.location?.country || 'United States', percent: 52 },
        { country: 'United Kingdom', percent: 16 },
        { country: 'Canada', percent: 12 },
        { country: 'Australia', percent: 8 },
      ],
      ageRanges: [
        { range: '18-24', percent: 32 },
        { range: '25-34', percent: 46 },
        { range: '35-44', percent: 16 },
        { range: '45+', percent: 6 },
      ],
      genderSplit: { male: 52, female: 46, other: 2 },
    },
    collaborationRates: creatorData.collaborationRates || {
      dedicatedVideo: Math.round(followers * 0.005) * 10,
      integratedSegment: Math.round(followers * 0.0025) * 10,
      shortForm: Math.round(followers * 0.0015) * 10,
      currency: 'USD',
    },
    pastBrands: creatorData.pastBrands || ['Brand Partners'],
    recentContent: creatorData.recentContent || [
      {
        id: `rc_${Date.now()}`,
        title: `Latest Release: ${creatorData.name}'s Deep Dive`,
        platform: creatorData.primaryPlatform || 'YouTube',
        views: `${Math.round(averageViews / 1000)}K`,
        date: 'Recently uploaded',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        url: '#',
      },
    ],
    tags: creatorData.tags?.length ? creatorData.tags : [creatorData.niche || 'Creator', 'Verified'],
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id || null;
      const dbPayload = toDbCreator(newCreator, userId);

      const { data, error } = await supabase
        .from('creators')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert failed, saving to local storage:', error.message);
        saveLocalCustomCreator(newCreator);
      } else if (data) {
        return fromDbCreator(data);
      }
    } catch (e) {
      console.error('Error inserting into Supabase:', e);
      saveLocalCustomCreator(newCreator);
    }
  } else {
    saveLocalCustomCreator(newCreator);
  }

  return newCreator;
}

export async function updateCreator(id: string, updates: Partial<Creator>): Promise<Creator> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.handle) dbUpdates.handle = updates.handle;
      if (updates.niche) dbUpdates.niche = updates.niche;
      if (updates.primaryPlatform) dbUpdates.primary_platform = updates.primaryPlatform;
      if (updates.followers) dbUpdates.followers = updates.followers;
      if (updates.engagementRate) dbUpdates.engagement_rate = updates.engagementRate;
      if (updates.averageViews) dbUpdates.average_views = updates.averageViews;
      if (updates.bio) dbUpdates.bio = updates.bio;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.collaborationRates) dbUpdates.collaboration_rates = updates.collaborationRates;

      const { data, error } = await supabase
        .from('creators')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return fromDbCreator(data);
      }
    } catch (e) {
      console.warn('Supabase update failed:', e);
    }
  }

  const custom = getLocalCustomCreators();
  const index = custom.findIndex((c) => c.id === id);
  if (index >= 0) {
    custom[index] = { ...custom[index], ...updates };
    localStorage.setItem(LOCAL_CUSTOM_CREATORS_KEY, JSON.stringify(custom));
    return custom[index];
  }

  throw new Error('Failed to update creator profile');
}

export async function deleteCreator(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('creators').delete().eq('id', id);
      if (error) console.warn('Supabase delete error:', error.message);
    } catch (e) {
      console.warn('Error deleting from Supabase:', e);
    }
  }
  deleteLocalCreator(id);
}

export async function resetDatabase(): Promise<Creator[]> {
  localStorage.removeItem(LOCAL_CUSTOM_CREATORS_KEY);
  return INITIAL_CREATORS;
}

export async function submitInquiry(inquiryData: Partial<CollaborationInquiry>): Promise<CollaborationInquiry> {
  const newInquiry: CollaborationInquiry = {
    id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    creatorId: inquiryData.creatorId || '',
    creatorName: inquiryData.creatorName || 'Creator',
    brandName: inquiryData.brandName || 'Brand',
    contactEmail: inquiryData.contactEmail || '',
    campaignObjective: inquiryData.campaignObjective || 'Brand Awareness',
    selectedDeliverables: inquiryData.selectedDeliverables || ['Dedicated Video'],
    estimatedBudget: Number(inquiryData.estimatedBudget) || 10000,
    timeline: inquiryData.timeline || 'Within 30 days',
    notes: inquiryData.notes || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('collaboration_inquiries').insert({
        id: newInquiry.id,
        creator_id: newInquiry.creatorId,
        creator_name: newInquiry.creatorName,
        brand_name: newInquiry.brandName,
        contact_email: newInquiry.contactEmail,
        campaign_objective: newInquiry.campaignObjective,
        selected_deliverables: newInquiry.selectedDeliverables,
        estimated_budget: newInquiry.estimatedBudget,
        timeline: newInquiry.timeline,
        notes: newInquiry.notes,
        status: newInquiry.status,
        created_at: newInquiry.createdAt,
      });

      if (error) console.warn('Supabase inquiry insert warning:', error.message);
    } catch (e) {
      console.warn('Failed to insert inquiry into Supabase:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    const list: CollaborationInquiry[] = raw ? JSON.parse(raw) : [];
    list.unshift(newInquiry);
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save inquiry to localStorage:', e);
  }

  return newInquiry;
}

export async function fetchInquiries(): Promise<CollaborationInquiry[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('collaboration_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          creatorId: row.creator_id,
          creatorName: row.creator_name,
          brandName: row.brand_name,
          contactEmail: row.contact_email,
          campaignObjective: row.campaign_objective,
          selectedDeliverables: row.selected_deliverables || [],
          estimatedBudget: Number(row.estimated_budget) || 0,
          timeline: row.timeline,
          notes: row.notes,
          status: row.status as any,
          createdAt: row.created_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching inquiries from Supabase:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function loginBrand(data: Partial<BrandProfile> & { password?: string }): Promise<BrandProfile> {
  const email = data.email?.trim().toLowerCase();
  if (!email) {
    throw new Error('Work email is required');
  }

  const brandProfile: BrandProfile = {
    id: data.id || `brand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name?.trim() || data.company?.trim() || 'Brand Partner',
    company: data.company?.trim() || 'Partner Company',
    email,
    industry: data.industry || 'Technology & Software',
    website: data.website?.trim() || '',
    budgetRange: data.budgetRange || '$10,000 – $50,000 / mo',
    location: data.location || { country: 'United States', city: 'New York' },
    goals: data.goals || ['Brand Awareness', 'Direct Conversions'],
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Authenticate with Supabase Auth
      const authPassword = data.password?.trim() || `BrandPass_${email.replace(/[^a-zA-Z0-9]/g, '')}_2026!`;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: authPassword,
        options: {
          data: {
            role: 'brand',
            company: brandProfile.company,
            name: brandProfile.name,
          },
        },
      });

      let userId = signUpData.user?.id;

      // If user already registered, log them in
      if (signUpError && (signUpError.message.toLowerCase().includes('already') || signUpError.status === 400)) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: authPassword,
        });
        if (!signInError && signInData.user) {
          userId = signInData.user.id;
        }
      }

      // 2. Upsert Brand profile in Supabase table
      const { data: dbBrand, error: dbError } = await supabase
        .from('brands')
        .upsert({
          id: brandProfile.id,
          user_id: userId || null,
          name: brandProfile.name,
          company: brandProfile.company,
          email: brandProfile.email,
          industry: brandProfile.industry,
          website: brandProfile.website,
          budget_range: brandProfile.budgetRange,
          location: brandProfile.location,
          goals: brandProfile.goals,
          created_at: brandProfile.createdAt,
        })
        .select()
        .single();

      if (!dbError && dbBrand) {
        brandProfile.id = dbBrand.id;
      }
    } catch (e: any) {
      console.warn('Supabase brand auth notice:', e?.message || e);
    }
  }

  // Persist locally
  try {
    const raw = localStorage.getItem(LOCAL_BRANDS_KEY);
    const brands: BrandProfile[] = raw ? JSON.parse(raw) : [];
    const idx = brands.findIndex((b) => b.email.toLowerCase() === email);
    if (idx >= 0) brands[idx] = brandProfile;
    else brands.unshift(brandProfile);
    localStorage.setItem(LOCAL_BRANDS_KEY, JSON.stringify(brands));
  } catch (e) {
    console.error('Error saving brand locally:', e);
  }

  return brandProfile;
}

export async function loginCreator(
  data: any
): Promise<{ user: CreatorUserProfile; creatorProfile: Creator }> {
  const email = data.email?.trim().toLowerCase();
  const name = data.name?.trim();
  const rawHandle = data.handle?.trim();

  if (!email || !name || !rawHandle) {
    throw new Error('Name, handle, and email are required');
  }

  const cleanHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
  const followers = Number(data.followers) || 25000;
  const engagementRate = Number(data.engagementRate) || 4.5;
  const averageViews = Number(data.averageViews) || Math.round(followers * 0.2);
  const primaryPlatform = data.primaryPlatform || 'YouTube';
  const niche = data.niche || 'Tech & Electronics';
  const location = data.location || { city: 'New York', state: 'New York', country: 'United States', flag: '🇺🇸' };
  const bio = data.bio?.trim() || `${niche} creator dedicated to authentic storytelling.`;

  let userId: string | null = null;

  // Supabase Auth Integration
  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Check for handle duplicate in Supabase
      const { data: existingHandleRows } = await supabase
        .from('creators')
        .select('id, handle, email')
        .ilike('handle', cleanHandle);

      if (existingHandleRows && existingHandleRows.length > 0) {
        const match = existingHandleRows[0];
        // If handle belongs to another email
        if (match.email && match.email.toLowerCase() !== email) {
          throw new Error(`The handle ${cleanHandle} is already registered to another creator account.`);
        }
      }

      // 2. Sign up or sign in to Supabase Auth
      const authPassword = data.password?.trim() || `Creator_${cleanHandle.replace(/[^a-zA-Z0-9]/g, '')}_2026!`;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: authPassword,
        options: {
          data: {
            role: 'creator',
            name,
            handle: cleanHandle,
          },
        },
      });

      if (signUpData?.user) {
        userId = signUpData.user.id;
      }

      // If user already exists, sign in
      if (signUpError && (signUpError.message.toLowerCase().includes('already') || signUpError.status === 400)) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: authPassword,
        });

        if (signInError && !signInError.message.toLowerCase().includes('invalid login')) {
          console.warn('Supabase sign-in note:', signInError.message);
        } else if (signInData?.user) {
          userId = signInData.user.id;
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        throw err;
      }
      console.warn('Supabase auth proceeding with profile synchronization:', err.message);
    }
  }

  // 3. Create or update creator profile in directory
  const creatorProfileData: Partial<Creator> = {
    name,
    handle: cleanHandle,
    niche,
    primaryPlatform,
    location,
    followers,
    engagementRate,
    averageViews,
    bio,
    channels: [
      {
        platform: primaryPlatform,
        handle: cleanHandle,
        followers,
        url: data.profileUrl || `https://${primaryPlatform.toLowerCase()}.com`,
      },
    ],
    collaborationRates: {
      dedicatedVideo: data.rates?.dedicatedVideo || Math.round(followers * 0.005) * 10,
      integratedSegment: data.rates?.integratedSegment || Math.round(followers * 0.0025) * 10,
      shortForm: data.rates?.shortForm || Math.round(followers * 0.0015) * 10,
      currency: 'USD',
    },
  };

  // Find if creator exists in current roster
  let creatorProfile: Creator;
  const existingList = await fetchCreators();
  const existing = existingList.find((c) => c.handle.toLowerCase() === cleanHandle.toLowerCase());

  if (existing) {
    creatorProfile = await updateCreator(existing.id, creatorProfileData);
  } else {
    creatorProfile = await createCreator(creatorProfileData);
  }

  // Construct authenticated creator user profile
  const user: CreatorUserProfile = {
    id: `cru_${Date.now()}`,
    creatorId: creatorProfile.id,
    name,
    handle: cleanHandle,
    email,
    primaryPlatform,
    profileUrl: data.profileUrl || '',
    niche,
    location,
    followers,
    engagementRate,
    averageViews,
    bio,
    rates: creatorProfile.collaborationRates || {},
    createdAt: new Date().toISOString(),
  };

  return { user, creatorProfile };
}
