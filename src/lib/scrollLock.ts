let locks = 0;
let scrollY = 0;
let previousPaddingRight = "";
let previousHtmlOverflow = "";
let previousBodyOverflow = "";

export function lockBodyScroll() {
  if (typeof document === "undefined") return;

  if (locks === 0) {
    scrollY = window.scrollY;
    const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    previousPaddingRight = document.body.style.paddingRight;
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }
  }

  locks += 1;
}

export function unlockBodyScroll() {
  if (typeof document === "undefined" || locks === 0) return;

  locks -= 1;
  if (locks > 0) return;

  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.overflow = previousBodyOverflow;
  document.body.style.paddingRight = previousPaddingRight;
  window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
}

export function focusWithoutScroll(element: HTMLElement | null) {
  element?.focus({ preventScroll: true });
}
