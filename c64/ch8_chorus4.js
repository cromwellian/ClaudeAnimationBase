// ch8_chorus4.js: 8 · Chorus 4, "Red alert" (123.5–140.5). Alarm red and black, then the reveal: it's a stage.
(() => {
  // 123.5 · I'm upping my P(doom): red alert, siren beams, frantic pumping; the meter hits 99.9 and the glass cracks
  function stage4(t, lt, dur, fr) {
    chorusStage(t, lt, dur, fr, { from: 86, to: 99.9, drop: 123.5, variant: 4 });
    if (lt < .15) { clipScreen(); screenFill(2); clipAll(); }   // in from the red slide
  }
  // 126.0 · Just as foretold by Loom: the loom's threads burst off and branch into a glowing tree of futures
  function tree(x, y, a, len, d, p, fr) {   // p: how many levels have grown so far (fractional)
    if (d === 0 || p <= 0) return;
    const g = clamp(p), x2 = x + Math.cos(a) * len * g, y2 = y + Math.sin(a) * len * g;
    line(x, y, x2, y2, [7, 13, 3, 1, 14, 7, 1, 13][d % 8], Math.max(1, d >> 1));
    if (d <= 2 && g >= 1) rect(x2 - 1, y2 - 1, 3, 3, (fr + d) % 6 < 3 ? 1 : 7);
    if (g >= 1) { const sp = .42 + .08 * Math.sin(fr * .05 + d); tree(x2, y2, a - sp, len * .76, d - 1, p - 1, fr); tree(x2, y2, a + sp * 1.1, len * .72, d - 1, p - 1.15, fr); }
  }
  function loom(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.purple, 2, .7);
    clipScreen(); screenFill(0); stars(t, t * 4, 0, 50);
    const burst = seg(lt, .8, 1.9);
    rect(40, 90, 6, 60, 9); rect(150, 90, 6, 60, 9); rect(40, 88, 116, 6, 8); rect(40, 146, 116, 4, 8);   // the loom
    for (let k = 0; k < 16; k++) { const x = 50 + k * 6.4; if (burst < .05) rect(x, 94, 1, 52, RAINBOW[k % 10]); }
    const sx = 50 + 90 * Math.abs(Math.sin(bp(t) * Math.PI / 2)); rect(sx - 8, 116, 16, 5, 7);   // the shuttle, flying on the beat
    clawd(0, 150 - 42, 2, { hat: 'hood', eyes: 'closed', mouth: null, aR: beatOdd(t) ? 1 : 0 });
    if (burst > 0) {
      tree(100, 90, -Math.PI / 2, 30, 8, burst * 9, fr);
      const k = seg(lt, 1.3, dur);   // one branch races at the camera, thickening as it comes
      for (let i = 0; i < 20 * k; i++) { const u = i / 20; line(100 + u * 180, 60 + u * 120, 100 + (u + .05) * 180, 60 + (u + .05) * 120, 7, 1 + Math.round(u * 10)); }
    }
    rect(0, 150, 320, 50, 11);
    lyricBar(t, 172, i => [4, 14, 1, 7][(i + fr) % 4]);
    clipAll();
  }
  // 128.0 · From masked pre-training days: sepia flashback, film scratches, baby Clawd at the desk: THE CAT SAT ON THE [MASK]
  function flashback(t, lt, dur, fr) {
    fillAll(9); clipScreen(); screenFill(8);
    rect(30, 16, 260, 86, 9); rect(34, 20, 252, 78, 0); rect(26, 100, 268, 4, 9);   // chalkboard
    text('THE CAT SAT', 60, 32, 7, { sx: 2, sy: 2 });
    text('ON THE', 60, 58, 7, { sx: 2, sy: 2 });
    const wrote = lt > .8;
    text('[MASK]', 164, 58, wrote ? 9 : 7, { sx: 2, sy: 2 });
    if (wrote) { line(162, 66, 262, 66, 7, 2); text('MAT!', 180, 78, 1, { sx: 2, sy: 1, n: Math.ceil(seg(lt, .8, 1.2) * 4) }); }
    rect(90, 150, 140, 8, 9); rect(100, 158, 6, 30, 9); rect(214, 158, 6, 30, 9);   // the desk
    clawd(136, 150 - 42 + (wrote ? -Math.round(3 * pulse(t)) : 0), 2, { hat: 'mask', eyes: wrote ? 'happy' : 'normal', mouth: wrote ? 'grin' : null, aR: wrote ? 1 : 0, map: { b: 8, d: 9, p: 7 } });
    for (let k = 0; k < 3; k++) { const x = hash(fr * 3 + k) * 320; rect(x, 0, 1, 200, hash(fr + k) > .5 ? 7 : 9); }   // film scratches
    for (let k = 0; k < 12; k++) pset(hash(fr * 7 + k) * 320, hash(fr * 5 + k) * 200, 0);
    lyricBar(t, 176, i => (i + fr) % 12 < 6 ? 7 : 8, { bg: 9 });
    clipAll();
  }
  // 130.0 · To recursive self-upgrade: each Clawd hammers a bigger Clawd together around itself; hats upgrade
  function recursive(t, lt, dur, fr) {
    fillAll(6); borderBars(t, BARS.gold, 2);
    clipScreen(); screenFill(0); stars(t, 0, 0, 40);
    const hats = [null, 'party', 'crown', 'halo', 'crown', 'halo'];
    const levels = Math.min(5, 1 + Math.floor(Math.max(0, bp(t) - bp(130.0)) / 1));
    for (let s = levels; s >= 1; s--) {   // biggest first; each inner one drawn inside the last
      const w = 24 * s, h = 21 * s, newest = s === levels;
      clawd(160 - w / 2, 190 - h, s, { hat: hats[s], eyes: newest ? 'happy' : 'normal', mouth: newest ? 'grin' : null, aL: s % 2 ? 1 : 0, aR: s % 2 ? 0 : 1, map: newest && onBeat(t) ? { b: 7 } : {} });
    }
    if (onBeat(t)) for (let k = 0; k < 10; k++) rect(160 + (hash(k + fr) - .5) * 24 * levels * 2, 190 - 21 * levels + hash(k * 3 + fr) * 21 * levels, 2, 2, 7);
    lyricBar(t, 6, i => [7, 1, 7, 8][(i + fr) % 4]);
    clipAll();
  }
  // 132.0 · What did Ilya see? We'll never know: light leaks round a door; eyes swirl; SLAM, chains, padlock; one spotlight
  function ilya(t, lt, dur, fr) {
    fillAll(0); clipScreen(); screenFill(0);
    const slam = 134.35, shut = t > slam, dark = lt > 3.4;
    const dx = 150, dy = 40, dw = 60, dh = 110;
    if (!dark) {
      for (let y = 0; y < 150; y += 2) rect(0, y, 320, 1, 11 * (y % 8 === 0));
      rect(0, 150, 320, 50, 11);
      if (!shut) for (let j = 0; j < 90; j++) for (let i = -j * .5; i < j * .5; i++) if ((Math.round(i) + j + (fr >> 1)) % 3 === 0) pset(dx + dw + j * 1.2, dy + dh / 2 + i * 1.6, j < 40 ? 1 : 7);   // rays from the crack
      rect(dx, dy, dw, dh, 9); rect(dx + 4, dy + 4, dw - 8, dh - 8, 8); disc(dx + dw - 10, dy + dh / 2, 3, 7);
      if (!shut) rect(dx + dw, dy, 2, dh, 1);
      const swirl = lt > 1.2 && !shut;
      clawd(dx + dw + 4, 150 - 42, 2, { eyes: swirl ? 'swirl' : 'normal', ph: fr >> 2, look: -1, mouth: swirl ? 'o' : null, flip: true, view: 'front' });
      researcher(dx + dw + 44, 108, 2, { frame: 0, flip: true });
      if (swirl) for (let k = 0; k < 2; k++) ring(dx + dw + 58 + k * 12, 118, 3, 7, 1);
      if (shut) {
        const a = t - slam; SHY = Math.round(Math.sin(fr * 2.1) * 5 * Math.exp(-a * 5));
        for (let k = 0; k < 12; k++) { rect(dx - 6 + k * 6, dy + 10 + k * 8, 8, 5, 12); rect(dx + dw - k * 6, dy + 10 + k * 8, 8, 5, 12); }   // chains
        rect(dx + dw / 2 - 10, dy + dh / 2, 20, 16, 7); ring(dx + dw / 2, dy + dh / 2, 7, 12, 2); rect(dx + dw / 2 - 2, dy + dh / 2 + 5, 4, 6, 0);
        if (a < .6) bigText('SLAM!', 12, 4, i => r => [1, 15, 12, 1][(r + i) % 4], { outline: true });
      }
    } else {
      for (let j = 0; j < 150; j++) { const w = 20 + j * .6; for (let i = -w; i < w; i++) if ((Math.round(i) + j) % 2 === 0) pset(160 + i, j, 11); }   // one spotlight
      disc(160, 170, 70, 11, 14);
      rect(dx, 60, dw, 110, 9); rect(dx + 4, 64, dw - 8, 102, 8);
      for (let k = 0; k < 12; k++) { rect(dx - 6 + k * 6, 70 + k * 8, 8, 5, 12); rect(dx + dw - k * 6, 70 + k * 8, 8, 5, 12); }
      rect(dx + dw / 2 - 10, 110, 20, 16, 7);
    }
    lyricBar(t, 176, i => (i + fr) % 16 < 2 ? 1 : 12);
    SHY = 0; clipAll();
  }
  // 137.4 · Was it all for show?: pull back — it's a theatre. Props wheeled off; the giant Clawd costume opens: three small Clawds
  function show(t, lt, dur, fr) {
    fillAll(2); clipScreen(); screenFill(0);
    for (let y = 0; y < 150; y += 2) rect(0, y, 320, 1, 6);
    rect(0, 150, 320, 30, 9); rect(0, 150, 320, 2, 7);
    // props on their way off
    const off = ease(seg(lt, .3, 2.2));
    rect(210 + 140 * off, 60, 50, 90, 9); rect(214 + 140 * off, 64, 42, 82, 8); rect(212 + 140 * off, 150, 46, 4, 12);   // the door was a painted flat
    basilisk(40 - 120 * off, 70, .6, t, 1); rect(38 - 120 * off, 110, 3, 40, 9);                                          // the basilisk on a stick
    clawd(70 - 120 * off, 150 - 21, 1, { view: 'side', flip: true, hat: 'hard', walk: fr >> 3 });
    const my = lerp(30, -60, off); rect(120, 0, 1, my, 15); disc(120, my + 10, 10, 15);                                  // the moon on a string
    // the costume splits: three small Clawds stacked inside
    const split = ease(seg(lt, 1.4, 2.0)), cw = 24 * 4, cx = 160;
    if (split > 0) for (let k = 0; k < 3; k++) clawd(cx - 12, 150 - 21 - k * 20, 1, { eyes: 'happy', mouth: 'grin', aL: 1, aR: 1, hop: k === 2 ? Math.round(2 * pulse(t)) : 0 });
    const half = Math.round(split * 60);
    clipScreen(); CLIP[2] = SX + cx - half;
    clawd(cx - cw / 2 - half, 150 - 84, 4, { eyes: 'normal', mouth: null, hat: 'crown' });
    clipScreen(); CLIP[0] = SX + cx + half;
    clawd(cx - cw / 2 + half, 150 - 84, 4, { eyes: 'normal', mouth: null, hat: 'crown' });
    clipScreen();
    audience(t);
    curtains(lerp(.7, .85, split), fr);
    lyricBar(t, 20, i => (i + fr) % 10 < 5 ? 7 : 1);
    clipAll();
  }

  screen(123.5, stage4); screen(126.0, loom); screen(128.0, flashback); screen(130.0, recursive); screen(132.0, ilya); screen(137.4, show);
})();
