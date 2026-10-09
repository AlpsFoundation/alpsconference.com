/**
 * Copy for the conference booklet (/booklet), transcribed from the printed
 * Canva booklet. Schedules, speakers, workshops and experience profiles are
 * not repeated here: the booklet reads them from the shared site data.
 */

export const BOOKLET_YEAR = 2026;

export const BOOKLET_NAV = [
  { id: "introduction", label: "Introduction" },
  { id: "who-we-are", label: "Who we are" },
  { id: "venue", label: "Venue" },
  { id: "workshops", label: "Workshop program" },
  { id: "program", label: "Program" },
  { id: "experiences", label: "Experiences" },
  { id: "talks", label: "Talks & panels" },
  { id: "team", label: "Team" },
  { id: "partners", label: "Partners" },
  { id: "projects", label: "Our projects" },
  { id: "posters", label: "Posters" },
  { id: "membership", label: "Membership & donations" },
  { id: "conclusions", label: "Conclusions" },
] as const;

export type BookletNavId = (typeof BOOKLET_NAV)[number]["id"];

export const INTRO_WELCOME = {
  title: "Welcome to the Awareness Lectures on Psychedelic Science",
  paragraphs: [
    "Welcome to the sixth annual edition of the ALPS Conference. This year’s event is taking place in Aarau, hosted at the Kultur & Kongresshaus.",
    "Whether you’re just beginning your journey or already immersed in the field, you’re joining a unique gathering of scientists, clinicians, and students exploring the many facets of psychedelic research.",
    "This event brings together perspectives from diverse domains — neuroscience, clinical practice, anthropology, social science, and more.",
    "Our aim at the ALPS Foundation is to promote a multidisciplinary, evidence-based understanding of psychedelics, bridging the scientific, therapeutic, and humanistic dimensions of consciousness together.",
    "Psychedelic compounds are psychoactive substances that enable people to experience distinct, non-ordinary states of consciousness.",
    "These states are particularly useful for studying the psyche, the mind-body relationship, and the emergence of subjective experiences across a diverse landscape of cognitions, emotions, and existential reflections.",
    "These non-ordinary states can be equally powerful in supporting individuals undergoing psychotherapy, enabling them to process difficult life experiences more profoundly and fostering long-lasting improvements in well-being.",
    "Psychedelic-Assisted Therapy (PAT) is an emerging therapeutic approach that shows promise for advancing mental health care.",
  ],
  signoff: ["We are glad you joined us to learn more.", "Welcome to ALPS."],
};

export const INTRO_BRIDGES = {
  title: "ALPS Foundation: building bridges and shelters",
  paragraphs: [
    "The ALPS Conference is our flagship event, complemented by other programs that further our mission.",
    "In partnership with the Swiss Psychedelic Student Network (SPSN), we support the next generation of researchers and clinicians through education, research, and science communication.",
    "Among these initiatives is the Swiss Psychedelic Student Forum, a student-led conference where Bachelor’s, Master’s, and PhD students share their research with peers and professionals.",
    "This year, we held the second edition of our Swiss psychedelic science summer program, ALPS Summer School, bringing together 25 participants for a week of immersive lectures and workshops.",
    "Beyond our events, we cultivate an international network of researchers and institutions.",
    "Through dialogue, collaboration, and social gatherings, we strengthen the connections that form the heart of this movement, while highlighting the vital role Switzerland plays in shaping it.",
    "In doing so, we like to think of ourselves as building bridges and shelters: bridges for institutions — to connect, exchange, and grow together; shelters for people — fostering collaborative, interdisciplinary working teams and meaningful public debates.",
    "Ultimately, our focus is to generate a tangible positive impact for people and society by advancing science, fostering community, and building connection.",
  ],
};

export const PILLARS = {
  title: "Our pillars",
  paragraphs: [
    "The ALPS Foundation is a Swiss non-profit organization dedicated to advancing the understanding and responsible integration of psychedelics through education, research, and therapeutic access.",
    "Founded on the principles of intrinsic motivation, critical thinking and effective altruism, our work is driven by volunteers and professionals committed to fostering interdisciplinary collaboration and public awareness.",
    "Our mission is to provide reliable, evidence-based information on psychedelics, support emerging professionals, and contribute to shaping a future where these substances are better understood and safely applied for the benefit of mental health and human consciousness.",
  ],
};

