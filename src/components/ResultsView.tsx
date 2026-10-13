import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Navigation,
  ExternalLink,
  RotateCcw,
  Share2,
  Sparkles,
  CheckCheck,
  Clapperboard,
  Crown
} from 'lucide-react';
import { Room, Vote, HyderabadError } from '../types';
import { getRestaurantById } from '../data/restaurants';
import { subscribeToRoomVotes } from '../firebase/roomService';
import { CulinaryArtwork } from './CulinaryArtwork';
import { CINEMA_DIALOGUES } from '../config/cinemaDialogues';

interface ResultsViewProps {
  room: Room;
  onStartNewVote: () => void;
  onErrorPrompt: (error: HyderabadError) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  room,
  onStartNewVote
}) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!room.id) return;
    const unsub = subscribeToRoomVotes(room.id, (vList) => {
      setVotes(vList);
    });
    return () => unsub();
  }, [room.id]);

  const tallies = room.candidateIds.map((cId) => {
    const rest = getRestaurantById(cId);
    const count = votes.filter((v) => v.restaurantId === cId).length;
    return {
      candidateId: cId,
      restaurant: rest,
      votes: count
    };
  }).sort((a, b) => b.votes - a.votes);

  const totalVotes = votes.length;
  const isZeroVotes = totalVotes === 0 || room.winnerId === 'ZERO_VOTES';
  const isTie = room.winnerId === 'TIE';
  const winnerRestaurant = room.winnerId && !isTie && !isZeroVotes ? getRestaurantById(room.winnerId) : null;

  const handleShareResult = async () => {
    const text = `Biryani Bandi Verdict: Box office hit ${room.winnerName || 'Winner'} declared!`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Biryani Bandi Climax Verdict',
          text,
          url
        });
      } catch {
        // dismissed
      }
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Winner Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#261A15] text-[#FFF8EB] border-2 border-[#D99A35] shadow-2xl space-y-5">
        {/* Visual Hero Banner for Winner */}
        {winnerRestaurant && (
          <div className="relative aspect-[16/9] w-full bg-[#18110D] overflow-hidden">
            <CulinaryArtwork
              type={winnerRestaurant.artworkType || 'default'}
              className="w-full h-full object-cover"
              dishName={winnerRestaurant.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#261A15] via-[#261A15]/40 to-transparent" />

            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D99A35] text-[#1E110E] text-xs font-black uppercase tracking-wider shadow-lg">
              <Trophy className="w-3.5 h-3.5" />
              <span>{CINEMA_DIALOGUES.voting.winnerAnnounced}</span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 text-center space-y-4">
          {isZeroVotes ? (
            <div className="space-y-3 py-2">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#FFF8EB]">
                Zero Votes Recorded!
              </h2>
              <p className="text-sm text-[#FFF8EB]/80 max-w-md mx-auto">
                Ee scene lo evaru vote veyyaledu bhai! Start a fresh voting room or pick any verified Hyderabad hero from our list.
              </p>
            </div>
          ) : isTie ? (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-center gap-2 text-[#D99A35]">
                <Clapperboard className="w-5 h-5 text-[#D99A35]" />
                <span className="font-bold text-xs uppercase tracking-widest">
                  {CINEMA_DIALOGUES.chatbot.tie}
                </span>
                <Sparkles className="w-5 h-5 text-[#D99A35]" />
              </div>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#FFF8EB]">
                {room.winnerName}
              </h2>
              <p className="text-xs sm:text-sm text-[#FFF8EB]/80 max-w-md mx-auto">
                Both contenders delivered blockbuster performance with equal votes! You can order from both or flip a coin for the climax.
              </p>
            </div>
          ) : winnerRestaurant ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#D99A35] uppercase tracking-wider">
                <Crown className="w-4 h-4 text-[#D99A35]" />
                <span>{CINEMA_DIALOGUES.chatbot.winner}</span>
              </div>

              <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#FFF8EB] leading-tight">
                {winnerRestaurant.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#D99A35] font-medium">
                {winnerRestaurant.branch} · {winnerRestaurant.locality}
              </p>

              <div className="p-3.5 rounded-2xl bg-[#1C120E]/80 border border-[#D99A35]/40 max-w-md mx-auto text-xs text-[#FFF8EB]/90 italic leading-relaxed">
                "{winnerRestaurant.curatorNotes}"
              </div>

              {/* Action Buttons: Chilli Red for "Take Me to the Dum" */}
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={winnerRestaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-sm shadow-xl transition-transform active:scale-95"
                >
                  <Navigation className="w-4 h-4 text-[#D99A35]" />
                  <span>{CINEMA_DIALOGUES.discovery.takeMeToDum}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  onClick={handleShareResult}
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-[#3D2921] hover:bg-[#4E352B] text-[#FFF8EB] font-bold text-sm border border-[#D99A35]/50 transition-colors"
                >
                  {copiedShare ? <CheckCheck className="w-4 h-4 text-[#486447]" /> : <Share2 className="w-4 h-4 text-[#D99A35]" />}
                  <span>{copiedShare ? 'Copied' : 'Share Climax Verdict'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h2 className="font-serif font-black text-2xl text-[#FFF8EB]">{room.winnerName}</h2>
            </div>
          )}
        </div>
      </div>

      {/* Vote Breakdown Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-5 sm:p-7 border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#30231E] dark:text-[#FFF8EB]">
              Box Office Scorecard
            </h3>
            <p className="text-[#8C766B]">
              {totalVotes} total verified audience votes across the gang
            </p>
          </div>
          <span className="font-mono text-[#D99A35] font-bold">
            SCENE: {room.id}
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {tallies.map((item, idx) => {
            if (!item.restaurant) return null;
            const pct = totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100) : 0;
            const isWinnerItem = idx === 0 && item.votes > 0;

            return (
              <div
                key={item.candidateId}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isWinnerItem
                    ? 'border-[#D99A35] bg-[#FFF8EB]/70 dark:bg-[#1E120E] ring-1 ring-[#D99A35]/40'
                    : 'border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/30 dark:bg-[#1A120F]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#30231E] dark:text-[#FFF8EB] text-sm flex items-center gap-1.5">
                    {item.restaurant.name}
                    {isWinnerItem && <Trophy className="w-3.5 h-3.5 text-[#D99A35]" />}
                  </span>
                  <span className="font-bold tabular-nums text-[#30231E] dark:text-[#FFF8EB]">
                    {item.votes} votes ({pct}%)
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-[#E8DAC8] dark:bg-[#34241D] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWinnerItem ? 'bg-[#D99A35]' : 'bg-[#7A241C]/60'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8C766B]">
                  <span>{item.restaurant.branch} · {item.restaurant.locality}</span>
                  <a
                    href={item.restaurant.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7A241C] dark:text-[#D99A35] hover:underline flex items-center gap-0.5 font-medium"
                  >
                    <span>Take Me to Dum</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Participant Breakdown */}
      {votes.length > 0 && (
        <div className="bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-5 sm:p-6 border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-3">
          <h4 className="font-serif font-bold text-base text-[#30231E] dark:text-[#FFF8EB]">
            Gang Verdict Breakdown ({votes.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {votes.map((v) => (
              <div
                key={v.userId}
                className="p-2.5 rounded-xl bg-[#FFF8EB]/50 dark:bg-[#1A120F] border border-[#E8DAC8]/60 dark:border-[#42322B]/60 flex items-center justify-between"
              >
                <span className="font-semibold text-[#30231E] dark:text-[#FFF8EB]">{v.userName}</span>
                <span className="text-[#7A241C] dark:text-[#D99A35] font-bold">{v.restaurantName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Another Vote Button */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onStartNewVote}
          className="flex-1 py-4 rounded-xl bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
        >
          <RotateCcw className="w-4 h-4 text-[#D99A35]" />
          <span>Start Next Biryani Scene</span>
        </button>
      </div>
    </div>
  );
};
