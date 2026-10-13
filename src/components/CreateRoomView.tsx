import React, { useState } from 'react';
import {
  Users,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, HyderabadError } from '../types';
import { HYDERABAD_RESTAURANTS } from '../data/restaurants';
import { createRoom } from '../firebase/roomService';
import { ensureAuthenticatedUser } from '../firebase/authService';
import { createHyderabadError } from '../utils/errors';
import { CulinaryArtwork } from './CulinaryArtwork';
import { CINEMA_DIALOGUES } from '../config/cinemaDialogues';

interface CreateRoomViewProps {
  shortlistedIds: string[];
  onToggleShortlist: (id: string) => void;
  onClearShortlist: () => void;
  user: UserProfile | null;
  onRoomCreated: (roomId: string) => void;
  onErrorPrompt: (error: HyderabadError) => void;
  onRequireAuth: (reason: string, onAuthenticated?: () => void) => void;
}

export const CreateRoomView: React.FC<CreateRoomViewProps> = ({
  shortlistedIds,
  onToggleShortlist,
  onClearShortlist,
  user,
  onRoomCreated,
  onErrorPrompt,
  onRequireAuth
}) => {
  const [title, setTitle] = useState('Weekend Biryani Showdown');
  const [hostName, setHostName] = useState(user?.displayName || 'Bhaijaan');
  const [durationMinutes, setDurationMinutes] = useState(1440); // 24 hours default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (shortlistedIds.length < 2) {
      onErrorPrompt(
        createHyderabadError(
          'SERVER_ERROR',
          'Please select at least 2 candidate restaurants for the voting poll.'
        )
      );
      return;
    }

    if (shortlistedIds.length > 10) {
      onErrorPrompt(
        createHyderabadError(
          'SERVER_ERROR',
          'Maximum 10 restaurants allowed per voting poll.'
        )
      );
      return;
    }

    // If not authenticated, authenticate as guest or trigger auth
    let activeUser = user;
    if (!activeUser) {
      try {
        activeUser = await ensureAuthenticatedUser(hostName);
      } catch (authErr: any) {
        onRequireAuth('Sign in or continue as Guest to publish a voting poll:', async () => {
          // Re-trigger
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const room = await createRoom({
        title,
        hostName: hostName || activeUser?.displayName || 'Bhaijaan',
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

  if (createdRoomId) {
    return (
      <div className="max-w-xl mx-auto py-6 space-y-6">
        <div className="bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-6 sm:p-8 border-2 border-[#D99A35] shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF8EB] dark:bg-[#34241D] text-[#7A241C] flex items-center justify-center shadow-inner border border-[#D99A35]/30">
            <Flame className="w-8 h-8 text-[#D99A35]" />
          </div>

          <div>
            <div className="text-xs font-bold text-[#486447] dark:text-[#78A376] tracking-widest uppercase">
              {CINEMA_DIALOGUES.voting.roomCreated}
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#30231E] dark:text-[#FFF8EB] mt-1">
              Scene Set, Poll Live!
            </h2>
            <p className="text-xs sm:text-sm text-[#6B544B] dark:text-[#D1C0B4] mt-1 max-w-sm mx-auto">
              Your public community voting poll has been published to Biryani Bandi. Anyone can now cast their vote directly with zero invitations required.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onRoomCreated(createdRoomId)}
              className="w-full py-4 rounded-xl bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98"
            >
              <span>Enter Live Voting Poll Now</span>
              <ArrowRight className="w-4 h-4 text-[#D99A35]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="bg-[#FFFFFF] dark:bg-[#251B17] p-6 sm:p-8 rounded-3xl border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#D99A35]">
            No Invitations Needed
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#30231E] dark:text-[#FFF8EB]">
            Create a Community Biryani Poll
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6B544B] dark:text-[#D1C0B4]">
            Shortlist 2 to 10 contender restaurants and launch an open public vote.
          </p>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-6">
          {/* Room Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#30231E] dark:text-[#FFF8EB]">
              Poll Title / Theme
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Weekend Biryani Showdown"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/50 dark:bg-[#1A120F] focus:bg-white dark:focus:bg-[#201612] focus:outline-none focus:border-[#7A241C] text-[#30231E] dark:text-[#FFF8EB] text-sm font-medium"
            />
          </div>

          {/* Host Name & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#30231E] dark:text-[#FFF8EB]">
                Creator Nickname
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
                <option value={60}>1 Hour (Quick Lunch Decision)</option>
                <option value={180}>3 Hours (Dinner Planning)</option>
                <option value={1440}>24 Hours (Full Day Poll)</option>
                <option value={10080}>7 Days (Weekly Showdown)</option>
              </select>
            </div>
          </div>

          {/* Shortlisted Ballot Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#30231E] dark:text-[#FFF8EB]">
                  Selected Contenders ({shortlistedIds.length}/10)
                </h3>
                <p className="text-[11px] text-[#8C766B]">
                  Minimum 2 required to create a ballot
                </p>
              </div>

              {shortlistedIds.length > 0 && (
                <button
                  type="button"
                  onClick={onClearShortlist}
                  className="text-xs font-semibold text-[#7A241C] dark:text-[#D99A35] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Quick Candidate Picker List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {HYDERABAD_RESTAURANTS.map((restaurant) => {
                const isSelected = shortlistedIds.includes(restaurant.id);
                return (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => onToggleShortlist(restaurant.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? 'bg-[#FFF8EB] dark:bg-[#2B1D18] border-[#7A241C] text-[#30231E] dark:text-[#FFF8EB]'
                        : 'bg-[#FFFFFF] dark:bg-[#1E1410] border-[#E8DAC8] dark:border-[#42322B] text-[#6B544B] dark:text-[#D1C0B4] hover:border-[#D99A35]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[#241713]">
                        <CulinaryArtwork
                          type={restaurant.artworkType || 'default'}
                          className="w-full h-full object-cover"
                          dishName={restaurant.name}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-xs truncate text-[#30231E] dark:text-[#FFF8EB]">
                          {restaurant.name}
                        </h4>
                        <p className="text-[10px] text-[#8C766B] truncate">
                          {restaurant.locality} · {restaurant.speciality}
                        </p>
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
                  ? 'Publishing Community Poll...'
                  : shortlistedIds.length < 2
                  ? 'Select at least 2 candidates'
                  : `Launch Voting Poll with ${shortlistedIds.length} Contenders`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
