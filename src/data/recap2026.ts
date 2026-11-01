/**
 * Photos for the "This was ALPS 2026" recap (public/img/recap-2026/), in carousel order.
 * Originals: ALPS Shared › 70_Media Library › 73_Photos › ALPS Conf 2026 (Max Lüdicke's sets and the
 * team's phone shots). `greenfinity` marks the photos where Greenfinity's moss decoration is visible,
 * so the caption can credit them.
 */
export type RecapPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  greenfinity?: boolean;
};

export const RECAP_PHOTOS: RecapPhoto[] = [
  {
    src: "outside-banner.webp",
    width: 1066,
    height: 1600,
    alt: "Three attendees talking and smiling outside the venue under the ALPS banner",
    caption: "Catching up in front of the Kultur & Kongresshaus Aarau",
  },
  {
    src: "entrance-mushroom.webp",
    width: 1200,
    height: 1600,
    alt: "A giant red inflatable mushroom on the entrance steps of the Kultur & Kongresshaus Aarau",
    caption: "Hard to miss: the way in",
  },
  {
    src: "addiction-talk.webp",
    width: 1068,
    height: 1600,
    alt: "A speaker on the main stage in front of a slide on biological and social views of addiction",
    caption: "Talks on the main stage",
  },
  {
    src: "therapy-panel.webp",
    width: 1067,
    height: 1600,
    alt: "Five panelists in conversation on the purple-lit stage below a slide on psychedelic-assisted therapy",
    caption: "Panel on psychedelic-assisted therapy",
  },
  {
    src: "main-hall.webp",
    width: 1600,
    height: 1200,
    alt: "The main hall with its chandeliers, a panel on stage and a full audience",
    caption: "The main hall during a panel",
  },
  {
    src: "merch-moss.webp",
    width: 1600,
    height: 1200,
    alt: "The ALPS merch table with T-shirts, moss trays and wooden ALPS letters filled with moss",
    caption: "Moss trays and the ALPS moss letters on the merch table",
    greenfinity: true,
  },
  {
    src: "art-corner.webp",
    width: 1066,
    height: 1600,
    alt: "Attendees painting together on cushions in front of an exhibition of visionary art",
    caption: "Painting together in the art corner",
  },
  {
    src: "sound-journey.webp",
    width: 1066,
    height: 1600,
    alt: "A facilitator playing a chime over participants lying on mats",
    caption: "A sound experience between the sessions",
  },
  {
    src: "stairs-banner.webp",
    width: 1200,
    height: 1600,
    alt: "Two attendees sitting on the stairs under the ALPS mountain banner",
    caption: "A break on the stairs",
  },
];
