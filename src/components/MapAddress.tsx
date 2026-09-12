import { MapPin } from "lucide-react";

export default function MapAddress({ address, href }: { address: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${address} — open map in a new tab`}
      className="inline-flex items-center gap-1.5 text-accent-light underline decoration-accent-light/30 underline-offset-2 hover:text-white"
    >
      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {address}
    </a>
  );
}
