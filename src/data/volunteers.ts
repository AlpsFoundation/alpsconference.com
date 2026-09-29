/**
 * Crew shift plan for ALPS Conference 2026, rendered on /volunteers and in the
 * per-person calendar feeds under /volunteers/<name>.ics.
 *
 * Transcribed from "ALPS2026 Shift-Plan FINAL" (FRI grid / SAT grid tabs are the
 * master). This file is public and open source: first names only, no contact
 * details and no private addresses.
 */

export type VolunteerTask = "checkin" | "info" | "mic" | "helper";

export type VolunteerTaskInfo = {
  label: string;
  /** Share of the slot that counts towards a person's hours. */
  weight: number;
  duties: string[];
};

export const VOLUNTEER_TASK_ORDER: VolunteerTask[] = ["checkin", "info", "mic", "helper"];

export const VOLUNTEER_TASKS: Record<VolunteerTask, VolunteerTaskInfo> = {
  checkin: {
    label: "Check-in / Wardrobe",
    weight: 1,
    duties: [
      "Ask the guest’s name and hand out their badge",
      "Check the Networking-Dinner badge – no ticket? Send them to the Info Table to buy one",
      "Hand out the bag and ask: printed booklet or PDF?",
      "Tell guests: wardrobe is self-service · luggage can stay at check-in · Main Stage, Saal 2, Saal 4 (2nd floor, stairs & lift) · toilets",
      "Not sure? Ask a Happy Helper, Philipp or Ece",
    ],
  },
  info: {
    label: "ALPS Info Table",
    weight: 1,
    duties: [
      "Present the ALPS Foundation",
      "Newsletter & membership sign-ups",
      "Merch & donations",
      "Help with activity sign-ups and Networking-Dinner tickets",
      "Answer any other guest questions",
    ],
  },
  mic: {
    label: "Mic (Q&A)",
    weight: 0,
    duties: [
      "Bring the mic to the audience during Q&A",
      "Show time signals to the speaker",
    ],
  },
  helper: {
    label: "Happy Helper",
    weight: 0.5,
    duties: [
      "Report to Philipp or Ece at the start, then stay reachable by phone",
      "Check in with people on shift – do they need anything?",
      "Jump in: cover toilet breaks, replace someone who is sick",
      "Otherwise free time (about half of the shift, usually)",
    ],
  },
};

export const COUNTING_RULE =
  "Check-in and Info Table count in full, Happy Helper counts half (a 30-min slot = 15 min), Mic is not counted.";

export type ShiftSlot = {
  from: string;
  to: string;
  /** Set on the slot where a program item starts; it runs until the next one. */
  program?: string;
} & Record<VolunteerTask, string[]>;

export type ShiftDay = {
  id: "fri" | "sat";
  label: string;
  dateLabel: string;
  dateTime: string;
  slots: ShiftSlot[];
};

