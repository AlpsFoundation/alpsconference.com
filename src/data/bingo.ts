export type BingoPrompt = {
  id: string;
  text: string;
};

/** The classic card, in reading order. The free square sits between index 11 and 12. */
export const CLASSIC_PROMPTS: BingoPrompt[] = [
  { id: "drugs-before-4pm", text: "Someone offers you drugs before 4PM" },
  { id: "stoned-ape", text: "Unironic reference to stoned ape theory" },
  { id: "alcohol", text: "Shit-talking alcohol" },
  { id: "default-mode-network", text: "Unrelated mention of default mode network" },
  { id: "unsolicited-marketing", text: "Unsolicited marketing" },
  { id: "antidepressants", text: "Shit-talking antidepressants" },
  { id: "protest", text: "There’s a protest" },
  { id: "world-problem", text: "“Psychedelics could solve [current world problem]”" },
  { id: "all-connected", text: "“It’s all connected”" },
  { id: "solving-consciousness", text: "Talk about “solving” consciousness" },
  { id: "cringe-spirituality", text: "Cringe spirituality" },
  { id: "energy", text: "Misuse of the word “energy”" },
  { id: "barefoot", text: "Someone is barefoot" },
  { id: "high", text: "Someone is high" },
  { id: "not-funny", text: "Someone finds your bingo card and does NOT find it funny" },
  { id: "reverse-ageing", text: "Claim that psychedelics reverse ageing" },
  { id: "cheap-politics", text: "Applause for cheap political commentary" },
  { id: "ayahuasca-invite", text: "Invitation to ayahuasca ceremony" },
  { id: "poly", text: "Someone tells you they’re poly" },
  { id: "recreational-use", text: "Bullshit comment about recreational use" },
  { id: "n-equals-12", text: "n=12 study blown out of proportion" },
  { id: "clinical-safety", text: "Someone over-emphasizing how safe clinical settings are" },
  { id: "no-bad-trip", text: "“There’s no such thing as a bad trip”" },
  { id: "onstage-argument", text: "Heated argument onstage during a talk" },
];

/** More community prompts that only show up on a shuffled card. */
export const EXTRA_PROMPTS: BingoPrompt[] = [
  { id: "mckenna", text: "Un\u00adprompted Terence McKenna quote" },
  { id: "set-and-setting", text: "“Set and setting” explained to a room of experts" },
  { id: "neuroplasticity", text: "“Neuroplasticity” used to explain everything" },
  { id: "rainbow-brain", text: "Rainbow brain-scan slide, no error bars" },
  { id: "microdosing", text: "Micro\u00addosing presented as settled science" },
  { id: "blinding", text: "“Blinding was challenging”" },
  { id: "effect-size", text: "Effect size on the slide, confidence interval nowhere" },
  { id: "comment-not-question", text: "A question that is really a five-minute comment" },
  { id: "not-medical-advice", text: "“This isn’t medical advice, but…”" },
  { id: "startup-pitch", text: "Startup pitch disguised as a research talk" },
  { id: "done-the-work", text: "Someone asks if you’ve “done the work”" },
  { id: "mushroom-print", text: "Mushroom-print shirt, tote or earrings" },
  { id: "long-hug", text: "A hug that lasts slightly too long" },
  { id: "ancient-wisdom", text: "“Ancient wisdom” cited without a single source" },
  { id: "entheogen", text: "Someone corrects “psychedelic” to “entheogen”" },
  { id: "flow-state", text: "Speaker runs over time and blames the flow state" },
  { id: "space-holder", text: "Someone introduces themselves as a “space holder”" },
  { id: "more-research", text: "“We need more research” as the whole conclusion" },
  { id: "ego-dissolution", text: "Ego dissolution mentioned before the first coffee" },
  { id: "intention", text: "Someone asks what your intention is for the conference" },
];

/** Drawn from the 2026 talks, panels, experiences and menu. */
export const PROGRAMME_PROMPTS: BingoPrompt[] = [
  { id: "wtf-ness", text: "Someone says “what-the-fuckness” with a straight face" },
  { id: "beyond-words", text: "“Beyond words”, followed by twenty minutes of words" },
  { id: "mushroom-vintages", text: "Mushroom species discussed like wine vintages" },
  { id: "ontological", text: "“Ontological” three times in one question" },
  { id: "attractor-state", text: "Someone calls their bad mood an “attractor state”" },
  { id: "which-therapy", text: "Nobody on the panel agrees what the “therapy” is" },
  { id: "breathwork-report", text: "Someone skipped a talk for breathwork and tells you all about it" },
  { id: "energy-ball", text: "An Ayurvedic energy ball described as “grounding”" },
  { id: "blotter-art", text: "Someone at the blotter art swears they only like the colours" },
  { id: "group-picture", text: "The group picture takes longer than a talk" },
];

/** Only in Switzerland. */
export const SWISS_PROMPTS: BingoPrompt[] = [
  { id: "bicycle-day", text: "Albert Hofmann’s bicycle ride, retold" },
  { id: "paracelsus", text: "Paracelsus quoted: “the dose makes the poison”" },
  { id: "legal-in-switzerland", text: "Someone thinks psilocybin is already legal in Switzerland" },
  { id: "limited-medical-use", text: "Swiss limited medical use explained, wrongly, at the coffee machine" },
  { id: "monte-verita", text: "Monte Verità name-dropped" },
  { id: "cannabis-pilots", text: "Swiss cannabis pilot trials cited as proof of something" },
  { id: "sbb-delay", text: "Outrage over a two-minute SBB delay" },
  { id: "where-is-aarau", text: "Someone asks where Aarau is" },
  { id: "roestigraben", text: "The Röstigraben shows up in the seating" },
  { id: "settle-on-english", text: "A Swiss German and a Romand settle on English" },
];

export type BingoTheme = {
  id: string;
  label: string;
  prompts: BingoPrompt[];
};

export const BINGO_THEMES: BingoTheme[] = [
  { id: "community", label: "From the community", prompts: [...CLASSIC_PROMPTS, ...EXTRA_PROMPTS] },
  { id: "programme", label: "From the programme", prompts: PROGRAMME_PROMPTS },
  { id: "swiss", label: "Swiss edition", prompts: SWISS_PROMPTS },
];

export const ALL_PROMPTS: BingoPrompt[] = BINGO_THEMES.flatMap((theme) => theme.prompts);

export const PROMPTS_BY_ID = new Map(ALL_PROMPTS.map((prompt) => [prompt.id, prompt]));

/** Suggestions for the "where" field, named as on the venue map and programme. */
export const BINGO_PLACES = [
  "Main Stage",
  "Q&A",
  "Panel discussion",
  "Experiences (Saal 4)",
  "Live concert (Saal 2)",
  "Lounges",
  "Catering",
  "Research posters",
  "Info tables",
  "LSD Blotter Art Exhibition",
  "Speed-friending",
  "Networking dinner",
  "Networking apéro",
  "Afterparty (Flösserplatz)",
  "Outside the KuK",
];

export const BINGO_SIZE = 5;
/** Grid index of the free square. */
export const FREE_INDEX = 12;
