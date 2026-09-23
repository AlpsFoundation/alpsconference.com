/** Experience artist and facilitator profiles, shared by the site and the print booklet. */

export type ExperienceSession = {
  title: string;
  description: string;
};

export type ExperienceLinks = {
  website?: string;
  instagram?: string;
};

export type ExperienceArtist = {
  name: string;
  image?: string;
  imagePosition?: string;
  sessions?: ExperienceSession[];
  bio?: string;
  links?: ExperienceLinks;
};

export type ExperiencePerson = {
  name: string;
  role: string;
  /** Card headline when it should name the artists rather than the card itself. */
  cardTitle?: string;
  /** Show every photo side by side instead of one large photo with thumbnails. */
  photoLayout?: "grid";
  context?: string;
  eyebrow?: string;
  image?: string;
  imagePosition?: string;
  gallery?: string[];
  sessions?: ExperienceSession[];
  bio?: string;
  links?: ExperienceLinks;
  /** Other names (individual artists behind a shared card) that also open this modal. */
  aliases?: string[];
  /** Individual profiles shown inside a shared card's modal, each with their own photo. */
  artists?: ExperienceArtist[];
};

export type ExperienceCategory = {
  id: "art" | "sound" | "more";
  title: string;
  summary: string;
  people: ExperiencePerson[];
};

