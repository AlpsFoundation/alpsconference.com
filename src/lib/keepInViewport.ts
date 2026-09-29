import { useLayoutEffect, type RefObject } from "react";

/** Shifts an open popover sideways so it never runs past the edge of the screen. */
export function useKeepInViewport(ref: RefObject<HTMLElement | null>, open: boolean, margin = 8) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!open || !element) return;

    const place = () => {
      element.style.translate = "";
      const { left, right } = element.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      const shift = left < margin ? margin - left : right > width - margin ? width - margin - right : 0;
      if (shift) element.style.translate = `${Math.round(shift)}px 0`;
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [ref, open, margin]);
}
