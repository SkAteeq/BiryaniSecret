export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates the great-circle distance between two points on Earth
 * using the Haversine formula in kilometers.
 * Marked as approximate straight-line distance.
 */
export function calculateStraightLineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined) {
    return 'Distance unverified';
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m (approx straight-line)`;
  }
  return `${distanceKm.toFixed(1)} km (approx straight-line)`;
}

export function requestUserCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GEOLOCATION_NOT_SUPPORTED'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('PERMISSION_DENIED'));
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error('POSITION_UNAVAILABLE'));
        } else {
          reject(new Error('TIMEOUT_OR_OTHER'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}
