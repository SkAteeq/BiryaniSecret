import React, { useState } from 'react';
import {
  Users,
  Check,
  Plus,
  Trash2,
  Copy,
  CheckCheck,
  Share2,
  ArrowRight,
  Flame
} from 'lucide-react';
import { UserProfile, HyderabadError } from '../types';
import { HYDERABAD_RESTAURANTS } from '../data/restaurants';
import { createRoom } from '../firebase/roomService';
import { createHyderabadError } from '../utils/errors';
import { CulinaryArtwork } from './CulinaryArtwork';

interface CreateRoomViewProps {
  shortlistedIds: string[];
  onToggleShortlist: (id: string) => void;
  onClearShortlist: () => void;
  user: UserProfile | null;
  onRoomCreated: (roomId: string) => void;
  onErrorPrompt: (error: HyderabadError) => void;
}

export const CreateRoomView: React.FC<CreateRoomViewProps> = ({
  shortlistedIds,
  onToggleShortlist,
  onClearShortlist,
  user,
  onRoomCreated,
  onErrorPrompt
}) => {
  const [title, setTitle] = useState('Friday Afternoon Biryani Raid');
  const [hostName, setHostName] = useState(user?.displayName || 'Bhaijaan');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (shortlistedIds.length < 2) {
      onErrorPrompt(
        createHyderabadError(
          'SERVER_ERROR',
          'Please select at least 2 candidate restaurants for your group to vote on.'
        )
      );
      return;
    }

    if (shortlistedIds.length > 10) {
      onErrorPrompt(
        createHyderabadError(
          'SERVER_ERROR',
          'Maximum 10 restaurants allowed per voting room.'
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const room = await createRoom({
        title,
        hostName,
        candidateIds: shortlistedIds,
        durationMinutes
      });
      setCreatedRoomId(room.id);
    } catch (err: any) {
      onErrorPrompt(createHyderabadError('SERVER_ERROR', err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInviteUrl = (roomId: string) => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}?room=${roomId}`;
  };

  const handleCopyLink = () => {
    if (!createdRoomId) return;
    const url = getInviteUrl(createdRoomId);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (!createdRoomId) return;
    navigator.clipboard.writeText(createdRoomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShare = async () => {
    if (!createdRoomId) return;
    const url = getInviteUrl(createdRoomId);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote for Biryani: ${title}`,
          text: `Cast your vote for Biryani Bandi room ${createdRoomId}!`,
          url
        });
      } catch {
        // Share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  if (createdRoomId) {
    const inviteUrl = getInviteUrl(createdRoomId);

    return (
      <div className="max-w-xl mx-auto py-6 space-y-6">
        <div className="bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-6 sm:p-8 border border-[#D99A35] shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF8EB] dark:bg-[#34241D] text-[#7A241C] flex items-center justify-center shadow-inner border border-[#D99A35]/30">
            <Flame className="w-8 h-8 text-[#D99A35]" />
          </div>

          <div>
            <div className="text-xs font-bold text-[#486447] dark:text-[#78A376] tracking-widest uppercase">
              Voting Room Live
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#30231E] dark:text-[#FFF8EB] mt-1">
              Mehfil is Ready!
            </h2>
            <p className="text-xs sm:text-sm text-[#6B544B] dark:text-[#D1C0B4] mt-1">
              Share this room code with your friends so they can vote immediately.
            </p>
          </div>

          {/* Room Code Showcase */}
          <div className="bg-[#FFF8EB] dark:bg-[#1A120F] border-2 border-dashed border-[#D99A35] rounded-2xl p-5 space-y-2">
            <div className="text-xs text-[#8C766B] font-bold uppercase tracking-wider">
              Copyable Room Code
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl sm:text-4xl font-black text-[#7A241C] dark:text-[#D99A35] tracking-widest">
                {createdRoomId}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-[#D99A35] hover:bg-[#FAD782] text-[#1E110E] transition-colors"
                title="Copy Code"
              >
                {copiedCode ? <CheckCheck className="w-5 h-5 text-[#486447]" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Share Links */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF8EB] dark:bg-[#1A120F] text-[#30231E] dark:text-[#FFF8EB] text-xs truncate border border-[#E8DAC8] dark:border-[#42322B]">
              <span className="truncate flex-1 text-left font-mono">{inviteUrl}</span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#251B17] text-[#30231E] dark:text-[#FFF8EB] font-bold border border-[#E8DAC8] dark:border-[#42322B] shrink-0 hover:bg-[#F2E5D0]"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-3.5 rounded-xl bg-[#3D2921] hover:bg-[#4E352B] text-[#FFF8EB] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#D99A35]/30"
              >
                <Share2 className="w-4 h-4 text-[#D99A35]" />
                <span>Share with Friends</span>
              </button>

              <button
                onClick={() => onRoomCreated(createdRoomId)}
                className="flex-1 py-3.5 rounded-xl bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg"
              >
                <span>Enter Room Now</span>
                <ArrowRight className="w-4 h-4 text-[#D99A35]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="bg-[#FFFFFF] dark:bg-[#251B17] p-6 sm:p-8 rounded-3xl border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-6">
        <div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#30231E] dark:text-[#FFF8EB]">
            Create a Biryani Room
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6B544B] dark:text-[#D1C0B4]">
            Pick 2 to 10 contender restaurants and give your friends a vote.
          </p>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-6">
          {/* Room Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#30231E] dark:text-[#FFF8EB]">
              Room Title / Occasion
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Friday Lunch Biryani Raid"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/50 dark:bg-[#1A120F] focus:bg-white dark:focus:bg-[#201612] focus:outline-none focus:border-[#7A241C] text-[#30231E] dark:text-[#FFF8EB] text-sm font-medium"
            />
          </div>

          {/* Host Name & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#30231E] dark:text-[#FFF8EB]">
                Your Host Nickname
              </label>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Bhaijaan Ahmed"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/50 dark:bg-[#1A120F] focus:bg-white dark:focus:bg-[#201612] focus:outline-none focus:border-[#7A241C] text-[#30231E] dark:text-[#FFF8EB] text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#30231E] dark:text-[#FFF8EB]">
                Voting Window
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/50 dark:bg-[#1A120F] focus:bg-white dark:focus:bg-[#201612] focus:outline-none focus:border-[#7A241C] text-[#30231E] dark:text-[#FFF8EB] text-sm font-medium"
              >
                <option value={30}>30 minutes (Quick lunch decision)</option>
                <option value={60}>1 hour (Standard plan)</option>
                <option value={180}>3 hours (Evening dinner)</option>
                <option value={1440}>24 hours (Weekend raid)</option>
              </select>
            </div>
          </div>

          {/* Candidate Selection Section */}
          <div className="space-y-3 pt-2 border-t border-[#E8DAC8]/60 dark:border-[#42322B]/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#30231E] dark:text-[#FFF8EB]">
                  Select Candidates ({shortlistedIds.length}/10 selected)
                </div>
                <p className="text-[11px] text-[#8C766B] dark:text-[#A39287]">
                  Minimum 2 contenders required for a group vote.
                </p>
              </div>

              {shortlistedIds.length > 0 && (
                <button
                  type="button"
                  onClick={onClearShortlist}
                  className="text-xs text-[#7A241C] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Quick Pick Contender Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {HYDERABAD_RESTAURANTS.map((restaurant) => {
                const isSelected = shortlistedIds.includes(restaurant.id);

                return (
                  <button
                    type="button"
                    key={restaurant.id}
                    onClick={() => onToggleShortlist(restaurant.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#7A241C] bg-[#FFF8EB] dark:bg-[#1C120E] ring-1 ring-[#7A241C] text-[#30231E] dark:text-[#FFF8EB]'
                        : 'border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/30 dark:bg-[#1A120F] hover:bg-[#F2E5D0] dark:hover:bg-[#271C17] text-[#6B544B] dark:text-[#D1C0B4]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#1C120E]">
                        <CulinaryArtwork
                          type={restaurant.artworkType || 'default'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="font-serif font-bold text-sm text-[#30231E] dark:text-[#FFF8EB] truncate">
                          {restaurant.name}
                        </div>
                        <div className="text-[11px] text-[#8C766B] truncate">
                          {restaurant.locality}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#7A241C] text-[#FFF8EB]' : 'bg-[#E8DAC8] dark:bg-[#42322B] text-[#8C766B]'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button (Chilli Red) */}
          <div className="pt-4 border-t border-[#E8DAC8] dark:border-[#42322B]">
            <button
              type="submit"
              disabled={isSubmitting || shortlistedIds.length < 2}
              className="w-full py-4 rounded-xl bg-[#7A241C] hover:bg-[#912D24] disabled:opacity-50 text-[#FFF8EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all"
            >
              <Users className="w-5 h-5 text-[#D99A35]" />
              <span>
                {isSubmitting
                  ? 'Generating Secure Room...'
                  : shortlistedIds.length < 2
                  ? 'Select at least 2 candidates'
                  : `Launch Voting Room with ${shortlistedIds.length} Contenders`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
