import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  avatarDecorationUrl,
  avatarUrl,
  ConnectionState,
  LanyardActivity,
  LanyardData,
  STATUS_COLOR,
  STATUS_LABEL,
  subscribeLanyard,
} from "./lanyard";
import { AmbientField } from "./AmbientField";

/* ------------------------------------------------------------------ */
/*  Edit this block — everything about the card lives here.            */
/* ------------------------------------------------------------------ */

const DISCORD_ID = "1526063230722773265";
const DISPLAY_NAME_FALLBACK = "rottenbeer";
const USERNAME_FALLBACK = "rottenbeer.";
const TAGLINE = "night owl · builds things · probably lurking";

const SOCIALS: { label: string; href: string; icon: JSX.Element }[] = [
  { label: "Discord", href: "https://discord.com/users/" + DISCORD_ID, icon: <IconDiscord /> },
  { label: "X", href: "https://x.com/rottenbeer", icon: <IconX /> },
  { label: "Instagram", href: "https://instagram.com/rottenbeer", icon: <IconInstagram /> },
  { label: "GitHub", href: "https://github.com/rottenbeer", icon: <IconGithub /> },
  { label: "Twitch", href: "https://twitch.tv/rottenbeer", icon: <IconTwitch /> },
];

const BIO = "A Dev • Cider enthusiast • Building cool stuff";
const BACKGROUND_MUSIC = "https://youtu.be/hmdzniMJOZs?si=eG9FoIVtD81cwAkv";

/* ------------------------------------------------------------------ */

const ACTIVITY_TYPE_LABEL: Record<number, string> = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  5: "Competing in",
};

function useLastSeen(status: string | undefined) {
  const key = `rottenbeer:last-online:${DISCORD_ID}`;
  const [lastSeen, setLastSeen] = useState<number | null>(() => {
    const raw = localStorage.getItem(key);
    return raw ? Number(raw) : null;
  });

  useEffect(() => {
    if (status && status !== "offline") {
      const now = Date.now();
      localStorage.setItem(key, String(now));
      setLastSeen(now);
    }
  }, [status]);

  return lastSeen;
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function useElapsed(startMs?: number) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!startMs) return;
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [startMs]);
  if (!startMs) return "";
  const s = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

