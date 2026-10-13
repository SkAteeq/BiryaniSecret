import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Check,
  Clock,
  ExternalLink,
  Lock,
  Flame,
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
import { CulinaryArtwork } from './CulinaryArtwork';

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

  const myVote = useMemo(() => {
    if (!user) return null;
    return votes.find((v) => v.userId === user.uid) || null;
  }, [votes, user]);

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
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#34241D] text-[#D99A35] flex items-center justify-center animate-spin">
          <Flame className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#30231E] dark:text-[#FFF8EB]">
          Connecting to Mehfil...
        </h3>
        <p className="text-xs text-[#8C766B]">Checking room status and live ballot</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Room Header Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-5 sm:p-7 border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {/* Unboxed Metadata without pills */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D99A35]">
              <span>ROOM ACTIVE</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#30231E] dark:text-[#FFF8EB]">{room.id}</span>
              <span aria-hidden="true">·</span>
              <span>HOST: {room.hostName}</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#30231E] dark:text-[#FFF8EB] mt-1">
              {room.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyInvite}
              className="px-3.5 py-2 rounded-xl border border-[#D99A35]/50 bg-[#FFF8EB] dark:bg-[#1E1410] text-[#30231E] dark:text-[#FFF8EB] font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-[#486447]" /> : <Copy className="w-3.5 h-3.5 text-[#D99A35]" />}
              <span>{copiedLink ? 'Copied' : 'Invite Gang'}</span>
            </button>

            {isHost && (
              <button
                onClick={handleFinalizeVoting}
                disabled={isFinalizing}
                className="px-4 py-2 rounded-xl bg-[#7A241C] hover:bg-[#912D24] disabled:opacity-50 text-[#FFF8EB] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Lock className="w-3.5 h-3.5 text-[#D99A35]" />
                <span>{isFinalizing ? 'Closing...' : 'Close & Finalize'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E8DAC8]/60 dark:border-[#42322B]/60 text-xs text-[#6B544B] dark:text-[#D1C0B4]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-[#30231E] dark:text-[#FFF8EB]">
              <Users className="w-4 h-4 text-[#7A241C]" />
              <span className="tabular-nums">{totalVotesCount} {totalVotesCount === 1 ? 'vote cast' : 'votes cast'}</span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8C766B]" />
              <span>{timeRemaining || 'Voting open'}</span>
            </span>
          </div>

          <div className="text-[11px] font-semibold">
            {myVote ? (
              <span className="text-[#486447] dark:text-[#78A376]">
                ✓ Voted for {myVote.restaurantName} (tap any option to switch)
              </span>
            ) : (
              <span className="text-[#7A241C] dark:text-[#D99A35] animate-pulse">
                👇 Tap a contender below to cast your vote
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Ballot Cards */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-[#30231E] dark:text-[#FFF8EB] px-1">
          Contenders ({room.candidateIds.length})
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
                className={`relative overflow-hidden bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl border-2 transition-all p-4 cursor-pointer select-none shadow-sm hover:shadow-md ${
                  isMySelection
                    ? 'border-[#7A241C] ring-2 ring-[#7A241C]/30 bg-[#FFF8EB]/50 dark:bg-[#1E120E]'
                    : 'border-[#E8DAC8] dark:border-[#42322B] hover:border-[#D99A35]'
                }`}
              >
                {/* Live Saffron Gold Percentage Bar */}
                <div
                  className={`absolute top-0 bottom-0 left-0 transition-all duration-500 pointer-events-none ${
                    isMySelection ? 'bg-[#D99A35]/20 dark:bg-[#D99A35]/15' : 'bg-[#E8DAC8]/30 dark:bg-[#34241D]/30'
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  {/* Thumbnail & Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-[#1C120E] shadow-sm">
                      <CulinaryArtwork
                        type={restaurant.artworkType || 'default'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif font-black text-lg text-[#30231E] dark:text-[#FFF8EB] leading-tight">
                          {restaurant.name}
                        </h4>
                        {isMySelection && (
                          <span className="text-[10px] font-black uppercase text-[#7A241C] dark:text-[#D99A35] flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Your Vote</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#8C766B] font-medium mt-0.5">
                        {restaurant.branch} · {restaurant.locality}
                      </p>

                      <p className="text-xs font-semibold text-[#6B544B] dark:text-[#D1C0B4] mt-1 truncate">
                        {restaurant.speciality}
                      </p>
                    </div>
                  </div>

                  {/* Vote Count & Action */}
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <div className="flex items-baseline gap-1 text-[#30231E] dark:text-[#FFF8EB]">
                      <span className="font-serif font-black text-2xl sm:text-3xl tabular-nums text-[#7A241C] dark:text-[#D99A35]">
                        {voteCount}
                      </span>
                      <span className="text-xs text-[#8C766B] font-medium font-sans tabular-nums">
                        ({percentage}%)
                      </span>
                    </div>

                    <a
                      href={restaurant.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#7A241C] dark:text-[#D99A35] hover:underline font-semibold"
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
      <div className="bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-5 sm:p-6 border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-serif font-bold text-base text-[#30231E] dark:text-[#FFF8EB]">
            Mehfil Attendance ({votes.length})
          </h4>
          <span className="text-[#486447] dark:text-[#78A376] font-bold">
            Live Subcollection Sync
          </span>
        </div>

        {votes.length === 0 ? (
          <p className="text-xs text-[#8C766B] italic py-3 text-center">
            No votes submitted yet. Share the invite code to start the feast decision!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {votes.map((v) => (
              <div
                key={v.userId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8EB]/50 dark:bg-[#1A120F] border border-[#E8DAC8]/60 dark:border-[#42322B]/60 text-xs"
              >
                <span className="font-medium text-[#30231E] dark:text-[#FFF8EB] truncate">
                  {v.userName}
                  {user && v.userId === user.uid && ' (You)'}
                </span>
                <span className="text-[#7A241C] dark:text-[#D99A35] font-bold truncate max-w-[130px] pl-2 text-right">
                  {v.restaurantName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Host Finalization Prompt Bar */}
      {isHost && (
        <div className="p-4 rounded-2xl bg-[#30231E] text-[#FFF8EB] flex items-center justify-between gap-3 shadow-2xl border border-[#D99A35]/50">
          <div className="text-xs">
            <span className="font-bold text-[#D99A35] block">Host Controls</span>
            Ready to eat? Close voting to finalize the winning outlet for everyone.
          </div>
          <button
            onClick={handleFinalizeVoting}
            disabled={isFinalizing}
            className="px-4 py-2.5 rounded-xl bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-xs shrink-0 transition-colors shadow-md"
          >
            {isFinalizing ? 'Closing...' : 'Close Voting'}
          </button>
        </div>
      )}
    </div>
  );
};
