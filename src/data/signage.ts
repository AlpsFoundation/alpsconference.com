/**
 * The printable A4 signs on /signage. Hand-written signs live in SIGNS; the
 * schedule, menu, workshop-room and experience signs are generated from the
 * program data below, so they follow any change to the timetable.
 *
 * Drop a hand-written sign by deleting its entry. Drop a generated one by
 * adding its id to EXCLUDED_SIGN_IDS.
 */
import { PROGRAM, type ProgramDay, type ProgramItem } from "./program";
import { EXPERIENCE_DAYS } from "./experiences";
import { EXPERIENCE_SESSIONS, type ExperienceSession } from "./conferenceTimeline";
import { WORKSHOP_DAY, WORKSHOP_TRACKS } from "./workshops";
import { CREDITS, MEMBERSHIP, POSTERS, SURVEY, WORKSHOP_SUMMARIES } from "./bookletContent";
import { WIFI } from "./links";

export const SIGN_SITE = "https://alpsconference.com";

/**
 * Invite link to the conference WhatsApp group. It goes out only as the QR
 * code on the welcome-desk sign, never as text on the site (Matthias, 6 Oct).
 */
const WHATSAPP_GROUP_INVITE = "https://chat.whatsapp.com/JxuEyEs4lLcGZlzbUBrdyB";

/** The 2026 photo gallery on the summer school site (section #recap-2026), for the info-table sign. */
const SUMMER_SCHOOL_GALLERY = "https://summerschool.alps.foundation/#recap-2026";

export type SignArrow = "up" | "up-right" | "right" | "down-right" | "down" | "down-left" | "left" | "up-left";
export const SIGN_ARROWS: SignArrow[] = ["up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"];

/** Line art from the booklet, drawn in light grey ink. */
export type SignArt = "synapse" | "neuron-mesh" | "neuron" | "brain" | "sphere" | "switzerland" | "none";
export const SIGN_ART: { id: SignArt; label: string }[] = [
  { id: "synapse", label: "Synapse" },
  { id: "neuron-mesh", label: "Neuron mesh" },
  { id: "neuron", label: "Neuron" },
  { id: "brain", label: "Brain" },
  { id: "sphere", label: "Network sphere" },
  { id: "switzerland", label: "Switzerland" },
  { id: "none", label: "None" },
];

/** Lucide icons a sign can carry; SignSheet maps each name to its component. */
export const SIGN_ICONS = [
  { id: "info", label: "Info" },
  { id: "ticket", label: "Ticket" },
  { id: "badge", label: "Badge" },
  { id: "luggage", label: "Luggage" },
  { id: "message", label: "Chat" },
  { id: "presentation", label: "Stage" },
  { id: "sofa", label: "Lounge" },
  { id: "armchair", label: "Armchair" },
  { id: "utensils", label: "Food" },
  { id: "coffee", label: "Coffee" },
  { id: "water", label: "Water" },
  { id: "wine", label: "Apéro" },
  { id: "toilet", label: "Toilets" },
  { id: "shirt", label: "Wardrobe" },
  { id: "accessibility", label: "Accessibility" },
  { id: "door-open", label: "Exit" },
  { id: "door-closed", label: "Closed door" },
  { id: "lock", label: "Restricted" },
  { id: "frame", label: "Exhibition" },
  { id: "palette", label: "Painting" },
  { id: "image", label: "Poster" },
  { id: "book", label: "Booklet" },
  { id: "store", label: "Shop" },
  { id: "graduation", label: "Workshop" },
  { id: "waves", label: "Sound" },
  { id: "wind", label: "Breathwork" },
  { id: "person", label: "Yoga" },
  { id: "music", label: "Music" },
  { id: "users", label: "People" },
  { id: "handshake", label: "Meeting" },
  { id: "heart", label: "Care" },
  { id: "moon", label: "Night" },
  { id: "camera", label: "Camera" },
  { id: "camera-off", label: "No photos" },
  { id: "mic", label: "Microphone" },
  { id: "podcast", label: "Podcast" },
  { id: "volume-off", label: "Silence" },
  { id: "shush", label: "Shush" },
  { id: "wifi", label: "Wifi" },
  { id: "qr", label: "QR code" },
  { id: "calendar", label: "Calendar" },
  { id: "map", label: "Map" },
  { id: "clock", label: "Clock" },
  { id: "timer", label: "Timer" },
  { id: "recycle", label: "Recycling" },
  { id: "trash", label: "Bin" },
  { id: "cup", label: "Cup" },
  { id: "leaf", label: "Leaf" },
  { id: "card", label: "Card" },
  { id: "coins", label: "Donation" },
  { id: "search", label: "Lost and found" },
  { id: "pencil", label: "Write" },
] as const;
export type SignIcon = (typeof SIGN_ICONS)[number]["id"];

