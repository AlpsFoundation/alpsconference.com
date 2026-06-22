import Navbar from "./Navbar";
import Hero from "./Hero";
import Conference from "./Conference";
import Experiences from "./Experiences";
import About from "./About";
import Gallery from "./Gallery";
import Speakers from "./Speakers";
import Location from "./Location";
import Newsletter from "./Newsletter";
import Partners from "./Partners";
import FAQ from "./FAQ";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* <Conference /> */}
        {/* <Experiences /> */}
        <About />
        <Speakers />
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