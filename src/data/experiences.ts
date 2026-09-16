/** Shared experience times for participant cards and the conference schedule. */

export type ExperienceCredit = {
  name: string;
  type?: string;
};

type ExperienceSlot = {
  time: string;
  title: string;
  detail?: string;
  venue?: string;
  kind?: "allday" | "session";
  personName?: string;
  personNames?: string[];
  credits?: ExperienceCredit[];
};

type ExperienceDay = {
  day: string;
  date: string;
  dateTime: string;
  items: ExperienceSlot[];
};

export const EXPERIENCE_PORTRAITS: Record<string, { file: string; position: string }> = {
  "Kevin Barron": { file: "kevin-barron.jpg", position: "50% 12%" },
  "Hannah Stanke": { file: "hannah-stanke.jpg", position: "42% 28%" },
  "Régis Paroz": { file: "regis-paroz.jpg", position: "54% 16%" },
  "Marina Vovk": { file: "marina-vovk.jpg", position: "50% 22%" },
  "David & Anna-Lea Wennberg": { file: "david-anna-lea-wennberg.jpg", position: "50% 30%" },
  "Pascal Kälin": { file: "pascal-kalin.jpg", position: "50% 24%" },
  "Kate Dalby": { file: "kate-dalby.jpg", position: "50% 22%" },
  "Andrea Bacconi": { file: "andrea-bacconi.jpg", position: "50% 30%" },
};

export const EXPERIENCE_DAYS: ExperienceDay[] = [
  {
    day: "Friday",
    date: "9 October",
    dateTime: "2026-10-09",
    items: [
      {
        time: "All day",
        title: "Art exhibitions",
        kind: "allday",
        credits: [
          { name: "Kevin Barron", type: "LSD blotter art" },
          { name: "Hannah Stanke", type: "Live painting" },
          { name: "Régis Paroz", type: "Uncanny World" },
        ],
      },
      { time: "11:00–12:00 & 14:30–15:30", title: "Sound meditation", venue: "Saal 4", personName: "Marina Vovk" },
      { time: "13:45–14:30", title: "Speed-friending", personName: "Kate Dalby" },
      { time: "20:15–20:45", title: "Evening program part I", venue: "Saal 4" },
      { time: "20:45–21:30", title: "Storytelling", venue: "Saal 4", personName: "Kate Dalby" },
    ],
  },
  {
    day: "Saturday",
    date: "10 October",
    dateTime: "2026-10-10",
    items: [
      {
        time: "All day",
        title: "Art exhibitions",
        kind: "allday",
        credits: [
          { name: "Kevin Barron", type: "LSD blotter art" },
          { name: "Hannah Stanke", type: "Live painting" },
          { name: "Régis Paroz", type: "Uncanny World" },
        ],
      },
      { time: "08:10–08:50", title: "Yoga", venue: "Saal 4", personName: "Andrea Bacconi" },
      { time: "11:15–12:30 & 16:45–18:00", title: "Breathwork", venue: "Saal 4", personName: "Pascal Kälin" },
      { time: "12:30–14:00", title: "Live concert", venue: "Saal 2", personName: "David & Anna-Lea Wennberg" },
      { time: "13:45–14:45", title: "Sound meditation", venue: "Saal 4", personName: "Marina Vovk" },
      { time: "21:30–04:00", title: "Afterparty", detail: "Jugendkulturhaus, Flösserstrasse 7 · 5 minutes on foot", personName: "Afterparty" },
    ],
  },
];

