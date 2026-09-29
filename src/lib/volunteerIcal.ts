/**
 * Per-person crew calendar: every shift, plus the loading, power circles and
 * dismantling that person is part of. Rebuilt from `src/data/volunteers.ts` on
 * every build, so subscribers pick up plan changes on their next refresh.
 */
import { CREW_CONTACTS, SHIFT_DAYS, VOLUNTEER_TASKS } from "../data/volunteers";
import { serializeCalendar, VENUE, type CalendarEvent } from "./ical";
import {
  blockTasks,
  crewEventsFor,
  formatTime,
  shiftBlocks,
  toMinutes,
  volunteerCalendarPath,
  volunteerSlug,
} from "./volunteers";
import { withBase } from "./withBase";

const UID_DOMAIN = "alpsconference.com";

export function buildVolunteerCalendar(person: string, site: URL | undefined, builtAt = new Date()) {
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

  const crew: CalendarEvent[] = crewEventsFor(person).map((event) => ({
    uid: `crew-${slug}-${event.id}@${UID_DOMAIN}`,
    date: event.dateTime,
    range: { start: event.start, end: formatTime(toMinutes(event.start) + event.calendarMinutes) },
    summary: `ALPS crew: ${event.title}`,
    description: [
      event.people ? `With ${event.people.filter((name) => name !== person).join(", ")}` : "The whole crew",
      `Starts ${event.approximate ? "around " : ""}${event.start}. The plan gives no end time, so the end of this entry is only a placeholder.`,
      ...footer,
    ].join("\n\n"),
    location: event.place === "Bern" ? "Bern, Switzerland" : VENUE,
    url: pageUrl,
  }));

  return serializeCalendar(
    {
      name: `ALPS 2026 crew · ${person}`,
      description: `${person}’s crew shifts at ALPS Conference 2026, 9–10 October 2026 at the Kultur & Kongresshaus Aarau.`,
      source: new URL(volunteerCalendarPath(person), origin).href,
    },
    [...crew, ...shifts].sort((a, b) =>
      `${a.date}${a.range?.start}`.localeCompare(`${b.date}${b.range?.start}`)
    ),
    builtAt
  );
}
