import { setLocationHash } from "./locationHash";

export const EXPERIENCE_MODAL_EVENT = "alps:open-experience";

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getExperienceModalId(name: string) {
  return `experience-${slugify(name)}`;
}

export function openExperienceModal(name: string) {
  const experienceId = getExperienceModalId(name);
  setLocationHash(experienceId);
  window.dispatchEvent(
    new CustomEvent<{ experienceId: string }>(EXPERIENCE_MODAL_EVENT, {
      detail: { experienceId },
    })
  );
}
