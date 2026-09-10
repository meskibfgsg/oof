import { useEffect, useRef } from "react";

/**
 * Drifting white-dot starfield — the same treatment as the reference page's
 * background (rgba white dots, slow drift, gentle alpha shimmer) on a
 * near-black void. Respects reduced-motion.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dots: { x: number; y: number; vx: number; vy: number; r: number; a: number; phase: number }[] = [];
    let raf = 0;

    const count = () =>
      reduced ? 0 : window.innerWidth < 768 ? 120 : 220;

    function resize() {
      w = canvas.width = window.innerWidth || 1;
      h = canvas.height = window.innerHeight || 1;
      const n = count();
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 0.9 + 0.35,
        a: Math.random() * 0.1 + 0.12,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.001;
      for (const p of dots) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const alpha = Math.min(1, Math.max(0.08, p.a + Math.sin(t * 0.22 + p.phase) * 0.03));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    if (!reduced) frame();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
