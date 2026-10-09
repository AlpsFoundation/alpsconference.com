/**
 * Crew shift plan for ALPS Conference 2026, rendered on /volunteers and in the
 * per-person calendar feeds under /volunteers/<name>.ics.
 *
 * Transcribed from "ALPS2026 Shift-Plan FINALv2" (FRI grid / SAT grid tabs are the
 * master; catering from its Catering tab). This file is public and open source: first names only, no contact
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
      { from: "08:00", to: "08:30", program: "Doors open", checkin: ["Abigail", "Andrea", "Simon"], info: ["José", "Maria"], mic: [], helper: ["Lennert", "Noor"] },
      { from: "08:30", to: "09:00", checkin: ["Abigail", "Andrea", "Simon"], info: ["José", "Dave"], mic: [], helper: ["Lennert", "Noor"] },
      { from: "09:00", to: "09:15", program: "Opening ALPS team", checkin: ["Valentin"], info: ["José", "Dave"], mic: [], helper: ["Michel", "Noor"] },
      { from: "09:15", to: "09:30", checkin: ["Valentin"], info: ["José", "Dave"], mic: [], helper: ["Michel", "Noor"] },
      { from: "09:30", to: "10:00", program: "Max Wolff", checkin: ["Valentin"], info: ["Cyril"], mic: [], helper: ["Michel", "Abigail"] },
      { from: "10:00", to: "10:30", checkin: ["Valentin"], info: ["Michel"], mic: ["Andrea", "Lennert"], helper: ["Marina", "Abigail"] },
      { from: "10:30", to: "10:45", program: "Coffee break", checkin: ["Valentin"], info: ["Michel", "Gerel"], mic: [], helper: ["Marina", "Abigail"] },
      { from: "10:45", to: "11:00", checkin: ["Akram"], info: ["Cyril", "Gerel"], mic: [], helper: ["Andrea", "Dave"] },
      { from: "11:00", to: "11:15", program: "Morten Lietz", checkin: ["Akram"], info: ["Cyril"], mic: [], helper: ["Andrea", "Dave"] },
      { from: "11:15", to: "11:30", checkin: ["Akram"], info: ["Gerel"], mic: [], helper: ["Cyril", "Dave"] },
      { from: "11:30", to: "12:00", checkin: ["Akram"], info: ["Gerel"], mic: ["Andrea", "Lennert"], helper: ["Cyril", "Michel"] },
      { from: "12:00", to: "12:15", program: "Tommaso Barba", checkin: ["Maximilian"], info: ["Gerel"], mic: [], helper: ["Federico", "Michel"] },
      { from: "12:15", to: "12:30", checkin: ["Maximilian"], info: ["Gerel"], mic: [], helper: ["Federico", "Michel"] },
      { from: "12:30", to: "12:45", checkin: ["Akram"], info: ["Noor"], mic: ["Andrea", "Lennert"], helper: ["Federico", "Gerel"] },
      { from: "12:45", to: "13:00", checkin: ["Akram"], info: ["Noor"], mic: ["Andrea", "Lennert"], helper: ["Federico", "Gerel"] },
      { from: "13:00", to: "13:30", program: "Lunch break", checkin: ["Akram"], info: ["Noor", "Marina"], mic: [], helper: ["Federico", "Gerel"] },
      { from: "13:30", to: "13:45", checkin: ["Lennert"], info: ["Noor", "Federico"], mic: [], helper: ["Akram", "Gerel"] },
      { from: "13:45", to: "14:00", checkin: ["Lennert"], info: ["José", "Valentin"], mic: [], helper: ["Akram", "Dave"] },
      { from: "14:00", to: "14:15", checkin: ["Lennert"], info: ["Federico", "Valentin"], mic: [], helper: ["Dave"] },
      { from: "14:15", to: "14:30", checkin: ["Lennert"], info: ["Federico", "Michel"], mic: [], helper: ["Dave"] },
      { from: "14:30", to: "15:00", program: "Manal Al-Hammadi", checkin: ["Lennert"], info: ["Michel"], mic: [], helper: ["Andrea", "Dave"] },
      { from: "15:00", to: "15:30", checkin: ["Maximilian"], info: ["Maria"], mic: ["Andrea", "Lennert"], helper: ["Marina", "Dave"] },
      { from: "15:30", to: "15:45", program: "Sandeep Nayak", checkin: ["Andrea"], info: ["Maria"], mic: [], helper: ["Marina", "Cyril"] },
      { from: "15:45", to: "16:00", checkin: ["Andrea"], info: ["Maria"], mic: [], helper: ["Marina", "Cyril"] },
      { from: "16:00", to: "16:30", checkin: ["Marina"], info: ["Maria"], mic: ["Andrea", "Lennert"], helper: ["Parsa"] },
      { from: "16:30", to: "16:45", program: "Coffee break", checkin: ["Marina"], info: ["Maria", "Lennert"], mic: [], helper: ["Noor"] },
      { from: "16:45", to: "17:00", checkin: ["Marina"], info: ["José", "Lennert"], mic: [], helper: ["Noor"] },
      { from: "17:00", to: "17:15", program: "Coffee break (until 17:15)", checkin: ["Stela"], info: ["José", "Abigail"], mic: [], helper: ["Cyril"] },
      { from: "17:15", to: "17:45", program: "Amandine Luquiens", checkin: ["Stela"], info: ["Federico"], mic: [], helper: ["Cyril", "Parsa"] },
      { from: "17:45", to: "18:00", checkin: ["Stela"], info: ["DK"], mic: ["Andrea", "Lennert"], helper: ["Cyril", "Parsa"] },
      { from: "18:00", to: "18:15", checkin: ["Marina"], info: ["DK"], mic: ["Andrea", "Lennert"], helper: ["Cyril", "Parsa"] },
      { from: "18:15", to: "18:45", program: "Panel 1", checkin: ["DK"], info: ["Abigail"], mic: [], helper: ["Akram", "Parsa"] },
      { from: "18:45", to: "19:00", checkin: ["DK"], info: ["Abigail"], mic: ["Andrea", "Lennert"], helper: ["Akram", "Parsa"] },
      { from: "19:00", to: "19:15", checkin: ["DK"], info: ["Maria"], mic: ["Andrea", "Lennert"], helper: ["Akram", "Parsa"] },
      { from: "19:15", to: "19:45", program: "Networking dinner (optional)", checkin: ["Matthias"], info: ["Maria", "José"], mic: [], helper: [] },
      { from: "19:45", to: "20:15", checkin: ["Matthias"], info: ["José"], mic: [], helper: [] },
      { from: "20:15", to: "21:15", program: "Friday evening program", checkin: ["Benedikt"], info: ["José"], mic: [], helper: [] },
    ],
  },
  {
    id: "sat",
    label: "Saturday",
    dateLabel: "Saturday 10 October",
    dateTime: "2026-10-10",
    slots: [
      { from: "08:00", to: "08:30", program: "Doors open", checkin: ["Abigail"], info: ["José", "Maria"], mic: [], helper: ["Dave", "Gerel"] },
      // Andrea Bacconi leads yoga 08:10–08:50, so Parsa starts his check-in shift here instead.
      { from: "08:30", to: "09:00", checkin: ["Abigail", "Parsa"], info: ["José", "Maria"], mic: [], helper: ["Dave", "Gerel"] },
      { from: "09:00", to: "09:30", program: "Pablo Mallaroni", checkin: ["Parsa"], info: ["Maria"], mic: [], helper: ["Dave", "Gerel"] },
      { from: "09:30", to: "09:45", checkin: ["Parsa"], info: ["Maria"], mic: ["Andrea", "Lennert"], helper: ["Dave", "Gerel"] },
      { from: "09:45", to: "10:00", checkin: ["Parsa"], info: ["Maria"], mic: ["Andrea", "Lennert"], helper: ["Dave", "Valentin"] },
      { from: "10:00", to: "10:30", program: "Eric Vermetten", checkin: ["DK"], info: ["Abigail"], mic: [], helper: ["Parsa", "Valentin"] },
      { from: "10:30", to: "10:45", checkin: ["DK"], info: ["Michel"], mic: ["Andrea", "Lennert"], helper: ["Parsa", "Valentin"] },
      { from: "10:45", to: "11:00", checkin: ["Marina"], info: ["Michel"], mic: ["Andrea", "Lennert"], helper: ["DK", "Cyril"] },
      { from: "11:00", to: "11:15", program: "Break", checkin: ["Marina"], info: ["Michel", "Valentin"], mic: [], helper: ["DK", "Cyril"] },
      { from: "11:15", to: "11:30", checkin: ["Parsa"], info: ["José", "Valentin"], mic: [], helper: ["Akram", "Noor"] },
      { from: "11:30", to: "12:00", program: "Lydia Belinger", checkin: ["Parsa"], info: ["José"], mic: [], helper: ["Akram", "Noor"] },
      { from: "12:00", to: "12:30", checkin: ["Parsa"], info: ["José"], mic: ["Andrea", "Lennert"], helper: ["Akram", "Noor"] },
      { from: "12:30", to: "12:45", program: "Lunch break", checkin: ["Valentin"], info: ["José", "Akram"], mic: [], helper: ["Michel", "Federico"] },
      { from: "12:45", to: "13:00", checkin: ["Valentin"], info: ["Noor", "Akram"], mic: [], helper: ["Michel", "Federico"] },
      { from: "13:00", to: "13:15", checkin: ["Valentin"], info: ["Noor", "Gerel"], mic: [], helper: ["Akram", "Federico"] },
      { from: "13:15", to: "13:30", checkin: ["Valentin"], info: ["Noor", "Gerel"], mic: [], helper: ["DK", "Federico"] },
      { from: "13:30", to: "13:45", checkin: ["Myriam"], info: ["Noor", "Gerel"], mic: [], helper: ["DK", "Andrea"] },
      { from: "13:45", to: "14:00", checkin: ["Myriam"], info: ["Michel", "Gerel"], mic: [], helper: ["DK", "Andrea"] },
      { from: "14:00", to: "14:15", program: "Matthias Forstmann", checkin: ["Myriam"], info: ["Michel"], mic: [], helper: ["DK", "Andrea"] },
      { from: "14:15", to: "14:30", checkin: ["Myriam"], info: ["Michel"], mic: [], helper: ["DK", "Andrea"] },
      { from: "14:30", to: "14:45", checkin: ["Sophia"], info: ["Federico"], mic: ["Andrea", "Lennert"], helper: ["DK", "Michel"] },
      { from: "14:45", to: "15:00", checkin: ["Sophia"], info: ["Federico"], mic: ["Andrea", "Lennert"], helper: ["Cyril", "Michel"] },
      { from: "15:00", to: "15:30", program: "Eirini Ketzitzidou Argyri", checkin: ["Sophia"], info: ["Lennert"], mic: [], helper: ["Cyril", "Marina"] },
      { from: "15:30", to: "16:00", checkin: ["Akram"], info: ["José"], mic: ["Andrea", "Lennert"], helper: ["Cyril", "Marina"] },
      { from: "16:00", to: "16:30", program: "Coffee break + group photo", checkin: ["Akram"], info: ["José", "Lennert"], mic: [], helper: ["Cyril", "Marina"] },
      { from: "16:30", to: "17:00", checkin: ["DK"], info: ["Maria", "Valentin"], mic: [], helper: ["Cyril", "Noor"] },
      { from: "17:00", to: "17:30", program: "Jason K. Day", checkin: ["DK"], info: ["Maria"], mic: [], helper: ["Cyril", "Akram"] },
      { from: "17:30", to: "18:00", checkin: ["Marina"], info: ["Maria"], mic: ["Andrea", "Lennert"], helper: ["Cyril", "Akram"] },
      { from: "18:00", to: "18:30", program: "Panel 2", checkin: ["Tommaso"], info: ["Lennert"], mic: [], helper: ["Cyril", "Marina"] },
      { from: "18:30", to: "19:00", checkin: ["Tommaso"], info: ["Parsa"], mic: ["Andrea", "Lennert"], helper: ["Michel", "Marina"] },
      { from: "19:00", to: "19:30", program: "Closing talk", checkin: ["Lennert"], info: ["Parsa"], mic: [], helper: ["DK", "Marina"] },
      { from: "19:30", to: "20:00", program: "Networking apéro", checkin: ["Margarita"], info: ["José", "Noor"], mic: [], helper: [] },
      { from: "20:00", to: "20:30", checkin: ["Margarita"], info: ["José", "Marina"], mic: [], helper: [] },
      { from: "20:30", to: "21:00", checkin: ["Olga"], info: ["José", "Maria"], mic: [], helper: [] },
      { from: "21:00", to: "21:30", checkin: ["Olga"], info: ["Gerel", "Maria"], mic: [], helper: [] },
      { from: "21:30", to: "22:00", checkin: [], info: ["Maria"], mic: [], helper: [] },
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
    id: "setup-meet-thu",
    title: "Setup meeting",
    dateTime: "2026-10-08",
    start: "12:30",
    calendarMinutes: 30,
    place: "Meet at the Kultur & Kongresshaus Aarau",
  },
  {
    id: "crushed-ice-thu",
    title: "Bring 2 packs of crushed ice from Migros",
    dateTime: "2026-10-08",
    start: "18:00",
    calendarMinutes: 30,
    place: "Kultur & Kongresshaus Aarau",
    people: ["Ece"],
  },
  {
    id: "dinner-thu",
    title: "Crew dinner",
    dateTime: "2026-10-08",
    start: "18:00",
    calendarMinutes: 120,
    place: "Meet at the Kultur & Kongresshaus Aarau",
  },
  {
    id: "power-circle-fri",
    title: "Morning Love & Compassion Circle",
    dateTime: "2026-10-09",
    start: "07:15",
    calendarMinutes: 20,
    place: "Kultur & Kongresshaus Aarau",
  },
  {
    id: "power-circle-sat",
    title: "Morning Love & Compassion Circle",
    dateTime: "2026-10-10",
    start: "07:30",
    calendarMinutes: 20,
    place: "Kultur & Kongresshaus Aarau",
  },
  {
    id: "moderator-fri-am",
    title: "Moderator – Friday morning",
    dateTime: "2026-10-09",
    start: "09:00",
    calendarMinutes: 240,
    place: "Kultur & Kongresshaus Aarau",
    people: ["Matthias"],
  },
  {
    id: "moderator-fri-pm",
    title: "Moderator – Friday afternoon",
    dateTime: "2026-10-09",
    start: "13:30",
    calendarMinutes: 330,
    place: "Kultur & Kongresshaus Aarau",
    people: ["Ece"],
  },
  {
    id: "moderator-sat-am",
    title: "Moderator – Saturday morning",
    dateTime: "2026-10-10",
    start: "09:00",
    calendarMinutes: 210,
    place: "Kultur & Kongresshaus Aarau",
    people: ["Raphaël"],
  },
  {
    id: "moderator-sat-pm",
    title: "Moderator – Saturday afternoon",
    dateTime: "2026-10-10",
    start: "13:00",
    calendarMinutes: 390,
    place: "Kultur & Kongresshaus Aarau",
    people: ["Abigail"],
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
    id: "lunch-sun",
    title: "Final lunch – right after checkout",
    dateTime: "2026-10-11",
    start: "11:15",
    calendarMinutes: 90,
    place: "Meet in front of the Kultur & Kongresshaus Aarau",
  },
  {
    id: "unloading",
    title: "Unloading",
    dateTime: "2026-10-11",
    start: "15:00",
    approximate: true,
    calendarMinutes: 120,
    place: "Bern",
    people: ["Philipp", "Matthias", "Parsa", "Federico", "Mourad", "Régis", "Justine", "Andrea", "Akram"],
  },
];

export type CateringShift = {
  person: string;
  /** `YYYY-MM-DD` */
  dateTime: string;
  from: string;
  to: string;
  station: string;
};

