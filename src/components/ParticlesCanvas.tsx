import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

const PINK_COLORS = [
  "rgba(243, 143, 191, 0.8)",
  "rgba(247, 179, 212, 0.6)",
  "rgba(255, 130, 184, 0.7)",
];

const BASE_COLORS = [
  "rgba(46, 124, 199, 0.6)",
  "rgba(196, 204, 212, 0.3)",
  "rgba(255, 255, 255, 0.15)",
];

export default function ParticlesCanvas({ variant }: { variant: "hero" | "footer" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let animationId: number;
    let particles: Particle[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    const createParticles = () => {
      const count = variant === "hero" ? 80 : 30;
      particles = Array.from({ length: count }, (_, i) => {
        const isPinkCenter = variant === "hero" && i < 40; // 40 pink particles in center
        const isLarge = i % 5 === 0; // some large particles

        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        if (isPinkCenter) {
          // Cluster in the center
          x = canvas.width / 2 + (Math.random() - 0.5) * 400;
          y = canvas.height / 2 + (Math.random() - 0.5) * 400;
        }

        return {
          x,
          y,
          vx: (Math.random() - 0.5) * (isPinkCenter ? 0.1 : 0.3),
          vy: (Math.random() - 0.5) * (isPinkCenter ? 0.1 : 0.3) - 0.05,
          radius: isLarge ? Math.random() * 4 + 3 : Math.random() * 2 + 0.5,
          opacity: isPinkCenter ? Math.random() * 0.6 + 0.4 : Math.random() * 0.4 + 0.1,
          color: isPinkCenter
            ? PINK_COLORS[Math.floor(Math.random() * PINK_COLORS.length)]
            : BASE_COLORS[Math.floor(Math.random() * BASE_COLORS.length)],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
        };
      });
    };

    const drawParticle = (p: Particle) => {
      const pulseFactor = 1 + Math.sin(p.pulse) * 0.3;
      const r = p.radius * pulseFactor;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity * (0.7 + Math.sin(p.pulse) * 0.3);
      ctx.fill();

      if (r > 2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, r * 2.5);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.globalAlpha = p.opacity * 0.3;
        ctx.fill();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        drawParticle(p);
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    return () => cancelAnimationFrame(animationId);
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}