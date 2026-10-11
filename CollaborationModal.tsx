import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import type { Creator, CollaborationInquiry } from '../types.js';
import { formatCurrency } from '../utils/formatters.js';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator | null;
  defaultDeliverable?: string;
  onSubmitInquiry: (inquiry: Partial<CollaborationInquiry>) => Promise<CollaborationInquiry>;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({
  isOpen,
  onClose,
  creator,
  defaultDeliverable,
  onSubmitInquiry,
}) => {
  const [brandName, setBrandName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [campaignObjective, setCampaignObjective] = useState('');
  const [timeline, setTimeline] = useState('Next 30-45 Days');
  const [notes, setNotes] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>(
    defaultDeliverable ? [defaultDeliverable] : ['Integrated Sponsor Segment']
  );
  const [submittedInquiry, setSubmittedInquiry] = useState<CollaborationInquiry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !creator) return null;

  const deliverablesConfig = [
    {
      name: 'Dedicated Full-Length Video',
      price: creator.collaborationRates.dedicatedVideo || 25000,
    },
    {
      name: 'Integrated Sponsor Segment',
      price: creator.collaborationRates.integratedSegment || 12000,
    },
    {
      name: 'Dedicated Short-Form (Reels / TikTok / Shorts)',
      price: creator.collaborationRates.shortForm || 7500,
    },
    {
      name: 'Newsletter Feature / Social Post',
      price: creator.collaborationRates.newsletterMention || 4000,
    },
  ];

  const totalEstimatedBudget = selectedDeliverables.reduce((acc, del) => {
    const item = deliverablesConfig.find((d) => d.name === del);
    return acc + (item?.price || 0);
  }, 0);

  const toggleDeliverable = (name: string) => {
    setSelectedDeliverables((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !contactEmail.trim()) {
      setError('Please provide your brand name and work email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await onSubmitInquiry({
        creatorId: creator.id,
        creatorName: creator.name,
        brandName: brandName.trim(),
        contactEmail: contactEmail.trim(),
        campaignObjective: campaignObjective.trim() || 'Brand awareness and product launch partnership',
        selectedDeliverables,
        estimatedBudget: totalEstimatedBudget,
        timeline,
        notes: notes.trim(),
      });
      setSubmittedInquiry(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit proposal.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmittedInquiry(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl z-10"
        >
          {submittedInquiry ? (
            /* Success confirmation screen */
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-stone-900">
                Collaboration Proposal Dispatched
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Your brief for <strong className="text-stone-900">{creator.name}</strong> has been confirmed and recorded with reference ID{' '}
                <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono font-semibold text-stone-800">
                  {submittedInquiry.id}
                </code>.
              </p>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-600">Creator:</span>
                  <span className="font-semibold text-stone-900">{creator.name} ({creator.handle})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Deliverables:</span>
                  <span className="font-semibold text-stone-900">{submittedInquiry.selectedDeliverables.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Est. Budget:</span>
                  <span className="font-bold text-stone-900">{formatCurrency(submittedInquiry.estimatedBudget)}</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
              >
                Close & Return to Creator
              </button>
            </div>
          ) : (
            /* Standard form */
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-stone-900">
                    Propose Collaboration
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Direct pitch to <strong className="text-stone-800">{creator.name}</strong> ({creator.handle})
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Brand & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Company / Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Acme Studio"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 placeholder:text-stone-600 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Business Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="partnership@acme.com"
                      className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 placeholder:text-stone-600 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Deliverables selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Select Target Deliverables
                  </label>
                  <div className="space-y-2">
                    {deliverablesConfig.map((del) => {
                      const isSelected = selectedDeliverables.includes(del.name);
                      return (
                        <div
                          key={del.name}
                          onClick={() => toggleDeliverable(del.name)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-stone-900 bg-stone-50 font-semibold text-stone-950'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-3.5 w-3.5 accent-stone-900"
                            />
                            <span>{del.name}</span>
                          </div>
                          <span className="font-mono text-stone-900">
                            {formatCurrency(del.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Budget Summary */}
                <div className="flex items-center justify-between rounded-xl bg-stone-100/90 p-3.5 text-xs border border-stone-200/80">
                  <span className="font-semibold text-stone-700">Estimated Project Total:</span>
                  <span className="text-base font-extrabold text-stone-900">
                    {formatCurrency(totalEstimatedBudget)}
                  </span>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Campaign Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full h-10 rounded-xl border border-stone-200 px-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                  >
                    <option>Immediate (Next 1-2 Weeks)</option>
                    <option>Next 30-45 Days</option>
                    <option>Next Quarter (Q3 / Q4)</option>
                    <option>Flexible / Ongoing Retainer</option>
                  </select>
                </div>

                {/* Campaign Objective */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Campaign Overview & Message
                  </label>
                  <textarea
                    rows={3}
                    value={campaignObjective}
                    onChange={(e) => setCampaignObjective(e.target.value)}
                    placeholder="Briefly describe what you are launching, core product talking points, and key deliverables..."
                    className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 focus:border-stone-900 focus:outline-none resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || selectedDeliverables.length === 0}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{loading ? 'Dispatching...' : 'Dispatch Collaboration Pitch'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
