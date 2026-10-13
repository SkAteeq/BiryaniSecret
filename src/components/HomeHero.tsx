import React, { useState } from 'react';
import { Compass, Users, Sparkles, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { AppView } from '../types';

interface HomeHeroProps {
  onNavigate: (view: AppView) => void;
  onJoinWithCode: (code: string) => void;
  candidateCount: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onNavigate,
  onJoinWithCode,
  candidateCount
}) => {
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      onJoinWithCode(roomCodeInput.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-8 py-4 sm:py-8">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-amber-50 p-6 sm:p-10 shadow-2xl border border-amber-800/40">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hyderabad's No-Fight Biryani Decider</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black text-amber-100 leading-[1.15] tracking-tight">
            Stop arguing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
              Let the vote decide
            </span>{' '}
            the biryani.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-amber-200/80 leading-relaxed font-sans">
            Shortlist verified Hyderabad outlets, share a live voting room link with your group, and get a definitive winner before lunch hour strikes.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('create-room')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <Users className="w-4 h-4" />
              <span>Start a Group Vote</span>
            </button>

            <button
              onClick={() => onNavigate('discover')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-900/40 hover:bg-amber-900/70 border border-amber-700/60 text-amber-100 font-semibold text-sm transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Outlets ({candidateCount})</span>
            </button>
          </div>

          {/* Quick Join With Code Form */}
          <div className="mt-8 pt-6 border-t border-amber-800/60 max-w-md">
            <p className="text-xs font-medium text-amber-300/80 mb-2">
              Have an invitation code from a friend?
            </p>
            <form onSubmit={handleQuickJoin} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. HYD-7X9B"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={12}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-900/90 border border-amber-700/60 text-amber-100 placeholder:text-stone-500 text-sm font-mono tracking-wider focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 disabled:opacity-50 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-amber-400/60 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
          </div>
          <h2 className="font-serif font-bold text-base text-stone-900">
            Branch-Verified Data
          </h2>
          <p className="mt-1 text-xs text-stone-600 leading-relaxed">
            No hallucinated ratings or ghost branches. Curated coordinates for Shadab, Bawarchi, Rumaan, Handi, and gems.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-amber-400/60 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-orange-700" />
          </div>
          <h2 className="font-serif font-bold text-base text-stone-900">
            Real-Time Peer Voting
          </h2>
          <p className="mt-1 text-xs text-stone-600 leading-relaxed">
            Live updates across phones without refreshes. One active vote per participant, changeable until the host closes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-amber-400/60 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5 text-amber-700" />
          </div>
          <h2 className="font-serif font-bold text-base text-stone-900">
            Straight-Line Distance & Maps
          </h2>
          <p className="mt-1 text-xs text-stone-600 leading-relaxed">
            2 km, 5 km, 10 km straight-line radius filtering, with 1-tap direct driving navigation on Google Maps.
          </p>
        </div>
      </div>
    </div>
  );
};
