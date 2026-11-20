"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const THRESHOLD = 100;

function ProfileCard({ p }) {
  return (
    <>
      <img src={p.photo} alt={`${p.name}`} draggable={false} />
      <div className="info">
        <h2>{p.name} <span>{p.age}</span></h2>
        <p className="place">{p.place}</p>
        <p className="bio">{p.bio}</p>
        <ul className="tags">{p.interests.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
    </>
  );
}

function Discover() {
  const [queue, setQueue] = useState(null);
  const [matches, setMatches] = useState([]);
  const [view, setView] = useState("swipe");
  const [justMatched, setJustMatched] = useState(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState(null);
  const [error, setError] = useState("");
  const startX = useRef(0);
  const busy = useRef(false);

  const load = useCallback(async () => {
    try {
      const [f, m] = await Promise.all([
        fetch("/api/feed").then((r) => r.json()),
        fetch("/api/matches").then((r) => r.json()),
      ]);
      setQueue(f.profiles); setMatches(m.matches); setError("");
    } catch { setError("Couldn't load profiles. Check your connection and retry."); setQueue([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const top = queue?.[0];
  const next = queue?.[1];

  async function decide(dir) {
    if (!top || busy.current) return; // blocks double taps while a swipe is in flight
    busy.current = true;
    setExit(dir);
    const id = top.id;
    let ok = true;
    try {
      const res = await fetch("/api/swipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: id, direction: dir }),
      });
      if (res.status === 409) ok = true; // already recorded; just drop the card
      else if (!res.ok) ok = false;
      else {
        const data = await res.json();
        if (data.match) {
          setJustMatched(data.profile);
          setMatches((m) => [{ ...data.profile, matchedAt: new Date().toISOString() }, ...m]);
        }
      }
    } catch { ok = false; }
    setTimeout(() => {
      if (ok) setQueue((q) => q.filter((p) => p.id !== id));
      else setError("Swipe didn't save. Try again.");
      setExit(null); setDx(0); busy.current = false;
    }, 260);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (justMatched || view !== "swipe") return;
      if (e.key === "ArrowRight") decide("like");
      if (e.key === "ArrowLeft") decide("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const down = (e) => { if (busy.current) return; e.currentTarget.setPointerCapture(e.pointerId); startX.current = e.clientX; setDragging(true); };
  const move = (e) => { if (dragging) setDx(e.clientX - startX.current); };
  const up = () => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dx) > THRESHOLD) decide(dx > 0 ? "like" : "pass"); else setDx(0);
  };

  const x = exit ? (exit === "like" ? 700 : -700) : dx;
  const cardStyle = {
    transform: `translateX(${x}px) rotate(${x / 18}deg)`,
    transition: dragging ? "none" : "transform .25s ease-out",
  };
  const likeOp = Math.min(Math.max(x / THRESHOLD, 0), 1);
  const passOp = Math.min(Math.max(-x / THRESHOLD, 0), 1);

  return (
    <section className="screen">
      <div className="seg" role="group" aria-label="Discover views">
        <button aria-pressed={view === "swipe"} onClick={() => setView("swipe")}>Swipe</button>
        <button aria-pressed={view === "matches"} onClick={() => setView("matches")}>Matches ({matches.length})</button>
      </div>
      {error && <p role="alert" style={{ color: "var(--like)", marginBottom: 8 }}>{error}</p>}

      {view === "matches" ? (
        matches.length === 0 ? (
          <div className="empty"><h2>No matches yet</h2><p>A match shows up here when you and someone else both like each other.</p>
            <button className="btn" onClick={() => setView("swipe")}>Keep swiping</button></div>
        ) : (
          <ul className="list">
            {matches.map((m) => (
              <li key={m.id}><img src={m.photo} alt="" />
                <div><strong>{m.name}, {m.age}</strong><br /><small>{m.place}</small></div></li>
            ))}
          </ul>
        )
      ) : queue === null ? (
        <div className="empty"><p>Loading profiles...</p></div>
      ) : !top ? (
        <div className="empty"><h2>You're all caught up</h2>
          <p>No more profiles for now. Check your matches, or come back later.</p>
          <button className="btn" onClick={() => setView("matches")}>See matches</button></div>
      ) : (
        <>
          <div className="stage">
            {next && <div className="card back" key={next.id}><ProfileCard p={next} /></div>}
            <div className="card top" key={top.id} style={cardStyle}
              onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
              <ProfileCard p={top} />
              <span className="stamp like" style={{ opacity: likeOp }}>Like</span>
              <span className="stamp pass" style={{ opacity: passOp }}>Pass</span>
            </div>
          </div>
          <div className="actions">
            <button className="round pass" onClick={() => decide("pass")} aria-label={`Pass on ${top.name}`}>Pass</button>
            <button className="round like" onClick={() => decide("like")} aria-label={`Like ${top.name}`}>Like</button>
          </div>
        </>
      )}

      {justMatched && (
        <div className="match" role="dialog" aria-label="It's a match">
          <h1>It's a<br />match.</h1>
          <img src={justMatched.photo} alt={justMatched.name} />
          <p>You and {justMatched.name} liked each other.</p>
          <button className="btn" onClick={() => setJustMatched(null)} autoFocus>Keep swiping</button>
        </div>
      )}
    </section>
  );
}

export default function Page() {
  const [tab, setTab] = useState("discover");
  return (
    <main className="app">
      {tab === "home" ? (
        <section className="screen" aria-label="Home">
          <div className="empty">
            <h2>Home</h2>
            <p>This is a placeholder for Coy's existing experience. The new feature lives in Discover.</p>
            <button className="btn" onClick={() => setTab("discover")}>Go to Discover</button>
          </div>
        </section>
      ) : (
        <Discover />
      )}
      <nav className="tabbar">
        <button className="tab" aria-current={tab === "home" ? "page" : undefined} onClick={() => setTab("home")}>Home</button>
        <button className="tab" aria-current={tab === "discover" ? "page" : undefined} onClick={() => setTab("discover")}>Discover</button>
      </nav>
    </main>
  );
}
