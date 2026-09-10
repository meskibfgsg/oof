import { useEffect, useMemo, useState } from "react";
import {
  LoadState,
  Profile,
  STATUS_COLOR,
  STATUS_LABEL,
  subscribeProfile,
} from "./lanyard";
import { Starfield } from "./Starfield";
import { MusicPlayer } from "./MusicPlayer";
import {
  BrandIcon,
  IconActivity,
  IconBadge,
  IconCheck,
  IconCopy,
  IconNote,
  IconTerminal,
  IconUser,
} from "./icons";
import { BadgeIcon } from "./badges";

/* Look up a specific ID via ?id=... in the URL; otherwise the owner. */
function useTargetId(): string | undefined {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || undefined;
  }, []);
}

const ACTIVITY_KIND: Record<number, string> = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  5: "Competing in",
};

function useElapsed(startMs?: number | null) {
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
  const targetId = useTargetId();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return subscribeProfile(targetId, setProfile, setState);
  }, [targetId]);

  const status = profile?.status ?? "offline";
  const activityElapsed = useElapsed(profile?.activity?.start);

  function copyId() {
    if (!profile) return;
    navigator.clipboard?.writeText(profile.id).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="stage">
      <div className="void" />
      <Starfield />

      <main className="layout">
        {/* -------- profile card -------- */}
        <section className={`card profileCard reveal${profile?.banner ? " hasBanner" : ""}`} style={{ ["--reveal-delay" as any]: "0ms" }}>
          {profile?.banner && (
            <div className="banner" style={{ backgroundImage: `url(${profile.banner})` }} />
          )}

          <header className="pcHead">
            <div className="avatarWrap">
              <div className={`avatarRing ring-${status}`}>
                {profile ? (
                  <img className="avatar" src={profile.avatar} alt={profile.displayName} />
                ) : (
                  <div className="avatar avatarSkeleton" />
                )}
                {profile?.decoration && (
                  <img className="avatarDecoration" src={profile.decoration} alt="" />
                )}
                <span className="statusDot" style={{ background: STATUS_COLOR[status] }} title={STATUS_LABEL[status]} />
              </div>
            </div>

            <div className="idBlock">
              <h1 className="displayName">
                {profile?.displayName ?? "…"}
              </h1>
              <button className="handle" onClick={copyId} title="Copy Discord ID">
                <span>@{profile?.username ?? "loading"}</span>
                <span className="copyGlyph">{copied ? <IconCheck /> : <IconCopy />}</span>
              </button>
              <p className="tagline">{profile?.customStatus || profile?.tagline}</p>
            </div>
          </header>

          {/* badges */}
          {profile && profile.badges.length > 0 && (
            <div className="badgeStrip">
              {profile.badges.map((b) => (
                <span className="badgeChip" key={b.id} title={b.label}>
                  <BadgeIcon id={b.id} />
                  <span className="badgeLabel">{b.label}</span>
                </span>
              ))}
            </div>
          )}

          <div className="rule" />

          {/* status line */}
          <div className="statusLine">
            <span className="statusPip" style={{ color: STATUS_COLOR[status], background: STATUS_COLOR[status] }} />
            <span className="statusText">{STATUS_LABEL[status]}</span>
            {state === "loading" && !profile && <span className="dim">· connecting</span>}
            {state === "error" && !profile && (
              <span className="dim">· join discord.gg/lanyard to go live</span>
            )}
          </div>

          {/* activity */}
          {profile?.activity && (
            <div className="miniCard">
              {profile.activity.largeImage ? (
                <img className="miniArt" src={profile.activity.largeImage} alt="" />
              ) : (
                <div className="miniArt miniArtGlyph"><IconActivity size={20} /></div>
              )}
              <div className="miniInfo">
                <span className="miniKind">{ACTIVITY_KIND[profile.activity.type] || "Active"}</span>
                <span className="miniTitle">{profile.activity.name}</span>
                {profile.activity.details && <span className="miniSub">{profile.activity.details}</span>}
                {profile.activity.state && <span className="miniSub">{profile.activity.state}</span>}
                {profile.activity.start && <span className="miniTime">{activityElapsed} elapsed</span>}
              </div>
            </div>
          )}

          {/* spotify */}
          {profile?.spotify && (
            <a
              className="miniCard spotifyCard"
              href={`https://open.spotify.com/track/${profile.spotify.trackId}`}
              target="_blank"
              rel="noreferrer"
            >
              {profile.spotify.albumArt ? (
                <img className="miniArt" src={profile.spotify.albumArt} alt="" />
              ) : (
                <div className="miniArt miniArtGlyph"><BrandIcon name="spotify" size={22} /></div>
              )}
              <div className="miniInfo">
                <span className="miniKind"><BrandIcon name="spotify" size={12} /> Listening on Spotify</span>
                <span className="miniTitle">{profile.spotify.song}</span>
                <span className="miniSub">{profile.spotify.artist}</span>
                {profile.spotify.start && profile.spotify.end && (
                  <SpotifyBar start={profile.spotify.start} end={profile.spotify.end} />
                )}
              </div>
            </a>
          )}

          {!profile?.activity && !profile?.spotify && profile && (
            <p className="dim quiet">Nothing playing that Discord can see right now.</p>
          )}

          {/* socials */}
          {profile && profile.socials.length > 0 && (
            <>
              <div className="rule" />
              <div className="socialRow">
                {profile.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="socialLink" aria-label={s.label} title={s.label}>
                    <BrandIcon name={s.icon} />
                  </a>
                ))}
              </div>
            </>
          )}
        </section>

        {/* -------- side column -------- */}
        <div className="sideCol">
          {/* developer bio */}
          <section className="card infoCard reveal" style={{ ["--reveal-delay" as any]: "90ms" }}>
            <h2 className="cardTitle"><IconTerminal size={18} /> Developer</h2>
            <p className="devBio">{profile?.devBio ?? "…"}</p>
          </section>

          {/* notes widget — fixed: renders only when a note exists, no overflow bug */}
          <section className="card infoCard reveal" style={{ ["--reveal-delay" as any]: "170ms" }}>
            <h2 className="cardTitle"><IconNote size={18} /> Note</h2>
            {profile?.note ? (
              <blockquote className="noteBody">{profile.note}</blockquote>
            ) : (
              <p className="dim quiet">No note for this profile.</p>
            )}
          </section>

          {/* badges as a readable list */}
          {profile && profile.badges.length > 0 && (
            <section className="card infoCard reveal" style={{ ["--reveal-delay" as any]: "250ms" }}>
              <h2 className="cardTitle"><IconBadge size={18} /> Badges</h2>
              <ul className="badgeList">
                {profile.badges.map((b) => (
                  <li key={b.id}><span className="badgeListIcon"><BadgeIcon id={b.id} /></span>{b.label}</li>
                ))}
              </ul>
            </section>
          )}

          {/* music player */}
          <div className="reveal" style={{ ["--reveal-delay" as any]: "330ms" }}>
            <MusicPlayer />
          </div>
        </div>
      </main>
    </div>
  );
}

function SpotifyBar({ start, end }: { start: number; end: number }) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const pct = Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
  return (
    <div className="miniBar">
      <div className="miniBarFill" style={{ width: `${pct}%` }} />
    </div>
  );
}
