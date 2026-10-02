/**
 * Effects for /signage's shooter mode: the sheet shatters into shards, sparks
 * and paper scraps fly, the grid shakes, and a synthesised shot and blast play.
 * Nothing here touches React state; the page decides what a hit means.
 */

const PAPER = ["#ffffff", "#f1f3f5", "#dfe3e8"];
const INK = ["#111417", "#394049"];
const FIRE = ["#fff4d6", "#ffd27a", "#f38fbf", "#ff7a59"];

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------------------------------------------------- particles -- */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  size: number;
  color: string;
  kind: "spark" | "scrap" | "smoke" | "ring";
  spin: number;
  angle: number;
};

export class Particles {
  private ctx: CanvasRenderingContext2D;
  private items: Particle[] = [];
  private frame = 0;
  private last = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
    window.addEventListener("resize", this.resize);
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.resize);
  }

  private resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(window.innerWidth * dpr);
    this.canvas.height = Math.round(window.innerHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  /** A small flash where the shot lands, hit or miss. */
  muzzle(x: number, y: number) {
    for (let i = 0; i < 10; i++) this.add(x, y, "spark", FIRE, 2 + Math.random() * 4, 0.25 + Math.random() * 0.2);
    this.items.push({ x, y, vx: 0, vy: 0, life: 0.22, age: 0, size: 26, color: "#ffffff", kind: "ring", spin: 0, angle: 0 });
    this.start();
  }

  /** The blast over a destroyed sheet. */
  explode(x: number, y: number, scale = 1) {
    this.items.push({ x, y, vx: 0, vy: 0, life: 0.45, age: 0, size: 120 * scale, color: "#fff4d6", kind: "ring", spin: 0, angle: 0 });
    for (let i = 0; i < 70 * scale; i++) this.add(x, y, "spark", FIRE, 3 + Math.random() * 9, 0.4 + Math.random() * 0.5);
    for (let i = 0; i < 46 * scale; i++) this.add(x, y, "scrap", Math.random() < 0.75 ? PAPER : INK, 2 + Math.random() * 5, 1 + Math.random() * 0.9);
    for (let i = 0; i < 16 * scale; i++) this.add(x, y, "smoke", ["rgba(20,24,28,0.5)", "rgba(60,66,74,0.4)"], 0.6 + Math.random() * 1.6, 0.9 + Math.random() * 0.8);
    this.start();
  }

  private add(x: number, y: number, kind: Particle["kind"], palette: string[], speed: number, life: number) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * 60;
    this.items.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - (kind === "scrap" ? 160 : kind === "smoke" ? 40 : 0),
      life,
      age: 0,
      size: kind === "scrap" ? 4 + Math.random() * 9 : kind === "smoke" ? 18 + Math.random() * 26 : 1.5 + Math.random() * 2.5,
      color: palette[Math.floor(Math.random() * palette.length)],
      kind,
      spin: (Math.random() - 0.5) * 18,
      angle: Math.random() * Math.PI,
    });
  }

  private start() {
    if (this.frame) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const { ctx } = this;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.items = this.items.filter((p) => (p.age += dt) < p.life);
    for (const p of this.items) {
      const t = p.age / p.life;
      if (p.kind === "ring") {
        ctx.globalAlpha = (1 - t) * 0.9;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 + 8 * (1 - t);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.3 + t), 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }
      const drag = p.kind === "smoke" ? 0.9 : p.kind === "scrap" ? 0.985 : 0.94;
      p.vx *= drag;
      p.vy = p.vy * drag + (p.kind === "scrap" ? 620 : p.kind === "spark" ? 260 : -30) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.spin * dt;

      if (p.kind === "spark") {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
        ctx.stroke();
      } else if (p.kind === "scrap") {
        ctx.globalAlpha = Math.min(1, (1 - t) * 1.6);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(1, Math.cos(p.angle * 1.7));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        ctx.restore();
      } else {
        ctx.globalAlpha = (1 - t) * 0.5;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.6 + t * 1.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (this.items.length) this.frame = requestAnimationFrame(this.tick);
    else {
      this.frame = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };
}

/* ----------------------------------------------------------------- shards -- */

/**
 * Breaks a copy of the element into jagged shards that fly away from the
 * point of impact. Resolves when the last shard is gone.
 */
export function shatter(element: HTMLElement, hitX: number, hitY: number): Promise<void> {
  const rect = element.getBoundingClientRect();
  const cols = 3;
  const rows = 4;
  // Jittered grid points, shared between neighbouring shards so the pieces tile.
  const px = (c: number, r: number) => {
    const edge = c === 0 || c === cols || r === 0 || r === rows;
    const jx = edge ? 0 : (Math.sin(c * 12.9 + r * 78.2) * 0.5) * (100 / cols) * 0.7;
    const jy = edge ? 0 : (Math.cos(c * 39.3 + r * 11.7) * 0.5) * (100 / rows) * 0.7;
    return [(c / cols) * 100 + jx, (r / rows) * 100 + jy];
  };

  const animations: Promise<unknown>[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const corners = [px(c, r), px(c + 1, r), px(c + 1, r + 1), px(c, r + 1)];
      const clip = `polygon(${corners.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
      const shard = element.cloneNode(true) as HTMLElement;
      shard.classList.add("sg-shard");
      shard.removeAttribute("id");
      Object.assign(shard.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        clipPath: clip,
      });
      document.body.appendChild(shard);

      const cx = rect.left + (((c + 0.5) / cols) * rect.width);
      const cy = rect.top + (((r + 0.5) / rows) * rect.height);
      const dx = cx - hitX;
      const dy = cy - hitY;
      const distance = Math.hypot(dx, dy) || 1;
      const push = 220 + Math.random() * 260;
      const tx = (dx / distance) * push + (Math.random() - 0.5) * 120;
      const ty = (dy / distance) * push - 120 - Math.random() * 160;
      const spin = (Math.random() - 0.5) * 140;

      const animation = shard.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1, filter: "brightness(1.6)" },
          { transform: `translate(${tx * 0.55}px, ${ty * 0.6}px) rotate(${spin * 0.5}deg)`, opacity: 1, filter: "brightness(1)", offset: 0.35 },
          { transform: `translate(${tx * 0.85}px, ${ty + 260}px) rotate(${spin * 0.8}deg) scale(0.94)`, opacity: 1, offset: 0.75 },
          { transform: `translate(${tx}px, ${ty + 520}px) rotate(${spin}deg) scale(0.86)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 300, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)", fill: "forwards" },
      );
      animations.push(animation.finished.catch(() => undefined).then(() => shard.remove()));
    }
  }
  return Promise.all(animations).then(() => undefined);
}

