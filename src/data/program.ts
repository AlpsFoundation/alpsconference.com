/** Shared scientific program used by the conference site and the print booklet. */

export type ProgramExperience = {
  title: string;
  time: string;
};

export type ProgramItem = {
  time: string;
  title: string;
  detail?: string;
  detailHighlight?: boolean;
  kind?: "session" | "pause" | "social";
  speakerName?: string;
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
      { time: "08:00–09:00", title: "Doors open", kind: "pause" },
      { time: "09:00–09:30", title: "Opening", detail: "ALPS Team" },
      { time: "09:30–10:30", title: "Dr. Max Wolff", detail: "The Case for Considering Psychedelics as Psychotherapeutic Tools", speakerName: "Dr. Max Wolff" },
      { time: "10:30–11:00", title: "Coffee break", kind: "pause" },
      { time: "11:00–12:00", title: "Morten Lietz", detail: "Do Older Adults Trip Differently? A Double-Blind Comparison of LSD Effects Across the Adult Lifespan", speakerName: "Morten Lietz" },
      { time: "12:00–13:00", title: "Tommaso Barba", detail: "EEG correlates of self-dissolution induced by intranasal 5-MeO-DMT", speakerName: "Tommaso Barba" },
      { time: "13:00–14:30", title: "Lunch break", kind: "pause", experiences: [
        { title: "Sound meditation", time: "13:40–14:25" },
        { title: "Speed-friending", time: "13:45–14:30" },
      ] },
      { time: "14:30–15:30", title: "Manal Al-Hammadi", detail: "Psychedelics Governance: The Category Error in Mental Health Policy", speakerName: "Manal Al-Hammadi" },
      { time: "15:30–16:30", title: "Dr. Sandeep Nayak", detail: "From Data to Dosing Room: Optimizing Psilocybin Therapy for Clinical Practice", speakerName: "Dr. Sandeep Nayak" },
      { time: "16:30–17:15", title: "Coffee break", kind: "pause", experiences: [
        { title: "Sound meditation", time: "16:30–17:15" },
      ] },
      { time: "17:15–18:15", title: "Prof. Amandine Luquiens", detail: "Talk to be announced", speakerName: "Prof. Amandine Luquiens" },
      { time: "18:15–19:15", title: "Panel discussion", detail: "What Counts as Therapy in Psychedelic-Assisted Care" },
      { time: "19:15–20:15", title: "Optional Networking Dinner", detail: "Pre-Sale available on Infomaniak or @ALPS Info table at the venue", detailHighlight: true, kind: "pause" },
      { time: "20:15–21:45", title: "Friday evening program", kind: "social" },
    ],
  },
  {
    day: "Saturday",
    date: "10 October",
    dateTime: "2026-10-10",
    items: [
      { time: "08:00–09:00", title: "Doors open", kind: "pause", experiences: [
        { title: "Yoga", time: "08:10–08:50" },
      ] },
      { time: "09:00–10:00", title: "Dr. Pablo Mallaroni", detail: "Finding order in disorder: mapping the dynamics of the psychedelic brain", speakerName: "Dr. Pablo Mallaroni" },
      { time: "10:00–11:00", title: "Prof. Dr. Eric Vermetten", detail: "What Psychedelics Teach Us About Trauma", speakerName: "Prof. Dr. Eric Vermetten" },
      { time: "11:00–11:30", title: "Break", kind: "pause" },
      { time: "11:30–12:30", title: "Dr. Lydia Belinger", detail: "Serotonin System Stimulation and Social Cognition: Differential Effects of Psilocybin, MDMA, and Methylphenidate", speakerName: "Dr. Lydia Belinger" },
      { time: "12:30–14:00", title: "Lunch break", kind: "pause", experiences: [
        { title: "Live Concert", time: "12:30–14:00" },
        { title: "Sound meditation", time: "13:10–13:55" },
      ] },
      { time: "14:00–15:00", title: "Dr. Matthias Forstmann", detail: "The Mushroom Experience Project: Contextual Predictors and Species-Level Variation in the Subjective Effects of Psilocybin Mushrooms", speakerName: "Dr. Matthias Forstmann" },
      { time: "15:00–16:00", title: "Dr. Eirini Ketzitzidou Argyri", detail: "Ontological Disruptions and Diversification: Learning from psychedelics", speakerName: "Dr. Eirini Ketzitzidou Argyri" },
      { time: "16:00–17:00", title: "Coffee break", detail: "group picture", detailHighlight: true, kind: "pause", experiences: [
        { title: "Sound meditation", time: "16:10–16:55" },
      ] },
      { time: "17:00–18:00", title: "Dr. Jason K. Day", detail: "What-the-Fuckness: A Phenomenological Concept for Psychedelic Experience", speakerName: "Dr. Jason K. Day" },
      { time: "18:00–19:00", title: "Panel discussion", detail: "Psychedelics and spirituality: ontological shifts and meaning-making experiences" },
      { time: "19:00–20:00", title: "Closing talk", detail: "ALPS Team" },
      { time: "20:00–21:30", title: "Networking apéro", kind: "social" },
      { time: "21:30–04:00", title: "Afterparty", detail: "@Jugendkulturhaus Floesserplatz (Floesserstrasse 7, 5000 Aarau)", detailHighlight: true, kind: "social" },
    ],
  },
];
