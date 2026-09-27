// Layout plan for the Kultur & Kongresshaus Aarau (ALPS Conference 2026).
// The drawing itself is the architect's export in public/img/venue-plan.svg;
// swap that file for a new revision and re-check the marker positions below.

export const VENUE_PLAN_SRC = "img/venue-plan.svg";

/** Crop of the export's 1190×842 artboard that holds the floor plan. */
export const VENUE_PLAN_VIEW = { x: 84, y: 134, w: 1052, h: 432 };

export type VenueSection = {
  id: string;
  title: string;
  /** `upstairs` items sit on the floor above: their marker is a stairs pill on the staircase. */
  items: { n: number; label: string; upstairs?: boolean }[];
};

export const VENUE_SECTIONS: VenueSection[] = [
  {
    id: "alps",
    title: "ALPS",
    items: [
      { n: 1, label: "Check in" },
      { n: 2, label: "Merchandising" },
      { n: 3, label: "Main Stage" },
      { n: 4, label: "ALPS Posters" },
      { n: 5, label: "Experiences (Saal 4)", upstairs: true },
    ],
  },
  {
    id: "lounges",
    title: "Lounges + Catering",
    items: [
      { n: 6, label: "Lounges" },
      { n: 7, label: "Catering and food installation" },
    ],
  },
  {
    id: "posters",
    title: "Research Posters + Info Tables",
    items: [
      { n: 8, label: "Research posters" },
      { n: 9, label: "Info table" },
      { n: 10, label: "Info table" },
      { n: 11, label: "Info table" },
    ],
  },
  {
    id: "art",
    title: "LSD Blotter Art Exhibition + Live Painting Art Corner",
    items: [
      { n: 12, label: "LSD Blotter Art Exhibition" },
      { n: 13, label: "Live Painting Art Corner" },
    ],
  },
];

/** Centres of the markers in the source drawing (user units). */
export const VENUE_MARKERS: { n: number; x: number; y: number }[] = [
  { n: 1, x: 522, y: 469 },
  { n: 2, x: 505, y: 326 },
  { n: 3, x: 992, y: 385 },
  { n: 4, x: 178, y: 246 },
  { n: 5, x: 566, y: 194 }, // on the staircase at the top of the plan
  { n: 6, x: 465, y: 203 },
  { n: 6, x: 320, y: 326 },
  { n: 6, x: 344, y: 450 },
  { n: 7, x: 419, y: 385 },
  { n: 8, x: 159, y: 449 },
  { n: 9, x: 240, y: 314 },
  { n: 10, x: 175, y: 294 },
  { n: 11, x: 176, y: 325 },
  { n: 12, x: 594, y: 390 },
  { n: 13, x: 310, y: 439 },
];

export type VenueColors = {
  paper: string;
  ink: string;
  wall: string;
  furniture: string;
  detail: string;
  display: string;
  grid: string;
  marker: string;
  hot: string;
};

export const VENUE_PALETTES: Record<string, { label: string; colors: VenueColors }> = {
  blueprint: {
    label: "Blueprint",
    colors: { paper: "#0e4a78", ink: "#ffffff", wall: "#2a6a9f", furniture: "#ffffff", detail: "#86aed3", display: "#f38fbf", grid: "#1a5889", marker: "#ffffff", hot: "#ff4fa3" },
  },
  white: {
    label: "White",
    colors: { paper: "#ffffff", ink: "#1b4f8a", wall: "#d9e6f4", furniture: "#2f7fc1", detail: "#a9c2de", display: "#e0336b", grid: "#e4edf7", marker: "#123e67", hot: "#ff2d95" },
  },
  navy: {
    label: "ALPS Navy",
    colors: { paper: "#ffffff", ink: "#123e67", wall: "#e2e8ee", furniture: "#3d6a93", detail: "#b7c6d4", display: "#123e67", grid: "#eef2f6", marker: "#123e67", hot: "#ff2d95" },
  },
  graphite: {
    label: "Graphite",
    colors: { paper: "#ffffff", ink: "#2a2d31", wall: "#e9eaec", furniture: "#6c737c", detail: "#c4c8cd", display: "#d9480f", grid: "#f0f1f2", marker: "#2a2d31", hot: "#ff2d95" },
  },
  terracotta: {
    label: "Terracotta",
    colors: { paper: "#ffffff", ink: "#5b3b2a", wall: "#f1e6da", furniture: "#b8653b", detail: "#d9c3ae", display: "#2f6f8f", grid: "#f5eee6", marker: "#5b3b2a", hot: "#ff2d95" },
  },
  original: {
    label: "Original",
    colors: { paper: "#ffffff", ink: "#000000", wall: "#000000", furniture: "#1e78a9", detail: "#bebebe", display: "#ff0000", grid: "#f2f2f2", marker: "#ff00ff", hot: "#ff2d95" },
  },
};

export const VENUE_COLOR_KNOBS: [keyof VenueColors, string][] = [
  ["paper", "Paper"],
  ["ink", "Ink"],
  ["wall", "Walls"],
  ["furniture", "Furniture"],
  ["detail", "Details"],
  ["display", "Displays"],
  ["grid", "Grid"],
  ["marker", "Markers"],
  ["hot", "Highlight"],
];
