export type PlatformType = 'YouTube' | 'TikTok' | 'Instagram' | 'Substack' | 'Podcast';

export interface ChannelInfo {
  platform: PlatformType | string;
  handle: string;
  followers: number;
  url: string;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: string;
  views: string;
  date: string;
  thumbnail: string;
  url: string;
}

export interface AudienceDemographics {
  topCountries: { country: string; percent: number }[];
  ageRanges: { range: string; percent: number }[];
  genderSplit: { male: number; female: number; other: number };
}

export interface CollaborationRates {
  dedicatedVideo?: number;
  shortForm?: number;
  integratedSegment?: number;
  newsletterMention?: number;
  currency: string;
}

export interface CreatorLocation {
  city: string;
  state?: string;
  country: string;
  flag: string;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  verified: boolean;
  avatar: string;
  banner: string;
  headline: string;
  bio: string;
  niche: string;
  location: CreatorLocation;
  primaryPlatform: PlatformType;
  followers: number;
  engagementRate: number;
  averageViews: number;
  channels: ChannelInfo[];
  audienceDemographics: AudienceDemographics;
  collaborationRates: CollaborationRates;
  pastBrands: string[];
  recentContent: ContentItem[];
  tags: string[];
  isCustom?: boolean;
  createdAt: string;
}

export interface CollaborationInquiry {
  id: string;
  creatorId: string;
  creatorName: string;
  brandName: string;
  contactEmail: string;
  campaignObjective: string;
  selectedDeliverables: string[];
  estimatedBudget: number;
  timeline: string;
  notes?: string;
  status: 'pending' | 'reviewed' | 'accepted';
  createdAt: string;
}

export interface CreatorFilterOptions {
  search: string;
  platform: string;
  niche: string;
  followerTier: string;
  minEngagement: number;
  country: string;
  state: string;
  city: string;
  sortBy: 'followers_desc' | 'engagement_desc' | 'views_desc' | 'name_asc';
  onlySaved: boolean;
}

export interface BrandProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  industry: string;
  website: string;
  budgetRange: string;
  location: {
    country: string;
    state?: string;
    city: string;
  };
  goals: string[];
  createdAt: string;
}

export interface CreatorUserProfile {
  id: string;
  creatorId: string;
  name: string;
  handle: string;
  email: string;
  primaryPlatform: PlatformType;
  profileUrl: string;
  niche: string;
  location: CreatorLocation;
  followers: number;
  engagementRate: number;
  averageViews: number;
  bio: string;
  rates: {
    dedicatedVideo?: number;
    integratedSegment?: number;
    shortForm?: number;
  };
  createdAt: string;
}

export type UserSession =
  | { role: 'brand'; data: BrandProfile }
  | { role: 'creator'; data: CreatorUserProfile; createdCreator?: Creator };