/** Shakes an element once. */
export function shake(element: HTMLElement) {
  element.classList.remove("sg-shake");
  void element.offsetWidth;
  element.classList.add("sg-shake");
  element.addEventListener("animationend", () => element.classList.remove("sg-shake"), { once: true });
}

/** Floating text where something happened: "+1", "Double blast". */
export function pop(text: string, x: number, y: number, combo = false) {
  const el = document.createElement("p");
  el.className = combo ? "sg-pop sg-pop--combo" : "sg-pop";
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
  window.setTimeout(() => el.remove(), 1500);
}

/* ------------------------------------------------------------------ sound -- */

let audio: AudioContext | null = null;

function context() {
  if (!audio) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audio = new Ctor();
  }
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

function noise(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

/** A short laser-ish shot. */
export function playShot() {
  const ctx = context();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1400, t);
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.14);

  const crack = noise(ctx, 0.06);
  const crackGain = ctx.createGain();
  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 2400;
  crackGain.gain.setValueAtTime(0.12, t);
  crackGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  crack.connect(high).connect(crackGain).connect(ctx.destination);
  crack.start(t);
}

/** A deep blast with a falling rumble. */
export function playBoom(big = false) {
  const ctx = context();
  if (!ctx) return;
  const t = ctx.currentTime;
  const length = big ? 1.4 : 0.9;

  const burst = noise(ctx, length);
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.setValueAtTime(2600, t);
  low.frequency.exponentialRampToValueAtTime(70, t + length);
  const burstGain = ctx.createGain();
  burstGain.gain.setValueAtTime(0.0001, t);
  burstGain.gain.exponentialRampToValueAtTime(big ? 0.75 : 0.55, t + 0.012);
  burstGain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  burst.connect(low).connect(burstGain).connect(ctx.destination);
  burst.start(t);

  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(150, t);
  thump.frequency.exponentialRampToValueAtTime(38, t + 0.4);
  thumpGain.gain.setValueAtTime(0.7, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  thump.connect(thumpGain).connect(ctx.destination);
  thump.start(t);
  thump.stop(t + 0.52);
}
