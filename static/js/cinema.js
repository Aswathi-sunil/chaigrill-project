(() => {
  const wrap = document.getElementById("cinema");
  if (!wrap) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { wrap.remove(); return; }

  const $ = id => document.getElementById(id);
  const stage = wrap.querySelector(".cinema__stage");
  const bg = $("cBg"), rev = $("cRev"), L = $("cL"), R = $("cR"),
        logo = $("cLogo"), cue = $("cCue");
  const heads = [...wrap.querySelectorAll(".cinema__h")];
  const imgs  = [...wrap.querySelectorAll(".cinema__img")];

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease  = t => 1 - (1 - t) * (1 - t);                    // quad-out
  const seg   = (p, a, b) => ease(clamp((p - a) / (b - a)));   // eased sub-tween

  let last = -1, outro = false;

  function render(p) {
    // (1) background un-zoom 1.5 -> 1 over [0, .5]
    bg.style.transform = `scale(${1.12 - 0.12 * seg(p, 0, 0.5)})`;
    // (2) revealer: seam -> thin bar over [0,.2], then full screen over [.2,.5]
    const e1 = seg(p, 0, 0.2), e2 = seg(p, 0.2, 0.5);
    const l = (50 - e1) * (1 - e2), r = 100 - l;
    const t = 50 * (1 - e1),        b = 100 - t;
    rev.style.clipPath = `polygon(${l}% ${t}%,${r}% ${t}%,${r}% ${b}%,${l}% ${b}%)`;

    // (3) three images cascade: start .4, stagger .04, length .16
    imgs.forEach((el, i) => {
      const e = seg(p, 0.4 + i * 0.04, 0.56 + i * 0.04);
      el.style.visibility = e > 0 ? "visible" : "hidden";
      el.style.clipPath = `inset(${50 * (1 - e)}%)`;
      el.style.transform = `scale(${e})`;
    });

    // (4) at .7 everything underneath snaps hidden
    const isOutro = p >= 0.7;
    if (isOutro !== outro) { outro = isOutro; stage.classList.toggle("is-outro", outro); }

    // (5) outro headline forms [.54,.7], then splits [.7,1]
    const s = seg(p, 0.54, 0.7), q = seg(p, 0.7, 1);
    heads.forEach(h => h.style.transform = `scale(${s})`);
    L.style.transform = `translateX(${-150 * q}%)`;
    R.style.transform = `translateX(${50 * q}%)`;

    const lg = seg(p, 0.82, 1);
    logo.style.opacity = lg;
    logo.style.transform = `scale(${0.8 + 0.2 * lg})`;
    cue.style.opacity = 1 - clamp(p * 12);
  }

  function tick() {
    const max = wrap.offsetHeight - innerHeight;
    const p = max > 0 ? clamp(-wrap.getBoundingClientRect().top / max) : 0;
    if (Math.abs(p - last) > 1e-4) { last = p; render(p); }   // only write when it changed
    requestAnimationFrame(tick);
  }
  render(0);
  tick();
})();