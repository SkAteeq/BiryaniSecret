import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './config';
import { Room, Vote } from '../types';
import { handleFirestoreError, OperationType } from './errorHandler';
import { getRestaurantById } from '../data/restaurants';

export const PUBLIC_SHOWDOWN_ROOM_ID = 'hyd-city-showdown';

export interface CommunityPollPreset {
  id: string;
  title: string;
  description: string;
  candidateIds: string[];
}

export const COMMUNITY_POLLS: CommunityPollPreset[] = [
  {
    id: 'hyd-city-showdown',
    title: "Today's Hyderabad City Showdown",
    description: "The city's top contenders in a live open public poll.",
    candidateIds: ['shadab-charminar', 'bawarchi-rtcxroads', 'shah-ghouse-gachibowli', 'cafe-bahar-hyderguda', 'naidu-gari-kunda-manikonda']
  },
  {
    id: 'old-city-mutton-clash',
    title: "Old City Mutton Heritage Clash",
    description: "Charminar and Khilwat authentic slow-dum legends.",
    candidateIds: ['shadab-charminar', 'rumaan-khilwat', 'cafe-bahar-hyderguda']
  },
  {
    id: 'midnight-biryani-raid',
    title: "Midnight Biryani Craving Raid",
    description: "Late-night open contenders battling for after-hours hunger.",
    candidateIds: ['shadab-charminar', 'shah-ghouse-gachibowli', 'pr-biryani-habsiguda']
  }
];

/**
 * Generates an internal unique session ID (no invitations needed).
 */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const array = new Uint8Array(5);
  crypto.getRandomValues(array);
  let code = '';
  for (let i = 0; i < array.length; i++) {
    code += chars[array[i] % chars.length];
  }
  return `HYD-${code}`;
}

export interface CreateRoomInput {
  title: string;
  hostName: string;
  candidateIds: string[];
  durationMinutes?: number;
}

/**
 * Ensures the shared public showdown session exists in Firestore.
 */
export async function ensurePublicShowdownRoom(roomId: string = PUBLIC_SHOWDOWN_ROOM_ID): Promise<Room> {
  const sanitizedId = roomId.trim();
  const roomPath = `rooms/${sanitizedId}`;

  const preset = COMMUNITY_POLLS.find((p) => p.id === sanitizedId) || COMMUNITY_POLLS[0];

  try {
    const snap = await getDoc(doc(db, 'rooms', sanitizedId));
    if (snap.exists()) {
      return formatRoomSnapshot(snap.data(), sanitizedId);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days active public poll

    const roomData = {
      id: sanitizedId,
      title: preset.title,
      hostId: auth.currentUser?.uid || 'biryani-bandi-public',
      hostName: 'Public Community Poll',
      candidateIds: preset.candidateIds,
      status: 'voting' as const,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt)
    };

    if (auth.currentUser) {
      await setDoc(doc(db, 'rooms', sanitizedId), roomData);
    }

    return {
      id: sanitizedId,
      title: preset.title,
      hostId: roomData.hostId,
      hostName: roomData.hostName,
      candidateIds: preset.candidateIds,
      status: 'voting',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    return {
      id: sanitizedId,
      title: preset.title,
      hostId: 'biryani-bandi-public',
      hostName: 'Public Community Poll',
      candidateIds: preset.candidateIds,
      status: 'voting',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    };
  }
}

/**
 * Creates a new voting room in Firestore.
 */
export async function createRoom(input: CreateRoomInput): Promise<Room> {
  if (!auth.currentUser) {
    throw new Error('Authentication required to create a room.');
  }

  if (input.candidateIds.length < 2) {
    throw new Error('Select at least 2 restaurants to start a vote.');
  }

  if (input.candidateIds.length > 10) {
    throw new Error('Maximum 10 restaurants allowed per voting room.');
  }

  const roomId = generateRoomCode();
  const roomPath = `rooms/${roomId}`;
  const now = new Date();
  const duration = input.durationMinutes || 60; // default 1 hour
  const expiresAtDate = new Date(now.getTime() + duration * 60 * 1000);

  const roomData = {
    id: roomId,
    title: input.title.trim() || 'Where do we eat Biryani?',
    hostId: auth.currentUser.uid,
    hostName: input.hostName.trim() || auth.currentUser.displayName || 'Bhaijaan',
    candidateIds: input.candidateIds,
    status: 'voting' as const,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAtDate)
  };

  try {
    await setDoc(doc(db, 'rooms', roomId), roomData);
    
    return {
      id: roomId,
      title: roomData.title,
      hostId: roomData.hostId,
      hostName: roomData.hostName,
      candidateIds: roomData.candidateIds,
      status: 'voting',
      createdAt: now.toISOString(),
      expiresAt: expiresAtDate.toISOString()
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, roomPath);
  }
}

/**
 * Retrieves a room document by its unique room ID / code.
 */
export async function getRoom(roomId: string): Promise<Room | null> {
  const sanitizedId = roomId.trim().toUpperCase();
  const roomPath = `rooms/${sanitizedId}`;

  try {
    const snap = await getDoc(doc(db, 'rooms', sanitizedId));
    if (!snap.exists()) {
      return null;
    }
    return formatRoomSnapshot(snap.data(), sanitizedId);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, roomPath);
  }
}

/**
 * Subscribes to real-time changes on a specific room document.
 */
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: Room | null) => void,
  onError?: (err: Error) => void
): () => void {
  const sanitizedId = roomId.trim().toUpperCase();
  const roomPath = `rooms/${sanitizedId}`;

  return onSnapshot(
    doc(db, 'rooms', sanitizedId),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
      } else {
        onUpdate(formatRoomSnapshot(snap.data(), sanitizedId));
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, roomPath);
    }
  );
}

