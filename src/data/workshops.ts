/** Shared workshop-day content used by the workshops page. */

export type WorkshopSpeaker = {
  name: string;
  bio: string;
  image?: string;
  photoCredit?: string;
};

export type WorkshopTrack = {
  language: string;
  flag: string;
  presenters: string;
  title: string;
  places: number;
  abstract: string[];
  bullets?: string[];
  sharedImage?: {
    src: string;
    alt: string;
  };
  speakers: WorkshopSpeaker[];
};

/** Shared facts about the pre-conference Workshop Day, reused by the conference program. */
export const WORKSHOP_DAY = {
  day: "Thursday",
  date: "8 October",
  dateTime: "2026-10-08",
  time: "13:00–17:00",
  ticketUrl: "https://infomaniak.events/fr-ch/shop/alps-conference-2026-RQNBE4WPQY/event/1629286/",
} as const;

/**
 * Workshop + Conference bundle: a Workshop Day seat plus the two-day conference ticket.
 * Infomaniak sells it as one pass per track, because a pass hands the buyer every ticket linked to it.
 * Limited number; each pass draws on its track's real seats.
 */
export const WORKSHOP_BUNDLE = {
  price: "CHF 699",
  separately: "CHF 799",
  tracks: [
    { language: "English", url: "https://infomaniak.events/en-ch/shop/alps-conference-2026-RQNBE4WPQY/abo/5905174" },
    { language: "German", url: "https://infomaniak.events/en-ch/shop/alps-conference-2026-RQNBE4WPQY/abo/5905160" },
    { language: "French", url: "https://infomaniak.events/en-ch/shop/alps-conference-2026-RQNBE4WPQY/abo/5905176" },
  ],
} as const;

