// ch3_takeoff.js: 3 · Takeoff (38.5–59). Morning sky → speed → rose.
(() => {
  function skyGrad(y0, y1, ramp) { for (let y = y0; y < y1; y++) rect(0, y, 320, 1, ramp[Math.min(ramp.length - 1, Math.floor((y - y0) / (y1 - y0) * ramp.length))]); }
  function treadmill(x, y, w, t, speed) {
    rect(x, y, w, 10, 12); rect(x + 2, y + 2, w - 4, 6, 0);
    for (let k = 0; k < w; k += 8) { const xx = x + 2 + ((k - t * speed) % (w - 4) + (w - 4)) % (w - 4); rect(xx, y + 3, 3, 4, 11); }
    rect(x + w - 6, y - 50, 4, 50, 12); rect(x + w - 16, y - 54, 20, 6, 15);
  }
  function dial(cx, cy, r, v) {   // speed dial, v 0..1
    disc(cx, cy, r, 1); ring(cx, cy, r, 0, 2); for (let k = 0; k <= 6; k++) { const a = Math.PI * (.8 + 1.4 * k / 6); rect(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3), 2, 2, k > 4 ? 2 : 0); }
    const a = Math.PI * (.8 + 1.4 * v); line(cx, cy, cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4), 2, 2);
  }
  function gymBg(t) {
    fillAll(14); clipScreen(); skyGrad(0, 150, [14, 14, 3, 3, 13, 7]);
    for (let x = 20; x < 320; x += 100) { rect(x, 20, 70, 60, 15); rect(x + 4, 24, 62, 52, 14); rect(x + 34, 24, 2, 52, 15); }   // windows
    rect(0, 150, 320, 50, 12); for (let x = 0; x < 320; x += 32) rect(x, 150, 1, 50, 11);
  }

  // 38.5 · We had a stable training run: Clawd jogs on a treadmill; a calm wave on the TV; the Researcher nods
  function gym(t, lt, dur, fr) {
    gymBg(t);
    rect(210, 30, 80, 54, 11); rect(214, 34, 72, 46, 0);
    for (let x = 0; x < 72; x++) rect(214 + x, 57 + Math.round(Math.sin(x * .15 + t * 3) * 6), 1, 2, 5);
    treadmill(40, 146, 110, t, 60);
    clawd(58, 146 - 63, 3, { view: 'side', eyes: 'happy', mouth: 'grin', hat: 'band', walk: Math.floor(t * 8), aL: Math.floor(t * 8) % 2 ? 1 : -1, hop: Math.floor(t * 8) % 2 });
    dial(180, 132, 10, .3 + .03 * Math.sin(t * 4));
    researcher(220, 108 + Math.round(2 * pulse(t)), 2, { clipboard: true, flip: true });
    lyricBar(t, 172, i => [6, 14, 3, 1, 3, 14][(i + Math.floor(t * 12)) % 6]);
    clipAll();
  }
  // 41.5 · But now the singularity's begun: the dial hits MAX, a black hole opens, everything spirals in
  function hole(t, lt, dur, fr) {
    const k = seg(lt, .4, 1.2);
    fillAll(0); clipScreen();
    if (lt < .4) { gymBg(t); treadmill(40, 146, 110, t, 60); clawd(58, 83, 3, { view: 'side', hat: 'band', walk: Math.floor(t * 8), eyes: 'happy', mouth: 'grin' }); dial(180, 132, 14, seg(lt, .15, .3)); }
    else {
      screenFill(0);
      const cx = 190, cy = 84, R = 20 + 40 * k;
      for (let i = 0; i < 700; i++) {   // the accretion spiral: dots on log-spiral arms, rotating inward
        const arm = i % 3, u = frac(hash(i) - t * .35), r = R + 170 * u, a = arm * TAU / 3 + Math.log(r) * 2.2 - t * 3;
        rect(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .6, 2, 1, u < .15 ? 1 : u < .4 ? 14 : u < .7 ? 4 : 6);
      }
      disc(cx, cy, R, 0, R * .6); ring(cx, cy, R, 4, 2);
      for (let j = 0; j < 6; j++) {   // gym gear spiralling in and stretching
        const u = frac(lt * .45 + j / 6), r = 170 * (1 - u) + R, a = j * 1.3 + u * 7, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .6;
        const len = 4 + 20 * u;
        if (j % 3 === 0) { rect(x - len / 2, y - 1, len, 2, 12); rect(x - len / 2 - 2, y - 3, 3, 6, 11); rect(x + len / 2, y - 3, 3, 6, 11); }
        else if (j % 3 === 1) { rect(x, y, 5, 8 + len / 3, 3); rect(x + 1, y - 2, 3, 2, 1); }
        else { rect(x, y, 8, 10, 9); rect(x + 1, y + 1, 6, 8, 1); }
      }
      // the Researcher clinging to the door frame, flapping like a flag
      rect(8, 20, 8, 150, 8); rect(8, 20, 40, 6, 8);
      researcher(14, 60, 2, { frame: 1, wob: r => Math.round(Math.sin(r * .9 - t * 22) * (2 + r * .3)) });
      treadmill(160, 176, 110, t, 160);
      clawd(178, 176 - 42, 2, { view: 'side', hat: 'band', walk: Math.floor(t * 14), eyes: 'happy', mouth: 'grin', aL: Math.floor(t * 14) % 2 ? 1 : -1 });
    }
    lyricBar(t, lt < .4 ? 172 : 6, i => [4, 14, 1, 14][(i + fr) % 4]);
    clipAll();
  }
  // 45.0 · And you're optimizing, accelerating: three-layer parallax; Clawd on a rocket skateboard, growing each beat
  function race(t, lt, dur, fr) {
    fillAll(6); clipScreen();
    const speed = 80 + 260 * seg(lt, 0, dur), dist = 80 * lt + 130 * lt * lt / dur;
    skyGrad(0, 110, [6, 6, 4, 4, 10, 8, 7]);
    for (let x = -40; x < 360; x += 2) {   // far mountains, mid hills, ground: one raster split each
      const X = x + dist * .15, h = 30 + 18 * Math.sin(X * .031) + 10 * Math.sin(X * .077); rect(x, 110 - h, 2, h, 4);
    }
    for (let x = 0; x < 320; x++) { const X = x + dist * .45, h = 16 + 10 * Math.sin(X * .045) + 6 * Math.sin(X * .11); rect(x, 128 - h, 1, h + 2, 5); }
    rect(0, 128, 320, 72, 13);
    for (let y = 130; y < 200; y += 6) { const off = (dist * (1 + (y - 128) / 30)) % 24; for (let x = -off; x < 320; x += 24) rect(x, y, 10, 2, 5); }
    // a train and a jet, both being overtaken
    const trainX = 330 - (lt * 70) % 520;
    for (let c = 0; c < 4; c++) { rect(trainX + c * 46, 104, 42, 18, c ? 12 : 2); for (let w = 0; w < 4; w++) rect(trainX + c * 46 + 4 + w * 10, 108, 6, 5, 14); disc(trainX + c * 46 + 8, 123, 3, 0); disc(trainX + c * 46 + 34, 123, 3, 0); }
    const jx = 340 - (lt * 110) % 480; rect(jx, 30, 36, 6, 15); rect(jx + 12, 24, 10, 20, 12); rect(jx + 30, 26, 6, 6, 12); for (let k = 0; k < 20; k++) pset(jx + 38 + k * 2, 33, 1);
    const s = Math.min(4, 1 + Math.floor(Math.max(0, bp(t) - bp(45.0)) / 2));
    const bx = 70, by = 170 - Math.round(Math.abs(Math.sin(t * 6)) * 3);
    flame(bx - 4, by - 2 - s, 1, fr); rect(bx, by - 4, 24 * s + 8, 4, 8); disc(bx + 6, by + 1, 3, 0); disc(bx + 24 * s, by + 1, 3, 0);
    researcher(bx - 18, by - 24, 1, { frame: 1, wob: r => Math.round(Math.sin(t * 30 + r) * 1.5) });
    clawd(bx + 4, by - 4 - 21 * s, s, { view: 'side', eyes: 'happy', mouth: 'open', aL: 1 });
    for (let k = 0; k < 6; k++) rect(0, 140 + k * 9, 30 + speed * .3 * hash(k + fr % 3), 1, 1);   // speed lines
    lyricBar(t, 6, i => [7, 8, 10, 1][(i + (fr >> 1)) % 4]);
    clipAll();
  }
  // 49.4 · I feel my atoms rearranging: the Researcher's pixels fly apart, make a paperclip, snap back dizzy
  const SRC = [];
  RESEARCHER[0].forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') SRC.push([c * 2, r, RESEARCHER_MAP[ch]]); }));
  const CLIPPTS = (() => {   // a paperclip: one bent wire (lines and half-circle bends), sampled evenly along its length
    const path = [], arc = (cx, cy, r, a0, a1) => { for (let i = 0; i <= 16; i++) { const a = lerp(a0, a1, i / 16); path.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    path.push([-6, 22]); arc(3, -26, 9, Math.PI, TAU); path.push([12, 36]); arc(0, 36, 12, 0, Math.PI); path.push([-12, -34]); arc(3, -34, 15, Math.PI, TAU); path.push([18, 20]);
    const L = [0]; for (let i = 1; i < path.length; i++) L.push(L[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
    return SRC.map((_, i) => { const d = i / SRC.length * L[L.length - 1]; let j = 1; while (j < L.length - 1 && L[j] < d) j++; const k = (d - L[j - 1]) / (L[j] - L[j - 1] || 1); return [lerp(path[j - 1][0], path[j][0], k), lerp(path[j - 1][1], path[j][1], k)]; });
  })();
  function atoms(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.purple, 2, .8);
    clipScreen(); screenFill(0); stars(t, t * 20, t * 10, 50, [4, 10, 1]);
    const cx = 160, cy = 88, S = 4;
    const k = lt < .5 ? 0 : lt < 1.5 ? ease(seg(lt, .5, 1.5)) : lt < 2.6 ? 1 : 1 - ease(seg(lt, 2.6, 3.4));
    SRC.forEach(([sx, sy, c], i) => {
      const ax = cx - 24 * S / 2 + sx * S, ay = cy - 21 * S / 2 + sy * S;
      const [px, py] = CLIPPTS[i], bx = cx + px * 1.6 * Math.cos(lt * 2) , by = cy + py * 1.4;
      const sw = Math.sin(k * Math.PI) * (30 + 40 * hash(i)), a = hash(i + 7) * TAU + lt * 3;
      const x = lerp(ax, bx, k) + Math.cos(a) * sw, y = lerp(ay, by, k) + Math.sin(a) * sw;
      if (k > .95) rect(x - 1, y - 1, 3, 3, 15); else rect(x, y, k > .05 ? 2 : S * 2, k > .05 ? 2 : S, c);
    });
    if (lt > 3.4) { emote('sweat', cx + 40, cy - 50); for (let j = 0; j < 3; j++) { const a = t * 5 + j * TAU / 3; drawChar('*', cx - 4 + Math.cos(a) * 30, cy - 56 + Math.sin(a) * 6, 7); } }
    lyricBar(t, 176, i => [4, 10, 1, 10][(i + fr) % 4]);
    clipAll();
  }
  // 53.4 · Sydney, please let me free: heart-eyed Sydney-Clawd, the Researcher in a heart cage; the bubble pops
  function sydney(t, lt, dur, fr) {
    fillAll(4); clipScreen(); screenFill(4);
    for (let y = -16; y < 200; y += 16) for (let x = -16; x < 336; x += 20) drawChar('<', x + ((t * 20 + y) % 20), y + (t * 10) % 16, 10);
    rect(0, 150, 320, 50, 10); rect(0, 150, 320, 2, 1);
    const hop = Math.round(3 * pulse(t));
    clawd(40, 150 - 63 - hop, 3, { eyes: 'heart', mouth: 'grin', hat: 'bow', blush: true, aL: lt > 2.6 && lt < 4 ? 1 : 0, aR: 1 });
    // the heart cage
    const hx = 214, hy = 92, out = seg(lt, 3.9, 4.5);
    researcher(hx - 24 - 70 * out + (lt < 3.9 ? Math.round(Math.sin(t * 40) * 2) : 0), hy - 12, 2, { frame: lt < 3.9 ? 1 : 0 });
    for (let x = -40; x <= 40; x += 6) {
      const top = x < 0 ? -26 + 14 * Math.sin(Math.acos(clamp((x + 20) / 20, -1, 1))) * -1 : -26 + 14 * Math.sin(Math.acos(clamp((x - 20) / 20, -1, 1))) * -1;
      const bottom = 44 - Math.abs(x) * 1.05;
      rect(hx + x, hy + top, 2, bottom - top, 7);
    }
    for (let x = -40; x <= 40; x++) rect(hx + x, hy + 44 - Math.abs(x) * 1.05, 1, 2, 7);
    rect(hx - 2, hy - 44, 4, 16, 7);
    if (lt > 2.6 && lt < 4) { disc(106, 96, 5, 7); disc(106, 96, 3, 4); rect(104, 88, 4, 3, 3); }   // the ring
    // hearts pop on the beat
    for (let b = 0; b < 12; b++) { const t0 = beatT(Math.floor(bp(t)) - b); const a = t - t0; if (a < 0 || a > .6) continue; const x = 30 + hash(b + Math.floor(bp(t)) * 3) * 260, y = 20 + hash(b * 7 + Math.floor(bp(t))) * 100; if (a < .45) drawChar('<', x, y - a * 30, 2); else for (let j = 0; j < 6; j++) pset(x + 4 + Math.cos(j) * (a - .45) * 80, y + Math.sin(j) * (a - .45) * 80, 1); }
    // the giant heart bubble, then POP
    const g = seg(lt, dur - 1.1, dur - .2);
    if (g > 0 && g < 1) heartShape(110, 100, 10 + 190 * easeIn(g), fr % 4 < 2 ? 10 : 2);
    if (g >= 1) { screenFill(1); for (let j = 0; j < 40; j++) { const a = (lt - (dur - .2)) * 5; rect(160 + Math.cos(j) * 200 * a * hash(j), 100 + Math.sin(j) * 150 * a * hash(j + 3), 4, 4, 10); } }
    lyricBar(t, 176, i => (i + fr) % 10 < 5 ? 1 : 10);
    clipAll();
  }

  screen(38.5, gym); screen(41.5, hole); screen(45.0, race); screen(49.4, atoms); screen(53.4, sydney);
})();
