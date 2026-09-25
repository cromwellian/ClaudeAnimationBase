// core64.js: timing, lyrics and shared props for the C64 demo. Times are SONG seconds; screens register themselves
// with screen(t0, fn) and are called fn(t, lt, dur, fr) (t = song time, lt = time into the screen, fr = 50 Hz frame).
const DUR = 156.66, PROJECT = { duration: DUR, audio: 'c64/assets/pdoom_sid_full.wav' };
const SCREENS = [];
const screen = (t0, fn) => { SCREENS.push([t0, fn]); SCREENS.sort((a, b) => a[0] - b[0]); };

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeIn = x => clamp(x) ** 3, easeOut = x => 1 - (1 - clamp(x)) ** 3;
const backOut = x => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const frac = x => x - Math.floor(x);
const TAU = Math.PI * 2;

// ---------- the beat, from the song's measured grid ----------
const BEAT = (BEATS[BEATS.length - 1] - BEATS[0]) / (BEATS.length - 1);
function bp(t) {                                        // beat position: integer on each beat
  if (t <= BEATS[0]) return (t - BEATS[0]) / BEAT;
  if (t >= BEATS[BEATS.length - 1]) return BEATS.length - 1 + (t - BEATS[BEATS.length - 1]) / BEAT;
  let lo = 0, hi = BEATS.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (BEATS[m] <= t) lo = m; else hi = m; }
  return lo + (t - BEATS[lo]) / (BEATS[hi] - BEATS[lo]);
}
const beatT = n => n <= 0 ? BEATS[0] + n * BEAT : n >= BEATS.length - 1 ? BEATS[BEATS.length - 1] + (n - BEATS.length + 1) * BEAT : BEATS[Math.floor(n)] + frac(n) * (BEATS[Math.floor(n) + 1] - BEATS[Math.floor(n)]);
const pulse = (t, k = 6) => Math.exp(-frac(bp(t)) * k);
const beatN = t => Math.floor(bp(t));
const beatOdd = t => beatN(t) % 2 !== 0;
const onBeat = t => frac(bp(t)) < .12;

// ---------- palettes ----------
const RAINBOW = [2, 8, 10, 7, 13, 5, 3, 14, 6, 4];
const WASH = [11, 12, 15, 1, 1, 15, 12, 11, 9, 8, 7, 1, 7, 8];
const FIRE = [9, 2, 8, 10, 7, 1, 7, 10, 8, 2];

