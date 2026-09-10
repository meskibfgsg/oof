/**
 * Lanyard data layer — live Discord presence + editable bio/notes via KV.
 *
 * No bot token. No server to host. This talks straight to Lanyard from the
 * browser, exactly like the original project did — just cleaned up and with
 * badges + KV support added.
 *
 * ── ONE-TIME SETUP ─────────────────────────────────────────────────────────
 *  1. Join  https://discord.gg/lanyard  with the account below, and keep a
 *     Discord client open somewhere so your status is real.
 *
 *  2. (Optional) Set your bio + note. Lanyard can't read your real Discord
 *     "About Me" — no bot can — so you store your own text in Lanyard's KV.
 *     DM the Lanyard bot, or use its slash command, in that server:
 *
 *        .set about_me Your about-me text here
 *        .set note Your note text here
 *        .set banner https://link-to-a-banner-image.png     (optional)
 *
 *     The site reads those live. Until you set them, it falls back to the
 *     CONFIG text below, so nothing ever looks empty.
 * ───────────────────────────────────────────────────────────────────────────
 */

export const CONFIG = {
  discordId: "1526063230722773265",

  // Fallbacks shown if the matching Lanyard KV key isn't set yet.
  devBio:
    "Full-stack developer. I build fast, weird, over-engineered things for fun — " +
    "real-time dashboards, Discord tooling, and the occasional cursed side project. " +
    "Mostly TypeScript, React, and Node. Perpetually mid-refactor.",
  note: "This is me. Ships on caffeine, replies faster than is healthy.",
  tagline: "night owl · builds things · probably lurking",

  socials: [
    { label: "Discord", href: "https://discord.com/users/1526063230722773265", icon: "discord" },
    { label: "X", href: "https://x.com/rottenbeer", icon: "x" },
    { label: "GitHub", href: "https://github.com/rottenbeer", icon: "github" },
    { label: "Instagram", href: "https://instagram.com/rottenbeer", icon: "instagram" },
    { label: "Twitch", href: "https://twitch.tv/rottenbeer", icon: "twitch" },
  ],
};

/* Which KV keys the site looks at (set any of these via the Lanyard bot). */
const KV_KEYS = {
  bio: ["about_me", "bio", "dev_bio"],
  note: ["note", "notes"],
  tagline: ["tagline", "status_text"],
  banner: ["banner", "banner_url"],
};

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";
export type LoadState = "loading" | "live" | "error";

export interface Badge {
  id: string;
  label: string;
}
export interface Activity {
  name: string;
  type: number;
  details: string | null;
  state: string | null;
  start: number | null;
  largeImage: string | null;
  largeText: string | null;
}
export interface Spotify {
  song: string;
  artist: string;
  album: string;
  albumArt: string | null;
  trackId: string;
  start: number | null;
  end: number | null;
}
export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner: string | null;
  decoration: string | null;
  badges: Badge[];
  status: DiscordStatus;
  activity: Activity | null;
  spotify: Spotify | null;
  customStatus: string | null;
  devBio: string;
  tagline: string;
  note: string | null;
  socials: { label: string; href: string; icon: string }[];
  isOwner: boolean;
}

export const STATUS_LABEL: Record<DiscordStatus, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};
export const STATUS_COLOR: Record<DiscordStatus, string> = {
  online: "#3ba55d",
  idle: "#e8a33d",
  dnd: "#ed4245",
  offline: "#6b6560",
};

/* ------------------------------ badges ------------------------------ */

const FLAGS: Record<string, number> = {
  STAFF: 1 << 0,
  PARTNER: 1 << 1,
  HYPESQUAD: 1 << 2,
  BUG_HUNTER_1: 1 << 3,
  HYPESQUAD_BRAVERY: 1 << 6,
  HYPESQUAD_BRILLIANCE: 1 << 7,
  HYPESQUAD_BALANCE: 1 << 8,
  EARLY_SUPPORTER: 1 << 9,
  BUG_HUNTER_2: 1 << 14,
  VERIFIED_DEVELOPER: 1 << 17,
  CERTIFIED_MODERATOR: 1 << 18,
  ACTIVE_DEVELOPER: 1 << 22,
};
const BADGE_META: Record<string, Badge> = {
  STAFF: { id: "staff", label: "Discord Staff" },
  PARTNER: { id: "partner", label: "Partnered Server Owner" },
  HYPESQUAD: { id: "hypesquad", label: "HypeSquad Events" },
  HYPESQUAD_BRAVERY: { id: "bravery", label: "HypeSquad Bravery" },
  HYPESQUAD_BRILLIANCE: { id: "brilliance", label: "HypeSquad Brilliance" },
  HYPESQUAD_BALANCE: { id: "balance", label: "HypeSquad Balance" },
  BUG_HUNTER_1: { id: "bughunter", label: "Bug Hunter" },
  BUG_HUNTER_2: { id: "bughunter_gold", label: "Bug Hunter Gold" },
  EARLY_SUPPORTER: { id: "early_supporter", label: "Early Supporter" },
  VERIFIED_DEVELOPER: { id: "verified_dev", label: "Early Verified Bot Developer" },
  CERTIFIED_MODERATOR: { id: "mod", label: "Moderator Programs Alumni" },
  ACTIVE_DEVELOPER: { id: "active_dev", label: "Active Developer" },
};
function decodeBadges(flags = 0): Badge[] {
  const out: Badge[] = [];
  for (const [key, bit] of Object.entries(FLAGS)) {
    if ((flags & bit) === bit && BADGE_META[key]) out.push(BADGE_META[key]);
  }
  return out;
}

/* ------------------------------ CDN helpers ------------------------------ */

