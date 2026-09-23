/** Shared scientific program used by the conference site and the print booklet. */

export type ProgramExperience = {
  title: string;
  time: string;
  personName: string;
};

export type ProgramItem = {
  time: string;
  title: string;
  detail?: string;
  detailHighlight?: boolean;
  address?: string;
  mapUrl?: string;
  menuNote?: string;
  venue?: string;
  /** Overrides the conference venue in the calendar feed. */
  calendarLocation?: string;
  kind?: "session" | "pause" | "social";
  speakerName?: string;
  experienceName?: string;
  panel?: "friday" | "saturday";
  experiences?: ProgramExperience[];
};

export type ProgramDay = {
  day: string;
  date: string;
  dateTime: string;
  items: ProgramItem[];
};

export const PROGRAM: ProgramDay[] = [
  {
    day: "Friday",
    date: "9 October",
    dateTime: "2026-10-09",
    items: [
      { time: "08:00–09:00", title: "Doors open", kind: "pause", menuNote: "Coffee, tea, fruit juices & vegan pastries from a local bakery" },
      { time: "09:00–09:30", title: "Opening", detail: "ALPS team" },
      { time: "09:30–10:30", title: "Dr. Max Wolff", detail: "The Case for Considering Psychedelics as Psychotherapeutic Tools", speakerName: "Dr. Max Wolff" },
      { time: "10:30–11:00", title: "Coffee break", kind: "pause", menuNote: "Coffee, oat milk, tea · Nuts & fresh fruit" },
      { time: "11:00–12:00", title: "Morten Lietz", detail: "Do Older Adults Trip Differently? A Double-Blind Comparison of LSD Effects Across the Adult Lifespan", speakerName: "Morten Lietz", experiences: [
        { title: "Sound meditation", time: "11:00–12:00", personName: "Marina Vovk" },
      ] },
      { time: "12:00–13:00", title: "Tommaso Barba", detail: "EEG correlates of self-dissolution induced by intranasal 5-MeO-DMT", speakerName: "Tommaso Barba" },
      { time: "13:00–14:30", title: "Lunch break", kind: "pause", menuNote: "Ginger-pumpkin soup with sprouts · Baked potatoes with chickpea-parsley velouté & autumn vegetables (vegan)", experiences: [
        { title: "Speed-friending", time: "13:45–14:30", personName: "Kate Dalby" },
      ] },
      { time: "14:30–15:30", title: "Manal Al-Hammadi", detail: "Psychedelics Governance: The Category Error in Mental Health Policy", speakerName: "Manal Al-Hammadi", experiences: [
        { title: "Sound meditation", time: "14:30–15:30", personName: "Marina Vovk" },
      ] },
      { time: "15:30–16:30", title: "Dr. Sandeep Nayak", detail: "From Data to Dosing Room: Optimizing Psilocybin Therapy for Clinical Practice", speakerName: "Dr. Sandeep Nayak" },
      { time: "16:30–17:15", title: "Coffee break", kind: "pause", menuNote: "Coffee, tea · Vegan cakes, Ayurvedic energy balls & fresh fruit" },
      { time: "17:15–18:15", title: "Prof. Amandine Luquiens", detail: "Is It More Than the Drug? Exploring Precision Psychedelic Therapy for Addiction", speakerName: "Prof. Amandine Luquiens" },
      { time: "18:15–19:15", title: "Panel discussion", detail: "The \"Therapy\" in Psychedelic-Assisted Therapy", panel: "friday" },
      { time: "19:15–20:15", title: "Optional networking dinner", detail: "Pre-sale available on Infomaniak or the ALPS info table at the venue", detailHighlight: true, menuNote: "Tofu-vegetable curry on rice with herb pesto · Crêpe station · Drinks included", kind: "pause" },
      { time: "20:15–21:15", title: "Friday evening program", kind: "social", experiences: [
        { title: "Storytelling", time: "20:45–21:30", personName: "Kate Dalby" },
      ] },
    ],
  },
  {
    day: "Saturday",
    date: "10 October",
    dateTime: "2026-10-10",
    items: [
      { time: "08:00–09:00", title: "Doors open", kind: "pause", menuNote: "Coffee, tea, fruit juices & vegan pastries from a local bakery", experiences: [
        { title: "Yoga", time: "08:10–08:50", personName: "Andrea Bacconi" },
      ] },
      { time: "09:00–10:00", title: "Dr. Pablo Mallaroni", detail: "Finding Order in Disorder: Mapping the Dynamics of the Psychedelic Brain", speakerName: "Dr. Pablo Mallaroni" },
      { time: "10:00–11:00", title: "Prof. Dr. Eric Vermetten", detail: "What Psychedelics Teach Us About Trauma", speakerName: "Prof. Dr. Eric Vermetten" },
      { time: "11:00–11:30", title: "Break", kind: "pause", menuNote: "Coffee, oat milk, tea · Nuts & fresh fruit selection", experiences: [
        { title: "Breathwork", time: "11:15–12:30", personName: "Pascal Kälin" },
      ] },
      { time: "11:30–12:30", title: "Dr. Lydia Belinger", detail: "Serotonin System Stimulation and Social Cognition: Differential Effects of Psilocybin, MDMA, and Methylphenidate", speakerName: "Dr. Lydia Belinger" },
      { time: "12:30–14:00", title: "Lunch break", kind: "pause", menuNote: "Beet tzatziki on chicory · Bolognese with pea mince & sour cream", experiences: [
        { title: "Live concert", time: "12:30–14:00", personName: "David & Anna-Lea Wennberg" },
        { title: "Sound meditation", time: "13:45–14:45", personName: "Marina Vovk" },
      ] },
      { time: "14:00–15:00", title: "Dr. Matthias Forstmann", detail: "The Mushroom Experience Project: Contextual Predictors and Species-Level Variation in the Subjective Effects of Psilocybin Mushrooms", speakerName: "Dr. Matthias Forstmann" },
      { time: "15:00–16:00", title: "Dr. Eirini Ketzitzidou Argyri", detail: "Ontological Disruptions and Diversification: Learning from psychedelics", speakerName: "Dr. Eirini Ketzitzidou Argyri" },
      { time: "16:00–17:00", title: "Coffee break", detail: "Group picture", detailHighlight: true, menuNote: "Coffee, tea · Vegan cakes, Ayurvedic energy balls & fresh fruit", kind: "pause", experiences: [
        { title: "Breathwork", time: "16:45–18:00", personName: "Pascal Kälin" },
      ] },
      { time: "17:00–18:00", title: "Dr. Jason K. Day", detail: "What-the-Fuckness: A Phenomenological Concept for Psychedelic Experience", speakerName: "Dr. Jason K. Day" },
      { time: "18:00–19:00", title: "Panel discussion", detail: "Psychedelics and Spirituality: Ontological Shifts and Meaning-Making Experiences", panel: "saturday" },
      { time: "19:00–19:30", title: "Closing talk", detail: "ALPS team" },
      { time: "19:30–21:30", title: "Networking apéro", kind: "social" },
      { time: "21:30–04:00", title: "Afterparty", detail: "Jugendkulturhaus Flösserplatz, Flösserstrasse 7", detailHighlight: true, kind: "social", experienceName: "Afterparty", calendarLocation: "Jugendkulturhaus Flösserplatz, Flösserstrasse 7, 5000 Aarau, Switzerland" },
    ],
  },
];
