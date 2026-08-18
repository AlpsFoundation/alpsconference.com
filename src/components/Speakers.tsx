import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";

type Speaker = {
  name: string;
  title: string;
  institution: string;
  role: string;
  talkTitle?: string;
  abstract?: string;
  bio?: string;
  image?: string;
  tbd?: false;
};

type TbdSpeaker = {
  tbd: true;
};

type SpeakerEntry = Speaker | TbdSpeaker;

const SPEAKERS: SpeakerEntry[] = [
  {
    name: "Dr. Max Wolff",
    title: "Dr.",
    institution: "Humboldt University of Berlin, Germany",
    role: "Clinician-Scientist",
    image: "max-wolff.jpg",
    talkTitle: "The Case for Considering Psychedelics as Psychotherapeutic Tools",
    abstract:
      "Current regulatory frameworks struggle to accommodate the combination of pharmacological and psychotherapeutic elements that characterize psychedelic therapy. As regulatory decisions approach, it remains uncertain whether regulators will accept the claim that “psychological support” (i.e. psychotherapy) constitutes a mere safety measure while treatment efficacy is attributed to the drug alone. This talk argues against the sidelining of psychotherapy in psychedelic treatment, and proposes that a more appropriate framework may be to evaluate psychedelic drugs as psychotherapeutic tools, rather than as treatments in their own right.\n\nTo support this reframing, I argue that the efficacy of psychedelic therapies is substantially mediated by the same general change mechanisms that underlie all effective psychotherapies, including resource activation, problem actuation, clarification, mastery, and therapeutic relationship. To clarify the role of psychedelic drugs as potent catalysts of these psychotherapeutic processes, I present findings from the EPIsoDE trial showing psilocybin disrupts otherwise stable dispositions toward experiential avoidance and induces acceptance-promoting learning processes that mediate sustained reductions in depression severity. Based on these and related findings, I argue that the proposed distinction between \"psychological support\" and psychotherapy cannot be sustained on mechanistic grounds, as the systematic cultivation of non-avoidant experiential engagement is inseparably central to both safety and efficacy.\n\nDrawing a parallel with anesthetic drugs, I outline what a tool-focused regulatory approach might look like and why it merits serious consideration regardless of the outcome of current approval efforts.",
    bio: "Max Wolff is a psychologist, psychotherapist and clinician-scientist at Humboldt-Universität zu Berlin, Germany. His research bridges psychedelic and psychotherapy research and explores psychological change processes associated with altered states of consciousness. He has contributed as a researcher and therapist to several clinical trials in the field and is committed to advancing professional training programs such as the MIND Foundation's Augmented Psychotherapy Training (APT), which he directed until 2025, and the OPEN Foundation's Advanced Education in Psychedelic Therapy (ADEPT) whose self-experience curriculum he supports.",
  },
  {
    name: "Dr. Lydia Belinger",
    title: "Dr. phil.",
    institution: "University of Zurich, Switzerland",
    role: "Postdoc",
    image: "lydia-belinger.jpg",
    talkTitle: "Serotonin System Stimulation and Social Cognition: Differential Effects of Psilocybin, MDMA, and Methylphenidate",
    abstract:
      "Changes in social cognition are discussed as a potential mechanism of action underlying the therapeutic effects of psychedelics and MDMA, which is particularly relevant given the central role of impaired social functioning in various psychiatric disorders. Both psilocybin and MDMA have shown to acutely influence social perception and behavior, with the serotonin (5-hydroxytryptamine, 5-HT) system playing an important role in these effects. However, little is known about whether such changes persist beyond the acute phase or how they differ across pharmacological compounds. This talk will present findings from a comparative study investigating the sustained effects of psilocybin and MDMA in comparison with the non-serotonergic active control compound methylphenidate across multiple domains of social cognition, highlighting differential, time-dependent effects across substances and social cognitive processes.",
    bio: "Lydia Belinger studied psychology with a focus on neuropsychology and neuroscience at the University of Zurich, Switzerland. During her PhD and subsequent postdoctoral research, she investigates the sustained effects of psychedelics and MDMA on prosocial behavior. She is affiliated with the research groups Addictive Disorders (PD Dr. M. Herdener) and Pharmaco-Neuroimaging and Cognitive-Emotional Processing (PD Dr. K. Preller) at the Department of Adult Psychiatry and Psychotherapy, University Hospital of Psychiatry Zurich and the University of Zurich.",
  },
  {
    name: "Tommaso Barba",
    title: "",
    institution: "Imperial College London, UK",
    role: "PhD Candidate",
    image: "Tommaso-Barba.jpg",
    talkTitle: "EEG correlates of self-dissolution induced by intranasal 5-MeO-DMT",
    abstract:
      "Background\n\n5-MeO-DMT (5MeO) is a short-acting psychedelic compound reported to induce profound alterations in consciousness by disrupting the experience of self, time and space, at times leading to experiences akin to 'pure awareness'. However, there are no controlled human neuroimaging studies characterizing its effects on brain dynamics, and relationship to consciousness.\n\nHypotheses\n\nWe hypothesized that 5-MeO-DMT would induce marked reductions in the power of alpha/beta brain oscillations, and increases in delta power and neural entropy. Importantly we hypothesised reductions in alpha power and increases in neural entropy to correlate with self-dissolution. We also explored the effects of 5MeO on post-acute psychological outcomes.\n\nMethods\n\nThirty-six healthy volunteers completed a controlled within-subject study, receiving placebo and 12mg intranasal 5MeO on separate visits. High-density (hd) EEG and real-time ratings of self-dissolution were collected. We assessed changes in oscillatory power (also controlling for 1/f confounds), and neural entropy (determined with Lempel-Ziv complexity) relative to baseline for each session. Cluster-based permutation tests were used for 5MeO v placebo contrasts, and time-resolved correlations linked neural measures to subjective ratings. Source localisation mapped the spatial distribution of effects. Linear mixed models assessed pre-post psychological changes following 5-MeO-DMT.\n\nFindings\n\nAt peak effects (8–14 minutes post-administration), 5MeO increased delta/gamma power (both p<0.0001) and reduced theta, alpha, and beta power (all p<0.001) when compared to placebo. Neural entropy was also significantly increased (p<0.0001). Time-resolved correlations showed significant correlations between scores of (narrative and bodily) self-dissolution and void experiences and higher delta/gamma, and lower theta/alpha/beta power (all p<0.001). Follow-up measures indicated significantly reduced anxiety and increased connectedness.\n\nConclusions\n\nThis study provides the first controlled neural evidence of 5-MeO-DMT in humans, linking real-time experiences of self-dissolution with neural signatures and supporting models of psychedelics as transient disruptors of self-related neural processes. These findings pave the way for further research into the use of 5MeO to enhance the understanding of the sense of self and consciousness.",
    bio: "Tommaso Barba is a PhD researcher at the Centre for Psychedelic Research, Imperial College London, where his work focuses on the neuroscience and therapeutic potential of psychedelic compounds. His research investigates the effects of substances such as DMT and 5-MeO-DMT on brain function, consciousness, mental health, and interpersonal processes, with a particular interest in mechanisms underlying well-being and transformative experiences. He has contributed to research published in leading scientific journals including Nature Medicine and The Lancet. Alongside his academic work, he is involved in science communication and public engagement around mental health, neuroscience, and emerging psychiatric treatments.",
  },
  {
    name: "Dr. Matthias Forstmann",
    title: "Dr.",
    institution: "University of Zurich, Switzerland",
    role: "Senior Associate",
    image: "Matthias_Forster.JPG",
    talkTitle: "The Mushroom Experience Project: Contextual Predictors and Species-Level Variation in the Subjective Effects of Psilocybin Mushrooms",
    abstract:
      "Psilocybin mushrooms are increasingly used for recreation, self-exploration, and therapeutic ends, yet we know little about what actually shapes the subjective experience—or whether different mushroom species produce distinct effects at all. Drawing on a large online survey of experienced users (949 reports from 523 participants across multiple species), this work brings together two complementary analyses. The first asks what predicts the character of an experience: using multilevel models over nine empirically derived dimensions of subjective effect, we examine how dose, intention, preparation, setting, and consumption method shape outcomes, and identify recurring experience types through latent profile analysis. The second asks whether species matter: we compare effect profiles across eleven species and test whether genetically closer mushrooms produce more similar experiences. Together, our findings clarify which factors users can actually influence, which are fixed by biology, and what this means for harm reduction and therapeutic practice.",
    bio: "Dr. Matthias Forstmann is a senior research and teaching associate in the Department of Psychology at the University of Zurich. He earned his PhD in psychology from the University of Cologne and completed a post-doctoral fellowship at Yale University. Dr. Forstmann's research focuses on social cognition, lay theories, and the psychological effects of classic psychedelics. He has authored multiple peer-reviewed publications exploring how psychedelic experiences influence nature connectedness, social well-being, and personal transformation. His work aims to understand the cognitive and environmental factors that shape these subjective states and their downstream behavioral outcomes.",
  },
  {
    name: "Prof. Dr. Eric Vermetten",
    title: "MD, PhD",
    institution: "Leiden University Medical Center, Netherlands",
    role: "Professor, Founder Trauma Innovations Network",
    image: "eric-vermetten.jpg",
    talkTitle: "What Psychedelics Teach Us About Trauma",
    abstract:
      "Trauma psychiatry has traditionally conceptualized recovery as the reduction of symptoms through evidence-based psychotherapy and pharmacological treatment. Yet many patients describe recovery as a profound transformation in how they relate to themselves, their memories, and others. This presentation explores what psychedelics and entactogens may teach us about trauma, healing, and recovery. Beginning with Jan Bastiaans' pioneering work with LSD in survivors of the Second World War, the lecture traces the evolution toward contemporary research on MDMA-assisted psychotherapy and emerging psilocybin studies for PTSD. Across these developments lies a common question: can altered states of consciousness facilitate therapeutic change that conventional approaches only partially achieve? Rather than functioning solely as pharmacological agents, these compounds may facilitate transformative therapeutic processes that foster trust, meaning-making, reconnection, and what may be understood as a reorganization of consciousness. The lessons emerging from these treatments invite us to reconsider recovery not merely as symptom reduction, but as the restoration of trust and the emergence of new ways of relating to oneself, others, and the world.",
    bio: "Prof. Eric Vermetten, MD, PhD is Professor of Psychiatry at Leiden University Medical Center and Adjunct Professor of Psychiatry at New York University. A clinical psychiatrist, retired Colonel of the Dutch Armed Forces, and founder of the Trauma Innovations Network, he has over 30 years of experience in trauma, PTSD, resilience, and military mental health. He was Principal Investigator of the first open-label MDMA-assisted psychotherapy trial in Europe and currently leads the first open-label psilocybin trial for PTSD in the Netherlands. His work explores the ecology of trauma and how movement, language, hypnosis, and psychedelics facilitate the reorganization of consciousness.",
  },
  {
    name: "Eirini Ketzitzidou Argyri",
    title: "Dr.",
    institution: "University of Exeter, UK",
    role: "Research Associate",
    image: "Eirini_Argyri.jpg",
    talkTitle: "Ontological Disruptions and Diversification: Learning from psychedelics",
    abstract: "To be announced",
    bio: "Eirini is a researcher and educator working at the intersection of psychedelic studies, transformative learning, and integration support. Her work examines how experiences that challenge ordinary assumptions about self, reality, and meaning can lead to transformation and how associated distress can be better understood, supported, and mitigated when it emerges.\n\nAlongside her research, Eirini delivers training and offers consultancy on the phenomenology of challenging experiences and integration support, and volunteers with PsyCare UK. She is committed to raising awareness of the complexity of psychedelic experiences and the plurality of their possible outcomes.",
  },
  {
    name: "Dr. Sandeep Nayak",
    title: "MD",
    institution: "Johns Hopkins Center for Psychedelic and Consciousness Research, USA",
    role: "Assistant Professor, Medical Director",
    image: "Sandeep_Nayak.jpg",
    talkTitle: "From Data to Dosing Room: Optimizing Psilocybin Therapy for Clinical Practice",
    abstract:
      "As classic psychedelics move toward regulatory approval, a number of practical gaps remain in translating rigorous research protocols into the flexibilities required by clinical practice. This talk synthesizes several strands of Hopkins-based data spanning hundreds of dosing sessions to outline ways of optimizing clinical practice and ongoing research directions.\n\nSubjective effects are arguably the most important determinant of therapeutic  effects, yet these vary highly between patients, and many are effectively underdosed under current protocols. We present data demonstrating how in-session data can inform data-driven re-dosing decisions in real time.\n\nSecond, converging evidence suggests that serotonin reuptake inhibitors (SRIs) attenuate psychedelic effects, which has led most trials to require tapering prior to dosing. Hopkins has since stopped requiring SRI tapering in most of its studies. We discuss the evidence for this blunting effect, whether it can be overcome with higher doses, and what this means for patients who cannot or will not discontinue their antidepressant.\n\nThird, pooled cardiovascular data across hundreds of sessions show that psilocybin's hemodynamic effects are more modest than current eligibility criteria assume, supporting a case for liberalized blood pressure thresholds.\n\nFourth, industry trials typically use psychotherapists as session monitors but putatively do not deliver psychotherapy. Whether psychotherapy actually matters remains inadequately studied — urgent given that post-approval, many if not most doses will be administered by non-psychotherapists. We present evidence that therapist-level variability accounts for substantial variance in subjective drug effects, and outline a research agenda addressing this and related open questions.\n\nFinally, we discuss pharmacological manipulations and routes of administration, including MDMA co-administration with psilocybin, 5-HT1A modulation, and methods to test how experience duration affects therapeutic outcomes.",
    bio: "Sandeep M. Nayak, MD, is an Assistant Professor of Psychiatry at Johns Hopkins University School of Medicine and Medical Director of the Center for Psychedelic & Consciousness Research. His research focuses on the clinical applications and methodological challenges of psychedelic medicine, particularly for addictions and mood disorders. He currently serves as Principal Investigator on trials investigating psilocybin for opioid use disorder, PTSD, and microdosing safety, and has personally conducted dozens of high-dose psilocybin sessions and overseen hundreds more. He earned his MD from Brown University, completed psychiatry residency at Johns Hopkins Hospital, and finished a postdoctoral fellowship with Roland Griffiths. He also practices psychiatry at Johns Hopkins Bayview Medical Center.",
  },
  {
    name: "Prof. Amandine Luquiens",
    title: "Prof.",
    institution: "University of Montpellier & Nîmes University Hospital, France",
    role: "Professor, Addiction Department",
    image: "amandine_luiqiens.png",
    abstract: "TBD",
    bio: "TBD",
  },
  {
    name: "Dr. Jason K. Day",
    title: "PhD",
    institution: "University of Fribourg, Switzerland",
    role: "Postdoctoral Researcher",
    image: "Jason-Day.jpg",
    talkTitle: "What-the-Fuckness: A Phenomenological Concept for Psychedelic Experience",
    abstract:
      "It is widely held that psychedelic experiences are not only incredibly difficult to describe and conceptualise but that they are, by their very nature or essence, largely ineffable. In this talk, I will introduce a new phenomenological concept that entails no metaphysical assertion concerning the nature of whatever is experienced as indescribable: 'what-the-fuckness.' Based on a phenomenological qualitative analysis of 1895 trip reports, I will first outline that the psychedelic experience can be extensively described as characterised by four characteristic features (expansion, contraction, animation, and merging) and that these together form a distinctive style of experience. I will then focus on the fifth characteristic feature of psychedelic experience: 'what-the-fuckness.' This refers to the lived experience of being at a loss of words, concepts, certainties, and capacities to describe and conceptualise one's experience. I will, however, detail that there are several distinct and describable reasons for which what-the-fuckness is experienced.",
    bio: "Jason K. Day specializes in the phenomenology of psychedelic experiences, phenomenological scholarship, and philosophy of attention. They received their PhD in Philosophy (summa cum laude) from the University of Fribourg in 2025 for their phenomenological study of psychedelic experiences. They currently conduct postdoctoral research at the Molecular Psychiatry Lab (University of Fribourg) on the therapeutic potential of psychedelic effects on autobiographical memory. They have also published on socio-political issues concerning recreational use of psychedelics, anarchist thought, Buddhist philosophy, and ego-dissolution during 5-MeO-DMT experiences. They are a committee member of the Psychedelic Research Organisation of Fribourg and Swiss Psychedelic Student Network.",
  },
  {
    name: "Morten Lietz",
    title: "PhD Cand.",
    institution: "University of Fribourg, Switzerland",
    role: "PhD Candidate",
    image: "Morten_Lietz.jpg",
    talkTitle: "Do Older Adults Trip Differently? A Double-Blind Comparison of LSD Effects Across the Adult Lifespan",
    abstract:
      "Despite the rapid expansion of psychedelic research, older adults remain largely excluded from controlled studies of lysergic acid diethylamide (LSD). This presentation addresses two key questions: Is LSD safe in healthy older adults, and how does the psychedelic experience differ from that of younger individuals? Data are pooled from two double-blind, placebo-controlled randomized trials conducted at the same laboratory: an ongoing study in adults over 55 years (N = 45) and a completed study in younger adults. The talk presents interim findings on safety and tolerability, pharmacodynamic profiles, subjective effects, and qualitative phenomenology, alongside neurophysiological measures of acute and post-acute functional brain connectivity, cognition, and well-being. By directly comparing younger and older adults, this study provides the first comprehensive characterization of LSD effects across the adult lifespan and establishes a foundation for future clinical research in healthy aging.",
    bio: "Morten Lietz is a PhD candidate in Medical Sciences investigating the effects of lysergic acid diethylamide (LSD) on neurophysiology, cognition, subjective experience, and safety across the adult lifespan. His doctoral research is based on one of the first double-blind, placebo-controlled clinical trials of LSD in healthy older adults. Before joining the University of Fribourg, he helped establish a research program on neuroplasticity and cognition at the University of Groningen. Beyond academia, he has organized conferences and psychedelic summer schools through the ALPS Foundation and contributes to PsyCare initiatives providing harm reduction and psychological support at festivals.",
  },
  {
    name: "Manal Al-Hammadi",
    title: "PhD Cand.",
    institution: "University of Warsaw, Poland",
    role: "PhD Candidate",
    image: "Manal.png",
    talkTitle: "Psychedelics Governance: The Category Error in Mental Health Policy",
    abstract:
      "Existing regulatory frameworks governing psychedelic-assisted therapy default to pharmaceutical governance logic — assuming chronic dosing, continuous risk, and commodity delivery. The presentation argues that this constitutes a category error: a structural misfit between governance design and intervention type. Drawing on comparative legal analysis across nine jurisdictions (2000–June 2025) and 25 expert interviews spanning six countries and nine professional roles, this research identifies five regulatory archetypes, each reproducing the same pattern of misapplied pharmaceutical logic. Five structural consequences are documented: restriction failure, cost exclusion, workforce vacuum, equity exclusion, and safety surveillance gaps. A multi-lane governance architecture is proposed — concurrent pathways matching regulatory controls to risk across harm reduction, supervised services, medical prescribing, compassionate use, and research — alongside five systemic adaptations and a phased implementation roadmap. This framework is presented as a testable governance hypothesis requiring implementation evidence.",
    bio: "Manal Al-Hammadi is co-founder of the Psychedelic Women Network and a certified Psychedelic Integration Facilitator and Educator with specialized expertise in knowledge valorization, particularly in capacity building for science-based innovation. With over a decade of experience studying psychedelics, she brings together expertise in innovation, psychedelic research, and education. Originally from Yemen and now based in Poland, Manal draws on both ancestral wisdom and contemporary science to inform her work. She leads initiatives to advance training and education on the therapeutic use of psychedelics within existing legal frameworks, with a strong focus on ethical standards. Manal is a transpersonal psychotherapist and Holotropic breathwork facilitator in training, and she is finishing a Ph.D. at the intersection of psychedelics, public health, and drug policy.",
  },
  {
    name: "Dr. Pablo Mallaroni",
    title: "PhD",
    institution: "Imperial College London, UK & Maastricht University, Netherlands",
    role: "Postdoctoral Researcher",
    image: "Pablo_Mallaroni.jpg",
    talkTitle: "Finding Order in Disorder: Mapping the Dynamics of the Psychedelic Brain",
    abstract:
      "Neural flexibility has become a central organising principle of psychedelic medicine. Cortical 5-HT2A activation is thought to relax top-down constraints, broaden accessible brain states and relieve disorders marked by cognitive rigidity. Intuitive and clinically seductive as it is, this framework remains descriptive rather than mechanistic. Current work often captures differences between brains without defining the processes that generate them, and pooled designs reveal substantial heterogeneity across both compounds and individuals. Computational modelling offers a route into this complexity, fitting pharmacology, brain dynamics and subjective experience within a common generative framework at the individual level. Through the lens of dynamical systems theory, the brain can be understood as a landscape of attractor states, where mental illness reflects entrenched patterns of activity and psychedelics enable transitions between them. Drawing on findings from twelve psychoactive compounds, this talk maps a shared neurophenomenological space across altered states, exploring what dynamics reveal about cognition, consciousness and personalised psychedelic medicine.",
    bio: "Pablo Mallaroni is a computational neuroscientist investigating the varieties of altered states of consciousness, holding joint postdoctoral appointments at Imperial College London and Maastricht University. He pairs multimodal pharmacoimaging with whole-brain modelling to study how psychedelics restructure neural dynamics. His research spans (non)classical psychedelics, dissociatives, cannabinoids, stimulants and meditation, integrating molecular, ultra-high-field neuroimaging and behavioural data into personalised models for precision neuroscience. He asks how individual variability defines altered states and therapeutic outcomes, bridging fundamental and clinical neuroscience. He contributes to initiatives promoting equity and harmonisation, including EU PSY-NET and the Latin American Scientific Society for the Study of Consciousness.",
  },
];

