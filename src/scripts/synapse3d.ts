// WebGL rendition of img/bones.png: two wireframe nerve terminals meeting at a
// synaptic cleft, with vesicles drifting across the gap.
//
// The geometry is measured from the source image (silhouette traced along the
// 27° synapse axis, stroke crossings counted for mesh density), in units of the
// left bouton's radius (≈175 px in the 1563 px source):
// - each terminal has its own outline: a fibre that flares into a bulb, widest
//   just behind a flat synaptic face with a tight rounded rim;
// - the right terminal is a point mirror of the left (smaller, blunter);
// - longitudinal lines keep a roughly constant spacing, so extra lines branch
//   off as the surface widens and merge back before the face;
// - rings are dense over the bulb and spread out towards the fibre ends;
// - strokes are solid, uniform and drawn once per pixel (stencil), screen-
//   blended at ~60% like the illustration on the landing page.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

const TAU = Math.PI * 2;
const AXIS_ANGLE = THREE.MathUtils.degToRad(27);
const GAP = 0.3; // between the two flat faces
const STROKE = 0.02; // stroke width, world units (≈3.5 px in the source)
const STROKE_HEAVY = 0.027;
const INK = 0.62; // stroke intensity, as the landing page shows the PNG at 60%
const INK_RGB = [0.909, 0.914, 0.929]; // #e8e9ed, the source stroke colour

// Outlines as (x along the axis, radius); the face sits at x = 0.
const PROFILE_A: [number, number][] = [
  [-4.6, 0.36],
  [-4.0, 0.38],
  [-3.2, 0.405],
  [-2.64, 0.383],
  [-2.18, 0.363],
  [-1.95, 0.389],
  [-1.73, 0.44],
  [-1.5, 0.569],
  [-1.27, 0.749],
  [-1.04, 0.903],
  [-0.81, 0.974],
  [-0.58, 0.997],
  [-0.37, 0.96],
  [-0.23, 0.894],
  [-0.13, 0.8],
  [-0.055, 0.68],
  [-0.014, 0.53],
  [0, 0.36],
  [0.004, 0.18],
  [0.005, 0],
];

