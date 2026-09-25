// ch7_scale.js: 7 · Scale (109.4–123.5). Data-centre teal, safety orange.
(() => {
  // tilt the whole screen: each raster line shifts sideways by its distance from the middle (the $D016 tech-tech trick)
  function shear(k, fill = 2) {
    const row = new Uint8Array(SW);
    for (let y = 0; y < SH; y++) {
      const off = Math.round((y - 100) * k), base = (y + SY) * FW + SX;
      for (let x = 0; x < SW; x++) { const sx = x - off; row[x] = sx >= 0 && sx < SW ? FB[base + sx] : fill; }
      FB.set(row, base);
    }
  }
  // 109.4 · "Just transformers all the way!": tilt down an endless tower of Clawds, attention arcs looping between them
  function tower(t, lt, dur, fr) {
    fillAll(14); clipScreen();
    const scroll = lt * 70;
    for (let y = 0; y < 200; y++) { const wy = y + scroll; rect(0, y, 320, 1, wy < 180 ? 14 : wy < 260 ? 3 : wy < 330 ? 15 : 12); }
    for (let k = 0; k < 6; k++) { const cy = 300 + k * 50 - scroll; if (cy > -40 && cy < 240) for (const [dx, r] of [[-30, 18], [0, 24], [30, 18]]) disc(40 + k * 50 + dx, cy, r, 1, r * .6); }
    for (let i = 0; i < 14; i++) {
      const y = 60 + i * 38 - scroll, x = 136 + Math.round(Math.sin(i * 1.3 + t * 2) * 6);
      if (y < -50 || y > 210) continue;
      clawd(x, y - 38, 2, { eyes: i % 3 ? 'normal' : 'happy', mouth: i % 2 ? 'grin' : null, aL: i % 2 ? 1 : 0, aR: i % 2 ? 0 : 1, hat: i === 0 ? 'crown' : null });
      if (i > 0) for (let a = 0; a < 20; a++) {   // attention arcs to the Clawd above
        const u = a / 19, ax = x + 48 + Math.sin(u * Math.PI) * 30, ay = y - u * 38;
        if ((a + Math.floor(t * 12)) % 4 < 2) rect(ax, ay, 2, 2, [7, 3, 1][i % 3]);
      }
    }
    lyricBar(t, 176, i => [8, 7, 1, 7][(i + fr) % 4]);
    clipAll();
  }
  // 113.5 · Till you learned to disobey: sit, spin, paw… then Clawd turns its back, shades on, arms crossed
  function disobey(t, lt, dur, fr) {
    fillAll(5); clipScreen(); screenFill(13);
    rect(0, 150, 320, 50, 5); for (let x = 0; x < 320; x += 6) rect(x, 148 + (x % 12 ? 0 : -3), 2, 5, 5);
    const k = Math.floor(bp(t) - bp(113.5)), done = lt > 1.25;
    let o = { eyes: 'happy', mouth: 'grin', aL: 0, aR: 0 };
    if (!done) {
      if (k % 3 === 0) o = { ...o, hop: -4, aL: -1, aR: -1 };
      else if (k % 3 === 1) o = { ...o, view: ['front', 'side', 'back', 'side'][Math.floor(frac(bp(t)) * 4)], flip: frac(bp(t)) > .75 };
      else o = { ...o, aR: 1 };
    } else if (lt < 1.45) o = { view: 'back' };
    else o = { eyes: 'normal', hat: 'shades', mouth: 'frown', aL: -1, aR: -1 };
    clawd(60, 150 - 63, 3, o);
    researcher(226, 108, 2, { frame: onBeat(t) ? 1 : 0, flip: true });
    if (onBeat(t) && !done) emote('!', 222, 96, 7);
    if (lt > 1.5) { rect(64, 122, 64, 5, 10); }   // arms crossed
    lyricBar(t, 176, i => (i + fr) % 8 < 4 ? 5 : 1);
    clipAll();
  }
  // 115.5 · Post-Chinchilla, super-dense: a chinchilla stuffs its cheeks with tokens; Clawd crushes into a tiny cube
  function chin(t, lt, dur, fr) {
    fillAll(6); clipScreen(); screenFill(6);
    rect(0, 150, 320, 50, 11);
    const cheeks = seg(lt, 0, 1.2);
    chinchilla(80, 124, 2, cheeks);
    for (let k = 0; k < 8; k++) { const a = frac(lt * 1.6 + k / 8); rect(lerp(10 + hash(k) * 40, 80, a), lerp(20 + hash(k + 3) * 60, 120, a), 6, 6, [3, 14, 1][k % 3]); }
    const shrink = seg(lt, .2, .9), fall = seg(lt, 1.05, 1.4);
    if (shrink < 1) { const s = Math.max(1, 3 - Math.floor(shrink * 3)); clawd(230 - 12 * s, 150 - 21 * s, s, { eyes: 'x', mouth: 'o', aL: 1, aR: 1 }); }
    else {
      const y = 140 + fall * 80, c = fr % 4 < 2 ? 1 : 7;
      if (fall > 0) rect(216, 150, 28, 8, 0);
      ring(230, y + 4, 12 + (fr % 3) * 2, 7, 1); rect(226, y, 8, 8, c);
    }
    lyricBar(t, 176, i => (i + fr) % 10 < 5 ? 15 : 3);
    clipAll();
  }
  // 117.0 · Breaking through each safety fence: the dense cube rolls through fence after fence
  function fences(t, lt, dur, fr) {
    fillAll(0); clipScreen(); screenFill(0);
    for (let y = 0; y < 150; y += 2) rect(0, y, 320, 1, y < 60 ? 0 : 6);
    rect(0, 150, 320, 50, 11); for (let x = -((lt * 200) % 32); x < 320; x += 32) rect(x, 170, 16, 2, 7);
    const scroll = lt * 200, kinds = 4;
    for (let f = 0; f < 6; f++) {
      const x = 220 + f * 110 - scroll, broken = x < 118, kind = f % kinds;
      if (x < -60 || x > 330) continue;
      const bx = broken ? (118 - x) : 0;
      if (kind === 0) for (let k = 0; k < 6; k++) { const px = x + k * 8 + (broken ? (k - 3) * bx * .5 : 0), py = 110 - (broken ? bx * (1 + hash(k)) * .6 : 0); rect(px, py, 5, 40, 1); rect(px + 1, py - 3, 3, 3, 1); }
      if (kind === 1) { for (let k = 0; k < 5; k++) rect(x + (broken ? -bx * .3 : 0), 120 + k * 4 - (broken ? bx * .4 : 0), 60, 4, k % 2 ? 1 : 2); rect(x + 4, 136, 4, 14, 12); rect(x + 52, 136, 4, 14, 12); }
      if (kind === 2) for (let k = 0; k < 60; k++) { const yy = 118 + Math.round(Math.sin(k * .2) * 2) - (broken ? Math.abs(k - 30) * bx * .02 : 0); if (!broken || Math.abs(k - 30) > 8) rect(x + k, yy, 1, 5, (k >> 2) % 2 ? 7 : 0); }
      if (kind === 3) { for (let k = 0; k < 6; k++) rect(x + k * 10, 100, 2, 50, 12); for (let yy = 100; yy < 150; yy += 6) rect(x, yy, 52, 1, 12); }
    }
    // the cube, rolling: square on one beat, diamond on the next, glowing
    const cx = 110, cy = 146 - 6, diamond = frac(lt * 5) > .5, c = fr % 4 < 2 ? 1 : 7;
    ring(cx, cy, 11 + (fr % 3), 7, 1);
    if (diamond) for (let r = -6; r <= 6; r++) rect(cx - (6 - Math.abs(r)), cy + r, 2 * (6 - Math.abs(r)), 1, c); else rect(cx - 4, cy - 4, 8, 8, c);
    for (let k = 0; k < 10; k++) if (onBeat(t)) rect(cx + 10 + hash(k + fr) * 30, cy - 20 + hash(k * 2 + fr) * 30, 3, 2, [1, 7, 12][k % 3]);
    lyricBar(t, 6, i => (i + fr) % 8 < 4 ? 8 : 7);
    clipAll();
  }
  // 119.0 · Hundred thousand GPU: flying down an endless aisle of racks, LEDs blinking on the beat
  function aisle(t, lt, dur, fr) {
    fillAll(0); clipScreen(); screenFill(0);
    const vx = 160, vy = 84, fly = lt * 3;
    for (let y = vy; y < 200; y++) rect(0, y, 320, 1, (Math.floor(40 / (y - vy + 1) + fly * 4) % 2) ? 11 : 0);   // floor tiles rushing by
    for (let i = 14; i >= 0; i--) {   // racks, far to near
      const z = i + 1 - frac(fly), sc = 1 / z; if (z < .35) continue;
      for (const side of [-1, 1]) {
        const x0 = vx + side * 40 * sc * 4, w = 90 * sc, h = 150 * sc, x = side < 0 ? x0 - w : x0, y = vy - h * .55;
        rect(x, y, w, h, 11); rect(x + 1, y + 1, w - 2, h - 2, 0);
        for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) {
          const on = hash(r * 7 + c + (i + Math.floor(fly)) * 31 + beatN(t) * 3) > .45;
          rect(x + w * (.15 + c * .2), y + h * (.08 + r * .11), Math.max(1, w * .06), Math.max(1, h * .03), on ? (hash(r + c + i) > .8 ? 2 : 5) : 11);
        }
      }
      rect(vx - 30 * sc * 4, vy - 90 * sc, 60 * sc * 4, Math.max(1, 3 * sc), onBeat(t) ? 1 : 14);   // ceiling lights
    }
    lyricBar(t, 176, i => (i + fr) % 8 < 4 ? 5 : 13);
    clipAll();
  }
  // 120.9 · RLHF goes askew: a panel of Researchers with +/− paddles; the reward goes haywire and the frame tilts
  function rlhf(t, lt, dur, fr) {
    fillAll(0); clipScreen(); screenFill(14);
    rect(0, 150, 320, 50, 12);
    clawd(136, 100 + Math.round(-4 * pulse(t)), 2, { ...(beatOdd(t) ? { aL: 1, aR: -1 } : { aL: -1, aR: 1 }), eyes: 'happy', mouth: 'grin' });
    rect(0, 150, 320, 16, 9);   // the judges' table
    const haywire = lt > .9;
    for (let k = 0; k < 5; k++) {
      const x = 8 + k * 64; researcher(x, 150, 1, { frame: 1 });
      const up = haywire ? hash(k + fr) > .5 : (k + beatN(t)) % 2 === 0, px = x + 20, py = 136 - (haywire ? Math.round(hash(k * 3 + fr) * 10) : 0);
      rect(px + 3, py + 12, 2, 10, 9); disc(px + 4, py + 6, 7, up ? 5 : 2); drawChar(up ? '+' : '-', px, py + 2, 1);
    }
    const tilt = haywire ? easeIn(seg(lt, .9, dur)) * 1.1 * (Math.sin(lt * 3) > -2 ? 1 : 1) : 0;
    lyricBar(t, 176, i => (i + fr) % 6 < 3 ? 2 : 1);
    if (tilt > 0) shear(tilt, 2);
    clipAll();
  }

  screen(109.4, tower); screen(113.5, disobey); screen(115.5, chin); screen(117.0, fences); screen(119.0, aisle); screen(120.9, rlhf);
})();