export const CORE_PROGRAMS = {
  title: "Our three core programs",
  programs: [
    {
      title: "Education",
      paragraphs: [
        "We organize events that promote academic and public understanding of psychedelics, most notably the annual ALPS Conference and the Swiss Psychedelic Student Forum. We also produce educational content including podcasts, infographics, and blog content aimed at increasing accessibility to scientific knowledge. In 2025, we launched the first ALPS Summer School, welcoming participants from around the world for a week of theoretical and hands-on training with leading figures in the psychedelic field.",
      ],
    },
    {
      title: "Research",
      paragraphs: [
        "In 2022, we founded the ALPS Research Team, an interdisciplinary group of early-career scientists from Swiss universities. Our goal is to support and conduct collaborative scientific work on psychedelics in Switzerland and beyond. We currently partner with institutions such as the University of Fribourg and the Geneva University Hospitals (HUG).",
        "Our research focuses on meaningful, underexplored questions in psychedelic science. This year, we completed two large-scale survey projects investigating the motivations behind psychedelic use among students and the influence of “set and setting” on psychedelic experiences. We look forward to publishing results that may inform future therapeutic practices and public understanding.",
      ],
    },
    {
      title: "Access facilitation",
      paragraphs: [
        "Through our consulting program, we offer guidance on the therapeutic use of MDMA, Psilocybin, and LSD within the framework of Swiss law — specifically, the Federal Act on Narcotics and Psychotropic Substances (Narcotics Act, NarcA, SR 812.121).",
        "Additionally, the consulting service is available for any student in Switzerland or abroad who wishes to be supported in creating an independent student association at their own university. Founders from seven Swiss independent university associations are on hand to help you create your own.",
        "We have also established a Patient Access Fund for Psychedelic Psychotherapy in Geneva, which provides financial support to individuals seeking treatment with these substances under <em>exceptional medical use licences</em> granted by the Federal Office of Public Health (FOPH).",
      ],
      link: {
        label: "Student association consulting",
        href: "https://www.alps.foundation/psychedelic-student-association-consulting-service",
      },
    },
  ],
};

/** Swiss Psychedelic Student Network member associations, ringed around the network’s logo. */
export const SPSN = {
  title: "The Swiss Psychedelic Student Network (SPSN)",
  hub: { file: "spsn.png", name: "Swiss Psychedelic Student Network" },
  groups: [
    { file: "parab.png", name: "Psychedelic Awareness & Research Association Basel" },
    { file: "proof.png", name: "Psychedelic Research Organization of Fribourg" },
    { file: "napa.png", name: "Neuchâtel Association for Psychedelic Awareness" },
    { file: "arp.png", name: "Association pour la Recherche sur les Psychédéliques de l’Université de Genève" },
    { file: "pala.png", name: "Psychedelic Association of Lausanne for Awareness" },
    { file: "proz.png", name: "Psychedelic Research Organization of Zurich" },
    { file: "probe.png", name: "Psychedelic Research Organization of Bern" },
  ],
  paragraphs: [
    "The SPSN unites student associations across Swiss universities committed to broadening access to psychedelic science. Rooted in Switzerland but with an international outlook, the network fosters a space where students can learn, connect, and grow.",
    "To support collaboration between SPSN and ALPS, a coordination board was formed, bringing together one or two representatives from each student association and the foundation.",
    "This board helps align educational programs and national outreach efforts, strengthening communication across campuses and raising awareness of psychedelic science.",
    "Visit the ALPS Info Table during the breaks to learn more about SPSN’s work and how you can get involved.",
  ],
};