const PROFILE_B: [number, number][] = [
  [-4.6, 0.36],
  [-3.35, 0.36],
  [-2.2, 0.35],
  [-1.63, 0.343],
  [-1.406, 0.374],
  [-1.291, 0.414],
  [-1.177, 0.471],
  [-1.063, 0.566],
  [-0.949, 0.649],
  [-0.834, 0.717],
  [-0.72, 0.769],
  [-0.606, 0.797],
  [-0.491, 0.811],
  [-0.377, 0.811],
  [-0.263, 0.806],
  [-0.149, 0.774],
  [-0.07, 0.7],
  [-0.02, 0.58],
  [0, 0.42],
  [0.004, 0.2],
  [0.005, 0],
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const angleDelta = (a: number, b: number) => ((((a - b + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

// Smooth pseudo-noise in roughly [-1, 1]: three detuned sines.
type Wave = (t: number) => number;
function makeWave(rand: () => number, freq: number): Wave {
  const f = [1, 2.3, 5.1].map((k) => freq * k * (0.8 + rand() * 0.4));
  const p = f.map(() => rand() * TAU);
  return (t) => (0.6 * Math.sin(f[0] * t + p[0]) + 0.3 * Math.sin(f[1] * t + p[1]) + 0.15 * Math.sin(f[2] * t + p[2])) / 1.05;
}

// Same, but periodic in theta so closed rings never jump at the seam.
function makeRingWave(rand: () => number): Wave {
  const k = [2, 3, 5];
  const p = k.map(() => rand() * TAU);
  return (th) => (0.6 * Math.sin(k[0] * th + p[0]) + 0.3 * Math.sin(k[1] * th + p[1]) + 0.15 * Math.sin(k[2] * th + p[2])) / 1.05;
}

// Stroke colour for a given fade, computed in sRGB so screen blending matches CSS.
function inkColor(fade: number, out: THREE.Color) {
  const k = INK * fade;
  return out.setRGB(INK_RGB[0] * k, INK_RGB[1] * k, INK_RGB[2] * k, THREE.SRGBColorSpace);
}

// ---------------------------------------------------------------------------
// Outline sampled at equal arclength.

class Profile {
  readonly n = 3000;
  readonly x: Float32Array;
  readonly r: Float32Array;
  readonly length: number;
  private readonly tipStart: number;

  constructor(points: [number, number][]) {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, r]) => new THREE.Vector3(x, r, 0)),
      false,
      "centripetal",
    );
    const pts = curve.getSpacedPoints(this.n);
    this.x = new Float32Array(this.n + 1);
    this.r = new Float32Array(this.n + 1);
    let maxR = 0;
    let tipStart = 0;
    pts.forEach((p, i) => {
      this.x[i] = p.x;
      this.r[i] = Math.max(0, p.y);
      if (this.r[i] > maxR) {
        maxR = this.r[i];
        tipStart = i;
      }
    });
    this.length = curve.getLength();
    this.tipStart = tipStart;
  }

  sample(s: number) {
    const f = Math.min(this.n, Math.max(0, (s / this.length) * this.n));
    const i = Math.min(this.n - 1, Math.floor(f));
    const t = f - i;
    return {
      x: this.x[i] + (this.x[i + 1] - this.x[i]) * t,
      r: this.r[i] + (this.r[i + 1] - this.r[i]) * t,
    };
  }

  private s(i: number) {
    return (i / this.n) * this.length;
  }

  // Arclength where x first reaches x0.
  sAtX(x0: number) {
    for (let i = 0; i <= this.n; i++) if (this.x[i] >= x0) return this.s(i);
    return this.length;
  }

  // Arclength near the tip where the radius drops below minR.
  tipS(minR: number) {
    for (let i = this.n; i >= 0; i--) if (this.r[i] >= minR) return this.s(i);
    return this.length;
  }

  // First and last arclength where the radius exceeds thr.
  rangeAbove(thr: number): [number, number] | null {
    let a = -1;
    let b = -1;
    for (let i = 0; i <= this.n; i++) {
      if (this.r[i] > thr) {
        if (a < 0) a = i;
        b = i;
      }
    }
    return a < 0 ? null : [this.s(a), this.s(b)];
  }

  // x of the face side of the outline at radius rho.
  faceX(rho: number) {
    for (let i = this.n; i >= this.tipStart; i--) if (this.r[i] >= rho) return this.x[i];
    return this.x[this.tipStart];
  }
}

// ---------------------------------------------------------------------------
// A terminal: outline plus the few asymmetries measured from the source.

type Terminal = {
  seed: number;
  profile: Profile;
  neckX: number; // narrowest point of the fibre before the flare
  sag: number; // how far the bulb sits below the fibre's axis
  asym: number; // fuller lower rim at the face (upper, once mirrored)
  lump: number;
  phase: number[];
};

function makeTerminal(seed: number, points: [number, number][], neckX: number, sag: number, asym: number): Terminal {
  const rand = mulberry32(seed + 500);
  return {
    seed,
    profile: new Profile(points),
    neckX,
    sag,
    asym,
    lump: 0.025 + rand() * 0.015,
    phase: Array.from({ length: 4 }, () => rand() * TAU),
  };
}

const axonness = (t: Terminal, x: number) => smoothstep(t.neckX + 0.4, t.neckX - 0.9, x);

function surfacePoint(t: Terminal, s: number, theta: number, out: THREE.Vector3, dr = 0, dx = 0) {
  const { x, r } = t.profile.sample(s);
  const hang = smoothstep(t.neckX, t.neckX + 1.1, x);
  const bulb = smoothstep(t.neckX + 0.3, t.neckX + 1.2, x) * smoothstep(0.02, -0.35, x);
  const face = smoothstep(-0.22, 0, x);
  const far = smoothstep(-3.0, -4.6, x);
  const c = Math.cos(theta);
  const sn = Math.sin(theta);
  const lumps = bulb * t.lump * (0.6 * Math.sin(2 * theta + t.phase[0] + 2.3 * x) + 0.4 * Math.sin(3 * theta + t.phase[1] - 1.7 * x));
  const k = 1 + dr + lumps;
  // c < 0 is the underside: fuller towards the face, as measured.
  const ry = r * k * (1 - face * t.asym * c) * (1 + 0.1 * far);
  const rz = r * k * (1 + 0.25 * far);
  out.set(x + dx, c * ry - t.sag * hang, sn * rz);
  return x;
}

// ---------------------------------------------------------------------------
// Longitudinal lines. Base lines run the full length; branch lines split off a
// neighbour where the surface is wide enough and merge back into it before the
// face, so every stroke stays continuous.

const BASE_LINES = 26;
const BRANCH_TIERS = [0.5, 0.85]; // radius at which each extra tier appears

type LineDef = {
  theta: number;
  dr: Wave;
  dth: Wave;
  heavy: boolean;
  endX: number; // where the stroke has faded out along the fibre
  parent?: LineDef;
  range?: [number, number];
};

function makeLines(t: Terminal): LineDef[] {
  const rand = mulberry32(t.seed);
  const newLine = (theta: number, parent?: LineDef, range?: [number, number]): LineDef => ({
    theta,
    dr: makeWave(rand, 2.2),
    dth: makeWave(rand, 1.8),
    heavy: rand() < 0.25,
    endX: -4.35 + rand() * 0.5,
    parent,
    range,
  });

  // Ordered around the circumference so each tier can split the gaps.
  let ring: LineDef[] = Array.from({ length: BASE_LINES }, (_, m) =>
    newLine(((m + (rand() - 0.5) * 0.5) / BASE_LINES) * TAU),
  );
  const all = [...ring];
  for (const thr of BRANCH_TIERS) {
    const range = t.profile.rangeAbove(thr);
    if (!range) continue;
    const next: LineDef[] = [];
    ring.forEach((line, i) => {
      next.push(line);
      // Split roughly every other gap on the outer tier to keep spacing even.
      if (thr > BRANCH_TIERS[0] && i % 2 === 1) return;
      const nb = ring[(i + 1) % ring.length];
      const mid = line.theta + angleDelta(nb.theta, line.theta) * (0.4 + rand() * 0.2);
      const parent = rand() < 0.5 ? line : nb;
      const child = newLine(mid, parent, range);
      next.push(child);
      all.push(child);
    });
    ring = next;
  }
  return all;
}

// Smooth angular warp shared by all lines of a terminal: neighbours bend
// together, so cells vary in size and shape but lines never cross.
function warpTheta(t: Terminal, theta: number, x: number) {
  const amp = 0.045 + 0.03 * axonness(t, x);
  return amp * (0.6 * Math.sin(2 * theta + 1.9 * x + t.phase[2]) + 0.4 * Math.sin(3 * theta - 2.6 * x + t.phase[3]));
}

// Angle and radial wobble of a line at arclength s, blended into its parent
// at the ends of its range.
function lineAt(t: Terminal, line: LineDef, s: number): [number, number] {
  const { x } = t.profile.sample(s);
  const ax = axonness(t, x);
  let th = line.theta + warpTheta(t, line.theta, x) + line.dth(s) * (0.006 + 0.03 * ax);
  let dr = line.dr(s) * (0.005 + 0.03 * ax);
  if (line.parent && line.range) {
    const [s0, s1] = line.range;
    const blend = Math.min(0.35, (s1 - s0) / 2.2);
    const w = smoothstep(s0, s0 + blend, s) * smoothstep(s1, s1 - blend, s);
    const [pth, pdr] = lineAt(t, line.parent, s);
    th = pth + angleDelta(th, pth) * w;
    dr = pdr + (dr - pdr) * w;
  }
  return [th, dr];
}

// ---------------------------------------------------------------------------
// Wireframe geometry.

// Each stroke vertex also carries a draw progress in [0, ~1.1] (arclength from
// the far fibre end towards the face), which the intro reveals in order.
type Strokes = { positions: number[]; colors: number[]; draw: number[] };

function buildTerminalGeometry(t: Terminal) {
  const rand = mulberry32(t.seed + 1000);
  const fine: Strokes = { positions: [], colors: [], draw: [] };
  const heavy: Strokes = { positions: [], colors: [], draw: [] };
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const ca = new THREE.Color();
  const cb = new THREE.Color();

  const push = (out: Strokes, p: THREE.Vector3, q: THREE.Vector3, fp: number, fq: number, dp: number, dq: number) => {
    out.positions.push(p.x, p.y, p.z, q.x, q.y, q.z);
    out.draw.push(dp, dq);
    inkColor(fp, ca);
    inkColor(fq, cb);
    out.colors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
  };

  // Longitudinal lines, far fibre → over the face (base) or back into a parent.
  const sTip = t.profile.tipS(0.02);
  const step = 0.02;
  for (const line of makeLines(t)) {
    const target = line.heavy ? heavy : fine;
    const [s0, s1] = line.range ?? [0, sTip];
    // Deterministic stagger (no rand(): it would reshuffle the rings below).
    const lag = Math.sin(line.theta * 13.7 + t.seed) * 0.03;
    const fadeAt = (x: number) => smoothstep(line.endX, line.endX + 1.5, x);
    const point = (s: number, out: THREE.Vector3) => {
      const [th, dr] = lineAt(t, line, s);
      return surfacePoint(t, s, th, out, dr);
    };
    let xPrev = point(s0, a);
    let sPrev = s0;
    for (let s = s0 + step; s < s1 + step; s += step) {
      const sc = Math.min(s, s1);
      const x = point(sc, b);
      push(target, a, b, fadeAt(xPrev), fadeAt(x), sPrev / sTip + lag, sc / sTip + lag);
      a.copy(b);
      xPrev = x;
      sPrev = sc;
    }
  }

  // Rings: closed loops, dense over the bulb and the face, sparse along the fibre.
  const sStart = t.profile.sAtX(-4.3);
  const segs = 128;
  for (let s = t.profile.tipS(0.07); s > sStart; ) {
    const { x } = t.profile.sample(s);
    const ax = axonness(t, x);
    const onFace = smoothstep(-0.12, 0, x);
    const target = rand() < 0.22 ? heavy : fine;
    const wob = makeRingWave(rand);
    const drAmp = 0.006 + 0.035 * ax;
    // Tilt and sway along the axis, but never off the flat face.
    const tilt = (rand() - 0.5) * (0.035 + 0.18 * ax) * (1 - onFace);
    const tiltPhase = rand() * TAU;
    const sway = (rand() - 0.5) * 0.02 * (1 - onFace);
    const fade = smoothstep(-4.25, -2.8, x);

    const ringPoint = (th: number, out: THREE.Vector3) =>
      surfacePoint(t, s, th, out, wob(th) * drAmp, tilt * Math.cos(th + tiltPhase) + sway * Math.sin(5 * th));

    // Rings sweep round quickly as the drawing front passes.
    const d0 = s / sTip;
    ringPoint(0, a);
    for (let k = 1; k <= segs; k++) {
      ringPoint((k / segs) * TAU, b);
      push(target, a, b, fade, fade, d0 + ((k - 1) / segs) * 0.1, d0 + (k / segs) * 0.1);
      a.copy(b);
    }
    const spacing = 0.066 + 0.3 * smoothstep(t.neckX + 0.5, t.neckX - 1.0, x);
    s -= spacing * (1 + (rand() - 0.5) * (0.35 + 0.4 * ax));
  }

  const toGeometry = (st: Strokes) => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(st.positions);
    geo.setColors(st.colors);
    const draw = new THREE.InstancedInterleavedBuffer(new Float32Array(st.draw), 2, 1);
    geo.setAttribute("instanceDrawStart", new THREE.InterleavedBufferAttribute(draw, 1, 0));
    geo.setAttribute("instanceDrawEnd", new THREE.InterleavedBufferAttribute(draw, 1, 1));
    return geo;
  };
  return { fine: toGeometry(fine), heavy: toGeometry(heavy) };
}