export type SignOrientation = "portrait" | "landscape";

/**
 * statement — icon or arrow, title, text and an optional QR code (most signs)
 * schedule  — a timed list (program, experiences)
 * sheet     — ruled table to fill in by hand (sign-up sheets, price list)
 * timer     — one giant figure, for time signals held up to the speaker
 * qr        — one large QR code with a title, or a sheet of identical cut-out cards (`tiles`)
 */
export type SignLayout = "statement" | "schedule" | "sheet" | "timer" | "qr";

/** How many identical cards a `qr` sign prints per A4 sheet, with cut lines between them. */
export type SignTiles = 1 | 2 | 4 | 6 | 8;
export const SIGN_TILES: { id: SignTiles; label: string; hint: string }[] = [
  { id: 1, label: "1", hint: "One large code on the page" },
  { id: 2, label: "2", hint: "A5 halves" },
  { id: 4, label: "4", hint: "A6 cards" },
  { id: 6, label: "6", hint: "Table cards" },
  { id: 8, label: "8", hint: "Business-card size" },
];

export type SignRow = {
  /** Time, step number or short label in the left column. */
  lead?: string;
  label: string;
  detail?: string;
  /** Place or price, set flush right. */
  aside?: string;
  muted?: boolean;
};

export type Sign = {
  id: string;
  category: SignCategoryId;
  /** Shown in the generator when the title alone does not say what the sign is (arrows, timers). */
  name?: string;
  /** Generated from the program data: removing it means listing it in EXCLUDED_SIGN_IDS. */
  derived?: boolean;
  layout?: SignLayout;
  orientation?: SignOrientation;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string[];
  icon?: SignIcon;
  arrow?: SignArrow;
  /** Numbers on the venue map (/map), shown as map markers. */
  markers?: number[];
  rows?: SignRow[];
  /** `url` is what the code encodes: usually a link, or a Wi-Fi or text payload on `qr` signs. */
  qr?: { url: string; label: string; caption?: string; ecc?: "L" | "M" | "Q" | "H" };
  /** Cards per sheet on `qr` signs. */
  tiles?: SignTiles;
  /** Ruled table for `sheet` signs: column headings and how many rows, split into two tables side by side when `split`. */
  sheet?: { columns: string[]; rows: number; split?: boolean };
  /** Giant figure for `timer` signs. */
  figure?: string;
  /** Small print above the footer. */
  note?: string;
  /** Overrides the category's line art. */
  art?: SignArt;
};

export const SIGN_CATEGORIES = [
  { id: "welcome", label: "Welcome & check-in", art: "synapse", hint: "Entrance, reception and the welcome desk" },
  { id: "rooms", label: "Rooms & directions", art: "neuron", hint: "Wayfinding, with the numbers from the venue map" },
  { id: "workshops", label: "Workshop day", art: "neuron-mesh", hint: "Thursday 8 October, Raum 1–3 on the 2nd floor" },
  { id: "program", label: "Program", art: "neuron", hint: "Timetables for the doors and the foyer" },
  { id: "experiences", label: "Experiences", art: "sphere", hint: "Door signs for Saal 4 and Saal 2, one per session" },
  { id: "signups", label: "Paper sign-up sheets", art: "none", hint: "Fallback lists if online sign-up is down" },
  { id: "food", label: "Food & drinks", art: "neuron-mesh", hint: "Buffet menus, one per break" },
  { id: "evening", label: "Evenings", art: "synapse", hint: "Dinner, storytelling, apéro and the afterparty" },
  { id: "online", label: "Online & QR codes", art: "sphere", hint: "Wifi and the pages on alpsconference.com" },
  { id: "info", label: "Info table & shop", art: "brain", hint: "Merch, membership, donations, credits" },
  { id: "care", label: "House rules & care", art: "brain", hint: "Quiet, photos, access, looking after each other" },
  { id: "waste", label: "Waste & returns", art: "neuron-mesh", hint: "Bins, cups, dishes and badges" },
  { id: "stage", label: "Stage & team", art: "synapse", hint: "Time signals, Q&A, reserved seats, crew rooms" },
  { id: "arrows", label: "Arrows & blanks", art: "none", hint: "Plain arrows and sheets to write on" },
] as const satisfies readonly { id: string; label: string; art: SignArt; hint: string }[];
export type SignCategoryId = (typeof SIGN_CATEGORIES)[number]["id"];

export const SIGN_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  SIGN_CATEGORIES.map((category) => [category.id, category.label]),
);

/** Generated signs we decided not to print. */
export const EXCLUDED_SIGN_IDS: string[] = [];

/* ------------------------------------------------------------ helpers -- */

