import Navbar from "./Navbar";
import Hero from "./Hero";
import Conference from "./Conference";
import Experiences from "./Experiences";
import About from "./About";
import Location from "./Location";
import Newsletter from "./Newsletter";
import Tickets from "./Tickets";
import Partners from "./Partners";
import FAQ from "./FAQ";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";
import { I18nProvider } from "../lib/i18n";

export default function App() {
  return (
    <I18nProvider>
      <Navbar />
      <main>
        <Hero />
        <Tickets />
        {/* <Conference /> */}
        {/* <Experiences /> */}
        <About />
        <Location />
        <FAQ />
        <Newsletter />
      </main>
      <div className="relative overflow-hidden">
        <ParticlesCanvas variant="footer" />
        <Partners />
        <Footer />
      </div>
    </I18nProvider>
  );
}