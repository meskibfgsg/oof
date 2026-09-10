import type { ReactElement } from "react";

/* Lucide-style line icons (stroke, currentColor) + brand marks (fill). */

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconUser(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} {...line}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconNote(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} {...line}>
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
      <path d="M15 3v6h6" />
      <path d="M8 13h6M8 17h5" />
    </svg>
  );
}

export function IconTerminal(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} {...line}>
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  );
}

export function IconActivity(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} {...line}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function IconBadge(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} {...line}>
      <path d="M12 2 15 5l4-1 1 4 3 3-3 3-1 4-4-1-3 3-3-3-4 1-1-4-3-3 3-3 1-4 4 1 3-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconCopy(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 15} height={p.size ?? 15} {...line}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconCheck(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 15} height={p.size ?? 15} {...line}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconPlay(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 18} height={p.size ?? 18} fill="currentColor" stroke="none">
      <path d="M7 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}

export function IconPause(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 18} height={p.size ?? 18} fill="currentColor" stroke="none">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function IconPrev(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} fill="currentColor" stroke="none">
      <path d="M6 5a1 1 0 0 1 2 0v5.2l9.5-5.9A1 1 0 0 1 19 5.2v13.6a1 1 0 0 1-1.5.9L8 13.8V19a1 1 0 0 1-2 0Z" />
    </svg>
  );
}

export function IconNext(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} fill="currentColor" stroke="none">
      <path d="M18 5a1 1 0 0 0-2 0v5.2L6.5 4.3A1 1 0 0 0 5 5.2v13.6a1 1 0 0 0 1.5.9L16 13.8V19a1 1 0 0 0 2 0Z" />
    </svg>
  );
}

export function IconVolume(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} {...line}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

export function IconMuted(p: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} {...line}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="m22 9-6 6M16 9l6 6" />
    </svg>
  );
}

/* ------------------------------ brand marks ------------------------------ */

const brands: Record<string, ReactElement> = {
  discord: (
    <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.21.375-.444.879-.608 1.278a18.27 18.27 0 0 0-5.487 0A12.64 12.64 0 0 0 9.182 3a19.74 19.74 0 0 0-4.435 1.37C1.676 8.79.914 13.09 1.295 17.333a19.9 19.9 0 0 0 6.031 3.048c.486-.657.919-1.355 1.29-2.09a12.9 12.9 0 0 1-2.032-.973c.17-.123.336-.252.497-.384a14.2 14.2 0 0 0 12.08 0c.163.132.328.261.497.384-.646.383-1.323.71-2.033.974.372.734.804 1.432 1.29 2.089a19.86 19.86 0 0 0 6.036-3.049c.446-4.895-.762-9.156-3.634-12.963ZM8.55 14.767c-1.184 0-2.157-1.09-2.157-2.428 0-1.339.955-2.429 2.157-2.429 1.213 0 2.178 1.1 2.157 2.429 0 1.338-.944 2.428-2.157 2.428Zm6.9 0c-1.184 0-2.157-1.09-2.157-2.428 0-1.339.955-2.429 2.157-2.429 1.213 0 2.178 1.1 2.157 2.429 0 1.338-.944 2.428-2.157 2.428Z" />
  ),
  x: (
    <path d="M18.244 2H21.6l-7.32 8.36L23 22h-6.828l-5.35-6.99L4.7 22H1.34l7.83-8.95L1 2h6.995l4.844 6.42L18.244 2Zm-1.197 18.19h1.86L7.03 3.7H5.03L17.047 20.19Z" />
  ),
  github: (
    <path d="M12 2C6.477 2 2 6.485 2 12.02c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.339-2.221-.253-4.556-1.113-4.556-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.56 9.56 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.748 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.02C22 6.485 17.523 2 12 2Z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  twitch: (
    <path d="M4.3 2 3 5.7v14.2h5.1V22l3-2.1h3.9L21 13.7V2H4.3Zm14.9 10.8-3.2 3.2h-3.5l-2.8 2v-2H6.2V3.7h13v9.1Zm-3.4-6.2h1.6v4.7h-1.6zM11.4 6.6H13v4.7h-1.6z" />
  ),
  spotify: (
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 1 1-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 1 1-.452-1.492c3.632-1.102 8.147-.568 11.234 1.329a.78.78 0 0 1 .255 1.072zm.105-2.835c-3.222-1.913-8.54-2.09-11.616-1.156a.935.935 0 1 1-.542-1.79c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 1 1-.957 1.608z" />
  ),
};

export function BrandIcon({ name, size = 18 }: { name: string; size?: number }) {
  const path = brands[name];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      {path}
    </svg>
  );
}
