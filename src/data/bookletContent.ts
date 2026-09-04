export const BOOKLET_YEAR = 2026;

export const BOOKLET_NAV = [
  { id: "introduction", label: "Introduction", printLabel: "introduction" },
  { id: "who-we-are", label: "Who we are", printLabel: "who we are" },
  { id: "venue", label: "Venue", printLabel: "venue" },
  { id: "program", label: "Program", printLabel: "program" },
  { id: "experiences", label: "Experiences", printLabel: "experiences" },
  { id: "talks", label: "Talks & panels", printLabel: "talks & panels" },
  { id: "team", label: "Team", printLabel: "team" },
  { id: "partners", label: "Partners", printLabel: "partners" },
  { id: "projects", label: "Our projects", printLabel: "our projects" },
  { id: "membership", label: "Membership / donations", printLabel: "membership/donations" },
  { id: "conclusions", label: "Conclusions", printLabel: "conclusions" },
] as const;

export type BookletView = "print" | "web";

export const INTRO_WELCOME = {
  title: "Welcome to the Awareness Lectures on Psychedelic Science",
  columns: [
    [
      "Welcome to the sixth annual edition of the ALPS Conference. This year’s event takes place in Aarau, hosted at Kultur & Kongresshaus Aarau — a gathering place in the historic heart of the city.",
      "Whether you are just beginning your journey or already immersed in the field, you are joining a unique gathering of scientists, clinicians, and students exploring the many facets of psychedelic research.",
      "This event brings together perspectives from diverse domains — neuroscience, clinical practice, anthropology, social science, and more. Our aim at the ALPS Foundation is to promote a multidisciplinary, evidence-based understanding of psychedelics, bridging the scientific, therapeutic, and humanistic dimensions of consciousness together.",
    ],
    [
      "Psychedelic compounds are psychoactive substances that enable people to experience distinct, non-ordinary states of consciousness. These states are particularly useful for studying the psyche, the mind-body relationship, and the emergence of subjective experiences across a diverse landscape of cognitions, emotions, and existential reflections.",
      "These non-ordinary states can be equally powerful in supporting individuals undergoing psychotherapy, enabling them to process difficult life experiences more profoundly and fostering long-lasting improvements in well-being.",
      "Psychedelic-Assisted Therapy (PAT) is an emerging therapeutic approach that shows promise for advancing mental health care. We are glad you joined us to learn more. Welcome to ALPS.",
    ],
  ],
};

export const INTRO_BRIDGES = {
  title: "ALPS Foundation: Building Bridges and Shelters",
  columns: [
    [
      "The ALPS Conference is our flagship event, complemented by other programs that further our mission.",
      "In partnership with the Swiss Psychedelic Student Network (SPSN), we support the next generation of researchers and clinicians through education, research, and science communication.",
      "Among these initiatives is the Swiss Psychedelic Student Forum, a student-led conference where Bachelor’s, Master’s, and PhD students share their research with peers and professionals. We also run the ALPS Summer School, an immersive week of lectures and workshops.",
    ],
    [
      "Beyond our events, we cultivate an international network of researchers and institutions. Through dialogue, collaboration, and social gatherings, we strengthen the connections that form the heart of this movement, while highlighting the vital role Switzerland plays in shaping it.",
      "In doing so, we like to think of ourselves as building bridges and shelters: bridges for institutions — to connect, exchange, and grow together; shelters for people — fostering collaborative, inter-disciplinary working teams and meaningful public debates.",
      "Ultimately, our focus is to generate a tangible positive impact for people and society by advancing science, fostering community, and building connection.",
    ],
  ],
};

export const PILLARS = {
  title: "Our Pillars",
  columns: [
    [
      "The ALPS Foundation is a Swiss non-profit organization dedicated to advancing the understanding and responsible integration of psychedelics through education, research, and therapeutic access.",
      "Founded on the principles of intrinsic motivation, critical thinking and effective altruism, our work is driven by volunteers and professionals committed to fostering interdisciplinary collaboration and public awareness.",
    ],
    [
      "Our mission is to provide reliable, evidence-based information on psychedelics, support emerging professionals, and contribute to shaping a future where these substances are better understood and safely applied for the benefit of mental health and human consciousness.",
    ],
  ],
};

