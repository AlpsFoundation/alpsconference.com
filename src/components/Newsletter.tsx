import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

type FormStatus = "idle" | "loading" | "success" | "error";

const apiUrl = import.meta.env.PUBLIC_NEWSLETTER_API_URL?.trim() ?? "";

export default function Newsletter() {
  const sectionRef = useRef<HTMLElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [30, 0],
            delay: (_: unknown, i: number) => i * 120,
            duration: 800,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    const el = successRef.current;
    if (!el) return;
    animate(el, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      easing: "easeOutCubic",
    });
  }, [status]);

  const configured = apiUrl.length > 0;

  return (
    <section ref={sectionRef} id="newsletter" className="relative py-24 sm:py-32">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <div data-fade-up className="opacity-0">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            Stay informed
          </p>
          <h2 className="text-3xl font-semibold text-white mb-4">
            Register for the ALPS Newsletter
          </h2>
          <p className="text-white/90 mb-8 text-base">
            Be the first to know about speakers, schedule updates, and ticket sales.
          </p>
        </div>

        {status === "success" ? (
          <div
            ref={successRef}
            className="flex flex-col items-center gap-4 py-6 px-5 rounded-sm border border-support/40 bg-support/10 text-center opacity-0"
            role="status"
          >
            <CheckCircle2
              className="w-12 h-12 text-support-light shrink-0"
              aria-hidden
            />
            <div>
              <p className="text-white font-medium text-lg mb-1">
                You&apos;re on the list
              </p>
              <p className="text-white/80 text-sm">
                We&apos;ll email you when there&apos;s news about ALPS 2026.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              className="text-support-light hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
            >
              Subscribe another address
            </button>
          </div>
        ) : (
          <form
            data-fade-up
            className="opacity-0 flex flex-col gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!configured || status === "loading") return;

              setStatus("loading");
              setErrorMessage("");

              try {
                const res = await fetch(apiUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: email.trim() }),
                });

                const payload = (await res.json().catch(() => null)) as
                  | { ok?: boolean; error?: string }
                  | null;

                if (!res.ok || !payload?.ok) {
                  setErrorMessage(
                    payload?.error?.trim() ||
                      "Something went wrong. Please try again."
                  );
                  setStatus("error");
                  return;
                }

                setEmail("");
                setStatus("success");
              } catch {
                setErrorMessage(
                  "Network error. Check your connection and try again."
                );
                setStatus("error");
              }
            }}
            aria-busy={status === "loading"}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                disabled={!configured || status === "loading"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="your@email.com"
                className="flex-1 px-5 py-3.5 bg-white/[0.05] border border-white/10 rounded-sm text-white placeholder:text-white/60 focus:outline-none focus:border-support/50 focus:ring-1 focus:ring-support/30 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!configured || status === "loading"}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-support hover:bg-support-light disabled:hover:bg-support text-white font-medium rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-support/20 cursor-pointer text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none min-w-[140px]"
              >
                {status === "loading" ? (
                  <>
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      aria-hidden
                    />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" aria-hidden />
                    Subscribe
                  </>
                )}
              </button>
            </div>

            {status === "error" && errorMessage && (
              <div
                className="flex items-start gap-2 text-left text-sm text-red-300/95 bg-red-500/10 border border-red-400/25 rounded-sm px-4 py-3"
                role="alert"
              >
                <AlertCircle
                  className="w-5 h-5 shrink-0 mt-0.5 text-red-300"
                  aria-hidden
                />
                <span>{errorMessage}</span>
              </div>
            )}

            {!configured && (
              <p className="text-white/50 text-sm text-left">
                Newsletter signup is not configured for this build (set{" "}
                <code className="text-white/70 text-xs">
                  PUBLIC_NEWSLETTER_API_URL
                </code>
                ).
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