const PANEL_SPEAKERS: SpeakerEntry[] = [
  {
    name: "Ricardo Morales",
    title: "",
    institution: "Xicotepec de Juárez, Puebla, Mexico",
    role: "Traditional Wisdom Keeper",
    image: "richie_morales.png",
    bio: `Ricardo Morales Fuentes was born in 1971 in Xicotepec de Juárez, in the state of Puebla, Mexico, into a family deeply connected to traditional herbal knowledge. From early childhood, his maternal grandmother became his first mentor, introducing him to the temazcal, sacred offerings, and the honoring of the elemental forces of nature.

Xochipilli—the Lord of Flowers and sacred plants—has always held a central place in his life. In Xicotepec stands La Xochipila, an ancient sacred site dedicated to this great deity. The presence of Xochipilli became for Ricardo both a spiritual guide and a living connection to the ancestral heritage of Anáhuac.

At the age of nineteen, he received his first Nahuatl name from an elder of the Toltec tradition. At twenty-five, he traveled to Africa as part of a cultural exchange, and from the age of thirty-eight onward, he deepened his study of the sacred plants of Mexico, Central America, and South America.

For more than fifteen years, Ricardo has walked the sacred peyote path alongside distinguished mara'akate of the Wixárika people, receiving teachings and guidance within one of Mexico's most profound living traditions. Fifteen years ago, he also received a special blessing during a Vedic ceremony conducted by Brahmins from Southern India, an experience that forever changed the direction of his life.

Ricardo is also devoted to preserving and revitalizing the sacred cacao tradition through the Mayan worldview, sharing it as a path toward the heart, community, and ancestral remembrance.

Ricardo Morales Fuentes is a proud heir to the culture of Anáhuac, an intuitive musician, ceremonial guide, and writer who has dedicated his life to preserving, honoring, and transmitting the spiritual wisdom of the ancestors.

This is the path of Ricardo Morales Fuentes.`,
  },
  { tbd: true },
];

