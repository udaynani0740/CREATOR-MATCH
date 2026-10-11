-- ==============================================================================
-- CreatorMatch AI - Supabase Database Schema & Row Level Security (RLS) Policies
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. CREATORS TABLE
CREATE TABLE IF NOT EXISTS public.creators (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  email TEXT,
  verified BOOLEAN DEFAULT true,
  avatar TEXT,
  banner TEXT,
  headline TEXT,
  bio TEXT,
  niche TEXT NOT NULL,
  primary_platform TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  engagement_rate NUMERIC(4,2) DEFAULT 0,
  average_views INTEGER DEFAULT 0,
  location JSONB NOT NULL DEFAULT '{"country":"United States","city":"New York","flag":"🇺🇸"}'::jsonb,
  channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  audience_demographics JSONB,
  collaboration_rates JSONB,
  past_brands TEXT[] DEFAULT '{}',
  recent_content JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public creators are viewable by everyone" ON public.creators;
DROP POLICY IF EXISTS "Creators can insert profile" ON public.creators;
DROP POLICY IF EXISTS "Creators can update own profile" ON public.creators;
DROP POLICY IF EXISTS "Creators can delete own profile" ON public.creators;

-- RLS Policies for Creators
CREATE POLICY "Public creators are viewable by everyone" 
  ON public.creators FOR SELECT USING (true);

CREATE POLICY "Creators can insert profile" 
  ON public.creators FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update own profile" 
  ON public.creators FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Creators can delete own profile" 
  ON public.creators FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 2. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  budget_range TEXT,
  location JSONB NOT NULL DEFAULT '{"country":"United States","city":"New York"}'::jsonb,
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brands viewable by everyone" ON public.brands;
DROP POLICY IF EXISTS "Brands can insert profile" ON public.brands;
DROP POLICY IF EXISTS "Brands can update own profile" ON public.brands;

CREATE POLICY "Brands viewable by everyone" 
  ON public.brands FOR SELECT USING (true);

CREATE POLICY "Brands can insert profile" 
  ON public.brands FOR INSERT WITH CHECK (true);

CREATE POLICY "Brands can update own profile" 
  ON public.brands FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- 3. COLLABORATION INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.collaboration_inquiries (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  campaign_objective TEXT,
  selected_deliverables TEXT[] DEFAULT '{}',
  estimated_budget NUMERIC DEFAULT 0,
  timeline TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.collaboration_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.collaboration_inquiries;
DROP POLICY IF EXISTS "Anyone can view inquiries" ON public.collaboration_inquiries;

CREATE POLICY "Anyone can submit inquiry" 
  ON public.collaboration_inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view inquiries" 
  ON public.collaboration_inquiries FOR SELECT USING (true);

-- 4. Create Indexes for fast searching & filtering
CREATE INDEX IF NOT EXISTS idx_creators_niche ON public.creators(niche);
CREATE INDEX IF NOT EXISTS idx_creators_platform ON public.creators(primary_platform);
CREATE INDEX IF NOT EXISTS idx_creators_followers ON public.creators(followers DESC);
CREATE INDEX IF NOT EXISTS idx_creators_engagement ON public.creators(engagement_rate DESC);
