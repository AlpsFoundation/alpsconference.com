import { useEffect, useRef, useState } from "react";
import { withBase } from "../lib/withBase";

// The 2026 group photo on the main stage (Saturday 10 October, by Max Lüdicke), shown whole at every size: as wide as
// the page, or as wide as fits between the navbar and the bottom of the window.
const PHOTO = "img/thank-you/group-photo";
const PHOTO_WIDTHS = [640, 1024, 1440, 2000, 2400];
const PHOTO_ALT =
  "Group photo of the ALPS Conference 2026 speakers, attendees and crew on the stage of the Kultur & Kongresshaus Aarau, under the ALPS logo on the screen";
// The photo's width when it fills the window's height (keep in step with .thank-you-photo in app.css).
const PHOTO_SIZES = "(min-aspect-ratio: 3/2) calc((100vh - 5rem) * 1.61), 100vw";

// Start the letters anyway if the photo is slow to load.
const READY_FALLBACK_MS = 2500;

const WORDS = ["THANK", "YOU"];

const srcSet = (format: string) =>
  PHOTO_WIDTHS.map((w) => `${withBase(`${PHOTO}-${w}.${format}`)} ${w}w`).join(", ");

export default function Hero() {
  const photoRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = photoRef.current;
    if (!img || img.complete) {
      setReady(true);
      return;
    }
    const done = () => setReady(true);
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    const timer = window.setTimeout(done, READY_FALLBACK_MS);
    return () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
      window.clearTimeout(timer);
    };
  }, []);

  let letter = 0;

  return (
    <section id="hero" className="thank-you-hero">
      {/* The photo, blurred, behind the navbar and either side of the sharp one. */}
      <div className="thank-you-hero__backdrop" aria-hidden="true">
        <img src={withBase(`${PHOTO}-blur.webp`)} alt="" />
      </div>

      <figure className="thank-you-photo" data-ready={ready || undefined}>
        <picture>
          <source type="image/avif" srcSet={srcSet("avif")} sizes={PHOTO_SIZES} />
          <source type="image/webp" srcSet={srcSet("webp")} sizes={PHOTO_SIZES} />
          <img
            ref={photoRef}
            src={withBase(`${PHOTO}-1440.webp`)}
            width={2400}
            height={1489}
            alt={PHOTO_ALT}
            fetchPriority="high"
          />
        </picture>

        {/* On the screen, under the triangle logo and above the tallest head. */}
        <h1 className="thank-you-title">
          <span className="sr-only">Thank you</span>
          <span aria-hidden="true">
            {WORDS.map((word, w) => (
              <span key={word}>
                {w > 0 && " "}
                {[...word].map((char) => {
                  const i = letter++;
                  return (
                    <span key={i} className="thank-you-letter" style={{ "--i": i } as React.CSSProperties}>
                      {char}
                    </span>
                  );
                })}
              </span>
            ))}
          </span>
        </h1>

        <figcaption className="thank-you-photo__credit">Photo: Max Lüdicke</figcaption>
      </figure>
    </section>
  );
}
