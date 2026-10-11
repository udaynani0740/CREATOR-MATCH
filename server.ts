import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API: Get all creators with filters & sorting
app.get('/api/creators', (req: Request, res: Response) => {
  try {
    let creators = db.getCreators();
    const { q, platform, niche, followerTier, minEngagement, country, state, city, sortBy } = req.query;

    if (q && typeof q === 'string') {
      const query = q.toLowerCase().trim();
      creators = creators.filter((c) =>
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

    if (platform && typeof platform === 'string' && platform !== 'all') {
      creators = creators.filter(
        (c) => c.primaryPlatform.toLowerCase() === platform.toLowerCase() ||
               c.channels.some((ch) => ch.platform.toLowerCase() === platform.toLowerCase())
      );
    }

    if (niche && typeof niche === 'string' && niche !== 'all') {
      creators = creators.filter((c) => c.niche.toLowerCase() === niche.toLowerCase());
    }

    // Country Filter
    if (country && typeof country === 'string' && country !== 'all') {
      creators = creators.filter(
        (c) => c.location.country.toLowerCase() === country.toLowerCase()
      );
    }

    // State / Region Filter
    if (state && typeof state === 'string' && state !== 'all') {
      creators = creators.filter(
        (c) => (c.location.state || '').toLowerCase() === state.toLowerCase()
      );
    }

    // City Filter
    if (city && typeof city === 'string' && city !== 'all') {
      creators = creators.filter(
        (c) => c.location.city.toLowerCase() === city.toLowerCase()
      );
    }

    if (followerTier && typeof followerTier === 'string' && followerTier !== 'all') {
      creators = creators.filter((c) => {
        if (followerTier === 'nano') return c.followers < 50000;
        if (followerTier === 'micro') return c.followers >= 50000 && c.followers < 250000;
        if (followerTier === 'mid') return c.followers >= 250000 && c.followers < 1000000;
        if (followerTier === 'macro') return c.followers >= 1000000 && c.followers < 5000000;
        if (followerTier === 'mega') return c.followers >= 5000000;
        return true;
      });
    }

    if (minEngagement && typeof minEngagement === 'string') {
      const min = parseFloat(minEngagement);
      if (!isNaN(min) && min > 0) {
        creators = creators.filter((c) => c.engagementRate >= min);
      }
    }

    // Sorting
    if (sortBy === 'followers_desc') {
      creators.sort((a, b) => b.followers - a.followers);
    } else if (sortBy === 'engagement_desc') {
      creators.sort((a, b) => b.engagementRate - a.engagementRate);
    } else if (sortBy === 'views_desc') {
      creators.sort((a, b) => b.averageViews - a.averageViews);
    } else if (sortBy === 'name_asc') {
      creators.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({ success: true, count: creators.length, data: creators });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch creators' });
  }
});

// API: Get creator by ID
app.get('/api/creators/:id', (req: Request, res: Response) => {
  try {
    const creator = db.getCreatorById(req.params.id);
    if (!creator) {
      return res.status(404).json({ success: false, error: 'Creator not found' });
    }
    res.json({ success: true, data: creator });
  } catch (error) {
    console.error('Error getting creator:', error);
    res.status(500).json({ success: false, error: 'Failed to get creator' });
  }
});

// API: Create new creator profile
app.post('/api/creators', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.name || !body.handle || !body.niche) {
      return res.status(400).json({ success: false, error: 'Name, handle, and niche are required' });
    }

    const followers = Number(body.followers) || 10000;
    const engagementRate = Number(body.engagementRate) || 4.0;
    const averageViews = Number(body.averageViews) || Math.round(followers * 0.15);

    const newCreator = db.createCreator({
      name: body.name.trim(),
      handle: body.handle.startsWith('@') ? body.handle.trim() : `@${body.handle.trim()}`,
      verified: body.verified !== undefined ? Boolean(body.verified) : true,
      avatar: body.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
      banner: body.banner || `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80`,
      headline: body.headline?.trim() || `${body.niche} creator sharing authentic insights & stories.`,
      bio: body.bio?.trim() || `Creator dedicated to ${body.niche.toLowerCase()} content and high-quality audience connections.`,
      niche: body.niche,
      location: {
        city: body.location?.city || 'New York',
        state: body.location?.state || 'New York',
        country: body.location?.country || 'United States',
        flag: body.location?.flag || '🇺🇸',
      },
      primaryPlatform: body.primaryPlatform || 'YouTube',
      followers,
      engagementRate,
      averageViews,
      channels: body.channels?.length ? body.channels : [
        { platform: body.primaryPlatform || 'YouTube', handle: body.handle, followers, url: `https://${(body.primaryPlatform || 'youtube').toLowerCase()}.com` }
      ],
      audienceDemographics: body.audienceDemographics || {
        topCountries: [
          { country: body.location?.country || 'United States', percent: 52 },
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
      collaborationRates: body.collaborationRates || {
        dedicatedVideo: Math.round(followers * 0.005) * 10,
        integratedSegment: Math.round(followers * 0.0025) * 10,
        shortForm: Math.round(followers * 0.0015) * 10,
        currency: 'USD',
      },
      pastBrands: body.pastBrands || ['Brand Partners', 'Direct Sponsors'],
      recentContent: body.recentContent || [
        {
          id: `rc_${Date.now()}`,
          title: `Latest Release: ${body.name}'s Deep Dive`,
          platform: body.primaryPlatform || 'YouTube',
          views: `${Math.round(averageViews / 1000)}K`,
          date: 'Recently uploaded',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          url: '#',
        }
      ],
      tags: body.tags?.length ? body.tags : [body.niche, 'Creator', 'Verified'],
    });

    res.status(201).json({ success: true, data: newCreator });
  } catch (error) {
    console.error('Error creating creator:', error);
    res.status(500).json({ success: false, error: 'Failed to create creator profile' });
  }
});

// API: Update creator
app.put('/api/creators/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateCreator(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Creator not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating creator:', error);
    res.status(500).json({ success: false, error: 'Failed to update creator' });
  }
});

