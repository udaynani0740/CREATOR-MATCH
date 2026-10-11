import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Inbox, Clock, CheckCircle, Mail, DollarSign } from 'lucide-react';
import type { CollaborationInquiry } from '../types.js';
import { formatCurrency } from '../utils/formatters.js';

interface InquiriesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiries: CollaborationInquiry[];
  loading: boolean;
}

export const InquiriesListModal: React.FC<InquiriesListModalProps> = ({
  isOpen,
  onClose,
  inquiries,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
                <Inbox className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-stone-900">
                  Campaign Proposals & Inquiries
                </h2>
                <p className="text-xs text-stone-600">
                  {inquiries.length} proposal{inquiries.length === 1 ? '' : 's'} recorded in network
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-xs text-stone-600">
                Loading proposals...
              </div>
            ) : inquiries.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-600 space-y-2">
                <Inbox className="mx-auto h-8 w-8 text-stone-300" />
                <p className="font-semibold text-stone-800">No collaboration proposals yet</p>
                <p className="max-w-xs mx-auto text-stone-600">
                  Click &ldquo;Book Collaboration&rdquo; on any creator dossier to pitch campaigns and log proposals.
                </p>
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-stone-900">
                        {inq.brandName} &rarr; {inq.creatorName}
                      </div>
                      <div className="text-[11px] text-stone-600 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-stone-600" />
                          {inq.contactEmail}
                        </span>
                        <span className="text-stone-400">&middot;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-stone-600" />
                          {inq.timeline}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-stone-900 text-sm">
                        {formatCurrency(inq.estimatedBudget)}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        {inq.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60">
                    <div className="text-stone-700 font-medium">
                      Deliverables: <span className="font-normal text-stone-600">{inq.selectedDeliverables.join(', ')}</span>
                    </div>
                    {inq.campaignObjective && (
                      <p className="mt-1 text-stone-600 italic">
                        &ldquo;{inq.campaignObjective}&rdquo;
                      </p>
                    )}
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
