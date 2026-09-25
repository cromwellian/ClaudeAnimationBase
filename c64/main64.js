// main64.js: the timeline (screens registered by the chapter files) and the page hooks render.mjs uses.
// ---------- the timeline ----------
let FADE = 0;
function frame(t) {
  const fr = Math.floor(t * 50 + 1e-6); t = fr / 50;          // the C64 draws 50 frames a second
  let i = 0; while (i + 1 < SCREENS.length && t >= SCREENS[i + 1][0]) i++;
  const t0 = SCREENS[i][0], end = i + 1 < SCREENS.length ? SCREENS[i + 1][0] : DUR;
  SHX = SHY = 0; clipAll();
  SCREENS[i][1](t, t - t0, end - t0, fr);
  FADE = t > DUR - 1.2 ? Math.round(6 * seg(t, DUR - 1.2, DUR - .15)) : 0;
}

// ---------- page hooks for render.mjs ----------
window.renderAt = async (t, type = 'image/png', q = .92) => { frame(t); present(FADE); return outC.toDataURL(type, q); };
window.renderSheet = async (times, cols = 3, w = 640, crop = null) => {
  const [cx, cy, cw, ch] = crop || [0, 0, 1920, 1080], h = Math.round(w * ch / cw), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h; const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); frame(times[i]); present(FADE); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    c.drawImage(outC, cx, cy, cw, ch, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 84, 24); c.fillStyle = '#fff'; c.font = '15px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 6, y + 17);
  }
  return { url: sc.toDataURL('image/jpeg', .9), ms };
};
window.gpuInfo = () => 'canvas2d';
window.addEventListener('load', () => {
  vicInit(); window.ready = true;
  if (location.search.includes('render')) return;
  const s = document.getElementById('scrub'), lab = document.getElementById('tt'), au = document.getElementById('au');
  const show = t => { frame(t); present(FADE); lab.textContent = t.toFixed(2) + 's'; };
  s.addEventListener('input', () => { au.pause(); au.currentTime = +s.value; show(+s.value); });
  const loop = () => { if (!au.paused) { s.value = au.currentTime; show(au.currentTime); } requestAnimationFrame(loop); };
  document.getElementById('play').onclick = () => au.paused ? au.play() : au.pause();
  show(+(new URLSearchParams(location.search).get('t') || 0)); loop();
});
