import Navbar from "./Navbar";
import AttendeeBanner from "./AttendeeBanner";
import Hero, { type HeroIllustration } from "./Hero";
import Conference from "./Conference";
import Experiences from "./Experiences";
import About from "./About";
import Gallery from "./Gallery";
import Program from "./Program";
import Speakers from "./Speakers";
import Location from "./Location";
import Accommodation from "./Accommodation";
import Newsletter from "./Newsletter";
import Partners from "./Partners";
import FAQ from "./FAQ";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";

export default function App({ illustration }: { illustration?: HeroIllustration }) {
  return (
    <>
      <Navbar banner={<AttendeeBanner />} />
      <main>
        <Hero illustration={illustration} />
        {/* <Conference /> */}
        <About />
        <Program />
        <Speakers />
        <Experiences />
        <Gallery />
        <Location />
        <Accommodation />
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