function ModalPhoto({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="w-16 h-16 rounded-full object-cover shrink-0 border border-white/10"
      onError={() => setErrored(true)}
    />
  );
}

function AbstractModal({
  speaker,
  onClose,
}: {
  speaker: Speaker;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-neutral-dark border border-white/10 rounded-sm shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors rounded-sm hover:bg-white/10 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-start gap-4 mb-6">
          {speaker.image && (
            <ModalPhoto src={withBase(`img/speakers/${speaker.image}`)} alt={speaker.name} />
          )}
          <div>
            <p className="text-sm text-support-light font-medium tracking-wide uppercase mb-1">
              {speaker.role} · {speaker.institution}
            </p>
            <h3 className="text-xl font-semibold text-white">{speaker.name}</h3>
          </div>
        </div>

        <div className="space-y-5">
          {speaker.talkTitle && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Talk</p>
              <p className="text-base font-medium text-white/90 leading-snug">{speaker.talkTitle}</p>
            </div>
          )}
          {speaker.abstract && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Abstract</p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{speaker.abstract}</p>
            </div>
          )}
          {speaker.bio && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Biography</p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{speaker.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s*(phil\.?)?\s*/i, "").trim().split(" ");
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function SpeakerPhoto({ src, alt, initials: init }: { src: string; alt: string; initials: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-support/20 border border-support/30 flex items-center justify-center">
          <span className="text-xl text-support-light font-bold">{init}</span>
        </div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
      onError={() => setErrored(true)}
    />
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        data-fade-up
        className="opacity-0 group relative flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-sm overflow-hidden hover:border-support/30 hover:bg-white/[0.05] transition-all duration-300"
      >
        <div className="aspect-[4/3] overflow-hidden bg-white/[0.03] relative">
          {speaker.image ? (
            <SpeakerPhoto src={withBase(`img/speakers/${speaker.image}`)} alt={speaker.name} initials={initials(speaker.name)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-support/20 border border-support/30 flex items-center justify-center">
                <span className="text-xl text-support-light font-bold">{initials(speaker.name)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-support-light mb-1">
            {speaker.role}
          </p>
          <h3 className="text-lg font-semibold text-white mb-0.5">{speaker.name}</h3>
          <p className="text-sm text-white/50 mb-4">{speaker.institution}</p>

          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            {speaker.talkTitle && (
              <p className="text-base text-white/80 line-clamp-3 leading-relaxed mb-3">
                {speaker.talkTitle}
              </p>
            )}
            {(speaker.abstract || speaker.bio) && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-medium text-support-light hover:text-white transition-colors uppercase tracking-[0.14em] cursor-pointer"
              >
                Read abstract →
              </button>
            )}
          </div>
        </div>
      </div>

      {modalOpen && <AbstractModal speaker={speaker} onClose={() => setModalOpen(false)} />}
    </>
  );
}

function TbdCard() {
  return (
    <div
      data-fade-up
      className="opacity-0 relative flex flex-col bg-white/[0.01] border border-white/[0.04] rounded-sm overflow-hidden"
    >
      <div className="aspect-[4/3] bg-white/[0.02] flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center">
          <span className="text-white/20 text-2xl">?</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/20 mb-1">
          Speaker
        </p>
        <h3 className="text-lg font-semibold text-white/25 mb-0.5">To Be Announced</h3>
        <p className="text-sm text-white/20">More speakers coming soon</p>
      </div>
    </div>
  );
}

export default function Speakers() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [24, 0],
            delay: (_: unknown, i: number) => i * 80,
            duration: 700,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="speakers" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            ALPS 2026
          </p>
          <h2 className="text-3xl font-semibold text-white mb-4">Confirmed Speakers</h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Distinguished researchers and clinicians presenting at the forefront of psychedelic science.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SPEAKERS.map((entry, i) =>
            "tbd" in entry && entry.tbd ? (
              <TbdCard key={`tbd-${i}`} />
            ) : (
              <SpeakerCard key={(entry as Speaker).name} speaker={entry as Speaker} />
            )
          )}
        </div>

        <div data-fade-up className="opacity-0 mt-20 mb-14 text-center">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            ALPS 2026
          </p>
          <h2 className="text-3xl font-semibold text-white mb-4">Panel</h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Panel title to be announced. Further panel speakers will be uploaded soon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PANEL_SPEAKERS.map((entry, i) =>
            "tbd" in entry && entry.tbd ? (
              <TbdCard key={`panel-tbd-${i}`} />
            ) : (
              <SpeakerCard key={(entry as Speaker).name} speaker={entry as Speaker} />
            )
          )}
        </div>
      </div>
    </section>
  );
}