export const SHIFT_DAYS: ShiftDay[] = [
  {
    id: "fri",
    label: "Friday",
    dateLabel: "Friday 9 October",
    dateTime: "2026-10-09",
    slots: [
      { from: "08:00", to: "08:30", program: "Doors open", checkin: ["Abigail", "Andrea", "Stela"], info: ["José", "Maria"], mic: [], helper: ["Lennert", "Noor"] },
      { from: "08:30", to: "09:00", checkin: ["Abigail", "Andrea", "Stela"], info: ["José", "Dave"], mic: [], helper: ["Lennert", "Noor"] },
      { from: "09:00", to: "09:15", program: "Opening ALPS team", checkin: ["Andrea", "Stela"], info: ["José", "Dave"], mic: [], helper: ["Michel", "Noor"] },
      { from: "09:15", to: "09:30", checkin: ["Valentin", "Andrea"], info: ["José", "Dave"], mic: [], helper: ["Michel", "Noor"] },
      { from: "09:30", to: "10:00", program: "Max Wolff", checkin: ["Valentin"], info: ["Cyril"], mic: [], helper: ["Michel", "Abigail"] },
      { from: "10:00", to: "10:30", checkin: ["Valentin"], info: ["Michel"], mic: ["Andrea", "Lennert"], helper: ["Marina", "Abigail"] },
      { from: "10:30", to: "10:45", program: "Coffee break", checkin: ["Valentin"], info: ["Michel", "Gerel"], mic: [], helper: ["Marina", "Abigail"] },
      { from: "10:45", to: "11:00", checkin: ["Akram"], info: ["Cyril", "Gerel"], mic: [], helper: ["Andrea", "Dave"] },
      { from: "11:00", to: "11:15", program: "Morten Lietz", checkin: ["Akram"], info: ["Cyril"], mic: [], helper: ["Andrea", "Dave"] },
      { from: "11:15", to: "11:30", checkin: ["Akram"], info: ["Gerel"], mic: [], helper: ["Cyril", "Dave"] },
      { from: "11:30", to: "12:00", checkin: ["Akram"], info: ["Gerel"], mic: ["Andrea", "Stela"], helper: ["Cyril", "Michel"] },
      { from: "12:00", to: "12:15", program: "Tommaso Barba", checkin: ["Stela"], info: ["Gerel"], mic: [], helper: ["Federico", "Michel"] },
      { from: "12:15", to: "12:30", checkin: ["Stela"], info: ["Gerel"], mic: [], helper: ["Federico", "Michel"] },
      { from: "12:30", to: "12:45", checkin: ["Akram"], info: ["Noor"], mic: ["Andrea", "Stela"], helper: ["Federico", "Gerel"] },
      { from: "12:45", to: "13:00", checkin: ["Akram"], info: ["Noor"], mic: ["Andrea", "Stela"], helper: ["Federico", "Gerel"] },
      { from: "13:00", to: "13:30", program: "Lunch break", checkin: ["Akram"], info: ["Noor", "Marina"], mic: [], helper: ["Federico", "Gerel"] },
      { from: "13:30", to: "13:45", checkin: ["Lennert"], info: ["Noor", "Federico"], mic: [], helper: ["Akram", "Gerel"] },
      { from: "13:45", to: "14:00", checkin: ["Lennert"], info: ["José", "Valentin"], mic: [], helper: ["Akram", "Dave"] },
      { from: "14:00", to: "14:15", checkin: ["Lennert"], info: ["José", "Valentin"], mic: [], helper: ["Federico", "Dave"] },
      { from: "14:15", to: "14:30", checkin: ["Lennert"], info: ["José", "Michel"], mic: [], helper: ["Federico", "Dave"] },
      { from: "14:30", to: "15:00", program: "Manal Al-Hammadi", checkin: ["Lennert"], info: ["Michel"], mic: [], helper: ["Andrea", "Dave"] },
      { from: "15:00", to: "15:30", checkin: ["Lennert"], info: ["Maria"], mic: ["Andrea", "Stela"], helper: ["Marina", "Dave"] },
      { from: "15:30", to: "15:45", program: "Sandeep Nayak", checkin: ["Andrea"], info: ["Maria"], mic: [], helper: ["Marina", "Cyril"] },
      { from: "15:45", to: "16:00", checkin: ["Andrea"], info: ["Maria"], mic: [], helper: ["Marina", "Cyril"] },
      { from: "16:00", to: "16:30", checkin: ["DK"], info: ["Maria"], mic: ["Andrea", "Lennert"], helper: ["Marina", "Parsa"] },
      { from: "16:30", to: "16:45", program: "Coffee break", checkin: ["Marina"], info: ["Maria", "Lennert"], mic: [], helper: ["Noor", "DK"] },
      { from: "16:45", to: "17:00", checkin: ["Marina"], info: ["José", "Lennert"], mic: [], helper: ["Noor", "DK"] },
      { from: "17:00", to: "17:15", program: "Coffee break (until 17:15)", checkin: ["Stela"], info: ["José", "Abigail"], mic: [], helper: ["Cyril", "DK"] },
      { from: "17:15", to: "17:45", program: "Amandine Luquiens", checkin: ["Stela"], info: ["DK"], mic: [], helper: ["Cyril", "Parsa"] },
      { from: "17:45", to: "18:15", checkin: ["Marina"], info: ["DK"], mic: ["Andrea", "Stela"], helper: ["Cyril", "Parsa"] },
      { from: "18:15", to: "18:45", program: "Panel 1", checkin: ["DK"], info: ["Abigail"], mic: [], helper: ["Akram", "Parsa"] },
      { from: "18:45", to: "19:00", checkin: ["DK"], info: ["Abigail"], mic: ["Andrea", "Lennert"], helper: ["Akram", "Parsa"] },
      { from: "19:00", to: "19:15", checkin: ["DK"], info: ["Maria"], mic: ["Andrea", "Lennert"], helper: ["Akram", "Parsa"] },
      { from: "19:15", to: "19:45", program: "Networking dinner (optional)", checkin: ["Stela"], info: ["Maria", "José"], mic: [], helper: [] },
      { from: "19:45", to: "20:15", checkin: ["Stela"], info: ["José"], mic: [], helper: [] },
      { from: "20:15", to: "21:15", program: "Friday evening program", checkin: ["Stela"], info: ["José"], mic: [], helper: [] },
    ],
  },
  {
    id: "sat",
    label: "Saturday",
    dateLabel: "Saturday 10 October",
    dateTime: "2026-10-10",
    slots: [
      { from: "08:00", to: "09:00", program: "Doors open", checkin: ["Abigail", "Andrea"], info: ["José", "Maria"], mic: [], helper: ["Dave", "Gerel"] },
      { from: "09:00", to: "09:30", program: "Pablo Mallaroni", checkin: ["Parsa"], info: ["Maria"], mic: [], helper: ["Dave", "Gerel"] },
      { from: "09:30", to: "09:45", checkin: ["Parsa"], info: ["Maria"], mic: ["Lennert", "Stela"], helper: ["Dave", "Gerel"] },
      { from: "09:45", to: "10:00", checkin: ["Parsa"], info: ["Maria"], mic: ["Lennert", "Stela"], helper: ["Dave", "Valentin"] },
      { from: "10:00", to: "10:30", program: "Eric Vermetten", checkin: ["Parsa"], info: ["Abigail"], mic: [], helper: ["DK", "Valentin"] },
      { from: "10:30", to: "10:45", checkin: ["Parsa"], info: ["Michel"], mic: ["Andrea", "Stela"], helper: ["DK", "Valentin"] },
      { from: "10:45", to: "11:00", checkin: ["Marina"], info: ["Michel"], mic: ["Andrea", "Stela"], helper: ["DK", "Cyril"] },
      { from: "11:00", to: "11:15", program: "Break", checkin: ["Marina"], info: ["Michel", "Valentin"], mic: [], helper: ["DK", "Cyril"] },
      { from: "11:15", to: "11:30", checkin: ["Parsa"], info: ["José", "Valentin"], mic: [], helper: ["Akram", "Noor"] },
      { from: "11:30", to: "12:00", program: "Lydia Belinger", checkin: ["Parsa"], info: ["José"], mic: [], helper: ["Akram", "Noor"] },
      { from: "12:00", to: "12:30", checkin: ["Parsa"], info: ["José"], mic: ["Andrea", "Lennert"], helper: ["Akram", "Noor"] },
      { from: "12:30", to: "12:45", program: "Lunch break", checkin: ["Valentin"], info: ["José", "Akram"], mic: [], helper: ["Michel", "Federico"] },
      { from: "12:45", to: "13:00", checkin: ["Valentin"], info: ["Noor", "Akram"], mic: [], helper: ["Michel", "Federico"] },
      { from: "13:00", to: "13:15", checkin: ["Valentin"], info: ["Noor", "Gerel"], mic: [], helper: ["Akram", "Federico"] },
      { from: "13:15", to: "13:30", checkin: ["Valentin"], info: ["Noor", "Gerel"], mic: [], helper: ["DK", "Federico"] },
      { from: "13:30", to: "13:45", checkin: ["Stela"], info: ["Noor", "Gerel"], mic: [], helper: ["DK", "Parsa"] },
      { from: "13:45", to: "14:00", checkin: ["Stela"], info: ["Michel", "Gerel"], mic: [], helper: ["DK", "Parsa"] },
      { from: "14:00", to: "14:15", program: "Matthias Forstmann", checkin: ["Stela"], info: ["Michel"], mic: [], helper: ["DK", "Andrea"] },
      { from: "14:15", to: "14:30", checkin: ["Stela"], info: ["Michel"], mic: [], helper: ["DK", "Andrea"] },
      { from: "14:30", to: "14:45", checkin: ["Stela"], info: ["Federico"], mic: ["Andrea", "Lennert"], helper: ["DK", "Michel"] },
      { from: "14:45", to: "15:00", checkin: ["Stela"], info: ["Federico"], mic: ["Andrea", "Lennert"], helper: ["Cyril", "Michel"] },
      { from: "15:00", to: "15:30", program: "Eirini Ketzitzidou Argyri", checkin: ["Stela"], info: ["Lennert"], mic: [], helper: ["Cyril", "Marina"] },
      { from: "15:30", to: "16:00", checkin: ["Akram"], info: ["José"], mic: ["Andrea", "Lennert"], helper: ["Cyril", "Marina"] },
      { from: "16:00", to: "16:30", program: "Coffee break + group photo", checkin: ["Akram"], info: ["José", "Lennert"], mic: [], helper: ["Cyril", "Marina"] },
      { from: "16:30", to: "17:00", checkin: ["DK"], info: ["Maria", "Valentin"], mic: [], helper: ["Cyril", "Noor"] },
      { from: "17:00", to: "17:30", program: "Jason K. Day", checkin: ["DK"], info: ["Maria"], mic: [], helper: ["Cyril", "Akram"] },
      { from: "17:30", to: "18:00", checkin: ["Marina"], info: ["Maria"], mic: ["Lennert", "Stela"], helper: ["Cyril", "Akram"] },
      { from: "18:00", to: "18:30", program: "Panel 2", checkin: ["Stela"], info: ["Lennert"], mic: [], helper: ["Cyril", "Marina"] },
      { from: "18:30", to: "19:00", checkin: ["Lennert"], info: ["Parsa"], mic: ["Andrea", "Stela"], helper: ["Michel", "Marina"] },
      { from: "19:00", to: "19:30", program: "Closing talk", checkin: ["Lennert"], info: ["Parsa"], mic: [], helper: ["DK", "Marina"] },
      { from: "19:30", to: "20:00", program: "Networking apéro", checkin: ["Stela"], info: ["José", "Noor"], mic: [], helper: [] },
      { from: "20:00", to: "20:30", checkin: ["Stela"], info: ["José", "Marina"], mic: [], helper: [] },
      { from: "20:30", to: "21:00", checkin: ["Stela"], info: ["José", "Maria"], mic: [], helper: [] },
      { from: "21:00", to: "21:30", checkin: ["Stela"], info: ["Gerel", "Maria"], mic: [], helper: [] },
      { from: "21:30", to: "22:00", checkin: ["Stela"], info: ["Maria"], mic: [], helper: [] },
    ],
  },
];

