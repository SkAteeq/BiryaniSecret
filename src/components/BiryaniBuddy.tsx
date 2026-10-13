import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  MapPin,
  ExternalLink,
  Plus,
  Check,
  Compass,
  Navigation,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Restaurant, HyderabadError } from '../types';
import { HYDERABAD_RESTAURANTS, getRestaurantById, getAllLocalities } from '../data/restaurants';
import {
  calculateStraightLineDistanceKm,
  formatDistance,
  requestUserCoordinates,
  Coordinates
} from '../utils/geo';
import { generateFallbackResponse } from '../utils/fallbackChatEngine';
import { createHyderabadError } from '../utils/errors';
import { CINEMA_DIALOGUES } from '../config/cinemaDialogues';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'buddy';
  text: string;
  timestamp: string;
  recommendedIds?: string[];
}

interface BiryaniBuddyProps {
  shortlistedIds: string[];
  onToggleShortlist: (id: string) => void;
  onErrorPrompt: (error: HyderabadError) => void;
}

export const BiryaniBuddy: React.FC<BiryaniBuddyProps> = ({
  shortlistedIds,
  onToggleShortlist,
  onErrorPrompt
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [userLocationLabel, setUserLocationLabel] = useState<string | null>(null);
  const [showLocalityPicker, setShowLocalityPicker] = useState(false);
  const [confirmRestaurant, setConfirmRestaurant] = useState<Restaurant | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message with Tollywood/Bollywood mass dialogue
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'buddy',
      text: `${CINEMA_DIALOGUES.chatbot.greeting}\n\nI can calculate approximate straight-line distances from your location, compare top contenders, and help your gang lock the winning biryani scene! Pick a quick option below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedIds: ['shadab-charminar', 'bawarchi-rtcxroads']
    }
  ]);

  const localities = useMemo(() => getAllLocalities(), []);

  // Compute straight-line distances to all restaurants
  const restaurantsWithDistances = useMemo(() => {
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
    });
  }, [userCoords]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Request browser GPS location
  const handleRequestLocation = async (): Promise<boolean> => {
    try {
      const coords = await requestUserCoordinates();
      setUserCoords(coords);
      setUserLocationLabel('Your Current GPS Location');
      setShowLocalityPicker(false);
      return true;
    } catch (err: any) {
      onErrorPrompt(createHyderabadError('LOCATION_PERMISSION_DENIED', err.message));
      setShowLocalityPicker(true);
      return false;
    }
  };

  // Manual Locality Selection fallback
  const handleSelectLocality = (locality: string) => {
    // Map known localities to reference coordinates
    const referenceMap: Record<string, Coordinates> = {
      'Charminar': { lat: 17.3616, lng: 78.4747 },
      'RTC X Roads': { lat: 17.4042, lng: 78.4983 },
      'Secunderabad': { lat: 17.4399, lng: 78.4983 },
      'Khairtabad': { lat: 17.4111, lng: 78.4612 },
      'Habsiguda': { lat: 17.4087, lng: 78.5442 },
      'Manikonda': { lat: 17.4019, lng: 78.3815 },
      'Hyderguda': { lat: 17.3995, lng: 78.4820 },
      'Gachibowli': { lat: 17.4357, lng: 78.3695 }
    };

    const targetKey = Object.keys(referenceMap).find((k) => locality.includes(k)) || 'Charminar';
    setUserCoords(referenceMap[targetKey]);
    setUserLocationLabel(`Selected Locality: ${locality}`);
    setShowLocalityPicker(false);

    // Send acknowledgment message
    const ackMessage: ChatMessage = {
      id: String(Date.now()),
      sender: 'buddy',
      text: `${CINEMA_DIALOGUES.chatbot.searchingNearby}\n\nReference location locked to ${locality}! Calculating straight-line distances from here.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, ackMessage]);
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    // Check if query is location-dependent and location is not yet set
    const isLocationQuery =
      trimmed.toLowerCase().includes('near') ||
      trimmed.toLowerCase().includes('closest') ||
      trimmed.toLowerCase().includes('within') ||
      trimmed.toLowerCase().includes('distance') ||
      trimmed.toLowerCase().includes('5 km') ||
      trimmed.toLowerCase().includes('3 km');

    if (isLocationQuery && !userCoords) {
      // Prompt for location first
      const userMsg: ChatMessage = {
        id: String(Date.now()),
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, userMsg]);

      const promptMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'buddy',
        text: `Arrey miya, ${CINEMA_DIALOGUES.chatbot.searchingNearby} Share your GPS or pick your reference locality below:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, promptMsg]);
      setShowLocalityPicker(true);
      setInputText('');
      return;
    }

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare factual restaurant context
      const contextPayload = restaurantsWithDistances.map((r) => ({
        id: r.id,
        name: r.name,
        branch: r.branch,
        locality: r.locality,
        distanceText: r.distanceKm !== null ? formatDistance(r.distanceKm) : 'Distance uncalculated',
        priceText:
          r.pricePerPersonMin && r.pricePerPersonMax
            ? `₹${r.pricePerPersonMin} – ₹${r.pricePerPersonMax} / person`
            : 'Price unverified',
        openingHours: r.openingHours || 'Hours unverified',
        speciality: r.speciality,
        curatorNotes: r.curatorNotes
      }));

      // Call server-side /api/chat route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          })),
          restaurantContext: contextPayload,
          userLocationLabel: userLocationLabel || 'Not specified'
        })
      });

      const data = await response.json();

      if (data && !data.fallback && data.reply) {
        // AI response succeeded
        // Extract matching recommended restaurant IDs
        const matchedIds = HYDERABAD_RESTAURANTS.filter((r) =>
          data.reply.toLowerCase().includes(r.name.toLowerCase()) ||
          data.reply.toLowerCase().includes(r.id.split('-')[0])
        ).map((r) => r.id);

        const aiMessage: ChatMessage = {
          id: String(Date.now() + 1),
          sender: 'buddy',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedIds: matchedIds.length > 0 ? matchedIds.slice(0, 3) : undefined
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Fallback to intelligent rule-based engine
        const fallback = generateFallbackResponse(
          trimmed,
          restaurantsWithDistances,
          userLocationLabel
        );

        const fallbackMsg: ChatMessage = {
          id: String(Date.now() + 1),
          sender: 'buddy',
          text: fallback.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedIds: fallback.recommendedRestaurantIds
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch {
      // Offline or network error fallback
      const fallback = generateFallbackResponse(
        trimmed,
        restaurantsWithDistances,
        userLocationLabel
      );

      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'buddy',
        text: fallback.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedIds: fallback.recommendedRestaurantIds
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAddToShortlist = (restaurant: Restaurant) => {
    onToggleShortlist(restaurant.id);
    setConfirmRestaurant(null);

    const isAdded = !shortlistedIds.includes(restaurant.id);
    const ack: ChatMessage = {
      id: String(Date.now()),
      sender: 'buddy',
      text: isAdded
        ? `Mass entry! Added ${restaurant.name} to your group voting ballot. ${CINEMA_DIALOGUES.chatbot.askToVote}`
        : `Removed ${restaurant.name} from the shortlist.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, ack]);
  };

  const quickReplies = [
    'Find biryani near me',
    'Show hotels within 5 km',
    'Best budget options',
    'Compare nearby restaurants',
    'Help me choose a winner'
  ];

  return (
    <>
      {/* Floating Chatbot Button (Bottom-Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 p-3.5 sm:p-4 rounded-full bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] shadow-2xl border-2 border-[#D99A35] transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
        aria-label="Open Biryani Buddy AI Chatbot"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 text-[#FFF8EB]" />
          <Flame className="w-3.5 h-3.5 text-[#D99A35] absolute -top-1.5 -right-1.5 animate-bounce" />
        </div>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
          Ask Biryani Buddy
        </span>
      </button>

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[82vh] bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl shadow-2xl border-2 border-[#D99A35] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-[#30231E] text-[#FFF8EB] p-4 flex items-center justify-between border-b border-[#D99A35]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7A241C] to-[#D99A35] flex items-center justify-center text-[#FFF8EB] shadow-inner">
                <Flame className="w-5 h-5 text-[#FFF8EB]" />
              </div>
              <div>
                <h3 className="font-serif font-black text-base text-[#FFF8EB] leading-tight flex items-center gap-1.5">
                  <span>Biryani Buddy</span>
                  <span className="text-[10px] text-[#D99A35] font-sans font-bold uppercase tracking-wider bg-[#1E110E] px-1.5 py-0.5 rounded border border-[#D99A35]/30">
                    AI Foodie
                  </span>
                </h3>
                <p className="text-[11px] text-[#D99A35]/80">
                  {userLocationLabel || 'Hyderabad Biryani Advisor'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#D99A35] hover:text-[#FFF8EB] hover:bg-[#3D2921] transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Bar / Fallback Selector */}
          {showLocalityPicker && (
            <div className="bg-[#FFF8EB] dark:bg-[#1E1410] p-3 border-b border-[#E8DAC8] dark:border-[#42322B] space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#7A241C] dark:text-[#D99A35] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Select your reference location:
                </span>
                <button
                  onClick={() => setShowLocalityPicker(false)}
                  className="text-[11px] text-[#8C766B] hover:underline"
                >
                  Dismiss
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                <button
                  onClick={handleRequestLocation}
                  className="px-2.5 py-1 rounded-lg bg-[#486447] hover:bg-[#587A56] text-[#FFF8EB] font-bold text-[11px] flex items-center gap-1 shadow-sm"
                >
                  <Compass className="w-3 h-3" />
                  <span>Use My GPS</span>
                </button>

                {localities.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleSelectLocality(loc)}
                    className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] dark:bg-[#2A1D18] hover:bg-[#F2E5D0] dark:hover:bg-[#382620] text-[#30231E] dark:text-[#FFF8EB] border border-[#E8DAC8] dark:border-[#42322B] text-[11px] font-semibold"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isBuddy = msg.sender === 'buddy';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBuddy ? 'items-start' : 'items-end'} space-y-2`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isBuddy
                        ? 'bg-[#FFF8EB] dark:bg-[#1C120E] text-[#30231E] dark:text-[#FFF8EB] border border-[#E8DAC8] dark:border-[#42322B] shadow-sm'
                        : 'bg-[#7A241C] text-[#FFF8EB] shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        isBuddy ? 'text-[#8C766B]' : 'text-[#FFF8EB]/70'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Interactive Recommendation Cards for recommended restaurants */}
                  {isBuddy && msg.recommendedIds && msg.recommendedIds.length > 0 && (
                    <div className="w-full space-y-2 pt-1 pl-1">
                      {msg.recommendedIds.map((rId) => {
                        const restaurant = getRestaurantById(rId);
                        if (!restaurant) return null;

                        const withDist = restaurantsWithDistances.find((r) => r.id === rId);
                        const isShortlisted = shortlistedIds.includes(restaurant.id);

                        return (
                          <div
                            key={rId}
                            className="bg-[#FFFFFF] dark:bg-[#1E1410] rounded-2xl p-3 border border-[#D99A35]/50 shadow-sm space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-serif font-black text-sm text-[#30231E] dark:text-[#FFF8EB]">
                                  {restaurant.name}
                                </h4>
                                <p className="text-[11px] text-[#8C766B]">
                                  {restaurant.branch} · {restaurant.locality}
                                </p>
                              </div>

                              <span className="text-[11px] font-bold text-[#486447] dark:text-[#78A376] shrink-0">
                                {withDist && withDist.distanceKm !== null
                                  ? formatDistance(withDist.distanceKm)
                                  : 'Distance unavailable'}
                              </span>
                            </div>

                            <div className="text-[11px] text-[#6B544B] dark:text-[#D1C0B4] flex flex-wrap gap-x-2">
                              {restaurant.pricePerPersonMin ? (
                                <span>
                                  ₹{restaurant.pricePerPersonMin}–₹{restaurant.pricePerPersonMax}/person
                                </span>
                              ) : (
                                <span>Price unverified</span>
                              )}
                              {restaurant.openingHours && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{restaurant.openingHours}</span>
                                </>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-1 flex items-center gap-2">
                              <a
                                href={restaurant.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#FFF8EB] dark:bg-[#2A1D18] hover:bg-[#F2E5D0] text-[#7A241C] dark:text-[#D99A35] font-bold text-[11px] flex items-center justify-center gap-1 border border-[#D99A35]/40 transition-colors"
                              >
                                <Navigation className="w-3 h-3 text-[#D99A35]" />
                                <span>Directions</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>

                              <button
                                onClick={() => setConfirmRestaurant(restaurant)}
                                className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm ${
                                  isShortlisted
                                    ? 'bg-[#486447] text-[#FFF8EB]'
                                    : 'bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB]'
                                }`}
                              >
                                {isShortlisted ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>In Ballot</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3 text-[#D99A35]" />
                                    <span>Add to Vote</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#FFF8EB] dark:bg-[#1C120E] text-[#30231E] dark:text-[#FFF8EB] rounded-2xl w-fit text-xs border border-[#E8DAC8] dark:border-[#42322B]">
                <Flame className="w-3.5 h-3.5 text-[#D99A35] animate-spin" />
                <span>Biryani Buddy is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Buttons */}
          <div className="px-3 py-2 bg-[#FFF8EB]/70 dark:bg-[#1C120E]/70 border-t border-[#E8DAC8] dark:border-[#42322B] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSendMessage(reply)}
                className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] dark:bg-[#251B17] hover:bg-[#7A241C] hover:text-[#FFF8EB] text-[#30231E] dark:text-[#FFF8EB] border border-[#E8DAC8] dark:border-[#42322B] text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 bg-[#FFFFFF] dark:bg-[#251B17] border-t border-[#E8DAC8] dark:border-[#42322B] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Biryani Buddy anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8DAC8] dark:border-[#42322B] bg-[#FFF8EB]/50 dark:bg-[#1A120F] text-[#30231E] dark:text-[#FFF8EB] text-xs sm:text-sm focus:outline-none focus:border-[#7A241C] placeholder:text-[#8C766B]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#7A241C] hover:bg-[#912D24] disabled:opacity-40 text-[#FFF8EB] transition-colors shadow-md shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-[#D99A35]" />
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Modal for Shortlist Modification */}
      {confirmRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#FFFFFF] dark:bg-[#251B17] rounded-3xl p-6 border-2 border-[#D99A35] shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8EB] dark:bg-[#34241D] text-[#7A241C] flex items-center justify-center border border-[#D99A35]/30">
                <Flame className="w-5 h-5 text-[#D99A35]" />
              </div>
              <div>
                <h4 className="font-serif font-black text-base text-[#30231E] dark:text-[#FFF8EB]">
                  Confirm Group Ballot
                </h4>
                <p className="text-[11px] text-[#8C766B]">Biryani Bandi Voting Room</p>
              </div>
            </div>

            <p className="text-xs text-[#6B544B] dark:text-[#D1C0B4] leading-relaxed">
              {shortlistedIds.includes(confirmRestaurant.id)
                ? `Remove ${confirmRestaurant.name} from the active voting shortlist?`
                : `Add ${confirmRestaurant.name} (${confirmRestaurant.locality}) to your voting shortlist? Your group will vote on this candidate.`}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmRestaurant(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#FFF8EB] dark:bg-[#1E1410] text-[#30231E] dark:text-[#FFF8EB] font-bold text-xs border border-[#E8DAC8] dark:border-[#42322B]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmAddToShortlist(confirmRestaurant)}
                className="flex-1 py-2.5 rounded-xl bg-[#7A241C] hover:bg-[#912D24] text-[#FFF8EB] font-bold text-xs shadow-md"
              >
                {shortlistedIds.includes(confirmRestaurant.id) ? 'Remove' : 'Confirm Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
