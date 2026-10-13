import { Restaurant } from '../types';
import { formatDistance } from './geo';
import { CINEMA_DIALOGUES } from '../config/cinemaDialogues';

export interface ChatEngineResult {
  text: string;
  recommendedRestaurantIds: string[];
}

/**
 * Intelligent rule-based Hyderabad & Tollywood foodie engine for Biryani Buddy.
 * Strictly adheres to verified data and actual calculated distances.
 */
export function generateFallbackResponse(
  query: string,
  restaurantsWithDistance: (Restaurant & { distanceKm: number | null })[],
  userLocationLabel: string | null
): ChatEngineResult {
  const q = query.toLowerCase();

  // 1. Closest / Nearest Biryani query
  if (
    q.includes('closest') ||
    q.includes('nearest') ||
    q.includes('near me') ||
    q.includes('nearby')
  ) {
    const sorted = [...restaurantsWithDistance].filter((r) => r.distanceKm !== null);

    if (sorted.length === 0) {
      return {
        text: `Hero location reveal cheyyaledu! Share your GPS or pick a reference locality so I can calculate your exact straight-line distance. But straight from the heart, Hotel Shadab in Old City or Bawarchi at RTC X Roads never fails!`,
        recommendedRestaurantIds: ['shadab-charminar', 'bawarchi-rtcxroads']
      };
    }

    sorted.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    const topClosest = sorted.slice(0, 2);

    return {
      text: `${CINEMA_DIALOGUES.chatbot.searchingNearby}\n\n${CINEMA_DIALOGUES.chatbot.closestFound}\n\nNote: Distances are approximate straight-line figures; road driving distance and travel time may differ. Shall we put these two to a vote?`,
      recommendedRestaurantIds: topClosest.map((r) => r.id)
    };
  }

  // 2. Radius query (e.g. within 3 km, within 5 km)
  const kmMatch = q.match(/within\s*(\d+)\s*km/);
  if (kmMatch || q.includes('5 km') || q.includes('3 km') || q.includes('10 km')) {
    const limitKm = kmMatch ? parseInt(kmMatch[1], 10) : q.includes('3 km') ? 3 : q.includes('5 km') ? 5 : 10;
    const withinRadius = restaurantsWithDistance.filter(
      (r) => r.distanceKm !== null && r.distanceKm <= limitKm
    );

    if (withinRadius.length === 0) {
      return {
        text: `${CINEMA_DIALOGUES.chatbot.noMatch}\n\nTry expanding your radius to 10 km or 15 km to hit the blockbuster spots!`,
        recommendedRestaurantIds: []
      };
    }

    withinRadius.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    const topChoices = withinRadius.slice(0, 3);

    return {
      text: `Miya, scene set! Found ${withinRadius.length} blockbuster contenders within ${limitKm} km (approx. straight-line distance). Here are the top picks for your ballot:`,
      recommendedRestaurantIds: topChoices.map((r) => r.id)
    };
  }

  // 3. Cheaper / Budget queries
  if (q.includes('cheap') || q.includes('budget') || q.includes('price') || q.includes('affordable')) {
    const budgetSpots = [...restaurantsWithDistance]
      .filter((r) => r.pricePerPersonMin !== null)
      .sort((a, b) => (a.pricePerPersonMin || 999) - (b.pricePerPersonMin || 999))
      .slice(0, 3);

    return {
      text: `Pocket-Friendly Star selection, bhai! Rumaan in Khilwat and PR Biryani in Habsiguda deliver mass-flavor without lightening your wallet:`,
      recommendedRestaurantIds: budgetSpots.map((r) => r.id)
    };
  }

  // 4. Compare query (e.g. "compare shadab and bawarchi")
  if (q.includes('compare')) {
    const matched = restaurantsWithDistance.filter((r) =>
      q.includes(r.name.toLowerCase()) || q.includes(r.id.split('-')[0])
    );

    if (matched.length >= 2) {
      const [r1, r2] = matched;
      const d1 = r1.distanceKm !== null ? formatDistance(r1.distanceKm) : 'distance unverified';
      const d2 = r2.distanceKm !== null ? formatDistance(r2.distanceKm) : 'distance unverified';

      return {
        text: `${CINEMA_DIALOGUES.chatbot.comparing}\n\n• ${r1.name} (${r1.locality}): ${d1}. Speciality: ${r1.speciality}.\n• ${r2.name} (${r2.locality}): ${d2}. Speciality: ${r2.speciality}.\n\nBoth are royal grade. Put them to a vote and let the gang declare the winner!`,
        recommendedRestaurantIds: [r1.id, r2.id]
      };
    }

    return {
      text: `${CINEMA_DIALOGUES.chatbot.comparing}\n\nComparing Hotel Shadab (Old City mutton legend) versus Bawarchi Restaurant (RTC X Roads spicy powerhouse). Here they are for your ballot:`,
      recommendedRestaurantIds: ['shadab-charminar', 'bawarchi-rtcxroads']
    };
  }

  // 5. Open now query
  if (q.includes('open') || q.includes('timing') || q.includes('hours') || q.includes('late night')) {
    return {
      text: `For midnight interval cravings, Hotel Shadab in Old City (open till 02:00 AM) and Shah Ghouse in Gachibowli (open till 02:00 AM) are the ultimate night-owl sanctuaries!`,
      recommendedRestaurantIds: ['shadab-charminar', 'shah-ghouse-gachibowli']
    };
  }

  // 6. Help choose a winner / Decision query
  if (q.includes('choose') || q.includes('winner') || q.includes('decide') || q.includes('recommend')) {
    return {
      text: `${CINEMA_DIALOGUES.chatbot.undecided}\n\n${CINEMA_DIALOGUES.chatbot.askToVote}\n\nIf you want slow-cooked Mutton Dum, lock Shadab. If you want fiery Chicken Dum, lock Bawarchi. If you want earthen claypot aroma, lock Naidu Gari. Add them to your ballot below:`,
      recommendedRestaurantIds: ['shadab-charminar', 'bawarchi-rtcxroads', 'naidu-gari-kunda-manikonda']
    };
  }

  // Default welcome dialogue
  return {
    text: `${CINEMA_DIALOGUES.chatbot.greeting}\n\nI can calculate approximate straight-line distances from your location, compare top contenders, and help your gang lock the winning biryani scene! Pick a quick option below:`,
    recommendedRestaurantIds: ['shadab-charminar', 'bawarchi-rtcxroads']
  };
}
