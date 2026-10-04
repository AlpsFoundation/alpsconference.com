/**
 * Research posters presented at ALPS 2026, published with the presenters' consent.
 *
 * Files live in public/research-posters/<slug>/:
 *   poster.pdf   the print-ready PDF
 *   poster.jpg   first-page preview (pdftoppm -jpeg -r 40 -singlefile poster.pdf poster)
 *   photo.jpg    presenter portrait (square crop works best)
 */

export type ResearchPoster = {
  slug: string;
  name: string;
  /** Degrees and role, e.g. "MSc, PhD candidate". */
  credentials: string;
  affiliation: string;
  title: string;
  summary?: string;
  hasPhoto?: boolean;
  hasPdf?: boolean;
};

// MOCKUP: placeholder entries to show the page structure. Replace with the real presenters.
export const POSTERS: ResearchPoster[] = [
  {
    slug: "placeholder-1",
    name: "Presenter Name",
    credentials: "MSc, PhD candidate",
    affiliation: "University of Geneva",
    title: "Psilocybin-assisted therapy for treatment-resistant depression: a pilot study",
    summary:
      "A short summary of the research, two or three sentences long, giving visitors the question, the method and the main finding before they open the full poster.",
  },
  {
    slug: "placeholder-2",
    name: "Presenter Name",
    credentials: "MD",
    affiliation: "University Hospital Zurich",
    title: "Set and setting in clinical trials: a systematic review",
    summary:
      "A short summary of the research, two or three sentences long, giving visitors the question, the method and the main finding before they open the full poster.",
  },
  {
    slug: "placeholder-3",
    name: "Presenter Name",
    credentials: "BSc, Master's student",
    affiliation: "University of Basel",
    title: "Changes in default mode network connectivity after a single dose of LSD",
    summary:
      "A short summary of the research, two or three sentences long, giving visitors the question, the method and the main finding before they open the full poster.",
  },
  {
    slug: "placeholder-4",
    name: "Presenter Name",
    credentials: "PhD, Postdoctoral researcher",
    affiliation: "EPFL",
    title: "Integration practices after psychedelic experiences: a qualitative study",
    summary:
      "A short summary of the research, two or three sentences long, giving visitors the question, the method and the main finding before they open the full poster.",
  },
];
