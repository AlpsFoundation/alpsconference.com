import Navbar from "./Navbar";
import Hero, { type HeroIllustration } from "./Hero";
import ThankYou from "./ThankYou";
import Experiences from "./Experiences";
import About from "./About";
import Gallery from "./Gallery";
import Program from "./Program";
import Speakers from "./Speakers";
import Location from "./Location";
import Newsletter from "./Newsletter";
import Partners from "./Partners";
import FAQ from "./FAQ";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";

// The conference took place on 9–10 October 2026: the page now looks back on it.
// Accommodation (hotel discounts for attendees) is no longer shown.
export default function App({ illustration }: { illustration?: HeroIllustration }) {
  return (
    <>
      <Navbar />
      <main>
        <Hero illustration={illustration} />
        <ThankYou />
        <About />
        <Program />
        <Speakers />
        <Experiences />
        <Gallery />
        <Location />
        <FAQ />
        <Newsletter />
      </main>
      <div className="relative overflow-hidden">
        <ParticlesCanvas variant="footer" />
        <Partners />
        <Footer />
      </div>
    </>
  );
}
