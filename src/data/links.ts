/**
 * Quick links on /links, each shown as an accordion item. Leave an action's `href`
 * empty to show it as "coming soon". Items open from the URL hash, e.g. /links#afterparty.
 */

import { SURVEY } from "./bookletContent";

export type QuickLinkIcon =
  | "whatsapp"
  | "map"
  | "schedule"
  | "booklet"
  | "calendar"
  | "afterparty"
  | "dinner"
  | "feedback"
  | "wifi";

export type QuickLinkAction = {
  label: string;
  href: string;
  /** Internal paths are prefixed with the site base and open in the same tab. */
  internal?: boolean;
};

export type QuickLink = {
  id: string;
  label: string;
  /** One-line summary shown on the collapsed row. */
  summary: string;
  icon: QuickLinkIcon;
  body?: string;
  /** `lead` is shown in bold before `value`. */
  details?: { label: string; value: string; lead?: string }[];
  actions?: QuickLinkAction[];
  /** Special content rendered inside the item. */
  media?: "venue-map" | "wifi";
  /** Optional ISO timestamps bounding when the item is shown (respects `?time=`). */
  showFrom?: string;
  showUntil?: string;
};

// KuK guest network: after joining, a captive portal asks for the username and password.
// Empty values show "Shared at the venue".
export const WIFI = {
  network: "KUK-Wifi",
  username: "ALPS-2026",
  password: "ALPS-2026",
};

// Donation buttons at the bottom of /links (/links#donate): cards go through Stripe, TWINT through RaiseNow.
export const DONATIONS = {
  card: "https://buy.stripe.com/4gM5kD27t3IC1UQ5HCawo09",
  twint: "https://donate.raisenow.io/bmyqy",
};

const VENUE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Kultur+%26+Kongresshaus+Aarau%2C+Schlossplatz+9%2C+5000+Aarau";
const AFTERPARTY_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&origin=Kultur+%26+Kongresshaus+Aarau%2C+Schlossplatz+9%2C+5000+Aarau&destination=Fl%C3%B6sserstrasse+7%2C+5000+Aarau&travelmode=walking";
const AFTERPARTY_TICKETS_URL =
  "https://eventfrog.ch/de/p/partys/house-techno/afterglow-afterparty-for-the-alps-conference-guestlist-only-7505194045364252288.html";

export const QUICK_LINKS: QuickLink[] = [
  {
    id: "whatsapp",
    label: "WhatsApp group",
    summary: "Join at the welcome desk",
    icon: "whatsapp",
    body: "The attendee group for last-minute changes, lift shares and meeting up during the breaks. It is for ticket holders only, so you join it in person at the welcome desk.",
    details: [
      { label: "How to join", value: "Scan the QR code on the WhatsApp sign at the welcome desk with your phone camera." },
      { label: "Who can join", value: "Conference ticket holders" },
    ],
  },
  {
    id: "program",
    label: "Program",
    summary: "Talks, panels, breaks and experiences",
    icon: "schedule",
    body: "The full timetable for both days, with abstracts and speaker profiles.",
    actions: [
      { label: "Open the program", href: "/#program", internal: true },
      { label: "Add talks to your calendar", href: "/alps-2026-talks.ics", internal: true },
    ],
  },
  {
    id: "booklet",
    label: "Conference booklet",
    summary: "Speakers, abstracts, experiences and partners",
    icon: "booklet",
    body: "Everything in the printed booklet, readable on your phone.",
    actions: [{ label: "Open the booklet", href: "/booklet", internal: true }],
  },
  {
    id: "venue",
    label: "Venue map",
    summary: "Kultur & Kongresshaus Aarau, Schlossplatz 9",
    icon: "map",
    media: "venue-map",
    details: [
      { label: "Experiences", value: "Saal 4 · live concert in Saal 2" },
      { label: "Getting here", value: "A short walk from Aarau station" },
    ],
    actions: [{ label: "Open in Google Maps", href: VENUE_MAPS_URL }],
  },
  {
    id: "wifi",
    label: "Wifi",
    summary: "Connect to KUK-Wifi",
    icon: "wifi",
    media: "wifi",
  },
  {
    id: "dinner",
    label: "Networking dinner",
    summary: "Friday, 19:15–20:15 · pre-sale",
    icon: "dinner",
    body: "Tofu-vegetable curry on rice with herb pesto, a crêpe station, 1 drink included. Buy on Infomaniak or at the ALPS info table at the venue.",
    actions: [{
      label: "Buy a dinner ticket",
      href: "https://infomaniak.events/en-ch/conferences/alps-conference-2026/c2484795-1ae7-4b4b-aa21-c9b8f085008c/events/382409",
    }],
    showUntil: "2026-10-09T19:15:00+02:00",
  },
  {
    id: "afterparty",
    label: "Afterparty",
    summary: "Saturday, 21:30–04:00 · Flösserplatz",
    icon: "afterparty",
    body: "The conference closes with the Afterglow afterparty, right after the Apero finishes. The night runs until 04:00.",
    details: [
      { label: "Where", value: "Jugendkulturhaus Flösserplatz, Flösserstrasse 7, 5000 Aarau" },
      { label: "Getting there", value: "5 minutes on foot from the conference venue" },
      { label: "Entry", lead: "Included in your conference ticket.", value: "The party is guestlist only — if you have friends or family who want to join, have them get on the list via eventfrog." },
      { label: "Lineup", value: "Enero · Psyre · Adage · DK ∞" },
    ],
    actions: [
      { label: "Walking directions", href: AFTERPARTY_DIRECTIONS_URL },
      { label: "Guestlist on eventfrog", href: AFTERPARTY_TICKETS_URL },
    ],
    showUntil: "2026-10-11T04:00:00+02:00",
  },
  {
    id: "feedback",
    label: "Share your feedback",
    summary: "Two minutes that shape next year",
    icon: "feedback",
    body: "Tell us what worked and what we should change for ALPS 2027.",
    actions: [{ label: "Open the survey", href: SURVEY.url }],
    showFrom: "2026-10-10T19:00:00+02:00",
  },
];
