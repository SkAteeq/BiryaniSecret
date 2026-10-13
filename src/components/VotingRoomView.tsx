import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Check,
  Clock,
  ExternalLink,
  Share2,
  Lock,
  Flame,
  Award,
  AlertCircle,
  Copy,
  CheckCheck
} from 'lucide-react';
import { Room, Vote, UserProfile, HyderabadError } from '../types';
import { getRestaurantById } from '../data/restaurants';
import {
  subscribeToRoom,
  subscribeToRoomVotes,
  castVote,
  finalizeRoomVoting
} from '../firebase/roomService';
import { createHyderabadError } from '../utils/errors';

interface VotingRoomViewProps {
  roomId: string;
  user: UserProfile | null;
  onViewResults: (room: Room) => void;
  onErrorPrompt: (error: HyderabadError) => void;
}

export const VotingRoomView: React.FC<VotingRoomViewProps> = ({
  roomId,
  user,
  onViewResults,
  onErrorPrompt
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Subscribe to real-time room and votes subcollection
  useEffect(() => {
    if (!roomId) return;

    const unsubscribeRoom = subscribeToRoom(
      roomId,
      (updatedRoom) => {
        if (!updatedRoom) {
          onErrorPrompt(createHyderabadError('ROOM_NOT_FOUND', `Room ${roomId} does not exist.`));
          return;
        }
        setRoom(updatedRoom);

        // If room is already closed, automatically navigate to results
        if (updatedRoom.status === 'closed') {
          onViewResults(updatedRoom);
        }
      },
      (err) => {
        onErrorPrompt(createHyderabadError('SERVER_ERROR', err.message));
      }
    );

    const unsubscribeVotes = subscribeToRoomVotes(
      roomId,
      (updatedVotes) => {
        setVotes(updatedVotes);
      },
      (err) => {
        console.warn('Real-time votes subscription error:', err);
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeVotes();
    };
  }, [roomId, onErrorPrompt, onViewResults]);

  // Expiry countdown timer
  useEffect(() => {
    if (!room?.expiresAt) return;

    const interval = setInterval(() => {
      const diff = new Date(room.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining('Voting expired');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${mins}m ${secs}s remaining`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.expiresAt]);

  // Current user's vote
  const myVote = useMemo(() => {
    if (!user) return null;
    return votes.find((v) => v.userId === user.uid) || null;
  }, [votes, user]);

  // Vote counts tally per candidate
  const voteTallies = useMemo(() => {
    const tallies: Record<string, number> = {};
    if (room?.candidateIds) {
      room.candidateIds.forEach((cId) => {
        tallies[cId] = 0;
      });
    }
    votes.forEach((v) => {
      if (tallies[v.restaurantId] !== undefined) {
        tallies[v.restaurantId] += 1;
      }
    });
    return tallies;
  }, [room?.candidateIds, votes]);

  const totalVotesCount = votes.length;

  const isHost = user && room && user.uid === room.hostId;

  const handleCastVote = async (restaurantId: string) => {
    if (!room || room.status !== 'voting') {
      onErrorPrompt(createHyderabadError('ROOM_ALREADY_CLOSED'));
      return;
    }

    if (!user) {
      onErrorPrompt(createHyderabadError('AUTH_REQUIRED'));
      return;
    }

    // Check expiry
    if (new Date(room.expiresAt).getTime() < Date.now()) {
      onErrorPrompt(createHyderabadError('ROOM_EXPIRED'));
      return;
    }

    setIsVoting(true);
    try {
      await castVote(roomId, restaurantId, user.displayName);
    } catch (err: any) {
      onErrorPrompt(createHyderabadError('VOTE_FAILED', err.message));
    } finally {
      setIsVoting(false);
    }
  };

  const handleFinalizeVoting = async () => {
    if (!isHost) return;

    if (!confirm('Are you sure you want to finalize voting and announce the winner to all participants?')) {
      return;
    }

    setIsFinalizing(true);
    try {
      await finalizeRoomVoting(roomId);
      // The room snapshot listener will trigger onViewResults automatically
    } catch (err: any) {
      onErrorPrompt(createHyderabadError('SERVER_ERROR', err.message));
      setIsFinalizing(false);
    }
  };

  const handleCopyInvite = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!room) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center animate-spin">
          <Flame className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-stone-800">
          Connecting to Mehfil...
        </h3>
        <p className="text-xs text-stone-500">Checking room status and live ballot</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Room Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                Voting Room Active
              </span>
              <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                {room.id}
              </span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-3xl text-stone-900 mt-1">
              {room.title}
            </h2>

            <p className="text-xs text-stone-500 mt-0.5">
              Created by <strong className="text-stone-800">{room.hostName}</strong>
              {isHost && <span className="ml-1 text-amber-700 font-bold">(You are Host)</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyInvite}
              className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link' : 'Invite Gang'}</span>
            </button>

            {isHost && (
              <button
                onClick={handleFinalizeVoting}
                disabled={isFinalizing}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isFinalizing ? 'Closing...' : 'Close & Finalize Result'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100 text-xs text-stone-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-semibold text-stone-800">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>{totalVotesCount} {totalVotesCount === 1 ? 'vote cast' : 'votes cast'}</span>
            </span>

            <span className="flex items-center gap-1 text-stone-500">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{timeRemaining || 'Voting open'}</span>
            </span>
          </div>

          <div className="text-[11px] text-stone-500">
            {myVote ? (
              <span className="text-emerald-700 font-bold">
                ✓ You voted for {myVote.restaurantName} (tap any option to switch)
              </span>
            ) : (
              <span className="text-amber-800 font-semibold animate-pulse">
                👇 Tap an option below to cast your vote
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Ballot Cards */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-stone-900 px-1">
          Candidate Restaurants ({room.candidateIds.length})
        </h3>

        <div className="space-y-3">
          {room.candidateIds.map((candidateId) => {
            const restaurant = getRestaurantById(candidateId);
            if (!restaurant) return null;

            const voteCount = voteTallies[candidateId] || 0;
            const percentage = totalVotesCount > 0 ? Math.round((voteCount / totalVotesCount) * 100) : 0;
            const isMySelection = myVote?.restaurantId === candidateId;

            return (
              <div
                key={candidateId}
                onClick={() => !isVoting && handleCastVote(candidateId)}
                className={`relative overflow-hidden bg-white rounded-2xl border-2 transition-all p-4 cursor-pointer select-none shadow-sm hover:shadow-md ${
                  isMySelection
                    ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-amber-400'
                }`}
              >
                {/* Live percentage background progress bar */}
                <div
                  className={`absolute top-0 bottom-0 left-0 transition-all duration-500 pointer-events-none ${
                    isMySelection ? 'bg-amber-100/60' : 'bg-stone-100/60'
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-black text-lg text-stone-900 leading-snug">
                        {restaurant.name}
                      </h4>
                      {isMySelection && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Your Active Vote</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 font-medium">
                      {restaurant.branch} • {restaurant.locality}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-xs text-stone-700">
                      <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded text-[11px]">
                        {restaurant.speciality}
                      </span>
                    </div>

                    {restaurant.curatorNotes && (
                      <p className="text-[11px] text-stone-600 italic mt-1.5 line-clamp-2">
                        "{restaurant.curatorNotes}"
                      </p>
                    )}
                  </div>

                  {/* Vote Count & Action */}
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <div className="flex items-baseline gap-1 text-stone-900">
                      <span className="font-serif font-black text-2xl">{voteCount}</span>
                      <span className="text-xs text-stone-500 font-medium font-sans">
                        ({percentage}%)
                      </span>
                    </div>

                    <a
                      href={restaurant.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-900 hover:underline font-semibold"
                    >
                      <span>Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Participants Feed */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-base text-stone-900">
            Live Mehfil Feed ({votes.length} Participants)
          </h4>
          <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            ● Real-Time Sync
          </span>
        </div>

        {votes.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-3 text-center">
            No votes submitted yet. Share the invite code to get your friends in!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {votes.map((v) => (
              <div
                key={v.userId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs"
              >
                <span className="font-medium text-stone-900 truncate">
                  {v.userName}
                  {user && v.userId === user.uid && ' (You)'}
                </span>
                <span className="text-amber-900 font-bold truncate max-w-[140px] pl-2 text-right">
                  {v.restaurantName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Host Finalization Prompt Sticky Bar */}
      {isHost && (
        <div className="p-4 rounded-2xl bg-amber-950 text-amber-50 flex items-center justify-between gap-3 shadow-xl border border-amber-700">
          <div className="text-xs">
            <span className="font-bold text-amber-300 block">Host Controls</span>
            Ready to decide? Close voting to finalize the winner for everyone.
          </div>
          <button
            onClick={handleFinalizeVoting}
            disabled={isFinalizing}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shrink-0 transition-colors shadow-sm"
          >
            {isFinalizing ? 'Closing...' : 'Close Voting'}
          </button>
        </div>
      )}
    </div>
  );
};