// API: Delete creator
app.delete('/api/creators/:id', (req: Request, res: Response) => {
  try {
    const ok = db.deleteCreator(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Creator not found or cannot delete' });
    }
    res.json({ success: true, message: 'Creator deleted' });
  } catch (error) {
    console.error('Error deleting creator:', error);
    res.status(500).json({ success: false, error: 'Failed to delete creator' });
  }
});

// API: Reset creators to default roster
app.post('/api/creators/reset', (_req: Request, res: Response) => {
  try {
    const creators = db.resetCreators();
    res.json({ success: true, data: creators });
  } catch (error) {
    console.error('Error resetting roster:', error);
    res.status(500).json({ success: false, error: 'Failed to reset creator roster' });
  }
});

// API: Collaboration Inquiries
app.get('/api/inquiries', (_req: Request, res: Response) => {
  try {
    const inquiries = db.getInquiries();
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    console.error('Error getting inquiries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inquiries' });
  }
});

app.post('/api/inquiries', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.creatorId || !body.brandName || !body.contactEmail) {
      return res.status(400).json({ success: false, error: 'Creator ID, brand name, and email are required' });
    }
    const inquiry = db.createInquiry(body);
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ success: false, error: 'Failed to save collaboration inquiry' });
  }
});

// API: Brand Auth & Onboarding
app.post('/api/auth/brand/login', (req: Request, res: Response) => {
  try {
    const { name, company, email, industry, website, budgetRange, location, goals } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Work email is required' });
    }
    const brand = db.saveBrand({
      name: name || company || 'Brand Partner',
      company: company || 'Partner Company',
      email: email.trim().toLowerCase(),
      industry: industry || 'Technology',
      website: website || '',
      budgetRange: budgetRange || '$10,000 – $50,000 / mo',
      location: location || { country: 'United States', city: 'New York' },
      goals: goals || ['Brand Awareness', 'Direct Conversions'],
    });
    res.json({ success: true, data: brand });
  } catch (error) {
    console.error('Error saving brand profile:', error);
    res.status(500).json({ success: false, error: 'Failed to process brand sign-in' });
  }
});

app.get('/api/auth/brand/:email', (req: Request, res: Response) => {
  try {
    const brand = db.getBrandByEmail(req.params.email);
    if (!brand) {
      return res.status(404).json({ success: false, error: 'Brand profile not found' });
    }
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve brand profile' });
  }
});

