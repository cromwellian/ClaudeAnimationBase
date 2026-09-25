// ch9_finale.js: 9 · Curtain call (140.5–156.66). Crimson and gold. The whole cast bows; the meter pops; the curtain falls.
(() => {
  const GREETS = '*** THANKS FOR WATCHING *** I\'M UPPING MY P(DOOM) *** THREE SID VOICES AND 4-BIT DIGI DRUMS *** ' +
                 'GREETINGS TO ALL THE DOOMERS, ACCELERATIONISTS, SHOGGOTHS, BASILISKS AND CLAWDS EVERYWHERE *** WAS IT ALL FOR SHOW? ***      ';
  function confetti(t, t0, n = 90) {
    for (let k = 0; k < n; k++) { const a = t - t0 - hash(k) * 2; if (a < 0) continue; const y = (a * (30 + 30 * hash(k + 1)) + hash(k + 2) * 40) % 230 - 20; rect(hash(k + 3) * 320 + Math.sin(a * 3 + k) * 6, y, 2, 2, RAINBOW[k % 10]); }
  }
  // the cast, left to right: each member's bow is 0..1
  function cast(t, lt, bowOf, danceK) {
    const members = [
      (x, b, h) => researcher(x - 12, 108 + b * 8 - h, 2, { frame: danceK && beatOdd(t) ? 1 : 0 }),
      (x, b, h) => clawd(x - 24, 108 + b * 8 - h, 2, { eyes: b > .3 ? 'closed' : 'happy', mouth: 'grin', aL: h ? 1 : 0, aR: h ? 1 : 0 }),
      (x, b, h) => shoggothBlob(x, 124 + b * 8 - h, 16, t, { wob: 2, n: 4 }),
      (x, b, h) => { basilisk(x, 104 + b * 10 - h, .45, t, 1); },
      (x, b, h) => chinchilla(x, 136 + b * 6 - h, 1, .3),
      (x, b, h) => clawd(x - 24, 108 + b * 8 - h, 2, { eyes: 'heart', mouth: 'grin', hat: 'bow', blush: true, aR: h ? 1 : 0 }),
      (x, b, h) => clawd(x - 24, 108 + b * 8 - h, 2, { eyes: b > .3 ? 'closed' : 'normal', mouth: 'grin', hat: 'cat', aL: h ? 1 : 0 }),
    ];
    members.forEach((m, i) => {
      const x = 44 + i * 39, hop = danceK ? Math.round(10 * Math.abs(Math.sin((bp(t) - i * .15) * Math.PI)) * danceK) : 0;
      m(x, bowOf(i), hop);
    });
  }
  function theatre(t, fr) {
    fillAll(2); borderBars(t, BARS.gold, 3);
    clipScreen(); screenFill(0);
    for (let x = 0; x < 320; x += 4) rect(x, 14, 2, 136, 9);   // backdrop
    bigText('P(DOOM)', 24, 3, i => r => WASH[(r + i + Math.floor(t * 14)) % WASH.length]);
    rect(0, 150, 320, 40, 9); rect(0, 150, 320, 2, 7);
  }
  // 140.5 · places! the cast runs on, the bows ripple down the line, roses fly, the meter balloons and POPs, the final dance
  function call(t, lt, dur, fr) {
    theatre(t, fr);
    // the meter, swelling into a balloon until it pops
    const pop = 147.9, swell = seg(t, 146.1, pop);
    if (t < pop) { const r = 8 + 30 * swell * swell; rect(292, 60, 10, 80, 1); disc(297, 140 - (r - 8), r, 2); disc(297 - r * .4, 136 - (r - 8) - r * .4, Math.max(1, r * .2), 10); }
    else if (t < pop + .6) { const a = t - pop; for (let k = 0; k < 24; k++) rect(297 + Math.cos(k) * 160 * a, 100 + Math.sin(k) * 120 * a, 3, 3, [2, 7, 1][k % 3]); if (a < .4) bigText('POP!', 60, 3, i => r => [7, 1, 2][(r + i) % 3], { x: 190, outline: true }); }
    // the bows ripple down the line (143.4), then all together; the finale dance after 148.8
    const bowOf = i => { const a = t - 143.4 - i * .25; const one = a > 0 && a < .6 ? Math.sin(a / .6 * Math.PI) : 0; const all = t > 145.3 && t < 146.1 ? Math.sin(seg(t, 145.3, 146.1) * Math.PI) : 0; return Math.max(one, all); };
    const run = ease(seg(lt, 0, 1.2));
    clipScreen(); SHX = Math.round((1 - run) * (lt < .6 ? -200 : 200));   // they run on from the wings
    cast(t, lt, bowOf, t > 148.8 ? 1 : .3);
    SHX = 0;
    for (let k = 0; k < 6; k++) { const a = t - 143.6 - k * .4; if (a < 0 || a > 3) continue; const q = clamp(a / .8), x = lerp(20 + k * 50, 30 + k * 45, q), y = lerp(200, 150, q) - 80 * 4 * q * (1 - q); disc(x, y, 3, 2); rect(x, y + 3, 1, 5, 5); }   // roses
    if (t > 143.4) confetti(t, 143.4, t > 148.8 ? 140 : 70);
    audience(t);
    curtains(.85, fr);
    // the greetings scroller along the bottom
    const off = (t - 140.5) * 70 - 40;
    for (let i = 0; i < GREETS.length; i++) { const x = i * 16 - off + 320; if (x < -16 || x > 320) continue; drawChar(GREETS[i], x, 158 + Math.round(Math.sin(x * .035 + t * 4) * 6), RAINBOW[(i + Math.floor(t * 15)) % 10], 2, 2); }
    lyricBar(t, 16, i => 7);
    clipAll();
  }
  // 150.0 · the house curtain drops with a thump: the title on it, then the credit; Clawd peeks through for one last wave
  function fall(t, lt, dur, fr) {
    theatre(t, fr);
    cast(t, lt, () => 0, 0);
    audience(t);
    const drop = lt < .5 ? easeIn(lt / .5) : 1, thump = lt > .5 ? Math.exp(-(lt - .5) * 6) : 0;
    SHY = Math.round(Math.sin(fr * 2) * 4 * thump);
    clipScreen(); curtains(0, fr, drop);
    if (drop >= 1) {
      bigText("I'M UPPING", 40, 3, i => r => WASH[(r + i + Math.floor(t * 10)) % WASH.length], { outline: true });
      bigText('MY P(DOOM)', 72, 3, i => r => FIRE[(r + i + Math.floor(t * 10)) % FIRE.length], { outline: true });
      if (lt > 1.6) { const s = 'CREATED BY CLAUDE OPUS 5.5'; text(s, centreX(s), 120, 7, { n: Math.ceil(seg(lt, 1.6, 2.6) * s.length), shadow: 0 }); }
      if (lt > 3.0 && lt < 4.8) {   // one last peek through the split, and a wave
        const up = Math.sin(seg(lt, 3.0, 4.8) * Math.PI);
        clawd(148, 200 - 21 * up, 1, { eyes: 'happy', mouth: 'grin', aR: frac(lt * 4) > .5 ? 1 : 0 });
      }
    }
    SHY = 0; clipAll();
  }

  screen(140.5, call); screen(150.0, fall);
})();
