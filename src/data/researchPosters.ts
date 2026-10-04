/**
 * Research posters presented at ALPS 2026, published with the presenters' consent.
 *
 * Files live in public/research-posters/<slug>/:
 *   poster.pdf   the print-ready PDF
 *   poster.jpg   first-page preview (pdftoppm -jpeg -scale-to-x 600 -scale-to-y -1 -singlefile poster.pdf poster)
 *   photo.jpg    presenter portrait (square crop works best)
 */

export type ResearchPoster = {
  slug: string;
  name: string;
  /** Highest degree and profession, e.g. "MSc · PhD student". */
  credentials: string;
  affiliation: string;
  title: string;
  /** One string per paragraph, in the presenter's own words. */
  summary?: string[];
  hasPhoto?: boolean;
  hasPdf?: boolean;
};

// Sorted by surname. Set hasPhoto / hasPdf once the files are in public/research-posters/<slug>/.
export const POSTERS: ResearchPoster[] = [
  {
    slug: "angelica-angaramo-chumachenko",
    name: "Angélica Angaramo Chumachenko",
    credentials: "Hypnotherapist, independent practitioner",
    affiliation: "Angelux Hypnose, France",
    title: "A Hypnosis-Informed Framework for Post-Psychedelic Integration: Stability, Autonomy and Referral Boundaries",
    summary: [
      "Drawing on two anonymised situations from my independent practice, this poster explores hypnosis-informed integration and prevention. The first focuses on building a new internal foundation through work in a hypnotic state to integrate the experience into everyday life. The second raises concerns about easy access, fashionable labels and perceived lower costs overshadowing preparation, qualified support and follow-up. I encountered this person when significant instability was already present and recommended urgent psychiatric assessment.",
      "The central message is to make the framework of care as visible as the substances themselves, supporting informed choices beyond promises of easy transformation. This practice-based perspective does not establish clinical efficacy. I do not administer psychedelic substances.",
    ],
    hasPhoto: true,
    hasPdf: true,
  },
  {
    slug: "anna-boeker",
    name: "Anna Boeker",
    credentials: "MSc · PhD student",
    affiliation: "University of Basel",
    title: "Efficacy and Safety of Psilocybin-Assisted Therapy for Alcohol Use Disorder",
  },
  {
    slug: "anna-breitenmoser",
    name: "Anna Breitenmoser",
    credentials: "MSc · Student",
    affiliation: "University of Geneva, Oxford University",
    title: "Mystical Experience in Psychedelic-Assisted Psychotherapy: Clinical Findings and Methodological Reflections on the MEQ30",
    summary: [
      "Mystical experiences are altered states of consciousness characterized by a profound sense of unity, transcendence of time and space, ineffability, and deeply felt noetic or sacred qualities. Historically associated with spiritual and religious traditions, these experiences have become a growing subject of scientific investigation within contemporary psychedelic research. In psychedelic-assisted psychotherapy (PAP), mystical-type experiences are frequently proposed as key mediators of therapeutic improvement and are commonly assessed using the Mystical Experience Questionnaire (MEQ30). However, the phenomenology, historical foundations, and methodological limitations of this construct remain insufficiently discussed.",
      "This poster presents a retrospective sub-analysis conducted within the PAP program at the Hôpitaux Universitaires de Genève under the Swiss compassionate-use framework. Fifty-seven participants who received LSD or psilocybin completed the MEQ30 and the State-Trait Anxiety Inventory (STAI) before and after treatment. Results demonstrated a significant reduction in anxiety symptoms following treatment, independently of the psychedelic substance administered. However, no significant linear association was observed between mystical experience intensity and anxiety reduction outcomes. Approximately 48% of participants met MEQ30 criteria for a “complete mystical experience.”",
      "Building upon these findings, the poster explores how mystical experiences are conceptualized and measured in psychedelic research. It briefly reviews the historical development of the construct, from William James and Walter Terence Stace to the MEQ43 and later MEQ30. Particular attention is given to the psychometric reduction of highly subjective and often ineffable experiences into standardized quantitative scales. Finally, the poster discusses limitations of current approaches and proposes complementary perspectives, including phenomenological interviews, qualitative narratives, mixed-methods designs, and neurophenomenological frameworks, to better capture the complexity of altered states of consciousness.",
    ],
    hasPhoto: true,
    hasPdf: true,
  },
  {
    slug: "mauro-cavarra",
    name: "Mauro Cavarra",
    credentials: "PhD · Researcher, psychotherapist",
    affiliation: "Maastricht University",
    title: "Breathe Hard to Breathe Easy: preliminary results of the breathwork-assisted therapy for social anxiety",
  },
  {
    slug: "beatrice-dal-bianco",
    name: "Beatrice Dal Bianco",
    credentials: "MSc · Doctor, resident in psychiatry",
    affiliation: "Società Italiana di Medicina Psichedelica (SIMEPSI)",
    title: "Motivation, stigma and post-acute psychological outcomes after psychedelic use: insights from the Italian Global Psychedelic Survey 2025",
  },
  {
    slug: "sonya-faber",
    name: "Sonya Faber",
    credentials: "PhD · Adjunct Professor",
    affiliation: "Psychedelia Stiftung",
    title: "Sustained Abstinence in Severe Ketamine Use Disorder Following Ibogaine Treatment",
  },
  {
    slug: "sven-kaufmann",
    name: "Sven Kaufmann",
    credentials: "Founder · Self-employed",
    affiliation: "Apeiron & Nous Foundation",
    title: "Beyond the Known: Can Extreme States of Consciousness Reveal Recurring Informational Structures?",
  },
  {
    slug: "amos-lau",
    name: "Amos Lau",
    credentials: "MD · Medical doctor",
    affiliation: "Monash University",
    title: "Seeing with ‘Fresh Eyes’: Development and Validation of the Fresh Experiences Scale",
  },
  {
    slug: "tulio-pereira-alvarenga-e-castro",
    name: "Túlio Pereira Alvarenga e Castro",
    credentials: "MD · Physician",
    affiliation: "Department of Addiction, CHU Nîmes; Faculty of Medicine, Federal University of Vale do Jequitinhonha e Mucuri (UFVJM)",
    title: "Psychedelics as a Dual Therapy: Exploring Their Potential in Treating Addictive Disorders and Inflammation",
  },
  {
    slug: "giovanna-saad-gimenes",
    name: "Giovanna Saad Gimenes",
    credentials: "MA, PhD candidate · PhD researcher, part-time psychotherapist",
    affiliation: "University of Bristol",
    title: "The Missing Population: Post-Traumatic Growth in Domestic Violence and Sexual Abuse Survivors Receiving Psychedelic/psychoactive-Assisted Therapy",
  },
  {
    slug: "ortal-shinikamin",
    name: "Ortal Shinikamin",
    credentials: "MD-PhD candidate · Psychiatry",
    affiliation: "Tel Aviv University",
    title: "Holding the Insight Lightly: An Epistemic Framework for Psychedelic-Assisted Therapy, Built from Dialectical Behaviour Therapy",
  },
];
