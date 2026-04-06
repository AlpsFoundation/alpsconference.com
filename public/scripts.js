(() => {
  const particlesRoot = document.querySelector("#particles");
  const poster = document.querySelector("#poster");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!particlesRoot || !poster) {
    return;
  }

  const palette = {
    white: ["rgba(255, 255, 255, 0.94)", "rgba(255, 255, 255, 0.8)"],
    blue: ["rgba(152, 221, 255, 0.86)", "rgba(126, 203, 255, 0.75)"],
    pink: ["rgba(255, 132, 184, 0.88)", "rgba(255, 120, 177, 0.78)"],
    lilac: ["rgba(202, 174, 255, 0.82)", "rgba(190, 160, 255, 0.7)"],
    slate: ["rgba(133, 166, 196, 0.88)", "rgba(116, 153, 184, 0.72)"]
  };

  const ambientParticles = [
    { x: 6, y: 58, size: 24, palette: "blue", large: true, rise: -8, z: -8 },
    { x: 15, y: 66, size: 12, palette: "white", rise: -5, z: 4 },
    { x: 21, y: 61, size: 28, palette: "slate", large: true, rise: -10, z: 16 },
    { x: 28, y: 36, size: 14, palette: "white", rise: -6, z: 6 },
    { x: 35, y: 30, size: 18, palette: "pink", ring: true, rise: -8, z: 14 },
    { x: 71, y: 56, size: 10, palette: "white", rise: -5, z: 4 },
    { x: 77, y: 62, size: 14, palette: "blue", ring: true, rise: -8, z: 14 },
    { x: 84, y: 70, size: 38, palette: "blue", large: true, rise: -11, z: 18 },
    { x: 89, y: 57, size: 10, palette: "white", rise: -4, z: 6 },
    { x: 93, y: 48, size: 22, palette: "pink", ring: true, rise: -8, z: 10 },
    { x: 97, y: 60, size: 16, palette: "slate", muted: true, rise: -6, z: -6 },
    { x: 63, y: 46, size: 10, palette: "white", rise: -5, z: 8 }
  ];

  const centerPinkCluster = Array.from({ length: 24 }, (_, index) => {
    const angle = index * 0.72;
    const radiusX = 1.6 + (index % 6) * 0.95;
    const radiusY = 1.4 + ((index + 2) % 5) * 0.88;
    const paletteName = ["pink", "pink", "white", "pink", "lilac", "pink"][index % 6];
    const size = index % 7 === 0 ? 10 : index % 3 === 0 ? 8 : 6;

    return {
      x: 50 + Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
      size,
      palette: paletteName,
      ring: index % 11 === 0,
      rise: -4 - (index % 3) * 2,
      z: 12 + (index % 4) * 4
    };
  });

  const bridgeParticles = [
    { x: 47.5, y: 48.1, size: 9, palette: "pink", rise: -6, z: 18 },
    { x: 48.7, y: 49.4, size: 7, palette: "white", rise: -4, z: 16 },
    { x: 49.6, y: 47.8, size: 8, palette: "pink", rise: -5, z: 18 },
    { x: 50.8, y: 50.3, size: 7, palette: "pink", rise: -4, z: 14 },
    { x: 52, y: 49.1, size: 8, palette: "pink", rise: -5, z: 18 },
    { x: 53.2, y: 50.8, size: 7, palette: "lilac", rise: -4, z: 14 }
  ];

  [...ambientParticles, ...centerPinkCluster, ...bridgeParticles].forEach((particle, index) => {
    const el = document.createElement("span");
    const [fill, glow] = palette[particle.palette];

    el.className = ["particle", particle.ring ? "ring" : "", particle.large ? "large" : "", particle.muted ? "muted" : ""]
      .filter(Boolean)
      .join(" ");

    el.style.setProperty("--x", particle.x.toFixed(2));
    el.style.setProperty("--y", particle.y.toFixed(2));
    el.style.setProperty("--size", particle.size);
    el.style.setProperty("--fill", fill);
    el.style.setProperty("--glow", glow);
    el.style.setProperty("--opacity", particle.large ? 0.92 : particle.ring ? 0.78 : 0.9);
    el.style.setProperty("--duration", `${4.9 + (index % 8) * 0.72}s`);
    el.style.setProperty("--delay", `${(index % 10) * -0.45}s`);
    el.style.setProperty("--rise", particle.rise ?? -8);
    el.style.setProperty("--z", particle.z ?? 0);

    particlesRoot.appendChild(el);
  });

  if (prefersReducedMotion.matches || document.body.classList.contains("layout-lock")) {
    return;
  }

  let rafId = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let resizeTimer = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const render = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    document.documentElement.style.setProperty("--pointer-x", currentX.toFixed(4));
    document.documentElement.style.setProperty("--pointer-y", currentY.toFixed(4));

    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
      rafId = window.requestAnimationFrame(render);
    } else {
      rafId = 0;
    }
  };

  const setTarget = (x, y) => {
    targetX = clamp(x, -1, 1);
    targetY = clamp(y, -1, 1);

    if (!rafId) {
      rafId = window.requestAnimationFrame(render);
    }
  };

  poster.addEventListener("pointermove", (event) => {
    const rect = poster.getBoundingClientRect();
    const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setTarget(normalizedX * 0.55, normalizedY * 0.45);
  });

  poster.addEventListener("pointerleave", () => setTarget(0, 0));

  const handleResize = () => {
    document.body.classList.add("is-resizing");
    setTarget(0, 0);
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      document.body.classList.remove("is-resizing");
    }, 140);
  };

  const handleOrientation = (event) => {
    if (event.gamma == null || event.beta == null) {
      return;
    }

    const normalizedX = clamp(event.gamma / 55, -1, 1);
    const normalizedY = clamp((event.beta - 42) / 68, -1, 1);
    setTarget(normalizedX * 0.7, normalizedY * 0.5);
  };

  const enableOrientation = () => {
    if (!window.DeviceOrientationEvent) {
      return;
    }

    if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
      window.DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, { passive: true });
          }
        })
        .catch(() => {});
    } else {
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    }
  };

  window.addEventListener("touchstart", enableOrientation, { once: true, passive: true });
  window.addEventListener("pointerdown", enableOrientation, { once: true });
  window.addEventListener("resize", handleResize, { passive: true });
})();