/** Catering team shifts, from the catering plan (Helfer A–J). Not counted in the hours. */
export const CATERING_SHIFTS: CateringShift[] = [
  { person: "Tommaso", dateTime: "2026-10-09", from: "08:00", to: "09:30", station: "Arrival" },
  { person: "Tommaso", dateTime: "2026-10-09", from: "12:30", to: "14:00", station: "Lunch Service" },
  { person: "Tommaso", dateTime: "2026-10-09", from: "18:30", to: "19:30", station: "Diner 1" },
  { person: "Tommaso", dateTime: "2026-10-10", from: "08:00", to: "09:30", station: "Arrival" },
  { person: "Tommaso", dateTime: "2026-10-10", from: "12:00", to: "13:45", station: "Lunch Service" },
  { person: "Tommaso", dateTime: "2026-10-10", from: "20:45", to: "21:30", station: "Apéro Spät" },
  { person: "Olga", dateTime: "2026-10-09", from: "08:00", to: "09:30", station: "Arrival" },
  { person: "Olga", dateTime: "2026-10-09", from: "12:30", to: "14:00", station: "Lunch Service" },
  { person: "Olga", dateTime: "2026-10-09", from: "18:30", to: "19:30", station: "Diner 1" },
  { person: "Olga", dateTime: "2026-10-09", from: "20:15", to: "20:45", station: "Diner 2" },
  { person: "Olga", dateTime: "2026-10-10", from: "08:00", to: "09:30", station: "Arrival" },
  { person: "Olga", dateTime: "2026-10-10", from: "12:00", to: "13:45", station: "Lunch Service" },
  { person: "Olga", dateTime: "2026-10-10", from: "21:45", to: "22:30", station: "Apéro Abbau" },
  { person: "Stela", dateTime: "2026-10-09", from: "08:00", to: "09:30", station: "Arrival" },
  { person: "Stela", dateTime: "2026-10-09", from: "10:15", to: "11:45", station: "Morning Break" },
  { person: "Stela", dateTime: "2026-10-09", from: "18:30", to: "19:30", station: "Diner 1" },
  { person: "Stela", dateTime: "2026-10-10", from: "10:45", to: "11:45", station: "Morning Break" },
  { person: "Stela", dateTime: "2026-10-10", from: "12:00", to: "13:45", station: "Lunch Service" },
  { person: "Stela", dateTime: "2026-10-10", from: "21:15", to: "22:30", station: "Apéro Abbau" },
  { person: "Myriam", dateTime: "2026-10-09", from: "08:00", to: "09:30", station: "Arrival" },
  { person: "Myriam", dateTime: "2026-10-09", from: "10:15", to: "11:45", station: "Morning Break" },
  { person: "Myriam", dateTime: "2026-10-09", from: "18:30", to: "19:30", station: "Diner 1" },
  { person: "Myriam", dateTime: "2026-10-09", from: "20:45", to: "21:15", station: "Diner 2" },
  { person: "Myriam", dateTime: "2026-10-10", from: "10:45", to: "11:45", station: "Morning Break" },
  { person: "Myriam", dateTime: "2026-10-10", from: "18:45", to: "20:45", station: "Networking Apéro" },
  { person: "Myriam", dateTime: "2026-10-10", from: "21:15", to: "22:30", station: "Apéro Abbau" },
  { person: "Benedikt", dateTime: "2026-10-09", from: "10:15", to: "11:45", station: "Morning Break" },
  { person: "Benedikt", dateTime: "2026-10-09", from: "12:30", to: "14:00", station: "Lunch Service" },
  { person: "Benedikt", dateTime: "2026-10-09", from: "18:45", to: "19:45", station: "Diner 1" },
  { person: "Benedikt", dateTime: "2026-10-10", from: "13:30", to: "15:00", station: "Lunch Küche" },
  { person: "Benedikt", dateTime: "2026-10-10", from: "15:45", to: "17:30", station: "Afternoon Break" },
  { person: "Benedikt", dateTime: "2026-10-10", from: "21:45", to: "22:30", station: "Apéro Abbau" },
  { person: "Margarita", dateTime: "2026-10-09", from: "10:15", to: "11:45", station: "Morning Break" },
  { person: "Margarita", dateTime: "2026-10-09", from: "14:00", to: "15:30", station: "Lunch Küche" },
  { person: "Margarita", dateTime: "2026-10-09", from: "19:45", to: "21:15", station: "Diner 2" },
  { person: "Margarita", dateTime: "2026-10-10", from: "13:30", to: "15:00", station: "Lunch Küche" },
  { person: "Margarita", dateTime: "2026-10-10", from: "15:45", to: "17:30", station: "Afternoon Break" },
  { person: "Margarita", dateTime: "2026-10-10", from: "21:45", to: "22:30", station: "Apéro Abbau" },
  { person: "Sophia", dateTime: "2026-10-09", from: "12:30", to: "14:00", station: "Lunch Service" },
  { person: "Sophia", dateTime: "2026-10-09", from: "14:00", to: "15:30", station: "Lunch Küche" },
  { person: "Sophia", dateTime: "2026-10-09", from: "20:15", to: "21:15", station: "Diner 2" },
  { person: "Sophia", dateTime: "2026-10-10", from: "15:45", to: "17:45", station: "Afternoon Break" },
  { person: "Sophia", dateTime: "2026-10-10", from: "20:30", to: "22:30", station: "Apéro Spät" },
  { person: "Aurora", dateTime: "2026-10-10", from: "18:45", to: "21:00", station: "Networking Apéro" },
  { person: "Aurora", dateTime: "2026-10-10", from: "21:00", to: "22:30", station: "Apéro Spät" },
  { person: "Maximilian", dateTime: "2026-10-09", from: "16:15", to: "17:45", station: "Afternoon Break" },
  { person: "Maximilian", dateTime: "2026-10-09", from: "19:00", to: "19:45", station: "Diner 1" },
  { person: "Maximilian", dateTime: "2026-10-09", from: "19:45", to: "21:15", station: "Diner 2" },
  { person: "Maximilian", dateTime: "2026-10-10", from: "18:30", to: "20:30", station: "Networking Apéro" },
  { person: "Maximilian", dateTime: "2026-10-10", from: "20:30", to: "22:15", station: "Apéro Abbau" },
  { person: "Simon", dateTime: "2026-10-09", from: "16:15", to: "17:45", station: "Afternoon Break" },
  { person: "Simon", dateTime: "2026-10-09", from: "19:00", to: "19:45", station: "Diner 1" },
  { person: "Simon", dateTime: "2026-10-09", from: "19:45", to: "21:15", station: "Diner 2" },
  { person: "Simon", dateTime: "2026-10-10", from: "12:00", to: "13:45", station: "Lunch Service" },
  { person: "Simon", dateTime: "2026-10-10", from: "19:30", to: "21:30", station: "Apéro Spät" },
  // Fri 9 Oct: Aurora's Friday catering moved to the crew (Ece, 2026-10-09); her Saturday shifts stand.
  { person: "José", dateTime: "2026-10-09", from: "14:00", to: "15:30", station: "Lunch Küche" },
  { person: "DK", dateTime: "2026-10-09", from: "16:15", to: "17:45", station: "Afternoon Break" },
];

