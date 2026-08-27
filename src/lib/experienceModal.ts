export const EXPERIENCE_MODAL_EVENT = "alps:open-experience";

export function getExperienceModalId(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `experience-${slug}`;
}

export function openExperienceModal(name: string) {
  const experienceId = getExperienceModalId(name);
  window.history.pushState(null, "", `#${experienceId}`);
  window.dispatchEvent(
    new CustomEvent<{ experienceId: string }>(EXPERIENCE_MODAL_EVENT, {
      detail: { experienceId },
    })
  );
}
