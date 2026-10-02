import { memo, useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import {
  Accessibility,
  Armchair,
  ArrowUp,
  BookOpen,
  Calendar,
  Camera,
  CameraOff,
  Clock,
  Coffee,
  CreditCard,
  CupSoda,
  DoorClosed,
  DoorOpen,
  Frame,
  GlassWater,
  GraduationCap,
  HandCoins,
  Handshake,
  Heart,
  IdCardLanyard,
  Image as ImageIcon,
  Info,
  Leaf,
  Lock,
  Luggage,
  Map as MapIcon,
  MessageCircle,
  Mic,
  Moon,
  Music,
  Palette,
  PencilLine,
  PersonStanding,
  Podcast,
  Presentation,
  QrCode,
  Recycle,
  Search,
  Shirt,
  Sofa,
  Store,
  Ticket,
  Timer,
  Toilet,
  Trash2,
  Users,
  UtensilsCrossed,
  VolumeOff,
  Waves,
  Wifi,
  Wind,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { encode } from "uqr";
import { withBase } from "../../lib/withBase";
import { SIGN_CATEGORIES, type Sign, type SignArrow, type SignArt, type SignIcon } from "../../data/signage";

export const ICONS: Record<SignIcon, LucideIcon> = {
  info: Info,
  ticket: Ticket,
  badge: IdCardLanyard,
  luggage: Luggage,
  message: MessageCircle,
  presentation: Presentation,
  sofa: Sofa,
  armchair: Armchair,
  utensils: UtensilsCrossed,
  coffee: Coffee,
  water: GlassWater,
  wine: Wine,
  toilet: Toilet,
  shirt: Shirt,
  accessibility: Accessibility,
  "door-open": DoorOpen,
  "door-closed": DoorClosed,
  lock: Lock,
  frame: Frame,
  palette: Palette,
  image: ImageIcon,
  book: BookOpen,
  store: Store,
  graduation: GraduationCap,
  waves: Waves,
  wind: Wind,
  person: PersonStanding,
  music: Music,
  users: Users,
  handshake: Handshake,
  heart: Heart,
  moon: Moon,
  camera: Camera,
  "camera-off": CameraOff,
  mic: Mic,
  podcast: Podcast,
  "volume-off": VolumeOff,
  wifi: Wifi,
  qr: QrCode,
  calendar: Calendar,
  map: MapIcon,
  clock: Clock,
  timer: Timer,
  recycle: Recycle,
  trash: Trash2,
  cup: CupSoda,
  leaf: Leaf,
  card: CreditCard,
  coins: HandCoins,
  search: Search,
  pencil: PencilLine,
};

const ARROW_ANGLE: Record<SignArrow, number> = {
  up: 0,
  "up-right": 45,
  right: 90,
  "down-right": 135,
  down: 180,
  "down-left": 225,
  left: 270,
  "up-left": 315,
};

/**
 * Where each piece of booklet line art sits, in units of the sheet's short
 * side (cqmin): it bleeds off a corner the way it does on the booklet pages.
 */
type Placement = { width: number; top?: number; right?: number; bottom?: number; left?: number; rotate?: number };
const ART: Record<Exclude<SignArt, "none">, { src: string; opacity: number; portrait: Placement; landscape: Placement }> = {
  synapse: {
    src: "img/booklet/mesh-synapse.webp",
    opacity: 0.14,
    portrait: { width: 92, top: -30, right: -34, rotate: -10 },
    landscape: { width: 78, top: -34, right: -18, rotate: -10 },
  },
  "neuron-mesh": {
    src: "img/booklet/mesh-neuron.webp",
    opacity: 0.12,
    portrait: { width: 150, top: -16, right: -78, rotate: 8 },
    landscape: { width: 130, top: -26, right: -50, rotate: 6 },
  },
  neuron: {
    src: "img/booklet/neuron.svg",
    opacity: 0.1,
    portrait: { width: 150, top: -6, right: -86, rotate: -28 },
    landscape: { width: 150, top: -18, right: -64, rotate: -14 },
  },
  brain: {
    src: "img/booklet/brain.svg",
    opacity: 0.09,
    portrait: { width: 74, top: -16, right: -26, rotate: 10 },
    landscape: { width: 66, top: -18, right: -14, rotate: 10 },
  },
  sphere: {
    src: "img/booklet/sphere.svg",
    opacity: 0.07,
    portrait: { width: 64, top: -14, right: -20 },
    landscape: { width: 58, top: -16, right: -12 },
  },
  switzerland: {
    src: "img/booklet/switzerland.svg",
    opacity: 0.14,
    portrait: { width: 72, top: 4, right: -16, rotate: -6 },
    landscape: { width: 64, top: -2, right: -10, rotate: -6 },
  },
};

const CATEGORY_ART: Record<string, SignArt> = Object.fromEntries(SIGN_CATEGORIES.map((category) => [category.id, category.art]));

export function artFor(sign: Sign): SignArt {
  if (sign.art) return sign.art;
  // Timetables, sheets and time signals stay clean: their job is to be read fast.
  if (sign.layout && sign.layout !== "statement") return "none";
  return CATEGORY_ART[sign.category] ?? "none";
}

/* ------------------------------------------------------------------ QR -- */

/** One path for the whole code: each run of dark modules in a row becomes a rectangle. */
function qrPath(text: string) {
  const { data, size } = encode(text, { ecc: "M", border: 0 });
  let d = "";
  data.forEach((row, y) => {
    let x = 0;
    while (x < size) {
      if (!row[x]) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < size && row[x]) x += 1;
      d += `M${start} ${y}h${x - start}v1h${start - x}z`;
    }
  });
  return { d, size };
}

function Qr({ url }: { url: string }) {
  const { d, size } = useMemo(() => qrPath(url), [url]);
  return (
    <svg className="sign__qr-code" viewBox={`-1 -1 ${size + 2} ${size + 2}`} shapeRendering="crispEdges" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/* --------------------------------------------------------------- fitting -- */

// Title sizes in cqmin, largest first. Everything on a sheet is sized against
// its short side, so a fit worked out at preview size holds when it is printed.
const TITLE_STEPS = [24, 20, 17, 15, 13, 11.5, 10, 9, 8, 7, 6.2, 5.4, 4.8];
const DENSITY_STEPS = [1, 0.92, 0.85, 0.78, 0.72, 0.66, 0.6, 0.55];

function titleLimits(sign: Sign): { max: number; lines: number } {
  const layout = sign.layout ?? "statement";
  if (layout === "schedule") return { max: 9, lines: 2 };
  if (layout === "sheet") return { max: 7, lines: 2 };
  if (layout === "timer") return { max: 7, lines: 1 };
  const busy = Boolean(sign.qr || sign.rows?.length || (sign.body?.length ?? 0) > 1);
  if (sign.orientation === "landscape") return { max: busy ? 13 : 24, lines: 3 };
  return { max: busy ? 13 : 20, lines: 4 };
}

/**
 * Picks the largest title that fits its line budget without breaking a word,
 * then tightens the rest of the text until the content fits the page.
 */
function useFit(sign: Sign, contentRef: React.RefObject<HTMLDivElement | null>, mainRef: React.RefObject<HTMLDivElement | null>, fontsReady: boolean) {
  useLayoutEffect(() => {
    const content = contentRef.current;
    const main = mainRef.current;
    if (!content || !main) return;
    const title = content.querySelector<HTMLElement>(".sign__title");
    const { max, lines } = titleLimits(sign);
    const steps = TITLE_STEPS.filter((step) => step <= max);

    const titleFits = () => {
      if (!title) return true;
      if (title.scrollWidth > title.clientWidth + 1) return false;
      const lineHeight = parseFloat(getComputedStyle(title).lineHeight) || 1;
      return Math.round(title.offsetHeight / lineHeight) <= lines;
    };
    const pageFits = () => content.scrollHeight <= main.clientHeight + 1 && content.scrollWidth <= main.clientWidth + 1;

    let start = steps.length - 1;
    for (let i = 0; i < steps.length; i++) {
      content.style.setProperty("--title", `${steps[i]}cqmin`);
      if (titleFits()) {
        start = i;
        break;
      }
    }
    for (let i = start; i < steps.length; i++) {
      content.style.setProperty("--title", `${steps[i]}cqmin`);
      for (const density of DENSITY_STEPS) {
        content.style.setProperty("--density", String(density));
        if (pageFits()) return;
      }
    }
  }, [sign, fontsReady, contentRef, mainRef]);
}

/* ----------------------------------------------------------------- parts -- */

function ArrowMark({ direction, className = "" }: { direction: SignArrow; className?: string }) {
  return (
    <ArrowUp
      className={`sign__arrow ${className}`}
      strokeWidth={2.4}
      style={{ rotate: `${ARROW_ANGLE[direction]}deg` }}
      aria-hidden="true"
    />
  );
}

function Rows({ sign }: { sign: Sign }) {
  if (!sign.rows?.length) return null;
  const leads = sign.rows.some((row) => row.lead);
  return (
    <ol className={`sign__rows ${leads ? "has-leads" : ""} ${sign.rows.length <= 4 && !sign.qr ? "is-short" : ""}`}>
      {sign.rows.map((row, index) => (
        <li key={index} className={row.muted ? "is-muted" : undefined}>
          {leads && <span className="sign__row-lead">{row.lead}</span>}
          <span className="sign__row-main">
            <span className="sign__row-label">{row.label}</span>
            {row.detail && <span className="sign__row-detail">{row.detail}</span>}
          </span>
          {row.aside && <span className="sign__row-aside">{row.aside}</span>}
        </li>
      ))}
    </ol>
  );
}

function Markers({ markers }: { markers?: number[] }) {
  if (!markers?.length) return null;
  return (
    <p className="sign__markers">
      {markers.map((n) => (
        <span key={n} className="sign__marker">{n}</span>
      ))}
      <span>on the venue map</span>
    </p>
  );
}

/** Lets a long address wrap after its slashes and anchors instead of mid-word. */
function breakable(text: string) {
  return text.split(/(?<=[/#])/).map((part, index) => (
    <span key={index}>
      {index > 0 && <wbr />}
      {part}
    </span>
  ));
}

function QrBlock({ qr }: { qr: NonNullable<Sign["qr"]> }) {
  return (
    <div className="sign__qr">
      <Qr url={qr.url} />
      <div className="sign__qr-text">
        <p className="sign__qr-kicker">Scan</p>
        <p className="sign__qr-label">{breakable(qr.label)}</p>
        {qr.caption && <p className="sign__qr-caption">{qr.caption}</p>}
      </div>
    </div>
  );
}

function Text({ sign, children }: { sign: Sign; children?: ReactNode }) {
  return (
    <div className="sign__text">
      {sign.eyebrow && <p className="sign__eyebrow">{sign.eyebrow}</p>}
      {sign.title && <h2 className="sign__title">{sign.title}</h2>}
      {sign.subtitle && <p className="sign__subtitle">{sign.subtitle}</p>}
      {sign.body?.map((paragraph, index) => (
        <p key={index} className="sign__body">{paragraph}</p>
      ))}
      <Rows sign={sign} />
      <Markers markers={sign.markers} />
      {children}
    </div>
  );
}

function Statement({ sign }: { sign: Sign }) {
  const Icon = sign.icon ? ICONS[sign.icon] : null;
  const hasText = Boolean(sign.title || sign.eyebrow || sign.subtitle);
  const visual = sign.arrow ? (
    <ArrowMark direction={sign.arrow} />
  ) : Icon ? (
    <Icon className="sign__icon" strokeWidth={1.5} aria-hidden="true" />
  ) : null;

  if (!hasText) {
    return <div className="sign__solo">{visual}</div>;
  }
  return (
    <>
      {visual && <div className={`sign__visual ${sign.arrow ? "is-arrow" : "is-icon"}`}>{visual}</div>}
      <Text sign={sign} />
      {sign.qr && <QrBlock qr={sign.qr} />}
    </>
  );
}

function Schedule({ sign }: { sign: Sign }) {
  return (
    <>
      <Text sign={sign} />
      {sign.qr && <QrBlock qr={sign.qr} />}
    </>
  );
}

function SheetTable({ columns, from, to }: { columns: string[]; from: number; to: number }) {
  const rows = Array.from({ length: to - from + 1 }, (_, index) => from + index);
  return (
    <table className="sign__table">
      <thead>
        <tr>
          <th className="sign__table-n" aria-label="Number" />
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((n) => (
          <tr key={n}>
            <td className="sign__table-n">{n}</td>
            {columns.map((column) => (
              <td key={column} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SheetLayout({ sign }: { sign: Sign }) {
  const sheet = sign.sheet ?? { columns: ["Name"], rows: 20 };
  const half = Math.ceil(sheet.rows / 2);
  return (
    <>
      <Text sign={sign} />
      <div className={`sign__tables ${sheet.split ? "is-split" : ""}`}>
        {sheet.split ? (
          <>
            <SheetTable columns={sheet.columns} from={1} to={half} />
            <SheetTable columns={sheet.columns} from={half + 1} to={sheet.rows} />
          </>
        ) : (
          <SheetTable columns={sheet.columns} from={1} to={sheet.rows} />
        )}
      </div>
    </>
  );
}

function TimerLayout({ sign }: { sign: Sign }) {
  const figure = sign.figure ?? "";
  return (
    <div className="sign__timer" data-length={figure.length > 2 ? "long" : "short"}>
      <p className="sign__figure">{figure}</p>
      {sign.title && <h2 className="sign__title">{sign.title}</h2>}
    </div>
  );
}

/* ------------------------------------------------------------------ sign -- */

type SignSheetProps = {
  sign: Sign;
  lineArt?: boolean;
  fontsReady?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** One A4 sign. It scales with its width: give it any width on screen, or 210 mm in print. */
function SignSheetImpl({ sign, lineArt = true, fontsReady = false, className = "", style }: SignSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  useFit(sign, contentRef, mainRef, fontsReady);

  const orientation = sign.orientation ?? "portrait";
  const layout = sign.layout ?? "statement";
  const art = lineArt ? artFor(sign) : "none";
  const artSpec = art === "none" ? null : ART[art];
  const place = artSpec?.[orientation];
  const cq = (value?: number) => (value == null ? undefined : `${value}cqmin`);
  const hasText = Boolean(sign.title || sign.eyebrow || sign.subtitle);

  return (
    <div
      className={`sign sign--${orientation} sign--${layout} ${sign.arrow ? "has-arrow" : ""} ${sign.qr ? "has-qr" : ""} ${hasText ? "" : "is-bare"} ${className}`}
      style={style}
    >
      <div className="sign__page">
        {artSpec && place && (
          <img
            className="sign__art"
            src={withBase(artSpec.src)}
            alt=""
            decoding="async"
            style={{
              width: cq(place.width),
              top: cq(place.top),
              right: cq(place.right),
              bottom: cq(place.bottom),
              left: cq(place.left),
              rotate: place.rotate ? `${place.rotate}deg` : undefined,
              opacity: artSpec.opacity,
            }}
          />
        )}
        <header className="sign__head">
          <img className="sign__logo" src={withBase("img/logo.png")} alt="ALPS Research Conference" />
          <p className="sign__date">9–10 October 2026</p>
        </header>
        <div className="sign__main" ref={mainRef}>
          <div className="sign__content" ref={contentRef}>
            {layout === "statement" && <Statement sign={sign} />}
            {layout === "schedule" && <Schedule sign={sign} />}
            {layout === "sheet" && <SheetLayout sign={sign} />}
            {layout === "timer" && <TimerLayout sign={sign} />}
            {sign.note && <p className="sign__note">{sign.note}</p>}
          </div>
        </div>
        <footer className="sign__foot">
          <span>Kultur &amp; Kongresshaus Aarau</span>
          <span>alpsconference.com</span>
        </footer>
      </div>
    </div>
  );
}

export const SignSheet = memo(SignSheetImpl);