// API: Creator Auth & Onboarding
app.post('/api/auth/creator/login', (req: Request, res: Response) => {
  try {
    const {
      name,
      handle,
      email,
      primaryPlatform,
      profileUrl,
      niche,
      location,
      followers,
      engagementRate,
      averageViews,
      bio,
      rates,
    } = req.body;

    if (!email || !name || !handle) {
      return res.status(400).json({ success: false, error: 'Name, handle, and email are required' });
    }

    const cleanHandle = handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    const fCount = Number(followers) || 25000;
    const eng = Number(engagementRate) || 4.5;
    const views = Number(averageViews) || Math.round(fCount * 0.2);

    // Also check if creator is already in directory by handle or create one
    let creators = db.getCreators();
    let existing = creators.find(
      (c) => c.handle.toLowerCase() === cleanHandle.toLowerCase()
    );

    if (!existing) {
      existing = db.createCreator({
        name: name.trim(),
        handle: cleanHandle,
        verified: true,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
        headline: `${niche || 'Lifestyle'} creator with a passionate audience.`,
        bio: bio?.trim() || `Dedicated creator connecting with followers through ${niche || 'creative'} content.`,
        niche: niche || 'Tech & Electronics',
        location: location || { city: 'New York', state: 'New York', country: 'United States', flag: '🇺🇸' },
        primaryPlatform: primaryPlatform || 'YouTube',
        followers: fCount,
        engagementRate: eng,
        averageViews: views,
        channels: [
          {
            platform: primaryPlatform || 'YouTube',
            handle: cleanHandle,
            followers: fCount,
            url: profileUrl || `https://${(primaryPlatform || 'youtube').toLowerCase()}.com`,
          },
        ],
        audienceDemographics: {
          topCountries: [
            { country: location?.country || 'United States', percent: 54 },
            { country: 'United Kingdom', percent: 14 },
            { country: 'Canada', percent: 12 },
            { country: 'Australia', percent: 6 },
          ],
          ageRanges: [
            { range: '18-24', percent: 34 },
            { range: '25-34', percent: 46 },
            { range: '35-44', percent: 14 },
            { range: '45+', percent: 6 },
          ],
          genderSplit: { male: 50, female: 48, other: 2 },
        },
        collaborationRates: {
          dedicatedVideo: rates?.dedicatedVideo || Math.round(fCount * 0.005) * 10,
          integratedSegment: rates?.integratedSegment || Math.round(fCount * 0.0025) * 10,
          shortForm: rates?.shortForm || Math.round(fCount * 0.0015) * 10,
          currency: 'USD',
        },
        pastBrands: ['Brand Partners'],
        recentContent: [
          {
            id: `rc_${Date.now()}`,
            title: `Featured: ${name}'s Channel Spotlight`,
            platform: primaryPlatform || 'YouTube',
            views: `${Math.round(views / 1000)}K`,
            date: 'Recent release',
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            url: profileUrl || '#',
          },
        ],
        tags: [niche || 'Creator', primaryPlatform || 'YouTube'],
      });
    } else {
      const updated = db.updateCreator(existing.id, {
        name: name.trim(),
        niche: niche || existing.niche,
        primaryPlatform: primaryPlatform || existing.primaryPlatform,
        location: location || existing.location,
        followers: fCount,
        engagementRate: eng,
        averageViews: views,
        bio: bio?.trim() || existing.bio,
        collaborationRates: {
          ...existing.collaborationRates,
          ...(rates || {}),
        },
      });
      if (updated) existing = updated;
    }

    const creatorUser = {
      id: `cru_${Date.now()}`,
      creatorId: existing.id,
      name,
      handle: cleanHandle,
      email: email.trim().toLowerCase(),
      primaryPlatform: primaryPlatform || 'YouTube',
      profileUrl: profileUrl || '',
      niche: niche || existing.niche,
      location: location || existing.location,
      followers: fCount,
      engagementRate: eng,
      averageViews: views,
      bio: bio || existing.bio,
      rates: rates || existing.collaborationRates,
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, data: creatorUser, creatorProfile: existing });
  } catch (error) {
    console.error('Error during creator sign-in:', error);
    res.status(500).json({ success: false, error: 'Failed to process creator sign-in' });
  }
});

// API: Overview Stats
app.get('/api/stats', (_req: Request, res: Response) => {
  try {
    const creators = db.getCreators();
    const totalFollowers = creators.reduce((acc, c) => acc + c.followers, 0);
    const avgEngagement = creators.length
      ? Number((creators.reduce((acc, c) => acc + c.engagementRate, 0) / creators.length).toFixed(1))
      : 0;
    const niches = Array.from(new Set(creators.map((c) => c.niche)));
    res.json({
      success: true,
      data: {
        totalCreators: creators.length,
        totalFollowers,
        avgEngagement,
        nichesCount: niches.length,
        niches,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// Serve frontend with Vite middlewares in dev, or static in prod
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CreatorMatch] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
