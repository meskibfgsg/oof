# rottenbeer — live Discord profile (Lanyard edition)

A dark, premium profile card: live Discord status / activity / Spotify, badges,
an editable bio + note, animated entrance, and an autoplaying music player.
Restyled to match the reference dashboard (transparent cards, gold accent,
Rajdhani type, drifting starfield). **No bot token, no server, no emojis.**

## Run it

```bash
npm install
npm run dev
```

Open the printed URL. Build for hosting with `npm run build` (outputs static
files in `dist/` — drop them on Vercel, Netlify, Cloudflare Pages, GitHub Pages,
anything).

## One-time setup for live data

1. **Presence:** join <https://discord.gg/lanyard> with your account
   (`1526063230722773265`) and keep a Discord client open. That's what makes
   status / activity / Spotify real. Until you do, the card still renders — it
   just shows a "join lanyard" hint instead of a live status.

2. **Bio + note:** Discord doesn't let *any* bot (Lanyard included) read your
   real "About Me". Instead you store your own text in Lanyard's KV, and the
   site reads it live. In the Lanyard server, message the bot:

   ```
   .set about_me your developer bio here
   .set note your note here
   .set banner https://link-to-banner.png     (optional)
   ```

   Until you set them, the card falls back to the text in
   `src/lanyard.ts` → `CONFIG`, so nothing looks empty.

## Look up someone else

Add `?id=THEIR_DISCORD_ID` to the URL. They must also be in the Lanyard server
for live presence to appear.

## Editing

- **Bio / note / tagline / socials fallbacks:** `src/lanyard.ts` → `CONFIG`
- **Playlist:** `src/MusicPlayer.tsx` → `PLAYLIST` (drop audio in `public/`)
- **Colors / type / animation:** `src/styles.css` (CSS variables at the top)

## What changed from your original zip

| Original file            | What happens to it                                             |
|--------------------------|---------------------------------------------------------------|
| `src/lanyard.ts`         | **Replaced** — same Lanyard idea, now with badges + KV bio/note |
| `src/App.tsx`            | **Replaced** — full reface, no emojis, fixed note widget, badges, dev bio, music player |
| `src/styles.css`         | **Replaced** — reference styling (transparent cards, gold, Rajdhani, reveal animation) |
| `src/AmbientField.tsx`   | **Deleted** — replaced by `src/Starfield.tsx` (white-dot drift) |
| `src/main.tsx`           | Replaced (unchanged in spirit)                                |
| `index.html`             | **Replaced** — Rajdhani + Outfit fonts instead of Fraunces    |
| `public/phantom.mp3`     | **Kept**                                                      |
| `package.json`, `vite.config.ts`, `tsconfig.json`, `.gitignore` | Kept / equivalent |
| `wrangler.toml`          | Not included — add back if you deploy to Cloudflare           |

**New files added:** `src/Starfield.tsx`, `src/icons.tsx` (all SVG icons +
brand logos), `src/badges.tsx` (badge glyphs), `src/MusicPlayer.tsx`.
