import { useTranslation } from "../lib/i18n";

export default function Tickets() {
  const { t } = useTranslation();

  return (
    <section id="tickets" className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
          {t.tickets.heading}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: '<script id="etickets" src="https://infomaniak.events/scripts/shop/NWT3HX6EG2"></script>',
          }}
        />
      </div>
    </section>
  );
}
