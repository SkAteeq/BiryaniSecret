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
    <div className="relative overflow-hidden rounded-2xl bg-amber-950 text-amber-50 shadow-xl border border-amber-600/50 p-4 sm:p-5 my-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Decorative Hyderabad spice pattern accent */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-700/60">
              Ustaad Suniye
            </span>
          </div>

          <h4 className="mt-1.5 text-base sm:text-lg font-bold font-serif text-amber-100 leading-snug">
            {error.hyderabadMessage}
          </h4>

          <p className="mt-1 text-xs sm:text-sm text-amber-200/80">
            {error.recoveryAction}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {error.actionType === 'retry' && (
              <button
                onClick={() => onAction?.('retry')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Malli Try Cheyyi
              </button>
            )}

            {error.actionType === 'enable_location' && (
              <button
                onClick={() => onAction?.('enable_location')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
                Location Permission Ivvu
              </button>
            )}

            {error.actionType === 'increase_radius' && (
              <button
                onClick={() => onAction?.('increase_radius')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                Radius Penchu
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-amber-400/80 hover:text-amber-100 hover:bg-amber-900/50 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
