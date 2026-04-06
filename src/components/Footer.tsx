import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/img/logo.png" alt="ALPS" className="h-6 w-auto opacity-60" />
            <span className="text-sm text-secondary/40">
              &copy; 2026 ALPS Foundation
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-secondary/30">
            Made with <Heart className="w-3.5 h-3.5 text-accent/50 mx-0.5" /> in Switzerland
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://alps-foundation.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary/40 hover:text-white transition-colors"
            >
              ALPS Foundation
            </a>
            <a
              href="#"
              className="text-sm text-secondary/40 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-secondary/40 hover:text-white transition-colors"
            >
              Imprint
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
