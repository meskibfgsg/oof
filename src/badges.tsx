import type { ReactNode } from "react";

/* Simple, legible SVG marks for Discord badges — no emoji, no external images.
   Each returns a 16px glyph tinted by currentColor. */

function wrap(children: ReactNode) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const BADGE_ICON: Record<string, ReactNode> = {
  active_dev: wrap(<><path d="m4 17 6-6-6-6" /><path d="M12 19h8" /></>),
  verified_dev: wrap(<><rect x="3" y="4" width="18" height="14" rx="2" /><path d="m8 21 4-3 4 3" /><path d="m9 11 2 2 3-3" /></>),
  early_supporter: wrap(<><path d="M12 21s-7-4.35-9.5-8.5C1 9.5 2.5 6 6 6c2 0 3 1 4 2 1-1 2-2 4-2 3.5 0 5 3.5 3.5 6.5C19 16.65 12 21 12 21Z" /></>),
  bughunter: wrap(<><path d="M8 4 6 6M16 4l2 2" /><rect x="7" y="7" width="10" height="12" rx="5" /><path d="M12 7v12M4 11h3M17 11h3M4 15h3M17 15h3" /></>),
  bughunter_gold: wrap(<><path d="M8 4 6 6M16 4l2 2" /><rect x="7" y="7" width="10" height="12" rx="5" /><path d="M10 12l1.5 1.5L14 11" /></>),
  hypesquad: wrap(<><path d="M4 5h16l-2 6a6 6 0 0 1-12 0Z" /><path d="M9 17h6M12 17v4M8 21h8" /></>),
  bravery: wrap(<><path d="M12 3 5 6v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6Z" /></>),
  brilliance: wrap(<><path d="m12 3 2.5 5 5.5.8-4 4 1 5.5L12 20l-5 2.3 1-5.5-4-4 5.5-.8Z" /></>),
  balance: wrap(<><path d="M12 3v18M5 8h14M6 8l-3 6h6ZM18 8l-3 6h6Z" /></>),
  staff: wrap(<><path d="M3 20h18M6 20V9l6-4 6 4v11M10 20v-5h4v5" /></>),
  partner: wrap(<><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>),
  mod: wrap(<><path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6Z" /></>),
};

export function BadgeIcon({ id }: { id: string }) {
  return <>{BADGE_ICON[id] ?? BADGE_ICON.hypesquad}</>;
}