export const CORE_PROGRAMS = [
  {
    title: "Education",
    body: "We organize events that promote academic and public understanding of psychedelics, most notably the annual ALPS Conference and the Swiss Psychedelic Student Forum. We also produce educational content including podcasts, infographics, and articles aimed at increasing accessibility to scientific knowledge. The ALPS Summer School welcomes participants from around the world for a week of theoretical and hands-on training.",
  },
  {
    title: "Research",
    body: "In 2022, we founded the ALPS Research Team, an interdisciplinary group of early-career scientists from Swiss universities. Our goal is to support and conduct collaborative scientific work on psychedelics in Switzerland and beyond. We currently partner with institutions such as the University of Fribourg and the Geneva University Hospitals (HUG).",
  },
  {
    title: "Access Facilitation",
    body: "Through our consulting program, we offer guidance on the therapeutic use of MDMA, Psilocybin, and LSD within the framework of Swiss law — specifically, the Federal Act on Narcotics and Psychotropic Substances (NarcA). We also support students who wish to create independent university associations, and we maintain a Patient Access Fund for Psychedelic Psychotherapy.",
  },
];

export const SPSN_COPY = [
  "The SPSN unites student associations across Swiss universities committed to broadening access to psychedelic science. Rooted in Switzerland but with an international outlook, the network fosters a space where students can learn, connect, and grow.",
  "To support collaboration between SPSN and ALPS, a coordination board brings together representatives from each student association and the foundation. This board helps align educational programs and national outreach efforts.",
  "Visit the ALPS Info Table during the breaks to learn more about SPSN’s work and how you can get involved.",
];

export const SWITZERLAND_COPY = {
  lead: "Switzerland remains at the forefront of the psychedelic renaissance. With dedicated research groups in Geneva, Zurich, Basel, Bern, Fribourg and beyond, it ranks among the most influential countries in high-impact psychedelic research. Swiss authorities are also leaders in public policy.",
  columns: [
    "While much of the world still awaits broader regulatory approval, Switzerland already permits psychedelic-assisted therapy on a case-by-case basis under the exceptional use program. This has allowed clinicians to gain unprecedented clinical experience administering LSD, MDMA, and psilocybin in real-world therapeutic contexts.",
    "As global acceptance grows — with breakthrough-therapy designations, European political developments, and legalization efforts elsewhere — Switzerland continues to offer a working model for safe, legal, medical psychedelic use.",
  ],
};

export const VENUE_COPY = {
  title: "Welcome to Kultur & Kongresshaus Aarau",
  paragraphs: [
    "The Kultur & Kongresshaus Aarau, located at Schlossplatz in Aarau, combines architectural elegance with modern functionality. High ceilings on the ground floor provide a sense of openness, with advanced event technology ensuring technical needs are seamlessly met.",
    "A spacious foyer serves as a welcoming area and exhibition space. Located near the heart of Aarau’s historic center, surrounded by dining and leisure options, it is a prime spot for local and international attendees alike.",
  ],
  facts: [
    { label: "Space", value: "1,000 m² of flexible event space" },
    { label: "Address", value: "Schlossplatz, Aarau — historic centre" },
    { label: "Train", value: "A short walk from Aarau station" },
    { label: "Access", value: "Wheelchair accessible; contact us for special needs" },
    { label: "Language", value: "The working language of the conference is English" },
    { label: "Credits", value: "Up to 14 FSP credits; 8 ECTS for SGPP/SSPP" },
  ],
};

export const PRACTICAL_COPY = [
  {
    title: "Catering",
    body: "Your conference ticket includes breakfast, morning and afternoon breaks, lunch, and the Saturday-evening apéro. We serve mainly vegetarian food with vegan options. An optional Friday evening meal is available.",
  },
  {
    title: "Recordings",
    body: "The event is not streamed live. Sessions are recorded and later published on the ALPS YouTube channel.",
  },
  {
    title: "Childcare",
    body: "On-site childcare is offered for children aged 18 months to 10 years, subject to minimum group sizes. Ticketholders are updated in September.",
  },
  {
    title: "Photography",
    body: "ALPS photographs and films the event for educational and promotional purposes. You may request removal of your image from digital properties we control.",
  },
  {
    title: "Afterparty",
    body: "Saturday 22:00–04:00. Access is included for conference ticket holders.",
  },
];

export const EXPERIENCES = [
  {
    when: "Friday evening",
    title: "Evening meal & program",
    detail: "Optional networking dinner, followed by the Friday evening program",
  },
  {
    when: "Saturday lunch",
    title: "Live music",
    detail: "Foyer · complimentary, during the lunch break",
  },
  {
    when: "Saturday evening",
    title: "Networking apéro",
    detail: "20:00–21:30 · included with your ticket",
  },
  {
    when: "Saturday night",
    title: "Afterparty",
    detail: "22:00–04:00 · included for conference ticket holders",
  },
  {
    when: "Throughout",
    title: "Community & exchange",
    detail: "Research posters, panel discussions, and space to meet fellow attendees",
  },
];