export const SWITZERLAND = {
  title: "Switzerland: a unique landscape for psychedelic science",
  lead: "Switzerland remains at the forefront of the psychedelic renaissance. With dedicated research groups in Geneva, Zurich, Basel, Bern, and Fribourg, it ranks second globally (after the US) in high-impact psychedelic research citations. Swiss authorities are also leaders in public policy.",
  paragraphs: [
    "While the world awaits MDMA’s regulatory approval by the FDA in the US, Switzerland already permits psychedelic-assisted therapy on a case-by-case basis under the exceptional use program. This has allowed clinicians to gain unprecedented clinical experience administering LSD, MDMA, and Psilocybin in real-world therapeutic contexts.",
    "As global acceptance grows, with the FDA’s “breakthrough therapy” designations, Germany’s recent political advancements and Australia’s legalization work, Switzerland continues to offer a working model for safe, legal, medical psychedelic use.",
  ],
  chartCaption: "Liechti, 2025: Swiss authorisations delivered for PAT since 2016.",
};

export const VENUE = {
  title: "Kultur & Kongresshaus Aarau",
  address: "Schlossplatz, Aarau, Switzerland",
  paragraphs: [
    "The Kultur & Kongresshaus Aarau, located at Schlossplatz in Aarau, combines architectural elegance with modern functionality. The facility boasts high ceilings on the ground floor providing a sense of openness and grandeur, with advanced event technology ensuring all technical needs are seamlessly met.",
    "A spacious foyer serves as a welcoming area and exhibition space. Located near the heart of Aarau’s historic center, surrounded by dining and leisure options, it’s a prime spot for local and international attendees alike.",
  ],
  practicalIntro: "To make your stay pleasant and smooth, please take note of the following practical information:",
  practical: [
    { title: "Wardrobe", body: "A self-service wardrobe is available in the Foyer. Please note that ALPS cannot take responsibility for any items left there." },
    { title: "Luggage storage", body: "Suitcases can be stored free of charge upon request at the Reception (no. 1 on the map), right at the entrance." },
    { title: "Friday dinner", body: "An optional, self-paid Networking Dinner is available on Friday evening (19:15–20:15). To avoid queuing, purchase it in advance via Infomaniak, or at the ALPS Info Table at the venue." },
    { title: "Wi-Fi", body: "Connect to “KUK-Wifi”, then open the browser and use “ALPS-2026” as both username and password." },
  ],
  signoff: "We wish you a productive and inspiring conference!",
};

export const VENUE_MAP = {
  title: "Map of the site",
  intro: "An overview of the Kultur & Kongresshaus Aarau site, including the conference rooms and activity areas. Tap a number to find it on the plan.",
  saal4: "Saal 4, on the top floor, hosts the other activities. Outside programmed times it is open to all participants as a relaxation space.",
};

/** Short booklet summaries of the Workshop Day tracks, keyed by the track’s language. */
export const WORKSHOP_SUMMARIES: Record<string, { title: string; summary: string }> = {
  English: {
    title: "Let’s talk about sex (in PAT)",
    summary: "Facilitators: Lea Stocker (integrative doctor, Gestalt & sexual therapy training) and Robert Fischer (psychiatrist, psychotherapist; trains body psychotherapists and sex therapists). Explores integrating sexual topics in psychedelic-assisted therapy settings.",
  },
  German: {
    title: "Therapeutische Haltung und Atem-Selbsterfahrung",
    summary: "Facilitators: Helena Aicher, PhD (scientist, psychotherapist specializing in PAT) and Stephanie Buschner, MSc (senior psychologist, PAT specialist). Experiential workshop on therapeutic presence, relational dynamics, and guided breathwork.",
  },
  French: {
    title: "Therapeutic relationship and dynamics of the therapeutic couple in PAT",
    summary: "Facilitators: Catherine Duffour (psychiatrist, PAT trainer since 2021) and Hervé Duffour (40 years’ personal-development and medical-technology experience). Explores modified states of consciousness, therapeutic presence, transference, and co-supervision.",
  },
};

export const WORKSHOP_INTRO = {
  heading: "One afternoon, three parallel tracks",
  body: "Three parallel clinical training tracks in Psychedelic-Assisted Therapy (PAT). No prior experience required.",
};