const link = (path: string) => ({ url: `${SIGN_SITE}${path}`, label: `alpsconference.com${path}` });
const DAY_LABEL: Record<string, string> = { Thursday: "Thu 8 Oct", Friday: "Fri 9 Oct", Saturday: "Sat 10 Oct" };
const longDay = (day: ProgramDay) => `${day.day} ${day.date}`;
const splitMenu = (note: string) => note.split(" · ").map((part) => part.trim()).filter(Boolean);

/* -------------------------------------------------------- hand-written -- */

const SIGNS: Sign[] = [
  /* ---------------------------------------------------------- welcome -- */
  {
    id: "welcome",
    category: "welcome",
    eyebrow: "Awareness Lectures on Psychedelic Science",
    title: "Welcome to ALPS 2026",
    subtitle: "Exploring the peaks of psychedelic science.",
    rows: [
      { lead: "Wifi", label: WIFI.network, detail: `Username and password: ${WIFI.password}` },
      { lead: "Help", label: "ALPS info table", detail: "Questions, merch, dinner tickets and sign-ups" },
    ],
    qr: { ...link("/links"), caption: "Program, venue map and what is on now" },
  },
  {
    id: "check-in",
    category: "welcome",
    icon: "ticket",
    title: "Check-in",
    subtitle: "Have your ticket ready, on your phone or on paper.",
    body: ["Suitcases can be left at the reception, free of charge."],
    markers: [1],
  },
  {
    id: "check-in-speakers",
    category: "welcome",
    icon: "badge",
    eyebrow: "Speakers and moderators",
    title: "Speaker check-in",
    subtitle: "Please introduce yourself here. We will take you to the speaker lounge.",
    markers: [1],
  },
  {
    id: "luggage",
    category: "welcome",
    icon: "luggage",
    title: "Luggage storage",
    subtitle: "Ask at the reception. It is free of charge.",
    markers: [1],
  },
  {
    id: "whatsapp",
    category: "welcome",
    icon: "message",
    eyebrow: "Ticket holders only",
    title: "Join the WhatsApp group",
    subtitle: "Last-minute changes, lift shares and meeting up during the breaks.",
    qr: { url: WHATSAPP_GROUP_INVITE, label: "Join in WhatsApp", caption: "Point your phone camera at the code." },
  },

  /* ------------------------------------------------------------ rooms -- */
  {
    id: "room-main-stage",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "Main stage",
    subtitle: "Talks and panel discussions",
    markers: [3],
  },
  {
    id: "room-saal-4",
    category: "rooms",
    orientation: "landscape",
    arrow: "up",
    eyebrow: "Experiences",
    title: "Saal 4",
    subtitle: "is on the 2nd floor",
    body: ["Open to everyone as a relaxation space when no session is on."],
    markers: [4],
  },
  {
    id: "room-saal-4-up",
    category: "rooms",
    arrow: "up",
    eyebrow: "Almost there",
    title: "Saal 4 is one floor up",
  },
  {
    id: "room-saal-2",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "Saal 2",
    subtitle: "Speed-friending, networking dinner and live concert",
  },
  {
    id: "room-info-table",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "ALPS info table",
    subtitle: "Questions, merch, dinner tickets and sign-ups",
    markers: [2],
  },
  {
    id: "room-lounge",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "Lounge",
    subtitle: "Take a seat between talks",
    markers: [5],
  },
  {
    id: "room-food",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "Food and drinks",
    markers: [6],
  },
  {
    id: "room-coffee",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "Coffee",
  },
  {
    id: "room-research-posters",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "Research posters",
    subtitle: "On show both days",
    markers: [7],
  },
  {
    id: "room-exhibitors",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "Exhibitors",
    subtitle: "OPEN Foundation · Nachtschatten Verlag",
    markers: [8, 9],
  },
  {
    id: "room-blotter-art",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "LSD blotter art exhibition",
    subtitle: "Kevin Barron",
    markers: [11],
  },
  {
    id: "room-live-painting",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "Live painting art corner",
    subtitle: "Joanne Lackey · Hana Stanke",
    markers: [12],
  },
  {
    id: "room-alps-posters",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    title: "ALPS posters",
    subtitle: `${POSTERS.collection} by Régis Paroz`,
    markers: [13],
  },
  {
    id: "room-toilets",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    icon: "toilet",
    title: "Toilets",
  },
  {
    id: "room-wardrobe",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    icon: "shirt",
    title: "Wardrobe",
    subtitle: "Self-service",
  },
  {
    id: "room-elevator",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    icon: "accessibility",
    title: "Elevator",
  },
  {
    id: "room-speaker-lounge",
    category: "rooms",
    orientation: "landscape",
    arrow: "up",
    eyebrow: "Speakers and moderators",
    title: "Speaker lounge",
    subtitle: "Raum 1 · 2nd floor",
  },
  {
    id: "room-exit",
    category: "rooms",
    orientation: "landscape",
    arrow: "right",
    icon: "door-open",
    title: "Exit",
  },

  /* -------------------------------------------------------- workshops -- */
  {
    id: "workshops-check-in",
    category: "workshops",
    icon: "graduation",
    eyebrow: `${WORKSHOP_DAY.day} ${WORKSHOP_DAY.date} · ${WORKSHOP_DAY.time}`,
    title: "Workshop check-in",
    subtitle: "Have your workshop ticket ready.",
    body: ["The three workshops run in Raum 1, 2 and 3 on the 2nd floor."],
  },
  {
    id: "workshops-up",
    category: "workshops",
    orientation: "landscape",
    arrow: "up",
    eyebrow: `Workshops · ${WORKSHOP_DAY.day} ${WORKSHOP_DAY.date}`,
    title: "Raum 1, 2 and 3",
    subtitle: "are on the 2nd floor",
  },

  /* ---------------------------------------------------------- program -- */
  {
    id: "group-picture",
    category: "program",
    icon: "camera",
    eyebrow: "Saturday · 16:00",
    title: "Group picture here",
    subtitle: "During the coffee break. Everyone is welcome in the picture.",
  },

  /* ------------------------------------------------------ experiences -- */
  {
    id: "experiences-art",
    category: "experiences",
    icon: "frame",
    eyebrow: "All day · Foyer",
    title: "Art exhibitions",
    rows: (EXPERIENCE_DAYS[0].items.find((item) => item.kind === "allday")?.credits ?? []).map((credit) => ({
      label: credit.name,
      detail: credit.type,
    })),
  },
  {
    id: "experiences-quiet",
    category: "experiences",
    icon: "door-closed",
    eyebrow: "Session in progress",
    title: "Please do not disturb",
    subtitle: "Wait for the end of the session to come in. Thank you.",
  },
  {
    id: "experiences-relax",
    category: "experiences",
    icon: "sofa",
    eyebrow: "Saal 4",
    title: "Relaxation space",
    subtitle: "Open to everyone when no session is on. Please keep your voice low.",
  },
  {
    id: "experiences-no-recording",
    category: "experiences",
    icon: "camera-off",
    title: "No photos or recordings",
    subtitle: "Please keep your phone away during this session.",
  },

  /* ------------------------------------------------------------- food -- */
  {
    id: "food-allergies",
    category: "food",
    icon: "utensils",
    title: "Allergies?",
    subtitle: "Ask the catering team about ingredients before you serve yourself.",
  },
  {
    id: "food-water",
    category: "food",
    icon: "water",
    title: "Drinking water",
    subtitle: "Help yourself.",
  },
  {
    id: "food-leftovers",
    category: "food",
    icon: "leaf",
    eyebrow: "Help us reduce food waste",
    title: "Leftovers are free",
    subtitle: "Take some with you at the end of the day. Bring a container if you can.",
  },

  /* ---------------------------------------------------------- evening -- */
  {
    id: "evening-dinner",
    category: "evening",
    icon: "utensils",
    eyebrow: "Friday 9 October · 19:15–20:15",
    title: "Networking dinner",
    subtitle: "Optional dinner after the Friday program: good food and time to meet other participants.",
    rows: [
      { lead: "01", label: "Tofu-vegetable curry on rice with herb pesto" },
      { lead: "02", label: "Crêpe station" },
      { lead: "03", label: "1 drink included" },
    ],
    qr: {
      url: "https://infomaniak.events/en-ch/conferences/alps-conference-2026/c2484795-1ae7-4b4b-aa21-c9b8f085008c/events/382409",
      label: "Pre-sale on Infomaniak",
      caption: "Or buy at the ALPS info table. Buy in advance to avoid queuing.",
    },
    note: "Saal 2",
  },
  {
    id: "evening-dinner-tickets",
    category: "evening",
    icon: "ticket",
    eyebrow: "Friday · 19:15–20:15",
    title: "Dinner tickets here",
    subtitle: "Buy your networking dinner ticket at this table.",
  },
  {
    id: "evening-afterparty",
    category: "evening",
    icon: "moon",
    eyebrow: "Afterparty · Saturday 10 October",
    title: "Afterglow",
    subtitle: "The conference closes with the Afterglow afterparty.",
    rows: [
      { lead: "Where", label: "Jugendkulturhaus Flösserplatz", detail: "Flösserstrasse 7 · 5 minutes on foot" },
      { lead: "When", label: "21:30–04:00", detail: "Music from 22:00" },
      { lead: "Entry", label: "Included in your ticket", detail: "Guestlist only: sign up on eventfrog" },
    ],
    qr: {
      url: "https://eventfrog.ch/de/p/partys/house-techno/afterglow-afterparty-for-the-alps-conference-guestlist-only-7505194045364252288.html",
      label: "Guestlist on eventfrog",
    },
  },
  {
    id: "evening-afterparty-way",
    category: "evening",
    orientation: "landscape",
    arrow: "right",
    eyebrow: "Saturday from 21:30",
    title: "Afterparty",
    subtitle: "Jugendkulturhaus Flösserplatz · 5 minutes on foot",
  },

  /* ----------------------------------------------------------- online -- */
  {
    id: "online-wifi",
    category: "online",
    icon: "wifi",
    title: "Wifi",
    rows: [
      { lead: "Network", label: WIFI.network },
      { lead: "Username", label: WIFI.username },
      { lead: "Password", label: WIFI.password },
    ],
    body: ["After joining, your browser opens a login page: enter the username and password there."],
  },
  {
    id: "online-links",
    category: "online",
    icon: "qr",
    title: "Everything on your phone",
    subtitle: "What is on now, the program, venue map, wifi and experience sign-ups.",
    qr: link("/links"),
  },
  {
    id: "online-program",
    category: "online",
    icon: "calendar",
    title: "Full program",
    subtitle: "Talks, panels and breaks for both days, with abstracts.",
    qr: link("/#program"),
  },
  {
    id: "online-booklet",
    category: "online",
    icon: "book",
    title: "Conference booklet",
    subtitle: "Speakers, abstracts, experiences and partners, readable on your phone.",
    qr: link("/booklet"),
  },
  {
    id: "online-map",
    category: "online",
    icon: "map",
    title: "Venue map",
    subtitle: "Every room and table, by number.",
    qr: link("/map"),
  },
  {
    id: "online-calendar",
    category: "online",
    icon: "calendar",
    title: "Talks in your calendar",
    subtitle: "Every talk and panel, added to your phone's calendar.",
    qr: link("/alps-2026-talks.ics"),
  },
  {
    id: "online-survey",
    category: "online",
    icon: "users",
    eyebrow: "Anonymous · 2 minutes",
    title: "Who are we?",
    subtitle: "An anonymous questionnaire that helps us understand who we are as a community, and how to improve.",
    rows: SURVEY.questions.map((question) => ({ label: question })),
    qr: { url: SURVEY.url, label: "Open the survey" },
  },
  {
    id: "online-feedback",
    category: "online",
    icon: "message",
    eyebrow: "Saturday evening",
    title: "Share your feedback",
    subtitle: "Two minutes that shape ALPS 2027.",
    qr: link("/links#feedback"),
  },
  {
    id: "online-links-cards",
    category: "online",
    name: "QR cards for the tables, 6 per page",
    layout: "qr",
    tiles: 6,
    title: "Everything on your phone",
    subtitle: "Program, venue map, wifi and sign-ups",
    qr: link("/links"),
  },
  {
    id: "online-newsletter",
    category: "online",
    icon: "message",
    title: "Stay in touch",
    subtitle: "Hear about the next conference, the summer school and the student forum.",
    qr: link("/#newsletter"),
  },

  /* ------------------------------------------------------------- info -- */
  {
    id: "info-table",
    category: "info",
    icon: "info",
    eyebrow: "Questions?",
    title: "ALPS info table",
    rows: [
      { label: "Merch and posters" },
      { label: "Membership and donations" },
      { label: "Networking dinner tickets" },
      { label: "Help with experience sign-ups" },
      { label: "Lost and found" },
    ],
    markers: [2],
  },
  {
    id: "info-posters",
    category: "info",
    icon: "image",
    eyebrow: POSTERS.subtitle,
    title: `${POSTERS.collection} posters`,
    subtitle: "Support the ALPS Foundation by buying a poster.",
    rows: POSTERS.formats.map((format) => ({
      label: format.name,
      detail: format.name === "A0" ? "Signed original. Each artwork exists only once." : undefined,
      aside: format.detail.match(/CHF \d+/)?.[0],
    })),
    note: "Last year’s collection is also available.",
  },
  {
    id: "info-price-list",
    category: "info",
    layout: "sheet",
    icon: "store",
    title: "Price list",
    sheet: { columns: ["Item", "CHF"], rows: 14 },
    note: "Fill in by hand.",
  },
  {
    id: "info-payment",
    category: "info",
    icon: "card",
    title: "Pay by TWINT, card or cash",
  },
  {
    id: "info-shop",
    category: "info",
    icon: "store",
    title: "More merch online",
    subtitle: POSTERS.shop.body,
    qr: { url: POSTERS.shop.url, label: "merch.alps.foundation" },
  },
  {
    id: "info-membership",
    category: "info",
    icon: "heart",
    eyebrow: "Support our work",
    title: "Become a member",
    subtitle: "Your yearly contribution funds education, research and medical access facilitation.",
    rows: MEMBERSHIP.tiers.map((tier) => ({ label: tier.name, aside: tier.price.replace(" CHF/year", " CHF a year") })),
    qr: { url: MEMBERSHIP.membershipLink.url, label: "alps.foundation/support" },
  },
  {
    id: "info-donate",
    category: "info",
    icon: "coins",
    eyebrow: "ALPS is run by volunteers",
    title: "Support ALPS with a donation",
    subtitle: "Donations keep the wheels running. Give by TWINT, card or bank transfer.",
    qr: { url: MEMBERSHIP.donationLink.url, label: "alps.foundation/support" },
  },
  {
    id: "info-summer-school",
    category: "info",
    icon: "image",
    eyebrow: "ALPS Summer School 2026",
    title: "A week at Le Camp, in pictures",
    subtitle: "Photos from the summer school in Vaumarcus, and what participants said about it.",
    qr: {
      url: SUMMER_SCHOOL_GALLERY,
      label: "summerschool.alps.foundation",
      caption: "Opens the photo gallery.",
    },
  },
  {
    id: "info-credits",
    category: "info",
    icon: "graduation",
    title: CREDITS.title,
    rows: CREDITS.items.map((item) => ({ label: item.who, detail: item.body, aside: item.credits })),
    body: ["Your certificate arrives by email after the conference. Graduate students can ask us for an attendance certificate at info@alps.foundation."],
  },
  {
    id: "info-lost-found",
    category: "info",
    icon: "search",
    title: "Lost and found",
    subtitle: "Lost something? Ask at the ALPS info table.",
    markers: [2],
  },

  /* ------------------------------------------------------------- care -- */
  {
    id: "care-phones",
    category: "care",
    icon: "volume-off",
    title: "Please silence your phone",
    subtitle: "Thank you for keeping the room quiet for the speakers.",
  },
  {
    id: "care-quiet",
    category: "care",
    icon: "shush",
    title: "Silence during the talks",
    subtitle: "Please keep your conversations for the breaks. Thank you.",
  },
  {
    id: "care-photo",
    category: "care",
    icon: "camera",
    eyebrow: "Please note",
    title: "This event is photographed and filmed",
    subtitle: "Rather not appear? Let us know at the ALPS info table.",
  },
  {
    id: "care-no-food",
    category: "care",
    icon: "cup",
    title: "No food or drinks in the hall",
    subtitle: "Please enjoy them in the foyer. Thank you.",
  },
  {
    id: "care-look-after",
    category: "care",
    icon: "heart",
    title: "Look after each other",
    subtitle: "If someone makes you feel uncomfortable, or you need a quiet moment, talk to any ALPS team member or come to the info table.",
  },
  {
    id: "care-valuables",
    category: "care",
    icon: "shirt",
    title: "Keep your valuables with you",
    subtitle: "The wardrobe is self-service. ALPS cannot take responsibility for items left there.",
  },
  {
    id: "care-restricted",
    category: "care",
    icon: "lock",
    eyebrow: "Please note",
    title: "Restricted access",
    subtitle: "Speakers and ALPS team only.",
    body: ["Thank you for your understanding."],
  },
  {
    id: "care-staff-only",
    category: "care",
    icon: "lock",
    title: "Staff only",
    subtitle: "ALPS team and venue staff.",
  },
  {
    id: "care-podcast",
    category: "care",
    icon: "podcast",
    eyebrow: "ALPS Speak",
    title: "Podcast recording",
    subtitle: "Recording in progress. Please do not enter.",
  },

  /* ------------------------------------------------------------ waste -- */
  {
    id: "waste-cups",
    category: "waste",
    icon: "cup",
    title: "Used cups",
    subtitle: "Please return them here.",
  },
  {
    id: "waste-dishes",
    category: "waste",
    icon: "utensils",
    title: "Used dishes",
    subtitle: "Plates and cutlery go here. Thank you.",
  },
  {
    id: "waste-cans",
    category: "waste",
    icon: "recycle",
    title: "Aluminium cans",
  },
  {
    id: "waste-pet",
    category: "waste",
    icon: "recycle",
    title: "PET bottles",
  },
  {
    id: "waste-paper",
    category: "waste",
    icon: "recycle",
    title: "Paper and cardboard",
  },
  {
    id: "waste-general",
    category: "waste",
    icon: "trash",
    title: "General waste",
  },
  {
    id: "waste-badges",
    category: "waste",
    icon: "badge",
    eyebrow: "Leaving for good?",
    title: "Badge return",
    subtitle: "We reuse badges and lanyards next year. Keep yours as a souvenir, or drop it here when you leave the conference.",
  },

  /* ------------------------------------------------------------ stage -- */
  ...(
    [
      ["10", "10 minutes left"],
      ["5", "5 minutes left"],
      ["1", "1 minute left"],
    ] as const
  ).map(([figure, title]): Sign => ({
    id: `stage-timer-${figure}`,
    category: "stage",
    name: `Time signal: ${title}`,
    layout: "timer",
    orientation: "landscape",
    figure,
    title: figure === "1" ? "minute left" : "minutes left",
  })),
  {
    id: "stage-timer-up",
    category: "stage",
    name: "Time signal: time is up",
    layout: "timer",
    orientation: "landscape",
    figure: "Time",
    title: "Please wrap up",
  },
  {
    id: "stage-qa",
    category: "stage",
    name: "Time signal: Q&A",
    layout: "timer",
    orientation: "landscape",
    figure: "Q&A",
    title: "Time for questions",
  },
  {
    id: "stage-mic",
    category: "stage",
    icon: "mic",
    title: "Please wait for the microphone",
    subtitle: "So everyone, and the recording, can hear your question.",
  },
  {
    id: "stage-reserved",
    category: "stage",
    icon: "armchair",
    title: "Reserved",
    subtitle: "For speakers and moderators",
  },
  {
    id: "stage-backstage",
    category: "stage",
    icon: "lock",
    title: "Backstage",
    subtitle: "Speakers and ALPS team only.",
  },
  {
    id: "stage-speaker-lounge",
    category: "stage",
    icon: "armchair",
    eyebrow: "Raum 1 · 2nd floor",
    title: "Speaker lounge",
    subtitle: "For speakers, moderators and the ALPS team.",
  },
  {
    id: "stage-backoffice",
    category: "stage",
    icon: "lock",
    title: "ALPS backoffice",
    subtitle: "ALPS team only.",
  },

  /* ----------------------------------------------------------- arrows -- */
  ...SIGN_ARROWS.map((arrow): Sign => ({
    id: `arrow-${arrow}`,
    category: "arrows",
    name: `Arrow ${arrow.replace("-", " and ")}`,
    orientation: "landscape",
    arrow,
    title: "",
  })),
  {
    id: "blank-write-in",
    category: "arrows",
    name: "Blank sign to write on",
    title: "",
  },
  {
    id: "blank-landscape",
    category: "arrows",
    name: "Blank landscape sign",
    orientation: "landscape",
    title: "",
  },
];

