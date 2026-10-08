/**
 * Links on /volunteers: on build tasks and material, on crew events in the schedule,
 * in the "what to do" help of each shift task, and in the links block of each day tab.
 *
 * This file is public and open source, like src/data/volunteers.ts. Slack and most
 * Drive links only open with an ALPS account, so they carry `team: true` and the page
 * labels them "Team". Never put a WhatsApp invite link here: the attendee group is
 * joined only through the QR code on the welcome-desk sign (Matthias, 6 Oct).
 *
 * Keys are the ids in src/data/crewBuild.ts, src/data/volunteers.ts (CREW_EVENTS,
 * VOLUNTEER_TASKS) and the `YYYY-MM-DD` of each day tab.
 */
import type { VolunteerTask } from "./volunteers";

export type CrewLink = {
  label: string;
  /** A path on this site ("/signage") or a full URL. */
  href: string;
  /** Opens only with an ALPS account (Slack, restricted Drive, tools.alps.foundation). */
  team?: boolean;
};

const slack = (path: string) => `https://alps-foundation.slack.com/${path}`;
const driveFolder = (id: string) => `https://drive.google.com/drive/folders/${id}`;
const driveFile = (id: string) => `https://drive.google.com/file/d/${id}/view`;

const L = {
  // On this site
  program: { label: "Program", href: "/#program" },
  map: { label: "Venue map", href: "/map" },
  attendeeLinks: { label: "Wifi, dinner, afterparty", href: "/links" },
  booklet: { label: "Booklet", href: "/booklet" },
  workshops: { label: "Workshop day", href: "/workshops" },
  slides: { label: "Break slides", href: "/slides" },
  researchPosters: { label: "Research posters", href: "/research-posters" },
  signage: { label: "Signage tool (A4 signs)", href: "/signage" },
  stageTimers: { label: "Stage time signals", href: "/signage" },

  // Drive folders shared with anyone who has the link
  a3Posters: { label: "A3 posters to print (Drive)", href: driveFolder("1mmydnjTxBZJh1--kTP4VUuSvb-uivlfr") },
  screenGraphics: { label: "Screen and stele graphics (Drive)", href: driveFolder("1qNVRfiSttldtBRj1YXG3dkwcyNICQpZP") },

  // ALPS tools behind the team sign-in
  experiencesTool: { label: "Experience check-in", href: "https://tools.alps.foundation/experiences", team: true },
  salesTool: { label: "Ticket sales", href: "https://tools.alps.foundation/sales", team: true },

  // Slack
  conference: { label: "#conference", href: slack("archives/C049TEF6VNX"), team: true },
  setupCanvas: { label: "Setup canvas", href: slack("docs/T049Q4TS0TX/F0C3ZJMF813"), team: true },
  equipment: { label: "Equipment tracker", href: slack("lists/T049Q4TS0TX/F0B17Q71KBN"), team: true },
  moderatorCards: { label: "Friday moderator cards", href: slack("docs/T049Q4TS0TX/F0C7FHR14R4"), team: true },
  woodWallPlan: {
    label: "Wall plan (kevin_baron_illustration.jpg)",
    href: slack("files/U08TY8ZGR7Y/F0C1K5SRR7G/kevin_baron_illustration.jpg"),
    team: true,
  },

  // Drive, ALPS accounts only
  floorPlans: { label: "KuK floor plans", href: driveFolder("1TdyjHcN7uZlvr8VOGs5B5VXoDRT5576p"), team: true },
  saal2Plan: { label: "Saal 2 plan", href: driveFile("1qU9GN4p5gU5hvJEL160GXosM5YQKku0X"), team: true },
  seminarPlan: { label: "Seminar rooms plan", href: driveFile("1nXVcHh7CGOajIS-GvbZ4aVnm_KLErPer"), team: true },
  seminarSigns: { label: "Workshop room signs", href: driveFolder("1SBVdsMVHTV90gp3uc93hcz4mof67OoMg"), team: true },
  loadingRules: { label: "KuK loading rules", href: driveFile("1i6gR4IBgtM_NIkx0hyDHrYPR-dR7USMT"), team: true },
  signageFolder: { label: "Signage folder", href: driveFolder("14cuew5XH4B6f0bNKCeTo51SCaVGl5vIy"), team: true },
  flyers: { label: "Info table flyers", href: driveFolder("1jSI4BxhmSuBiUm1PY-rJAMgLOumNwoFf"), team: true },
  badges: { label: "Last-minute badges", href: driveFolder("1fPZDPhV-971TRHprMFOPmlqxHHDeh7ug"), team: true },
  shifts: { label: "Tasks and shifts", href: driveFolder("1glhwysH83g714B34vVnDYefBqnbZ0170"), team: true },
  photos: { label: "Conference photos", href: driveFolder("1wKVAEfZUTf8E0cK3D1vZBHNlfVSkvDDt"), team: true },
} satisfies Record<string, CrewLink>;

/** The links block at the top of each day tab. Web pages first, team links after. */
export const DAY_LINKS: Record<string, CrewLink[]> = {
  "2026-10-08": [L.map, L.signage, L.workshops, L.setupCanvas, L.equipment, L.floorPlans, L.loadingRules, L.conference],
  "2026-10-09": [L.program, L.map, L.attendeeLinks, L.booklet, L.slides, L.experiencesTool, L.salesTool, L.badges, L.conference],
  "2026-10-10": [L.program, L.map, L.attendeeLinks, L.booklet, L.slides, L.experiencesTool, L.salesTool, L.setupCanvas, L.equipment, L.conference],
  "2026-10-11": [L.equipment, L.photos, L.shifts, L.conference],
};

/** Build tasks and material (ids from src/data/crewBuild.ts). */
export const BUILD_ITEM_LINKS: Record<string, CrewLink[]> = {
  // tasks
  "unload-all": [L.loadingRules],
  "ws-rooms": [L.workshops, L.seminarPlan, L.seminarSigns],
  "alps-infotable": [L.flyers],
  "exhibitor-tables": [L.saal2Plan],
  "research-spaces": [L.researchPosters],
  "wood-wall": [L.woodWallPlan],
  "signs-print": [L.signage, L.a3Posters, L.signageFolder],
  "signs-stage-timers": [L.stageTimers, L.moderatorCards],
  "load-all": [L.equipment, L.loadingRules],
  // material
  "research-posters": [L.researchPosters],
  "screen-graphics": [L.screenGraphics],
  "printed-signs": [L.signage, L.a3Posters],
  badges: [L.badges],
  booklets: [L.booklet],
};

/** Crew events in the schedule (ids from CREW_EVENTS in src/data/volunteers.ts). */
export const CREW_EVENT_LINKS: Record<string, CrewLink[]> = {
  loading: [L.equipment],
  "moderator-fri-am": [L.moderatorCards, L.program, L.stageTimers],
  "moderator-fri-pm": [L.moderatorCards, L.program, L.stageTimers],
  "moderator-sat-am": [L.program, L.stageTimers],
  "moderator-sat-pm": [L.program, L.stageTimers],
  dismantling: [L.equipment],
  unloading: [L.equipment],
};

/** Under "what to do" for each shift task. */
export const TASK_LINKS: Record<VolunteerTask, CrewLink[]> = {
  checkin: [L.map, L.attendeeLinks, L.badges],
  info: [L.attendeeLinks, L.salesTool, L.experiencesTool, L.flyers],
  mic: [L.program, L.stageTimers],
  helper: [L.map, L.attendeeLinks],
};
