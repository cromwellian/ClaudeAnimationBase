// ch4_chorus2.js: 4 · Chorus 2, "Bigger show" (59–73). Arena pyro, then space violet and gold.
(() => {
  // 59.0 · I'm upping my P(doom): the stage with pyro jets; the meter 34 → 61
  function stage2(t, lt, dur, fr) {
    chorusStage(t, lt, dur, fr, { from: 34, to: 61, drop: 59.0, variant: 2, hat: 'hard' });
    if (lt < .2) { clipScreen(); rasterWipe(1 - lt / .2, 1); clipAll(); }   // out of the heart-bubble pop's white
  }
  // 60.5 · I hear the basilisk boom: a crowned serpent bursts through the stage floor; the Researcher throws GPUs
  function basiliskShot(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.green, 3);
    clipScreen(); screenFill(0); stars(t, t * 6, 0, 40, [11, 11, 12]);
    const boom = Math.exp(-lt * 4);
    SHX = Math.round(Math.sin(fr * 2.7) * 5 * boom); SHY = Math.round(Math.cos(fr * 1.9) * 4 * boom);
    const rise = backOut(seg(lt, 0, .45));
    basilisk(170, 34, 1.4, t, rise, { tongue: frac(t * 2) < .5 });
    checkerFloor(150, 9, 8); rect(0, 149, 320, 2, 7);
    rect(130, 146, 80, 8, 0);   // the hole it burst through
    for (let k = 0; k < 10; k++) { const a = lt; rect(170 + (hash(k) - .5) * 260 * a, 148 - 220 * a * hash(k + 4) + 300 * a * a, 12, 3, 8); }   // flying planks
    clawd(24, 150 - 42, 2, { eyes: 'x', mouth: 'open', aL: -1, aR: 1 });
    researcher(254, 108, 2, { frame: beatOdd(t) ? 1 : 0, flip: true });
    for (let b = 0; b < 5; b++) {   // a GPU offering thrown on each beat
      const t0 = beatT(Math.floor(bp(t)) - b), a = (t - t0) / BEAT; if (a < 0 || a > 1.2) continue;
      const k = clamp(a / 1.1), x = lerp(262, 180, k), y = lerp(112, 60, k) - 60 * 4 * k * (1 - k);
      gpu(x - 10, y - 5, 20, 10, t, 1);
    }
    if (lt < .7) bigText('BOOM!', 22, 4, i => r => [7, 1, 7, 8, 2][(r + i + fr) % 5], { outline: true });
    SHX = SHY = 0;
    lyricBar(t, 176, i => (i + fr) % 6 < 3 ? 5 : 13);
    clipAll();
  }
  // 63.0 · NVDA to the moon: a green stock line rockets off its chart; Clawd rides it up and plants a flag
  function moon(t, lt, dur, fr) {
    fillAll(0); clipScreen();
    const len = seg(lt, 0, 1.05);
    const lineY = u => 180 - (u < .4 ? 40 * u + 8 * Math.sin(u * 60) : 16 + 520 * (u - .4) ** 1.6);   // world y along the line
    const tipU = len, tipX = 10 + 230 * tipU, tipY = lineY(tipU);
    const moonY = -250, landed = lt > 1.1;
    const cam = clamp(90 - (landed ? moonY - 30 : tipY), 0, 400);                 // screen y = world y + cam
    screenFill(0); stars(t, 0, cam * .6, 80);
    for (let y = ((cam % 20) + 20) % 20; y < 200; y += 20) rect(0, y, 320, 1, 11);
    for (let x = 0; x < 320; x += 20) rect(x, 0, 1, 200, 11);
    disc(250, moonY + cam, 44, 15); disc(236, moonY - 14 + cam, 8, 12); disc(266, moonY + 12 + cam, 6, 12);
    let px = 10, py = lineY(0) + cam;
    for (let i = 1; i <= Math.floor(80 * len); i++) { const u = i / 80, x = 10 + 230 * u, y = lineY(u) + cam; line(px, py, x, y, 5, 3); px = x; py = y; }
    const cx = landed ? 226 : tipX - 24, cy = landed ? moonY - 44 - 40 + cam : tipY - 42 + cam;
    clawd(cx, cy, 2, { eyes: 'star', mouth: 'grin', aL: 1, aR: 1, map: { y: 7 } });
    if (landed) { const f = seg(lt, 1.15, 1.35); rect(cx + 50, cy + 42 - 30 * f, 2, 30 * f, 1); if (f > .9) { rect(cx + 52, cy + 12, 16, 10, 5); drawChar('+', cx + 56, cy + 13, 13); } }
    lyricBar(t, 176, i => (i + fr) % 8 < 4 ? 5 : 13);
    clipAll();
  }
  // 64.5 · The Omega Point's coming soon: galaxies spiral inward into one blinding point
  function omega(t, lt, dur, fr) {
    fillAll(0); borderBars(t, BARS.purple, 2, .8);
    clipScreen(); screenFill(0);
    const k = easeIn(seg(lt, .1, dur - .15)), cx = 160, cy = 90;
    for (let g = 0; g < 3; g++) {
      const gx = lerp(cx + Math.cos(g * 2.1) * 110, cx, k), gy = lerp(cy + Math.sin(g * 2.1) * 60, cy, k), sc = lerp(1, .15, k);
      for (let i = 0; i < 160; i++) {
        const arm = i % 2, u = hash(i + g * 200), r = u * 40 * sc, a = arm * Math.PI + u * 6 + t * (2 + 4 * k) + g;
        pset(gx + Math.cos(a) * r, gy + Math.sin(a) * r * .55, u < .2 ? 1 : [14, 4, 7][g]);
      }
      disc(gx, gy, 2 + 2 * sc, 1);
    }
    const f = seg(lt, dur - .35, dur);
    if (f > 0) disc(cx, cy, 4 + 300 * f * f, 1);
    clawd(148, 150 - Math.round(Math.sin(t * 2) * 3), 1, { eyes: 'star', mouth: 'o', aL: 0, aR: 0 });
    lyricBar(t, 176, i => [4, 14, 1, 7][(i + fr) % 4]);
    clipAll();
  }
  // 66.0 · One E thirty flops a second: a planet-sized GPU; its odometer overflows and zeros bounce out
  function flops(t, lt, dur, fr) {
    fillAll(6); borderBars(t, BARS.gold, 2);
    clipScreen(); screenFill(0); stars(t, t * 10, 0, 50);
    if (lt < .25) screenFill(1);
    gpu(24, 80, 272, 70, t * 2, 2);
    // the odometer: digits spin faster and faster, then overflow
    const over = lt > 2.4, n = Math.floor(Math.pow(10, 1 + lt * 12)) % 1e15;
    rect(40, 30, 240, 22, 11); rect(42, 32, 236, 18, 0);
    const shown = over ? '000000000000000' : String(n).padStart(15, '0');
    text(shown.slice(-15), 44, 35, 7, { sx: 1, sy: 2, col: i => over && fr % 6 < 3 ? 2 : 7 });
    text('1E30', 132, 60, 1, { sx: 1, sy: 2 });
    if (over) for (let i = 0; i < 16; i++) {   // zeros pour out like gumballs and bounce
      const a = lt - 2.4 - i * .06; if (a < 0) continue;
      const vx = (hash(i) - .5) * 160, x = 60 + (i % 15) * 16 + vx * a; let y = 40 + 200 * a * a - 90 * a;
      const floor = 184; if (y > floor) { const tb = a - (90 + Math.sqrt(90 * 90 + 800 * (floor - 40))) / 400; y = floor - Math.abs(Math.sin(tb * 7)) * 30 * Math.exp(-tb * 2); }
      drawChar('0', x, y, RAINBOW[i % RAINBOW.length], 2, 2);
    }
    const pct = lt > 3 ? 61 : 34; text(pct + '%', 280, 6, fr % 10 < 5 && lt > 3 ? 7 : 1);
    lyricBar(t, 158, i => (i + (fr >> 1)) % 3 ? 7 : 1);
    clipAll();
  }
  // 70.0 · That was safe enough, we reckoned: hard-hat Clawds shut the vault… it has no back wall
  function vault(t, lt, dur, fr) {
    fillAll(11); clipScreen(); screenFill(12);
    const pan = -150 * ease(seg(lt, 1.5, 2.3));
    rect(0, 150, 320, 50, 11);
    const vx = 140 + pan;
    rect(vx - 20, 20, 170, 132, 15); rect(vx - 14, 26, 158, 120, 11);   // the vault box (seen from the side after the pan)
    if (pan < -20) { rect(vx + 144, 26, 6, 120, 12); shoggothBlob(vx + 210, 92, 26, t, { wob: 3, n: 5 }); const w = Math.round(Math.sin(t * 10) * 8); line(vx + 190, 80, vx + 176 + w, 52, 5, 4); }
    else shoggothBlob(vx + 65, 86, 30, t, { wob: 2, n: 6 });
    // the door, swinging shut from the left
    const shut = ease(seg(lt, .2, 1.0)), dw = Math.round(lerp(40, 150, shut));
    rect(vx - 10, 30, dw, 112, 12); rect(vx - 6, 34, dw - 8, 104, 15);
    if (shut > .9) { const dx = vx + 65; disc(dx, 86, 26, 12); ring(dx, 86, 26, 11, 3); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + lt * 5 * (lt < 1.4 ? 1 : 0); line(dx, 86, dx + Math.cos(a) * 20, 86 + Math.sin(a) * 20, 11, 3); } disc(dx, 86, 6, 1); }
    // two hard-hat Clawds push, then high-five
    const five = lt > 1.1 && lt < 1.5;
    clawd(vx - 60 + 60 * shut, 108, 2, { view: five ? 'front' : 'side', hat: 'hard', eyes: 'happy', mouth: 'grin', aL: five ? 0 : 0, aR: five ? 1 : 0 });
    clawd(vx - 110 + 60 * shut, 108, 2, { view: five ? 'front' : 'side', hat: 'hard', eyes: 'happy', mouth: 'grin', aL: five ? 1 : 0 });
    lyricBar(t, 172, i => (i + fr) % 10 < 5 ? 1 : 7);
    clipAll();
    if (lt > dur - .3) { clipScreen(); rasterWipe(seg(lt, dur - .3, dur), 9, -1); clipAll(); }
  }

  screen(59.0, stage2); screen(60.5, basiliskShot); screen(63.0, moon); screen(64.5, omega); screen(66.0, flops); screen(70.0, vault);
})();