/**
 * Catering stations grouped by service, in the order of the day, with the name
 * shown on the page. The keys are the station names of the catering plan; a
 * station missing here gets a service of its own.
 */
export const CATERING_SERVICES: { id: string; label: string; stations: Record<string, string> }[] = [
  { id: "arrival", label: "Arrival", stations: { Arrival: "Arrival" } },
  { id: "morning", label: "Morning break", stations: { "Morning Break": "Morning break" } },
  { id: "lunch", label: "Lunch", stations: { "Lunch Service": "Service", "Lunch Küche": "Kitchen" } },
  { id: "afternoon", label: "Afternoon break", stations: { "Afternoon Break": "Afternoon break" } },
  { id: "dinner", label: "Dinner", stations: { "Diner 1": "Dinner 1", "Diner 2": "Dinner 2" } },
  { id: "apero", label: "Apéro", stations: { "Networking Apéro": "Networking", "Apéro Spät": "Late shift", "Apéro Abbau": "Teardown" } },
];

/** Roles across Friday and Saturday ("Roles" tab). Not counted in the hours. */
export const CREW_ROLES: { role: string; people: string[] }[] = [
  { role: "Overall Orga", people: ["Philipp"] },
  { role: "Team & Volunteer Coordination", people: ["Philipp", "Ece"] },
  { role: "Speaker Coordination", people: ["Vincent"] },
  { role: "Backstage Support", people: ["Fabian"] },
  { role: "Social Media", people: ["Matthias"] },
  { role: "Music", people: ["Dave"] },
  { role: "Video", people: ["Jonathan", "Régis"] },
  { role: "Photography", people: ["Max"] },
  { role: "Research Posters", people: ["Cyril"] },
  { role: "Podcast", people: ["Mourad"] },
  { role: "Graphics", people: ["Justine"] },
  { role: "ALPS Table Setup, Logistics and Teardown", people: ["Maria"] },
  { role: "Check-in Table Setup, Logistics and Teardown", people: ["Andrea"] },
];

