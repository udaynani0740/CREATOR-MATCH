import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ArrowRight, Bookmark, Copy, Check } from 'lucide-react';
import type { Creator } from '../types.js';
import { formatFollowers, formatCurrency } from '../utils/formatters.js';

interface SavedCreatorsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedCreators: Creator[];
  onRemove: (id: string) => void;
  onSelectCreator: (creator: Creator) => void;
}

export const SavedCreatorsDrawer: React.FC<SavedCreatorsDrawerProps> = ({
  isOpen,
  onClose,
  savedCreators,
  onRemove,
  onSelectCreator,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalReach = savedCreators.reduce((acc, c) => acc + c.followers, 0);
  const totalEstimatedCost = savedCreators.reduce(
    (acc, c) => acc + (c.collaborationRates.integratedSegment || 15000),
    0
  );

  const handleExport = () => {
    const text = savedCreators
      .map(
        (c) =>
          `${c.name} (${c.handle}) | Reach: ${formatFollowers(c.followers)} | Niche: ${c.niche} | Est. Integration: ${formatCurrency(
            c.collaborationRates.integratedSegment
          )}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/40 backdrop-blur-2xs transition-opacity"
        />

        {/* Slide-over panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col h-full z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-white">
                <Bookmark className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Campaign Shortlist</h3>
                <p className="text-[11px] text-stone-600">
                  {savedCreators.length} selected influencer{savedCreators.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Aggregate Summary */}
          {savedCreators.length > 0 && (
            <div className="border-b border-stone-100 bg-stone-50/70 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-stone-200 bg-white p-3">
                  <div className="text-[11px] text-stone-600 font-medium">Combined Reach</div>
                  <div className="text-base font-bold text-stone-900 mt-0.5">
                    {formatFollowers(totalReach)}
                  </div>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-3">
                  <div className="text-[11px] text-stone-600 font-medium">Est. Campaign Cost</div>
                  <div className="text-base font-bold text-stone-900 mt-0.5">
                    {formatCurrency(totalEstimatedCost)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 hover:text-stone-950 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-800" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied Summary!' : 'Copy Campaign Summary'}</span>
                </button>
              </div>
            </div>
          )}

          {/* List of shortlisted creators */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedCreators.length === 0 ? (
              <div className="py-16 text-center text-xs text-stone-600 space-y-2">
                <Bookmark className="mx-auto h-8 w-8 text-stone-300" />
                <p className="font-semibold text-stone-800">Your shortlist is currently empty</p>
                <p className="max-w-xs mx-auto text-stone-600">
                  Bookmark creator profiles while browsing to curate your ideal influencer marketing lineup.
                </p>
              </div>
            ) : (
              savedCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3 hover:border-stone-400/80 transition-all shadow-2xs"
                >
                  <div
                    onClick={() => {
                      onSelectCreator(creator);
                      onClose();
                    }}
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-stone-900 truncate">
                        {creator.name}
                      </div>
                      <div className="text-[11px] text-stone-600 truncate">
                        {creator.handle} · {formatFollowers(creator.followers)}
                      </div>
                      <div className="text-[10px] text-stone-600 mt-0.5">
                        {formatCurrency(creator.collaborationRates.integratedSegment)} / integration
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pl-2">
                    <button
                      onClick={() => onRemove(creator.id)}
                      title="Remove from shortlist"
                      className="p-1.5 text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectCreator(creator);
                        onClose();
                      }}
                      title="View full dossier"
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