export const AFTERGLOW = {
  title: "Afterglow — the afterparty",
  paragraphs: [
    "Join us for AFTERGLOW, the SPSN afterparty for the ALPS Conference.",
    "Organized by the Swiss Psychedelic Student Network (SPSN), from <strong>21:30 until 04:00</strong>, <strong>Jugendkulturhaus Flösserplatz (Aareal; Flösserstrasse 7, 5000 Aarau)</strong> will open its doors and will welcome everyone who is ready to glow into music & dance, and create human connections: the ultimate and most integrative conclusion of a conference weekend.",
    "The music journey will guide you through different styles, from melodic techno, to acid/hard techno, and then to psytrance. The event is kindly presented by SPSN.",
  ],
  included: "For conference ticket holders, access to the afterparty is included with no extra fee.",
  external: [
    "Everyone is welcome: tickets for external attendees are available for CHF 20 (students), CHF 35 (general) and CHF 50 (supporter).",
    "Limited spots are available, so please book in advance!",
  ],
  ticketLabel: "Tickets on Eventfrog",
  ticketUrl: "https://eventfrog.ch/en/p/parties/house-techno/afterglow-afterparty-for-the-alps-conference-guestlist-only-7505194045364252288.html",
};

export const FRIDAY_PANEL = {
  title: "The \"Therapy\" in Psychedelic-Assisted Therapy",
  subtitle: "What kind of therapy, how much of it, and delivered by whom",
  body: "Psychedelic-assisted therapy names a psychotherapeutic intervention that no regulator requires. The FDA's July 2026 final guidance asks for two trained monitors, not two psychotherapists, and Swiss law does not make psychotherapy a prerequisite. Yet most trials behind today's evidence included preparation, support and integration. This panel begins in that gap. Four clinicians and researchers who all hold that the psychological work is real turn to what remains unresolved: what kind of therapy, how many hours, delivered by whom, who should be in the room during the experience, and whether any model can scale.",
};

export const SATURDAY_PANEL = {
  title: "Psychedelics and Spirituality: Ontological Shifts and Meaning-Making Experiences",
  body: "Psychedelics reliably occasion experiences that participants describe as revelatory and that leave behind altered convictions about what reality contains, what the self is, and where meaning comes from. Such shifts are reported in ceremonial traditions across the Americas, West Africa and beyond, where they are held within cosmology and community, and in clinical trials, where they are recorded as mystical-type or insight experiences. This panel examines how ontological change is produced, interpreted and made durable across these settings, the difficulty of measuring it, and what is at stake when practices rooted in traditional use are relocated to the clinic.",
};

export type TeamMember = { name: string; role: string; photo: string };

