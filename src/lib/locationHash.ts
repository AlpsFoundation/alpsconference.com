export function setLocationHash(id: string | null, mode: "push" | "replace" = "push") {
  if (typeof window === "undefined") return;

  const { scrollX, scrollY } = window;
  const url = id
    ? `${window.location.pathname}${window.location.search}#${id}`
    : `${window.location.pathname}${window.location.search}`;
  const html = document.documentElement;
  const previousBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";

  if (mode === "replace") {
    window.history.replaceState(null, "", url);
  } else {
    window.history.pushState(null, "", url);
  }

  window.scrollTo(scrollX, scrollY);
  html.style.scrollBehavior = previousBehavior;
}
