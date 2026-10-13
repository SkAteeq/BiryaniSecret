import React, { useState } from 'react';
import { Flame, Compass, Users, LogIn, Edit2, Check, UserCheck, Sun, Moon } from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { signInWithGoogle, setStoredGuestName } from '../firebase/authService';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: UserProfile | null;
  onUserUpdated: (name: string) => void;
  onOpenJoinModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onUserUpdated,
  onOpenJoinModal,
  isDarkMode,
  onToggleTheme
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
    <header className="sticky top-0 z-40 bg-[#30231E] text-[#FFF8EB] border-b border-[#D99A35]/30 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D99A35] via-[#7A241C] to-[#30231E] p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#241713] rounded-[10px] flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#D99A35]" />
            </div>
          </div>
          <span className="font-serif font-black text-xl tracking-tight text-[#FFF8EB]">
            Biryani Bandi
          </span>
        </button>

        {/* Zone 2: Clean 3-zone Nav Links */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <button
            onClick={() => onNavigate('discover')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentView === 'discover'
                ? 'bg-[#7A241C] text-[#FFF8EB] shadow-sm font-bold'
                : 'text-[#FFF8EB]/80 hover:text-[#FFF8EB] hover:bg-[#3E2D27]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#D99A35]" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => onNavigate('create-room')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentView === 'create-room'
                ? 'bg-[#7A241C] text-[#FFF8EB] shadow-sm font-bold'
                : 'text-[#FFF8EB]/80 hover:text-[#FFF8EB] hover:bg-[#3E2D27]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#D99A35]" />
            <span>Start Vote</span>
          </button>

          <button
            onClick={onOpenJoinModal}
            className="px-3 py-1.5 rounded-lg border border-[#D99A35]/50 text-[#D99A35] hover:bg-[#D99A35]/15 transition-colors whitespace-nowrap shrink-0"
          >
            Join Code
          </button>
        </nav>

        {/* Zone 3: Actions (Theme Toggle & User Profile) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-[#241713] hover:bg-[#3E2D27] text-[#D99A35] border border-[#D99A35]/30 transition-colors"
            title={isDarkMode ? 'Switch to Warm Cream (Light Mode)' : 'Switch to Deep Spice (Dark Mode)'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#D99A35]" /> : <Moon className="w-4 h-4 text-[#D99A35]" />}
          </button>

          {/* User Nickname editor */}
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                maxLength={30}
                className="w-24 sm:w-28 px-2 py-1 text-xs rounded bg-[#241713] text-[#FFF8EB] border border-[#D99A35] focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded bg-[#7A241C] text-[#FFF8EB] hover:bg-[#912D24]"
                title="Save name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setEditedName(user?.displayName || '');
                  setIsEditingName(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#241713] hover:bg-[#3E2D27] text-[#FFF8EB] text-xs transition-colors border border-[#D99A35]/30 max-w-[120px] sm:max-w-none truncate"
                title="Tap to change display name"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#D99A35] shrink-0" />
                <span className="truncate font-medium">{user?.displayName || 'Guest'}</span>
                <Edit2 className="w-2.5 h-2.5 text-[#D99A35]/70 shrink-0 ml-0.5" />
              </button>

              {user?.isAnonymous && (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="p-1.5 rounded-lg hover:bg-[#3E2D27] text-[#D99A35] transition-colors"
                  title="Sign in with Google"
                >
                  <LogIn className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