/** Photos live in public/img/booklet/team/<photo>.jpg. */
export const TEAM: { title: string; people: TeamMember[] }[] = [
  {
    title: "Council",
    people: [
      { name: "Cyril Petignat", role: "Chief Technology Officer · Co-Founder", photo: "cyril-petignat" },
      { name: "Federico Seragnoli", role: "Chief Executive Officer · Meta-Coordinator · Co-Founder", photo: "federico-seragnoli" },
      { name: "Philipp Hampel", role: "Chief Operating Officer · Conference Coordinator", photo: "philipp-hampel" },
      { name: "Raphaël Saunier", role: "Chief Information Officer · Conference Coordinator (Experiences)", photo: "raphael-saunier" },
      { name: "Matthias Leitner", role: "Summer School Co-Coordinator", photo: "matthias-leitner" },
      { name: "Noor Charkhi", role: "Finance, Fundraising & Impact", photo: "noor-charkhi" },
      { name: "Michel Huissoud", role: "Governance & Public Affairs", photo: "michel-huissoud" },
    ],
  },
  {
    title: "Team",
    people: [
      { name: "Andrea Bacconi", role: "Summer School Communications", photo: "andrea-bacconi" },
      { name: "Ece Baloglu", role: "Conference Volunteer Coordinator", photo: "ece-baloglu" },
      { name: "Ravikiran Basavaraju", role: "Team Member", photo: "ravikiran-basavaraju" },
      { name: "Bianca Borsarini", role: "Team Member", photo: "bianca-borsarini" },
      { name: "Abigail Calder", role: "Scientific Research Coordinator", photo: "abigail-calder" },
      { name: "Ana Mateea Cerchez", role: "Team Member", photo: "ana-mateea-cerchez" },
      { name: "Julien Pierre Chanel", role: "Fundraising Coordinator", photo: "julien-pierre-chanel" },
      { name: "Mourad Chouaki", role: "Podcast Coordinator", photo: "mourad-chouaki" },
      { name: "Vincent Diehl", role: "Speaker & Workshop Coordinator", photo: "vincent-diehl" },
      { name: "Akram Elrhaoussi", role: "Team Member", photo: "akram-elrhaoussi" },
      { name: "Gerel Jargalsaikhan", role: "Communications Coordinator", photo: "gerel-jargalsaikhan" },
      { name: "Justine Jones", role: "Graphic Design Coordinator", photo: "justine-jones" },
      { name: "Lennert van de Kreeke", role: "Summer School Co-Coordinator", photo: "lennert-van-de-kreeke" },
      { name: "Morten Lietz", role: "PsyCare Coordinator", photo: "morten-lietz" },
      { name: "Lena Meinhold", role: "Graphic Design Team Member", photo: "lena-meinhold" },
      { name: "Marina Millan", role: "Partnership Coordinator", photo: "marina-millan" },
      { name: "Rosa Morcom", role: "Marketing Coordinator", photo: "rosa-morcom" },
      { name: "Jonathan Moy de Vitry", role: "Filmmaker", photo: "jonathan-moy-de-vitry" },
      { name: "Régis Paroz", role: "Conference Designer", photo: "regis-paroz" },
      { name: "Pascal Pompetzki", role: "Research Team Member", photo: "pascal-pompetzki" },
      { name: "Valentin Rieder", role: "SPSN Co-Coordinator", photo: "valentin-rieder" },
      { name: "Andréa Sader", role: "Social Media Coordinator", photo: "andrea-sader" },
      { name: "Sebastian Schnelle", role: "PsyCare Team Member", photo: "sebastian-schnelle" },
      { name: "Paul Springfeld", role: "Team Member", photo: "paul-springfeld" },
      { name: "Gabriella Szasz", role: "Team Member", photo: "gabriella-szasz" },
      { name: "Georgios Tsimploulis", role: "Team Member", photo: "georgios-tsimploulis" },
      { name: "Maria Tudor", role: "Team Member", photo: "maria-tudor" },
      { name: "Fabian Velázquez Macías", role: "Communications Team Member", photo: "fabian-velazquez-macias" },
      { name: "David Wennberg", role: "Scientific Research Team Member, Composer & DJ", photo: "david-wennberg" },
      { name: "Parsa Yousefi", role: "Scientific Research Team Member", photo: "parsa-yousefi" },
    ],
  },
];

/** A team member by name, e.g. the moderator a program item names. */
export function teamMember(name: string | undefined): TeamMember | undefined {
  return TEAM.flatMap((group) => group.people).find((person) => person.name === name);
}

export const ADVISORY_BOARDS: { title: string; people: TeamMember[] }[] = [
  {
    title: "Scientific Advisory Board",
    people: [
      { name: "Dr. Friederike Holze", role: "University Hospital Basel, CH", photo: "friederike-holze" },
      { name: "Dr. Yasmin Schmid", role: "University Hospital Basel, CH", photo: "yasmin-schmid" },
      { name: "Dr. Helena Aicher", role: "University of Zurich, CH", photo: "helena-aicher" },
      { name: "Dr. med. Gabriel Thorens", role: "University Hospital Geneva, CH", photo: "gabriel-thorens" },
      { name: "Prof. Dr. med. Gregor Hasler", role: "University of Fribourg, CH", photo: "gregor-hasler" },
    ],
  },
  {
    title: "Ethical and Policy Advisory Board",
    people: [
      { name: "Dr. med. Peter Oehen", role: "Biberist, CH", photo: "peter-oehen" },
      { name: "Prof. Sandro Cattacin", role: "University of Geneva, CH", photo: "sandro-cattacin" },
    ],
  },
];

