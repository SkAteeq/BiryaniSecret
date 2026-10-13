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
  Flame,
  AlertCircle
} from 'lucide-react';
import { Restaurant, UserProfile, HyderabadError } from '../types';
import { HYDERABAD_RESTAURANTS, getRestaurantById } from '../data/restaurants';
import { createRoom } from '../firebase/roomService';
import { createHyderabadError } from '../utils/errors';

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

  // If room is already created, show confirmation & share modal
  if (createdRoomId) {
    const inviteUrl = getInviteUrl(createdRoomId);

    return (
      <div className="max-w-xl mx-auto py-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner">
            <Flame className="w-8 h-8 text-amber-600" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Voting Room Live
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-stone-900 mt-2">
              Mehfil is Ready!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Share this room code with your friends so they can vote immediately.
            </p>
          </div>

          {/* Room Code Card */}
          <div className="bg-stone-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 space-y-2">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
              Copyable Room Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-black text-amber-950 tracking-widest">
                {createdRoomId}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors"
                title="Copy Code"
              >
                {copiedCode ? <CheckCheck className="w-5 h-5 text-emerald-800" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Share Links */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs truncate border border-stone-200">
              <span className="truncate flex-1 text-left font-mono">{inviteUrl}</span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-white text-stone-900 font-bold border border-stone-300 shrink-0 hover:bg-stone-50"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share with Friends</span>
              </button>

              <button
                onClick={() => onRoomCreated(createdRoomId)}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <span>Enter Room Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
        <div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-stone-900">
            Create a Biryani Room
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            Pick 2 to 10 contender restaurants and give your friends a vote.
          </p>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-6">
          {/* Room Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Room Title / Occasion
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Friday Lunch Biryani Raid"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 text-sm font-medium"
            />
          </div>

          {/* Host Name & Voting Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Your Host Nickname
              </label>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Bhaijaan Ahmed"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Voting Window
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 text-sm font-medium"
              >
                <option value={30}>30 minutes (Quick lunch)</option>
                <option value={60}>1 hour (Standard plan)</option>
                <option value={180}>3 hours (Evening dinner)</option>
                <option value={1440}>24 hours (Weekend planning)</option>
              </select>
            </div>
          </div>

          {/* Candidate Selection Section */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Select Candidates ({shortlistedIds.length}/10 selected)
                </label>
                <p className="text-[11px] text-stone-500">
                  Minimum 2 required for a vote.
                </p>
              </div>

              {shortlistedIds.length > 0 && (
                <button
                  type="button"
                  onClick={onClearShortlist}
                  className="text-xs text-rose-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Quick Pick Pill Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {HYDERABAD_RESTAURANTS.map((restaurant) => {
                const isSelected = shortlistedIds.includes(restaurant.id);

                return (
                  <button
                    type="button"
                    key={restaurant.id}
                    onClick={() => onToggleShortlist(restaurant.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 ring-1 ring-amber-600 text-stone-900'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-sm text-stone-900 truncate">
                        {restaurant.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {restaurant.branch} • {restaurant.locality}
                      </div>
                      <div className="text-[11px] text-amber-800 font-medium truncate mt-0.5">
                        {restaurant.speciality}
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-stone-200">
            <button
              type="submit"
              disabled={isSubmitting || shortlistedIds.length < 2}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Users className="w-5 h-5" />
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