// Invisible solid that only writes depth, so strokes on the far side of each
// terminal are hidden, as in the hand-drawn source. It sits slightly inside the
// wireframe (beyond the strokes' half-width and wobble) so front strokes never
// clip against it.
function buildOccluderGeometry(t: Terminal) {
  const sEnd = t.profile.tipS(0.001);
  const rows = 320;
  const cols = 96;
  const pos = new Float32Array((rows + 1) * (cols + 1) * 3);
  const p = new THREE.Vector3();
  for (let i = 0; i <= rows; i++) {
    const s = (i / rows) * sEnd;
    for (let j = 0; j <= cols; j++) {
      surfacePoint(t, s, (j / cols) * TAU, p);
      pos.set([p.x, p.y, p.z], (i * (cols + 1) + j) * 3);
    }
  }
  const index: number[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + cols + 1;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();

  const nrm = geo.getAttribute("normal") as THREE.BufferAttribute;
  const n = new THREE.Vector3();
  const out = new THREE.Vector3();
  for (let v = 0; v < nrm.count; v++) {
    p.fromArray(pos, v * 3);
    n.fromBufferAttribute(nrm, v);
    // Flip normals outwards, judged from a point just behind the (sagging) axis.
    out.set(0.5, p.y + t.sag * smoothstep(t.neckX, t.neckX + 1.1, p.x), p.z);
    if (n.dot(out) < 0) n.negate();
    const { r } = t.profile.sample((Math.floor(v / (cols + 1)) / rows) * sEnd);
    const inset = 0.036 + r * (0.015 + 0.05 * axonness(t, p.x));
    p.addScaledVector(n, -inset).toArray(pos, v * 3);
  }
  return geo;
}

// ---------------------------------------------------------------------------
// Shaders. Rendering straight to screen, so each converts to the output
// colour space itself.

const pointsVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (12.0 / -mv.z);
    vAlpha = aAlpha;
    vColor = aColor;
  }
