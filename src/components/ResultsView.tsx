import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Navigation,
  ExternalLink,
  Users,
  RotateCcw,
  Share2,
  Sparkles,
  Flame,
  CheckCheck
} from 'lucide-react';
import { Room, Vote, HyderabadError } from '../types';
import { getRestaurantById } from '../data/restaurants';
import { subscribeToRoomVotes } from '../firebase/roomService';

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

  // Compute final tallies
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
    const text = `Biryani Bandi Outcome: ${room.winnerName || 'Decision made'}!`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Biryani Decision Winner',
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-amber-50 p-6 sm:p-8 shadow-2xl border border-amber-600/50 text-center space-y-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Faisla Ho Gaya • Voting Finalized</span>
        </div>

        {/* Dynamic Result Banner */}
        {isZeroVotes ? (
          <div className="space-y-3 py-2">
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-100">
              No Votes Cast!
            </h2>
            <p className="text-sm text-amber-200/80 max-w-md mx-auto">
              Mehfil mein kisi ne vote nahi daala. Start another vote or pick any legendary spot from our curated list!
            </p>
          </div>
        ) : isTie ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-xs uppercase tracking-widest">Double Feast Tie</span>
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-100">
              {room.winnerName}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto">
              The group tied with equal votes! You can order from both or flip a coin for the feast.
            </p>
          </div>
        ) : winnerRestaurant ? (
          <div className="space-y-3 py-2">
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-amber-100 leading-tight">
              {winnerRestaurant.name}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
              {winnerRestaurant.branch} • {winnerRestaurant.locality}
            </p>

            <div className="inline-block p-3 rounded-2xl bg-amber-900/40 border border-amber-700/60 max-w-md text-xs text-amber-100 italic">
              "{winnerRestaurant.curatorNotes}"
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={winnerRestaurant.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-lg transition-transform active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                onClick={handleShareResult}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-100 font-bold text-sm border border-amber-700/60 transition-colors"
              >
                {copiedShare ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedShare ? 'Copied' : 'Share Outcome'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="font-serif font-black text-2xl text-amber-100">{room.winnerName}</h2>
          </div>
        )}
      </div>

      {/* Vote Breakdown Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Final Vote Breakdown
            </h3>
            <p className="text-xs text-stone-500">
              {totalVotes} total votes recorded across group members
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            Room: {room.id}
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
                    ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-400/40'
                    : 'border-stone-200 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    {item.restaurant.name}
                    {isWinnerItem && <Trophy className="w-3.5 h-3.5 text-amber-600" />}
                  </span>
                  <span className="font-bold text-stone-800">
                    {item.votes} votes ({pct}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWinnerItem ? 'bg-amber-500' : 'bg-stone-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-500">
                  <span>{item.restaurant.branch}</span>
                  <a
                    href={item.restaurant.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 hover:underline flex items-center gap-0.5 font-medium"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Participant breakdown */}
      {votes.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-3">
          <h4 className="font-serif font-bold text-base text-stone-900">
            Who Voted For What ({votes.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {votes.map((v) => (
              <div
                key={v.userId}
                className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between"
              >
                <span className="font-semibold text-stone-900">{v.userName}</span>
                <span className="text-amber-900 font-bold">{v.restaurantName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onStartNewVote}
          className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start Another Vote</span>
        </button>
      </div>
    </div>
  );
};
