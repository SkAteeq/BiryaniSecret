export interface Restaurant {
  id: string;
  name: string;
  branch: string;
  locality: string;
  address: string;
  lat: number | null;
  lng: number | null;
  pricePerPersonMin: number | null;
  pricePerPersonMax: number | null;
  openingHours: string | null;
  lastVerifiedAt: string | null;
  googleMapsUrl: string;
  isActive: boolean;
  isHiddenGem: boolean;
  curatorNotes: string | null;
  speciality: string;
  imageFallbackGradient: string;
  tags: string[];
  artworkType?: string;
  spiceProfile?: string;
}

export type RoomStatus = 'voting' | 'closed';

export interface Room {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  candidateIds: string[];
  status: RoomStatus;
  winnerId?: string | null;
  winnerName?: string | null;
  closedAt?: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface Vote {
  userId: string;
  userName: string;
  restaurantId: string;
  restaurantName: string;
  votedAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  isAnonymous: boolean;
  email?: string | null;
  photoURL?: string | null;
}

export type HyderabadErrorCode =
  | 'LOCATION_PERMISSION_DENIED'
  | 'NO_RESTAURANTS_FOUND'
  | 'NETWORK_ERROR'
  | 'ROOM_EXPIRED'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_ALREADY_CLOSED'
  | 'VOTE_FAILED'
  | 'AUTH_REQUIRED'
  | 'ANONYMOUS_AUTH_DISABLED'
  | 'SERVER_ERROR'
  | 'INVALID_ROOM_CODE'
  | 'HOST_ONLY_ACTION';

export interface HyderabadError {
  code: HyderabadErrorCode;
  hyderabadMessage: string;
  technicalMessage: string;
  recoveryAction: string;
  actionType?: 'retry' | 'enable_location' | 'increase_radius' | 'home' | 'login';
}

export type AppView = 'home' | 'discover' | 'create-room' | 'room' | 'results';