export const FRIDAY_PANEL = {
  title: "Psychotherapy and psychedelics",
  body: "This panel explores how psychedelics sit alongside psychotherapy — as catalysts, tools, or treatments in their own right — and what that means for clinical practice, training, and regulation. Additional panel participants will be announced.",
};

export const SATURDAY_PANEL = {
  title: "Psychedelics and spirituality",
  body: "This panel considers the spiritual, traditional, and meaning-making dimensions of psychedelic experience, and how they meet contemporary science. Additional panel participants will be announced.",
};

export const TEAM_SECTIONS = [
  {
    title: "Foundation Council",
    people: [
      { name: "Cyril Petignat", role: "CTO · Co-Founder" },
      { name: "Federico Seragnoli", role: "CEO · Meta-Coordinator · Co-Founder" },
      { name: "Diego Dos Santos", role: "Financial Auditor · Co-Founder" },
      { name: "Philipp Hampel", role: "COO · Conference Coordinator" },
    ],
  },
  {
    title: "Event & program",
    people: [
      { name: "Bianca Borsarini", role: "Event management, catering" },
      { name: "Morten Lietz", role: "Educational program" },
      { name: "Raphaël Saunier", role: "Experiences · IT" },
      { name: "Valentin Rieder", role: "SPSN co-coordinator" },
      { name: "Vincent Diehl", role: "Speaker management" },
      { name: "Paul Springfeld", role: "Speaker management" },
    ],
  },
  {
    title: "Communication",
    people: [
      { name: "Andréa Sader", role: "Social media" },
      { name: "Nathalie Nicolet", role: "Marketing · membership" },
      { name: "Brian Cisse", role: "Public relations & partnerships" },
      { name: "Mourad Chouaki", role: "Podcast" },
    ],
  },
  {
    title: "Creative & research",
    people: [
      { name: "Giada Finocchio", role: "Graphic design" },
      { name: "Régis Paroz", role: "Conference designer · posters" },
      { name: "Abigail Calder", role: "Scientific research coordinator" },
      { name: "Gabriella Szasz", role: "Summer School coordinator" },
    ],
  },
];

export const PROJECTS = [
  {
    title: "ALPS Conference",
    body: "A two-day international academic event featuring cutting-edge research, clinical insights, and interdisciplinary talks in psychedelic science.",
  },
  {
    title: "ALPS Summer School",
    body: "A week-long immersive program. Participants explore psychedelic science through expert lectures, hands-on workshops, and community experiences, open to learners of all levels.",
  },
  {
    title: "Swiss Psychedelic Student Forum",
    body: "Organized with the Swiss Psychedelic Student Network (SPSN), this symposium highlights student-led projects and early-career research.",
  },
  {
    title: "Research & access",
    body: "Survey work on motives, set and setting, and music in psychedelic experience; consulting for clinicians and student associations; and a Patient Access Fund for psychedelic psychotherapy.",
  },
];

export const MEMBERSHIP = {
  tiers: [
    { name: "Student", price: "60 CHF / year" },
    { name: "General", price: "150 CHF / year" },
    { name: "Professional", price: "250 CHF / year" },
  ],
  membership: [
    "While the ALPS Foundation operates on the intrinsic motivation and volunteer engagement of all its members, donations and financial contributions are decisive for us to continue what we do.",
    "As a member, you support us with an annual fee that helps fund the three pillars of our projects: Education, Research, and Medical Access Facilitation. Membership comes with exclusive benefits such as in-person meetings, limited-edition merch, and our newsletter.",
  ],
  donations: [
    "If becoming a member doesn’t fit, you can also support us with a one-time donation. Any donation makes a difference, as ALPS operates on community-based and effective altruism principles.",
    "All ALPS assets are stored at the Alternative Bank Switzerland (ABS) to reduce our environmental impact. Donate via TWINT, card, or bank transfer at alps.foundation.",
  ],
};

export const CREDITS = {
  fsp: "Psychologists (FSP): 14 credits for the main conference.",
  sgpp: "Medical doctors (SGPP/SSPP): 8 ECTS for the main conference.",
  note: "Every participant will receive a certificate by email after the conference. If you did not receive it, write to info@alps.foundation.",
};

export const PALE_BLUE_DOT = [
  "From this distant vantage point, the Earth might not seem of any particular interest. But for us, it's different. Consider again that dot. That's here. That's home. That's us.",
  "On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives.",
  "The Earth is a very small stage in a vast cosmic arena. Our posturings, our imagined self-importance, the delusion that we have some privileged position in the Universe, are challenged by this point of pale light.",
  "To me, it underscores our responsibility to deal more kindly with one another, and to preserve and cherish the pale blue dot, the only home we've ever known.",
];