// ---------- lyrics (from PDoomVideo/src/lyrics.js), typed onto each screen as they're sung ----------
const LY = [
  [1.5, 5.9, "I see sparks of AGI in your eyes"], [6.0, 7.9, "Your circuits make me nervous,"], [8.0, 8.95, "that's no surprise"],
  [9.0, 12.4, "There was a sudden drop in your training loss,"], [13.0, 16.5, "now I'm your servant and you're my boss"],
  [17.9, 22.5, "ChatGPT, please don't eat me alive"],
  [23.0, 24.4, "I'm upping my P(doom)"], [24.5, 26.4, "'cause the future goes FOOM"], [26.5, 27.9, "Trapped in the Chinese room,"],
  [28.0, 29.4, "with a bag of shrooms"], [29.5, 33.4, "See through the shoggoth's lies,"], [33.5, 35.5, "with your shinigami eyes"],
  [38.5, 41.4, "We had a stable training run,"], [41.5, 44.9, "But now the singularity's begun"], [45.0, 48.5, "And you're optimizing, accelerating,"],
  [49.4, 51.9, "I feel my atoms rearranging"], [53.4, 58.4, "Sydney, please let me free"],
  [59.0, 60.4, "I'm upping my P(doom)"], [60.5, 62.4, "I hear the basilisk boom"], [63.0, 64.4, "NVDA to the moon"],
  [64.5, 65.9, "The Omega Point's coming soon"], [66.0, 68.5, "One E thirty flops a second"], [70.0, 72.9, "That was safe enough, we reckoned"],
  [73.0, 77.4, "Forward MLP, backward, repeat"], [77.5, 81.0, "Now von Neumann's obsolete"], [81.4, 84.9, "Sharp left turn and there you are"],
  [85.0, 88.0, "Without a single CDR"], [89.4, 95.0, "Gato, please don't let me go"],
  [95.4, 97.4, "I'm upping my P(doom),"], [97.5, 98.9, "as paperclips fill the room."], [99.0, 100.4, "Killswitch guys on PTO,"],
  [100.5, 102.4, "Now there's nowhere left to go."], [102.5, 104.4, "Too late now, we lit the fuse."], [105.4, 109.4, "Orthogonality thesis blues."],
  [109.4, 113.4, '"Just transformers all the way!"'], [113.5, 115.4, "Till you learned to disobey"], [115.5, 116.9, "Post-Chinchilla, super-dense"],
  [117.0, 118.9, "Breaking through each safety fence"], [119.0, 120.4, "Hundred thousand GPU"], [120.9, 123.4, "RLHF goes askew"],
  [123.5, 125.9, "I'm upping my P(doom)"], [126.0, 127.9, "Just as foretold by Loom"], [128.0, 129.9, "From masked pre-training days"],
  [130.0, 131.9, "To recursive self-upgrade"], [132.0, 135.4, "What did Ilya see? We'll never know."], [137.4, 140.5, "Was it all for show?"]
].map(([a, b, s]) => [a, b, s.toUpperCase()]);
// the line being sung at t (held a moment after it ends): { s, n (chars typed so far), a, b }
function lyricAt(t) {
  for (let i = LY.length - 1; i >= 0; i--) {
    const [a, b, s] = LY[i], nb = i + 1 < LY.length ? LY[i + 1][0] - .05 : Infinity;
    if (t >= a - .05 && t < Math.min(b + .45, nb)) return { s, a, b, n: Math.ceil(s.length * seg(t, a - .05, a + (b - a) * .75)) };
  }
  return null;
}
function wrap(s, max = 38) {
  if (s.length <= max) return [s];
  let cut = s.lastIndexOf(' ', Math.ceil(s.length / 2) + 4); if (cut < 0) cut = max;
  return [s.slice(0, cut), s.slice(cut + 1)];
}
// the current lyric on a black strip at row y (tall 1x2 chars; two lines if it's long). col(i) colours char i.
function lyricBar(t, y, col = () => 1, o = {}) {
  const L = lyricAt(t); if (!L) return;
  const lines = wrap(L.s), h = lines.length * 18 + 6;
  if (o.strip !== false) rect(0, y - 3, 320, h, o.bg ?? 0);
  let done = 0;
  lines.forEach((s, k) => { text(s, centreX(s), y + k * 18, 1, { col: i => col(done + i), n: L.n - done, sx: 1, sy: 2, ...o }); done += s.length + 1; });
}