export default function App() {
  const [data, setData] = useState<LanyardData | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribe = subscribeLanyard(
      DISCORD_ID,
      (d) => setData(d),
      (s) => setConnection(s),
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Background music autoplay
    const audio = new Audio("/phantom.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Autoplay blocked - user interaction required
    });
    return () => {
      audio.pause();
    };
  }, []);

  const lastSeen = useLastSeen(data?.discord_status);

  const primaryActivity = useMemo<LanyardActivity | undefined>(() => {
    if (!data) return undefined;
    return data.activities.find((a) => a.type !== 4); // skip "custom status" entry
  }, [data]);

  const customStatus = useMemo<LanyardActivity | undefined>(() => {
    return data?.activities.find((a) => a.type === 4);
  }, [data]);

  const elapsed = useElapsed(primaryActivity?.timestamps?.start);
  const spotifyElapsed = useElapsed(data?.spotify?.timestamps.start);

  const status = data?.discord_status ?? "offline";
  const user = data?.discord_user;
  const name = user?.global_name || user?.username || DISPLAY_NAME_FALLBACK;
  const username = user?.username || USERNAME_FALLBACK;
  const avatar = user ? avatarUrl(user, 256) : null;
  const decoration = user ? avatarDecorationUrl(user) : null;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px, y: py });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  function copyId() {
    navigator.clipboard?.writeText(DISCORD_ID).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  const showFallbackNotice = connection === "not_found";

  return (
    <div className="stage">
      <AmbientField status={status} />

      <main
        className="cardWrap"
        style={{
          transform: `perspective(1200px) rotateX(${(-tilt.y * 6).toFixed(2)}deg) rotateY(${(tilt.x * 6).toFixed(2)}deg)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
      >
        <div className="card">
          <div className="cardSheen" style={{
            background: `radial-gradient(420px circle at ${50 + tilt.x * 60}% ${50 + tilt.y * 60}%, rgba(212,175,106,0.16), transparent 60%)`,
          }} />

          <header className="cardHeader">
            <div className="avatarBlock">
              <div className={`avatarRing ring-${status}`}>
                {avatar ? (
                  <img className="avatar" src={avatar} alt={name} />
                ) : (
                  <div className="avatarPlaceholder">{name[0]?.toUpperCase()}</div>
                )}
                {decoration && (
                  <img className="avatarDecoration" src={decoration} alt="" />
                )}
                <span
                  className="statusDot"
                  style={{ background: STATUS_COLOR[status] }}
                  title={STATUS_LABEL[status]}
                />
              </div>
            </div>

            <div className="idBlock">
              <div className="nameRow">
                <h1>{name}</h1>
              </div>
              <button className="handle" onClick={copyId} title="Copy Discord ID">
                @{username}
                <span className="copyHint">{copied ? "copied" : DISCORD_ID}</span>
              </button>
              <p className="tagline">{customStatus?.state || TAGLINE}</p>
              <p className="bio">{BIO}</p>
            </div>
          </header>

          <div className="divider" />

          <section className="statusSection">
            <div className="statusLine">
              <span className="statusPip" style={{ background: STATUS_COLOR[status] }} />
              <span className="statusText">{STATUS_LABEL[status]}</span>
              {connection === "connecting" && !data && (
                <span className="connectingText">connecting…</span>
              )}
              {status === "offline" && lastSeen && (
                <span className="lastSeen">· last online {relativeTime(lastSeen)}</span>
              )}
            </div>

            {data?.listening_to_spotify && data.spotify && (
              <a
                className="activityCard spotify"
                href={`https://open.spotify.com/track/${data.spotify.track_id}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  className="activityArt"
                  src={data.spotify.album_art_url}
                  alt={data.spotify.album}
                />
                <div className="activityInfo">
                  <span className="activityKind">Listening to Spotify</span>
                  <span className="activityTitle">{data.spotify.song}</span>
                  <span className="activitySub">
                    {data.spotify.artist} — {data.spotify.album}
                  </span>
                  <div className="progressTrack">
                    <div
                      className="progressFill"
                      style={{
                        width: `${Math.min(
                          100,
                          ((Date.now() - data.spotify.timestamps.start) /
                            (data.spotify.timestamps.end - data.spotify.timestamps.start)) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="activityElapsed">{spotifyElapsed}</span>
                </div>
              </a>
            )}

            {primaryActivity && (
              <div className="activityCard">
                {primaryActivity.assets?.large_image ? (
                  <img
                    className="activityArt"
                    src={resolveDiscordAsset(primaryActivity)}
                    alt=""
                  />
                ) : (
                  <div className="activityArtFallback" />
                )}
                <div className="activityInfo">
                  <span className="activityKind">
                    {ACTIVITY_TYPE_LABEL[primaryActivity.type] || "Active in"}
                  </span>
                  <span className="activityTitle">{primaryActivity.name}</span>
                  {primaryActivity.details && (
                    <span className="activitySub">{primaryActivity.details}</span>
                  )}
                  {primaryActivity.state && (
                    <span className="activitySub">{primaryActivity.state}</span>
                  )}
                  {primaryActivity.timestamps?.start && (
                    <span className="activityElapsed">{elapsed} elapsed</span>
                  )}
                </div>
              </div>
            )}

            {!primaryActivity && !data?.listening_to_spotify && data && (
              <p className="idleNote">Not doing anything Discord can see right now.</p>
            )}

            {showFallbackNotice && (
              <p className="fallbackNote">
                Live presence isn't connected yet — this account needs to join{" "}
                <a href="https://discord.gg/lanyard" target="_blank" rel="noreferrer">
                  Lanyard's Discord server
                </a>{" "}
                once for real-time status to appear here.
              </p>
            )}
          </section>

          <div className="divider" />

          <footer className="socialRow">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="socialLink"
                aria-label={s.label}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </footer>
        </div>
      </main>
    </div>
  );
}

function resolveDiscordAsset(activity: LanyardActivity): string {
  const img = activity.assets?.large_image ?? "";
  if (img.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${img.replace("mp:external/", "")}`;
  }
  if (img.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${img.replace("spotify:", "")}`;
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`;
  }
  return "";
}

/* ---------------------------- icons ---------------------------- */

function IconDiscord() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.21.375-.444.879-.608 1.278a18.27 18.27 0 0 0-5.487 0A12.64 12.64 0 0 0 9.182 3a19.74 19.74 0 0 0-4.435 1.37C1.676 8.79.914 13.09 1.295 17.333a19.9 19.9 0 0 0 6.031 3.048c.486-.657.919-1.355 1.29-2.09a12.9 12.9 0 0 1-2.032-.973c.17-.123.336-.252.497-.384a14.2 14.2 0 0 0 12.08 0c.163.132.328.261.497.384-.646.383-1.323.71-2.033.974.372.734.804 1.432 1.29 2.089a19.86 19.86 0 0 0 6.036-3.049c.446-4.895-.762-9.156-3.634-12.963ZM8.55 14.767c-1.184 0-2.157-1.09-2.157-2.428 0-1.339.955-2.429 2.157-2.429 1.213 0 2.178 1.1 2.157 2.429 0 1.338-.944 2.428-2.157 2.428Zm6.9 0c-1.184 0-2.157-1.09-2.157-2.428 0-1.339.955-2.429 2.157-2.429 1.213 0 2.178 1.1 2.157 2.429 0 1.338-.944 2.428-2.157 2.428Z" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M18.244 2H21.6l-7.32 8.36L23 22h-6.828l-5.35-6.99L4.7 22H1.34l7.83-8.95L1 2h6.995l4.844 6.42L18.244 2Zm-1.197 18.19h1.86L7.03 3.7H5.03L17.047 20.19Z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconGithub() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.485 2 12.02c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.339-2.221-.253-4.556-1.113-4.556-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.56 9.56 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.748 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.02C22 6.485 17.523 2 12 2Z" />
    </svg>
  );
}
function IconTwitch() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
      <path d="M4.3 2 3 5.7v14.2h5.1V22l3-2.1h3.9L21 13.7V2H4.3Zm14.9 10.8-3.2 3.2h-3.5l-2.8 2v-2H6.2V3.7h13v9.1Z" />
      <path d="M15.8 6.6h1.6v4.7h-1.6zM11.4 6.6H13v4.7h-1.6z" />
    </svg>
  );
}
