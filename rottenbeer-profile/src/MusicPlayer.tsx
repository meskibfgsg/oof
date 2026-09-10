import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { IconPlay, IconPause, IconPrev, IconNext, IconVolume, IconMuted } from "./icons";

export interface Track {
  title: string;
  artist: string;
  src: string;
  cover?: string;
}

/**
 * Edit this list to set your playlist. Files go in /public.
 * The first track begins as soon as the browser allows audio — browsers block
 * autoplay with sound until the first interaction, so if it's blocked we start
 * muted-primed and kick in on the first click/keypress anywhere on the page.
 */
export const PLAYLIST: Track[] = [
  { title: "phantom", artist: "unknown", src: "/phantom.mp3" },
];

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function MusicPlayer({ tracks = PLAYLIST }: { tracks?: Track[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.4);

  const track = tracks[index];

  // Create the audio element once.
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.preload = "auto";
    audioRef.current = audio;

    const onTime = () => {
      setCurrent(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onEnded = () => setIndex((i) => (i + 1) % tracks.length);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the current track and try to play it.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.src;
    audio.load();
    audio.play().catch(() => {
      // Autoplay with sound blocked — wait for the first user gesture.
      const kick = () => {
        audio.play().catch(() => {});
        window.removeEventListener("pointerdown", kick);
        window.removeEventListener("keydown", kick);
      };
      window.addEventListener("pointerdown", kick, { once: true });
      window.addEventListener("keydown", kick, { once: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };
  const next = () => setIndex((i) => (i + 1) % tracks.length);
  const prev = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => (i - 1 + tracks.length) % tracks.length);
  };

  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <div className="player card" role="region" aria-label="Music player">
      <div className="playerTop">
        <div className={`playerArt ${playing ? "spinning" : ""}`} aria-hidden="true">
          {track.cover ? (
            <img src={track.cover} alt="" />
          ) : (
            <div className="playerArtGlyph">
              <span className="eq" data-on={playing}>
                <i /><i /><i /><i />
              </span>
            </div>
          )}
        </div>
        <div className="playerMeta">
          <span className="playerKind">Now playing</span>
          <span className="playerTitle">{track.title}</span>
          <span className="playerArtist">{track.artist}</span>
        </div>
        <button
          className="playerMute"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <IconMuted /> : <IconVolume />}
        </button>
      </div>

      <div className="playerBar" onClick={seek} role="slider" aria-label="Seek" aria-valuenow={Math.round(progress * 100)}>
        <div className="playerBarFill" style={{ width: `${progress * 100}%` }}>
          <span className="playerBarKnob" />
        </div>
      </div>
      <div className="playerTimes">
        <span>{fmt(current)}</span>
        <span>{fmt(duration)}</span>
      </div>

      <div className="playerControls">
        <button className="pCtl" onClick={prev} aria-label="Previous track"><IconPrev /></button>
        <button className="pCtl pPlay" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <IconPause size={20} /> : <IconPlay size={20} />}
        </button>
        <button className="pCtl" onClick={next} aria-label="Next track"><IconNext /></button>
      </div>
    </div>
  );
}