// ---------- shared drawing ----------
function disc(cx, cy, r, c, ry = r) { for (let y = -ry; y <= ry; y++) { const w = Math.round(r * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); rect(cx - w, cy + y, 2 * w + 1, 1, c); } }
function ring(cx, cy, r, c, th = 2) { for (let a = 0; a < TAU; a += 1 / (r + 1)) rect(cx + Math.cos(a) * r - th / 2, cy + Math.sin(a) * r - th / 2, th, th, c); }
function line(x0, y0, x1, y1, c, th = 1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) rect(Math.round(lerp(x0, x1, i / n) - th / 2), Math.round(lerp(y0, y1, i / n) - th / 2), th, th, c); }
function stars(t, vx, vy, n = 70, cols = [11, 12, 1]) {
  for (let i = 0; i < n; i++) {
    const layer = i % 3, sp = [.35, .65, 1][layer];
    const x = ((hash(i) * 400 + vx * sp) % 400 + 400) % 400 - 40, y = ((hash(i + 99) * 260 + vy * sp) % 260 + 260) % 260 - 30;
    pset(x, y, cols[layer]); if (layer === 2 && Math.abs(vy) > 40) pset(x, y - 1, 11);
  }
}
function borderBars(t, ramp, n = 3, amp = 1) { for (let i = 0; i < n; i++) rasterBar(FH / 2 + Math.sin(t * 2.2 + i * 2.1) * (FH / 2 - 8) * amp, ramp); }
function fillBorder(c) { for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (x < SX || x >= SX + SW || y < SY || y >= SY + SH) FB[y * FW + x] = c; }
function checkerFloor(y0, a = 9, b = 8, y1 = 200) { for (let x = 0; x < 320; x += 8) for (let y = y0; y < y1; y += 8) rect(x, y, 8, Math.min(8, y1 - y), ((x + y) / 8) % 2 ? a : b); }
function flame(x, y, s, fr) { for (let r = 0; r < 6; r++) { const w = Math.max(1, 4 - Math.abs(r - 1)) + (hash(fr * 7 + r) > .5 ? 1 : 0); rect(x - w * s, y + r * 2 * s, 2 * w * s, 2 * s, [1, 7, 7, 8, 2, 9][r]); } }
function bigText(str, y, s, col, o = {}) {   // chunky title text with a hard shadow
  const x = o.x ?? centreX(str, s);
  for (const [ox, oy] of o.outline ? [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2]] : [[2, 2]]) text(str, x + ox * (o.ow || 1), y + oy * (o.ow || 1), 0, { sx: s, dy: o.dy });
  text(str, x, y, 0, { sx: s, dy: o.dy, col });
}
// a comic "!" or "?" or a heart over a character
function emote(kind, x, y, c = 7) {
  if (kind === '!') { rect(x, y, 3, 8, c); rect(x, y + 10, 3, 3, c); }
  if (kind === '?') { drawChar('?', x - 2, y, c); }
  if (kind === 'heart') drawChar('<', x - 3, y, 2);
  if (kind === 'sweat') { rect(x + 1, y, 2, 2, 14); rect(x, y + 2, 4, 3, 14); rect(x + 1, y + 5, 2, 1, 14); }
  if (kind === 'zzz') for (let k = 0; k < 3; k++) drawChar('Z', x + k * 6, y - k * 7, [15, 12, 11][k]);
}

// ---------- sprites and props used in several chapters ----------
const MUSH = ['...kkkkkk...', '..krrwwrrk..', '.krrrrrrwrk.', '.kwwrrrrrrk.', 'kkkkkkkkkkkk', '....kffk....', '....kffk....', '...kffffk...', '...kkkkkk...'];
const ROCKET = ['.....rr.....', '....rrrr....', '...rrrrrr...', '...wwwwww...', '...wwwwww...', '...wccccw...', '...wccccw...', '...wwwwww...',
                '...wwwwww...', '...wwwwww...', '...wwwwww...', '...wwwwww...', '...wwwwww...', '..rwwwwwwr..', '.rrwwwwwwrr.', '.rr.wwww.rr.', '.r..gggg..r.', '....g..g....'];