export const ALUMNI = [
  "Adam Amrani", "Alekos Nicolaides", "Amanda Magaud", "Anastasia Grigoreva", "Brian Cisse", "Chloé Battisti",
  "Daniel Prado", "Diego Dos Santos", "Frantz Aimé", "Gabrielle Michon", "Giada Finocchio", "Hui Rong",
  "Johanna Blanc", "Johannes Klaus", "Julia-Rose Miguet", "Kristian Beichmann", "Lisa Große", "Luisa Trujillo",
  "Lucca Nietlispach", "Manon Fauvelais", "Marc-Alban Jaussi", "Matilde de Luigi", "Maxime Cornut",
  "Nathalie Nicolet", "Nicole Friedli", "Pablo de Chambrier", "Polina Catzeflis", "Ramon Bachmann", "Ray Yang",
  "Rebecca S. Alder", "Sacha Schwarz", "Valentine Assal", "Zoé Zaraisky",
];

type Logo = { file: string; name: string; /** Visual weight: tall marks are drawn a little smaller. */ h?: number };

/** Logos live in public/img/booklet/logos/<file> (student groups in public/img/booklet/spsn/). */
export const PARTNER_GROUPS: { title: string; logos: Logo[]; boxed?: boolean }[] = [
  {
    title: "Sponsors",
    logos: [
      { file: "csm.webp", name: "Fondation Conscience et Santé Mentale", h: 2.2 },
      // Clear space (half the logo height) is built into the file, so it is drawn taller.
      { file: "aarau.webp", name: "City of Aarau (Stadt Aarau)", h: 3.2 },
    ],
  },
  {
    title: "Partner academic institutions",
    logos: [
      { file: "hug.webp", name: "Hôpitaux Universitaires de Genève" },
      { file: "unifr.webp", name: "Université de Fribourg", h: 1.3 },
      { file: "unige.webp", name: "Université de Genève" },
      { file: "unibas.webp", name: "Universität Basel", h: 1.3 },
      { file: "uzh.webp", name: "Universität Zürich" },
    ],
  },
  {
    title: "Swiss psychedelic professional associations",
    logos: [
      { file: "alaya.webp", name: "Fondazione Alaya" },
      { file: "saept.webp", name: "SÄPT — Schweizerische Ärztegesellschaft für Psycholytische Therapie" },
      { file: "ssmp.webp", name: "Swiss Society of Psychedelic Medicine" },
      { file: "aspt.webp", name: "Psychédéliques en thérapie (ASPT)", h: 1.3 },
      { file: "psychedelos.webp", name: "Association Psychédelos", h: 1.2 },
    ],
  },
  {
    title: "Swiss Psychedelic Student Network",
    logos: [
      { file: "../spsn/spsn.png", name: "Swiss Psychedelic Student Network" },
      { file: "../spsn/napa.png", name: "Neuchâtel Association for Psychedelic Awareness", h: 1.2 },
      { file: "../spsn/pala.png", name: "Psychedelic Association of Lausanne for Awareness", h: 1.2 },
      { file: "../spsn/probe.png", name: "Psychedelic Research Organization of Bern" },
      { file: "../spsn/proz.png", name: "Psychedelic Research Organization of Zurich" },
      { file: "../spsn/proof.png", name: "Psychedelic Research Organization of Fribourg" },
      { file: "../spsn/arp.png", name: "Association pour la Recherche sur les Psychédéliques de l’Université de Genève" },
    ],
  },
  {
    title: "Collaborators",
    logos: [
      { file: "lucys.webp", name: "Lucys Rausch" },
      { file: "fuerteventura.webp", name: "Psychedelic Association Fuerteventura" },
      { file: "psyty.webp", name: "PSYTY — Finnish Association for Psychedelic Research", h: 1.3 },
      { file: "spf.webp", name: "Société Psychédélique Française", h: 1.3 },
      { file: "maps.webp", name: "MAPS — Multidisciplinary Association for Psychedelic Studies", h: 1.2 },
      { file: "polish.webp", name: "Polish Psychedelic Society", h: 1.3 },
      { file: "simepsi.webp", name: "SIMEPSI — Società Italiana Medicina Psichedelica" },
      { file: "nordic.webp", name: "Nordic Psychedelic Science Conference" },
      { file: "psbe.webp", name: "Psychedelic Society Belgium" },
      { file: "eleusis.webp", name: "Eleusis" },
      { file: "psilocybin-sf.webp", name: "Psilocybin San Francisco" },
      { file: "upra.webp", name: "UPRA — Ukrainian Psychedelic Research Association" },
      { file: "oxford.webp", name: "Oxford Psychedelic Society", h: 1.3 },
    ],
  },
  {
    title: "Exhibitors",
    boxed: true,
    logos: [
      { file: "open-foundation.webp", name: "OPEN Foundation" },
      { file: "nachtschatten.webp", name: "Nachtschatten Verlag" },
    ],
  },
];