export const EXPERIENCES: ExperienceCategory[] = [
  {
    id: "art",
    title: "Art",
    summary: "LSD blotter art, live painting, and Uncanny World, throughout both days.",
    people: [
      {
        name: "Kevin Barron",
        role: "LSD blotter art",
        context: "Artist",
        image: "kevin-barron.jpg",
        imagePosition: "50% 12%",
        sessions: [
          {
            title: "LSD blotter exhibition",
            description:
              "At ALPS he will exhibit a selection of blotter pieces. Come look closely. The whole point is the micro/macro jump: a minute image on a scrap of paper, and the journey it implies.",
          },
        ],
        bio: "British blotter artist Kevin Barron has been making psychedelic images for nearly six decades. After art school in the late 1960s he stepped sideways into music (Cat Stevens, a Rolling Stones tour) and then back into the tiny square of paper that he still treats as the highest form of psychedelic art: a picture you can look at, and that can also take you somewhere.\n\nHis 1990s “Shield” blotter, co-signed by Albert Hofmann and Timothy Leary, is the piece collectors call the holy grail of blotter art. Originals of his work are scarce; he has shown in London, Paris, Ibiza and the US. His book BLOTTO: Adventures and Misadventures in Psychedelia came out in 2024.",
        links: {
          website: "https://kbarron.co.uk",
          instagram: "eleusisblotter",
        },
      },
      {
        name: "Art Corner",
        role: "Art Corner",
        cardTitle: "Hana Stanke & Joanne Lackey",
        eyebrow: "Exhibition & live painting",
        aliases: ["Joanne Lackey", "Hana Stanke"],
        artists: [
          {
            name: "Hana Stanke",
            image: "hannah-stanke.jpg",
            imagePosition: "42% 28%",
            sessions: [
              {
                title: "Live painting",
                description:
                  "Hannah will exhibit work in the Foyer Art Corner, with pieces available for purchase. She will live-paint both days; finished works may be purchased by visitors.",
              },
            ],
            bio: "Hana Stanke is a visual artist who expresses her inner world and philosophy through paint. Her art is inspired by her inner cosmos and the human experience. She likes to visually express her emotions and inner world with elements she connects to such as botany, airy and moving elements like clouds and energies, micro and natural patterns.",
            links: {
              instagram: "chuvatti",
            },
          },
          {
            name: "Joanne Lackey",
            image: "joanne-lackey.jpg",
            imagePosition: "50% 6%",
            sessions: [
              {
                title: "Exhibition & live painting",
                description:
                  "Joanne Lackey will exhibit a selection of her work in the Foyer Art Corner and may also be live-painting during the event.",
              },
            ],
            bio: "Joanne Lackey is a multidisciplinary visual artist working across painting, drawing, digital art and sculpture. Flowing freely between acrylics, watercolour, gouache, pastels and other mediums, she lets each material become a different way of expressing an idea, feeling or experience.\n\nHer work is inspired by nature, movement, geometry, energy and the shifting nature of perception. Psychedelic experiences, self-discovery and the exploration of consciousness also influence her visual language, creating colourful and multilayered worlds where the seen and unseen meet.",
            links: {
              instagram: "joltherixo_art",
            },
          },
        ],
      },
      {
        name: "Régis Paroz",
        role: "Uncanny World",
        context: "Artist · Switzerland",
        image: "regis-paroz.jpg",
        imagePosition: "54% 16%",
        sessions: [
          {
            title: "Uncanny World",
            description:
              "This collection questions the nature and the reality of the strange objects it depicts. These are of course images generated by artificial intelligences, and everything in them is false — but it is likely that these intelligences will in time generate a great deal more than images: knowledge of the most distant worlds, objects with extraordinary powers, beings of a new kind. What is possible and what is not has never been more uncertain, and the excitement — or the unease — is real. What are the limits of these neural networks that tamper with the possible, and how are we to stay sane in a world moving at this speed? A collection of images that provokes, anticipates, turns ironic and perhaps poetic, and that, like psychedelics, seeks to connect us to this decidedly strange world that houses us.",
          },
        ],
        bio: "Régis Paroz is a Swiss artist from the Lavaux region near Lausanne. Trained as an architect, he later became an entrepreneur working with CNC machines and now teaches 3D polydesign and decoration. His practice draws on a longstanding interest in psychology, mythology, spirituality, and psychedelics. Inspired by visionary architecture, 1960s psychedelia, art brut, and comics, he explores how art reveals the psyche, its archetypes, and the ways imagination shapes our understanding of reality.",
      },
    ],
  },
  {
    id: "sound",
    title: "Meditation",
    summary: "Sound meditations, breathwork, and music.",
    people: [
      {
        name: "Marina Vovk",
        role: "Sound meditations",
        eyebrow: "Sound Meditations",
        context: "Sound healer · Switzerland",
        image: "marina-vovk.jpg",
        imagePosition: "50% 22%",
        gallery: [
          "marina-vovk-2.jpg",
          "marina-vovk-3.jpg",
          "marina-vovk-4.jpg",
          "marina-vovk-6.jpg",
          "marina-vovk-7.jpg",
        ],
        sessions: [
          {
            title: "Sound meditation",
            description:
              "During the conference, her sound-healing session offers an opportunity to pause, release accumulated tension, and give the mind and body space to process and integrate the information and experiences of the day. By creating a moment of rest between talks, discussions, and other activities, the session can help participants restore their attention, regulate their pace, and return to the conference with greater clarity and openness.\n\nHer approach is intuitive yet grounded: she listens closely to the group and adapts each session to the people and space in the room. Rather than directing a particular experience, she creates a supportive environment where participants can rest, reconnect with themselves, and allow their own experience to unfold.\n\nFor the conference, Marina will offer an immersive sound-healing session designed as a space for relaxation, embodiment, integration, and renewed presence.",
          },
        ],
        bio: "Marina Vovk is a Ukrainian sound healer and gong practitioner, psychologist and psyche-aroma diagnostician. She is also a certified yoga instructor, meditation guide, and Reiki and Qigong practitioner, with over sixteen years of dedicated practice.\n\nBased in Switzerland since 2022, Marina works at the intersection of sound, psychology, embodiment, contemplative practices, and psychedelic-assisted approaches. She is trained in MAPS Psychedelic-Assisted Therapy for PTSD and supports MAPS educational programs internationally, including in Ukraine, Poland and Switzerland.\n\nThrough immersive sound journeys with gongs, singing bowls, and other acoustic instruments, Marina creates spaces for deep relaxation, grounding, and reconnection with the body. Her work invites participants to slow down, shift their attention from the intellectual to the embodied, and reconnect with a sense of presence.",
        links: {
          instagram: "marevovk",
        },
      },
      {
        name: "David & Anna-Lea Wennberg",
        role: "Live Concert",
        context: "Musicians",
        sessions: [
          {
            title: "Live Concert",
            description:
              "David & Anna-Lea Wennberg will perform a live concert accompanying your lunch break on Saturday. Their music blends original compositions with spontaneous improvisation, allowing each piece to unfold naturally in the moment.\n\nCombining the warm, meditative sounds of the handpan with piano, cajón and voice, they create rich and immersive soundscapes, ranging from atmospheric ambient music to more rhythmically driven sounds. Join them on a musical journey and let yourself be carried by the sound.",
          },
        ],
        image: "david-anna-lea-wennberg-2.jpg",
        imagePosition: "50% 30%",
        gallery: ["david-anna-lea-wennberg.jpg"],
        photoLayout: "grid",
      },
      {
        name: "Pascal Kälin",
        role: "Breathwork",
        context: "Switzerland",
        image: "pascal-kalin.jpg",
        imagePosition: "50% 24%",
        sessions: [
          {
            title: "Breathwork Journey",
            description:
              "Pascal offers you a guided breathwork journey as a space to slow down, reconnect with your body and turn inward.\n\nThrough conscious connected breathing, you are invited to meet what is present within you – physically, emotionally and mentally. The breath can open a space for release, clarity, inner connection and a deeper sense of presence.\n\nThe session is an invitation to step out of your mind for a moment, listen to your body and allow the breath to guide the way inward.",
          },
        ],
        bio: "Pascal Kälin is a Swiss breathwork facilitator and founder of Secrets of Alchemy. His work is centered around the breath, body awareness, inner processes and a deeper connection to oneself.\n\nAt the heart of his work is a simple idea: the breath is already within us. Rather than giving people something from the outside, his work invites them to explore what may already be waiting to be discovered.",
      },
    ],
  },
  {
    id: "more",
    title: "…and more",
    summary: "Connection, storytelling, movement, and the Saturday afterparty.",
    people: [
      {
        name: "Kate Dalby",
        role: "Speed-friending & storytelling",
        context: "Psychedelic Society UK",
        image: "kate-dalby.jpg",
        imagePosition: "50% 22%",
        sessions: [
          {
            title: "Speed-friending",
            description:
              "Drop the small talk. Kate runs a menu of questions inspired by the 36 Questions to Intimacy and The School of Life’s 100 Questions — some gentle, some spicy — then walks you through short icebreakers and a series of 7–10 minute one-to-ones with different people. It is not networking. You leave with a few real conversations and, if you’re lucky, the start of something.",
          },
          {
            title: "Psychedelic storytelling",
            description:
              "End the first conference day with an evening of authentic connection and community. After a full day of talks, Kate holds an open-mic storytelling circle — a space to integrate through the simple, powerful act of sharing. Sign up on the night. Five minutes. No rehearsal. Share something from the journey: the weird, the tricky, or the wonderful. There is no need to prepare; the best stories are often told off the cuff and from the heart. Come share, listen, and connect.",
          },
        ],
        bio: "Kate Dalby (she/her) is a creative neuroscientist exploring how spaces and sensory environments shape our inner world. Her background spans clinical sleep studies, altered states of consciousness, and personalised gene therapies. Now her primary works is at Neuroaesthetics studio and lab, Kinda Studios. While her ongoing work with Onaya Science explores how ritual, music, and plant medicines support trauma recovery — a curiosity that flows into her wider passion for gathering people in community through The Psychedelic Society.",
      },
      {
        name: "Andrea Bacconi",
        role: "Yoga",
        context: "Somatic Coach",
        image: "andrea-bacconi.jpg",
        sessions: [
          {
            title: "Yoga and embodiment",
            description:
              "During the conference, her yoga session offers a chance to step out of sitting and thinking and come back into the body. Through slow movement and gentle stretching, participants can let go of the stiffness and stress, give the nervous system time to settle, and return to the programme at a calmer pace.\n\nHer approach is slow and unhurried, with more attention on how a movement feels than on how it looks. No previous experience is needed, and nothing in the practice is demanding. She guides participants towards their own sensations, so they can notice what it is like to be fully present in their body while they move, and follow what they need on the day.\n\nFor the conference, Andrea will offer a quiet session of gentle movement, breath, and embodiment, designed as a space to release tension, regulate, and arrive back in the body.",
          },
        ],
        bio: "Andrea is a yoga teacher and somatic coach. She works with people who want to reconnect with their bodies and learn to listen to what the body already knows. She is a certified InnerLifeSkills master coach and trained as a somatic educator with the Somatic Institute for Women. Alongside her one-to-one practice she runs embodiment workshops and women's circles, with a growing focus on guiding women to reclaim sovereignty over their own bodies.",
      },
    ],
  },
];
