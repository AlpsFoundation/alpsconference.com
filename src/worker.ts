/**
 * Worker entry: Astro serves the site, and `ExperienceBookings` gives staff
 * tools access to experience bookings over RPC. A named entrypoint is only
 * reachable through a service binding (tools.alps.foundation/experiences
 * binds it), never from the internet, so it carries no auth of its own.
 */
import { WorkerEntrypoint } from "cloudflare:workers";
import astro from "@astrojs/cloudflare/entrypoints/server";
import {
  addBooking,
  getSession,
  listSessions,
  removeBooking,
  setCheckedIn,
  type AddBookingInput,
} from "./lib/experienceAdmin";

export default astro;

/** Links in the emails staff actions send, e.g. the promoted person's cancel link. */
const SITE_ORIGIN = new URL(import.meta.env.SITE ?? "https://alpsconference.com").origin;

export class ExperienceBookings extends WorkerEntrypoint<Env> {
  private waitUntil = (promise: Promise<unknown>) => this.ctx.waitUntil(promise);

  sessions() {
    return listSessions(this.env.DB);
  }

  session(experienceId: string) {
    return getSession(this.env.DB, experienceId);
  }

  add(input: AddBookingInput) {
    return addBooking(this.env, SITE_ORIGIN, input, this.waitUntil);
  }

  remove(signupId: number) {
    return removeBooking(this.env, SITE_ORIGIN, signupId, this.waitUntil);
  }

  checkIn(signupId: number, checkedIn: boolean) {
    return setCheckedIn(this.env.DB, signupId, checkedIn);
  }
}
