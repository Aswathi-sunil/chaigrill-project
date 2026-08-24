/* ==========================================================================
   CHAI GRILL — PREMIUM ENHANCEMENT SCRIPT
   Scroll progress bar, hero 3D parallax tilt, magnetic buttons.
   Loaded after app.js — does not touch any existing app.js logic/IDs.
   ========================================================================== */
(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.addEventListener("DOMContentLoaded", () => {
    initScrollProgress();
    if (!prefersReducedMotion) {
      initHero3DParallax();
      initMagneticButtons();
    }
  });

  /* 1. Scroll Progress Bar */
  function initScrollProgress() {
    const bar = document.getElementById("scrollProgressBar");
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* 2. Hero 3D Mouse Parallax (adds subtle depth on top of VanillaTilt) */
  function initHero3DParallax() {
    const stack = document.getElementById("hero3dStack");
    const perspectiveWrap = stack
      ? stack.closest(".hero-3d-perspective")
      : null;
    if (!stack || !perspectiveWrap) return;

    // Only enable on pointer-fine devices (desktop) to avoid fighting
    // with VanillaTilt's own touch handling on mobile.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = null;

    const onMove = (e) => {
      const rect = perspectiveWrap.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const translateX = relX * 14;
        const translateY = relY * 14;

        // Move the orbit rings gently for a layered parallax feel.
        // (VanillaTilt already owns the transform on #hero3dStack itself,
        // so we only animate the surrounding orbit rings here to avoid
        // fighting its inline transform.)
        perspectiveWrap
          .querySelectorAll(".orbit-ring")
          .forEach((ring, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            ring.style.transform = `translate(${translateX * dir * 0.6}px, ${
              translateY * dir * 0.6
            }px)`;
          });
      });
    };

    const onLeave = () => {
      perspectiveWrap.querySelectorAll(".orbit-ring").forEach((ring) => {
        ring.style.transform = "";
      });
    };

    perspectiveWrap.addEventListener("mousemove", onMove);
    perspectiveWrap.addEventListener("mouseleave", onLeave);
  }

  /* 3. Magnetic Buttons — CTA gently follows the cursor within its bounds */
  function initMagneticButtons() {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const buttons = document.querySelectorAll(".magnetic-btn");
    buttons.forEach((btn) => {
      let frame = null;

      const onMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;

        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          btn.style.transform = `translate(${relX * 0.25}px, ${
            relY * 0.35
          }px)`;
        });
      };

      const onLeave = () => {
        if (frame) cancelAnimationFrame(frame);
        btn.style.transform = "translate(0, 0)";
      };

      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
    });
  }
})();