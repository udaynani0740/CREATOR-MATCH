import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Bookmark, ArrowUpRight, TrendingUp, Users, Eye } from 'lucide-react';
import type { Creator } from '../types.js';
import { formatFollowers, formatCurrency } from '../utils/formatters.js';

interface CreatorCardProps {
  creator: Creator;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelect: (creator: Creator) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  isSaved,
  onToggleSave,
  onSelect,
}) => {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={() => onSelect(creator)}
      className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs hover:border-stone-400/90 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-stone-200"
                loading="lazy"
                onError={(e) => {
                  // Fallback avatar
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    creator.name
                  )}&background=1c1917&color=fafaf9`;
                }}
              />
              {creator.verified && (
                <div
                  title="Verified Creator"
                  className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white text-emerald-800"
                >
                  <CheckCircle2 className="h-4 w-4 fill-emerald-100 text-emerald-800" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-bold text-stone-900 text-sm tracking-tight group-hover:text-stone-950">
                  {creator.name}
                </h3>
                {creator.isCustom && (
                  <span className="text-[10px] text-stone-600 font-mono">
                    (Custom)
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-stone-600 font-medium">
                {creator.handle}
              </p>
            </div>
          </div>

          {/* Quick Actions (Bookmark) */}
          <button
            onClick={(e) => onToggleSave(creator.id, e)}
            title={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
            className={`rounded-lg p-1.5 transition-colors ${
              isSaved
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Unboxed Metadata Line with typographic separators (Anti-Slop rule: Zero static pills) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
          <span className="font-semibold text-stone-700">{creator.primaryPlatform}</span>
          <span aria-hidden="true" className="text-stone-400">·</span>
          <span>{creator.niche}</span>
          <span aria-hidden="true" className="text-stone-400">·</span>
          <span>
            {creator.location.city}, {creator.location.country}
          </span>
        </div>

        {/* Headline */}
        <p className="mt-2.5 text-xs leading-relaxed text-stone-650 line-clamp-2">
          {creator.headline}
        </p>

        {/* Tags (Zero pills: clean unboxed quiet text) */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-600">
          {creator.tags.slice(0, 4).map((tag, idx) => (
            <span key={tag} className="hover:text-stone-700">
              #{tag}
              {idx < Math.min(creator.tags.length - 1, 3) && (
                <span className="ml-2 text-stone-400">·</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics Matrix */}
      <div className="mt-5 border-t border-stone-100 pt-3.5">
        <div className="grid grid-cols-3 gap-2 text-left">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium">
              <Users className="h-3 w-3" />
              <span>Reach</span>
            </div>
            <div className="font-bold text-stone-900 text-sm tracking-tight mt-0.5">
              {formatFollowers(creator.followers)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium">
              <TrendingUp className="h-3 w-3 text-emerald-800" />
              <span>Eng. Rate</span>
            </div>
            <div className="font-bold text-stone-900 text-sm tracking-tight mt-0.5">
              {creator.engagementRate}%
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium">
              <Eye className="h-3 w-3" />
              <span>Avg. Views</span>
            </div>
            <div className="font-bold text-stone-900 text-sm tracking-tight mt-0.5">
              {formatFollowers(creator.averageViews)}
            </div>
          </div>
        </div>

        {/* Footer row: Past brands preview + View Profile link */}
        <div className="mt-3.5 flex items-center justify-between border-t border-stone-100/80 pt-2.5 text-[11px]">
          <div className="text-stone-600 truncate max-w-[190px]">
            <span className="font-medium text-stone-600">Collabs: </span>
            <span>{creator.pastBrands.slice(0, 3).join(', ')}</span>
          </div>

          <div className="flex items-center gap-0.5 font-semibold text-stone-800 group-hover:text-stone-950 transition-colors">
            <span>View dossier</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};
