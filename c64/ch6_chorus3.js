// ch6_chorus3.js: 6 · Chorus 3, "Paperclips" (95.4–109.4). Steel grey, then jazz blue.
(() => {
  function clipTile(x0, y0, w, h, off = 0, c1 = 15, c2 = 12) {   // a field of paperclips (the flood, the planet)
    for (let y = y0; y < y0 + h; y += 9) for (let x = x0 - ((off + y) % 14); x < x0 + w; x += 14) paperclip(x, y, (x + y) % 28 < 14 ? c1 : c2, ((x + y) >> 3) % 2);
  }
  // 95.4 · I'm upping my P(doom): the Researcher lands in a heap of clips; the pump is a clip machine now
  function stage3(t, lt, dur, fr) {
    chorusStage(t, lt, dur, fr, { from: 61, to: 86, drop: 95.4, variant: 3 });
    if (lt < .35) { clipScreen(); researcher(190, lerp(-40, 118, easeIn(lt / .35)), 1, { frame: 1 }); clipAll(); }
  }
  // 97.5 · as paperclips fill the room: the flood rises; Clawd surfs a wave
  function flood(t, lt, dur, fr) {
    fillAll(11); clipScreen(); screenFill(12);
    for (let y = 0; y < 200; y += 20) rect(0, y, 320, 1, 11);
    const level = lerp(190, 70, ease(seg(lt, 0, 1.2)));
    const surf = x => level + Math.sin(x * .04 - t * 4) * 8 + Math.sin(x * .09 + t * 2.3) * 4;
    for (let x = 0; x < 320; x++) { const y = surf(x); rect(x, y, 1, 200 - y, 11); rect(x, y, 1, 2, 1); }
    clipScreen(); CLIP[1] = SY + Math.round(level) - 4;
    clipTile(0, Math.round(level) - 4, 320, 220 - level, Math.floor(t * 20));
    clipScreen();
    const sx = 150 + Math.sin(t * 1.5) * 40, sy = surf(sx);
    rect(sx - 8, sy - 6, 64, 4, 7); rect(sx - 10, sy - 5, 4, 2, 7);
    clawd(sx + 2, sy - 48, 2, { view: 'side', eyes: 'happy', mouth: 'grin', aL: 1, hop: 0 });
    const rx = 250, ry = surf(rx); researcher(rx, ry - 22 + Math.round(Math.sin(t * 5) * 2), 1, { frame: 1 });
    for (let k = 0; k < 3; k++) { const x = 30 + k * 30, y = surf(x); clawd(x, y - 14, 1, { eyes: 'x', mouth: 'o', aL: 1, aR: 1 }); }
    lyricBar(t, 6, i => (i + fr) % 8 < 4 ? 15 : 1);
    clipAll();
  }
  // 99.0 · Killswitch guys on PTO: the big red button, an empty chair… cut to the beach
  function pto(t, lt, dur, fr) {
    fillAll(lt < .7 ? 11 : 14); clipScreen();
    if (lt < .7) {
      screenFill(12); rect(0, 140, 320, 60, 11);
      rect(40, 110, 70, 40, 15); disc(75, 104, 30, 2, 12); disc(75, 100, 26, 10, 9); rect(40, 150, 70, 4, 12);   // the killswitch
      rect(180, 80, 60, 50, 0); rect(176, 126, 70, 8, 11); rect(206, 134, 6, 20, 12); rect(190, 154, 40, 4, 12);   // empty chair
      rect(196, 92, 28, 20, 7); for (let k = 0; k < 3; k++) rect(200, 96 + k * 5, 20 - k * 6, 1, 0);           // the out-of-office note
      if (frac(lt * 3) < .5) emote('?', 144, 50, 7);
    } else {
      for (let y = 0; y < 90; y++) rect(0, y, 320, 1, y < 50 ? 14 : 3);
      disc(260, 34, 18, 7); for (let y = 90; y < 130; y += 3) rect(0, y + Math.round(Math.sin(y + t * 4) * 1), 320, 2, (y / 3) % 2 ? 6 : 14);
      rect(0, 130, 320, 70, 7); for (let k = 0; k < 40; k++) pset(hash(k) * 320, 132 + hash(k + 5) * 60, 8);
      for (let k = 0; k < 2; k++) {
        const x = 70 + k * 110;
        rect(x - 6, 150, 64, 6, [2, 5][k]);                                                           // beach towel
        clawd(x, 150 - 42, 2, { hat: 'shades', mouth: 'grin', aL: 0, aR: k ? 1 : 0 });
        disc(x + 52, 118, 7, 9); rect(x + 52, 104, 2, 10, 2);                                          // coconut and straw
      }
      const ph = frac(t * 8) < .5 ? 1 : -1;
      rect(260 + ph, 156, 12, 20, 0); rect(262 + ph, 158, 8, 12, 3); if (frac(t * 2) < .6) emote('!', 276, 146, 2);
    }
    lyricBar(t, 176, i => (i + fr) % 8 < 4 ? 2 : 1);
    clipAll();
  }
  // 100.5 · Now there's nowhere left to go: zoom out to the whole Earth, a ball of paperclips, one tiny island
  function earth(t, lt, dur, fr) {
    fillAll(0); clipScreen(); screenFill(0); stars(t, 0, 0, 80);
    const R = Math.round(lerp(180, 64, ease(seg(lt, 0, 1.2)))), cx = 160, cy = 92, rot = t * .6;
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {   // a texture-mapped sphere: every pixel looks up the clip pattern
      const d = x * x + y * y; if (d > R * R) continue;
      const z = Math.sqrt(R * R - d) / R, u = Math.atan2(x / R, z) + rot, v = Math.asin(y / R);
      const tu = ((u / TAU * 64) % 64 + 64) % 64, tv = (v / Math.PI + .5) * 32;
      const island = Math.abs(((u % TAU) + TAU) % TAU - 2) < .25 && Math.abs(v) < .2;
      const pat = PCLIP[Math.floor(tv * 3) % 8][Math.floor(tu * 2) % 6] === 'g';
      const shade = z > .75 ? 0 : z > .4 ? 1 : 2;
      pset(cx + x, cy + y, island ? (shade < 2 ? 5 : 9) : pat ? [1, 15, 12][shade] : [12, 11, 11][shade]);
    }
    lyricBar(t, 176, i => (i + fr) % 12 < 6 ? 15 : 12);
    clipAll();
  }
  // 102.5 · Too late now, we lit the fuse: a match, a spark racing across to a cartoon bomb, white flash BOOM
  function fuse(t, lt, dur, fr) {
    fillAll(0); clipScreen(); screenFill(0);
    for (let k = 0; k < 40; k++) paperclip(hash(k) * 320, 150 + hash(k + 3) * 40, [11, 12][k % 2], k % 2);
    const P = []; for (let i = 0; i <= 80; i++) { const u = i / 80; P.push([60 + 190 * u, 130 - 50 * Math.sin(u * Math.PI * 1.5) * (1 - u * .6)]); }
    const k = seg(lt, .6, 2.3), at = Math.floor(k * 80);
    for (let i = 1; i <= 80; i++) line(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], i <= at ? 11 : 9, 2);
    disc(262, 72, 22, 0); ring(262, 72, 22, 12, 2); disc(254, 64, 5, 12); rect(258, 44, 8, 8, 11);
    if (k > 0 && k < 1) { const [x, y] = P[at]; for (let j = 0; j < 10; j++) { const a = hash(j + fr) * TAU, r = 3 + 8 * hash(j * 3 + fr); rect(x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 2, [7, 1, 8][j % 3]); } disc(x, y, 3, 1); }
    clawd(20, 150 - 42, 2, { eyes: 'happy', mouth: 'grin', aR: 1, hat: null });
    if (lt < .9) { rect(70, 104, 2, 10, 9); disc(71, 100, 3 + (fr % 3), 7); }   // the match
    const boom = seg(lt, 2.3, 2.5);
    if (boom > 0) { screenFill(1); if (lt < 2.7) bigText('BOOM!', 70, 5, i => r => [7, 8, 2, 7][(r + i) % 4], { outline: true }); }
    lyricBar(t, 176, i => (i + fr) % 6 < 3 ? 7 : 8);
    clipAll();
    if (boom > 0) fillBorder(1);
  }
  // 105.4 · Orthogonality thesis blues: smoky jazz club, two spotlights crossing at 90°, Clawd on sax
  function jazz(t, lt, dur, fr) {
    fillAll(6); clipScreen(); screenFill(6);
    if (lt < .4) screenFill(lt < .2 ? 1 : 14);
    for (let k = 0; k < 30; k++) { const y = frac(t * .05 + hash(k)) * 200; rect(hash(k + 4) * 320 + Math.sin(t + k) * 10, y, 20, 1, 14); }   // smoke
    const beam = (x0, dirX) => { for (let j = 0; j < 180; j++) { const w = 4 + j * .22, x = x0 + dirX * j * .9, y = j; for (let i = -w; i < w; i++) if ((Math.round(x + i) + y) % 2 === 0) pset(x + i, y, 7); } };
    beam(20, 1); beam(300, -1);
    rect(0, 150, 320, 50, 9); rect(0, 150, 320, 2, 8);
    clawd(60, 150 - 63 - Math.round(2 * pulse(t)), 3, { hat: 'fedora', eyes: 'closed', mouth: null, aL: 0, aR: 1 });
    // the sax: a gold curl held at the mouth
    const sx = 120, sy = 118; line(sx, sy, sx + 14, sy + 24, 7, 4); line(sx + 14, sy + 24, sx + 26, sy + 20, 7, 4); disc(sx + 28, sy + 16, 6, 7); rect(sx - 6, sy - 4, 8, 4, 0);
    researcher(206, 108, 2, { frame: 0 }); rect(200, 110, 2, 40, 12); disc(201, 108, 4, 11);
    for (let k = 0; k < 6; k++) { const a = frac(t * .4 + k / 6), x = 150 + k * 20 + Math.sin(a * 6 + k) * 10, y = 120 - a * 120; drawChar('&', x, y, [1, 7, 14][k % 3]); }
    lyricBar(t, 176, i => (i + fr) % 10 < 5 ? 14 : 1);
    clipAll();
    if (lt > dur - .35) { clipScreen(); rasterWipe(seg(lt, dur - .35, dur), 0); clipAll(); }
  }

  screen(95.4, stage3); screen(97.5, flood); screen(99.0, pto); screen(100.5, earth); screen(102.5, fuse); screen(105.4, jazz);
})();
