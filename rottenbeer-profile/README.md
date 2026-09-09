# rottenbeer — live Discord profile card

A single-page, TypeScript + React profile card in the guns.lol / biggerbrain style:
animated luxury background (gold-dust particle field + drifting gradient mesh),
glass card with a gold hairline border, a status ring around your avatar,
live Discord presence (status / current activity / Spotify), and a social row.

## Before you run it — the one real requirement

Discord doesn't let random websites read anyone's live status directly. This
card gets real-time presence from **[Lanyard](https://github.com/Phineas/lanyard)**,
a free public API built for exactly this. Lanyard can only see presence for
accounts that are members of **its own Discord server**.

**You (`rottenbeer`, ID `1526063230722773265`) need to join
[discord.gg/lanyard](https://discord.gg/lanyard) once.** After that, as long as
your Discord client is open somewhere (desktop, mobile, or web), this page
will show your real status, activity, and Spotify automatically — nothing to
configure, no API keys, no backend to host.

Until you join that server, the card still renders correctly, it just shows a
small notice under your status instead of live data ("Live presence isn't
connected yet…").

### About "last seen"

Discord's API doesn't expose a public "last online" timestamp for anyone —
not even Lanyard has it. This card is honest about that: it remembers, in
*your own browser's local storage*, the last time it saw you online, and
shows "last online Xm ago" from that. It won't show anything invented.

## Running it locally

```bash
npm install
npm run dev
```

Then open the printed local URL. For a production build:

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to `dist/` — you can host those on
Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host. No
server-side code is required; everything talks to Lanyard directly from the
browser.

## Making it yours

Everything you'd want to change lives at the top of `src/App.tsx`:

- `DISCORD_ID` — already set to `1526063230722773265`
- `TAGLINE` — shown when you don't have a Discord custom status set
- `SOCIALS` — array of `{ label, href, icon }`; edit the `href`s to your real
  profile links (placeholders are currently `github.com/rottenbeer`,
  `x.com/rottenbeer`, etc. — swap for your actual accounts)
- `BADGES` — small pills next to your name; edit or empty the array to remove

Colors, type, and layout live in `src/styles.css` as CSS variables at the top
(`--gold`, `--violet`, `--bg-void`, etc.) if you want to retheme it.

## How the live data works

`src/lanyard.ts` opens a WebSocket to `wss://api.lanyard.rest/socket`,
subscribes to your user ID, and pushes every presence update into React
state — status color, current game/app (`activities`), and Spotify (song,
artist, album art, live progress bar). It also does one REST call first so
the card isn't empty while the socket connects, and auto-reconnects if the
connection drops.

## Stack

Vite + React 18 + TypeScript, no UI framework, no Tailwind — plain CSS with
a small token system so the look is fully under your control.