/* ----------------------------------------------------------- generated -- */

/** Thursday's room signs, one per workshop. The rooms follow the venue's screen plan. */
const WORKSHOP_ROOM: Record<string, string> = { English: "Raum 1", French: "Raum 2", German: "Raum 3" };
const LANGUAGE_NAME: Record<string, string> = { English: "English", French: "Français", German: "Deutsch" };

function workshopSigns(): Sign[] {
  const rooms: Sign[] = WORKSHOP_TRACKS.map((track) => {
    const summary = WORKSHOP_SUMMARIES[track.language];
    return {
      id: `workshop-${track.language.toLowerCase()}`,
      category: "workshops",
      derived: true,
      eyebrow: `${WORKSHOP_ROOM[track.language] ?? "Workshop"} · ${LANGUAGE_NAME[track.language] ?? track.language}`,
      title: summary?.title ?? track.title,
      subtitle: track.presenters,
      rows: [
        { lead: "When", label: `${WORKSHOP_DAY.day} ${WORKSHOP_DAY.date}`, detail: WORKSHOP_DAY.time },
        { lead: "Places", label: `${track.places} participants` },
      ],
    };
  });

  const schedule: Sign = {
    id: "workshops-schedule",
    category: "workshops",
    derived: true,
    layout: "schedule",
    eyebrow: `${WORKSHOP_DAY.day} ${WORKSHOP_DAY.date} · ${WORKSHOP_DAY.time}`,
    title: "Workshop day",
    rows: WORKSHOP_TRACKS.map((track) => ({
      lead: WORKSHOP_ROOM[track.language] ?? "",
      label: WORKSHOP_SUMMARIES[track.language]?.title ?? track.title,
      detail: `${track.presenters} · ${LANGUAGE_NAME[track.language] ?? track.language}`,
    })),
    note: "All three rooms are on the 2nd floor.",
  };

  return [schedule, ...rooms];
}