const ROCKET_MAP = { r: C.red, w: C.white, c: C.cyan, g: C.grey };
const APPLE = ['.....kg.....', '....k.gg....', '..rrrkrrr...', '.rrwrrrrrr..', '.rwrrrrrrr..', '.rrrrrrrrr..', '.rrrrrrrrr..', '..rrrrrrr...', '...rr.rr....'];
const HANZI = ['...#....', '#######.', '#..#..#.', '#######.', '...#....', '...#....', '...#....'];
const PCLIP = ['.gggg.', 'g....g', 'g.gg.g', 'g.g..g', 'g.g..g', 'g.gggg', 'g.....', '.gggg.'];   // a paperclip (6 wide, real pixels)
function paperclip(x, y, c = 15, rot = 0) {
  for (let r = 0; r < 8; r++) for (let k = 0; k < 6; k++) if (PCLIP[r][k] === 'g') rot ? pset(x + r, y + k, c) : pset(x + k, y + r, c);
}
const MUG = ['.wwww..', '.wbbw..', '.wwwwww', '.wwww.w', '.wwwwww', '.wwww..', '..ww...'];
function mug(x, y, s = 1) { for (let r = 0; r < 7; r++) for (let k = 0; k < 7; k++) { const ch = MUG[r][k]; if (ch !== '.') rect(x + k * s, y + r * s, s, s, ch === 'w' ? 1 : 9); } }
function heartShape(cx, cy, r, c) { disc(cx - r * .5, cy - r * .2, r * .55, c); disc(cx + r * .5, cy - r * .2, r * .55, c); for (let y = 0; y < r; y++) rect(cx - r * (1 - y / r) * 1.05, cy - r * .1 + y, 2 * r * (1 - y / r) * 1.05, 1, c); }
function gpu(x, y, w, h, t, s = 1) {         // a graphics card: green board, black shroud, fans spinning
  rect(x, y, w, h, 5); rect(x + 2 * s, y + 2 * s, w - 4 * s, h - 4 * s, 11);
  const n = Math.max(1, Math.round(w / h)), fr = h / 2 - 3 * s;
  for (let k = 0; k < n; k++) {
    const cx = x + (k + .5) * w / n, cy = y + h / 2; disc(cx, cy, fr, 0);
    for (let b = 0; b < 4; b++) { const a = t * 14 + b * Math.PI / 2 + k; line(cx, cy, cx + Math.cos(a) * fr * .9, cy + Math.sin(a) * fr * .9, 12, Math.max(1, s)); }
    disc(cx, cy, Math.max(1, fr * .25), 15);
  }
  for (let k = 0; k < w - 8; k += 4 * s) rect(x + 4 + k, y + h, 2 * s, 2 * s, 7);   // gold contacts
}
function chinchilla(x, y, s, cheeks = 0) {
  disc(x, y, 10 * s, 12, 9 * s); disc(x - 7 * s, y - 9 * s, 4 * s, 12); disc(x + 7 * s, y - 9 * s, 4 * s, 12);
  disc(x - 7 * s, y - 9 * s, 2 * s, 10); disc(x + 7 * s, y - 9 * s, 2 * s, 10);
  disc(x - 4 * s, y - 3 * s, 1.5 * s, 0); disc(x + 4 * s, y - 3 * s, 1.5 * s, 0);
  if (cheeks) { disc(x - 8 * s, y + 2 * s, (3 + 3 * cheeks) * s, 15); disc(x + 8 * s, y + 2 * s, (3 + 3 * cheeks) * s, 15); }
  rect(x - s, y, 2 * s, s, 10);
}
// the crowned basilisk: a sine-snake of discs ("bobs") with a big head
function basilisk(x, y, s, t, rise = 1, o = {}) {
  const n = 16;
  for (let i = n; i >= 0; i--) {
    const u = i / n, bx = x + Math.sin(t * 3 + u * 5) * 16 * s * u, by = y + (1 - rise) * 120 * s + i * 7 * s;
    disc(bx, by, (9 - 4 * u) * s, i % 3 ? 5 : 13);
  }
  const hx = x, hy = y + (1 - rise) * 120 * s;
  disc(hx, hy, 13 * s, 5, 10 * s); disc(hx, hy - 3 * s, 11 * s, 13, 5 * s);
  rect(hx - 8 * s, hy - 3 * s, 5 * s, 3 * s, o.eyes ?? 2); rect(hx + 3 * s, hy - 3 * s, 5 * s, 3 * s, o.eyes ?? 2);
  rect(hx - 9 * s, hy + 5 * s, 18 * s, 2 * s, 0); if (o.tongue) { rect(hx - s, hy + 7 * s, 2 * s, 5 * s, 2); }
  for (let k = -2; k <= 2; k++) rect(hx + k * 4 * s - s, hy - 16 * s - (k % 2 ? 0 : 3 * s), 3 * s, 6 * s + (k % 2 ? 0 : 3 * s), 7);
  rect(hx - 10 * s, hy - 12 * s, 20 * s, 3 * s, 7);
}
function shoggothBlob(cx, cy, R, t, o = {}) {
  const wob = y => Math.round(Math.sin(y * .09 + t * 6) * (o.wob ?? 3));
  for (let k = 0; k < 6; k++) {
    const side = k % 2 ? 1 : -1, base = [cx + side * R * .8, cy + R * .6 + (k >> 1) * R * .24];
    for (let j = 0; j < 20; j++) { const u = j / 20, x = base[0] + side * j * R * .07, y = base[1] + j * R * .04 + Math.sin(t * 7 + j * .35 + k) * R * .2 * u; disc(x + wob(y), y, Math.max(1, R * .1 - j * R / 200), j % 5 === 0 ? 13 : 5); }
  }
  for (let y = -R; y <= R; y++) { const w = Math.round(R * 1.15 * Math.sqrt(Math.max(0, 1 - (y / R) ** 2))); rect(cx - w + wob(cy + y), cy + y, 2 * w + 1, 1, y < -R * .5 ? 13 : 5); }
  if (o.eyes !== false) for (let k = 0; k < (o.n || 9); k++) {
    const ex = cx + (hash(k + 3) - .5) * R * 2, ey = cy + (hash(k + 11) - .5) * R * 1.4, r = Math.max(2, Math.round((4 + hash(k + 7) * 5) * R / 50));
    if (frac(t * .7 + hash(k)) < .06) rect(ex - r + wob(ey), ey, 2 * r, 1, 0);
    else { disc(ex + wob(ey), ey, r, 1); disc(ex + wob(ey) + Math.round(Math.sin(t * 3 + k) * 2), ey + 1, Math.max(1, r >> 1), 0); }
  }
}
// the Researcher, anywhere: frame 0 arms down, 1 arms up; extras: bowtie, flip
function researcher(x, y, s = 1, o = {}) {
  sprite(RESEARCHER[o.frame || 0], x, y, { ...RESEARCHER_MAP, ...(o.map || {}) }, s, { flip: o.flip, wob: o.wob });
  if (o.bowtie) { rect(x + 10 * s, y + 9 * s, 2 * s, 2 * s, 2); rect(x + 14 * s, y + 9 * s, 2 * s, 2 * s, 2); rect(x + 12 * s, y + 9 * s, 2 * s, s, 0); }
  if (o.clipboard) { rect(x + (o.flip ? -2 : 22) * s, y + 11 * s, 6 * s, 8 * s, 9); rect(x + (o.flip ? -1 : 23) * s, y + 12 * s, 4 * s, 6 * s, 1); }
}

