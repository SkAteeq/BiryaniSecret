import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Check,
  Clock,
  ExternalLink,
  Lock,
  Flame,
  Crown,
  Sparkles,
  Clapperboard,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Room, Vote, UserProfile, HyderabadError } from '../types';
import { getRestaurantById } from '../data/restaurants';
import {
  subscribeToRoom,
  subscribeToRoomVotes,
  castVote,
  finalizeRoomVoting,
  COMMUNITY_POLLS,
  PUBLIC_SHOWDOWN_ROOM_ID,
  ensurePublicShowdownRoom
} from '../firebase/roomService';
import { createHyderabadError } from '../utils/errors';
import { CulinaryArtwork } from './CulinaryArtwork';
import { CINEMA_DIALOGUES } from '../config/cinemaDialogues';

interface VotingRoomViewProps {
  roomId: string;
  user: UserProfile | null;
  onViewResults: (room: Room) => void;
  onErrorPrompt: (error: HyderabadError) => void;
  onRequireAuth: (reason: string, onAuthenticated?: () => void) => void;
  onChangePoll: (pollId: string) => void;
  onCreateNewPoll: () => void;
}

export const VotingRoomView: React.FC<VotingRoomViewProps> = ({
  roomId,
  user,
  onViewResults,
  onErrorPrompt,
  onRequireAuth,
  onChangePoll,
  onCreateNewPoll
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [cinematicToast, setCinematicToast] = useState<string | null>(null);

  // Track previous leader and previous voter count for cinematic notifications
  const prevLeaderIdRef = useRef<string | null>(null);
  const prevVoteCountRef = useRef<number>(0);

  useEffect(() => {
    if (!roomId) return;

    // Ensure session is initialized in Firestore
    ensurePublicShowdownRoom(roomId).then((initialRoom) => {
      setRoom(initialRoom);
    });

    const unsubscribeRoom = subscribeToRoom(
      roomId,
      (updatedRoom) => {
        if (!updatedRoom) {
          // If room not found yet, ensure it
          ensurePublicShowdownRoom(roomId).then(setRoom);
          return;
        }
        setRoom(updatedRoom);

        if (updatedRoom.status === 'closed') {
          showToast(CINEMA_DIALOGUES.voting.closingVote);
          setTimeout(() => onViewResults(updatedRoom), 800);
        }
      },
      (err) => {
        console.warn('Real-time room subscription info:', err);
      }
    );

    const unsubscribeVotes = subscribeToRoomVotes(
      roomId,
      (updatedVotes) => {
        if (prevVoteCountRef.current > 0 && updatedVotes.length > prevVoteCountRef.current) {
          showToast(CINEMA_DIALOGUES.voting.friendJoined);
        }
        prevVoteCountRef.current = updatedVotes.length;
        setVotes(updatedVotes);
      },
      (err) => {
        console.warn('Real-time votes subscription notice:', err);
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeVotes();
    };
  }, [roomId, onViewResults]);

  // Expiry countdown timer
  useEffect(() => {
    if (!room?.expiresAt) return;

    const interval = setInterval(() => {
      const diff = new Date(room.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining('Voting period closed');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeRemaining(`${days} days active public poll`);
        } else {
          setTimeRemaining(`${hours}h ${mins}m remaining`);
        }
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

  // Identify leading restaurant (spotlight)
  const currentLeaderId = useMemo(() => {
    if (totalVotesCount === 0 || !room?.candidateIds) return null;
    const maxVotes = Math.max(...Object.values(voteTallies));
    if (maxVotes <= 0) return null;
    const leaders = Object.keys(voteTallies).filter((id) => voteTallies[id] === maxVotes);
    return leaders.length === 1 ? leaders[0] : null;
  }, [voteTallies, totalVotesCount, room?.candidateIds]);

  // Leader change notification
  useEffect(() => {
    if (currentLeaderId && prevLeaderIdRef.current && currentLeaderId !== prevLeaderIdRef.current) {
      showToast(CINEMA_DIALOGUES.voting.leaderChanged);
    }
    prevLeaderIdRef.current = currentLeaderId;
  }, [currentLeaderId]);

  const showToast = (msg: string) => {
    setCinematicToast(msg);
    setTimeout(() => {
      setCinematicToast((current) => (current === msg ? null : current));
    }, 3200);
  };

  const isHost = user && room && (user.uid === room.hostId || room.hostId === 'biryani-bandi-public');

  const executeVote = async (restaurantId: string, voterName: string) => {
    setIsVoting(true);
    try {
      await castVote(roomId, restaurantId, voterName);
      showToast(CINEMA_DIALOGUES.voting.voteSubmitted);
    } catch (err: any) {
      onErrorPrompt(createHyderabadError('VOTE_FAILED', err.message));
    } finally {
      setIsVoting(false);
    }
  };

  const handleCastVote = async (restaurantId: string) => {
    if (!room || room.status !== 'voting') {
      onErrorPrompt(createHyderabadError('ROOM_ALREADY_CLOSED'));
      return;
    }

    if (new Date(room.expiresAt).getTime() < Date.now()) {
      onErrorPrompt(createHyderabadError('ROOM_EXPIRED'));
      return;
    }

    // If user is not yet logged in, prompt optional auth modal
    if (!user) {
      onRequireAuth(
        'Cast your live vote! Continue with Google or as an instant Guest:',
        () => {
          // After auth completes, cast vote with default fallback
          executeVote(restaurantId, 'Biryani Foodie');
        }
      );
      return;
    }

    await executeVote(restaurantId, user.displayName);
  };

  const handleFinalizeVoting = async () => {
    if (!isHost) return;

    if (!confirm('Climax time! Finalize voting and crown the winner for this session?')) {
      return;
    }

    setIsFinalizing(true);
    try {
      showToast(CINEMA_DIALOGUES.voting.closingVote);
      await finalizeRoomVoting(roomId);
    } catch (err: any) {
      onErrorPrompt(createHyderabadError('SERVER_ERROR', err.message));
      setIsFinalizing(false);
    }
  };

  if (!room) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#34241D] text-[#D99A35] flex items-center justify-center animate-spin">
          <Flame className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#30231E] dark:text-[#FFF8EB]">
          Screenplay rolling…
        </h3>
        <p className="text-xs text-[#8C766B]">Setting up the live open public poll</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Cinematic Flash Toast */}
      {cinematicToast && (
        <div className="sticky top-20 z-40 bg-[#7A241C] text-[#FFF8EB] px-4 py-2.5 rounded-2xl border-2 border-[#D99A35] shadow-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <Clapperboard className="w-4 h-4 text-[#D99A35] shrink-0" />
          <span>{cinematicToast}</span>
        </div>
      )}

      {/* Community Polls Selector Bar (No invitations needed) */}
      <div className="bg-[#FFFFFF] dark:bg-[#251B17] p-3 rounded-2xl border border-[#E8DAC8] dark:border-[#42322B] shadow-sm flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D99A35] pl-2 hidden sm:inline">
            Active Polls:
          </span>
          {COMMUNITY_POLLS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onChangePoll(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                roomId === preset.id
                  ? 'bg-[#7A241C] text-[#FFF8EB] shadow-md'
                  : 'bg-[#FFF8EB] dark:bg-[#1E1410] text-[#30231E] dark:text-[#FFF8EB] hover:bg-[#F2E5D0] dark:hover:bg-[#2C1F1A] border border-[#E8DAC8] dark:border-[#42322B]'
              }`}
            >
              {preset.title.replace("Today's ", "")}
            </button>
          ))}
        </div>

        <button
          onClick={onCreateNewPoll}
          className="px-3 py-1.5 rounded-xl bg-[#FFF8EB] dark:bg-[#1E1410] hover:bg-[#D99A35] hover:text-[#1E110E] text-[#7A241C] dark:text-[#D99A35] text-xs font-bold border border-[#D99A35]/50 flex items-center gap-1 shrink-0 transition-colors"
          title="Create a custom public poll"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Poll</span>
        </button>
      </div>

      {/* Room Header Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-5 sm:p-7 border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D99A35]">
              <span className="w-2 h-2 rounded-full bg-[#486447] animate-ping" />
              <span>LIVE PUBLIC CONSENSUS</span>
              <span aria-hidden="true">·</span>
              <span>OPEN TO ALL</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#30231E] dark:text-[#FFF8EB] mt-1">
              {room.title}
            </h2>
            <p className="text-xs text-[#6B544B] dark:text-[#D1C0B4] mt-1">
              Real-time cross-device public voting. One vote per participant.
            </p>
          </div>

          {isHost && (
            <button
              onClick={handleFinalizeVoting}
              disabled={isFinalizing}
              className="px-4 py-2 rounded-xl bg-[#7A241C] hover:bg-[#912D24] disabled:opacity-50 text-[#FFF8EB] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Lock className="w-3.5 h-3.5 text-[#D99A35]" />
              <span>{isFinalizing ? 'Climax Rolling...' : 'Declare Verdict'}</span>
            </button>
          )}
        </div>

        {/* Live Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E8DAC8]/60 dark:border-[#42322B]/60 text-xs text-[#6B544B] dark:text-[#D1C0B4]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-[#30231E] dark:text-[#FFF8EB]">
              <Users className="w-4 h-4 text-[#7A241C]" />
              <span className="tabular-nums">
                {totalVotesCount} {totalVotesCount === 1 ? 'live vote cast' : 'live votes cast'}
              </span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8C766B]" />
              <span>{timeRemaining || 'Voting period open'}</span>
            </span>
          </div>

          <div className="text-[11px] font-semibold">
            {myVote ? (
              <span className="text-[#486447] dark:text-[#78A376]">
                ✓ Your vote is locked for {myVote.restaurantName} (tap another to switch)
              </span>
            ) : (
              <span className="text-[#D99A35]">
                {user ? "Tap any contender below to cast your vote" : "No login needed to view — tap to vote as Guest or Google"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Ballot Cards */}
      <div className="space-y-3">
        <h3 className="font-serif font-black text-lg text-[#30231E] dark:text-[#FFF8EB] flex items-center gap-2">
          <span>Official Contenders</span>
          <span className="text-xs font-sans text-[#8C766B]">({room.candidateIds.length} spots)</span>
        </h3>

        <div className="grid grid-cols-1 gap-3.5">
          {room.candidateIds.map((candidateId) => {
            const restaurant = getRestaurantById(candidateId);
            if (!restaurant) return null;

            const isMyChoice = myVote?.restaurantId === candidateId;
            const voteCount = voteTallies[candidateId] || 0;
            const percent = totalVotesCount > 0 ? Math.round((voteCount / totalVotesCount) * 100) : 0;
            const isLeader = currentLeaderId === candidateId;

            return (
              <div
                key={candidateId}
                className={`relative rounded-3xl p-4 sm:p-5 transition-all border ${
                  isMyChoice
                    ? 'bg-[#FFF8EB] dark:bg-[#2C1D17] border-2 border-[#7A241C] shadow-lg ring-1 ring-[#7A241C]'
                    : isLeader
                    ? 'bg-[#FFFFFF] dark:bg-[#251B17] border border-[#D99A35] shadow-md'
                    : 'bg-[#FFFFFF] dark:bg-[#251B17] border-[#E8DAC8] dark:border-[#42322B] shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-[#1E110E]">
                      <CulinaryArtwork
                        type={restaurant.artworkType || 'default'}
                        className="w-full h-full object-cover"
                        dishName={restaurant.name}
                      />
                      {isLeader && (
                        <div className="absolute top-1 left-1 p-1 rounded-md bg-[#D99A35] text-[#1E110E] shadow">
                          <Crown className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-black text-base sm:text-lg text-[#30231E] dark:text-[#FFF8EB] truncate">
                          {restaurant.name}
                        </h4>
                        {isLeader && (
                          <span className="px-2 py-0.5 rounded-full bg-[#D99A35]/20 text-[#D99A35] font-black text-[10px] uppercase tracking-wider shrink-0">
                            Leader
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#8C766B]">
                        {restaurant.branch} · {restaurant.locality}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6B544B] dark:text-[#D1C0B4]">
                        <span className="font-semibold text-[#7A241C] dark:text-[#D99A35]">
                          {restaurant.speciality}
                        </span>
                        <span aria-hidden="true">·</span>
                        <a
                          href={restaurant.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#7A241C] dark:hover:text-[#FFF8EB] inline-flex items-center gap-0.5 font-medium underline text-[11px]"
                        >
                          Directions
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Vote Percentage & Action Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8DAC8]/40 dark:border-[#42322B]/40">
                    <div className="text-left sm:text-right">
                      <div className="font-mono text-lg font-black text-[#30231E] dark:text-[#FFF8EB] tabular-nums">
                        {percent}%
                      </div>
                      <div className="text-[11px] text-[#8C766B] tabular-nums">
                        {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCastVote(candidateId)}
                      disabled={isVoting || room.status !== 'voting'}
                      className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                        isMyChoice
                          ? 'bg-[#486447] hover:bg-[#3B543A] text-[#FFF8EB]'
                          : 'bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB]'
                      }`}
                    >
                      {isMyChoice ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Voted</span>
                        </>
                      ) : (
                        <span>Vote</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Percentage Progress Bar */}
                <div className="mt-3 w-full bg-[#E8DAC8]/50 dark:bg-[#1A120F] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isMyChoice ? 'bg-[#486447]' : isLeader ? 'bg-[#D99A35]' : 'bg-[#7A241C]'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Recent Voters Feed (Non-invasive anonymous avatars) */}
      {votes.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#251B17] border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-2">
          <h4 className="text-xs font-bold text-[#8C766B] uppercase tracking-wider">
            Recent Live Voters ({votes.length} Total)
          </h4>
          <div className="flex flex-wrap gap-2">
            {votes.slice(-8).reverse().map((v, i) => (
              <span
                key={v.userId + i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF8EB] dark:bg-[#1E1410] border border-[#D99A35]/30 text-xs text-[#30231E] dark:text-[#FFF8EB]"
              >
                <ShieldCheck className="w-3 h-3 text-[#486447]" />
                <span className="font-medium truncate max-w-[120px]">{v.userName}</span>
                <span className="text-[10px] text-[#8C766B]">→ {v.restaurantName.split(' ')[0]}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
