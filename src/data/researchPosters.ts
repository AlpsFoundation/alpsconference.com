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
    name: "Anna L. Boeker",
    credentials: "MSc · PhD student in clinical research",
    affiliation: "University of Basel and University Psychiatric Clinic Basel (UPK)",
    title: "Efficacy and Safety of Psilocybin-Assisted Therapy for Alcohol Use Disorder",
    summary: [
      "Our clinical research group for substance-assisted therapy at the UPK Basel includes professionals from the fields of psychiatry, psychology, and clinical research. The main focus of our work is research on the effects of LSD, which we have been studying since 2014 in several studies. We examine efficacy, safety and possible positive long-term effects of LSD in mental health conditions such as anxiety and depression. In the LYTA trial, together with the University of Bern, we will investigate LSD assisted therapy for alcohol use disorder in a multicenter, double-blind, randomized, active-placebo controlled phase II neuroimaging trial with a consecutive open-label phase.",
    ],
    hasPhoto: true,
    hasPdf: true,
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
    summary: [
      "Substance use disorders involving ketamine, cocaine, and alcohol are clinically challenging, with high relapse rates and few effective pharmacological options. We report a 30-year-old man with a five-year history of severe polysubstance dependence, including daily intranasal ketamine use of 2–3 g/day, cocaine, alcohol, nicotine, and recurrent depressive disorder. Despite conventional psychiatric treatment, severe craving persisted and the patient sought medically supervised ibogaine-assisted treatment in Mexico.",
      "The patient completed a structured 13-day residential program. Following medical screening, he received an 800 mg ibogaine HCl flood dose (10.1 mg/kg), followed by supplementary doses under continuous ECG and vital-sign monitoring. Treatment was associated with rapid cessation of craving for previously misused substances. Longitudinal follow-up over approximately 17 months, including serial toxicology and standardized psychometric assessments, was consistent with continued abstinence from ketamine, cocaine, alcohol, and other previously misused substances. Depressive symptoms remained minimal (PHQ-9 0–3), anxiety improved, and quality of life increased substantially (WHOQOL-BREF 55 to 71). A medically supervised fractionated ibogaine intervention was administered approximately 11 months after the initial treatment in the context of bereavement, representing an important confounding factor in interpreting longer-term outcomes.",
      "To our knowledge, this is the first longitudinally documented case of sustained abstinence in severe ketamine use disorder following ibogaine treatment supported by serial toxicology and standardized psychometric outcomes. The findings extend an evidence base that has focused largely on opioid use disorder and suggest that ketamine use disorder warrants systematic investigation. Possible mechanisms include ibogaine and noribogaine effects on monoaminergic, glutamatergic, opioid, and neuroplasticity-related pathways; however, causal mechanisms cannot be established from a single case. This report highlights both the therapeutic potential and the medical complexity of ibogaine and supports further prospective research within rigorous clinical and cardiovascular safety frameworks. Particular attention should be given to cardiac risk, patient selection, standardized monitoring, and durability of outcomes.",
    ],
    hasPhoto: true,
    hasPdf: true,
  },
  {
    slug: "sven-kaufmann",
    name: "Sven Kaufmann",
    credentials: "Founder · Self-employed",
    affiliation: "Apeiron & Nous Foundation",
    title: "Beyond the Known: Can Extreme States of Consciousness Reveal Recurring Informational Structures?",
    summary: [
      "Psychedelic science has substantially advanced our understanding of therapeutic applications and neural correlates, yet extreme psychedelic states remain comparatively unexplored. In particular, ultra-high-dose states characterized by profound ego dissolution, timelessness, experiences of the “void,” seemingly autonomous entities, and radically altered perceptions of self and reality raise fundamental questions about consciousness that have rarely been investigated systematically.",
      "The Apeiron & Nous Foundation is developing a long-term interdisciplinary research program dedicated to the systematic investigation of these extreme states of consciousness. Moving beyond the therapeutic paradigm, the project explores high- and ultra-high-dose psilocybin states as a largely uncharted domain of consciousness research. Rather than testing a predefined theoretical or metaphysical interpretation, the research treats detailed first-person phenomenology as structured data and asks whether recurring experiential patterns can be identified across individuals and sessions.",
      "The research framework combines structured phenomenological mapping with multimodal measurements, including physiological metrics and EEG where appropriate. Artificial intelligence methods—including large language models, machine learning, and pattern recognition—are used to analyze complex phenomenological datasets, identify recurring motifs and latent structures, integrate experiential and physiological data, and generate testable hypotheses.",
      "A central objective is to determine whether extreme states exhibit reproducible structures that can be systematically documented and compared. The project further asks whether AI-assisted exploration of these datasets can reveal relationships, phenomena, and scientific questions that may not be apparent through conventional analysis alone.",
      "The research is inherently exploratory. Experiences are documented without assuming that their apparent content represents external, metaphysical, or non-human realities. Alternative explanations remain open, and recurring observations are treated as phenomena to be investigated rather than conclusions.",
      "The long-term objective is to establish an open and standardized research framework for the reproducible study of extreme consciousness and interdisciplinary collaboration across psychedelic science, neuroscience, phenomenology, psychology, philosophy, and artificial intelligence.",
      "By transforming extreme conscious experiences from predominantly anecdotal reports into structured, comparable data, the project aims to expand the empirical study of consciousness and generate new questions about the nature and structure of conscious experience.",
    ],
    hasPhoto: true,
    hasPdf: true,
  },
  {
    slug: "amos-lau",
    name: "Amos Lau",
    credentials: "MD · Medical doctor",
    affiliation: "Monash University",
    title: "Seeing with ‘Fresh Eyes’: Development and Validation of the Fresh Experiences Scale",
  },
  {
    slug: "tulio-pereira-alvarenga-castro",
    name: "Túlio Pereira Alvarenga-Castro",
    credentials: "MD · Physician and researcher in addictology",
    affiliation: "CHU de Nîmes, France",
    title: "Psychedelics as a Dual Therapy: Exploring Their Potential in Treating Addictive Disorders and Inflammation",
    summary: [
      "Background: Alcohol use disorder (AUD) and major depressive disorder are frequently associated with chronic low-grade inflammation and immune dysregulation. Psychedelic compounds have shown promising therapeutic effects across psychiatric disorders, although their immunomodulatory mechanisms remain insufficiently characterized.",
      "Objective: To systematically review the inflammatory, immunomodulatory, and potential microbiota-related effects of psychedelic compounds in human clinical and human-derived in vitro studies, with particular relevance to AUD and related psychiatric conditions.",
      "Methods: Following PRISMA guidelines, major databases were searched through January 1, 2026. Original studies evaluating inflammatory, immune, or microbiota-related outcomes in humans or human-derived in vitro models were included. Data were independently extracted and qualitatively synthesized. Eight studies met inclusion criteria, investigating ayahuasca, psilocybin, N,N-dimethyltryptamine (N,N-DMT), and 5-methoxy-N,N-dimethyltryptamine (5-MeO-DMT).",
      "Results: Across studies, psychedelic compounds exhibited selective, context-dependent immunomodulatory effects. Human studies reported reductions in inflammatory markers, including tumor necrosis factor-α, interleukin-6, and C-reactive protein, following psilocybin, ayahuasca, and 5-MeO-DMT administration, particularly in individuals with elevated inflammatory activity. In vitro studies demonstrated reduced pro-inflammatory cytokine production, attenuation of microglial activation, and modulation of dendritic-cell differentiation through 5-hydroxytryptamine receptor 2A and sigma-1 receptor signaling. Although emerging evidence suggests interactions between psychedelics, inflammation, and gut-brain pathways, no study directly assessed microbiota-related outcomes.",
      "Conclusion: Current evidence supports a potential role of psychedelic compounds in modulating inflammatory pathways implicated in psychiatric and addictive disorders. However, human evidence remains limited and relies predominantly on peripheral biomarkers. Longitudinal studies are needed to clarify the contribution of immune and gut-brain pathways to therapeutic outcomes in AUD and related conditions.",
    ],
    hasPhoto: true,
    hasPdf: true,
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
    credentials: "MD-PhD candidate · Incoming psychiatry resident, Geha Mental Health Center, Israel",
    affiliation: "Gray Faculty of Medical and Health Sciences, Tel Aviv University, Israel",
    title: "Holding the Insight Lightly: An Epistemic Framework for Psychedelic-Assisted Therapy, Built from Dialectical Behaviour Therapy",
    summary: [
      "Psychedelic experiences can produce insights that arrive with complete conviction - felt not as conclusions reached, but as truths already known. This noetic certainty can be understood as a metacognitive feeling of epistemic gain: a felt signal that understanding has occurred even when the cognitive work that would ordinarily warrant it has not, leaving the mind to draw on available memories, interpretations and contextual cues to explain a certainty already felt. This conceptual work argues that the therapeutic mechanism and the central epistemic hazard are one event: the same felt certainty that appears to carry therapeutic change can also confer epistemic authority on convictions before that authority has been earned. Therapeutic benefit and epistemic hazard therefore cannot simply be tuned apart.",
      "We propose dialectical behaviour therapy (DBT) as an epistemic technology for psychedelic-assisted therapy: a framework for metabolising conviction without either surrendering to it or dismissing it. We map DBT skills onto the distinct epistemic demands of preparation, dosing and integration, drawing on skills such as behavioural chain analysis, mindfulness, distress tolerance and Check the Facts to ground intentions in evidence, sustain non-judgemental monitoring, tolerate uncertainty and test what emerges once deliberate evaluation returns. The resulting model, psychedelic-assisted DBT (PA-DBT), aims to preserve the transformative force of the experience while subjecting the convictions it produces to disciplined testing before they are acted on.",
      "The same discipline extends beyond the patient. Psychedelic “eureka” moments in clinicians and researchers are vulnerable to the same confusion between felt knowing and knowledge, and we apply that principle to the founding conviction behind this paper itself. PA-DBT is offered not as a new orthodoxy but as a testable proposal, with comparator designs asking whether the drug is necessary and whether DBT specifically is.",
    ],
    hasPhoto: true,
    hasPdf: true,
  },
];
