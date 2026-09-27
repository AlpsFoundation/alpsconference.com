import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { BookingLookup } from "../lib/experienceSignups";
import { withBase } from "../lib/withBase";

const API = withBase("api/experience-signups");

type State =
  | { phase: "loading" }
  | { phase: "ready"; booking: BookingLookup }
  | { phase: "cancelling"; booking: BookingLookup }
  | { phase: "cancelled"; booking: BookingLookup }
  | { phase: "missing" }
  | { phase: "error"; message: string };

export default function CancelBookingPage() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")?.trim() ?? "";
    if (!token) {
      setState({ phase: "missing" });
      return;
    }

    fetch(`${API}/booking?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (response.status === 404) {
          setState({ phase: "missing" });
          return;
        }
        const data = (await response.json()) as { booking?: BookingLookup; error?: string };
        if (!response.ok || !data.booking) {
          setState({ phase: "error", message: data.error ?? "Could not load this booking." });
          return;
        }
        setState({ phase: "ready", booking: data.booking });
      })
      .catch(() => setState({ phase: "error", message: "Could not load this booking." }));
  }, []);

  const cancel = async () => {
    if (state.phase !== "ready") return;
    const { booking } = state;
    setState({ phase: "cancelling", booking });
    try {
      const response = await fetch(API, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cancelToken: booking.cancelToken }),
      });
      if (!response.ok && response.status !== 404) {
        throw new Error(
          ((await response.json()) as { error?: string }).error ?? "Could not cancel, please try again.",
        );
      }
      setState({ phase: "cancelled", booking });
    } catch (e) {
      setState({
        phase: "error",
        message: e instanceof Error ? e.message : "Could not cancel, please try again.",
      });
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 pb-12 pt-10">
      <header className="text-center">
        <a href={withBase("/")} className="inline-block">
          <img src={withBase("img/logo.png")} alt="ALPS" className="mx-auto h-9 w-auto" />
        </a>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Cancel booking</h1>
      </header>

      <div className="links-card space-y-4">
        {state.phase === "loading" && (
          <p className="flex items-center justify-center gap-2 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Looking up your booking…
          </p>
        )}

        {(state.phase === "ready" || state.phase === "cancelling") && (
          <>
            <p className="text-sm text-white/70">
              Signed up as <span className="text-white">{state.booking.fullName}</span>
              {" · "}
              {state.booking.email}
            </p>
            <div>
              <p className="text-lg font-semibold text-white">{state.booking.title}</p>
              <p className="mt-1 text-sm text-white/70">
                {state.booking.day} · {state.booking.time}
                {state.booking.venue ? ` · ${state.booking.venue}` : ""}
              </p>
              <p className="mt-2 text-sm text-white/55">
                {state.booking.status === "confirmed"
                  ? "Confirmed spot"
                  : `Waitlist #${state.booking.waitlistPosition}`}
              </p>
            </div>
            <button
              type="button"
              onClick={cancel}
              disabled={state.phase === "cancelling"}
              className="links-button links-button--ghost"
            >
              {state.phase === "cancelling" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Cancelling…
                </>
              ) : (
                <>
                  <X className="h-4 w-4" aria-hidden />
                  Cancel this booking
                </>
              )}
            </button>
          </>
        )}

        {state.phase === "cancelled" && (
          <div className="links-confirm" role="status">
            <span className="links-confirm__icon" aria-hidden>
              <Check className="h-5 w-5" />
            </span>
            <p className="font-semibold text-white">Booking cancelled</p>
            <p className="mt-1 text-sm text-white/70">
              Your place for {state.booking.title} has been released.
            </p>
          </div>
        )}

        {state.phase === "missing" && (
          <p className="text-sm text-white/70">
            This booking link is no longer valid — it may already have been cancelled.
          </p>
        )}

        {state.phase === "error" && (
          <p className="text-sm text-accent-light" role="alert">{state.message}</p>
        )}
      </div>

      <p className="text-center text-sm text-white/50">
        <a href={withBase("links")} className="hover:text-white">Back to links</a>
      </p>
    </div>
  );
}
