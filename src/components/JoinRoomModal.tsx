import React, { useState } from 'react';
import { X, ArrowRight, KeyRound } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin
}) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onJoin(code.trim().toUpperCase());
      setCode('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#D99A35]/50 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8EB] dark:bg-[#34241D] text-[#7A241C] flex items-center justify-center border border-[#D99A35]/30">
              <KeyRound className="w-5 h-5 text-[#D99A35]" />
            </div>
            <div>
              <h3 className="font-serif font-black text-xl text-[#30231E] dark:text-[#FFF8EB] leading-tight">
                Join a Biryani Room
              </h3>
              <p className="text-xs text-[#8C766B]">Enter your invitation code</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C766B] hover:text-[#30231E] dark:hover:text-[#FFF8EB] hover:bg-[#F2E5D0] dark:hover:bg-[#33231D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#30231E] dark:text-[#FFF8EB]">
              Room Code
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder="e.g. HYD-7X9B"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={16}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/50 dark:bg-[#1A120F] focus:border-[#7A241C] focus:outline-none text-[#30231E] dark:text-[#FFF8EB] font-mono text-lg tracking-widest uppercase placeholder:font-sans placeholder:tracking-normal placeholder:text-[#8C766B]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#FFF8EB] dark:bg-[#1E1410] hover:bg-[#F2E5D0] dark:hover:bg-[#2C1E18] text-[#30231E] dark:text-[#FFF8EB] font-bold text-xs transition-colors border border-[#E8DAC8] dark:border-[#42322B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!code.trim()}
              className="flex-1 py-3 rounded-xl bg-[#7A241C] hover:bg-[#912D24] disabled:opacity-50 text-[#FFF8EB] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <span>Join Room</span>
              <ArrowRight className="w-4 h-4 text-[#D99A35]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
