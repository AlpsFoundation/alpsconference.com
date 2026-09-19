/**
 * Pans a card photo inside its cropped frame while the frame crosses the
 * viewport, so a little of what the crop hides is revealed on the way past.
 *
 * The photo is zoomed slightly rather than resized: enlarging the element or
 * changing its box would change which axis `object-fit: cover` crops (square
 * sources in particular flip from a vertical to a horizontal crop), which would
 * undo the per-image crops tuned elsewhere. A scale leaves the crop untouched
 * and creates slack on both axes, so the translate can never expose the frame.
 *
 * CSS scroll-driven animations (`animation-timeline: view()`) would express
 * this without JavaScript, but the timeline resolves against the photo's
 * nearest scrollport — its own `overflow: hidden` frame, which never scrolls.
 */

/** Zoom applied to the photo; the surplus is what the pan moves through. */
const ZOOM = 1.12;

/**
 * Peak offset as a percentage of the photo's own height. Must stay under
 * (ZOOM - 1) / (2 * ZOOM) = 5.36%, or the pan would run past the zoomed edge.
 */
const SHIFT = 5;

const visible = new Set<HTMLElement>();
let observer: IntersectionObserver | null = null;
let queued = 0;

function update() {
  queued = 0;
  const viewportHeight = window.innerHeight;
  for (const photo of visible) {
    const frame = photo.parentElement;
    if (!frame) continue;
    const box = frame.getBoundingClientRect();
    const travel = viewportHeight + box.height;
    // 0 when the frame's top edge sits on the viewport's bottom edge,
    // 1 when its bottom edge sits on the viewport's top edge.
    const progress = travel > 0 ? (viewportHeight - box.top) / travel : 0.5;
    const offset = (Math.min(1, Math.max(0, progress)) - 0.5) * 2 * SHIFT;
    photo.style.transform = `scale(${ZOOM}) translate3d(0, ${offset.toFixed(2)}%, 0)`;
  }
}

function schedule() {
  if (!queued) queued = requestAnimationFrame(update);
}

function ensureObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const photo = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(photo);
        else visible.delete(photo);
      }
      schedule();
    },
    { rootMargin: "25% 0px" }
  );
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  return observer;
}

/** Registers a photo; returns the cleanup to run when it unmounts. */
export function registerPhotoParallax(photo: HTMLElement | null) {
  if (!photo || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const io = ensureObserver();
  io.observe(photo);
  schedule();

  return () => {
    io.unobserve(photo);
    visible.delete(photo);
    photo.style.transform = "";
  };
}
