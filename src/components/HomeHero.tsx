import React, { useState } from 'react';
import { Compass, Users, Sparkles, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { AppView } from '../types';
import { CulinaryArtwork } from './CulinaryArtwork';

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
    <div className="space-y-8 py-4 sm:py-6">
      {/* Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#2A1C16] text-[#FFF8EB] border border-[#D99A35]/30 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div>
              {/* Subtle kicker text without pill box */}
              <div className="flex items-center gap-2 text-xs font-bold text-[#D99A35] tracking-wide mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#D99A35]" />
                <span>AUTHENTIC HYDERABADI GASTRONOMY</span>
                <span aria-hidden="true" className="text-[#D99A35]/40">·</span>
                <span>PEER DECISION ENGINE</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-black text-[#FFF8EB] leading-[1.12] tracking-tight text-balance">
                Stop arguing. <br />
                <span className="text-[#D99A35]">
                  Let the vote decide
                </span>{' '}
                the biryani.
              </h1>

              <p className="mt-4 text-sm sm:text-base text-[#FFF8EB]/80 leading-relaxed font-sans">
                Shortlist verified Hyderabad outlets, share a live voting room link with your group, and get a consensus before lunch hour strikes.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('create-room')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#7A241C] hover:bg-[#912D24] active:scale-98 text-[#FFF8EB] font-bold text-sm transition-all shadow-lg"
                >
                  <Users className="w-4 h-4 text-[#D99A35]" />
                  <span>Start a Group Vote</span>
                </button>

                <button
                  onClick={() => onNavigate('discover')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3D2921] hover:bg-[#4E352B] border border-[#D99A35]/40 text-[#FFF8EB] font-semibold text-sm transition-all"
                >
                  <Compass className="w-4 h-4 text-[#D99A35]" />
                  <span>Explore Outlets ({candidateCount})</span>
                </button>
              </div>
            </div>

            {/* Quick Join With Code Form */}
            <div className="pt-6 border-t border-[#4E352B]/60 max-w-md">
              <p className="text-xs font-semibold text-[#D99A35] mb-2">
                Have an invitation code from a friend?
              </p>
              <form onSubmit={handleQuickJoin} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. HYD-7X9B"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  maxLength={12}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#1C120E] border border-[#D99A35]/40 text-[#FFF8EB] placeholder:text-[#8C766B] text-sm font-mono tracking-widest focus:outline-none focus:border-[#D99A35]"
                />
                <button
                  type="submit"
                  disabled={!roomCodeInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#7A241C] disabled:opacity-40 hover:bg-[#912D24] text-[#FFF8EB] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Hero Biryani Culinary Artwork */}
          <div className="lg:col-span-6 relative bg-[#18110D] flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-[300px] sm:min-h-[420px]">
            <div className="w-full h-full max-w-[620px] max-h-[360px] flex items-center justify-center transition-transform hover:scale-102 duration-500">
              <CulinaryArtwork type="hero" className="w-full h-full object-contain filter drop-shadow-2xl" />
            </div>

            {/* Subtle caption */}
            <div className="absolute bottom-3 right-4 text-[11px] text-[#D99A35]/80 font-serif italic bg-[#18110D]/80 px-2 py-0.5 rounded backdrop-blur-sm">
              Royal Nizami Dum Biryani in Hand-Hammered Brass Handi
            </div>
          </div>
        </div>
      </div>

      {/* 3 Authentic Foodie Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#251B17] border border-[#E8DAC8] dark:border-[#42322B] shadow-sm hover:border-[#D99A35]/50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#EBF2EA] dark:bg-[#202B1F] text-[#486447] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5 text-[#486447]" />
          </div>
          <h2 className="font-serif font-bold text-base text-[#30231E] dark:text-[#FFF8EB]">
            Branch-Verified Heritage
          </h2>
          <p className="mt-1 text-xs text-[#6B544B] dark:text-[#D1C0B4] leading-relaxed">
            Curated coordinates for Hotel Shadab, Bawarchi, Paradise, Rumaan, and Handi. No ghost locations or fake ratings.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#251B17] border border-[#E8DAC8] dark:border-[#42322B] shadow-sm hover:border-[#D99A35]/50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#FFF8EB] dark:bg-[#34241D] text-[#D99A35] flex items-center justify-center mb-3 border border-[#D99A35]/30">
            <Users className="w-5 h-5 text-[#D99A35]" />
          </div>
          <h2 className="font-serif font-bold text-base text-[#30231E] dark:text-[#FFF8EB]">
            Real-Time Peer Voting
          </h2>
          <p className="mt-1 text-xs text-[#6B544B] dark:text-[#D1C0B4] leading-relaxed">
            Live subcollection sync across phones. One active vote per participant, changeable until the host closes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#251B17] border border-[#E8DAC8] dark:border-[#42322B] shadow-sm hover:border-[#D99A35]/50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#F7EBEA] dark:bg-[#331815] text-[#7A241C] flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5 text-[#7A241C]" />
          </div>
          <h2 className="font-serif font-bold text-base text-[#30231E] dark:text-[#FFF8EB]">
            Straight-Line Distance & Maps
          </h2>
          <p className="mt-1 text-xs text-[#6B544B] dark:text-[#D1C0B4] leading-relaxed">
            2 km, 5 km, 10 km straight-line radius calculation, with 1-tap direct driving navigation on Google Maps.
          </p>
        </div>
      </div>
    </div>
  );
};
