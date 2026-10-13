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
  Dices
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
import { CulinaryArtwork } from './CulinaryArtwork';
import { CINEMA_DIALOGUES } from '../config/cinemaDialogues';

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
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [showHiddenGemsOnly, setShowHiddenGemsOnly] = useState(false);
  const [directorsCutId, setDirectorsCutId] = useState<string | null>(null);

  const localities = useMemo(() => ['ALL', ...getAllLocalities()], []);

  const handleRequestLocation = async () => {
    setIsLocating(true);
    setLocationDenied(false);
    try {
      const coords = await requestUserCoordinates();
      setUserCoords(coords);
      if (radiusFilter === null) {
        setRadiusFilter(10);
      }
    } catch (err: any) {
      setLocationDenied(true);
      onErrorPrompt(createHyderabadError('LOCATION_PERMISSION_DENIED', err.message));
    } finally {
      setIsLocating(false);
    }
  };

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

        if (selectedLocality !== 'ALL') {
          if (!restaurant.locality.toLowerCase().includes(selectedLocality.toLowerCase())) {
            return false;
          }
        }

        if (showHiddenGemsOnly && !restaurant.isHiddenGem) {
          return false;
        }

        if (radiusFilter !== null && userCoords) {
          if (restaurant.distanceKm === null || restaurant.distanceKm > radiusFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, selectedLocality, radiusFilter, userCoords, showHiddenGemsOnly]);

  // Identify the closest restaurant when distance is available
  const nearestHeroId = useMemo(() => {
    if (!userCoords) return null;
    const withDist = filteredRestaurants.filter((r) => r.distanceKm !== null);
    if (withDist.length === 0) return null;
    const min = Math.min(...withDist.map((r) => r.distanceKm as number));
    return withDist.find((r) => r.distanceKm === min)?.id || null;
  }, [filteredRestaurants, userCoords]);

  // Director's Cut random surprise pick
  const handleDirectorsCut = () => {
    if (filteredRestaurants.length === 0) return;
    const randomPick = filteredRestaurants[Math.floor(Math.random() * filteredRestaurants.length)];
    setDirectorsCutId(randomPick.id);
    const element = document.getElementById(`restaurant-card-${randomPick.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Shortlist Floating Sticky Bar (Finalist List) */}
      {shortlistedIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-[#30231E] text-[#FFF8EB] p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-[#D99A35] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-full bg-[#D99A35] text-[#1E110E] font-black text-xs flex items-center justify-center shrink-0">
              {shortlistedIds.length}
            </span>
            <div className="text-xs sm:text-sm font-semibold truncate">
              {shortlistedIds.length === 1
                ? `1 contender in ${CINEMA_DIALOGUES.discovery.finalistList}`
                : `${shortlistedIds.length} contenders in ${CINEMA_DIALOGUES.discovery.finalistList}`}
            </div>
          </div>
          <button
            onClick={onProceedToCreateRoom}
            className="px-4 py-2 rounded-xl bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-md flex items-center gap-1.5"
          >
            <span>Lock Scene for Vote →</span>
          </button>
        </div>
      )}

      {/* Filter and Control Panel */}
      <div className="bg-[#FFFFFF] dark:bg-[#251B17] p-5 sm:p-6 rounded-3xl border border-[#E8DAC8] dark:border-[#42322B] shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#30231E] dark:text-[#FFF8EB] tracking-tight">
              Curated Hyderabad Outlets
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B544B] dark:text-[#D1C0B4]">
              Branch-verified coordinates, authentic food photography, and direct Google Maps directions.
            </p>
          </div>

          {/* Director's Cut Surprise Button */}
          <button
            onClick={handleDirectorsCut}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFF8EB] dark:bg-[#1E1410] border border-[#D99A35]/60 hover:bg-[#D99A35] hover:text-[#1E110E] text-[#7A241C] dark:text-[#D99A35] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            title="Pick a random biryani candidate"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>{CINEMA_DIALOGUES.discovery.directorsCut}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#D99A35] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant name, mutton dum, kunda, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/50 dark:bg-[#1A120F] focus:bg-white dark:focus:bg-[#201612] focus:outline-none focus:border-[#7A241C] text-[#30231E] dark:text-[#FFF8EB] text-sm placeholder:text-[#8C766B] transition-colors"
          />
        </div>

        {/* Locality Filter Buttons */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B544B] dark:text-[#D1C0B4]">
            Filter by Locality
          </div>
          <div className="flex flex-wrap gap-1.5">
            {localities.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocality(loc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedLocality === loc
                    ? 'bg-[#7A241C] text-[#FFF8EB] shadow-sm'
                    : 'bg-[#FFF8EB] dark:bg-[#1E1410] hover:bg-[#F2E5D0] dark:hover:bg-[#2C1E18] text-[#30231E] dark:text-[#FFF8EB] border border-[#E8DAC8] dark:border-[#42322B]'
                }`}
              >
                {loc === 'ALL' ? 'All Hyderabad' : loc}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Radius & Location */}
        <div className="pt-2 border-t border-[#E8DAC8]/60 dark:border-[#42322B]/60 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B544B] dark:text-[#D1C0B4]">
              Approx. Straight-Line Distance Radius
            </span>

            {!userCoords ? (
              <button
                onClick={handleRequestLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF2EA] dark:bg-[#202B1F] text-[#486447] dark:text-[#78A376] border border-[#486447]/30 font-bold text-xs transition-colors"
              >
                <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating Hyderabad...' : 'Spot Nearest Hero (GPS)'}</span>
              </button>
            ) : (
              <span className="text-xs text-[#486447] dark:text-[#78A376] font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>GPS Ready · Showing Straight-Line Radius</span>
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
                    ? 'opacity-40 cursor-not-allowed bg-[#E8DAC8]/30 dark:bg-[#1E1410] text-[#8C766B]'
                    : radiusFilter === r
                    ? 'bg-[#7A241C] text-[#FFF8EB]'
                    : 'bg-[#FFF8EB] dark:bg-[#1E1410] text-[#30231E] dark:text-[#FFF8EB] border border-[#E8DAC8] dark:border-[#42322B]'
                }`}
              >
                Within {r} km
              </button>
            ))}

            <button
              onClick={() => setShowHiddenGemsOnly(!showHiddenGemsOnly)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                showHiddenGemsOnly
                  ? 'bg-[#D99A35] text-[#1E110E] font-bold'
                  : 'bg-[#FFF8EB] dark:bg-[#1E1410] text-[#D99A35] border border-[#D99A35]/40'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#D99A35]" />
              <span>{CINEMA_DIALOGUES.discovery.underratedBlockbusters}</span>
            </button>
          </div>

          {locationDenied && (
            <p className="text-xs text-[#7A241C] dark:text-[#D99A35] bg-[#F7EBEA] dark:bg-[#331815] p-2.5 rounded-xl border border-[#7A241C]/30">
              Hero location reveal cheyyaledu! You can still explore every blockbuster outlet and filter by locality manually.
            </p>
          )}
        </div>
      </div>

      {/* Count & Reset Row */}
      <div className="flex items-center justify-between text-xs text-[#6B544B] dark:text-[#D1C0B4] px-1">
        <span>
          Showing <strong className="text-[#30231E] dark:text-[#FFF8EB]">{filteredRestaurants.length}</strong> blockbuster outlets in Hyderabad
        </span>
        {(searchQuery || selectedLocality !== 'ALL' || radiusFilter !== null || showHiddenGemsOnly) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLocality('ALL');
              setRadiusFilter(null);
              setShowHiddenGemsOnly(false);
              setDirectorsCutId(null);
            }}
            className="text-[#7A241C] dark:text-[#D99A35] hover:underline flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Restaurant Cards Grid with Visual Hero Images */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl border border-dashed border-[#E8DAC8] dark:border-[#42322B] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF8EB] dark:bg-[#331815] text-[#7A241C] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#30231E] dark:text-[#FFF8EB]">
            Ee radius lo biryani hero dorakaledu bhai!
          </h3>
          <p className="text-xs sm:text-sm text-[#6B544B] dark:text-[#D1C0B4] max-w-md mx-auto">
            No verified outlets match your current filter combination. Try clearing search or widening the radius.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLocality('ALL');
              setRadiusFilter(null);
              setShowHiddenGemsOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#7A241C] text-[#FFF8EB] font-bold text-xs"
          >
            Show All Blockbuster Outlets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRestaurants.map((restaurant) => {
            const isShortlisted = shortlistedIds.includes(restaurant.id);
            const isNearestHero = restaurant.id === nearestHeroId;
            const isDirectorsCut = restaurant.id === directorsCutId;
            const isBudgetStar = restaurant.pricePerPersonMin !== null && restaurant.pricePerPersonMin <= 220;

            return (
              <div
                id={`restaurant-card-${restaurant.id}`}
                key={restaurant.id}
                className={`bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg ${
                  isDirectorsCut
                    ? 'border-[#D99A35] ring-4 ring-[#D99A35]/30 scale-101'
                    : isShortlisted
                    ? 'border-[#7A241C] ring-2 ring-[#7A241C]/30'
                    : 'border-[#E8DAC8] dark:border-[#42322B]'
                }`}
              >
                {/* Visual Hero Culinary Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1C120E]">
                  <CulinaryArtwork
                    type={restaurant.artworkType || 'default'}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    dishName={restaurant.name}
                  />

                  {/* Gradient Overlay for Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C120E] via-transparent to-transparent opacity-80" />

                  {/* Card Header Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                    <div>
                      {/* Context-aware cinema labels */}
                      <div className="text-[11px] font-semibold text-[#D99A35] flex items-center gap-1.5 flex-wrap drop-shadow">
                        <span>{restaurant.locality}</span>
                        {isNearestHero && (
                          <>
                            <span aria-hidden="true" className="text-[#D99A35]/60">·</span>
                            <span className="text-[#486447] dark:text-[#78A376] font-bold">
                              ★ {CINEMA_DIALOGUES.discovery.nearestHero}
                            </span>
                          </>
                        )}
                        {isBudgetStar && (
                          <>
                            <span aria-hidden="true" className="text-[#D99A35]/60">·</span>
                            <span className="text-[#FFF8EB] font-bold">
                              {CINEMA_DIALOGUES.discovery.pocketFriendlyStar}
                            </span>
                          </>
                        )}
                        {restaurant.isHiddenGem && (
                          <>
                            <span aria-hidden="true" className="text-[#D99A35]/60">·</span>
                            <span className="text-[#D99A35] font-bold">
                              {CINEMA_DIALOGUES.discovery.underratedBlockbusters}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="font-serif font-black text-xl text-[#FFF8EB] leading-tight drop-shadow">
                        {restaurant.name}
                      </h3>
                    </div>

                    {/* Shortlist Voting Button */}
                    <button
                      onClick={() => onToggleShortlist(restaurant.id)}
                      className={`p-2.5 rounded-2xl font-bold transition-all shrink-0 shadow-lg ${
                        isShortlisted
                          ? 'bg-[#7A241C] text-[#FFF8EB] scale-105 ring-2 ring-[#D99A35]'
                          : 'bg-[#FFF8EB] text-[#30231E] hover:bg-[#D99A35] hover:text-[#1E110E]'
                      }`}
                      title={isShortlisted ? 'Remove from voting shortlist' : 'Add to finalist list'}
                    >
                      {isShortlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Speciality & Spice Profile */}
                    <div className="text-xs">
                      <div className="font-bold text-[#30231E] dark:text-[#FFF8EB]">
                        {restaurant.speciality}
                      </div>
                      {restaurant.spiceProfile && (
                        <div className="text-[11px] text-[#7A241C] dark:text-[#D99A35] font-semibold mt-0.5">
                          Profile: {restaurant.spiceProfile}
                        </div>
                      )}
                    </div>

                    {/* Curator Notes */}
                    {restaurant.curatorNotes && (
                      <p className="text-xs text-[#6B544B] dark:text-[#D1C0B4] italic bg-[#FFF8EB]/70 dark:bg-[#1E1410] p-2.5 rounded-xl border border-[#E8DAC8]/60 dark:border-[#42322B]/60 leading-relaxed">
                        "{restaurant.curatorNotes}"
                      </p>
                    )}

                    {/* Address & Verified Info */}
                    <p className="text-[11px] text-[#8C766B] dark:text-[#A39287] leading-snug">
                      {restaurant.address}
                    </p>

                    {/* Price and Hours */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B544B] dark:text-[#D1C0B4] pt-1">
                      {restaurant.pricePerPersonMin && restaurant.pricePerPersonMax ? (
                        <span>
                          Approx. <strong className="text-[#30231E] dark:text-[#FFF8EB] tabular-nums">₹{restaurant.pricePerPersonMin} – ₹{restaurant.pricePerPersonMax}</strong> / person
                        </span>
                      ) : (
                        <span className="text-[#8C766B]">Price unverified</span>
                      )}

                      {restaurant.openingHours && (
                        <>
                          <span aria-hidden="true" className="text-[#D99A35]/60">·</span>
                          <span>
                            Hours: <strong className="text-[#30231E] dark:text-[#FFF8EB]">{restaurant.openingHours}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Strip: "Take Me to the Dum" Directions Button */}
                  <div className="pt-3 border-t border-[#E8DAC8]/60 dark:border-[#42322B]/60 flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold">
                      {restaurant.distanceKm !== null ? (
                        <span className="text-[#486447] dark:text-[#78A376] font-bold">
                          📍 {formatDistance(restaurant.distanceKm)}
                        </span>
                      ) : (
                        <span className="text-[#8C766B]">Straight-line distance uncalculated</span>
                      )}
                    </div>

                    <a
                      href={restaurant.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8EB] dark:bg-[#1E1410] border border-[#D99A35]/50 text-[#7A241C] dark:text-[#D99A35] font-bold text-xs hover:bg-[#7A241C] hover:text-[#FFF8EB] dark:hover:bg-[#7A241C] transition-colors"
                      title="Open Google Maps road navigation"
                    >
                      <span>{CINEMA_DIALOGUES.discovery.takeMeToDum}</span>
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
