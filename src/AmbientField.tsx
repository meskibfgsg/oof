import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  hue: number;
}

const STATUS_TINT: Record<string, string> = {
  online: "56, 189, 130",
  idle: "232, 163, 61",
  dnd: "237, 66, 69",
  offline: "148, 130, 110",
};

export function AmbientField({ status }: { status: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let raf = 0;
    let t = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.floor((width * height) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.06,
        vy: -Math.random() * 0.09 - 0.02,
        a: Math.random() * 0.5 + 0.15,
        hue: Math.random(),
      }));
    }

    function draw() {
      t += 1;
      ctx!.clearRect(0, 0, width, height);

      // drifting mesh glow blobs
      const blobs = [
        { x: width * (0.22 + Math.sin(t / 900) * 0.06), y: height * 0.28, r: width * 0.42, c: "rgba(212,175,106,0.12)" },
        { x: width * (0.8 + Math.cos(t / 1100) * 0.05), y: height * 0.75, r: width * 0.38, c: "rgba(124,92,255,0.10)" },
        { x: width * 0.5, y: height * (0.15 + Math.sin(t / 1400) * 0.04), r: width * 0.3, c: "rgba(212,175,106,0.06)" },
      ];
      for (const b of blobs) {
        const g = ctx!.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, width, height);
      }

      // particles (gold dust)
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(212, 175, 106, ${p.a * 0.8})`;
        ctx!.fill();
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const tint = STATUS_TINT[status] ?? STATUS_TINT.offline;

  return (
    <div className="ambient">
      <div className="ambientBase" />
      <div
        className="ambientStatusGlow"
        style={{ background: `radial-gradient(60% 50% at 50% 100%, rgba(${tint}, 0.14), transparent 70%)` }}
      />
      <canvas ref={canvasRef} className="ambientCanvas" />
      <div className="ambientVignette" />
      <div className="ambientGrain" />
    </div>
  );
}
