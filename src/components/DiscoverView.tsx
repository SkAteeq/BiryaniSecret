import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  ExternalLink,
  Plus,
  Check,
  Compass,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { Restaurant, HyderabadError } from '../types';
import { HYDERABAD_RESTAURANTS, getAllLocalities } from '../data/restaurants';
import {
  calculateStraightLineDistanceKm,
  formatDistance,
  requestUserCoordinates,
  Coordinates
} from '../utils/geo';
import { createHyderabadError } from '../utils/errors';

interface DiscoverViewProps {
  shortlistedIds: string[];
  onToggleShortlist: (restaurantId: string) => void;
  onProceedToCreateRoom: () => void;
  onErrorPrompt: (error: HyderabadError) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  shortlistedIds,
  onToggleShortlist,
  onProceedToCreateRoom,
  onErrorPrompt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null); // null means all
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [showHiddenGemsOnly, setShowHiddenGemsOnly] = useState(false);

  const localities = useMemo(() => ['ALL', ...getAllLocalities()], []);

  const handleRequestLocation = async () => {
    setIsLocating(true);
    setLocationDenied(false);
    try {
      const coords = await requestUserCoordinates();
      setUserCoords(coords);
      if (radiusFilter === null) {
        setRadiusFilter(10); // default 10km when location is turned on
      }
    } catch (err: any) {
      setLocationDenied(true);
      onErrorPrompt(createHyderabadError('LOCATION_PERMISSION_DENIED', err.message));
    } finally {
      setIsLocating(false);
    }
  };

  // Filtered and sorted restaurants
  const filteredRestaurants = useMemo(() => {
    return HYDERABAD_RESTAURANTS.map((restaurant) => {
      let distanceKm: number | null = null;
      if (userCoords && restaurant.lat !== null && restaurant.lng !== null) {
        distanceKm = calculateStraightLineDistanceKm(
          userCoords.lat,
          userCoords.lng,
          restaurant.lat,
          restaurant.lng
        );
      }
      return {
        ...restaurant,
        distanceKm
      };
    })
      .filter((restaurant) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = restaurant.name.toLowerCase().includes(q);
          const matchLocality = restaurant.locality.toLowerCase().includes(q);
          const matchBranch = restaurant.branch.toLowerCase().includes(q);
          const matchSpeciality = restaurant.speciality.toLowerCase().includes(q);
          const matchTags = restaurant.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchLocality && !matchBranch && !matchSpeciality && !matchTags) {
            return false;
          }
        }

        // Locality filter
        if (selectedLocality !== 'ALL') {
          if (!restaurant.locality.toLowerCase().includes(selectedLocality.toLowerCase())) {
            return false;
          }
        }

        // Hidden gem filter
        if (showHiddenGemsOnly && !restaurant.isHiddenGem) {
          return false;
        }

        // Radius filter
        if (radiusFilter !== null && userCoords) {
          if (restaurant.distanceKm === null || restaurant.distanceKm > radiusFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // If distance is available, sort nearest first
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, selectedLocality, radiusFilter, userCoords, showHiddenGemsOnly]);

  return (
    <div className="space-y-6 pb-24">
      {/* Shortlist Floating Sticky Bar */}
      {shortlistedIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-amber-900 text-amber-50 p-3.5 sm:p-4 rounded-2xl shadow-xl border border-amber-600 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
              {shortlistedIds.length}
            </span>
            <div className="text-xs sm:text-sm font-semibold truncate">
              {shortlistedIds.length === 1 ? '1 outlet shortlisted' : `${shortlistedIds.length} outlets shortlisted for voting`}
            </div>
          </div>
          <button
            onClick={onProceedToCreateRoom}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-sm"
          >
            Create Voting Room →
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Curated Hyderabad Outlets
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            Branch-verified coordinates with directions and live voting shortlist builder.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant name, mutton dum, branch, or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/60 focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 text-sm placeholder:text-stone-400 transition-colors"
          />
        </div>

        {/* Locality pills */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Filter by Locality
          </label>
          <div className="flex flex-wrap gap-1.5">
            {localities.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocality(loc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedLocality === loc
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {loc === 'ALL' ? 'All Hyderabad' : loc}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Radius & Location */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Straight-Line Distance Radius
            </span>

            {!userCoords ? (
              <button
                onClick={handleRequestLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors"
              >
                <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating Hyderabad...' : 'Use My GPS Location'}</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>GPS Active (approx. straight-line distance)</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[2, 5, 10, 20].map((r) => (
              <button
                key={r}
                disabled={!userCoords}
                onClick={() => setRadiusFilter(radiusFilter === r ? null : r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  !userCoords
                    ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                    : radiusFilter === r
                    ? 'bg-amber-800 text-amber-50'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Within {r} km
              </button>
            ))}

            <button
              onClick={() => setShowHiddenGemsOnly(!showHiddenGemsOnly)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                showHiddenGemsOnly
                  ? 'bg-orange-700 text-white'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>Hidden Gems Only</span>
            </button>
          </div>

          {locationDenied && (
            <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              GPS permission was denied. You can still discover every outlet and filter by locality manually!
            </p>
          )}
        </div>
      </div>

      {/* Restaurants Count & Active Filters Bar */}
      <div className="flex items-center justify-between text-xs text-stone-600 px-1">
        <span>
          Showing <strong className="text-stone-900">{filteredRestaurants.length}</strong> outlets in Hyderabad
        </span>
        {(searchQuery || selectedLocality !== 'ALL' || radiusFilter !== null || showHiddenGemsOnly) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLocality('ALL');
              setRadiusFilter(null);
              setShowHiddenGemsOnly(false);
            }}
            className="text-amber-800 hover:underline flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Restaurant Cards List */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-stone-300 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-stone-900">
            Biryani drought, bhai! Radius penchi choodu.
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            No verified outlets match your current filter combination. Try clearing the search or widening the radius.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLocality('ALL');
              setRadiusFilter(null);
              setShowHiddenGemsOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
          >
            Show All Hyderabad Outlets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRestaurants.map((restaurant) => {
            const isShortlisted = shortlistedIds.includes(restaurant.id);

            return (
              <div
                key={restaurant.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                  isShortlisted ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-stone-200'
                }`}
              >
                {/* Header Gradient Banner */}
                <div className={`p-4 bg-gradient-to-r ${restaurant.imageFallbackGradient} text-white`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {restaurant.isHiddenGem && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                            Hidden Gem
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-amber-200 text-[10px] font-bold">
                          {restaurant.locality}
                        </span>
                      </div>
                      <h3 className="font-serif font-black text-xl text-white mt-1 leading-tight">
                        {restaurant.name}
                      </h3>
                      <p className="text-xs text-amber-100/90 font-medium">{restaurant.branch}</p>
                    </div>

                    {/* Shortlist check button */}
                    <button
                      onClick={() => onToggleShortlist(restaurant.id)}
                      className={`p-2 rounded-xl font-bold transition-all shrink-0 ${
                        isShortlisted
                          ? 'bg-amber-400 text-stone-950 shadow-md scale-105'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                      title={isShortlisted ? 'Remove from voting shortlist' : 'Add to voting shortlist'}
                    >
                      {isShortlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Speciality & Notes */}
                    <div className="flex items-start gap-2 text-xs">
                      <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                        Speciality:
                      </span>
                      <span className="text-stone-800 font-semibold">{restaurant.speciality}</span>
                    </div>

                    {restaurant.curatorNotes && (
                      <p className="text-xs text-stone-600 italic bg-stone-50 p-2 rounded-xl border border-stone-200/80">
                        "{restaurant.curatorNotes}"
                      </p>
                    )}

                    {/* Address & verified details */}
                    <p className="text-[11px] text-stone-500 leading-snug">
                      {restaurant.address}
                    </p>

                    {/* Price & Hours meta */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-600 pt-1">
                      {restaurant.pricePerPersonMin && restaurant.pricePerPersonMax ? (
                        <span>
                          Approx. <strong>₹{restaurant.pricePerPersonMin} – ₹{restaurant.pricePerPersonMax}</strong> / person
                        </span>
                      ) : (
                        <span className="text-stone-400">Price unverified</span>
                      )}

                      {restaurant.openingHours && (
                        <span>
                          Hours: <strong className="text-stone-700">{restaurant.openingHours}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Bar with Distance & Map link */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold text-stone-600">
                      {restaurant.distanceKm !== null ? (
                        <span className="text-emerald-800 font-bold">
                          📍 {formatDistance(restaurant.distanceKm)}
                        </span>
                      ) : (
                        <span className="text-stone-400">Straight-line distance uncalculated</span>
                      )}
                    </div>

                    <a
                      href={restaurant.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