`;

const pointsFragment = /* glsl */ `
  uniform float uFade;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha * uFade);
    #include <colorspace_fragment>
  }
`;

const dustVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.05 + 0.04 * fract(aPhase * 7.0)) + 7.0, 14.0) - 7.0;
    p.x += sin(uTime * 0.21 + aPhase * 6.2831) * 0.25;
    p.z += cos(uTime * 0.17 + aPhase * 4.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (12.0 / -mv.z);
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aPhase) + aPhase * 40.0);
    vAlpha = twinkle * smoothstep(7.0, 5.0, abs(p.y));
    vColor = aColor;
  }
`;

// Floaters: larger, softer motes drifting through the whole header, in front
// of and behind the synapse, wrapping within uBound.
const floaterVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uBound;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    float rise = 0.06 + 0.08 * fract(aPhase * 13.0);
    p.y = mod(p.y + uTime * rise + uBound.y, 2.0 * uBound.y) - uBound.y;
    p.x += sin(uTime * (0.09 + 0.06 * aPhase) + aPhase * 6.2831) * 0.6;
    p.x = mod(p.x + uBound.x, 2.0 * uBound.x) - uBound.x;
    p.z += cos(uTime * 0.11 + aPhase * 5.0) * 0.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (12.0 / -mv.z);
    float twinkle = 0.65 + 0.35 * sin(uTime * (0.5 + aPhase) + aPhase * 30.0);
    vAlpha = twinkle * smoothstep(uBound.y, uBound.y - 1.2, abs(p.y));
    vColor = aColor;
  }
`;

// Vesicles: camera-facing outlined circles with the same stroke as the mesh,
// slightly irregular like the hand-drawn ones; a few are small filled dots.
const vesicleVertex = /* glsl */ `
  attribute vec3 aOffset;
  attribute float aRadius;
  attribute float aAlpha;
  attribute float aPhase;
  attribute float aFill;
  uniform float uStroke;
  varying vec2 vLocal;
  varying float vRadius;
  varying float vAlpha;
  varying float vPhase;
  varying float vFill;
  void main() {
    float half_ = aRadius * 1.15 + uStroke;
    vec4 mv = modelViewMatrix * vec4(aOffset, 1.0);
    mv.xy += position.xy * half_;
    gl_Position = projectionMatrix * mv;
    vLocal = position.xy * half_;
    vRadius = aRadius;
    vAlpha = aAlpha;
    vPhase = aPhase;
    vFill = aFill;
  }
`;

const vesicleFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStroke;
  uniform float uFade;
  varying vec2 vLocal;
  varying float vRadius;
  varying float vAlpha;
  varying float vPhase;
  varying float vFill;
  void main() {
    float d = length(vLocal);
    float ang = atan(vLocal.y, vLocal.x);
    float r = vRadius * (1.0 + 0.04 * sin(3.0 * ang + vPhase) + 0.02 * sin(5.0 * ang + vPhase * 1.7));
    float aa = fwidth(d);
    float ring = 1.0 - smoothstep(uStroke * 0.5 - aa, uStroke * 0.5 + aa, abs(d - r));
    float dot_ = 1.0 - smoothstep(r - aa, r + aa, d);
    float a = mix(ring, dot_, vFill) * vAlpha * uFade;
    if (a < 0.02) discard;
    gl_FragColor = vec4(uColor, 1.0);
    #include <colorspace_fragment>
    gl_FragColor.rgb *= a;
  }
`;

// Strokes: screen blend (like the landing page's mix-blend-screen), and a
// stencil so each pixel is inked once — overlapping strokes and segment joints
// never build up into brighter dots.
const INK_BLEND = {
  transparent: true,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneMinusSrcColorFactor,
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.NotEqualStencilFunc,
  stencilZPass: THREE.ReplaceStencilOp,
} as const;

// Reveal strokes up to uReveal along their draw progress, with a brighter pen
// tip at the drawing front. Discarded fragments leave the stencil untouched.
function addReveal(mat: LineMaterial, uReveal: { value: number }) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = uReveal;
    shader.vertexShader = shader.vertexShader
      .replace(
        "attribute vec3 instanceColorEnd;",
        "attribute vec3 instanceColorEnd;\nattribute float instanceDrawStart;\nattribute float instanceDrawEnd;\nvarying float vDraw;",
      )
      .replace("void main() {", "void main() {\n\tvDraw = ( position.y < 0.5 ) ? instanceDrawStart : instanceDrawEnd;");
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform float uReveal;\nvarying float vDraw;\nvoid main() {")
      .replace(
        "gl_FragColor = vec4( diffuseColor.rgb, alpha );",
        `float reveal = smoothstep( uReveal, uReveal - 0.03, vDraw );
        if ( reveal <= 0.0 ) discard;
        float tip = smoothstep( 0.1, 0.0, uReveal - vDraw );
        gl_FragColor = vec4( diffuseColor.rgb * reveal * ( 1.0 + 0.9 * tip ), alpha );`,
      );
  };
}

