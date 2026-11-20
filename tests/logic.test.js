import test from "node:test";
import assert from "node:assert/strict";
import { emptyState, getFeed, applySwipe, getMatches, HttpError } from "../lib/logic.js";
import { PROFILES, LIKED_ME } from "../lib/profiles.js";

test("seeds at least 30 profiles", () => assert.ok(PROFILES.length >= 30));

test("feed never exposes likedMe", () => {
  const feed = getFeed(emptyState());
  assert.equal(feed.length, PROFILES.length);
  assert.ok(feed.every((p) => !("likedMe" in p)));
});

test("swiped profiles never reappear", () => {
  const s = emptyState();
  applySwipe(s, 1, "pass");
  applySwipe(s, 2, "like");
  const ids = getFeed(s).map((p) => p.id);
  assert.ok(!ids.includes(1) && !ids.includes(2));
});

test("mutual like creates a match", () => {
  const s = emptyState();
  const r = applySwipe(s, LIKED_ME[0], "like");
  assert.equal(r.match, true);
  assert.equal(getMatches(s).length, 1);
});

test("one-sided like does not match", () => {
  const s = emptyState();
  const notLiked = PROFILES.find((p) => !p.likedMe).id;
  assert.equal(applySwipe(s, notLiked, "like").match, false);
  assert.equal(getMatches(s).length, 0);
});

test("passing on someone who liked you does not match", () => {
  const s = emptyState();
  assert.equal(applySwipe(s, LIKED_ME[0], "pass").match, false);
  assert.equal(getMatches(s).length, 0);
});

test("duplicate swipe -> 409, bad input -> 400, unknown -> 404", () => {
  const s = emptyState();
  applySwipe(s, 1, "like");
  assert.throws(() => applySwipe(s, 1, "like"), (e) => e instanceof HttpError && e.status === 409);
  assert.throws(() => applySwipe(s, "x", "like"), (e) => e.status === 400);
  assert.throws(() => applySwipe(s, 2, "maybe"), (e) => e.status === 400);
  assert.throws(() => applySwipe(s, 999, "like"), (e) => e.status === 404);
});
