import React from 'react';
import { AlertCircle, RotateCcw, X, MapPin, Compass } from 'lucide-react';
import { HyderabadError } from '../types';

interface HyderabadErrorBannerProps {
  error: HyderabadError | null;
  onDismiss: () => void;
  onAction?: (actionType?: string) => void;
}

export const HyderabadErrorBanner: React.FC<HyderabadErrorBannerProps> = ({
  error,
  onDismiss,
  onAction
}) => {
  if (!error) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#2C1C16] text-[#FFF8EB] shadow-2xl border border-[#D99A35]/50 p-5 sm:p-6 my-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#7A241C]/30 text-[#D99A35] shrink-0 mt-0.5 border border-[#D99A35]/30">
          <AlertCircle className="w-5 h-5 text-[#D99A35]" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#D99A35]">
            Ustaad Suniye
          </div>

          <h4 className="mt-1 text-base sm:text-lg font-bold font-serif text-[#FFF8EB] leading-snug">
            {error.hyderabadMessage}
          </h4>

          <p className="mt-1 text-xs sm:text-sm text-[#FFF8EB]/80 leading-relaxed">
            {error.recoveryAction}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {error.actionType === 'retry' && (
              <button
                onClick={() => onAction?.('retry')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-xs transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D99A35]" />
                Malli Try Cheyyi
              </button>
            )}

            {error.actionType === 'enable_location' && (
              <button
                onClick={() => onAction?.('enable_location')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#486447] hover:bg-[#587A56] text-[#FFF8EB] font-bold text-xs transition-colors shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FFF8EB]" />
                Location Permission Ivvu
              </button>
            )}

            {error.actionType === 'increase_radius' && (
              <button
                onClick={() => onAction?.('increase_radius')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D99A35] hover:bg-[#FAD782] text-[#1E110E] font-bold text-xs transition-colors shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                Radius Penchu
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#D99A35]/80 hover:text-[#FFF8EB] hover:bg-[#3E2921] transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
