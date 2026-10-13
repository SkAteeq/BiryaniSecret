import React, { useState } from 'react';
import { X, Sparkles, User, ShieldCheck, Flame, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle, signInAsGuest } from '../firebase/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  actionReason?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionReason
}) => {
  const [nicknameInput, setNicknameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      if (err.code === 'SIGN_IN_CANCELLED') {
        // User voluntarily closed popup - do not show scary error
        setIsSubmitting(false);
        return;
      }
      setErrorMessage(err.message || 'Google Sign-In could not complete. Try Guest mode!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await signInAsGuest(nicknameInput);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not initiate guest session. Try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#D99A35] text-[#30231E] dark:text-[#FFF8EB] space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#8C766B] hover:text-[#30231E] dark:hover:text-[#FFF8EB] hover:bg-[#FFF8EB] dark:hover:bg-[#34241D] transition-colors"
          aria-label="Close auth dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Foodie Microcopy */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#7A241C] to-[#D99A35] text-[#FFF8EB] flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-[#FFF8EB]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8EB] dark:bg-[#1E1410] border border-[#D99A35]/40 text-[#7A241C] dark:text-[#D99A35] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biryani first, formalities later!</span>
          </div>

          <h2 className="font-serif font-black text-2xl text-[#30231E] dark:text-[#FFF8EB]">
            No login drama, bhai.
          </h2>

          <p className="text-xs sm:text-sm text-[#6B544B] dark:text-[#D1C0B4] max-w-xs mx-auto">
            {actionReason || "Seedha biryani pe aao! Choose how you want to participate:"}
          </p>

          <p className="text-[11px] font-semibold text-[#D99A35]">
            Guest ga, Google tho ga — biryani hunt start cheyyi!
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#7A241C]/10 border border-[#7A241C]/30 text-[#7A241C] dark:text-[#FFB5AE] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4 pt-1">
          {/* Option 1: Continue with Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FFFFFF] dark:bg-[#1F1612] hover:bg-[#FFF8EB] dark:hover:bg-[#2C1F1A] border-2 border-[#E8DAC8] dark:border-[#42322B] text-[#30231E] dark:text-[#FFF8EB] font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8DAC8] dark:border-[#42322B]" />
            </div>
            <span className="relative bg-[#FFFFFF] dark:bg-[#251B17] px-3 text-[11px] font-bold uppercase tracking-wider text-[#8C766B]">
              OR
            </span>
          </div>

          {/* Option 2: Continue as Guest */}
          <form onSubmit={handleGuestSignIn} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C766B]">
                Your Foodie Nickname (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#D99A35] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={40}
                  placeholder="e.g. Ustaad Salman or Nawab"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/50 dark:bg-[#1A120F] text-[#30231E] dark:text-[#FFF8EB] text-xs sm:text-sm focus:outline-none focus:border-[#7A241C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#D99A35]" />
              <span>Continue as Guest</span>
            </button>

            {/* Clear explanation for Guest storage */}
            <p className="text-[11px] text-[#8C766B] dark:text-[#A8968C] leading-normal text-center pt-1">
              <strong>Guest Notice:</strong> Assigned an instant anonymous identity. Your votes remain active on this browser, but may not be recoverable if you clear browser cache or switch devices.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
