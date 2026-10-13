import { HyderabadError, HyderabadErrorCode } from '../types';

export const HYDERABAD_ERRORS: Record<HyderabadErrorCode, { hyderabadMessage: string; defaultAction: string; actionType?: HyderabadError['actionType'] }> = {
  LOCATION_PERMISSION_DENIED: {
    hyderabadMessage: 'Arrey miya, location permission ivvu ra! Lekapothe distance ela cheppali?',
    defaultAction: 'Allow GPS in browser settings or filter by locality manually.',
    actionType: 'enable_location'
  },
  NO_RESTAURANTS_FOUND: {
    hyderabadMessage: 'Biryani drought, bhai! Radius penchi choodu.',
    defaultAction: 'Increase your search distance or clear active locality filters.',
    actionType: 'increase_radius'
  },
  NETWORK_ERROR: {
    hyderabadMessage: 'Signal gaya, biryani plan aagaya! Check your internet.',
    defaultAction: 'Check your mobile data or Wi-Fi connection and retry.',
    actionType: 'retry'
  },
  ROOM_EXPIRED: {
    hyderabadMessage: 'Mehfil khatam, bhai! Start a fresh voting room.',
    defaultAction: 'This voting room has timed out. Create a new room for your group.',
    actionType: 'home'
  },
  ROOM_NOT_FOUND: {
    hyderabadMessage: 'Room code galat hai ya room band ho gaya! Code check karle bhai.',
    defaultAction: 'Verify the room code or ask the room host for the latest invite link.',
    actionType: 'retry'
  },
  ROOM_ALREADY_CLOSED: {
    hyderabadMessage: 'Host faisla le liya! Voting is locked now.',
    defaultAction: 'Voting has closed. View the final group results.',
    actionType: 'home'
  },
  VOTE_FAILED: {
    hyderabadMessage: 'Vote traffic mein atak gaya! Malli try cheyyi.',
    defaultAction: 'We could not record your vote. Tap candidate to vote again.',
    actionType: 'retry'
  },
  AUTH_REQUIRED: {
    hyderabadMessage: 'Pehle identity verify hona! Guest session start chestunnam.',
    defaultAction: 'Establishing secure participant credentials...',
    actionType: 'login'
  },
  ANONYMOUS_AUTH_DISABLED: {
    hyderabadMessage: 'Guest session enabled ledu! Google sign-in tho continue cheyyi.',
    defaultAction: 'Sign in with Google to participate in voting.',
    actionType: 'login'
  },
  SERVER_ERROR: {
    hyderabadMessage: 'System ki dum kam pad gaya! Malli try cheyyi.',
    defaultAction: 'Something went wrong with the server. Please try again in a moment.',
    actionType: 'retry'
  },
  INVALID_ROOM_CODE: {
    hyderabadMessage: 'Room code sarigga ledu, miya! Re-check room code.',
    defaultAction: 'Room code should be alphanumeric (e.g. HYD-7X9B).',
    actionType: 'retry'
  },
  HOST_ONLY_ACTION: {
    hyderabadMessage: 'Khaali room host ee voting close cheyagalaru!',
    defaultAction: 'Only the creator of this room can finalize the vote.',
    actionType: 'retry'
  }
};

export function createHyderabadError(code: HyderabadErrorCode, technicalDetails?: string): HyderabadError {
  const meta = HYDERABAD_ERRORS[code] || HYDERABAD_ERRORS.SERVER_ERROR;
  
  if (technicalDetails && process.env.NODE_ENV !== 'production') {
    console.warn(`[Biryani Bandi Error ${code}]:`, technicalDetails);
  }

  return {
    code,
    hyderabadMessage: meta.hyderabadMessage,
    technicalMessage: technicalDetails || code,
    recoveryAction: meta.defaultAction,
    actionType: meta.actionType
  };
}