/** The main-stage timetable for each day. */
function programSigns(): Sign[] {
  return PROGRAM.map((day) => ({
    id: `program-${day.day.toLowerCase()}`,
    category: "program",
    derived: true,
    layout: "schedule",
    name: `Program, ${day.day}`,
    eyebrow: `${longDay(day)} · Main stage`,
    title: `${day.day} program`,
    rows: day.items.map((item) => ({
      lead: item.time.replace(/–.*/, ""),
      label: item.title,
      detail: item.speakerName || item.panel ? item.detail : item.kind === "social" ? item.detail : undefined,
      muted: item.kind === "pause",
    })),
    note: "Live updates and abstracts: alpsconference.com/links",
  }));
}

/** Each day's experiences, for the door of Saal 4 and the foyer. */
function experienceScheduleSigns(): Sign[] {
  return EXPERIENCE_DAYS.map((day) => {
    const sessions = EXPERIENCE_SESSIONS.filter((session) => session.date === day.dateTime && session.title !== "Afterparty");
    return {
      id: `experiences-${day.day.toLowerCase()}`,
      category: "experiences",
      derived: true,
      layout: "schedule",
      name: `Experiences, ${day.day}`,
      eyebrow: `${day.day} ${day.date}`,
      title: "Experiences",
      subtitle: "Sound, movement, art and social sessions alongside the talks.",
      rows: sessions
        .slice()
        .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0))
        .map((session) => ({
          lead: session.start ? session.time.replace(/–.*/, "") : "All day",
          label: session.title,
          detail: session.personName,
          aside: session.venue ?? (session.start ? undefined : "Foyer"),
        })),
      qr: { ...link("/links"), caption: "Places are limited: sign up online." },
      note: "Saal 4 is on the 2nd floor.",
    };
  });
}