export const PARTNERS_THANKS = "Our sincere thanks to the sponsors and exhibitors who support this conference.";

export const CREDITS = {
  title: "Postgraduate training credits",
  intro: "Attending the ALPS Conference provides credits for:",
  items: [
    { who: "Psychologists", body: "FSP", credits: "14 credits" },
    { who: "Medical doctors", body: "SGPP", credits: "10 credits" },
  ],
  paragraphs: [
    "Every participant will receive their credits certificate by email after the end of the conference. If you did not receive the email, please get in touch with us at <a href=\"mailto:info@alps.foundation\">info@alps.foundation</a>.",
    "If you are a graduate student, we can also provide an attendance certificate at your request. Please get in touch with us directly at <a href=\"mailto:info@alps.foundation\">info@alps.foundation</a>.",
  ],
  logos: [
    { file: "fsp.webp", name: "FSP — Federation of Swiss Psychologists" },
    { file: "sgpp.webp", name: "PSY & ASd — SGPP / SSPP" },
  ],
};

export const SURVEY = {
  title: "Take part in our conference demographic survey",
  questions: ["Where are you from?", "Why are you here?", "How can we improve?"],
  body: "Fill in this anonymous questionnaire to help us understand who we are (as a community). Thank you for helping us improve our conference!",
  label: "Open the survey",
  url: "https://forms.gle/2x7qh65Jna1PS5Px5",
};

export const PROJECTS = {
  events: {
    title: "Education & events",
    items: [
      { photo: "conference.jpg", title: "ALPS Conference", body: "A two-day international academic event, featuring cutting-edge research, clinical insights, and interdisciplinary talks in psychedelic science." },
      { photo: "summer-school.jpg", title: "ALPS Summer School", body: "A week-long immersive program at Le Camp, Vaumarcus. Participants explore psychedelic science through expert lectures, hands-on workshops, and community experiences, set in nature and open to learners of all levels." },
      { photo: "student-forum.jpg", title: "Swiss Psychedelic Student Forum", body: "Organized with the Swiss Psychedelic Student Network (SPSN), this one-day symposium highlights student-led projects and early-career research." },
    ],
  },
  research: {
    title: "Research projects",
    columns: [
      {
        title: "Completed studies",
        studies: [
          { title: "Psychedelic use in students", body: "Explored motives for and prevalence of psychedelic use among university students, as well as its effects on mindfulness and psychological flexibility." },
          { title: "Set & setting study", body: "Investigated the environmental and psychological factors (“set and setting”) shaping psychedelic experiences. In collaboration with the University of Fribourg." },
        ],
      },
      {
        title: "Ongoing studies",
        studies: [
          { title: "Music & psychedelics", body: "How and why do people use music in psychedelic experiences? This online study explores how music supports psychedelic use for therapeutic and introspective purposes." },
        ],
      },
    ],
  },
  programs: {
    title: "Additional programs",
    groups: [
      { title: "Professional support", items: ["Consulting for researchers, clinicians, and institutions", "Local project and thesis guidance", "Mentorship for students and young professionals"] },
      { title: "Community & media", items: ["Free educational content", "Podcasts (Spotify, Apple)", "YouTube lectures", "Open-access infographics and articles", "Social channels: Instagram, Facebook, X (formerly Twitter)", "Networking: Slack workspace"] },
    ],
  },
};

