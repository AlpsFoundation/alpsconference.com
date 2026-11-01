/**
 * Photos for the "This was ALPS 2026" recap (public/img/recap-2026/), in carousel order.
 * Originals: ALPS Shared › 70_Media Library › 73_Photos › ALPS Conf 2026 (Max Lüdicke's sets and a few
 * of the team's phone shots).
 */
export type RecapPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const RECAP_PHOTOS: RecapPhoto[] = [
  { src: "outside-banner.webp", width: 1066, height: 1600, alt: "Three attendees talking and smiling outside the venue under the ALPS banner" },
  { src: "entrance-mushroom.webp", width: 1200, height: 1600, alt: "A giant red inflatable mushroom on the entrance steps of the Kultur & Kongresshaus Aarau" },
  { src: "lectern-triangle.webp", width: 1600, height: 1067, alt: "A speaker at the lectern beside the illuminated ALPS triangle on the main stage" },
  { src: "addiction-talk.webp", width: 1068, height: 1600, alt: "A speaker on the main stage in front of a slide on biological and social views of addiction" },
  { src: "speaker-slide.webp", width: 1067, height: 1600, alt: "A speaker in a light blazer pointing up at his slide on the dark stage" },
  { src: "therapy-panel.webp", width: 1067, height: 1600, alt: "Five panelists in conversation on the purple-lit stage below a slide on psychedelic-assisted therapy" },
  { src: "speaker-purple.webp", width: 1067, height: 1600, alt: "A speaker gesturing with both hands on the purple-lit stage" },
  { src: "main-hall.webp", width: 1600, height: 1200, alt: "The main hall with its chandeliers, a panel on stage and a full audience" },
  { src: "speaker-scarf.webp", width: 1067, height: 1600, alt: "A speaker in a scarf holding a clicker and gesturing on the purple stage" },
  { src: "art-corner.webp", width: 1066, height: 1600, alt: "Attendees painting together on cushions in front of an exhibition of visionary art" },
  { src: "speaker-blazer.webp", width: 1067, height: 1600, alt: "A speaker in a brown blazer and glasses gesturing while presenting" },
  { src: "sound-journey.webp", width: 1066, height: 1600, alt: "A facilitator playing a chime over participants lying on mats" },
  { src: "speaker-badge.webp", width: 1067, height: 1600, alt: "A speaker with an ALPS badge at the lectern against a dark background" },
  { src: "stairs-banner.webp", width: 1200, height: 1600, alt: "Two attendees sitting on the stairs under the ALPS mountain banner" },
];
