import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { DiscoverView } from './components/DiscoverView';
import { CreateRoomView } from './components/CreateRoomView';
import { VotingRoomView } from './components/VotingRoomView';
import { ResultsView } from './components/ResultsView';
import { JoinRoomModal } from './components/JoinRoomModal';
import { BiryaniBuddy } from './components/BiryaniBuddy';
import { HyderabadErrorBanner } from './components/HyderabadErrorBanner';
import { AppView, UserProfile, HyderabadError, Room } from './types';
import { HYDERABAD_RESTAURANTS } from './data/restaurants';
import {
  ensureAuthenticatedUser,
  subscribeToAuthState,
  setStoredGuestName
} from './firebase/authService';
import { getRoom } from './firebase/roomService';
import { testFirestoreConnection } from './firebase/config';
import { createHyderabadError } from './utils/errors';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([
    'shadab-charminar',
    'bawarchi-rtcxroads'
  ]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomData, setActiveRoomData] = useState<Room | null>(null);
  const [currentError, setCurrentError] = useState<HyderabadError | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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
      try {
        localStorage.setItem('biryani_bandi_theme', 'light');
      } catch {}
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Initialize auth and check URL params for room invite links
  useEffect(() => {
    let isMounted = true;

    async function initApp() {
      try {
        await testFirestoreConnection();
        const currentUser = await ensureAuthenticatedUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err: any) {
        console.warn('Initial session setup warning:', err);
        if (err.message === 'ANONYMOUS_AUTH_DISABLED') {
          setCurrentError(createHyderabadError('ANONYMOUS_AUTH_DISABLED'));
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }

      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && isMounted) {
        handleJoinRoom(urlRoom.trim().toUpperCase());
      }
    }

    initApp();

    const unsubscribeAuth = subscribeToAuthState((updatedUser) => {
      if (isMounted && updatedUser) {
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

  const handleJoinRoom = useCallback(async (roomCode: string) => {
    const sanitized = roomCode.trim().toUpperCase();
    if (!sanitized) return;

    try {
      const room = await getRoom(sanitized);
      if (!room) {
        setCurrentError(createHyderabadError('ROOM_NOT_FOUND', `Room ${sanitized} does not exist.`));
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set('room', sanitized);
      window.history.pushState({}, '', url.toString());

      setActiveRoomId(room.id);
      setActiveRoomData(room);

      if (room.status === 'closed') {
        setCurrentView('results');
      } else {
        setCurrentView('room');
      }
    } catch (err: any) {
      setCurrentError(createHyderabadError('SERVER_ERROR', err.message));
    }
  }, []);

  const handleRoomCreated = useCallback((roomId: string) => {
    handleJoinRoom(roomId);
  }, [handleJoinRoom]);

  const handleViewResults = useCallback((room: Room) => {
    setActiveRoomData(room);
    setCurrentView('results');
  }, []);

  const handleStartNewVote = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());

    setActiveRoomId(null);
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EB] dark:bg-[#18110D] text-[#30231E] dark:text-[#FFF8EB] font-sans selection:bg-[#7A241C] selection:text-[#FFF8EB] transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'home' || view === 'discover' || view === 'create-room') {
            const url = new URL(window.location.href);
            url.searchParams.delete('room');
            window.history.pushState({}, '', url.toString());
            setActiveRoomId(null);
          }
          setCurrentView(view);
        }}
        user={user}
        onUserUpdated={handleUserUpdated}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
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
                onJoinWithCode={handleJoinRoom}
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
              />
            )}

            {currentView === 'room' && activeRoomId && (
              <VotingRoomView
                roomId={activeRoomId}
                user={user}
                onViewResults={handleViewResults}
                onErrorPrompt={setCurrentError}
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

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinRoom}
      />

      {/* Biryani Buddy AI Foodie Chatbot */}
      <BiryaniBuddy
        shortlistedIds={shortlistedIds}
        onToggleShortlist={handleToggleShortlist}
        onErrorPrompt={setCurrentError}
      />

      {/* Footer */}
      <footer className="border-t border-[#E8DAC8]/80 dark:border-[#42322B] py-6 text-center text-xs text-[#6B544B] dark:text-[#D1C0B4] bg-[#FFFFFF]/60 dark:bg-[#1E1410]/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-[#7A241C] dark:text-[#D99A35]">Biryani Bandi</strong> — Authentic Hyderabadi Dining Consensus.
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
