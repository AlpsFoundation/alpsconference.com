import { Heart } from "lucide-react";
import { withBase } from "../lib/withBase";
import { useTranslation } from "../lib/i18n";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative border-t border-white/10 py-10">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={withBase("img/logo.png")} alt="ALPS" className="h-6 w-auto opacity-80" />
            <a
              href="https://alps-foundation.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-white/90 font-medium hover:text-white transition-colors"
            >
              {t.footer.copyright}
            </a>
          </div>

          <div className="flex items-center gap-1.5 text-base text-white/80 font-medium">
            {t.footer.madeWith} <Heart className="w-4 h-4 text-support-light mx-0.5" /> {t.footer.inSwitzerland}
          </div>
        </div>
      </div>
    </footer>
  );
}
