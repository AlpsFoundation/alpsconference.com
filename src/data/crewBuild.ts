/**
 * Build crew for ALPS Conference 2026: unloading and setup on Thursday 8 October,
 * teardown and packing the truck on Saturday 10 October. Rendered inside /volunteers
 * (Thursday and Saturday tabs); sign-ups and ticks live in the `conf26-setup` D1
 * database (binding CREW_DB), shared with the old tools-conf26-setup page.
 *
 * Content from the Slack canvas "CONF26 setup at KuK — what we know and what we need"
 * (24 Sept 2026) and Régis's ALPS_Conference_2026_Main_plan.pdf. Items marked
 * `draft` and every `what` line were drafted on 29 Sept for Matthias to check.
 * Zone `area` boxes [x, y, w, h] are approximate, in public/img/venue-plan.svg units.
 *
 * This file is public and open source, like src/data/volunteers.ts: first names only
 * (a second person with the same first name gets an initial), no contact details.
 * Sign-ups and ticks in D1 are keyed by item id, so text can be edited freely; do not
 * rename or remove an id that already has sign-ups.
 */

export type BuildPhase = "unload" | "setup" | "teardown" | "load";

export type BuildZone = {
  n: string;
  label: string;
  group: string;
  /** Where the plan draws the number. */
  x: number;
  y: number;
  area: [number, number, number, number];
};

export type BuildItem = {
  id: string;
  name: string;
  what?: string;
  detail?: string;
  zones?: string[];
  /** People needed. Left out when nobody has said yet: the page shows "need not set". */
  people?: number;
  lead?: string;
  qty?: string;
  who?: string;
  status?: string;
  draft?: boolean;
};

export type BuildSection = {
  id: string;
  title: string;
  note?: string;
  /** People for the whole block, where the canvas gives only that. */
  people?: number;
  /** "task": people sign up. "material": checklist ticked on arrival (unload) and on the truck (load). */
  kind: "task" | "material";
  /** Which part of the build a task section belongs to; setup tasks are mirrored into teardown. */
  phase?: "unload" | "setup" | "load";
  items: BuildItem[];
};

export type BuildPhaseInfo = {
  label: string;
  /** `YYYY-MM-DD` */
  dateTime: string;
  /** Unset while the time is still to be confirmed. */
  start?: string;
  end?: string;
  /** Length of the calendar entry when the plan sets no end time. */
  calendarMinutes?: number;
  timeNote?: string;
  /** The order of the evening, shown as numbered steps under the note. */
  steps?: string[];
  doneLabel: string;
  joinLabel: string;
};

export const BUILD_PHASES: Record<BuildPhase, BuildPhaseInfo> = {
  unload: {
    label: "Unloading at the KuK",
    dateTime: "2026-10-08",
    start: "13:00",
    calendarMinutes: 60,
    timeNote: "Setup meeting at 12:30 at the KuK. Unloading and setup start at 13:00, once the workshops have started. KuK Aufbau window 13:00–17:00.",
    doneLabel: "Arrived",
    joinLabel: "I'm on this",
  },
  setup: {
    label: "Setup at the KuK",
    dateTime: "2026-10-08",
    start: "13:00",
    end: "17:00",
    timeNote: "Setup meeting at 12:30 at the KuK. Workshop rooms from 12:00; everything else in the KuK Aufbau window, 13:00–17:00.",
    doneLabel: "Done",
    joinLabel: "I'm on this",
  },
  teardown: {
    label: "Teardown",
    dateTime: "2026-10-10",
    start: "21:00",
    calendarMinutes: 90,
    timeNote:
      "Everyone helps. Whoever set a thing up tears it down. Philipp's rented backups (extension cords, cable drums, walkie-talkies, Régis's extra lights and disco ball) go back into the bags they came in, packed by whoever unpacked them.",
    steps: [
      "21:00 · Power and coordination circle on the big stage. Everyone comes.",
      "21:15 · Work starts. Kevin Barron's art is gone from 13 by then; Matthias tells him.",
      "Matthias parks the truck in front of the main entrance.",
      "First onto the truck: the wood panels from the Kevin Barron space (13), nothing else yet. The art corner (14) may run a bit longer.",
      "Everyone tears down what they set up on Thursday and brings all material to 7 top, where Régis packs it into boxes.",
    ],
    doneLabel: "Torn down",
    joinLabel: "I'll tear this down",
  },
  load: {
    label: "Pack the truck",
    dateTime: "2026-10-10",
    timeNote: "The truck stands in front of the main entrance. The wood panels from 13 go on first, then the boxes Régis packs at 7 top.",
    doneLabel: "On the truck",
    joinLabel: "I'm on this",
  },
};

