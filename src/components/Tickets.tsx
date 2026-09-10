export default function Tickets() {
  return (
    <section id="tickets" className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
          Tickets
        </h2>
        <div className="flex flex-col items-center">
          <a
            href="https://infomaniak.events/en-ch/conferences/alps-conference-2026/c2484795-1ae7-4b4b-aa21-c9b8f085008c/events/382409"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 text-base font-semibold text-white transition-colors"
          >
            Buy Conference Tickets
          </a>
          <div className="mt-5 pt-5 border-t border-white/10 max-w-lg w-full text-center">
            <p className="text-white/55 text-sm leading-relaxed">
              * Team ticket — 3 + 1 free: buy 4 tickets and one is on us. The discount is
              applied automatically at checkout — no code needed. It applies within the same ticket
              type (conference-only or workshop-only; the two can't be mixed) and excludes the
              optional networking dinner.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
