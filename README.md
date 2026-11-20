# Coy Discover

A swipe-based Discover tab (Next.js 14 + API routes + JSON-file storage) with a blank Home tab.

## Run
```bash
npm install
npm run dev      # http://localhost:3000 (open in mobile view for drag gestures)
npm test         # backend logic tests
```
Desktop: use the Like/Pass buttons or the left/right arrow keys. Mobile: drag the card.

## Demo a match fast
32 profiles are seeded in `lib/profiles.js`. These already liked you: **ids 3 (Meera), 7 (Naina), 8 (Veer), 14 (Zayn), 19 (Anika), 25 (Sia), 28 (Vihaan)**
Swipe right on any of them to see "It's a match". To start over: `curl -X POST localhost:3000/api/reset` (dev only) or delete `data/state.json`.

## API
| Route | Purpose |
|---|---|
| `GET /api/feed` | Profiles not yet swiped on |
| `POST /api/swipe` `{profileId, direction: "like"\|"pass"}` | Records swipe, returns `{match, profile}`. 400 invalid, 404 unknown, 409 already swiped |
| `GET /api/matches` | Mutual matches, newest first |

State is saved to `data/state.json`, so swipes and matches survive reloads.

## Privacy design
- `likedMe` lives only on the server. `toPublic()` strips it, so `/feed` never says who liked you.
- Feed order is fixed by id and does not depend on `likedMe`.
- The server decides matches (`applySwipe`); the client only displays the result. A match is only revealed in response to *your* like on someone who already liked you.
- Passing on someone who liked you reveals nothing.

## Other decisions
- Swipes are idempotent-safe: the server rejects repeats (409) and the UI locks while a swipe is in flight.
- Pure logic (`lib/logic.js`) is separate from file I/O (`lib/db.js`) for testing.
- JSON file store is fine for one user; swap `db.js` for SQLite/Postgres for multiple users.