/** Régis Paroz's poster collection, sold at the ALPS info table. */
export const POSTERS = {
  title: "Support the ALPS Foundation by purchasing a poster",
  subtitle: "Uniquely designed by Régis Paroz",
  collection: "Uncanny World",
  body: "This collection questions the nature and the reality of the strange objects it depicts. These are of course images generated by artificial intelligences, and everything in them is false — but it is likely that these intelligences will in time generate a great deal more than images: knowledge of the most distant worlds, objects with extraordinary powers, beings of a new kind. What is possible and what is not has never been more uncertain, and the excitement — or the unease — is real. What are the limits of these neural networks that tamper with the possible, and how are we to stay sane in a world moving at this speed? A collection of images that provokes, anticipates, turns ironic and perhaps poetic, and that, like psychedelics, seeks to connect us to this decidedly strange world that houses us.",
  formats: [
    { name: "A0", detail: "Each original piece of artwork only exists once. Signed version for CHF 222." },
    { name: "A2", detail: "CHF 35" },
    { name: "Postcards", detail: "CHF 5" },
  ],
  note: "Purchase at the ALPS Info Table. Last year’s collection available.",
  shop: {
    body: "You can find last year’s collection and even more ALPS merchandise in our online shop.",
    label: "Visit the shop",
    url: "https://merch.alps.foundation",
  },
  works: [
    "WIRED",
    "HELLO YOU",
    "MECHANIC FEELINGS",
    "LIFE",
    "HAVE A SEAT",
    "SPACE INSECT",
    "COWORK",
    "OILY SUNSET",
    "INTERFACE",
    "SPLASH",
    "WE WALKED ON THE COSMOS",
    "SHUT DOWN",
    "NEUROCRACY",
    "MICROSCOPIC KISS",
  ],
};

export const MEMBERSHIP = {
  tiers: [
    { name: "Student", price: "60 CHF/year" },
    { name: "General", price: "150 CHF/year" },
    { name: "Professional", price: "250 CHF/year" },
  ],
  membership: [
    "While the ALPS Foundation operates on the intrinsic motivation and volunteer engagement of all its members, donations and financial contributions are decisive for us to be able to continue what we do.",
    "As a member, you support us with an annual membership fee. Your annual contribution helps us fund the three pillars of our projects: Education, Research, and Medical Access Facilitation. All donations go directly towards these projects.",
    "Donations keep the wheels running as we continue working diligently to share the science and development of the psychedelic field.",
    "A subscription to the ALPS membership comes with exclusive benefits, such as access to unique in-person meetings, limited-edition ALPS merch, regular newsletter, and our profound gratitude.",
  ],
  thanks: ["Thank you for your support!", "You help us move forward and strengthen what we do."],
  membershipLink: { label: "Become a member", url: "https://www.alps.foundation/support" },
  donations: [
    "If becoming a member doesn’t fit your wishes for any reason, you can also support us with a one-time donation.",
    "Any donation makes a difference, as ALPS operates on community-based and effective altruism principles.",
    "All ALPS assets are stored at the Alternative Bank Switzerland (ABS) to reduce our environmental impact.",
    "As a socially and environmentally responsible bank, ABS is consistently guided by its ethical principles and does not set out to maximize profits. This commitment is enshrined in the bank’s mission statement and articles of incorporation.",
    "We thank you very much for your generous support. Without you, an organization like ours wouldn’t be able to exist.",
    "To donate via TWINT, card, or bank transfer, follow the instructions at the bottom of the support page.",
  ],
  donationLink: { label: "Donate", url: "https://www.alps.foundation/support/" },
};

export const PALE_BLUE_DOT = [
  "From this distant vantage point, the Earth might not seem of any particular interest. But for us, it's different. Consider again that dot. That's here. That's home. That's us.",
  "On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives.",
  "The Earth is a very small stage in a vast cosmic arena. Our posturings, our imagined self-importance, the delusion that we have some privileged position in the Universe, are challenged by this point of pale light.",
  "To me, it underscores our responsibility to deal more kindly with one another, and to preserve and cherish the pale blue dot, the only home we've ever known.",
];
