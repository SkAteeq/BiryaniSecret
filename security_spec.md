# Biryani Bandi Firestore Security Specification

## 1. Data Invariants

1. **Authentication Gate**: Only authenticated Firebase users (anonymous or standard) can create rooms, read active rooms, and submit votes.
2. **Path Variable Hardening**: All `roomId` and `userId` keys must conform to `^[a-zA-Z0-9_\-]+$` and be bounded in size (<= 128 characters).
3. **Identity Preservation**: A voter's document key in `/rooms/{roomId}/votes/{userId}` must strictly equal `request.auth.uid`. A voter cannot write to another user's vote document.
4. **Relational Gate**: Votes can only be cast in rooms that exist, have status `'voting'`, and have not expired (`request.time < room.expiresAt`).
5. **Candidate Integrity**: A vote's `restaurantId` must exist within the parent room's `candidateIds` list.
6. **State Transitions**: Only the room's original `hostId` can close the room or transition status from `'voting'` to `'closed'`.
7. **Terminal State Locking**: Once a room reaches `'closed'`, no new votes, vote edits, or room status reversals are permitted.
8. **Candidate Immutability**: The host cannot alter `candidateIds`, `hostId`, or `createdAt` after the room is created.
9. **Single Active Vote**: Subcollection path `/rooms/{roomId}/votes/{userId}` mathematically enforces exactly one active vote per participant per room.
10. **Timestamp Integrity**: `createdAt`, `votedAt`, and `updatedAt` timestamps must match `request.time`.

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Unauthenticated Room Creation**: An unauthenticated user attempts to create a room.
2. **Host Spoofing**: User A creates a room but sets `hostId: "user_B"`.
3. **Malicious ID Injection**: A user attempts to create a room with a 2KB junk character `roomId`.
4. **Voter Impersonation**: User A attempts to write a vote document to `/rooms/{roomId}/votes/{user_B}`.
5. **Vote in Closed Room**: A voter attempts to write or update a vote in a room where `status == 'closed'`.
6. **Vote in Expired Room**: A voter attempts to cast a vote when `request.time > room.expiresAt`.
7. **Vote for Non-Candidate**: A voter attempts to vote for an arbitrary restaurant ID not present in `room.candidateIds`.
8. **Candidate Tampering by Non-Host**: A guest participant attempts to alter `candidateIds` or `status` on the room document.
9. **Post-Closure Vote Modification**: A voter attempts to change their vote after the host finalized the room.
10. **Status Reopening Attack**: Anyone attempts to revert a room's status from `'closed'` back to `'voting'`.
11. **Shadow Key Injection**: A participant injects unauthorized keys (e.g., `isAdmin: true` or `vipBonusVotes: 10`) into their vote document.
12. **Candidate Expansion Attack**: Host attempts to swap candidate restaurants mid-session during active voting.
