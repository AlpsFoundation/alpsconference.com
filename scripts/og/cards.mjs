// One Open Graph card per page. `slug` names the file (public/og/<slug>.jpg,
// referenced from the page's og:image), `path` is the URL printed on the card.
// Titles are Title Case and short enough for two lines; the subtitle is a
// sentence and takes at most two more. `date` and `place` fill the footer and default to the
// conference's own.
//
// Add a page: append an entry, point the page's og:image at og/<slug>.jpg,
// then run `pnpm og <slug>`.

// Pages under src/pages that deliberately have no card.
export const WITHOUT_CARD = ["3d.astro", "links/cancel.astro"];

export const CONFERENCE_DATE = "9–10 October 2026";
export const CONFERENCE_PLACE = "Kultur & Kongresshaus Aarau";

export const CARDS = [
  {
    slug: "home",
    path: "/",
    title: "ALPS Conference 2026",
    subtitle: "Speakers, research posters, panel discussions and immersive experiences.",
  },
  {
    slug: "workshops",
    path: "/workshops",
    title: "Workshop Day",
    subtitle: "Three parallel training tracks in psychedelic-assisted therapy, accredited for 4 FSP credits.",
    date: "Thursday 8 October 2026",
    place: "13:00–17:00",
    placeIcon: "clock",
  },
  {
    slug: "speaker",
    path: "/speaker",
    title: "Call for Speakers",
    subtitle: "PhD candidates, clinicians and researchers present their work on psychedelic science.",
  },
  {
    slug: "research-poster-guidelines",
    path: "/research-posters/guidelines",
    title: "Research Poster Guidelines",
    subtitle: "Content, format, setting up and presenting your research poster at the conference.",
  },
  {
    slug: "research-posters",
    path: "/research-posters",
    title: "Research Posters",
    subtitle: "Psychedelic science research presented at the conference, with every research poster to read.",
  },
  {
    slug: "booklet",
    path: "/booklet",
    title: "Conference Booklet",
    subtitle: "Program, speakers, experiences, venue map and partners.",
  },
  {
    slug: "links",
    path: "/links",
    title: "Attendee Links",
    subtitle: "What is on now, the program, venue map, wifi and experience sign-ups.",
  },
  {
    slug: "map",
    path: "/map",
    title: "Venue Map",
    subtitle: "Layout plan of the Kultur & Kongresshaus Aarau.",
  },
  {
    slug: "bingo",
    path: "/bingo",
    title: "Conference Bingo",
    subtitle: "Spot stoned ape theory, n=12 studies and other conference classics.",
  },
  {
    slug: "volunteers",
    path: "/volunteers",
    title: "Volunteer Portal",
    subtitle: "Crew shifts, tasks and times.",
  },
  {
    slug: "slides",
    path: "/slides",
    title: "Intermission Slides",
    subtitle: "What's on and what's next, between sessions.",
  },
  {
    slug: "banners",
    path: "/banners",
    title: "Banners",
    subtitle: "Downloadable banners for the newsletter and other channels.",
  },
  {
    slug: "signage",
    path: "/signage",
    title: "Conference Signage",
    subtitle: "Print-ready A4 signs for the venue, from wayfinding to waste sorting.",
  },
];