// Soft radial falloff for the cleft glow sprites.
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.16)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// The landing page background (the hero's pink-to-blue radial under its
// neutral-dark veil, over the body gradient from app.css), painted at viewport
// size. Kept in sync with the CSS fallback in src/pages/3d.astro.
function paintBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rem = 16;
  let g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#104f79");
  g.addColorStop(0.58, "#0b3c5d");
  g.addColorStop(1, "#082f4a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(0.6 * w, 0.7 * h);
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, "rgba(46, 124, 199, 0.65)");
  g.addColorStop(0.55, "rgba(46, 124, 199, 0.18)");
  g.addColorStop(1, "rgba(46, 124, 199, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();

  const r = 26 * rem;
  g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
  g.addColorStop(0, "rgba(243, 143, 191, 0.42)");
  g.addColorStop(12 / 26, "rgba(243, 143, 191, 0.18)");
  g.addColorStop(1, "rgba(243, 143, 191, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(8, 47, 74, 0.5)");
  g.addColorStop(0.5, "rgba(8, 47, 74, 0.2)");
  g.addColorStop(1, "rgba(8, 47, 74, 0.85)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// ---------------------------------------------------------------------------

export type SynapseOptions = {
  onUnsupported?: () => void;
  motionButton?: HTMLButtonElement;
  // Sized to the canvas's own box and framed like the landing page PNG, on
  // black so the page can screen-blend it (mix-blend-mode: screen).
  embedded?: boolean;
  // Opening sequence: sideways tilt easing into place while the mesh draws
  // itself, then onTitle, then the particles fade in (onParticles).
  intro?: boolean;
  onTitle?: () => void;
  onParticles?: () => void;
  particleScale?: number;
  // Extra, larger motes floating across the whole view.
  floaters?: boolean;
};

// Intro timeline, in seconds.
const INTRO = {
  tilt: [0, 4.2],
  draw: [0.2, 3.2],
  glow: [1.6, 3.2],
  title: 2.5,
  particles: [3.1, 4.8],
} as const;
// Draw progress range swept by the intro; it ends past every stroke (rings add
// up to 0.1, lines lag up to 0.03) so no pen tip stays lit.
const REVEAL_FROM = 0.08;
const REVEAL_TO = 1.4;
const INTRO_YAW = 0.85;
const INTRO_PITCH = -0.14;
const INTRO_ROLL = 0.22;

const progress = (t: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (t - a) / (b - a)));

export function initSynapse(canvas: HTMLCanvasElement, opts: SynapseOptions = {}): () => void {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, stencil: true, powerPreference: "high-performance" });
  } catch {
    opts.onUnsupported?.();
    return () => {};
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intro = !!opts.intro && !reducedMotion;
  const embedded = !!opts.embedded;
  const particleScale = opts.particleScale ?? 1;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const listeners = new AbortController();
  const { signal } = listeners;

  const scene = new THREE.Scene();
  const bgCanvas = document.createElement("canvas");
  const bgTexture = new THREE.CanvasTexture(bgCanvas);
  bgTexture.colorSpace = THREE.SRGBColorSpace;
  scene.background = embedded ? new THREE.Color(0x000000) : bgTexture;

  // The fibre ends are faded out, so the visible drawing starts ~0.1 in.
  const reveal = { value: intro ? REVEAL_FROM : 2 };
  const particleFade = { value: intro ? 0 : 1 };

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  // Root: the synapse axis runs from upper left to lower right at 27°, seen
  // almost side-on so the faces read as bands, as in the source.
  const root = new THREE.Group();
  root.rotation.set(0.05, -0.1, -AXIS_ANGLE);
  scene.add(root);

  const lineOpts = { vertexColors: true, worldUnits: true, ...INK_BLEND };
  const fineMaterial = new LineMaterial({ ...lineOpts, linewidth: STROKE });
  const heavyMaterial = new LineMaterial({ ...lineOpts, linewidth: STROKE_HEAVY });
  addReveal(fineMaterial, reveal);
  addReveal(heavyMaterial, reveal);
  const occluderMat = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });

  // Left (presynaptic) and right (postsynaptic) terminals. The right one is
  // rotated half a turn about the view axis: a point mirror of the left.
  const termA = makeTerminal(11, PROFILE_A, -2.18, 0.09, 0.12);
  const termB = makeTerminal(23, PROFILE_B, -1.63, 0.023, 0.06);

  function addTerminal(t: Terminal, group: THREE.Group) {
    const { fine, heavy } = buildTerminalGeometry(t);
    const occluder = new THREE.Mesh(buildOccluderGeometry(t), occluderMat);
    occluder.renderOrder = -1;
    group.add(occluder, new LineSegments2(fine, fineMaterial), new LineSegments2(heavy, heavyMaterial));
    root.add(group);
  }

  const groupA = new THREE.Group();
  groupA.position.set(-GAP / 2, termA.sag, 0);
  addTerminal(termA, groupA);

  const groupB = new THREE.Group();
  groupB.position.set(GAP / 2, -termB.sag, 0);
  groupB.rotation.z = Math.PI;
  addTerminal(termB, groupB);

  // --- Vesicles in the cleft ---------------------------------------------
  const rand = mulberry32(42);
  const vesicleCount = 24;
  const vesicleGeo = new THREE.InstancedBufferGeometry();
  const quad = new THREE.PlaneGeometry(2, 2);
  vesicleGeo.index = quad.index;
  vesicleGeo.setAttribute("position", quad.getAttribute("position"));
  const vOffset = new Float32Array(vesicleCount * 3);
  const vRadius = new Float32Array(vesicleCount);
  const vAlpha = new Float32Array(vesicleCount);
  const vPhase = new Float32Array(vesicleCount);
  const vFill = new Float32Array(vesicleCount);
  vesicleGeo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(vOffset, 3).setUsage(THREE.DynamicDrawUsage));
  vesicleGeo.setAttribute("aRadius", new THREE.InstancedBufferAttribute(vRadius, 1));
  vesicleGeo.setAttribute("aAlpha", new THREE.InstancedBufferAttribute(vAlpha, 1).setUsage(THREE.DynamicDrawUsage));
  vesicleGeo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(vPhase, 1));
  vesicleGeo.setAttribute("aFill", new THREE.InstancedBufferAttribute(vFill, 1));
  vesicleGeo.instanceCount = vesicleCount;
  for (let i = 0; i < vesicleCount; i++) {
    const filled = i < 3;
    vFill[i] = filled ? 1 : 0;
    vRadius[i] = filled ? 0.01 + rand() * 0.007 : 0.026 + rand() * 0.046;
    vPhase[i] = rand() * TAU;
    vAlpha[i] = 1;
  }
  const vesicleMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: inkColor(1, new THREE.Color()) },
      uStroke: { value: STROKE * 0.75 },
      uFade: particleFade,
    },
    vertexShader: vesicleVertex,
    fragmentShader: vesicleFragment,
    ...INK_BLEND,
  });
  const vesicles = new THREE.Mesh(vesicleGeo, vesicleMat);
  vesicles.frustumCulled = false;
  root.add(vesicles);

  // x of a terminal's face at a point in its local frame (y measured from the
  // fibre's axis), including the fuller rim on one side.
  function faceSurfaceX(t: Terminal, y: number, z: number) {
    const yr = y + t.sag;
    const rho = Math.hypot(yr, z);
    const rhoEff = rho / (1 - (t.asym * yr) / Math.max(rho, 1e-3));
    return t.profile.faceX(Math.min(0.95, rhoEff));
  }

  // Vesicles sit at non-overlapping homes across the cleft (as in the source)
  // and drift gently around them. p is the position across the gap (0 at the
  // left face, 1 at the right), y along it; homes are laid out by rejection
  // sampling in approximate world units.
  type Vesicle = { p: number; y: number; z: number; phase: number; speed: number };
  const homes: Vesicle[] = [];
  const order = Array.from({ length: vesicleCount }, (_, i) => i).sort((i, j) => vRadius[j] - vRadius[i]);
  for (const i of order) {
    let best: Vesicle | null = null;
    for (let attempt = 0; attempt < 400 && !best; attempt++) {
      const cand = { p: rand(), y: -0.66 + rand() * 1.32, z: -0.3 + rand() * 0.6, phase: rand() * TAU, speed: 0.25 + rand() * 0.35 };
      const ok = homes.every((h, k) => {
        if (!h) return true;
        const dx = (cand.p - h.p) * 0.22;
        return Math.hypot(dx, cand.y - h.y) > vRadius[i] + vRadius[k] + 0.03;
      });
      if (ok) best = cand;
    }
    homes[i] = best ?? { p: rand(), y: -0.66 + rand() * 1.32, z: 0, phase: rand() * TAU, speed: 0.3 };
  }

  function updateVesicles(_dt: number, t: number) {
    homes.forEach((v, i) => {
      const wy = v.y + Math.sin(t * v.speed * 0.6 + v.phase) * 0.03;
      const wz = v.z + Math.cos(t * v.speed * 0.5 + v.phase) * 0.03;
      const p = Math.min(1, Math.max(0, v.p + Math.sin(t * v.speed + v.phase * 1.3) * 0.12));
      const margin = vRadius[i] + STROKE;
      const ax = -GAP / 2 + faceSurfaceX(termA, wy - termA.sag, wz) + margin;
      const bx = GAP / 2 - faceSurfaceX(termB, -termB.sag - wy, wz) - margin;
      vOffset[i * 3] = bx > ax ? ax + (bx - ax) * p : (ax + bx) / 2;
      vOffset[i * 3 + 1] = wy;
      vOffset[i * 3 + 2] = wz;
    });
    vesicleGeo.getAttribute("aOffset").needsUpdate = true;
  }

  // --- Cleft glow -------------------------------------------------------
  // Additive sprites at the cleft, drawn behind the strokes and seen through
  // the mesh: a wide soft halo and a brighter core stretched along the gap.
  // They breathe, and flare briefly on each release.
  const glowTex = glowTexture();
  const makeGlow = (color: string, sx: number, sy: number) => {
    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      color: new THREE.Color(color),
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      rotation: -AXIS_ANGLE,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(sx, sy, 1);
    sprite.renderOrder = -0.5;
    scene.add(sprite);
    return mat;
  };
  const haloGlow = makeGlow("#F38FBF", 5.2, 4.4);
  const coreGlow = makeGlow("#F38FBF", 1.0, 2.8);

  // --- Neurotransmitter specks -------------------------------------------
  // Tiny glowing points released from the presynaptic face that diffuse
  // across the cleft to the postsynaptic one; bursts accompany each release.
  const speckCount = 260;
  const speckGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(speckCount * 3);
  const sAlpha = new Float32Array(speckCount);
  const sSize = new Float32Array(speckCount);
  const sCol = new Float32Array(speckCount * 3);
  const speckColors = ["#F38FBF", "#f8acd0", "#ffffff"].map((h) => new THREE.Color(h));
  for (let i = 0; i < speckCount; i++) {
    sSize[i] = (2.2 + rand() ** 2 * 3.2) * particleScale;
    const c = speckColors[Math.floor(rand() * speckColors.length)];
    sCol.set([c.r, c.g, c.b], i * 3);
  }
  speckGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3).setUsage(THREE.DynamicDrawUsage));
  speckGeo.setAttribute("aAlpha", new THREE.BufferAttribute(sAlpha, 1).setUsage(THREE.DynamicDrawUsage));
  speckGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
  speckGeo.setAttribute("aColor", new THREE.BufferAttribute(sCol, 3));
  const speckMat = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: pixelRatio }, uFade: particleFade },
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const specks = new THREE.Points(speckGeo, speckMat);
  specks.frustumCulled = false;
  root.add(specks);

  type Speck = { y: number; z: number; vy: number; vz: number; p: number; speed: number; wait: number };
  const releaseSpeck = (sp: Speck) => {
    // Mostly from the face itself, some from around its rim.
    const rho = Math.sqrt(rand()) * (rand() < 0.8 ? 0.7 : 1.05);
    const a = rand() * TAU;
    sp.y = Math.cos(a) * rho;
    sp.z = Math.sin(a) * rho * 0.7;
    sp.vy = (rand() - 0.5) * 0.15;
    sp.vz = (rand() - 0.5) * 0.1;
    sp.p = 0;
    sp.speed = 0.18 + rand() * 0.3;
  };
  const speckState: Speck[] = Array.from({ length: speckCount }, () => {
    const sp = { y: 0, z: 0, vy: 0, vz: 0, p: 0, speed: 0, wait: 0 };
    releaseSpeck(sp);
    sp.p = rand();
    sp.wait = rand() < 0.55 ? 0 : 1e9; // the rest wait for a release burst
    return sp;
  });

  let pulse = 0;
  let nextRelease = 1.5;
  function release() {
    pulse = 1;
    let n = 0;
    for (const sp of speckState) {
      if (sp.wait > 0 && n < 70) {
        releaseSpeck(sp);
        sp.wait = 0;
        n++;
      }
    }
  }

  function updateSpecks(dt: number) {
    const pos = speckGeo.getAttribute("position") as THREE.BufferAttribute;
    const alpha = speckGeo.getAttribute("aAlpha") as THREE.BufferAttribute;
    speckState.forEach((sp, i) => {
      if (sp.wait > 0) {
        alpha.setX(i, 0);
        return;
      }
      sp.p += sp.speed * dt;
      // Diffusion: a damped random walk along the cleft.
      sp.vy += (rand() - 0.5) * dt * 0.9 - sp.vy * dt * 0.8;
      sp.vz += (rand() - 0.5) * dt * 0.6 - sp.vz * dt * 0.8;
      sp.y += sp.vy * dt;
      sp.z += sp.vz * dt;
      if (sp.p >= 1) {
        releaseSpeck(sp);
        // Keep a steady trickle; burst specks go back to waiting.
        sp.wait = i % 2 === 0 ? 0 : 1e9;
      }
      const ax = -GAP / 2 + faceSurfaceX(termA, sp.y - termA.sag, sp.z) + 0.02;
      const bx = GAP / 2 - faceSurfaceX(termB, -termB.sag - sp.y, sp.z) - 0.02;
      pos.setXYZ(i, ax + (bx - ax) * sp.p, sp.y, sp.z);
      alpha.setX(i, 0.9 * smoothstep(0, 0.15, sp.p) * smoothstep(1, 0.8, sp.p));
    });
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
  }

  // --- Ambient dust -----------------------------------------------------
  const dustCount = 320;
  const dustGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(dustCount * 3);
  const dSize = new Float32Array(dustCount);
  const dPhase = new Float32Array(dustCount);
  const dCol = new Float32Array(dustCount * 3);
  const dustColors = ["#52a9ec", "#eef4f8", "#F38FBF"].map((h) => new THREE.Color(h));
  for (let i = 0; i < dustCount; i++) {
    dPos.set([(rand() - 0.5) * 26, (rand() - 0.5) * 14, (rand() - 0.5) * 12 - 1], i * 3);
    dSize[i] = (0.6 + rand() ** 3 * 2.2) * particleScale;
    dPhase[i] = rand();
    const c = dustColors[Math.floor(rand() * dustColors.length)].clone().multiplyScalar(0.2 + rand() * 0.25);
    dCol.set([c.r, c.g, c.b], i * 3);
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  dustGeo.setAttribute("aSize", new THREE.BufferAttribute(dSize, 1));
  dustGeo.setAttribute("aPhase", new THREE.BufferAttribute(dPhase, 1));
  dustGeo.setAttribute("aColor", new THREE.BufferAttribute(dCol, 3));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uFade: particleFade },
    vertexShader: dustVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  // --- Floaters ---------------------------------------------------------
  // Own seed, so enabling them leaves every other layer's layout unchanged.
  let floaterMat: THREE.ShaderMaterial | null = null;
  if (opts.floaters) {
    const frand = mulberry32(7);
    const count = 90;
    const fGeo = new THREE.BufferGeometry();
    const fPos = new Float32Array(count * 3);
    const fSize = new Float32Array(count);
    const fPhase = new Float32Array(count);
    const fCol = new Float32Array(count * 3);
    const floaterColors = ["#F38FBF", "#f8acd0", "#52a9ec", "#eef4f8"].map((h) => new THREE.Color(h));
    for (let i = 0; i < count; i++) {
      fPos.set([(frand() - 0.5) * 20, (frand() - 0.5) * 11, -3 + frand() * 8], i * 3);
      fSize[i] = (1.6 + frand() ** 2 * 5) * particleScale;
      fPhase[i] = frand();
      const c = floaterColors[Math.floor(frand() * floaterColors.length)].clone().multiplyScalar(0.3 + frand() * 0.4);
      fCol.set([c.r, c.g, c.b], i * 3);
    }
    fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
    fGeo.setAttribute("aSize", new THREE.BufferAttribute(fSize, 1));
    fGeo.setAttribute("aPhase", new THREE.BufferAttribute(fPhase, 1));
    fGeo.setAttribute("aColor", new THREE.BufferAttribute(fCol, 3));
    floaterMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uFade: particleFade,
        uBound: { value: new THREE.Vector2(10, 5.5) },
      },
      vertexShader: floaterVertex,
      fragmentShader: pointsFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const floaters = new THREE.Points(fGeo, floaterMat);
    floaters.frustumCulled = false;
    scene.add(floaters);
  }

  let distance = 14;
  function resize() {
    const w = embedded ? canvas.clientWidth : window.innerWidth;
    const h = embedded ? canvas.clientHeight : window.innerHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w, h, false);
    if (!embedded) {
      bgCanvas.width = w;
      bgCanvas.height = h;
      paintBackground(bgCanvas.getContext("2d")!, w, h);
      bgTexture.needsUpdate = true;
    }
    for (const m of [fineMaterial, heavyMaterial]) m.resolution.set(w * pixelRatio, h * pixelRatio);
    camera.aspect = w / h;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (embedded) {
      // Match the hero's PNG: 8.9 units across its box, which is capped by the
      // Tailwind max-widths and shown at 2x below the sm breakpoint.
      const illoW = w < 640 ? 2 * w : Math.min(w - 16, w >= 1280 ? 1280 : w >= 1024 ? 1152 : 1024);
      distance = (8.9 * (w / illoW)) / 2 / (tanHalf * camera.aspect);
    } else {
      // Landscape frames it like the source (fibres fading out near the edges);
      // portrait keeps both boutons and the cleft in view.
      const wantW = camera.aspect >= 1 ? 8.9 : 5.4;
      distance = Math.max(wantW / 2 / (tanHalf * camera.aspect), 4.6 / 2 / tanHalf);
    }
    if (floaterMat) {
      // Cover the view at the synapse plane, with some margin for the drift.
      const halfH = distance * tanHalf;
      floaterMat.uniforms.uBound.value.set(halfH * camera.aspect * 1.25, halfH * 1.2);
    }
    camera.updateProjectionMatrix();
    if (reducedMotion) render(0, 0);
  }

  // --- Tilt: pointer on desktop, device orientation on mobile -----------
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let usingOrientation = false;

  window.addEventListener(
    "pointermove",
    (e) => {
      if (usingOrientation || e.pointerType === "touch") return;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { signal },
  );
  document.documentElement.addEventListener(
    "pointerleave",
    () => {
      if (!usingOrientation) target.x = target.y = 0;
    },
    { signal },
  );

  let baseline: { beta: number; gamma: number } | null = null;
  function onOrientation(e: DeviceOrientationEvent) {
    if (e.beta == null || e.gamma == null) return;
    usingOrientation = true;
    const angle = (screen.orientation?.angle ?? 0) % 360;
    let x = e.gamma;
    let y = e.beta;
    if (angle === 90) [x, y] = [e.beta, -e.gamma];
    else if (angle === 270 || angle === -90) [x, y] = [-e.beta, e.gamma];
    if (!baseline) baseline = { beta: y, gamma: x };
    // Let the resting pose follow slowly so holding the phone differently re-centres.
    baseline.beta += (y - baseline.beta) * 0.01;
    baseline.gamma += (x - baseline.gamma) * 0.01;
    target.x = THREE.MathUtils.clamp((x - baseline.gamma) / 20, -1, 1);
    target.y = THREE.MathUtils.clamp((y - baseline.beta) / 20, -1, 1);
  }

  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
  if (!reducedMotion && DOE) {
    if (typeof DOE.requestPermission === "function") {
      // iOS: permission must be requested from a user gesture.
      const btn = opts.motionButton;
      if (btn && matchMedia("(pointer: coarse)").matches) {
        btn.hidden = false;
        btn.addEventListener(
          "click",
          async () => {
            btn.hidden = true;
            try {
              if ((await DOE.requestPermission!()) === "granted") window.addEventListener("deviceorientation", onOrientation, { signal });
            } catch {
              /* denied: keep the idle sway */
            }
          },
          { once: true, signal },
        );
      }
    } else {
      window.addEventListener("deviceorientation", onOrientation, { signal });
    }
  }

  // --- Render loop ----------------------------------------------------
  if (intro) nextRelease = INTRO.particles[0] + 0.3;
  let titleShown = false;
  let particlesShown = false;
  function runIntro(t: number) {
    if (!titleShown && (!intro || t >= INTRO.title)) {
      titleShown = true;
      opts.onTitle?.();
    }
    if (!particlesShown && (!intro || t >= INTRO.particles[0])) {
      particlesShown = true;
      opts.onParticles?.();
    }
    if (!intro) return { glow: 1, yaw: 0, pitch: 0, roll: 0 };
    reveal.value = REVEAL_FROM + (REVEAL_TO - REVEAL_FROM) * easeInOutCubic(progress(t, INTRO.draw));
    particleFade.value = smoothstep(0, 1, progress(t, INTRO.particles));
    const away = 1 - easeInOutCubic(progress(t, INTRO.tilt));
    return {
      glow: smoothstep(0, 1, progress(t, INTRO.glow)),
      yaw: INTRO_YAW * away,
      pitch: INTRO_PITCH * away,
      roll: INTRO_ROLL * away,
    };
  }

  function render(t: number, dt: number) {
    const introState = runIntro(t);
    updateVesicles(dt, t);
    if (!reducedMotion && t > nextRelease) {
      release();
      nextRelease = t + 2.5 + rand() * 3;
    }
    updateSpecks(dt);
    pulse *= Math.exp(-dt * 1.6);
    const breathe = reducedMotion ? 0 : 0.5 + 0.5 * Math.sin(t * 0.7);
    haloGlow.opacity = (0.15 + 0.04 * breathe + 0.06 * pulse) * introState.glow;
    coreGlow.opacity = (0.16 + 0.05 * breathe + 0.14 * pulse) * introState.glow;
    dustMat.uniforms.uTime.value = t;
    if (floaterMat) floaterMat.uniforms.uTime.value = t;

    const ease = 1 - Math.exp(-dt * 3.5);
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    const idleX = reducedMotion ? 0 : Math.sin(t * 0.13) * 0.12;
    const idleY = reducedMotion ? 0 : Math.sin(t * 0.09 + 1) * 0.08;
    const yaw = (current.x + idleX) * 0.16 + introState.yaw;
    const pitch = (current.y + idleY) * 0.11 + introState.pitch;
    camera.position.set(Math.sin(yaw) * distance, Math.sin(pitch) * distance, Math.cos(yaw) * Math.cos(pitch) * distance);
    camera.lookAt(0, 0, 0);
    camera.rotateZ(introState.roll);

    renderer.render(scene, camera);
  }

  const observers: { disconnect(): void }[] = [];
  if (embedded) {
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    observers.push(ro);
  } else {
    window.addEventListener("resize", resize, { signal });
  }
  resize();

  const dispose = () => {
    listeners.abort();
    observers.forEach((o) => o.disconnect());
    renderer.setAnimationLoop(null);
    renderer.dispose();
  };

  if (reducedMotion) {
    render(0, 0);
    return dispose;
  }

  const clock = new THREE.Timer();
  const loop = (now: number) => {
    clock.update(now);
    render(clock.getElapsed(), Math.min(clock.getDelta(), 0.05));
  };
  renderer.setAnimationLoop(loop);
  if (embedded) {
    // Pause while scrolled out of view; the clock skips the time spent away.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) clock.reset();
      renderer.setAnimationLoop(entry.isIntersecting ? loop : null);
    });
    io.observe(canvas);
    observers.push(io);
  }
  return dispose;
}
