import { setLocationHash } from "./locationHash";

export const SPEAKER_MODAL_EVENT = "alps:open-speaker";

export function getSpeakerModalId(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `speaker-${slug}`;
}

export function openSpeakerModal(name: string) {
  const speakerId = getSpeakerModalId(name);
  setLocationHash(speakerId);
  window.dispatchEvent(
    new CustomEvent<{ speakerId: string }>(SPEAKER_MODAL_EVENT, {
      detail: { speakerId },
    })
  );
}
