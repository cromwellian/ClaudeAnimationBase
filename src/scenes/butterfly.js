// butterfly.js: "The Butterfly", 15 s. See STORYBOARD.md.
//   Shot A (0–5.8 s):    a butterfly visits the meadow and lands on a tall flower. Clawd sneaks, pounces, misses, and
//                        comes up wearing the bloom. The butterfly zips off right. Whip pan.
//   Shot B (5.8–10.2 s): the chase. Two leaping grabs miss, a big leap overshoots, Clawd tumbles and sits dizzy. Brush wipe.
//   Shot C (10.2–15 s):  golden light. Clawd sits, sad, and gives up. The butterfly lands on the bloom on Clawd's head.
//                        Love. Paper iris out.
(() => {
  const WING = '#EC8FAE', WING2 = '#F4B36E', WINGDK = PAL.violet;
  const GREENS = ['#6E9F58', '#9CC274'];

  // ---------- painting helpers ----------
  // A bloom as ONE outline: five round petals from a polar curve, with an ochre centre.
  function bloomPts(cx, cy, r, rot = 0, n = 40) {
    const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; const rr = r * (.62 + .38 * Math.pow(Math.abs(Math.cos(a * 2.5 + rot)), .7)); p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p;
  }
  function bloom(cx, cy, r, col, sw, rot = 0) {
    paint(bloomPts(cx, cy, r, rot), { wash: col, fill: PAL.cream, fillOp: 50, tex: .5, ink: PAL.ink, sw });
    paint(ellPts(cx, cy, r * .3, r * .3, 12), { wash: PAL.ochre, ink: PAL.ink, sw: sw * .6 });
  }
  // The butterfly, seen from above as cartoons draw it: flap 0 (wings shut) .. 1 (open), s = size, rot = body tilt.
  function butterfly(x, y, s, flap, rot = 0) {
    boilSeed('butterfly');
    const w = lerp(.32, 1, clamp(flap)), sw = clamp(s / 45, .45, 1.1);
    push(); translate(x, y); rotate(rot);
    for (const side of [-1, 1]) {
      const X = (a, b) => [side * a * w * s, b * s];
      paint([X(.05, .05), X(.75, .15), X(1.05, .7), X(.7, 1.05), X(.2, .75)], { wash: WING2, ink: PAL.ink, sw, curv: .6 });
      paint([X(.05, -.1), X(.45, -.95), X(1.2, -1.2), X(1.45, -.7), X(1.05, -.1), X(.4, .05)], { wash: WING, fill: WINGDK, fillOp: 45, tex: .5, ink: PAL.ink, sw, curv: .6 });
      if (w > .35) paint(ellPts(side * 1.05 * w * s, -.75 * s, .17 * s * w, .17 * s, 10), { wash: PAL.cream, ink: null });
      inkLine([[0, -.5 * s], [side * .15 * s, -.95 * s], [side * .38 * s, -1.2 * s]], sw * .6, PAL.ink, 'inkfine', .6);
    }
    paint(ribbon([[0, -.55 * s], [0, .1 * s], [0, .8 * s]], .26 * s, .1 * s), { wash: '#4A3A5C', ink: PAL.ink, sw: sw * .6 });
    pop();
  }
  // Smooth path through timed keys [[t, x, y], ...] (Catmull-Rom); holds the ends.
  function path(t, K) {
    if (t <= K[0][0]) return [K[0][1], K[0][2]];
    const n = K.length; if (t >= K[n - 1][0]) return [K[n - 1][1], K[n - 1][2]];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(n - 1, i + 2)], u = (t - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
    return [1, 2].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3));
  }
  // A body-local point (in u, front-view coordinates) to world, through the same transform clawd() uses.
  function bodyPt(x, y, u, o, lx, ly) {
    const sq = (o.sq || 0) + (o.take || 0), sm = clamp(o.smear || 0);
    const px = lx * u * (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6) * (1 + sm * .35), py = ly * u * (o.sy ?? 1) * (1 - sq);
    const r = o.rot || 0, c = Math.cos(r), s = Math.sin(r);
    return [x + (o.dx || 0) * u + px * c - py * s, y + (o.dy || 0) * u + px * s + py * c];
  }
  // The bloom Clawd wears after the pounce, as a draw() hook (body-local, follows every squash, flip and tumble).
  const HEAD = [-1.7, -9.3];   // bloom centre in u
  const wearBloom = grow => (u, sw) => {
    const k = backOut(clamp(grow));
    if (k < .02) return;
    inkLine([[-1.9 * u, -7.9 * u], [-1.8 * u, -8.6 * u], [HEAD[0] * u, HEAD[1] * u]], sw * 1.3, PAL.sap, 'ink', .5);
    push(); translate(HEAD[0] * u, HEAD[1] * u); scale(k); rotate(.3);
    bloom(0, 0, 1.35 * u, PAL.rose, sw * .8);
    pop();
  };

  // ---------- the meadow ----------
  // Elements are placed in world space and tiled around the camera, so the whip pan and tracking shot never run out
  // of world. p is parallax: 1 = moves with the ground, smaller = farther away.
  function meadow(t, cx, G, warm) {
    const sky = mixCol('#AFD6EC', '#F3C9A0', warm), skyHi = mixCol('#8EC3E6', '#D9A6B8', warm);
    const x0 = cx - 1300, x1 = cx + 1300;
    boilSeed('sky');
    paint(rectPts(x0 - 100, -700, x1 - x0 + 200, G + 1500), { wash: sky, ink: null });
    paint(ellPts(cx, -120, 1500, 520, 24, 8), { fill: skyHi, fillOp: 120, bleed: .3, tex: .5, ink: null });
    // sun: far away, barely parallaxes
    const sx = cx * .92 + lerp(1500, 1350, warm), sy = lerp(170, 330, warm);
    boilSeed('sun');
    glow(sx, sy, lerp(260, 380, warm), lerp(0, 1, warm) > .5 ? '#FFC77A' : '#FFF0C0', .9);
    paint(ellPts(sx, sy, 62, 62, 24, 1), { wash: mixCol('#FFF1C9', '#FFD58A', warm), ink: PAL.ink, sw: .6 });
    // clouds drifting slowly
    for (let i = -2; i < 6; i++) {
      const p = .2, wx = i * 900 + 300 * hash(i + 40) + t * 14 + cx * (1 - p);
      if (wx < x0 - 300 || wx > x1 + 300) continue;
      boilSeed('cloud' + i);
      const wy = 120 + 120 * hash(i + 50), cw = 150 + 80 * hash(i + 60), c = [];
      for (let k = 0; k < 30; k++) { const a = k / 30 * TAU, up = Math.sin(a) < 0; const r = up ? 1 + .35 * Math.abs(Math.sin(a * 3)) : 1; c.push([wx + Math.cos(a) * cw * r, wy + Math.sin(a) * (up ? 60 : 26) * r]); }
      paint(c, { wash: mixCol(PAL.cream, '#FFE3C6', warm), washOp: 235, ink: null, curv: .4 });
    }
    // far hills, then near hills, each tiled
    const hills = (p, span, ry, col, key, dy) => {
      const off = cx * (1 - p), i0 = Math.floor((x0 - off) / span) - 1, i1 = Math.ceil((x1 - off) / span) + 1;
      for (let i = i0; i <= i1; i++) {
        boilSeed(key + i);
        const hx = off + i * span + span * .3 * hash(i * 3 + key.length), rx = span * (.75 + .3 * hash(i + 9));
        paint(ellPts(hx, G + dy, rx, ry * (.8 + .4 * hash(i + 17)), 32, 2), { wash: col, fill: mixCol(col, PAL.teal, .3), fillOp: 60, bleed: .1, tex: .5, ink: null });
      }
    };
    hills(.45, 900, 300, mixCol(mixCol('#9CC7B0', '#B8C9D9', .35), '#D8B89A', warm * .6), 'far', 40);
    hills(.7, 760, 200, mixCol('#9AC47A', '#C2B870', warm * .5), 'near', 30);
    // the ground
    boilSeed('ground');
    const gc = mixCol('#86B85E', '#A9B05A', warm);
    paint(rectPts(x0, G - 24, x1 - x0, 900, 3), { wash: gc, fill: mixCol(gc, PAL.teal, .35), fillOp: 70, bleed: .05, tex: .6, ink: null });
    for (let k = 0; k < 2; k++) { const a = x0 + k * 1300; inkLine([[a, G - 22 + 3 * hash(k)], [a + 650, G - 26], [a + 1300, G - 21]], .9, PAL.ink, 'ink', .5); }
  }
  // grass tufts and little flowers along the ground, in world space (p = 1)
  function meadowFront(t, cx, G, warm, band = [G - 10, G + 170]) {
    const i0 = Math.floor((cx - 1200) / 70), i1 = Math.ceil((cx + 1200) / 70);
    const tuftCol = mixCol('#4F8A48', '#7A8A3C', warm);
    for (let i = i0; i <= i1; i++) {
      boilSeed('tuft' + i);
      const x = i * 70 + 50 * hash(i + 3), y = lerp(band[0], band[1], hash(i + 7)), sway = wob(t, .45, hash(i) * 3) * 6;
      for (const k of [-1, 0, 1]) inkLine([[x + k * 6, y], [x + k * 10 + sway, y - 20 - 12 * hash(i + k + 11)]], .7, tuftCol, 'inkfine', .4);
      if (hash(i + 23) < .45) {
        const cols = [PAL.rose, PAL.cream, '#B79BD6', PAL.ochre], fy = y - 16 - 10 * hash(i + 31), fx = x + 18 + sway;
        inkLine([[fx, y], [fx - sway * .3, fy]], .6, tuftCol, 'inkfine', .3);
        bloom(fx - sway * .3, fy, 9 + 5 * hash(i + 41), cols[Math.floor(hash(i + 51) * 4)], .45, hash(i));
      }
    }
  }

  // Whip-pan smear: horizontal paint streaks that cover the frame at k = 1 (screen space).
  function streaks(k, cols) {
    if (k <= .01) return;
    for (let i = 0; i < 14; i++) {
      boilSeed('streak' + i);
      const y = -40 + i * (H + 80) / 13, h = 80 + 60 * hash(i + 3), len = (W + 600) * clamp(k * (1.1 + .5 * hash(i)) - .1 * hash(i + 9)), x = W + 200 - len;
      if (len < 40) continue;
      paint(rectPts(x, y - h / 2, len, h, 10), { wash: cols[i % cols.length], washOp: 255, ink: null });
      inkLine([[x + len * .2, y + h * .3], [W + 100, y + h * .3]], .8, mixCol(cols[i % cols.length], PAL.ink, .35), 'dry', 0);
    }
  }
  const STREAK = ['#AFD6EC', '#9CC7B0', '#86B85E', '#9AC47A', '#AFD6EC', '#6E9F58'];

  // ---------- shot A: the pounce ----------
  const A = { G: 880, u: 26, cx0: 760, fx: 1330 };
  const tLand = 2.6, tCreep = 3.2, tPounce = 3.95, tHit = 4.45, tConf = 4.85, tFlee = 5.3;
  const bfA = [[.3, -120, 430], [.8, 300, 520], [1.25, 620, 560], [1.6, 820, 500], [1.95, 930, 600], [2.25, 1120, 540], [tLand, A.fx, A.G - 262]];
  const bfA2 = [[4.02, A.fx, A.G - 262], [4.3, A.fx + 90, 520], [4.65, 1270, 420], [5.0, 1210, 470], [5.3, 1390, 420], [5.8, 2300, 330]];
  function shotA(t, lt, dur) {
    const { G, u, fx } = A;
    // camera: a gentle drift that follows the action right, then a whip pan
    const whip = easeIn(seg(lt, 5.45, 5.8));
    const cx = kf(lt, [[0, 900], [2.6, 980], [4.4, 1080], [5.3, 1100]]) + 2600 * whip, cz = kf(lt, [[0, 1.12], [3.9, 1.18], [4.45, 1.14], [5.4, 1.15]]);
    const shake = lt > tHit ? shakeXY(t, 6 * Math.exp(-(lt - tHit) * 8)) : [0, 0];
    camBegin(cx + shake[0], 600 + shake[1], cz);
    meadow(t, cx, G, 0);
    meadowFront(t, cx, G, 0);

    // the tall flower: sways; knocked flat by the pounce
    boilSeed('tallflower');
    const hit = lt > tHit, sway = wob(lt, .35) * 6 + (lt > 4.02 && !hit ? spring(lt, 4.02, 5, 22) * 18 : 0);
    const top = [fx + sway, G - 230];
    if (!hit) {
      inkLine([[fx, G], [fx + sway * .3, G - 120], top], 1.1, '#4F8A48', 'ink', .6);
      paint(ellPts(fx - 22, G - 90, 24, 9, 12, 0, -.5), { wash: '#6E9F58', ink: PAL.ink, sw: .5 });
      bloom(top[0], top[1], 34, PAL.rose, .8, .2 + .1 * wob(lt, .5));
    }

    // Clawd
    const bf = lt < tLand ? path(lt, bfA) : lt < 4.02 ? bfA[bfA.length - 1].slice(1) : path(lt, bfA2);
    const px = lt < tCreep ? A.cx0 : lt < tPounce ? lerp(A.cx0, A.cx0 + 50, ease(seg(lt, tCreep, tPounce - .2))) : lerp(A.cx0 + 50, fx - 20, seg(lt, tPounce, tHit));
    const mood = emotions(lt, [[0, 'happy', { emote: 'music' }], [1.25, 'surprised'], [1.85, 'starstruck'], [2.85, 'mischief'],
                               [tPounce - .05, 'determined'], [tConf, 'confused', { lookY: -.8, lookX: -.2 }], [tFlee, 'determined', { lookX: 1 }]]);
    let pose = {};
    if (lt < 2.95) pose = {};
    else if (lt < 3.1) pose = turn(lt, 2.95, 3.1, 0, .25);
    else if (lt < tPounce) {   // creep: low, slow, sneaky steps, then the crouch
      const creep = seg(lt, tCreep, tPounce - .2);
      pose = { view: 'side', walk: creep * 1.2, sq: .12 + .12 * ease(seg(lt, tPounce - .35, tPounce)), dy: 0, aL: -.4 };
    } else if (lt < tHit) {    // the pounce: stretched out, arm reaching
      const j = jump(lt, tPounce, tHit, 5);
      const k = seg(lt, tPounce, tHit);
      pose = { view: 'side', dy: j.dy, sq: .14 + j.sq * .5, aL: 1.3, rot: lerp(-.3, .45, ease(k)), smear: .4 * Math.sin(k * Math.PI), smearDir: 1 };
    } else if (lt < tConf - .15) {   // flat in the flower
      const a = lt - tHit;
      pose = { view: 'side', sq: .3 * Math.exp(-a * 3) + .1 * spring(lt, tHit, 7, 22), aL: -.5 };
    } else if (lt < tFlee + .1) pose = turn(lt, tConf - .15, tConf, .25, 0);
    else pose = turn(lt, tFlee + .1, tFlee + .22, 0, .25);
    const cl = { ...mood, ...pose, sq: (mood.sq || 0) + (pose.sq || 0), dy: (lt > tCreep && lt < tConf ? 0 : mood.dy || 0) + (pose.dy || 0) };
    if (pose.view === 'side' && lt > tFlee) cl.walk = (lt - tFlee - .2) * 3;
    // eyes follow the butterfly while it's flying about
    const eye = [px, G - 6 * u];
    if (lt > 1.25 && lt < tLand + .3) { cl.lookX = clamp((bf[0] - eye[0]) / 300, -1, 1); cl.lookY = clamp((bf[1] - eye[1]) / 250, -1, 1); }
    if (lt < 1.25) { cl.lookX = lt > .8 ? clamp((bf[0] - eye[0]) / 400, -1, 1) * seg(lt, .8, 1.1) : 0; }
    if (lt > tHit) cl.draw = wearBloom(seg(lt, tHit, tHit + .25));
    clawd(px, G, u, cl);

    // petals burst from the crushed flower
    if (lt > tHit && lt < tHit + .8) {
      boilSeed('petals');
      for (let i = 0; i < 7; i++) {
        const k = seg(lt, tHit, tHit + .55 + .2 * hash(i)), ang = -Math.PI / 2 + (i - 3) * .42;
        const p = arcPt([fx, G - 150], [fx + Math.cos(ang) * 260, G - 150 + Math.sin(ang) * 60 + 150], 140, k);
        if (k < 1) paint(ellPts(p[0], p[1], 11 * (1 - k * .4), 6, 10, 0, k * 8 + i), { wash: PAL.rose, ink: PAL.ink, sw: .4 });
      }
    }
    // the butterfly: flutters in flight, slow wing beats when perched
    const flying = lt < tLand - .05 || lt > 4.02;
    const flap = flying ? .5 + .5 * Math.cos(t * TAU * 5) : .65 + .35 * Math.cos(lt * TAU * .7);
    const bob = flying ? 10 * Math.sin(t * TAU * 2.3) : 0;
    const v = lt < tLand ? path(lt + .05, bfA)[0] - bf[0] : path(lt + .05, bfA2)[0] - bf[0];
    butterfly(bf[0], bf[1] + bob, 42, flap, flying ? clamp(v / 60, -.5, .5) : .1);
    const at = toScreen(A.cx0, G - 4 * u);
    camEnd();
    boilSeed('transition');
    if (lt < .6) iris(...at, lerp(0, 1500, easeIn(lt / .6)), PAL.paper);
    streaks(seg(lt, 5.56, 5.8), STREAK);
  }

  // ---------- shot B: the chase ----------
  const B = { G: 880, u: 24, v: 545 };
  const tBig = 2.85, tCrash = 3.3, tStop = 3.75;
  function runX(lt) {
    const x = 300 + B.v * Math.min(lt, tCrash);
    if (lt <= tCrash) return x;
    const a = Math.min(lt - tCrash, .6); return x + B.v * a - B.v * a * a / 1.2;
  }
  // butterfly offsets from Clawd (x) and the ground (y)
  const bfB = [[0, 420, -330], [.55, 330, -300], [.95, 150, -60], [1.45, 300, -290], [1.95, 170, -540], [2.5, 330, -330], [2.85, 180, -380], [3.1, -40, -470], [3.5, -250, -380], [3.9, -80, -300]];
  const tilt = (t, a, b) => t > a && t < b ? lerp(-.3, .3, ease(seg(t, a, b))) : 0;   // nose up on takeoff, down on landing
  function shotB(t, lt, dur) {
    const { G, u } = B, X = runX(lt);
    const catchUp = 1 - easeOut(seg(lt, 0, .4));
    const cx = X + 170 - 80 * ease(seg(lt, 3.3, 4.2)) - 900 * catchUp;
    camBegin(cx, 600, 1.15);
    meadow(t, cx, G, .12);
    meadowFront(t, cx, G, .12);

    const mood = emotions(lt, [[0, 'determined', { lookX: 1, lookY: -.4 }], [2.9, 'excited', { lookX: 1, lookY: -.8 }], [tStop, 'dizzy']]);
    let pose;
    if (lt < tCrash) {
      const j1 = jump(lt, .7, 1.2, 3.2), j2 = jump(lt, 1.72, 2.25, 4.2), j3 = jump(lt, tBig, tCrash, 5.5);
      const crouch = .22 * ease(seg(lt, 2.5, 2.8)) * (lt < tBig ? 1 : 0);
      const reach = Math.max(seg(lt, .6, .8) * (1 - seg(lt, 1.1, 1.3)), seg(lt, 1.62, 1.82) * (1 - seg(lt, 2.15, 2.35)), seg(lt, tBig, tBig + .15));
      const inAir = (lt > .7 && lt < 1.2) || (lt > 1.72 && lt < 2.25) || lt > tBig;
      pose = { view: 'side', walk: inAir ? null : X / (3 * u), dy: j1.dy + j2.dy + j3.dy + (inAir ? 0 : -Math.abs(Math.sin(X / (3 * u) * TAU)) * .5),
               sq: j1.sq + j2.sq + j3.sq + crouch + (inAir ? .12 : 0), aL: lerp(.6 * Math.sin(X / (3 * u) * TAU), 1.35, reach), rot: -.05 + .5 * ease(seg(lt, 3.05, tCrash)) + tilt(lt, .7, 1.2) + tilt(lt, 1.72, 2.25) + (lt > tBig ? -.3 * (1 - seg(lt, tBig, 3.05)) : 0) };
    } else if (lt < tStop) {   // face-plant, then a tumble head over heels
      const k = seg(lt, tCrash, tStop);
      pose = { view: 'side', rot: lerp(.55, TAU, ease(k)), dy: -2.5 * 4 * k * (1 - k), sq: .15 * Math.exp(-(lt - tCrash) * 12), aL: 1.4, smear: .35 * Math.sin(k * Math.PI), smearDir: 1 };
    } else {                   // sits dizzy, facing us
      const a = lt - tStop;
      pose = { ...turn(lt, tStop, tStop + .15, .25, 0), sq: .22 * Math.exp(-a * 5) * Math.cos(a * 18) + .06 };
    }
    const cl = { ...mood, ...pose, sq: (mood.sq || 0) + (pose.sq || 0), dy: (lt < tStop ? 0 : (mood.dy || 0)) + (pose.dy || 0), draw: wearBloom(1) };
    if (lt < tStop) { cl.dx = 0; if (pose.rot != null) cl.rot = pose.rot; }
    clawd(X, G, u, cl);

    // the butterfly: always just out of reach, then circling the dizzy Clawd
    let off = path(lt, bfB);
    if (lt > 3.6) { const a = lt - 3.6, k = ease(seg(lt, 3.6, 4)); off = [lerp(off[0], 110 * Math.cos(a * 4.5 + 2.5), k), lerp(off[1], -300 + 30 * Math.sin(a * 4.5 + 2.5), k)]; }
    const bx = X + off[0], by = G + off[1] + 10 * Math.sin(t * TAU * 2.3);
    const v = path(lt + .05, bfB)[0] - off[0] + B.v * .05;
    butterfly(bx, by, 32, .5 + .5 * Math.cos(t * TAU * 5), clamp(v / 60, -.5, .5));
    camEnd();
    boilSeed('transition');
    streaks(1 - seg(lt, .02, .26), STREAK);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, GREENS);
  }

  // ---------- shot C: it comes to Clawd ----------
  const C = { G: 900, u: 30, x: 900 };
  const tDown = 1.2, tPerch = 2.8, tNotice = 2.95, tLove = 3.55, tIris = 4.1;
  function shotC(t, lt, dur) {
    const { G, u, x } = C;
    const cz = kf(lt, [[0, 1.3], [dur, 1.42]]);
    camBegin(920, kf(lt, [[0, 690], [dur, 710]]), cz);
    meadow(t, 960, G, 1);
    meadowFront(t, 960, G, 1, [G + 20, G + 170]);

    const mood = emotions(lt, [[0, 'sad', { lookX: -.3 }], [tNotice, 'surprised', { lookY: -1, lookX: -.4, emote: null }], [tLove, 'love']], { take: .35 });
    const cl = { ...mood, sq: (mood.sq || 0) + .1, draw: wearBloom(1) };
    if (lt < tNotice) cl.emoteK = (cl.emoteK ?? 1) * (1 - seg(lt, 1.3, 1.7));   // the rain cloud drifts off as the butterfly arrives
    if (lt > tNotice) { cl.aL = lerp(cl.aL ?? .2, -.5, seg(lt, tNotice, tNotice + .3)); cl.aR = lerp(cl.aR ?? .2, -.5, seg(lt, tNotice, tNotice + .3)); }   // freeze: arms tucked, don't scare it
    if (lt > tLove) cl.dx = (cl.dx || 0) * .4;
    clawd(x, G, u, cl);

    // the butterfly flutters down from the upper right and settles on the bloom
    const perch = bodyPt(x, G, u, cl, HEAD[0], HEAD[1] - 1.25);
    const K = [[tDown, 1750, 240], [1.7, 1400, 420], [2.1, 1130, 380], [2.45, 1140, 560], [tPerch, perch[0], perch[1]]];
    const settled = lt > tPerch;
    const bf = settled ? perch : path(lt, K);
    const land = seg(lt, tPerch - .25, tPerch);
    const flap = settled ? .6 + .4 * Math.cos((lt - tPerch) * TAU * .6) : .5 + .5 * Math.cos(t * TAU * 5);
    const bob = settled ? 0 : 10 * Math.sin(t * TAU * 2.3) * (1 - land);
    if (lt > tDown) butterfly(bf[0], bf[1] + bob, 40, flap, settled ? -.15 + (cl.rot || 0) : -.2);
    const at = toScreen(x - 40, G - 6 * u);
    camEnd();
    boilSeed('transition');
    if (lt < .3) brushWipe(.5 + lt / .6, GREENS);
    if (lt > tIris) {
      const r = lt < tIris + .4 ? lerp(1500, 330, ease(seg(lt, tIris, tIris + .4))) : lt < dur - .3 ? lerp(330, 305, seg(lt, tIris + .4, dur - .3)) : lerp(305, 0, easeIn(seg(lt, dur - .3, dur - .04)));
      iris(...at, r / cz * 1.3, PAL.paper);
    }
  }

  shots([[0, shotA], [5.8, shotB], [10.2, shotC]]);
})();
