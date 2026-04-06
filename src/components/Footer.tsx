import { Heart } from "lucide-react";
import ParticlesCanvas from "./ParticlesCanvas";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-10 overflow-hidden">
      <ParticlesCanvas variant="footer" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/img/logo.png" alt="ALPS" className="h-6 w-auto opacity-80" />
            <span className="text-base text-white/90 font-medium">
              &copy; 2026 ALPS Foundation
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-base text-white/80 font-medium">
            Made with <Heart className="w-4 h-4 text-support-light mx-0.5" /> in Switzerland
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://alps-foundation.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-white/90 font-medium hover:text-white transition-colors"
            >
              ALPS Foundation
            </a>
            <a
              href="#"
              className="text-base text-white/90 font-medium hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-base text-white/90 font-medium hover:text-white transition-colors"
            >
              Imprint
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}