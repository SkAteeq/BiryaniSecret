import React, { useState, useEffect } from 'react';
import { Compass, Users, Sparkles, MapPin, CheckCircle2, Film, MessageSquare, Flame } from 'lucide-react';
import { AppView } from '../types';
import { CulinaryArtwork } from './CulinaryArtwork';
import { CINEMA_DIALOGUES } from '../config/cinemaDialogues';

interface HomeHeroProps {
  onNavigate: (view: AppView) => void;
  onOpenBiryaniBuddy: () => void;
  onFindNearMe: () => void;
  candidateCount: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onNavigate,
  onOpenBiryaniBuddy,
  onFindNearMe,
  candidateCount
}) => {
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Rotating original cinematic taglines
  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % CINEMA_DIALOGUES.homeTaglines.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const currentTagline = CINEMA_DIALOGUES.homeTaglines[taglineIndex];

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#2A1C16] text-[#FFF8EB] border border-[#D99A35]/40 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Hero Entry & 4 Core Action CTAs */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div>
              {/* Rotating Punchline Header */}
              <div
                onClick={() => setTaglineIndex((prev) => (prev + 1) % CINEMA_DIALOGUES.homeTaglines.length)}
                className="cursor-pointer group inline-flex items-center gap-2 text-xs font-bold text-[#D99A35] tracking-wide mb-3 hover:text-[#FAD782] transition-colors"
                title="Tap to change dialogue"
              >
                <Film className="w-3.5 h-3.5 text-[#D99A35] group-hover:rotate-12 transition-transform" />
                <span className="font-mono uppercase tracking-wider text-[11px]">Cinema Mode</span>
                <span aria-hidden="true" className="text-[#D99A35]/40">·</span>
                <span className="truncate italic">"{currentTagline}"</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-black text-[#FFF8EB] leading-[1.14] tracking-tight text-balance">
                Stop arguing. <br />
                <span className="text-[#D99A35]">
                  Let the vote decide
                </span>{' '}
                the biryani scene.
              </h1>

              <p className="mt-4 text-sm sm:text-base text-[#FFF8EB]/80 leading-relaxed font-sans">
                Oka city. Enno biryanis. Final decision meedhe! Curated verified Hyderabad outlets, instant public consensus voting, and zero login roadblocks.
              </p>

              {/* Friendly Microcopy Badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1C120E]/90 border border-[#D99A35]/30 text-xs text-[#D99A35] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#D99A35] shrink-0" />
                <span>No login drama, bhai. Seedha biryani pe aao!</span>
              </div>

              {/* 4 Primary Action Buttons Required */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Find Biryani Near Me */}
                <button
                  onClick={onFindNearMe}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#7A241C] hover:bg-[#912D24] active:scale-98 text-[#FFF8EB] font-bold text-sm transition-all shadow-lg shadow-[#7A241C]/25"
                >
                  <MapPin className="w-4 h-4 text-[#D99A35]" />
                  <span>Find Biryani Near Me</span>
                </button>

                {/* 2. Browse Restaurants */}
                <button
                  onClick={() => onNavigate('discover')}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#3D2921] hover:bg-[#4E352B] border border-[#D99A35]/40 text-[#FFF8EB] font-semibold text-sm transition-all"
                >
                  <Compass className="w-4 h-4 text-[#D99A35]" />
                  <span>Browse Restaurants</span>
                </button>

                {/* 3. Biryani Buddy */}
                <button
                  onClick={onOpenBiryaniBuddy}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#2A1D17] hover:bg-[#3D2921] border border-[#D99A35]/30 text-[#FFF8EB] font-semibold text-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#D99A35]" />
                  <span>Biryani Buddy</span>
                </button>

                {/* 4. Start Voting */}
                <button
                  onClick={() => onNavigate('room')}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#D99A35] to-[#B37A20] hover:from-[#E3AA45] hover:to-[#C28525] text-[#1E110E] font-black text-sm transition-all shadow-md active:scale-98"
                >
                  <Users className="w-4 h-4 text-[#1E110E]" />
                  <span>Start Voting</span>
                </button>
              </div>
            </div>

            {/* Microcopy Footer */}
            <div className="pt-4 border-t border-[#4E352B]/60 flex items-center justify-between text-xs text-[#FFF8EB]/70">
              <span className="italic">Guest ga, Google tho ga — biryani hunt start cheyyi!</span>
              <span className="text-[#D99A35] font-semibold">{candidateCount} Verified Outlets</span>
            </div>
          </div>

          {/* Right Column: Hero Biryani Culinary Artwork */}
          <div className="lg:col-span-5 relative bg-[#18110D] flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-[280px] sm:min-h-[380px]">
            <div className="w-full h-full max-w-[540px] max-h-[340px] flex items-center justify-center transition-transform hover:scale-102 duration-500">
              <CulinaryArtwork type="hero" className="w-full h-full object-contain filter drop-shadow-2xl" />
            </div>

            <div className="absolute bottom-3 right-4 text-[11px] text-[#D99A35]/90 font-serif italic bg-[#18110D]/85 px-2.5 py-1 rounded backdrop-blur-sm border border-[#D99A35]/20">
              Mass Biryani Entry in Hand-Hammered Brass Deg
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
            Branch-Verified Blockbusters
          </h2>
          <p className="mt-1 text-xs text-[#6B544B] dark:text-[#D1C0B4] leading-relaxed">
            Curated coordinates for Hotel Shadab, Bawarchi, Paradise, Rumaan, and Handi. Zero proxy branches or fake ratings.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#251B17] border border-[#E8DAC8] dark:border-[#42322B] shadow-sm hover:border-[#D99A35]/50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#FFF8EB] dark:bg-[#34241D] text-[#D99A35] flex items-center justify-center mb-3 border border-[#D99A35]/30">
            <Users className="w-5 h-5 text-[#D99A35]" />
          </div>
          <h2 className="font-serif font-bold text-base text-[#30231E] dark:text-[#FFF8EB]">
            Open Public Consensus
          </h2>
          <p className="mt-1 text-xs text-[#6B544B] dark:text-[#D1C0B4] leading-relaxed">
            No invitation links needed. Join the active Hyderabad city showdown or community polls with 1 tap.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#251B17] border border-[#E8DAC8] dark:border-[#42322B] shadow-sm hover:border-[#D99A35]/50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#F7EBEA] dark:bg-[#331815] text-[#7A241C] flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5 text-[#7A241C]" />
          </div>
          <h2 className="font-serif font-bold text-base text-[#30231E] dark:text-[#FFF8EB]">
            Nearest Hero Calculation
          </h2>
          <p className="mt-1 text-xs text-[#6B544B] dark:text-[#D1C0B4] leading-relaxed">
            Straight-line distance calculation, plus 1-tap "Take Me to the Dum" Google Maps navigation.
          </p>
        </div>
      </div>
    </div>
  );
};
