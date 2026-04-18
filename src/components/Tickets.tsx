import { useEffect, useRef } from "react";
import { Ticket } from "lucide-react";

export default function Tickets() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const script = document.createElement("script");
    script.id = "etickets";
    script.src = "https://infomaniak.events/scripts/shop/NWT3HX6EG2";
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
      scriptLoadedRef.current = true;
    }

    return () => {
      const existingScript = document.getElementById("etickets");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section id="tickets" className="relative py-24 lg:py-32 bg-neutral-dark">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-support/10 mb-6">
            <Ticket className="w-8 h-8 text-support" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Get Your Tickets
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Join us for two days of groundbreaking research, inspiring speakers, and meaningful connections.
          </p>
        </div>

        <div
          ref={containerRef}
          className="bg-white/5 backdrop-blur-sm rounded-sm border border-white/10 p-6 sm:p-8 min-h-[400px]"
        />
      </div>
    </section>
  );
}
