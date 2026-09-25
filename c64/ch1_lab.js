// ch1_lab.js: 0 · Curtain up (0–1.5) and 1 · The lab (1.5–22.9). Night indigo, lamp yellow, monitor cyan.
(() => {
  // ---------- curtain up: the demo "loads", then red curtains part on the logo and Clawd pops up ----------
  function intro(t, lt, dur, fr) {
    if (lt < .45) {   // tape-loader stripes
      for (let y = 0; y < FH; y++) rasterLine(y, hash(Math.floor(y / (2 + 4 * hash(Math.floor(y / 9) + fr))) + fr * 13) > .5 ? 6 : 14);
      clipScreen(); screenFill(6); clipAll(); return;
    }
    fillAll(0); borderBars(t, BARS.gold, 2, .9);
    clipScreen(); screenFill(0);
    stars(t, 0, 0, 30, [11, 11, 12]);
    bigText("I'M UPPING", 30, 3, i => r => WASH[(r + i + fr) % WASH.length]);
    bigText('MY P(DOOM)', 62, 3, i => r => FIRE[(r + i + fr) % FIRE.length]);
    checkerFloor(150, 9, 8); rect(0, 149, 320, 2, 7);
    rect(136, 150, 48, 4, 0);   // the trapdoor
    const up = backOut(seg(lt, .95, 1.25));
    if (lt > .9) clawd(136, 150 - 42 * up, 2, { eyes: 'happy', mouth: 'grin', aL: 0, aR: frac(lt * 4) > .5 ? 1 : 0 });
    checkerFloor(150, 9, 8); rect(0, 149, 320, 2, 7);   // the stage lip hides Clawd below the trapdoor
    curtains(ease(seg(lt, .5, 1.2)), fr);
    clipAll();
  }

  // ---------- the lab set ----------
  function labBg(t, fr) {
    fillAll(6); clipScreen(); screenFill(0);
    for (let y = 0; y < 140; y += 2) rect(0, y, 320, 1, y % 8 ? 0 : 6);        // dark wall, faint raster stripes
    rect(0, 140, 320, 60, 9); rect(0, 140, 320, 2, 8);                         // desk
    // the lamp: a dithered cone of light
    rect(290, 40, 3, 100, 12); rect(270, 34, 30, 8, 7);
    for (let y = 42; y < 140; y++) { const w = (y - 42) * .55; for (let x = 285 - w; x < 285 + w; x++) if (((x | 0) + y) % 2 === 0) pset(x, y, y > 138 ? 7 : 8); }
  }
  function monitor(x, y, w, h, fr) {   // a chunky CRT: returns the screen rectangle
    rect(x, y, w, h, 15); rect(x + 2, y + 2, w - 4, h - 4, 12); rect(x + 8, y + 8, w - 16, h - 22, 0);
    rect(x + w / 2 - 12, y + h, 24, 8, 12); rect(x + w - 16, y + h - 11, 6, 3, fr % 50 < 40 ? 5 : 13);
    return [x + 8, y + 8, w - 16, h - 22];
  }
  function glow(x, y, w, h, c) { for (let k = 0; k < 2; k++) { rect(x - 1 - k, y - 1 - k, w + 2 + 2 * k, 1, c); rect(x - 1 - k, y + h + k, w + 2 + 2 * k, 1, c); } }

  // 1.5 · I see sparks of AGI: tiny Clawd asleep on the monitor; its eyes blink open
  function sparks(t, lt, dur, fr) {
    labBg(t, fr);
    const z = lerp(1, 1.25, ease(lt / dur)), w = 150 * z, h = 110 * z, x = 160 - w / 2, y = 20 - (z - 1) * 30;
    const [sx, sy, sw, sh] = monitor(x, y, w, h, fr); glow(sx, sy, sw, sh, 3);
    for (let yy = sy; yy < sy + sh; yy += 2) rect(sx, yy, sw, 1, 6);
    const awake = lt > 1.35;
    clawd(sx + sw / 2 - 24, sy + sh - 44, 2, { eyes: awake ? 'normal' : 'closed', mouth: awake ? 'o' : null, aL: -1, aR: -1 });
    if (!awake) emote('zzz', sx + sw / 2 + 26, sy + 16 + Math.round(Math.sin(t * 3) * 2));
    else if (lt < 1.9) emote('!', sx + sw / 2 + 28, sy + 10);
    // over the Researcher's shoulder
    disc(40, 190, 46, 12, 34); disc(40, 150, 26, 11); for (let k = 0; k < 7; k++) line(24 + k * 5, 130, 20 + k * 6 + Math.sin(t * 3 + k) * 3, 118, 12, 2);
    lyricBar(t, 174, i => (i + fr) % 12 < 2 ? 1 : 3);
    clipAll();
  }
  // 3.6 · …in your eyes: push in; star eyes; sparks burst out like fireworks
  function eyesShot(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.gold, 2, .7);
    clipScreen(); screenFill(12); rect(10, 8, 300, 184, 0);
    for (let yy = 8; yy < 192; yy += 2) rect(10, yy, 300, 1, 6);
    clawd(100, 36, 5, { eyes: lt > .35 ? 'star' : 'normal', mouth: lt > .35 ? 'open' : null, aL: 1, aR: 1, map: { y: fr % 6 < 3 ? 7 : 1 } });
    // fireworks: a rocket from each eye per beat, bursting into sparks
    for (let b = 0; b < 6; b++) {
      const t0 = beatT(Math.ceil(bp(t - lt + .35)) + b); if (t < t0) continue;
      const a = t - t0, ex = b % 2 ? 214 : 118, ey = 80;
      if (a < 1.2) for (let k = 0; k < 16; k++) {
        const ang = k / 16 * TAU + b, sp = 60 + 40 * hash(k + b * 16), x = ex + Math.cos(ang) * sp * a, y = ey + Math.sin(ang) * sp * a + 60 * a * a;
        rect(x, y, 2, 2, a < .3 ? 1 : a < .7 ? 7 : a < 1 ? 8 : 2);
      }
    }
    lyricBar(t, 176, i => [7, 7, 1, 8][(i + fr) % 4]);
    clipAll();
  }
  // 6.0 · Your circuits make me nervous: circuit traces crawl across the room; the Researcher scoots back
  function circuits(t, lt, dur, fr) {
    fillAll(6); clipScreen(); screenFill(6);
    rect(0, 150, 320, 50, 11);
    const grow = seg(lt, 0, dur * .95);
    for (let k = 0; k < 14; k++) {   // Manhattan traces from the right edge, with pads and a travelling pulse
      let x = 320, y = 10 + k * 13, len = 0; const target = grow * (180 + 260 * hash(k)), pts = [[x, y]];
      for (let j = 0; j < 8 && len < target; j++) {
        const horiz = j % 2 === 0, d = Math.min(target - len, 20 + 50 * hash(k * 8 + j));
        if (horiz) x -= d; else y += (hash(k * 8 + j + 3) > .5 ? 1 : -1) * d * .5;
        len += d; pts.push([x, y]);
      }
      for (let j = 1; j < pts.length; j++) line(pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], 5, 2);
      pts.slice(1).forEach(([px, py]) => rect(px - 2, py - 2, 4, 4, 13));
      const q = pts[Math.min(pts.length - 1, 1 + Math.floor(frac(t * 2 + hash(k)) * (pts.length - 1)))]; rect(q[0] - 1, q[1] - 1, 3, 3, 1);
    }
    const back = -40 * ease(seg(lt, .8, 1.5));
    rect(40 + back, 70, 70, 60, 0); rect(70 + back, 130, 8, 20, 12); rect(50 + back, 150, 50, 4, 12);   // the rolling chair
    researcher(34 + back, 66, 4, { frame: 0, wob: r => Math.round(Math.sin(t * 40 + r) * (lt > .8 ? 1 : 0)) });
    emote('sweat', 120 + back, 60 + Math.round(frac(t * 2) * 10));
    lyricBar(t, 176, i => (i + fr) % 8 < 4 ? 13 : 5);
    clipAll();
  }
  // 8.0 · that's no surprise: Clawd on screen shrugs and winks
  function shrug(t, lt, dur, fr) {
    labBg(t, fr);
    const [sx, sy, sw, sh] = monitor(70, 16, 180, 128, fr); glow(sx, sy, sw, sh, 3);
    for (let yy = sy; yy < sy + sh; yy += 2) rect(sx, yy, sw, 1, 6);
    const up = lt > .15 && lt < .75;
    clawd(sx + sw / 2 - 36, sy + sh - 64, 3, { eyes: lt > .5 ? 'happy' : 'normal', mouth: 'grin', aL: up ? 1 : 0, aR: up ? 1 : 0, hop: up ? 2 : 0 });
    if (up) emote('?', sx + sw / 2 + 44, sy + 6, 14);
    lyricBar(t, 174, i => 1);
    clipAll();
  }
  // 9.0 · There was a sudden drop in your training loss: Clawd sleds down the plunging curve, the screen scrolling with it
  const lossY = x => x < 110 ? 100 + 6 * Math.sin(x * .2) : x < 230 ? 100 + 320 * easeIn((x - 110) / 120) : 420;
  function loss(t, lt, dur, fr) {
    fillAll(6); clipScreen();
    const cxk = ease(seg(lt, .2, 2.6)), cx = lerp(10, 290, cxk * cxk), cy = lossY(cx);
    const cam = clamp(cy - 110, 0, 300);
    screenFill(6);
    for (let gy = -(cam % 16); gy < 200; gy += 16) rect(0, gy, 320, 1, 14);
    for (let gx = 0; gx < 320; gx += 16) rect(gx, 0, 1, 200, 14);
    rect(20, 0, 2, 200, 1);
    for (let x = 0; x < 320; x++) { const y = lossY(x) - cam; rect(x, y, 1, 3, 7); for (let yy = y + 3; yy < 200; yy += 2) if ((x + yy) % 4 === 0) pset(x, yy, 3); }
    // the sled and its rider
    const ang = Math.atan2(lossY(cx + 4) - lossY(cx - 4), 8);
    rect(cx - 16, cy - cam - 4, 32, 3, 9); rect(cx + 14, cy - cam - 8, 3, 6, 9);
    clawd(cx - 24 + Math.round(ang * 8), cy - cam - 46, 2, { view: 'side', eyes: ang > .5 ? 'x' : 'normal', mouth: 'open', aL: 1 });
    if (lt > 2.55) {   // the splash at the bottom
      const a = lt - 2.55;
      for (let k = 0; k < 24; k++) { const vx = (hash(k) - .5) * 200, vy = -80 - 120 * hash(k + 9); rect(290 + vx * a, 420 - cam + vy * a + 260 * a * a, 3, 3, [1, 3, 14][k % 3]); }
    }
    lyricBar(t, 6, i => (i + Math.floor(t * 20)) % 10 < 5 ? 7 : 1);
    clipAll();
  }
  // 12.4 · now I'm your servant and you're my boss: Clawd bursts out, crowned, villain chair spin, mugs on the beat
  function boss(t, lt, dur, fr) {
    fillAll(4); clipScreen(); screenFill(0);
    for (let y = 0; y < 150; y += 4) rect(0, y, 320, 2, 4);
    rect(0, 150, 320, 50, 11); for (let x = 0; x < 320; x += 20) rect(x, 150, 2, 50, 12);
    if (lt < .6) {   // the monitor shatters
      const [sx, sy, sw, sh] = monitor(90, 20, 140, 110, fr);
      for (let k = 0; k < 30; k++) { const a = lt * 1.6; rect(160 + (hash(k) - .5) * 300 * a, 70 + (hash(k + 30) - .5) * 200 * a + 200 * a * a, 4, 3, [3, 1, 14][k % 3]); }
      clawd(160 - 12 * (1 + 2 * seg(lt, 0, .5)), 70 - 10 * seg(lt, 0, .5), Math.max(1, Math.round(1 + 2 * seg(lt, .1, .5))), { eyes: 'normal', mouth: 'open', aL: 1, aR: 1 });
    } else {
      // the throne: an office chair that spins round to reveal Clawd
      const spin = seg(lt, .6, 1.3), cw = Math.round(64 * Math.abs(Math.cos(spin * Math.PI * 2)));
      rect(84, 136, 60, 6, 0); rect(110, 142, 8, 10, 12); rect(96, 152, 36, 3, 12);
      const lid = lt > 4.1 ? Math.round(1 + Math.abs(Math.sin((lt - 4.1) * 3)) * 2) : 0;
      if (spin > .5 || spin === 1) clawd(78, 73, 3, { eyes: lid ? 'closed' : 'happy', mouth: 'grin', hat: 'crown', aL: 0, aR: 0, lid });
      if (spin < 1) rect(114 - cw / 2, 60, cw, 78, 0), rect(114 - cw / 2 + 2, 62, Math.max(0, cw - 4), 74, 11);
      // mugs: one more on each beat
      const n = Math.max(0, Math.min(24, beatN(t) - beatN(t - lt + 1.1)));
      for (let k = 0; k < n; k++) mug(158 + (k % 3) * 16, 136 - Math.floor(k / 3) * 14, 2);
      researcher(236 - 12 * pulse(t), 108, 2, { frame: beatOdd(t) ? 1 : 0, bowtie: true, flip: true });
      if (beatOdd(t)) mug(220, 110, 2);
    }
    lyricBar(t, 172, i => (i + fr) % 16 < 3 ? 7 : 15);
    clipAll();
  }
  // 17.9 · ChatGPT, please don't eat me alive: the three-door chase, Clawd chomping and bigger each time; CHOMP
  function chase(t, lt, dur, fr) {
    fillAll(6); clipScreen(); screenFill(14);
    for (let x = 0; x < 320; x += 16) rect(x, 0, 8, 140, 6);
    rect(0, 140, 320, 60, 11); rect(0, 140, 320, 2, 12);
    const doors = [40, 136, 232];
    for (const dx of doors) { rect(dx - 4, 60, 56, 82, 8); rect(dx, 64, 48, 76, 0); }
    const k = beatN(t), bf = frac(bp(t));
    const who = [k % 3, (k + 1) % 3], grow = Math.min(3, 1 + Math.floor(lt / 1.4));
    // the Researcher darts out of one door, Clawd lunges from the next
    researcher(doors[who[0]], 98 - Math.round(6 * Math.sin(bf * Math.PI)), 2, { frame: 1 });
    const cs = grow, lid = Math.round(Math.abs(Math.sin(t * 16)) * 3);
    clawd(doors[who[1]] + 24 - 12 * cs, 140 - 21 * cs, cs, { eyes: 'normal', mouth: null, lid, aL: 1, aR: 1 });
    for (const dx of doors) if (dx !== doors[who[0]] && dx !== doors[who[1]]) rect(dx, 64, 48, 76, 9);   // the closed door
    const chomp = seg(t, 22.3, 22.75);
    SHY = t > 22.75 ? Math.round(Math.sin(fr * 2) * 4) : 0;
    lyricBar(t, 172, i => (i + fr) % 6 < 3 ? 1 : 10);
    if (chomp > 0) { jaws(easeIn(chomp), 0); if (chomp > .4 && t < 22.85) bigText('CHOMP!', 88, 3, i => r => FIRE[(r + i + fr) % 10], { outline: true }); }
    SHY = 0; clipAll();
  }

  screen(0, intro); screen(1.5, sparks); screen(3.6, eyesShot); screen(6.0, circuits); screen(8.0, shrug); screen(9.0, loss); screen(12.4, boss); screen(17.9, chase);
})();
