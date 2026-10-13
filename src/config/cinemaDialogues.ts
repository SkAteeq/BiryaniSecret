/**
 * Central configuration for Tollywood & Bollywood inspired foodie dialogues.
 * Blends Telugu-English mass energy, Bollywood drama, and Hyderabadi Dakhni humor.
 */

export interface CinemaDialoguesConfig {
  homeTaglines: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  chatbot: {
    greeting: string;
    searchingNearby: string;
    closestFound: string;
    undecided: string;
    comparing: string;
    askToVote: string;
    winner: string;
    tie: string;
    noMatch: string;
  };
  discovery: {
    nearestHero: string;
    peoplesChampion: string;
    pocketFriendlyStar: string;
    underratedBlockbusters: string;
    finalistList: string;
    takeMeToDum: string;
    directorsCut: string;
    publicVerdict: string;
  };
  voting: {
    roomCreated: string;
    friendJoined: string;
    voteSubmitted: string;
    leaderChanged: string;
    closingVote: string;
    winnerAnnounced: string;
    shareRoom: string;
  };
  loading: string[];
}

export const CINEMA_DIALOGUES: CinemaDialoguesConfig = {
  homeTaglines: [
    "Interval tarvata kaadu bhai, biryani ippude!",
    "Oka city. Enno biryanis. Final decision meedhe!",
    "Mana gang, mana vote, mana biryani!",
    "Biryani kosam debate aa? Vote esi settle cheddam!",
    "Hero entry tarvata interval… mana entry tarvata biryani!"
  ],
  ctaPrimary: "Start the Biryani Scene",
  ctaSecondary: "Find My Nearest Biryani",
  chatbot: {
    greeting: "Entry ichesav bhai! Cheppu… dum biryani ekkada koddam?",
    searchingNearby: "GPS ready, appetite ready… biryani hunt shuru!",
    closestFound: "Distance lo winner dorikesadu! Ikkada choodu, bhai.",
    undecided: "Interval ayipoyindi bhai… ippudaina oka hotel fix cheddama?",
    comparing: "Iddaru strong contenders! Final decision mana gang vote ke vadiledham.",
    askToVote: "Mana gang lo evaridi final punch? Vote veyandi!",
    winner: "Box office hit! Mana biryani champion fix ayipoyadu!",
    tie: "Climax twist! Idharu equal votes… inkoka round vesthama?",
    noMatch: "Ee radius lo biryani hero dorakaledu bhai. Search area penchala?"
  },
  discovery: {
    nearestHero: "Nearest Hero",
    peoplesChampion: "People's Champion",
    pocketFriendlyStar: "Pocket-Friendly Star",
    underratedBlockbusters: "Underrated Blockbusters",
    finalistList: "Finalist List",
    takeMeToDum: "Take Me to the Dum",
    directorsCut: "Director's Cut",
    publicVerdict: "Public Verdict"
  },
  voting: {
    roomCreated: "Scene set, gang ready!",
    friendJoined: "Inko hero entry ichadu!",
    voteSubmitted: "Vote padindi. Story interesting avuthondi!",
    leaderChanged: "Plot twist! Leader maripoyadu!",
    closingVote: "Final verdict vachesthondi…",
    winnerAnnounced: "And the award for Best Biryani goes to…",
    shareRoom: "Gang ni piluvu. Biryani decision pending!"
  },
  loading: [
    "Screenplay rolling…",
    "Director checking camera angles…",
    "Dum simmering on slow heat…",
    "Saffron rice layer setting up…"
  ]
};

const CINEMA_MODE_STORAGE_KEY = 'biryani_bandi_cinema_mode';

export function isCinemaModeEnabled(): boolean {
  try {
    const val = localStorage.getItem(CINEMA_MODE_STORAGE_KEY);
    return val === null ? true : val === 'true'; // Enabled by default
  } catch {
    return true;
  }
}

export function setCinemaModeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(CINEMA_MODE_STORAGE_KEY, String(enabled));
  } catch {}
}