/**
 * Casts or updates an individual participant's vote.
 * Atomically keyed to `/rooms/{roomId}/votes/{userId}`.
 */
export async function castVote(
  roomId: string,
  restaurantId: string,
  userName: string
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('AUTH_REQUIRED');
  }

  const userId = auth.currentUser.uid;
  const sanitizedRoomId = roomId.trim().toUpperCase();
  const voteDocRef = doc(db, 'rooms', sanitizedRoomId, 'votes', userId);
  const votePath = `rooms/${sanitizedRoomId}/votes/${userId}`;

  const restaurant = getRestaurantById(restaurantId);
  if (!restaurant) {
    throw new Error('Invalid restaurant candidate selected.');
  }

  try {
    const existingSnap = await getDoc(voteDocRef);

    if (existingSnap.exists()) {
      // Update existing vote
      await updateDoc(voteDocRef, {
        restaurantId,
        restaurantName: restaurant.name,
        userName: userName.trim() || 'Biryani Lover',
        updatedAt: serverTimestamp()
      });
    } else {
      // First-time vote
      await setDoc(voteDocRef, {
        userId,
        userName: userName.trim() || 'Biryani Lover',
        restaurantId,
        restaurantName: restaurant.name,
        votedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, votePath);
  }
}

/**
 * Subscribes to real-time votes subcollection for live multi-device tallies.
 */
export function subscribeToRoomVotes(
  roomId: string,
  onUpdate: (votes: Vote[]) => void,
  onError?: (err: Error) => void
): () => void {
  const sanitizedRoomId = roomId.trim().toUpperCase();
  const votesColRef = collection(db, 'rooms', sanitizedRoomId, 'votes');
  const votesPath = `rooms/${sanitizedRoomId}/votes`;

  return onSnapshot(
    votesColRef,
    (snapshot) => {
      const votes: Vote[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        votes.push({
          userId: docSnap.id,
          userName: d.userName || 'Anonymous Voter',
          restaurantId: d.restaurantId,
          restaurantName: d.restaurantName,
          votedAt: d.votedAt?.toDate ? d.votedAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : new Date().toISOString()
        });
      });
      onUpdate(votes);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, votesPath);
    }
  );
}

/**
 * Closes voting and calculates the definitive group winner or tie.
 * Restricted to the room host.
 */
export async function finalizeRoomVoting(roomId: string): Promise<{ winnerId: string; winnerName: string }> {
  if (!auth.currentUser) {
    throw new Error('AUTH_REQUIRED');
  }

  const sanitizedRoomId = roomId.trim().toUpperCase();
  const roomDocRef = doc(db, 'rooms', sanitizedRoomId);
  const roomPath = `rooms/${sanitizedRoomId}`;

  try {
    const roomSnap = await getDoc(roomDocRef);
    if (!roomSnap.exists()) {
      throw new Error('ROOM_NOT_FOUND');
    }
    const roomData = roomSnap.data();

    if (roomData.hostId !== auth.currentUser.uid) {
      throw new Error('HOST_ONLY_ACTION');
    }

    if (roomData.status === 'closed') {
      return {
        winnerId: roomData.winnerId || 'TIE',
        winnerName: roomData.winnerName || 'Voting already closed'
      };
    }

    // Fetch all votes cast in this room
    const votesSnap = await getDocs(collection(db, 'rooms', sanitizedRoomId, 'votes'));
    const tallies: Record<string, number> = {};

    roomData.candidateIds.forEach((cId: string) => {
      tallies[cId] = 0;
    });

    votesSnap.forEach((vDoc) => {
      const v = vDoc.data();
      if (v.restaurantId && tallies[v.restaurantId] !== undefined) {
        tallies[v.restaurantId] += 1;
      }
    });

    const totalVotes = Object.values(tallies).reduce((acc, count) => acc + count, 0);

    let winnerId = 'ZERO_VOTES';
    let winnerName = 'No votes cast (Mehfil had no consensus!)';

    if (totalVotes > 0) {
      const maxVotes = Math.max(...Object.values(tallies));
      const winners = Object.keys(tallies).filter((cId) => tallies[cId] === maxVotes);

      if (winners.length === 1) {
        winnerId = winners[0];
        const rest = getRestaurantById(winnerId);
        winnerName = rest ? rest.name : 'Winning Restaurant';
      } else {
        winnerId = 'TIE';
        const tiedNames = winners
          .map((id) => getRestaurantById(id)?.name || id)
          .slice(0, 2)
          .join(' & ');
        winnerName = `Tie: ${tiedNames} (${maxVotes} votes each)`;
      }
    }

    await updateDoc(roomDocRef, {
      status: 'closed',
      winnerId,
      winnerName,
      closedAt: serverTimestamp()
    });

    return { winnerId, winnerName };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

function formatRoomSnapshot(data: any, id: string): Room {
  return {
    id,
    title: data.title || 'Biryani Decision Room',
    hostId: data.hostId,
    hostName: data.hostName || 'Host',
    candidateIds: data.candidateIds || [],
    status: data.status || 'voting',
    winnerId: data.winnerId || null,
    winnerName: data.winnerName || null,
    closedAt: data.closedAt?.toDate ? data.closedAt.toDate().toISOString() : null,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate().toISOString() : new Date(Date.now() + 86400000).toISOString()
  };
}
