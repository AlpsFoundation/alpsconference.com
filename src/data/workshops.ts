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
    language: "Italian",
    flag: "🇮🇹",
    presenters: "Dr Claudia Ariemma and Simona Porta",
    places: 12,
    title: "Beyond the Symptom: PAT and the Treatment of Eating Disorders in Ticino",
    abstract: [
      "We will present the structure, case history, and working methods of the only Ticino Center for the treatment of eating disorders. We will explore the reasons behind the decision to apply PAT to patients with eating disorders, present clinical cases for discussion, and show the results obtained since December 2024.",
      "Throughout the session, experiential exercises will invite participants to reflect on and embody the themes emerging from the group work. We will outline future projects, particularly the launch of a Certificate of Advanced Studies in Psychedelic-Assisted Therapy at SUPSI, the first Italian-language CAS on this clinical practice, and a SUPSI research project based on the clinical cases treated.",
    ],
    speakers: [
      {
        name: "Claudia Ariemma",
        image: "claudia-ariemma.jpg",
        bio: "Claudia Ariemma is a psychiatrist and Jungian analytical psychotherapist. She holds a certification of professional training in eating disorders and obesity. She has worked for the Ticino public psychiatry department in the cantonal socio-psychiatric organization since 2005 and has been the medical manager of the center for the treatment of eating and nutrition disorders since 2016. In 2024, she trained with part of her multidisciplinary team in Psychedelic-Assisted Therapy, which she has practiced since October 2024.",
      },
      {
        name: "Simona Porta",
        image: "simona-porta.jpg",
        bio: "Simona Porta is a psychologist and psychotherapist with over twenty years of clinical experience in eating disorders and complex psychological distress. She is currently developing a Psychedelic-Assisted Therapy protocol with LSD within a multidisciplinary team at OSC Mendrisio, Switzerland, and is certified in EMDR and mindfulness-based approaches.",
      },
    ],
  },
  {
    language: "French",
    flag: "🇫🇷",
    presenters: "Catherine Duffour and Hervé Duffour",
    places: 12,
    title: "Therapeutic relationship and dynamics of the therapeutic couple in Psychedelic-Assisted Psychotherapy (PAP)",
    abstract: [
      "This workshop offers a clinical, experiential, and systemic exploration of modified states of consciousness within the context of psychedelic-assisted psychotherapy and non-pharmacological approaches such as meditation, hypnosis, and music.",
      "The workshop will also aim to help participants experience, in a supportive and safe manner, certain psychological and relational mechanisms activated in modified states of consciousness.",
    ],
    bullets: [
      "The quality of therapeutic presence",
      "Relational safety",
      "Transference dynamics in modified states of consciousness",
      "The role of setting and set and setting",
      "The modelling function of co-therapists",
      "The specificities of co-supervision by a male/female pair living as a couple",
    ],
    sharedImage: {
      src: "catherine-herve-duffour.jpg",
      alt: "Catherine Duffour and Hervé Duffour",
    },
    speakers: [
      {
        name: "Catherine Duffour",
        bio: 'Originally from South Korea and having grown up in Switzerland, Catherine Duffour is a psychiatrist, systemic therapist, and hypnotherapist. Founder of CXIO and co-founder of the Swiss Society for Psychedelic Medicine, she has been training psychiatrists in PAP since 2021 and published "Ketamine Consciousness Therapy" in 2025.',
      },
      {
        name: "Hervé Duffour",
        bio: "With 40 years' experience in personal development and medical technology, Hervé Duffour combines technical training at EPFL with business studies at HEC Lausanne. Since 2018, he has focused on personal support, therapeutic volunteering, and coaching in medical practices, adopting a holistic approach inspired by systems theory.",
      },
    ],
  },
];