export type CrewEvent = {
  id: string;
  title: string;
  /** `YYYY-MM-DD` */
  dateTime: string;
  /** The plan only gives a start time. */
  start: string;
  /** "≈ 15:00" in the plan. */
  approximate?: boolean;
  /** Length of the calendar entry only; the plan sets no end time. */
  calendarMinutes: number;
  place: string;
  /** Omitted when the whole crew is expected. */
  people?: string[];
};

/** Everything outside the shift grid. Not counted in the hours. */
export const CREW_EVENTS: CrewEvent[] = [
  {
    id: "loading",
    title: "Loading",
    dateTime: "2026-10-08",
    start: "09:45",
    calendarMinutes: 120,
    place: "Bern",
    people: ["Philipp", "Matthias", "Ece", "Andrea", "Olga", "Myriam", "Abel", "José", "Akram"],
  },
  {
    id: "power-circle-fri",
    title: "Morning power circle",
    dateTime: "2026-10-09",
    start: "07:00",
    calendarMinutes: 30,
    place: "Kultur & Kongresshaus Aarau",
  },
  {
    id: "power-circle-sat",
    title: "Morning power circle",
    dateTime: "2026-10-10",
    start: "07:30",
    calendarMinutes: 30,
    place: "Kultur & Kongresshaus Aarau",
  },
  {
    id: "dismantling",
    title: "Dismantling",
    dateTime: "2026-10-10",
    start: "21:30",
    calendarMinutes: 60,
    place: "Kultur & Kongresshaus Aarau",
  },
  {
    id: "unloading",
    title: "Unloading",
    dateTime: "2026-10-11",
    start: "15:00",
    approximate: true,
    calendarMinutes: 120,
    place: "Bern",
    people: ["Philipp", "Matthias", "Parsa", "Federico", "Mourad", "Régis"],
  },
];

/**
 * Crew members who are on the ALPS team, with their booklet photo
 * (`public/img/booklet/team/<photo>.jpg`) where we know which one it is.
 * Everyone else on the crew is listed as a volunteer.
 */
export const TEAM_PHOTOS: Record<string, string | null> = {
  Abigail: "abigail-calder",
  Akram: "akram-elrhaoussi",
  // Two Andreas on the team (Bacconi, Sader): no photo until we know which one is on shift.
  Andrea: null,
  Cyril: "cyril-petignat",
  Dave: "david-wennberg",
  Ece: "ece-baloglu",
  Federico: "federico-seragnoli",
  Gerel: "gerel-jargalsaikhan",
  Lennert: "lennert-van-de-kreeke",
  Maria: "maria-tudor",
  Marina: "marina-millan",
  Matthias: "matthias-leitner",
  Michel: "michel-huissoud",
  Mourad: "mourad-chouaki",
  Noor: "noor-charkhi",
  Parsa: "parsa-yousefi",
  Philipp: "philipp-hampel",
  Régis: "regis-paroz",
  Valentin: "valentin-rieder",
};

export const CREW_CONTACTS = {
  changes: "Philipp",
  onSite: ["Philipp", "Ece"],
};