function sessionWhen(session: ExperienceSession) {
  return [session.day, session.time, session.venue].filter(Boolean).join(" · ");
}

const SESSION_ICON: Record<string, SignIcon> = {
  "Sound meditation": "waves",
  Breathwork: "wind",
  Yoga: "person",
  Storytelling: "users",
  "Speed-friending": "handshake",
  "Live concert": "music",
  "Cacao circle": "heart",
};

/** A door sign per timed experience, and a paper sign-up sheet for each one that takes sign-ups. */
function experienceSessionSigns(): { doors: Sign[]; sheets: Sign[] } {
  const timed = EXPERIENCE_SESSIONS.filter((session) => session.start && session.title !== "Afterparty");
  const doors = timed.map((session): Sign => ({
    id: `session-${session.id}`,
    category: "experiences",
    derived: true,
    icon: SESSION_ICON[session.title],
    eyebrow: sessionWhen(session),
    title: session.title,
    subtitle: session.personName ? `with ${session.personName}` : undefined,
    body: session.signup
      ? [`Places are limited to ${session.capacity}. Sign up online; if the session is full, join the waitlist.`]
      : ["Open to everyone. No sign-up needed."],
    qr: session.signup ? { url: `${SIGN_SITE}/links#${session.id}`, label: "Sign up on alpsconference.com/links" } : undefined,
  }));

  const sheets = timed
    .filter((session) => session.signup)
    .map((session): Sign => ({
      id: `signup-${session.id}`,
      category: "signups",
      derived: true,
      layout: "sheet",
      eyebrow: sessionWhen(session),
      title: `${session.title}${session.personName ? ` with ${session.personName}` : ""}`,
      sheet: { columns: ["First name", "Last name"], rows: session.capacity, split: true },
      note: "Online sign-ups come first. Use this sheet only if the online list cannot be reached.",
    }));

  return { doors, sheets };
}

