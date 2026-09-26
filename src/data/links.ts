/**
 * Quick links on /links, each shown as an accordion item. Leave an action's `href`
 * empty to show it as "coming soon". Items open from the URL hash, e.g. /links#afterparty.
 */

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
  details?: { label: string; value: string }[];
  actions?: QuickLinkAction[];
  /** Special content rendered inside the item. */
  media?: "venue-map" | "wifi";
  /** Optional ISO timestamps bounding when the item is shown (respects `?time=`). */
  showFrom?: string;
  showUntil?: string;
};

// TODO: paste the WhatsApp community invite link.
export const WHATSAPP_COMMUNITY_URL = "";

// TODO: fill in the venue wifi before the conference. Empty values show "Shared at the venue".
export const WIFI = {
  network: "",
  password: "",
};

// TODO: add a floor plan (e.g. "img/venue-map.png" in public/). Empty shows a placeholder.
export const VENUE_MAP_IMAGE = "";

const VENUE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Kultur+%26+Kongresshaus+Aarau%2C+Schlossplatz+9%2C+5000+Aarau";
const AFTERPARTY_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&origin=Kultur+%26+Kongresshaus+Aarau%2C+Schlossplatz+9%2C+5000+Aarau&destination=Fl%C3%B6sserstrasse+7%2C+5000+Aarau&travelmode=walking";
const AFTERPARTY_TICKETS_URL =
  "https://eventfrog.ch/de/p/partys/house-techno/afterglow-afterparty-for-the-alps-conference-guestlist-only-7505194045364252288.html";

export const QUICK_LINKS: QuickLink[] = [
  {
    id: "whatsapp",
    label: "WhatsApp community",
    summary: "Announcements and chat with other attendees",
    icon: "whatsapp",
    body: "Join the attendee community for last-minute changes, lift shares and meeting up during the breaks.",
    actions: [{ label: "Join the community", href: WHATSAPP_COMMUNITY_URL }],
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
    summary: "Network and password",
    icon: "wifi",
    media: "wifi",
  },
  {
    id: "dinner",
    label: "Networking dinner",
    summary: "Friday, 19:15–20:15 · pre-sale",
    icon: "dinner",
    body: "Tofu-vegetable curry on rice with herb pesto, a crêpe station, drinks included. Buy on Infomaniak or at the ALPS info table at the venue.",
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
    body: "The conference closes with the Afterglow afterparty. Music starts at 22:00 and the night runs until 04:00.",
    details: [
      { label: "Where", value: "Jugendkulturhaus Flösserplatz, Flösserstrasse 7, 5000 Aarau" },
      { label: "Getting there", value: "5 minutes on foot from the conference venue" },
      { label: "Entry", value: "Included in your conference ticket. The party is guestlist only — get on the list via eventfrog" },
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
    // TODO: paste the feedback survey link.
    actions: [{ label: "Open the survey", href: "" }],
    showFrom: "2026-10-10T19:00:00+02:00",
  },
];
