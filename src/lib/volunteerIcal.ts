/**
 * Per-person crew calendar: every shift and catering shift, plus the loading,
 * crew meals, morning circles and dismantling that person is part of, plus what they signed up for in the build
 * (setup on Thursday, teardown and packing the truck on Saturday). Served on demand,
 * so subscribers pick up plan changes and new sign-ups on their next refresh.
 */
import { BUILD_PHASES } from "../data/crewBuild";
import type { PersonBuildEntry } from "./crewBuild";
import { CREW_CONTACTS, SHIFT_DAYS, VOLUNTEER_TASKS } from "../data/volunteers";
import { serializeCalendar, VENUE, type CalendarEvent } from "./ical";
import {
  blockTasks,
  cateringFor,
  crewEventsFor,
  formatTime,
  shiftBlocks,
  toMinutes,
  volunteerCalendarPath,
  volunteerSlug,
} from "./volunteers";
import { withBase } from "./withBase";

const UID_DOMAIN = "alpsconference.com";

export function buildVolunteerCalendar(
  person: string,
  site: URL | undefined,
  builtAt = new Date(),
  build: PersonBuildEntry[] = []
) {
  const origin = site?.href ?? "https://alpsconference.com/";
  const slug = volunteerSlug(person);
  const pageUrl = `${new URL(withBase("volunteers"), origin).href}?person=${slug}`;
  const footer = [`Changes? Tell ${CREW_CONTACTS.changes}.`, `All shifts: ${pageUrl}`];

  const shifts: CalendarEvent[] = SHIFT_DAYS.flatMap((day) =>
    shiftBlocks(day, person).map((block) => {
      const tasks = blockTasks(block);
      const parts = block.parts.map(
        (part) => `${VOLUNTEER_TASKS[part.task].label} ${formatTime(part.start)}–${formatTime(part.end)}`
      );
      const duties = tasks.map(
        (task) => `${VOLUNTEER_TASKS[task].label}:\n${VOLUNTEER_TASKS[task].duties.map((duty) => `• ${duty}`).join("\n")}`
      );

      return {
        uid: `crew-${slug}-${day.dateTime}-${formatTime(block.start).replace(":", "")}@${UID_DOMAIN}`,
        date: day.dateTime,
        range: { start: formatTime(block.start), end: formatTime(block.end) },
        summary: `ALPS shift: ${tasks.map((task) => VOLUNTEER_TASKS[task].label).join(" → ")}`,
        description: [
          parts.length > 1 ? parts.join("\n") : undefined,
          block.program.length ? `On stage: ${block.program.join(" · ")}` : undefined,
          ...duties,
          ...footer,
        ]
          .filter(Boolean)
          .join("\n\n"),
        location: VENUE,
        url: pageUrl,
      };
    })
  );

  const catering: CalendarEvent[] = cateringFor(person).map((shift) => ({
    uid: `crew-${slug}-catering-${shift.dateTime}-${shift.from.replace(":", "")}@${UID_DOMAIN}`,
    date: shift.dateTime,
    range: { start: shift.from, end: shift.to },
    summary: `ALPS catering: ${shift.station}`,
    description: ["Catering team · not counted in the hours.", ...footer].join("\n\n"),
    location: VENUE,
    url: pageUrl,
  }));

  // Teardown sign-ups go into the plan's own dismantling entry rather than doubling it.
  const teardown = build.find((entry) => entry.phase === "teardown");
  const dismantling = crewEventsFor(person).some((event) => event.id === "dismantling");
  const taskLines = (entry: PersonBuildEntry) =>
    entry.items.map((item) => `• ${item.name}${item.what ? `\n  ${item.what}` : ""}`).join("\n");

  const crew: CalendarEvent[] = crewEventsFor(person).map((event) => ({
    uid: `crew-${slug}-${event.id}@${UID_DOMAIN}`,
    date: event.dateTime,
    range: { start: event.start, end: formatTime(toMinutes(event.start) + event.calendarMinutes) },
    summary: `ALPS crew: ${event.title}`,
    description: [
      event.people ? `With ${event.people.filter((name) => name !== person).join(", ")}` : "The whole crew",
      event.id === "dismantling" && teardown ? `Your teardown tasks:\n${taskLines(teardown)}` : undefined,
      `Starts ${event.approximate ? "around " : ""}${event.start}. The plan gives no end time, so the end of this entry is only a placeholder.`,
      ...footer,
    ]
      .filter(Boolean)
      .join("\n\n"),
    location: event.place === "Bern" ? "Bern, Switzerland" : VENUE,
    url: pageUrl,
  }));

  const teardownStart = toMinutes(BUILD_PHASES.teardown.start ?? "21:30");
  const buildEvents: CalendarEvent[] = build.filter((entry) => !(dismantling && entry.phase === "teardown")).map((entry) => {
    const info = BUILD_PHASES[entry.phase];
    // Packing the truck has no time yet: it follows the teardown.
    const start = entry.start ?? teardownStart + 60;
    const end = entry.end ?? start + 60;
    return {
      uid: `crew-${slug}-build-${entry.phase}@${UID_DOMAIN}`,
      date: entry.dateTime,
      range: { start: formatTime(start), end: formatTime(end) },
      summary: `ALPS build: ${info.label}`,
      description: [
        taskLines(entry),
        entry.start === null ? "The time is still to be confirmed; this entry is a placeholder after the teardown." : undefined,
        !info.end && entry.start !== null ? "The plan gives no end time, so the end of this entry is only a placeholder." : undefined,
        ...footer,
      ]
        .filter(Boolean)
        .join("\n\n"),
      location: VENUE,
      url: pageUrl,
    };
  });

  return serializeCalendar(
    {
      name: `ALPS 2026 crew · ${person}`,
      description: `${person}’s crew shifts at ALPS Conference 2026, 9–10 October 2026 at the Kultur & Kongresshaus Aarau.`,
      source: new URL(volunteerCalendarPath(person), origin).href,
    },
    [...crew, ...shifts, ...catering, ...buildEvents].sort((a, b) =>
      `${a.date}${a.range?.start}`.localeCompare(`${b.date}${b.range?.start}`)
    ),
    builtAt
  );
}
