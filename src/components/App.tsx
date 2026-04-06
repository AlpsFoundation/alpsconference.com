import Navbar from "./Navbar";
import Hero from "./Hero";
import Conference from "./Conference";
import Experiences from "./Experiences";
import Location from "./Location";
import Newsletter from "./Newsletter";
import Partners from "./Partners";
import FAQ from "./FAQ";
import Footer from "./Footer";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* <Conference /> */}
        {/* <Experiences /> */}
        <Location />
        <FAQ />
        {/* <Partners /> */}
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}