interface LanyardUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar: string | null;
  banner?: string | null;
  public_flags?: number;
  avatar_decoration_data?: { asset: string } | null;
}

function avatarUrl(u: LanyardUser, size = 256): string {
  if (!u.avatar) {
    const idx = Number((BigInt(u.id) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  const ext = u.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=${size}`;
}
function bannerUrl(u: LanyardUser, size = 600): string | null {
  if (!u.banner) return null;
  const ext = u.banner.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${u.id}/${u.banner}.${ext}?size=${size}`;
}
function decorationUrl(u: LanyardUser): string | null {
  const asset = u.avatar_decoration_data?.asset;
  return asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160` : null;
}

/* ------------------------------ activity shaping ------------------------------ */

interface LanyardActivity {
  name: string;
  type: number;
  state?: string;
  details?: string;
  sync_id?: string;
  application_id?: string;
  timestamps?: { start?: number; end?: number };
  assets?: { large_image?: string; large_text?: string };
}

function resolveAsset(a: LanyardActivity): string | null {
  const img = a.assets?.large_image;
  if (!img) return null;
  if (img.startsWith("mp:external/"))
    return `https://media.discordapp.net/external/${img.replace("mp:external/", "")}`;
  if (img.startsWith("spotify:"))
    return `https://i.scdn.co/image/${img.replace("spotify:", "")}`;
  if (a.application_id)
    return `https://cdn.discordapp.com/app-assets/${a.application_id}/${img}.png`;
  return null;
}

function shape(activities: LanyardActivity[] = []) {
  let activity: Activity | null = null;
  let spotify: Spotify | null = null;
  let customStatus: string | null = null;

  for (const a of activities) {
    if (a.type === 4) {
      customStatus = a.state || null;
      continue;
    }
    if (a.name === "Spotify" && a.type === 2 && a.sync_id) {
      spotify = {
        song: a.details || "",
        artist: a.state || "",
        album: a.assets?.large_text || "",
        albumArt: a.assets?.large_image
          ? `https://i.scdn.co/image/${a.assets.large_image.replace("spotify:", "")}`
          : null,
        trackId: a.sync_id,
        start: a.timestamps?.start ?? null,
        end: a.timestamps?.end ?? null,
      };
      continue;
    }
    if (!activity) {
      activity = {
        name: a.name,
        type: a.type,
        details: a.details || null,
        state: a.state || null,
        start: a.timestamps?.start ?? null,
        largeImage: resolveAsset(a),
        largeText: a.assets?.large_text || null,
      };
    }
  }
  return { activity, spotify, customStatus };
}

function pickKv(kv: Record<string, string> | undefined, keys: string[]): string | null {
  if (!kv) return null;
  for (const k of keys) {
    if (kv[k] && kv[k].trim()) return kv[k];
  }
  return null;
}

interface LanyardData {
  discord_user: LanyardUser;
  discord_status: DiscordStatus;
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: unknown;
  kv?: Record<string, string>;
}

function toProfile(d: LanyardData): Profile {
  const u = d.discord_user;
  const { activity, spotify, customStatus } = shape(d.activities);
  return {
    id: u.id,
    username: u.username,
    displayName: u.global_name || u.username,
    avatar: avatarUrl(u),
    banner: bannerUrl(u) || pickKv(d.kv, KV_KEYS.banner),
    decoration: decorationUrl(u),
    badges: decodeBadges(u.public_flags),
    status: d.discord_status,
    activity,
    spotify,
    customStatus,
    devBio: pickKv(d.kv, KV_KEYS.bio) || CONFIG.devBio,
    tagline: pickKv(d.kv, KV_KEYS.tagline) || CONFIG.tagline,
    note: pickKv(d.kv, KV_KEYS.note) || CONFIG.note,
    socials: CONFIG.socials,
    isOwner: u.id === CONFIG.discordId,
  };
}

/* ------------------------------ live subscription ------------------------------ */

const REST = (id: string) => `https://api.lanyard.rest/v1/users/${id}`;
const SOCKET = "wss://api.lanyard.rest/socket";

export function subscribeProfile(
  id: string | undefined,
  onData: (p: Profile) => void,
  onState: (s: LoadState) => void,
): () => void {
  const userId = id || CONFIG.discordId;
  let socket: WebSocket | null = null;
  let heartbeat: number | undefined;
  let reconnect: number | undefined;
  let closedByUs = false;

  const connect = () => {
    socket = new WebSocket(SOCKET);

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.op === 1) {
        const interval = payload.d?.heartbeat_interval ?? 30000;
        heartbeat = window.setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ op: 3 }));
        }, interval);
        socket?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
      }
      if (payload.op === 0 && (payload.t === "INIT_STATE" || payload.t === "PRESENCE_UPDATE")) {
        if (payload.d?.discord_user) {
          onData(toProfile(payload.d));
          onState("live");
        } else {
          onState("error");
        }
      }
    };

    socket.onclose = () => {
      window.clearInterval(heartbeat);
      if (!closedByUs) {
        reconnect = window.setTimeout(connect, 3000);
      }
    };
    socket.onerror = () => socket?.close();
  };

  onState("loading");
  // Prime with REST so the card fills immediately, then hand off to the socket.
  fetch(REST(userId))
    .then((r) => r.json())
    .then((json) => {
      if (json.success && json.data?.discord_user) {
        onData(toProfile(json.data));
        onState("live");
      } else {
        onState("error");
      }
    })
    .catch(() => onState("error"))
    .finally(connect);

  return () => {
    closedByUs = true;
    window.clearInterval(heartbeat);
    window.clearTimeout(reconnect);
    socket?.close();
  };
}
