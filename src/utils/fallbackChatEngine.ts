import { Restaurant } from '../types';
import { HYDERABAD_RESTAURANTS } from '../data/restaurants';
import { formatDistance } from './geo';

export interface ChatEngineResult {
  text: string;
  recommendedRestaurantIds: string[];
}

/**
 * Intelligent rule-based Hyderabad foodie engine for Biryani Buddy.
 * Used when Gemini API is unavailable or as instant offline fallback.
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
        text: `Arrey bhai, location permission ledu! Share your GPS or pick a locality so I can calculate your exact straight-line distance. But straight from the heart, Hotel Shadab in Old City or Bawarchi at RTC X Roads never disappoints!`,
        recommendedRestaurantIds: ['shadab-charminar', 'bawarchi-rtcxroads']
      };
    }

    sorted.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    const top2 = sorted.slice(0, 2);

    return {
      text: `Arrey bhai, biryani mission started! 🍛 Here are your nearest options based on ${userLocationLabel || 'your selected location'}. Remember, these are approximate straight-line distances; actual road traffic may vary. Shall we put these to a group vote?`,
      recommendedRestaurantIds: top2.map((r) => r.id)
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
        text: `Biryani drought, bhai! No verified outlets found within ${limitKm} km of your location. Try expanding your search to 10 km or 15 km to hit the legendary spots!`,
        recommendedRestaurantIds: []
      };
    }

    withinRadius.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    const topChoices = withinRadius.slice(0, 3);

    return {
      text: `Miya, good news! Found ${withinRadius.length} authentic spots within ${limitKm} km (approx. straight-line distance). Here are the top contenders:`,
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
      text: `Pocket-friendly biryani feast, bhai! Rumaan in Khilwat and PR Biryani in Habsiguda are legendary for explosive flavor without lightening your wallet:`,
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
        text: `Ekdum classic heavyweight match, ustaad!
• ${r1.name} (${r1.locality}): ${d1}. Speciality: ${r1.speciality}.
• ${r2.name} (${r2.locality}): ${d2}. Speciality: ${r2.speciality}.

Both are royal grade. Put them in a room vote and let your gang decide the winner!`,
        recommendedRestaurantIds: [r1.id, r2.id]
      };
    }

    // Default top comparison
    return {
      text: `Comparing the two titans: Hotel Shadab (Old City mutton specialist) versus Bawarchi Restaurant (RTC X Roads spicy powerhouse). Here they are for your gang to vote:`,
      recommendedRestaurantIds: ['shadab-charminar', 'bawarchi-rtcxroads']
    };
  }

  // 5. Open now query
  if (q.includes('open') || q.includes('timing') || q.includes('hours') || q.includes('late night')) {
    return {
      text: `Bhai, for late-night cravings, Hotel Shadab in Old City (open till 02:00 AM) and Shah Ghouse in Gachibowli (open till 02:00 AM) are the ultimate night-owl sanctuaries!`,
      recommendedRestaurantIds: ['shadab-charminar', 'shah-ghouse-gachibowli']
    };
  }

  // 6. Help choose a winner / Decision query
  if (q.includes('choose') || q.includes('winner') || q.includes('decide') || q.includes('recommend')) {
    return {
      text: `Faisla lena mushkil hai na, bhai? Here is the golden rule: If you want slow-cooked Mutton Dum, go Shadab. If you want fiery Chicken Dum with spicy salan, go Bawarchi. If you want claypot kunda aroma, go Naidu Gari. Add them to your vote ballot below!`,
      recommendedRestaurantIds: ['shadab-charminar', 'bawarchi-rtcxroads', 'naidu-gari-kunda-manikonda']
    };
  }

  // Default friendly response
  return {
    text: `Bhai, biryani ka mood hai? 🍛 I can help you find verified outlets near your GPS location, compare prices, or add candidates to your live group ballot! Pick a quick option below or ask me anything:`,
    recommendedRestaurantIds: ['shadab-charminar', 'bawarchi-rtcxroads']
  };
}
