/**
 * Lanyard (https://github.com/Phineas/lanyard) is a free, public service that
 * exposes a Discord user's live presence — status, activities, Spotify, etc.
 * over REST and WebSocket.
 *
 * IMPORTANT — read this before you expect live data to show up:
 * Lanyard can only see presence for accounts that are members of Lanyard's
 * own Discord server. If your account (1526063230722773265) hasn't joined
 * https://discord.gg/lanyard yet, the API will return a "user not found"
 * style error and this page will fall back to the static profile below.
 * Join that server once, keep your Discord client/app running so your
 * status is real, and this page will start showing it automatically —
 * no code changes needed.
 */

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export interface LanyardActivityTimestamps {
  start?: number;
  end?: number;
}

export interface LanyardActivityAssets {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
}

export interface LanyardActivity {
  id: string;
  name: string;
  type: number; // 0 Playing, 1 Streaming, 2 Listening, 3 Watching, 4 Custom, 5 Competing
  state?: string;
  details?: string;
  application_id?: string;
  timestamps?: LanyardActivityTimestamps;
  assets?: LanyardActivityAssets;
  created_at?: number;
}

export interface LanyardSpotify {
  track_id: string;
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: { start: number; end: number };
}

export interface LanyardDiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  avatar_decoration_data?: { asset: string } | null;
  clan?: { tag: string; identity_guild_id: string } | null;
  bot?: boolean;
}

export interface LanyardData {
  kv: Record<string, string>;
  discord_user: LanyardDiscordUser;
  discord_status: DiscordStatus;
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
  active_on_discord_web?: boolean;
  active_on_discord_desktop?: boolean;
  active_on_discord_mobile?: boolean;
}

interface LanyardSocketPayload<T> {
  op: number;
  t?: "INIT_STATE" | "PRESENCE_UPDATE";
  d: T;
}

export const LANYARD_REST_URL = (id: string) =>
  `https://api.lanyard.rest/v1/users/${id}`;

export const LANYARD_SOCKET_URL = "wss://api.lanyard.rest/socket";

export type ConnectionState =
  | "connecting"
  | "live"
  | "not_found"
  | "offline_fallback";

/** Discord CDN helpers */
export function avatarUrl(user: LanyardDiscordUser, size = 256): string {
  if (!user.avatar) {
    const idx = (BigInt(user.id) >> 22n) % 6n;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
}

export function avatarDecorationUrl(
  user: LanyardDiscordUser,
): string | null {
  if (!user.avatar_decoration_data?.asset) return null;
  return `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=160`;
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

/**
 * Subscribes to a Discord user's presence in real time over Lanyard's
 * WebSocket, with automatic reconnect + heartbeat. Falls back gracefully
 * (connectionState = "not_found") if the account isn't in Lanyard's guild.
 */
export function subscribeLanyard(
  userId: string,
  onData: (data: LanyardData) => void,
  onState: (state: ConnectionState) => void,
): () => void {
  let socket: WebSocket | null = null;
  let heartbeatInterval: number | undefined;
  let reconnectTimeout: number | undefined;
  let closedByUs = false;

  const connect = () => {
    onState("connecting");
    socket = new WebSocket(LANYARD_SOCKET_URL);

    socket.onmessage = (event) => {
      const payload: LanyardSocketPayload<any> = JSON.parse(event.data);

      switch (payload.op) {
        case 1: {
          // Hello — start heartbeat, then subscribe
          const interval = payload.d?.heartbeat_interval ?? 30000;
          heartbeatInterval = window.setInterval(() => {
            socket?.readyState === WebSocket.OPEN &&
              socket.send(JSON.stringify({ op: 3 }));
          }, interval);

          socket?.send(
            JSON.stringify({
              op: 2,
              d: { subscribe_to_id: userId },
            }),
          );
          break;
        }
        case 0: {
          if (payload.t === "INIT_STATE" || payload.t === "PRESENCE_UPDATE") {
            if (payload.d && payload.d.discord_user) {
              onData(payload.d as LanyardData);
              onState("live");
            } else {
              onState("not_found");
            }
          }
          break;
        }
      }
    };

    socket.onclose = () => {
      window.clearInterval(heartbeatInterval);
      if (!closedByUs) {
        onState("connecting");
        reconnectTimeout = window.setTimeout(connect, 3000);
      }
    };

    socket.onerror = () => {
      socket?.close();
    };
  };

  // Prime with a REST call first so we render something immediately,
  // then hand off to the socket for live updates.
  fetch(LANYARD_REST_URL(userId))
    .then((res) => res.json())
    .then((json) => {
      if (json.success && json.data?.discord_user) {
        onData(json.data as LanyardData);
        onState("live");
      } else {
        onState("not_found");
      }
    })
    .catch(() => onState("not_found"))
    .finally(connect);

  return () => {
    closedByUs = true;
    window.clearInterval(heartbeatInterval);
    window.clearTimeout(reconnectTimeout);
    socket?.close();
  };
}
