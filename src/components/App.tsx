import Navbar from "./Navbar";
import Hero from "./Hero";
import Conference from "./Conference";
import Experiences from "./Experiences";
import Location from "./Location";
import Newsletter from "./Newsletter";
import Partners from "./Partners";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";

export default function App() {
  return (
    <>
      <ParticlesCanvas />
      <Navbar />
      <main>
        <Hero />
        {/* Divider */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <Conference />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <Experiences />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <Location />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <Partners />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
