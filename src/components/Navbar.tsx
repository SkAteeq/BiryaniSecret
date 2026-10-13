import React, { useState } from 'react';
import { Flame, Compass, Users, LogIn, Edit2, Check, UserCheck } from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { signInWithGoogle, setStoredGuestName } from '../firebase/authService';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: UserProfile | null;
  onUserUpdated: (name: string) => void;
  onOpenJoinModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onUserUpdated,
  onOpenJoinModal
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim()) {
      setStoredGuestName(editedName.trim());
      onUserUpdated(editedName.trim());
      setIsEditingName(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-amber-950/95 backdrop-blur-md border-b border-amber-900/60 text-amber-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-amber-950 rounded-[10px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="font-serif font-black text-lg sm:text-xl tracking-tight text-amber-100 flex items-center gap-1.5">
              <span>Biryani Bandi</span>
              <span className="text-[10px] uppercase font-sans tracking-widest bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                HYD
              </span>
            </div>
            <p className="text-[11px] text-amber-300/70 hidden sm:block">
              Group voting for authentic Hyderabadi biryani
            </p>
          </div>
        </button>

        {/* View Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('discover')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'discover'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => onNavigate('create-room')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'create-room'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Start Vote</span>
            <span className="sm:hidden">Vote</span>
          </button>

          <button
            onClick={onOpenJoinModal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 transition-colors"
          >
            Join Code
          </button>

          {/* User Profile / Nickname pill */}
          <div className="ml-1 sm:ml-2 pl-2 border-l border-amber-800/80 flex items-center">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  maxLength={30}
                  className="w-24 sm:w-32 px-2 py-1 text-xs rounded bg-amber-900/90 text-amber-100 border border-amber-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-amber-500 text-stone-950 hover:bg-amber-400"
                  title="Save name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setEditedName(user?.displayName || '');
                    setIsEditingName(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-900/40 hover:bg-amber-900/80 text-amber-200 text-xs transition-colors border border-amber-800/60 max-w-[130px] sm:max-w-none truncate"
                  title="Tap to change display name"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate font-medium">{user?.displayName || 'Guest'}</span>
                  <Edit2 className="w-2.5 h-2.5 text-amber-400/60 shrink-0 ml-0.5" />
                </button>

                {user?.isAnonymous && (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="p-1.5 rounded-md hover:bg-amber-900/60 text-amber-300/80 hover:text-amber-200 transition-colors"
                    title="Sign in with Google (optional)"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
