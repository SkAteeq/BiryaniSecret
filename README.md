# Biryani Bandi 🍛

A mobile-first responsive web application for groups in Hyderabad, Telangana, India to decide where to eat authentic Hyderabadi biryani through live voting, curated restaurant discovery, and distance filtering.

---

## 🌟 Key Features

1. **Curated Hyderabad Restaurant Directory**:
   - Curated candidates with verified branch addresses: Hotel Shadab (Charminar), Bawarchi (RTC X Roads), Paradise (Secunderabad), Rumaan (Khilwat), Hyderabadi Biryani Handi (Khairtabad), PR Biryani (Habsiguda), Naidu Gari Kunda (Manikonda), Cafe Bahar (Hyderguda), and Shah Ghouse (Gachibowli).
   - Real branch coordinates, speciality tags, and curator tasting notes.
   - External Google Maps 1-tap driving navigation links.

2. **Distance & Locality Filtering**:
   - Geolocation requested on user intent (no automatic prompt).
   - Approximate straight-line distance calculated using the Haversine formula against verified branch coordinates.
   - 2 km, 5 km, 10 km, and 20 km radius filters.
   - Graceful manual locality fallback if location permission is denied.

3. **Group Voting Rooms & Live Peer Sync**:
   - Cryptographically random room ID generation with high entropy (e.g. `HYD-7X9B`).
   - Shareable invite links (`?room=HYD-XXXX`) and copyable room codes.
   - Authenticated guest sessions (Firebase Authentication anonymous auth with Google Sign-In fallback).
   - Atomic subcollection data model: `/rooms/{roomId}/votes/{userId}` guaranteeing exactly one active vote per participant per room.
   - Live real-time updates across multiple mobile and desktop devices without page reloads.
   - Vote changing permitted while voting is active.
   - Host-only closing action to finalize outcomes.

4. **Results & Consensus**:
   - Winning restaurant spotlight with celebratory UI and direct Google Maps directions.
   - Concurrency-safe tie handling (highlights joint winners).
   - Zero-votes handling with friendly recovery actions.

5. **Authentic Hyderabad-Style Error Messaging**:
   - Typed error utility with cultural Hyderabad messaging:
     - `LOCATION_PERMISSION_DENIED`: *"Arrey miya, location permission ivvu ra! Lekapothe distance ela cheppali?"*
     - `NO_RESTAURANTS_FOUND`: *"Biryani drought, bhai! Radius penchi choodu."*
     - `NETWORK_ERROR`: *"Signal gaya, biryani plan aagaya! Check your internet."*
     - `ROOM_EXPIRED`: *"Mehfil khatam, bhai! Start a fresh voting room."*
     - `VOTE_FAILED`: *"Vote traffic mein atak gaya! Malli try cheyyi."*
     - `SERVER_ERROR`: *"System ki dum kam pad gaya! Malli try cheyyi."*

---

## 📁 Architecture & Data Model

### Cloud Firestore Collections

```
rooms/{roomId}
  ├── id: string (max 32 chars, regex ^[a-zA-Z0-9_\-]+$)
  ├── title: string (max 100 chars)
  ├── hostId: string (UID of creator)
  ├── hostName: string (display name of host)
  ├── candidateIds: string[] (1–10 restaurant IDs)
  ├── status: 'voting' | 'closed'
  ├── winnerId: string | null
  ├── winnerName: string | null
  ├── createdAt: serverTimestamp
  ├── closedAt: timestamp | null
  └── expiresAt: timestamp

rooms/{roomId}/votes/{userId}
  ├── userId: string (strictly matches request.auth.uid)
  ├── userName: string (display name, max 60 chars)
  ├── restaurantId: string (validated against room.candidateIds)
  ├── restaurantName: string
  ├── votedAt: serverTimestamp
  └── updatedAt: serverTimestamp
```

### Security Rules Highlights (`firestore.rules`)
- **Default Deny**: Global catch-all prevents unmapped collection access.
- **Path Variable Hardening**: `isValidId()` validates string lengths and prevents ID injection.
- **Identity Invariant**: A participant can only write to `/rooms/{roomId}/votes/{userId}` where `userId == request.auth.uid`.
- **Relational Integrity**: Votes are only allowed if parent room exists, `status == 'voting'`, `request.time < room.expiresAt`, and `candidateIds.hasAny([incoming().restaurantId])`.
- **Terminal State Lock**: Only the original host can transition a room to `closed`. Once closed, no further votes or modifications are accepted.

---

## 🚀 Setup & Local Development

### Requirements
- Node.js 20+
- npm

### Installation
```bash
npm install
```

### Environment Configuration
Ensure `firebase-applet-config.json` exists with your Firebase project keys:
```json
{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "firestoreDatabaseId": "YOUR_FIRESTORE_DATABASE_ID"
}
```

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```
