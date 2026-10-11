import React from 'react';
import { Bookmark, ShieldCheck, Inbox, RotateCcw, User, LogOut, Briefcase, LogIn } from 'lucide-react';
import type { UserSession } from '../types.js';

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenInquiries: () => void;
  onResetDb: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  totalCreators: number;
  userSession: UserSession | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenSaved,
  onOpenInquiries,
  onResetDb,
  onOpenAuth,
  onSignOut,
  totalCreators,
  userSession,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 text-stone-900 focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-stone-100 font-semibold text-sm transition-transform group-hover:scale-105">
              CM
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-base leading-none text-stone-900">
                CreatorMatch AI
              </span>
              <span className="text-[11px] text-stone-600 font-medium tracking-tight mt-0.5">
                Verified Intelligence
              </span>
            </div>
          </a>

          {/* Network indicator (No database terminology) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100/90 px-2.5 py-1 rounded-md border border-stone-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 animate-pulse" />
            <ShieldCheck className="h-3 w-3 text-stone-600" />
            <span>Verified Network</span>
            <span className="text-stone-400">·</span>
            <span className="font-semibold text-stone-800">{totalCreators} creators</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Reset directory roster option */}
          <button
            onClick={onResetDb}
            title="Reset to verified default roster"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-md hover:bg-stone-200/50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Reset Directory</span>
          </button>

          {/* Proposals / Pitches */}
          <button
            onClick={onOpenInquiries}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100/70 transition-colors shadow-2xs"
          >
            <Inbox className="h-3.5 w-3.5 text-stone-600" />
            <span>Proposals</span>
          </button>

          {/* Saved Shortlist */}
          <button
            onClick={onOpenSaved}
            className="relative inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100/70 transition-colors shadow-2xs"
          >
            <Bookmark className="h-3.5 w-3.5 text-stone-600" />
            <span>Shortlist</span>
            {savedCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Session or Login Button */}
          {userSession ? (
            <div className="flex items-center gap-2 pl-1 border-l border-stone-200">
              <div className="flex items-center gap-2 bg-stone-100/90 py-1 px-2.5 rounded-lg border border-stone-200 text-xs">
                {userSession.role === 'brand' ? (
                  <Briefcase className="h-3.5 w-3.5 text-stone-700" />
                ) : (
                  <User className="h-3.5 w-3.5 text-stone-700" />
                )}
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bold text-stone-900 truncate max-w-[120px]">
                    {userSession.role === 'brand'
                      ? userSession.data.company
                      : userSession.data.name}
                  </span>
                  <span className="text-[10px] text-stone-600 capitalize">
                    {userSession.role} Workspace
                  </span>
                </div>
              </div>

              <button
                onClick={onSignOut}
                title="Switch account or sign out"
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:text-stone-950 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
