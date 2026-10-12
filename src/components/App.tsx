import Navbar from "./Navbar";
import Hero from "./Hero";
import Experiences from "./Experiences";
import About from "./About";
import Gallery from "./Gallery";
import Program from "./Program";
import Speakers from "./Speakers";
import Location from "./Location";
import Newsletter from "./Newsletter";
import Partners from "./Partners";
import FAQ from "./FAQ";
import Footer, { type FooterIllustration } from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";

// The conference took place on 9–10 October 2026: the page now looks back on it.
// Accommodation (hotel discounts for attendees) is no longer shown.
// illustration: the footer's synapse, in 3D ("synapse", the home page) or as bones.png (/static).
export default function App({ illustration = "image" }: { illustration?: FooterIllustration }) {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Newsletter />
        <About />
        <Program />
        <Speakers />
        <Experiences />
        <Gallery />
        <Location />
        <FAQ />
      </main>
      <div className="relative overflow-hidden">
        <ParticlesCanvas variant="footer" />
        <Partners />
        <Footer illustration={illustration} />
      </div>
    </>
  );
}