/** Tasks that start before their phase does. */
export const BUILD_ITEM_START: Record<string, string> = { "ws-rooms": "12:00" };

/** Colour token per zone group, the same on the plan, the legend and the chips (src/styles/crewBuild.css). */
export const BUILD_ZONE_GROUPS: Record<string, string> = {
  ALPS: "alps",
  Lounges: "lounges",
  Catering: "catering",
  Exhibitors: "exhibitors",
  "Research posters": "research",
  "Kevin Barron exhibition": "kevin",
  "Art corner: Hana Stanke and Joanne Lackey": "hannah",
};

type BuildData = { people: string[]; zones: BuildZone[]; sections: BuildSection[] };

const DATA: BuildData = {
  "people": [
    "Abigail",
    "Akram",
    "Ana-Mateea",
    "Andrea",
    "Cyril",
    "Dave",
    "DK",
    "Ece",
    "Fabian",
    "Federico",
    "Gerel",
    "Joanne",
    "Jonathan",
    "Justine",
    "Lennert",
    "Maria",
    "Marina",
    "Matthias",
    "Michel",
    "Morten",
    "Mourad",
    "Noor",
    "Parsa",
    "Philipp",
    "Raphaël",
    "Régis",
    "Valentin",
    "Vincent"
  ],
  "zones": [
    {
      "n": "1",
      "label": "Reception",
      "group": "ALPS",
      "x": 522,
      "y": 469,
      "area": [
        492,
        438,
        36,
        62
      ]
    },
    {
      "n": "2",
      "label": "Merchandising",
      "group": "ALPS",
      "x": 505,
      "y": 327,
      "area": [
        488,
        300,
        34,
        52
      ]
    },
    {
      "n": "3",
      "label": "ALPS Visuals",
      "group": "ALPS",
      "x": 650,
      "y": 394,
      "area": [
        625,
        360,
        43,
        70
      ]
    },
    {
      "n": "4",
      "label": "Main stage",
      "group": "ALPS",
      "x": 992,
      "y": 386,
      "area": [
        955,
        332,
        80,
        130
      ]
    },
    {
      "n": "5",
      "label": "ALPS Posters",
      "group": "ALPS",
      "x": 178,
      "y": 246,
      "area": [
        137,
        229,
        51,
        36
      ]
    },
    {
      "n": "6",
      "label": "Stage",
      "group": "ALPS",
      "x": 236,
      "y": 248,
      "area": [
        188,
        229,
        94,
        36
      ]
    },
    {
      "n": "7 top",
      "label": "Lounge, top",
      "group": "Lounges",
      "x": 465,
      "y": 203,
      "area": [
        390,
        155,
        155,
        67
      ]
    },
    {
      "n": "7 mid",
      "label": "Lounge, mid",
      "group": "Lounges",
      "x": 320,
      "y": 327,
      "area": [
        287,
        285,
        85,
        87
      ]
    },
    {
      "n": "7 bottom",
      "label": "Lounge, bottom",
      "group": "Lounges",
      "x": 344,
      "y": 450,
      "area": [
        318,
        428,
        74,
        77
      ]
    },
    {
      "n": "8",
      "label": "Catering and fooding installation",
      "group": "Catering",
      "x": 419,
      "y": 385,
      "area": [
        395,
        365,
        45,
        90
      ]
    },
    {
      "n": "9",
      "label": "Exhibitors",
      "group": "Exhibitors",
      "x": 240,
      "y": 315,
      "area": [
        215,
        280,
        67,
        70
      ]
    },
    {
      "n": "10",
      "label": "Exhibitors",
      "group": "Exhibitors",
      "x": 175,
      "y": 294,
      "area": [
        137,
        283,
        30,
        22
      ]
    },
    {
      "n": "11",
      "label": "Exhibitors",
      "group": "Exhibitors",
      "x": 176,
      "y": 325,
      "area": [
        137,
        306,
        30,
        24
      ]
    },
    {
      "n": "12",
      "label": "11 × Research posters",
      "group": "Research posters",
      "x": 159,
      "y": 449,
      "area": [
        137,
        425,
        123,
        57
      ]
    },
    {
      "n": "13",
      "label": "Kevin Barron exhibition — 14 × A0 display area + 1 table",
      "group": "Kevin Barron exhibition",
      "x": 594,
      "y": 390,
      "area": [
        572,
        350,
        43,
        80
      ]
    },
    {
      "n": "14",
      "label": "Art corner: Hana Stanke and Joanne Lackey — one shared gallery wall",
      "group": "Art corner: Hana Stanke and Joanne Lackey",
      "x": 310,
      "y": 439,
      "area": [
        288,
        425,
        30,
        37
      ]
    }
  ],
  "sections": [
    {
      "id": "unloading",
      "title": "Unloading, 13:00",
      "kind": "task",
      "phase": "unload",
      "note": "Setup meeting at 12:30 at the KuK. Unloading and setup start at 13:00, once the workshops have started. KuK Aufbau window 13:00–17:00.",
      "items": [
        {
          "id": "unload-all",
          "name": "All material is brought to 7 top",
          "zones": [
            "7 top"
          ],
          "detail": "Everything from the truck except the wood panels.",
          "what": "Carry everything from the truck up to Lounge top (7 top) and tick each item in the material checklist below as it arrives. The wood panels are the one exception, they go to 13."
        },
        {
          "id": "unload-panels",
          "lead": "Régis",
          "name": "Wood panels are brought to 13",
          "zones": [
            "13"
          ],
          "detail": "The ALPS double wood panels go straight to 13, not to 7 top.",
          "what": "Carry the ALPS double wood panels from the truck straight to 13, where the Kevin Barron exhibition is built."
        }
      ]
    },
    {
      "id": "workshop",
      "title": "0) Workshop setup, 12:00",
      "kind": "task",
      "phase": "setup",
      "note": "At 12:00, a team of 4 people will help Vincent to prepare the rooms for the workshop, which are on the second floor, rooms 1, 2 and 3. Workshop rooms can be set up from 12:00 and must be empty by 18:00 at the latest.",
      "people": 4,
      "items": [
        {
          "id": "ws-rooms",
          "name": "Prepare workshop rooms 1, 2 and 3 (second floor)",
          "people": 4,
          "lead": "Vincent",
          "detail": "Materials they need: yoga mats, cushions, blankets.",
          "what": "With Vincent, lay out the yoga mats, cushions and blankets in rooms 1, 2 and 3 on the second floor. Ready before the workshops start; the rooms must be empty again by 18:00."
        }
      ]
    },
    {
      "id": "branding",
      "title": "a) ALPS branding / ALPS desk",
      "kind": "task",
      "phase": "setup",
      "note": "In brackets, the amount of people needed per task.",
      "items": [
        {
          "id": "alps-desk",
          "name": "ALPS Desk",
          "zones": [
            "1"
          ],
          "people": 2,
          "lead": "Andrea B.",
          "detail": "Andrea B. will be the main responsible. Abigail has much experience from past events. The ALPS info, merch and Summer School desk is one combined desk next to the main-hall entrance.",
          "what": "Set up the one combined ALPS info, merch and Summer School desk next to the main-hall entrance (1)."
        },
        {
          "id": "alps-infotable",
          "name": "ALPS Infotable",
          "zones": [
            "2"
          ],
          "people": 2,
          "lead": "Maria",
          "detail": "Maria will be the main responsible.",
          "what": "Set up the ALPS info table at 2 (Merchandising)."
        },
        {
          "id": "alps-banner",
          "name": "ALPS Big Banner",
          "zones": [
            "3"
          ],
          "people": 2,
          "what": "Put up the big ALPS banner at 3 (ALPS Visuals)."
        },
        {
          "id": "alps-stage",
          "name": "ALPS Stage",
          "zones": [
            "4"
          ],
          "people": 2,
          "what": "Set up the ALPS branding on the main stage (4)."
        }
      ]
    },
    {
      "id": "lounge",
      "title": "b) Lounge",
      "kind": "task",
      "phase": "setup",
      "note": "3× Lounges with Japanese paravents and lit up walls (2).",
      "people": 2,
      "items": [
        {
          "id": "jw-clean",
          "lead": "Régis",
          "name": "Clean the Japanese walls and place them in the lounges",
          "zones": [
            "7 top",
            "7 mid",
            "7 bottom"
          ],
          "draft": true,
          "what": "Wipe the 8 Japanese walls (paravents) clean with the material Régis brings, about 2 minutes per wall, then place them in the three lounges."
        },
        {
          "id": "lounge-bottom",
          "lead": "Régis",
          "name": "Lounge bottom: paravents, live painting setup assistance",
          "zones": [
            "7 bottom"
          ],
          "what": "Set up Lounge bottom with paravents and lit walls, beside the art corner at 14, and help set up the live painting, including Joanne's easel."
        },
        {
          "id": "lounge-mid",
          "lead": "Régis",
          "name": "Lounge mid: small light events",
          "zones": [
            "7 mid"
          ],
          "what": "Set up Lounge mid for small light events, with paravents and lit walls."
        },
        {
          "id": "lounge-top",
          "lead": "Régis",
          "name": "Lounge top: small light events",
          "zones": [
            "7 top"
          ],
          "what": "Set up Lounge top for small light events, with paravents and lit walls. It is also the unloading drop point, so it can only be done once the material there has gone out."
        }
      ]
    },
    {
      "id": "exhibitors",
      "title": "c) Exhibitors",
      "kind": "task",
      "phase": "setup",
      "note": "These tables are largely taken care of by the exhibitors. ALPS will prepare the tables to a minimum. Exhibitors: Nachtschatten, Open Foundation, etc.",
      "people": 2,
      "items": [
        {
          "id": "exhibitor-tables",
          "name": "Prepare the exhibitor tables to a minimum",
          "zones": [
            "9",
            "10"
          ],
          "people": 2,
          "what": "Get the exhibitor tables at 9 and 10 ready to a minimum. The exhibitors (Nachtschatten, Open Foundation and others) set up the rest themselves."
        }
      ]
    },
    {
      "id": "posters",
      "title": "d) Posters",
      "kind": "task",
      "phase": "setup",
      "people": 2,
      "items": [
        {
          "id": "posters-1",
          "name": "Posters (1)",
          "zones": [
            "5",
            "6"
          ],
          "detail": "Lightweight panels ≈ 4",
          "what": "Set up about 4 lightweight panels for the ALPS posters at 5 and 6."
        },
        {
          "id": "posters-2",
          "name": "Posters (2)",
          "zones": [
            "5",
            "6"
          ],
          "detail": "Lightweight panels ≈ 4",
          "what": "Set up about 4 more lightweight panels for the ALPS posters at 5 and 6."
        }
      ]
    },
    {
      "id": "display",
      "title": "e) Exhibitions and research posters",
      "kind": "task",
      "phase": "setup",
      "note": "Drafted from the material list: the setup work these items need.",
      "items": [
        {
          "id": "wood-wall",
          "lead": "Régis",
          "name": "Build the wood-panel wall for the Kevin Barron exhibition",
          "zones": [
            "13"
          ],
          "draft": true,
          "what": "Assemble the ALPS double wood panels (16 single sides, 8 double) with the connector sticks and magnets at 13, following kevin_baron_illustration.jpg: 14 × A0 display area plus 1 table."
        },
        {
          "id": "research-spaces",
          "lead": "Cyril",
          "name": "Put up the 11 research posters",
          "zones": [
            "12"
          ],
          "draft": true,
          "what": "The poster panels are already at the KuK. Put up the 11 research posters on them at 12, with the magnets and pins Cyril brings."
        },
        {
          "id": "hannah-display",
          "name": "Build the art corner wall for Hana and Joanne",
          "zones": [
            "14"
          ],
          "draft": true,
          "detail": "Panel count: ask Raphaël",
          "what": "Build one shared gallery wall at 14 for Hana Stanke and Joanne Lackey: display panels, with Hana's big black cloth over them and her lights, which Joanne shares. They asked for at least 8 panels and no easels for showing the work. How many panels the corner gets is Raphaël's call, so ask him before you start."
        }
      ]
    },
    {
      "id": "signs",
      "title": "f) Signs",
      "kind": "task",
      "phase": "setup",
      "items": [
        {
          "id": "signs-print",
          "name": "Print and put up the A3 and A4 signs",
          "lead": "Matthias",
          "draft": true,
          "what": "Print the A4 signs from the signage tool and the A3 posters from Drive on the on-site printer (Matthias and Maria), then put them up around the house."
        }
      ]
    },
    {
      "id": "loading",
      "title": "Pack the truck",
      "kind": "task",
      "phase": "load",
      "note": "During and after the teardown on Saturday 10 October, at the truck in front of the main entrance. The truck is unloaded in Bern on Sunday 11 October, about 15:00.",
      "items": [
        {
          "id": "load-all",
          "name": "All material goes back onto the truck",
          "draft": true,
          "what": "Carry everything that was packed during the teardown back to the truck. Tick each item in the material checklist below as it goes on."
        },
        {
          "id": "load-panels",
          "lead": "Régis",
          "name": "Wood panels go back onto the truck",
          "zones": [
            "13"
          ],
          "draft": true,
          "what": "First thing: take the ALPS double wood panels, connector sticks and magnets from 13 to the truck at the main entrance. Only 13 for now; the art corner (14) may still be running."
        },
        {
          "id": "load-moss",
          "name": "Moss decoration goes back into its own boxes",
          "lead": "Matthias",
          "what": "Pack the moss back into the boxes it came in and put each box's return label on. Matthias drops the boxes at the post office in Bern on Sunday 11 October at 16:00."
        }
      ]
    },
    {
      "id": "walls",
      "title": "Walls and display",
      "kind": "material",
      "items": [
        {
          "id": "kuk-stellwaende",
          "name": "KuK Stellwände 200 × 97 cm, double-sided, plus 1 Pinwand",
          "qty": "15 + 1",
          "who": "KuK",
          "status": "Booked"
        },
        {
          "id": "wood-panels",
          "name": "ALPS double wood panels (with the connector sticks and the magnets)",
          "zones": [
            "13"
          ],
          "qty": "16 single sides / 8 double",
          "who": "Philipp has them in Bern",
          "status": "Location of magnets is unknown. Perhaps they are with Cyril and with Philipp. Régis ordered 30 such that we are surely covered. Set up plan: kevin_baron_illustration.jpg"
        },
        {
          "id": "foam-panels",
          "name": "Lightweight foam panels, about 2 m × 1 m",
          "qty": "10–15",
          "who": "Régis",
          "status": "Not confirmed bought"
        },
        {
          "id": "japanese-walls",
          "name": "Japanese wall (paravents)",
          "zones": [
            "7 top",
            "7 mid",
            "7 bottom"
          ],
          "qty": "8 in total, of different type",
          "who": "Régis",
          "status": "JW are dirty (from ASS26), need to be cleaned. Régis will bring the cleaning material. Cleaning will take 2 minutes per wall."
        },
        {
          "id": "poster-panels",
          "name": "Cheap poster panels, roughly CHF 300–400",
          "who": "Régis",
          "status": "Research poster panels already at the KuK"
        }
      ]
    },
    {
      "id": "art",
      "title": "Posters and art",
      "kind": "material",
      "items": [
        {
          "id": "research-posters",
          "name": "Research posters, with magnets and pins",
          "zones": [
            "12"
          ],
          "qty": "11 posters",
          "who": "Cyril (magnets and pins)",
          "status": "Poster panels already at the KuK"
        },
        {
          "id": "large-prints",
          "name": "Large poster prints, about 1 m × 1.2 m",
          "who": "Raphaël",
          "status": "Shipping from Germany"
        },
        {
          "id": "hanna-artwork",
          "name": "Hana's artwork, black cloth and lights, from Berlin",
          "zones": [
            "14"
          ],
          "who": "Lennert and other Berlin travellers",
          "status": "Transport settled; volume not known"
        },
        {
          "id": "easel",
          "name": "Easel for live painting",
          "qty": "1",
          "who": "Joanne, from Basel"
        },
        {
          "id": "joanne-artwork",
          "name": "Joanne's artworks, from Basel",
          "zones": [
            "14"
          ],
          "who": "David, in his rental car on Thursday",
          "status": "Raphaël and David arrange the pickup"
        },
        {
          "id": "art-corner-panels",
          "name": "Display panels for the art corner wall",
          "zones": [
            "14"
          ],
          "qty": "At least 8, as Hana and Joanne asked",
          "who": "Raphaël decides: ALPS panels or KuK Stellwände",
          "status": "Count not decided"
        },
        {
          "id": "kevin-tables",
          "name": "Tables for Kevin Barron's exhibition (small pieces, books, flyers)",
          "qty": "2–3",
          "status": "Asked, not answered"
        }
      ]
    },
    {
      "id": "tables",
      "title": "Tables and textiles",
      "kind": "material",
      "items": [
        {
          "id": "exhibitor-tables-kuk",
          "name": "Exhibitor tables, Saal 2",
          "qty": "6",
          "who": "KuK sets out Friday",
          "status": "Booked"
        },
        {
          "id": "bistro-tables",
          "name": "White bistro tables, Saal 2",
          "qty": "10",
          "who": "KuK",
          "status": "Booked"
        },
        {
          "id": "fabric-tables",
          "name": "Tables with black and white fabric",
          "who": "KuK",
          "status": "Booked"
        },
        {
          "id": "tablecloths",
          "name": "Blueish tablecloths, provided by KuK, set up by KuK on 1, 2, 9, 10, 11",
          "zones": [
            "1",
            "2",
            "9",
            "10",
            "11"
          ],
          "who": "KuK",
          "status": "Booked"
        },
        {
          "id": "partner-tables",
          "name": "Partner info tables: Nachtschatten, ICPR, OPEN Foundation named; Roxiva not coming",
          "who": "Each partner"
        }
      ]
    },
    {
      "id": "saal4",
      "title": "Workshops and Saal 4",
      "kind": "material",
      "items": [
        {
          "id": "yoga-mats",
          "name": "Yoga mats (load last, off first)",
          "qty": "30 in the tracker",
          "who": "Philipp"
        },
        {
          "id": "cushions",
          "name": "Cushions: IKEA pillows, meditation cushions",
          "qty": "20 pillows in the tracker",
          "who": "Philipp"
        },
        {
          "id": "blankets",
          "name": "Blankets",
          "qty": "20 in the tracker",
          "who": "Philipp"
        },
        {
          "id": "marina-carpet",
          "name": "Carpet or big blanket for Marina's sound-meditation instruments",
          "who": "Philipp brings a big blanket, maybe a carpet; David's carpet is free on Friday only",
          "status": "Asked on 5 Oct"
        },
        {
          "id": "percussion-led",
          "name": "Percussion instruments and LED candles for Saal 4",
          "who": "Instruments brought by Instrumentalist. LED potentially brought by Régis"
        }
      ]
    },
    {
      "id": "av",
      "title": "AV, power and printing",
      "kind": "material",
      "items": [
        {
          "id": "laptops",
          "name": "Speaker-management laptops",
          "qty": "2",
          "who": "Vincent and Fabian",
          "status": "Vincent said yes"
        },
        {
          "id": "live-sound",
          "name": "Sound for live music: boxes and power for instruments",
          "who": "KuK AV",
          "status": "Confirmed by Philipp"
        },
        {
          "id": "podcast-kit",
          "name": "Podcast recording kit, audio only",
          "who": "Mourad"
        },
        {
          "id": "power-strips",
          "name": "Power strips, extension reels, CH/EU adapters",
          "who": "Régis, Philipp"
        },
        {
          "id": "printer",
          "name": "Printer, toner, paper",
          "who": "Philipp",
          "status": "Toner and paper need to be checked on quantity"
        }
      ]
    },
    {
      "id": "rented",
      "title": "Rented backups: each back into the bag it came in",
      "kind": "material",
      "items": [
        {
          "id": "rented-extension-cords",
          "name": "Extension cords",
          "who": "Rented by Philipp",
          "status": "Back into its own bag at teardown"
        },
        {
          "id": "rented-cable-drums",
          "name": "Cable drums",
          "who": "Rented by Philipp",
          "status": "Back into its own bag at teardown"
        },
        {
          "id": "rented-walkie-talkies",
          "name": "Walkie-talkies",
          "who": "Rented by Philipp",
          "status": "Back into its own bag at teardown"
        },
        {
          "id": "rented-lights",
          "name": "Extra lights for Régis",
          "who": "Rented by Philipp, used by Régis",
          "status": "Back into its own bag at teardown"
        },
        {
          "id": "rented-disco-ball",
          "name": "Disco ball for Régis",
          "who": "Rented by Philipp, used by Régis",
          "status": "Back into its own bag at teardown"
        }
      ]
    },
    {
      "id": "food",
      "title": "Food, lounge and team room",
      "kind": "material",
      "items": [
        {
          "id": "nespresso",
          "name": "Nespresso machines and capsules (workshops and speaker lounge)",
          "qty": "2 machines, 120+ capsules",
          "who": "Vincent",
          "status": "Agreed to buy"
        },
        {
          "id": "migros",
          "name": "Migros order: lounge and workshop snacks, Thursday drinks and setup lunch",
          "who": "Philipp orders; Matthias asked to add the Thursday and team-room part",
          "status": "Order list due Mon 28 Sept"
        },
        {
          "id": "cups",
          "name": "Cups",
          "status": "Philipp: from the venue"
        },
        {
          "id": "coffee-beans",
          "name": "Coffee beans for the Bankettküche",
          "qty": "7 kg a day",
          "who": "KuK",
          "status": "Booked"
        },
        {
          "id": "consumables",
          "name": "Consumables: gaffer tape, bin bags, cleaning and tape-residue remover",
          "who": "KuK",
          "status": "all there"
        }
      ]
    },
    {
      "id": "signage",
      "title": "Signage, badges and print",
      "kind": "material",
      "items": [
        {
          "id": "screen-graphics",
          "name": "Screen graphics (Foyer stele, stairs, 1st and 2nd floor, seminar rooms)",
          "qty": "10",
          "who": "Régis, Philipp"
        },
        {
          "id": "printed-signs",
          "name": "Printed signs A3 and A4",
          "qty": "12, or 7 if the A3 line is a duplicate",
          "who": "Matthias",
          "status": "Printer on site, Matthias and Maria will take care of printing"
        },
        {
          "id": "badges",
          "name": "Badges",
          "who": "Philipp",
          "status": "200 badges arrived; Philipp prints the name labels, last-minute ones from the template on Drive"
        },
        {
          "id": "booklets",
          "name": "Booklets",
          "qty": "250",
          "who": "Philipp",
          "status": "Print not confirmed in Slack; the web booklet is live"
        },
        {
          "id": "banners-merch",
          "name": "Banners and merch",
          "who": "Philipp",
          "status": "Banners went to Philipp (due 6 Oct) for the truck; Justine picks up the posters and postcards on Thursday morning"
        }
      ]
    }
  ]
};

/** People who can sign up without being in the shift grid (first names). */
export const BUILD_PEOPLE: string[] = DATA.people;
export const BUILD_ZONES: BuildZone[] = DATA.zones;
export const BUILD_SECTIONS: BuildSection[] = DATA.sections;
