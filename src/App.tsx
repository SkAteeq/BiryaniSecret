import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { DiscoverView } from './components/DiscoverView';
import { CreateRoomView } from './components/CreateRoomView';
import { VotingRoomView } from './components/VotingRoomView';
import { ResultsView } from './components/ResultsView';
import { AuthModal } from './components/AuthModal';
import { BiryaniBuddy } from './components/BiryaniBuddy';
import { HyderabadErrorBanner } from './components/HyderabadErrorBanner';
import { AppView, UserProfile, HyderabadError, Room } from './types';
import { HYDERABAD_RESTAURANTS } from './data/restaurants';
import {
  checkExistingAuthSession,
  subscribeToAuthState,
  setStoredGuestName
} from './firebase/authService';
import {
  PUBLIC_SHOWDOWN_ROOM_ID,
  ensurePublicShowdownRoom,
  getRoom
} from './firebase/roomService';
import { testFirestoreConnection } from './firebase/config';
import { createHyderabadError } from './utils/errors';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([
    'shadab-charminar',
    'bawarchi-rtcxroads'
  ]);
  const [activeRoomId, setActiveRoomId] = useState<string>(PUBLIC_SHOWDOWN_ROOM_ID);
  const [activeRoomData, setActiveRoomData] = useState<Room | null>(null);
  const [currentError, setCurrentError] = useState<HyderabadError | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string>('');
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

  // Biryani Buddy Controlled Open State
  const [isBuddyOpen, setIsBuddyOpen] = useState(false);

  // Light / Dark Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('biryani_bandi_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('biryani_bandi_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Check for prior auth session without blocking or showing login wall
  useEffect(() => {
    let isMounted = true;

    async function initApp() {
      try {
        await testFirestoreConnection();
        // Check if an existing session is already persisted in browser
        const existing = await checkExistingAuthSession();
        if (isMounted && existing) {
          setUser(existing);
        }
      } catch (err: any) {
        console.warn('Initial session check note:', err);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    initApp();

    const unsubscribeAuth = subscribeToAuthState((updatedUser) => {
      if (isMounted) {
        setUser(updatedUser);
      }
    });

    const handleOffline = () => {
      setCurrentError(createHyderabadError('NETWORK_ERROR', 'Browser went offline'));
    };
    const handleOnline = () => {
      setCurrentError(null);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      isMounted = false;
      unsubscribeAuth();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleToggleShortlist = useCallback((restaurantId: string) => {
    setShortlistedIds((prev) => {
      if (prev.includes(restaurantId)) {
        return prev.filter((id) => id !== restaurantId);
      } else {
        if (prev.length >= 10) {
          setCurrentError(createHyderabadError('SERVER_ERROR', 'Maximum 10 restaurants allowed in shortlist.'));
          return prev;
        }
        return [...prev, restaurantId];
      }
    });
  }, []);

  const handleClearShortlist = useCallback(() => {
    setShortlistedIds([]);
  }, []);

  const handleUserUpdated = useCallback((name: string) => {
    setStoredGuestName(name);
    setUser((prev) => (prev ? { ...prev, displayName: name } : null));
  }, []);

  const handleRequireAuth = useCallback((reason: string, onAuthenticated?: () => void) => {
    setAuthReason(reason);
    setAuthSuccessCallback(() => onAuthenticated || null);
    setIsAuthModalOpen(true);
  }, []);

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    if (authSuccessCallback) {
      authSuccessCallback();
      setAuthSuccessCallback(null);
    }
  };

  const handleChangePoll = useCallback(async (pollId: string) => {
    setActiveRoomId(pollId);
    try {
      const room = await getRoom(pollId);
      if (room) {
        setActiveRoomData(room);
        if (room.status === 'closed') {
          setCurrentView('results');
          return;
        }
      }
      setCurrentView('room');
    } catch {
      setCurrentView('room');
    }
  }, []);

  const handleRoomCreated = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
    setCurrentView('room');
  }, []);

  const handleViewResults = useCallback((room: Room) => {
    setActiveRoomData(room);
    setCurrentView('results');
  }, []);

  const handleStartNewVote = useCallback(() => {
    setActiveRoomId(PUBLIC_SHOWDOWN_ROOM_ID);
    setActiveRoomData(null);
    setCurrentView('create-room');
  }, []);

  const handleBannerAction = (actionType?: string) => {
    if (actionType === 'retry') {
      window.location.reload();
    } else if (actionType === 'home') {
      setCurrentView('home');
      setCurrentError(null);
    } else if (actionType === 'increase_radius') {
      setCurrentView('discover');
      setCurrentError(null);
    } else if (actionType === 'login') {
      setIsAuthModalOpen(true);
      setCurrentError(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EB] dark:bg-[#18110D] text-[#30231E] dark:text-[#FFF8EB] font-sans selection:bg-[#7A241C] selection:text-[#FFF8EB] transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
        }}
        user={user}
        onUserUpdated={handleUserUpdated}
        onOpenAuthModal={() => {
          setAuthReason('Choose how you want to participate in Biryani Bandi:');
          setAuthSuccessCallback(null);
          setIsAuthModalOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4">
        {/* Hyderabad Error Banner */}
        <HyderabadErrorBanner
          error={currentError}
          onDismiss={() => setCurrentError(null)}
          onAction={handleBannerAction}
        />

        {isInitializing ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-[#7A241C] animate-pulse" />
            <p className="font-serif font-bold text-[#30231E] dark:text-[#FFF8EB]">
              Biryani Bandi initializing...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeHero
                onNavigate={setCurrentView}
                onOpenBiryaniBuddy={() => setIsBuddyOpen(true)}
                onFindNearMe={() => setCurrentView('discover')}
                candidateCount={HYDERABAD_RESTAURANTS.length}
              />
            )}

            {currentView === 'discover' && (
              <DiscoverView
                shortlistedIds={shortlistedIds}
                onToggleShortlist={handleToggleShortlist}
                onProceedToCreateRoom={() => setCurrentView('create-room')}
                onErrorPrompt={setCurrentError}
              />
            )}

            {currentView === 'create-room' && (
              <CreateRoomView
                shortlistedIds={shortlistedIds}
                onToggleShortlist={handleToggleShortlist}
                onClearShortlist={handleClearShortlist}
                user={user}
                onRoomCreated={handleRoomCreated}
                onErrorPrompt={setCurrentError}
                onRequireAuth={handleRequireAuth}
              />
            )}

            {currentView === 'room' && (
              <VotingRoomView
                roomId={activeRoomId}
                user={user}
                onViewResults={handleViewResults}
                onErrorPrompt={setCurrentError}
                onRequireAuth={handleRequireAuth}
                onChangePoll={handleChangePoll}
                onCreateNewPoll={() => setCurrentView('create-room')}
              />
            )}

            {currentView === 'results' && activeRoomData && (
              <ResultsView
                room={activeRoomData}
                onStartNewVote={handleStartNewVote}
                onErrorPrompt={setCurrentError}
              />
            )}
          </>
        )}
      </main>

      {/* Optional Auth Modal (Google or Guest) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        actionReason={authReason}
      />

      {/* Biryani Buddy AI Foodie Chatbot */}
      <BiryaniBuddy
        shortlistedIds={shortlistedIds}
        onToggleShortlist={handleToggleShortlist}
        onErrorPrompt={setCurrentError}
        isOpenControlled={isBuddyOpen}
        onOpenControlledChange={setIsBuddyOpen}
      />

      {/* Footer */}
      <footer className="border-t border-[#E8DAC8]/80 dark:border-[#42322B] py-6 text-center text-xs text-[#6B544B] dark:text-[#D1C0B4] bg-[#FFFFFF]/60 dark:bg-[#1E1410]/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-[#7A241C] dark:text-[#D99A35]">Biryani Bandi</strong> — No login drama, authentic Hyderabadi dining consensus.
          </div>
          <div className="text-[#8C766B] flex items-center gap-1.5 flex-wrap justify-center">
            <span>Charminar</span>
            <span aria-hidden="true">·</span>
            <span>RTC X Roads</span>
            <span aria-hidden="true">·</span>
            <span>Secunderabad</span>
            <span aria-hidden="true">·</span>
            <span>Khairtabad</span>
            <span aria-hidden="true">·</span>
            <span>Habsiguda</span>
            <span aria-hidden="true">·</span>
            <span>Manikonda</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