/**
 * Crew members who are on the ALPS team, with their booklet photo
 * (`public/img/booklet/team/<photo>.jpg`) where we know which one it is.
 * Everyone else on the crew is listed as a volunteer.
 */
export const TEAM_PHOTOS: Record<string, string | null> = {
  Abigail: "abigail-calder",
  Akram: "akram-elrhaoussi",
  "Ana-Mateea": "ana-mateea-cerchez",
  // Two Andreas on the team (Bacconi, Sader): no photo until we know which one is on shift.
  Andrea: null,
  Cyril: "cyril-petignat",
  Dave: "david-wennberg",
  Ece: "ece-baloglu",
  Fabian: "fabian-velazquez-macias",
  Federico: "federico-seragnoli",
  Gerel: "gerel-jargalsaikhan",
  Jonathan: "jonathan-moy-de-vitry",
  Justine: "justine-jones",
  Lennert: "lennert-van-de-kreeke",
  Maria: "maria-tudor",
  Marina: "marina-millan",
  Matthias: "matthias-leitner",
  Michel: "michel-huissoud",
  Morten: "morten-lietz",
  Mourad: "mourad-chouaki",
  Noor: "noor-charkhi",
  Parsa: "parsa-yousefi",
  Philipp: "philipp-hampel",
  Raphaël: "raphael-saunier",
  Régis: "regis-paroz",
  Valentin: "valentin-rieder",
  Vincent: "vincent-diehl",
};

export const CREW_CONTACTS = {
  changes: "Philipp",
  onSite: ["Philipp", "Ece"],
};