/** One buffet sign per catered break, read from the menu notes in the program. */
function menuSigns(): Sign[] {
  return PROGRAM.flatMap((day) =>
    day.items
      .filter((item): item is ProgramItem & { menuNote: string } => Boolean(item.menuNote) && !/dinner/i.test(item.title))
      .map((item) => ({
        id: `menu-${day.day.toLowerCase()}-${item.time.slice(0, 5).replace(":", "")}`,
        category: "food" as const,
        derived: true,
        icon: /lunch/i.test(item.title) ? ("utensils" as const) : ("coffee" as const),
        eyebrow: `${DAY_LABEL[day.day] ?? day.day} · ${item.time}`,
        title: item.title === "Doors open" ? "Welcome coffee" : item.title === "Break" ? "Coffee break" : item.title,
        rows: splitMenu(item.menuNote).map((dish, index) => ({ lead: String(index + 1).padStart(2, "0"), label: dish })),
      })),
  );
}

/** Every sign, in the order of the categories. */
export function buildSigns(): Sign[] {
  const { doors, sheets } = experienceSessionSigns();
  const all = [
    ...SIGNS,
    ...workshopSigns(),
    ...programSigns(),
    ...experienceScheduleSigns(),
    ...doors,
    ...sheets,
    ...menuSigns(),
  ].filter((sign) => !EXCLUDED_SIGN_IDS.includes(sign.id));
  const order = new Map<string, number>(SIGN_CATEGORIES.map((category, index) => [category.id, index]));
  // Stable sort: within a category, hand-written signs keep their order and come first.
  return all
    .map((sign, index) => ({ sign, index }))
    .sort((a, b) => (order.get(a.sign.category) ?? 0) - (order.get(b.sign.category) ?? 0) || a.index - b.index)
    .map(({ sign }) => sign);
}

/** The label the generator shows for a sign. */
export function signName(sign: Pick<Sign, "name" | "title" | "eyebrow">) {
  return sign.name || sign.title || sign.eyebrow || "Untitled sign";
}