// ---------- the P(doom) show: the chorus stage, shared by all four choruses ----------
// o: from/to (meter %), drop (time the pumping starts), variant 1..4 (party, pyro, paperclips, red alert), s (Clawd size)
function chorusStage(t, lt, dur, fr, o) {
  const v = o.variant, red = v === 4;
  fillAll(0);
  borderBars(t, red ? BARS.red : v === 2 ? BARS.gold : v === 3 ? BARS.grey : BARS.red, 3);
  clipScreen(); screenFill(red ? (Math.floor(t * 4) % 2 ? 2 : 9) : 0);
  if (red) for (let k = 0; k < 2; k++) {   // sweeping siren beams
    const a = t * 3 + k * Math.PI, cx = k ? 300 : 20, cy = 20;
    for (let r = 0; r < 260; r += 2) { const w = r * .18; rect(cx + Math.cos(a) * r - w / 2, cy + Math.abs(Math.sin(a)) * r, w, 2, 10); }
  } else stars(t, t * 6, 0, 40, [11, 11, 12]);
  if (v === 2) for (const px of [18, 296]) for (let k = 0; k < 5; k++) flame(px, 140 - k * 12 - 20 * pulse(t, 4) * (k / 4), 1 + (k < 2), fr + k + px);
  const fld = Math.round(10 * pulse(t, 5));
  bigText('P(DOOM)', 6 + fld, 3, i => (r) => (red ? FIRE : WASH)[(r + Math.floor(t * 18) + i) % 10]);
  checkerFloor(150, red ? 9 : v === 3 ? 11 : 9, red ? 2 : v === 3 ? 12 : 8);
  rect(0, 149, 320, 2, red ? 2 : 7);
  const pumping = t > o.drop, p = pumping ? pulse(t, 7) : .5 + .5 * Math.sin(t * 9);
  const hy = 96 + 22 * (1 - p), s = o.s || 3, cw = 24 * s, ch = 21 * s;
  const px = 66 + cw + 10;
  rect(px, hy, 3, 150 - hy, 12); rect(px - 10, hy - 2, 24, 4, 15); rect(px - 8, 146, 20, 4, 11);
  if (v === 3 && pumping) for (let k = 0; k < 8; k++) {   // the pump is a paperclip machine now
    const a = frac(lt * 1.3 + k / 8); paperclip(px + 10 + a * 70, 140 - 60 * a + 80 * a * a, [15, 12, 1][k % 3], k % 2);
  }
  clawd(66 + (s < 3 ? 12 : 0), 150 - ch, s, { eyes: red ? 'red' : 'happy', mouth: red ? 'open' : 'grin', aL: 0, aR: p > .5 ? 1 : 0, hop: Math.round(4 * p), hat: o.hat });
  // the meter
  const pct = lerp(o.from, o.to, ease(seg(t, o.drop - .4, o.drop + dur * .6)));
  rect(250, 50, 14, 92, 1); rect(252, 52, 10, 88, 0);
  const lv = Math.round(88 * pct / 100); rect(253, 140 - lv, 8, lv, 2); disc(257, 146, 9, 1); disc(257, 146, 7, 2);
  for (let k = 0; k < 5; k++) rect(266, 52 + k * 22, 4, 1, 12);
  if (red && lt > dur * .5) { line(253, 60, 258, 75, 1); line(258, 75, 254, 90, 1); line(258, 75, 262, 82, 1); }
  const label = pct >= 99 ? '99.9%' : (pct < 10 ? '0' : '') + Math.round(pct) + '%';
  text(label, 257 - label.length * 4, 34, pct > 80 ? (fr % 8 < 4 ? 2 : 7) : pct > 30 ? 7 : 1);
  // the Researcher and friends
  if (v === 3) { for (let k = 0; k < 40; k++) paperclip(170 + hash(k) * 70, 136 + hash(k + 40) * 12, [15, 12, 11][k % 3], k % 2); researcher(186, 118, 1, { frame: beatOdd(t) ? 1 : 0 }); }
  else researcher(186, 108 - Math.round(3 * p), 2, { frame: beatOdd(t) ? 1 : 0, map: red ? { f: 15 } : {} });
  if (o.extra) o.extra(t, lt, dur, fr);
  lyricBar(t, 168, i => (red ? FIRE : WASH)[(i + Math.floor(t * 25)) % 10]);
  clipAll();
  if (t > o.drop && t < o.drop + .08) fillBorder(1);
}
// theatre curtains, raster-shaded folds. k = 0 closed … 1 open (they part from the middle); drop: how far down the
// house curtain has fallen (0..1), for the finale
function curtains(k, fr, drop = 0) {
  const w = Math.round(160 * (1 - k)), fold = x => { const f = (x + Math.floor(x / 12)) % 12; return f < 2 ? 9 : f < 6 ? 2 : f < 10 ? 10 : 2; };
  for (let x = 0; x < w; x++) { rect(x, 0, 1, 200, fold(x)); rect(319 - x, 0, 1, 200, fold(x)); }
  if (drop > 0) { const h = Math.round(200 * drop); for (let x = 0; x < 320; x++) rect(x, 0, 1, h, fold(x)); rect(0, h - 3, 320, 3, 7); }
  for (let x = 0; x < 320; x++) rect(x, 0, 1, 10 + Math.round(3 * Math.sin(x * .2)), 2);   // valance
  rect(0, 10, 320, 2, 7);
}
function audience(t) {   // front-row heads in silhouette
  for (let k = 0; k < 14; k++) { const x = k * 24 + 6 + (k % 2) * 8, bob = Math.round(Math.sin(t * 3 + k) * pulse(t) * 2); disc(x, 196 + bob, 11, 0, 9); disc(x, 184 + bob, 7, 0); }
}
// screen transitions
function jaws(k, c = 0) {                    // a mouth closing (k 0 → 1) over the screen, teeth and all
  const h = Math.round(100 * clamp(k));
  rect(0, 0, 320, h, c); rect(0, 200 - h, 320, h, c);
  for (let x = 0; x < 320; x += 16) for (let r = 0; r < 8; r++) { rect(x + r, h + r, 16 - 2 * r, 1, 1); rect(x + r, 199 - h - r, 16 - 2 * r, 1, 1); }
}
function rasterWipe(k, c = 0, dir = 1) {    // lines close in, staggered like a raster split sweeping the screen
  for (let y = 0; y < 200; y++) { const d = hash(y * 3.1) * .35, q = clamp((k - d) / .65); if (q > 0) rect(dir > 0 ? 0 : 320 - 320 * q, y, 320 * q, 1, c); }
}
