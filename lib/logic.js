// Pure logic: no I/O, so it is easy to test.
import { PROFILES, toPublic } from "./profiles.js";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const emptyState = () => ({ swipes: {}, matches: [] });

export function getFeed(state, profiles = PROFILES) {
  return profiles.filter((p) => !(p.id in state.swipes)).map(toPublic);
}

export function applySwipe(state, profileId, direction, profiles = PROFILES) {
  if (!Number.isInteger(profileId)) throw new HttpError(400, "profileId must be an integer");
  if (direction !== "like" && direction !== "pass") throw new HttpError(400, "direction must be 'like' or 'pass'");
  const profile = profiles.find((p) => p.id === profileId);
  if (!profile) throw new HttpError(404, "Profile not found");
  if (profileId in state.swipes) throw new HttpError(409, "Already swiped on this profile");

  state.swipes[profileId] = direction;
  // The server alone decides a match: a like is mutual only if they liked us first.
  const match = direction === "like" && profile.likedMe === true;
  if (match) state.matches.push({ profileId, matchedAt: new Date().toISOString() });
  return { match, profile: match ? toPublic(profile) : null };
}

export function getMatches(state, profiles = PROFILES) {
  return state.matches
    .map((m) => {
      const p = profiles.find((x) => x.id === m.profileId);
      return p ? { ...toPublic(p), matchedAt: m.matchedAt } : null;
    })
    .filter(Boolean)
    .reverse();
}
