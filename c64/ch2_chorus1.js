// ch2_chorus1.js: Chorus 1, "The P(doom) Show" (22.9–38.5). The screens of the first 15-second sample.
(() => {
  // the jaws of the previous chapter's CHOMP open on the stage
  const stage = (t, lt, dur, fr) => {
    chorusStage(t, lt, dur, fr, { from: 8, to: 34, drop: 23.897, variant: 1 });
    clipScreen(); if (lt < .4) jaws(1 - easeOut(lt / .4)); clipAll();
  };
  // ---------- S2: FOOM ----------
  const tFoom = 25.75;
  function foom(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.red, 3);
    clipScreen(); screenFill(0);
    const lift = ease(seg(lt, .15, 1.1)), scroll = 320 * easeIn(seg(lt, .1, 1.3)) + 200 * seg(lt, 1.3, 2);
    const boom = t > tFoom ? Math.exp(-(t - tFoom) * 3) : 0;
    SHY = Math.round((t > tFoom ? Math.sin(fr * 2.1) * 5 * boom : 0) + (lt < 1.2 && lt > .15 ? Math.sin(fr * 1.3) : 0));
    SHX = t > tFoom ? Math.round(Math.cos(fr * 1.7) * 4 * boom) : 0;
    stars(t, 0, scroll * 1.5, 90);
    // the stage falls away below as we tilt up
    if (scroll < 60) { for (let x = 0; x < 320; x += 8) for (let y = 150 + scroll; y < 200; y += 8) rect(x, y, 8, 8, ((x + y) / 8) % 2 ? 9 : 8); rect(0, 149 + scroll, 320, 2, 7); }
    const rx = 136, ry = 108 - 50 * lift + Math.round(2 * Math.sin(lt * 20)) * (lt > .15 ? 1 : 0);
    if (lt > .1) flame(rx + 24, ry + 36, 2, fr);
    sprite(ROCKET, rx, ry, ROCKET_MAP, 2);
    clawd(rx + 12, ry + 16, 1, { eyes: t > tFoom ? 'x' : 'star', mouth: 'open', aL: 1, aR: 1 });
    // the FOOM: an expanding dithered cloud and huge text
    if (t > tFoom) {
      const a = t - tFoom, R = 30 + 110 * easeOut(a / .7);
      for (let k = 0; k < 14; k++) { const ang = k / 14 * Math.PI * 2 + hash(k) * .5, d = R * (.6 + .4 * hash(k + 5)); disc(rx + 24 + Math.cos(ang) * d, ry + 30 + Math.sin(ang) * d * .6, 10 + 14 * hash(k + 9) * (1 - a * .6), [7, 8, 10, 1][k % 4]); }
      const s = 5, str = 'FOOM', x = centreX(str, s);
      for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [3, 3]]) text(str, x + ox, 40 + oy, 0, { sx: s, dy: i => Math.round(Math.sin(a * 12 + i) * 3 * boom) });
      text(str, x, 40, 0, { sx: s, dy: i => Math.round(Math.sin(a * 12 + i) * 3 * boom), col: i => (r, b) => [7, 7, 1, 7, 8, 8, 2, 2][(r + Math.floor(a * 30)) % 8] });
    }
    SHX = SHY = 0;
    lyricBar(t, 176, i => 1, { dy: i => -Math.round(Math.abs(Math.sin(t * 8 + i * .45)) * 4) });
    clipAll();
    if (t > tFoom && t < tFoom + .06) fillBorder(7);
  }

  // ---------- S3: the Chinese room ----------
  function room(t, lt, dur, fr) {
    fillAll(6); clipScreen(); screenFill(6);
    stars(t, 0, 20, 40, [14, 14, 1]);
    const crash = lt < .35 ? Math.exp(-lt * 8) : 0;
    SHY = Math.round(Math.sin(fr * 2.3) * 6 * crash);
    // the paper room: white walls ruled in grey, like squared paper
    rect(50, 28, 220, 126, 1);
    for (let x = 50; x <= 270; x += 8) rect(x, 28, 1, 126, 15);
    for (let y = 28; y <= 154; y += 8) rect(50, y, 220, 1, 15);
    rect(50, 28, 220, 2, 12); rect(50, 152, 220, 2, 12); rect(50, 28, 2, 126, 12); rect(268, 28, 2, 126, 12);
    rect(46, 84, 8, 22, 0); rect(266, 84, 8, 22, 0);   // mail slots
    // the rocket sticks out of the roof where it crashed in
    const cy = lt < .12 ? lerp(-60, 2, lt / .12) : 2;
    sprite(ROCKET, 190, cy + 8, ROCKET_MAP, 1); rect(186, 27, 20, 3, 12);
    if (lt < .5) for (let k = 0; k < 10; k++) { const a = lt * 2; rect(200 + (hash(k) - .5) * 120 * a, 28 - 40 * a + 80 * a * a * hash(k + 3), 3, 2, [1, 15, 12][k % 3]); }
    // slips fly on arcs: in through the left slot, to Clawd, out through the right slot
    const fast = Math.floor(lt * 10) % 2;
    clawd(136, 96, 2, { eyes: fast ? 'normal' : 'closed', mouth: 'o', aL: fast ? 1 : -1, aR: fast ? -1 : 1, hop: fast * 2 });
    for (let k = 0; k < 5; k++) {
      const ph = frac(lt * 1.4 + k / 5), inb = ph < .5, q = inb ? ph * 2 : (ph - .5) * 2;
      const x0 = inb ? 54 : 160, x1 = inb ? 160 : 266, x = lerp(x0, x1, q), y = 94 - 40 * 4 * q * (1 - q);
      rect(x - 5, y - 5, 11, 10, 1); rect(x - 5, y - 5, 11, 1, 12);
      for (let r = 0; r < 7; r++) for (let b = 0; b < 8; b++) if (HANZI[r][b] === '#') pset(x - 4 + b, y - 4 + r, 0);
    }
    SHY = 0;
    lyricBar(t, 172, i => [1, 7, 1, 15][(i + fr) % 4] ?? 1);
    clipAll();
  }

  // ---------- S4: shrooms ----------
  function shrooms(t, lt, dur, fr) {
    fillAll(0); clipScreen();
    // colour-RAM plasma: one colour per 8x8 char cell
    for (let cy = 0; cy < 25; cy++) for (let cx = 0; cx < 40; cx++) {
      const v = Math.sin(cx * .3 + t * 3) + Math.sin(cy * .41 - t * 2.2) + Math.sin((cx + cy) * .19 + t * 1.7) + Math.sin(Math.hypot(cx - 20, cy - 12) * .35 - t * 4);
      rect(cx * 8, cy * 8, 8, 8, RAINBOW[((Math.floor((v + 4) * 2.2) % RAINBOW.length) + RAINBOW.length) % RAINBOW.length]);
    }
    // a raster "melt" reveals it: lines drop in from the previous screen
    if (lt < .25) for (let y = 0; y < 200; y++) if (hash(y) > lt / .25) rect(0, y, 320, 1, 6);
    for (let k = 0; k < 6; k++) {
      const x = ((k * 58 + lt * 90 * (k % 2 ? 1 : -1)) % 360 + 360) % 360 - 30, y = 150 - Math.abs(Math.sin(t * 5 + k * 1.3)) * 60 - (k % 2) * 20;
      sprite(MUSH, x, y, { k: 0, r: 2, w: 1, f: 15 }, 2);
    }
    clawd(124, 64, 3, { eyes: 'swirl', ph: Math.floor(t * 12), mouth: 'grin', aL: Math.sin(t * 9) > 0 ? 1 : -1, aR: Math.sin(t * 9) > 0 ? -1 : 1, hop: Math.round(4 * pulse(t)), wob: r => Math.round(Math.sin(r * .7 + t * 10) * 4) });
    lyricBar(t, 178, i => RAINBOW[(i + Math.floor(t * 20)) % RAINBOW.length]);
    clipAll();
  }

  // ---------- S5: the shoggoth ----------
  const tYank = 2.25;
  function shoggoth(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.purple, 2);
    clipScreen(); screenFill(0);
    for (let i = 0; i < 4; i++) { const y = 100 + Math.sin(t * 1.7 + i * 1.6) * 90; for (let k = 0; k < BARS.purple.length; k++) rect(0, y + k - 5, 320, 1, BARS.purple[k]); }
    const revealed = lt > tYank, cx = 160, cy = 88;
    // the shoggoth: green blob, many blinking eyes, tentacles, all with a raster-sine wobble per line
    const wob = y => Math.round(Math.sin(y * .09 + t * 6) * (revealed ? 5 : 2));
    const blobR = revealed ? lerp(50, 64, easeOut(seg(lt, tYank, tYank + .3))) : 50;
    for (let k = 0; k < 6; k++) {   // tentacles
      const side = k % 2 ? 1 : -1, base = [cx + side * 40, cy + 30 + (k >> 1) * 12];
      for (let j = 0; j < 24; j++) { const u = j / 24, x = base[0] + side * j * 3.4, y = base[1] + j * 2 + Math.sin(t * 7 + j * .35 + k) * 10 * u; disc(x + wob(y), y, Math.max(1, 5 - j / 6), j % 5 === 0 ? 13 : 5); }
    }
    for (let y = -blobR; y <= blobR; y++) { const w = Math.round(blobR * 1.15 * Math.sqrt(Math.max(0, 1 - (y / blobR) ** 2))); rect(cx - w + wob(cy + y), cy + y, 2 * w + 1, 1, y < -blobR * .5 ? 13 : 5); }
    if (revealed) {
      for (let k = 0; k < 9; k++) {
        const ex = cx + (hash(k + 3) - .5) * 100, ey = cy + (hash(k + 11) - .5) * 70, r = 4 + Math.round(hash(k + 7) * 5);
        const blink = frac(t * .7 + hash(k)) < .06;
        if (blink) rect(ex - r + wob(ey), ey, 2 * r, 1, 0);
        else { disc(ex + wob(ey), ey, r, 1); disc(ex + wob(ey) + Math.round(Math.sin(t * 3 + k) * 2), ey + 1, Math.max(1, r >> 1), 0); }
      }
      for (let i = -24; i <= 24; i += 6) { rect(cx + i + wob(cy + 30), cy + 26, 5, 8, 1); }   // teeth
      rect(cx - 26 + wob(cy + 34), cy + 34, 52, 3, 2);
    }
    // the mask: a friendly smiley that tilts and waves, until Clawd yanks it off
    const mk = revealed ? seg(lt, tYank, tYank + .5) : 0;
    const mx = cx + Math.round(Math.sin(lt * 3) * 6) - 240 * easeIn(mk), my = cy - 150 * mk + 220 * mk * mk;
    if (mk < 1) {
      disc(mx, my, 46, 0); disc(mx, my, 44, 7);
      const wink = frac(bp(t) / 2) > .8;
      rect(mx - 18, my - 16, 7, wink ? 2 : 12, 0); rect(mx + 11, my - 16, 7, 12, 0);
      for (let x = -24; x <= 24; x++) rect(mx + x, my + 14 + Math.round((1 - (x / 24) ** 2) * 10), 1, 3, 0);
    }
    // Clawd leaps in from the right, grabs the mask, and flies off with it
    const jk = seg(lt, 1.55, tYank);
    if (lt > 1.4) {
      const x = revealed ? mx + 30 : lerp(300, cx + 20, jk), y = revealed ? my - 30 : lerp(150, cy - 60, jk) - 60 * 4 * jk * (1 - jk);
      clawd(x, y, 2, { eyes: revealed ? 'normal' : 'normal', mouth: revealed ? 'o' : 'grin', aL: 1, aR: 1, flip: true });
    } else clawd(252, 150, 2, { eyes: 'normal', mouth: null, aL: 0, aR: 0, walk: Math.floor(t * 4) });
    lyricBar(t, 176, i => (Math.floor(t * 10) + i) % 6 < 3 ? 13 : 1, { dy: i => Math.round(Math.sin(t * 5 + i * .4) * 4) });
    clipAll();
  }

  // ---------- S6: shinigami eyes ----------
  function shinigami(t, lt, dur, fr) {
    fillAll(0);
    for (let i = 0; i < 18; i++) { const y = Math.floor(hash(i) * FH), x = FW - ((lt * (400 + 300 * hash(i + 4)) + hash(i + 8) * FW) % (FW + 200)); rasterLine(y, 2, x, x + 60 + 80 * hash(i + 2)); }
    clipScreen(); screenFill(0);
    for (let i = 0; i < 26; i++) { const y = Math.floor(hash(i + 50) * 200), len = 30 + 90 * hash(i + 60), x = 320 - ((lt * (500 + 400 * hash(i + 70)) + hash(i + 80) * 400) % 480); rect(x, y, len, 1, i % 3 ? 2 : 10); }
    // Clawd pushes in, one size per beat, eyes flaring red
    const s = lt < .5 ? 3 : lt < 1 ? 4 : 5, glowc = [2, 10, 1, 10][Math.floor(t * 12) % 4];
    const w = 24 * s, h = 21 * s;
    clawd(160 - w / 2, 92 - h / 2, s, { eyes: 'red', mouth: null, aL: -1, aR: -1, map: { r: glowc, b: 10, d: 2 } });
    // the Researcher, a lifespan counter ticking down over their head, an apple bouncing by
    sprite(RESEARCHER[0], 262, 146, RESEARCHER_MAP, 1);
    const life = String(Math.max(0, 9999 - Math.floor(lt * 4200))).padStart(4, '0');
    text(life, 258, 134, fr % 6 < 3 ? 2 : 1);
    sprite(APPLE, lerp(-24, 330, lt / dur), 176 - Math.round(Math.abs(Math.sin(lt * 7)) * 28), { k: 0, g: 5, r: 2, w: 1 }, 1);
    lyricBar(t, 8, i => (i + (fr >> 1)) % 2 ? 2 : 1);
    clipAll();
    if (lt > dur - .12) { fillAll(2); }   // red flash out
  }

  // ---------- S7: dance break ----------
  const SCROLL = '*** THE P(DOOM) SHOW *** 3 SID VOICES + 4-BIT DIGI DRUMS *** GREETINGS TO ALL THE DOOMERS, ACCELERATIONISTS AND CLAWDS *** WAS IT ALL FOR SHOW? ***';
  function dance(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.blue, 2); borderBars(t + 2, BARS.gold, 1);
    clipScreen(); screenFill(0);
    stars(t, -t * 60, 0, 60);
    if (lt < .1) screenFill(1);   // white flash in
    // logo with FLD bounce and a raster colour sweep
    const fld = Math.round(12 * Math.abs(Math.sin(bp(t) * Math.PI)));
    text('P(DOOM)', centreX('P(DOOM)', 3) + 2, 4 + fld + 2, 0, { sx: 3, col: () => 11 });
    text('P(DOOM)', centreX('P(DOOM)', 3), 4 + fld, 0, { sx: 3, col: i => (r) => BARS.gold[(r + Math.floor(t * 20)) % BARS.gold.length] });
    // a sine wave of Clawd sprites, spinning through their key views, one step per half beat
    const views = [['front', false], ['side', false], ['back', false], ['side', true]];
    for (let i = 0; i < 6; i++) {
      const ph = Math.floor(bp(t) * 2 + i * .5), [view, flip] = views[((ph % 4) + 4) % 4];
      const x = 8 + i * 52, y = 66 + Math.round(Math.sin(t * 4 + i * .9) * 14);
      clawd(x, y, 2, { view, flip, eyes: 'happy', mouth: 'grin', aL: ph % 2 ? 1 : -1, aR: ph % 2 ? -1 : 1, walk: ph });
    }
    sprite(RESEARCHER[beatOdd(t) ? 1 : 0], 148, 118 - Math.round(3 * pulse(t)), RESEARCHER_MAP, 1);
    // the DYCP scroller: every char on its own sine
    const off = lt * 150 - 300;
    for (let i = 0; i < SCROLL.length; i++) {
      const x = i * 16 - off; if (x < -16 || x > 320) continue;
      drawChar(SCROLL[i], x, 164 + Math.round(Math.sin(x * .03 + t * 4) * 10), RAINBOW[(i + Math.floor(t * 15)) % RAINBOW.length], 2, 2);
    }
    if (lt > dur - .4) rasterWipe(seg(lt, dur - .4, dur), 14);
    clipAll();
  }


  screen(22.9, stage); screen(24.5, foom); screen(26.5, room); screen(28.0, shrooms); screen(29.5, shoggoth); screen(33.5, shinigami); screen(35.5, dance);
})();