export const WORKSHOP_TRACKS: WorkshopTrack[] = [
  {
    language: "English",
    flag: "🇬🇧",
    presenters: "Lea Stocker and Robert Fischer",
    places: 18,
    title: "Let's talk about sex (in PAT) - how to integrate a vulnerable subject in a vulnerable setting",
    abstract: [
      "Sexuality is widely still a taboo subject in therapy, and probably in PAT even more so, given the vulnerable setting. We will introduce a basic literacy to therapeutic approaches of sexual topics in general and in connection with PAT.",
      "The workshop will offer theoretical background and experiential structures. The main goal is to foster therapists' security as they navigate sexual topics in PAT and other settings.",
    ],
    speakers: [
      {
        name: "Lea Stocker",
        image: "lea-stocker.jpg",
        photoCredit: "© Mayk Wendt",
        bio: "Lea works as an integral doctor in her own practice. She specialized in general internal medicine and in psychiatry and psychotherapy. Her therapeutic background comprises Gestalt, catathymic imaginative, behavioural, and mindfulness-based methods alongside training in relational sexual therapy with IBP.",
      },
      {
        name: "Robert Fischer",
        image: "robert-fischer.jpg",
        bio: "Robert, who originally trained as a doctor and specialises in psychiatry and psychotherapy, works primarily with individuals, couples, and groups using psychotherapeutic approaches. In addition, he trains body psychotherapists and sex therapists.",
      },
    ],
  },
  {
    language: "German",
    flag: "🇩🇪",
    presenters: "Helena Aicher und Stephanie Buschner",
    places: 18,
    title: "Therapeutische Haltung und Atem-Selbsterfahrung - Erfahrungsorientierter Workshop zu relevanten Aspekten der PAT",
    abstract: [
      "Dieser Pre-Conference Workshop lädt dazu ein, ausgewählte Aspekte der Psychedelika-assistierten Therapie in einem erfahrungsorientierten Rahmen kennenzulernen. Kurze theoretische Inputs werden mit praktischen Übungen, gemeinsamer Reflexion und Austausch verbunden.",
      "Teil des Workshops ist eine angeleitete Breathwork-Sequenz im Rundatemstil, die einen geschützten Raum für persönliche Selbsterfahrung schafft. Darüber hinaus widmen wir uns zentralen Aspekten therapeutischer Haltung und Beziehungsgestaltung - darunter Präsenz, ein bewusster Umgang mit Nähe und Distanz sowie eine offene und wertschätzende Haltung.",
      "Der Workshop richtet sich an Therapeut:innen und Fachpersonen aus psychosozialen Arbeits- und Studienfeldern, die Interesse an Psychedelika-assistierter Therapie und erfahrungsorientierten Zugängen haben. Vorkenntnisse sind nicht erforderlich.",
    ],
    speakers: [
      {
        name: "Helena Aicher",
        image: "helena-aicher.jpg",
        bio: "Helena Aicher, PhD, ist Wissenschaftlerin an den Universitäten Zürich und Basel sowie Psychotherapeutin mit einem Schwerpunkt in PAT. Sie ist in der Weiterbildung im Bereich der psychedelischen Forschung und Therapie tätig sowie beratend für verschiedene Institutionen und Organisationen auf diesem Gebiet.",
      },
      {
        name: "Stephanie Buschner",
        image: "stephanie-buschner.jpg",
        bio: "Stephanie Buschner, MSc., ist Oberpsychologin an der Psychiatrischen Universitätsklinik Zürich im Zentrum für Abhängigkeitserkrankungen und arbeitet zudem als Psychotherapeutin mit Schwerpunkt auf PAT in eigener Praxis. Darüber hinaus konzipiert und begleitet sie Weiterbildungsformate im Bereich PAT und setzt sich vertieft mit Fragen therapeutischer Haltung im Spannungsfeld von PAT und Psychotherapie auseinander.",
      },
    ],
  },
  {
    language: "French",
    flag: "🇫🇷",
    presenters: "Catherine Duffour et Hervé Duffour",
    places: 12,
    title: "Relation thérapeutique et dynamique du couple thérapeutique en psychothérapie assistée par psychédéliques (PAP)",
    abstract: [
      "Cet atelier propose une exploration clinique, expérientielle et systémique des états modifiés de conscience dans le cadre de la psychothérapie assistée par psychédéliques et d'approches non pharmacologiques telles que la méditation, l'hypnose et la musique.",
      "L'atelier vise également à permettre aux participant·e·s d'expérimenter, de manière soutenante et sécurisée, certains mécanismes psychologiques et relationnels activés dans les états modifiés de conscience.",
    ],
    bullets: [
      "La qualité de la présence thérapeutique",
      "La sécurité relationnelle",
      "Les dynamiques transférentielles dans les états modifiés de conscience",
      "Le rôle du cadre et du set and setting",
      "La fonction de modélisation des co-thérapeutes",
      "Les spécificités de la co-supervision par un binôme homme/femme vivant en couple",
    ],
    sharedImage: {
      src: "catherine-herve-duffour.jpg",
      alt: "Catherine Duffour et Hervé Duffour",
    },
    speakers: [
      {
        name: "Catherine Duffour",
        bio: "Originaire de Corée du Sud et ayant grandi en Suisse, Catherine Duffour est psychiatre, thérapeute systémique et hypnothérapeute. Fondatrice de CXIO et cofondatrice de la Société suisse de médecine psychédélique, elle forme des psychiatres à la PAP depuis 2021 et a publié « Ketamine Consciousness Therapy » en 2025.",
      },
      {
        name: "Hervé Duffour",
        bio: "Fort de 40 ans d'expérience dans le développement personnel et les technologies médicales, Hervé Duffour allie une formation technique à l'EPFL à des études de gestion à HEC Lausanne. Depuis 2018, il se consacre à l'accompagnement personnel, au bénévolat thérapeutique et au coaching en cabinet médical, avec une approche holistique inspirée de la théorie des systèmes.",
      },
    ],
  },
];
