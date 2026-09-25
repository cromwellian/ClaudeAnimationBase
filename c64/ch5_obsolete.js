// ch5_obsolete.js: 5 · Obsolete (73–95.4). Parchment museum, ochre road, sky, a glowing chasm.
(() => {
  function parchment() { screenFill(15); for (let y = 0; y < 200; y += 3) for (let x = (y * 7) % 11; x < 320; x += 11) pset(x, y, 12); }

  // 73.0 · Forward MLP, backward, repeat: the Clawds ARE the net; a pulse flows forward and back, and they step with it
  function mlp(t, lt, dur, fr) {
    fillAll(9); clipScreen(); parchment();
    const layers = [[60, 3], [160, 4], [260, 3]], pos = [];
    layers.forEach(([x, n], L) => { pos[L] = []; for (let i = 0; i < n; i++) pos[L].push([x, 26 + (i + .5) * (130 / n)]); });
    for (let L = 0; L < 2; L++) for (const a of pos[L]) for (const b of pos[L + 1]) line(a[0], a[1], b[0], b[1], 11);
    // forward on beats 0–1 of each bar, backward on 2–3
    const bb = frac(bp(t) / 4) * 4, fwd = bb < 2, p = fwd ? bb / 2 : 2 - (bb - 2) / 2;   // p: 0 = input, 1 = output
    const at = p * 2, lit = Math.round(at);
    for (let L = 0; L < 2; L++) for (const a of pos[L]) for (const b of pos[L + 1]) { const u = clamp(at - L); if (u > 0 && u < 1) rect(lerp(a[0], b[0], u) - 2, lerp(a[1], b[1], u) - 2, 4, 4, fwd ? 7 : 2); }
    pos.forEach((col, L) => col.forEach(([x, y], i) => {
      const step = Math.round((fwd ? 1 : -1) * 4 * pulse(t, 5));
      clawd(x - 12 + step, y - 12, 1, { eyes: L === lit ? 'happy' : 'normal', mouth: L === lit ? 'grin' : null, aL: L === lit ? 1 : 0, aR: L === lit ? 1 : 0, map: L === lit ? { b: 7 } : {} });
    }));
    researcher(148, 150, 1, { frame: fwd ? 1 : 0 });
    lyricBar(t, 176, i => (i + fr) % 12 < 6 ? 9 : 8, { bg: 15 });
    clipAll();
  }
  // 77.5 · Now von Neumann's obsolete: the vacuum-tube computer sputters out; a sheet over it; a spider drops
  function museum(t, lt, dur, fr) {
    fillAll(9); clipScreen(); screenFill(8);
    for (let x = 0; x < 320; x += 64) { rect(x + 4, 0, 14, 150, 15); rect(x + 2, 0, 18, 6, 12); }
    rect(0, 150, 320, 50, 9); for (let x = 0; x < 320; x += 24) rect(x, 150, 1, 50, 8);
    const dead = lt > 1.5, flick = lt > 1.1 && lt < 1.5;
    rect(40, 40, 150, 110, 12); rect(44, 44, 142, 102, 11);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) {
      const on = dead ? false : flick ? hash(fr * 3 + r * 10 + c) > .6 : hash(Math.floor(t * 8) + r * 10 + c) > .45;
      disc(54 + c * 13, 54 + r * 12, 3, on ? [7, 2, 5, 1][(r + c) % 4] : 0);
    }
    for (let c = 0; c < 5; c++) { rect(56 + c * 26, 126, 10, 16, 15); disc(61 + c * 26, 126, 5, dead ? 12 : 7); }   // tubes
    if (flick || (dead && lt < 2.2)) for (let k = 0; k < 5; k++) { const a = frac(lt * 1.5 + k / 5); disc(70 + k * 25 + Math.sin(a * 6) * 4, 40 - a * 40, 4 + a * 6, a > .6 ? 12 : 11); }
    const sheet = ease(seg(lt, 2.4, 2.8));
    if (sheet > 0) { rect(36, 36, 158, 116 * sheet, 1); for (let x = 40; x < 190; x += 12) rect(x, 36, 1, 116 * sheet, 15); }
    for (let x = 0; x < 200; x++) rect(x + 20, 150 + Math.round(Math.sin(x / 200 * Math.PI) * 6), 1, 3, 2);   // velvet rope
    rect(18, 128, 4, 26, 7); rect(218, 128, 4, 26, 7);
    // guide-Clawd wheels in the sleek new model
    const wx = lerp(330, 236, ease(seg(lt, .2, 1.1)));
    rect(wx - 4, 140, 70, 6, 12); disc(wx + 4, 148, 3, 0); disc(wx + 56, 148, 3, 0);
    clawd(wx + 8, 140 - 42, 2, { eyes: 'happy', mouth: 'grin', hat: 'halo', map: { b: 3, d: 14 } });
    clawd(wx + 64, 150 - 21, 1, { eyes: 'normal', aR: 1, hat: 'fedora' });
    if (lt > 3.0) { const y = 20 + 70 * ease(seg(lt, 3.0, 3.4)) + Math.sin(t * 4) * 3; rect(114, 0, 1, y, 15); disc(114, y, 4, 0); for (let k = -1; k <= 1; k += 2) for (let j = 0; j < 3; j++) line(114, y, 114 + k * 8, y - 3 + j * 3, 0); }
    lyricBar(t, 172, i => (i + fr) % 10 < 5 ? 7 : 1);
    clipAll();
  }
  // 81.4 · Sharp left turn and there you are: a raster road, a hairpin, the Researcher flung off, standing there dazed
  function road(t, lt, dur, fr) {
    fillAll(14); clipScreen();
    const H0 = 76, turnK = seg(lt, 1.6, 2.2), curve = lt < 1.6 ? .3 * Math.sin(lt * 2) : lt < 2.4 ? -3.2 * Math.sin(turnK * Math.PI) : 0;
    const dist = lt * 14, whip = lt > 1.7 && lt < 2.2 ? Math.round(Math.sin(turnK * Math.PI) * 60) : 0;
    for (let y = 0; y < H0; y++) rect(0, y, 320, 1, y < 30 ? 14 : y < 55 ? 3 : 7);
    for (let x = 0; x < 320; x += 2) { const h = 6 + 5 * Math.sin((x + whip * 3) * .05); rect(x, H0 - h, 2, h, 8); }
    let cx = 160 + whip, dx = 0;
    for (let y = 199; y >= H0; y--) {   // one raster line of road at a time: perspective width, bend, stripes
      const z = 60 / (y - H0 + 1), stripe = Math.floor(z * 2 + dist) % 2;
      dx += curve * z * .08; cx += dx;
      const w = (y - H0) * 2.4;
      rect(0, y, 320, 1, stripe ? 5 : 13);
      rect(cx - w, y, 2 * w, 1, stripe ? 11 : 12);
      rect(cx - w - w * .12, y, w * .12, 1, stripe ? 2 : 1); rect(cx + w, y, w * .12, 1, stripe ? 2 : 1);
      if (stripe) rect(cx - w * .03, y, w * .06, 1, 1);
    }
    if (lt > .6 && lt < 1.7) {   // the hairpin sign, rushing up
      const k = seg(lt, .6, 1.6), s = 1 + Math.floor(k * 4), y = lerp(H0 + 4, 140, k * k), x = lerp(200, 300, k * k);
      rect(x, y, 2 * s, 16 * s, 12);
      for (let r = 0; r < 8 * s; r++) rect(x - 8 * s + Math.abs(r - 4 * s), y - 8 * s + r, 2 * (8 * s - Math.abs(r - 4 * s)), 1, 7);
      drawChar('<', x - 4 * s + 1, y - 4 * s - 4, 0, s, s);
    }
    // the kart, from behind
    const kx = 136 - Math.round(curve * 6), ky = 150;
    rect(kx - 4, ky + 20, 56, 12, 2); disc(kx, ky + 32, 5, 0); disc(kx + 48, ky + 32, 5, 0);
    clawd(kx, ky - 16, 2, { view: 'back' });
    const fling = seg(lt, 1.9, 2.8);
    if (lt < 1.9) researcher(kx + 12, ky - 30, 1, { frame: 1, wob: r => Math.round(Math.sin(t * 30 + r) * 1.5) });
    else if (fling < 1) { const p = [lerp(kx + 12, 240, fling), lerp(ky - 30, 110, fling) - 90 * 4 * fling * (1 - fling)]; researcher(p[0], p[1], 1, { frame: 1, flip: frac(lt * 6) > .5 }); }
    else { researcher(236, 104, 2, { frame: 0 }); for (let j = 0; j < 3; j++) { const a = t * 6 + j * TAU / 3; drawChar('*', 256 + Math.cos(a) * 16, 96 + Math.sin(a) * 4, 7); } }
    for (let k = 0; k < 12; k++) if (lt > 1.6 && lt < 2.6) { const a = frac(lt * 3 + k / 12); rect(kx + 24 + (hash(k) - .5) * 100 * a, ky + 30 - 20 * a, 4, 3, 8); }
    lyricBar(t, 6, i => (i + fr) % 8 < 4 ? 7 : 1);
    clipAll();
  }
  // 85.0 · Without a single CDR: the sky full of security-guard clouds, every one fast asleep; Clawd does donuts below
  function clouds(t, lt, dur, fr) {
    fillAll(14); clipScreen(); screenFill(14);
    for (let y = 0; y < 60; y++) if (y % 3 === 0) rect(0, y, 320, 1, 3);
    rect(0, 160, 320, 40, 8); for (let x = 0; x < 320; x += 10) rect(x, 160 + (x % 20 ? 0 : 2), 6, 1, 9);
    for (let k = 0; k < 4; k++) {
      const x = 44 + k * 78 + Math.sin(t * .8 + k) * 4, y = 50 + (k % 2) * 22, roll = k === 2 && lt > 2.4 && lt < 3.2;
      for (const [dx, dy, r] of [[-18, 4, 12], [0, 0, 16], [18, 4, 12], [-8, 10, 12], [10, 10, 12]]) disc(x + dx, y + dy, r, 1, r * .75);
      rect(x - 12, y - 16, 24, 6, 6); rect(x - 12, y - 11, 30, 2, 0); rect(x - 2, y - 15, 4, 3, 7);   // peaked cap
      const e = roll ? 2 : 0;
      rect(x - 9 + e, y + 2, 6, 1, 0); rect(x + 4 + e, y + 2, 6, 1, 0); rect(x - 3 + e, y + 8, 6, 1, 12);
      emote('zzz', x + 16, y - 16 + Math.round(Math.sin(t * 2 + k) * 2));
      // a searchlight, drooping at the ground
      for (let j = 0; j < 60; j++) { const w = 2 + j * .35; for (let i = -w; i < w; i += 2) if ((j + i) % 2 === 0) pset(x + 14 + j * .5 + i, y + 16 + j * 1.4, 7); }
    }
    // Clawd's kart does donuts, honking
    const a = t * 5, kx = 136 + Math.cos(a) * 60, ky = 132 + Math.sin(a) * 8;
    for (let k = 0; k < 24; k++) { const b = a - k * .2; rect(160 + Math.cos(b) * 60, 172 + Math.sin(b) * 8, 4, 2, 9); }
    rect(kx - 4, ky + 26, 56, 12, 2); disc(kx + 4, ky + 38, 5, 0); disc(kx + 44, ky + 38, 5, 0);
    clawd(kx + 4, ky - 12, 2, { view: 'side', flip: Math.sin(a) < 0, eyes: 'happy', mouth: 'open' });
    if (onBeat(t)) emote('!', kx + 54, ky - 20, 7);
    lyricBar(t, 176, i => (i + fr) % 10 < 5 ? 6 : 1, { bg: 14 });
    clipAll();
  }
  // 89.4 · Gato, please don't let me go: Gato-Clawd dangles the Researcher over a chasm… a laser dot… it lets go
  function gato(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.red, 2, .6);
    clipScreen(); screenFill(0);
    for (let y = 120; y < 200; y++) rect(0, y, 320, 1, [9, 2, 2, 8, 8, 10, 7][Math.min(6, Math.floor((y - 120) / 11))]);   // the glowing chasm
    for (let k = 0; k < 20; k++) { const y = 200 - frac(t * .6 + hash(k)) * 90; pset(hash(k + 3) * 320, y, 7); }
    rect(0, 70, 130, 130, 9); for (let y = 70; y < 200; y += 6) rect(124 + Math.round(Math.sin(y) * 3), y, 6, 6, 8);   // the cliff
    rect(0, 68, 130, 3, 5);
    // the laser dot wanders; Gato's eyes follow it; the grip loosens on each beat
    const dx = 200 + Math.sin(t * 2.3) * 80 + Math.sin(t * 5.1) * 20, dy = 40 + Math.cos(t * 1.7) * 26;
    rect(dx - 1, dy - 1, 3, 3, 2); pset(dx, dy, 1);
    const pounce = lt > dur - 1.0, beatsIn = Math.max(0, Math.floor(bp(t) - bp(89.4)));
    const gx = pounce ? lerp(60, 180, ease(seg(lt, dur - 1.0, dur - .5))) : 60, gy = pounce ? 68 - 63 - 40 * Math.sin(seg(lt, dur - 1, dur - .5) * Math.PI) : 68 - 63;
    clawd(gx, gy, 3, { hat: 'cat', eyes: 'normal', look: dx > gx + 36 ? 1 : -1, mouth: pounce ? 'open' : null, aR: pounce ? 1 : -1, aL: 0, view: 'front' });
    const drop = pounce ? seg(lt, dur - .95, dur) : 0;
    const ry = 72 + beatsIn * 2 + 300 * drop * drop;
    researcher(128, ry, 2, { frame: 1, wob: r => Math.round(Math.sin(t * 8 + r * .3) * 2) });
    if (!pounce) rect(134, 70, 8, 6, 10);   // Gato's paw, holding on
    if (drop > .2) emote('!', 146, ry - 14, 7);
    lyricBar(t, 178, i => (i + fr) % 8 < 4 ? 10 : 1);
    clipAll();
  }

  screen(73.0, mlp); screen(77.5, museum); screen(81.4, road); screen(85.0, clouds); screen(89.4, gato);
})();
