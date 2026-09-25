// vic.js: a tiny VIC-II-flavoured framebuffer. The frame is 480x270 C64 pixels: a 320x200 screen with border around
// it (rasterbars and "open border" tricks may paint the border), shown 4x on a 1920x1080 canvas with soft scanlines.
// Every pixel is one of the 16 C64 colours (colodore palette). Frames are pure functions of time.
const FW = 480, FH = 270, SX = 80, SY = 35, SW = 320, SH = 200;
const PAL64 = ['#000000', '#ffffff', '#813338', '#75cec8', '#8e3c97', '#56ac4d', '#2e2c9b', '#edf171',
               '#8e5029', '#553800', '#c46c71', '#4a4a4a', '#7b7b7b', '#a9ff9f', '#706deb', '#b2b2b2'];
const C = { black: 0, white: 1, red: 2, cyan: 3, purple: 4, green: 5, blue: 6, yellow: 7, orange: 8, brown: 9,
            lred: 10, dgrey: 11, grey: 12, lgreen: 13, lblue: 14, lgrey: 15 };
const clampV = (x, a, b) => Math.max(a, Math.min(b, x));
const RGB = PAL64.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
// colours ordered by brightness, for luma fades (the classic fade tables)
const LUMA = [0, 6, 9, 2, 11, 4, 8, 14, 12, 5, 10, 3, 15, 7, 13, 1];
const LUMA_AT = []; LUMA.forEach((c, i) => LUMA_AT[c] = i);
// the classic fade-to-black table: each colour steps to a darker neighbour of the same hue family
const FADE_NEXT = [0, 15, 9, 14, 6, 9, 0, 10, 9, 0, 8, 0, 11, 5, 6, 12];
const fadeCol = (c, k) => { for (let i = 0; i < k; i++) c = FADE_NEXT[c]; return c; };

const FB = new Uint8Array(FW * FH);
let SHX = 0, SHY = 0;                                  // hardware scroll ($D016/$D011): shakes the screen, not the border
let CLIP = [0, 0, FW, FH];
const clipScreen = () => { CLIP = [SX, SY, SX + SW, SY + SH]; };
const clipAll = () => { CLIP = [0, 0, FW, FH]; };

// pixel in SCREEN coordinates (0..319, 0..199); the border is at negative / beyond
function pset(x, y, c) {
  x = (x + SX + SHX) | 0; y = (y + SY + SHY) | 0;
  if (x < CLIP[0] || y < CLIP[1] || x >= CLIP[2] || y >= CLIP[3]) return;
  FB[y * FW + x] = c;
}
function rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) pset(x + i, y + j, c); }
function fillAll(c) { FB.fill(c); }
function screenFill(c) { for (let y = 0; y < SH; y++) FB.fill(c, (y + SY) * FW + SX, (y + SY) * FW + SX + SW); }
// a raster line across the whole frame (border included), in frame rows 0..269
function rasterLine(fy, c, x0 = 0, x1 = FW) { fy |= 0; if (fy >= 0 && fy < FH) FB.fill(c, fy * FW + Math.max(0, x0), fy * FW + Math.min(FW, x1)); }
// a rasterbar: a colour ramp centred on frame row fy
function rasterBar(fy, ramp, x0 = 0, x1 = FW) { const n = ramp.length; for (let i = 0; i < n; i++) rasterLine(fy - (n >> 1) + i, ramp[i], x0, x1); }
const BARS = {
  blue: [6, 6, 14, 14, 3, 1, 3, 14, 14, 6, 6], red: [9, 2, 2, 8, 10, 7, 1, 7, 10, 8, 2, 2, 9], green: [9, 5, 5, 13, 1, 13, 5, 5, 9],
  purple: [6, 4, 4, 10, 15, 1, 15, 10, 4, 4, 6], grey: [11, 12, 15, 1, 15, 12, 11], gold: [9, 8, 8, 7, 1, 7, 8, 8, 9],
};

// ---------- text ----------
function glyph(ch) { return FONT[ch] || FONT[ch.toUpperCase()] || FONT[' ']; }
// one char; sx/sy scale; colour c (or a function of (row, col) for raster-coloured text)
function drawChar(ch, x, y, c, sx = 1, sy = sx, shadow = -1) {
  const g = glyph(ch);
  for (let r = 0; r < 8; r++) for (let b = 0; b < 8; b++) if (g[r] & (128 >> b)) {
    const col = typeof c === 'function' ? c(r, b) : c;
    if (shadow >= 0) rect(x + b * sx + sx, y + r * sy + sy, sx, sy, shadow);
    rect(x + b * sx, y + r * sy, sx, sy, col);
  }
}
// text; o: { sx, sy, col(i) per char, dy(i) per char, shadow, n (chars shown) }
function text(str, x, y, c, o = {}) {
  const sx = o.sx || 1, sy = o.sy || sx, n = o.n ?? str.length;
  for (let i = 0; i < Math.min(n, str.length); i++) {
    const col = o.col ? o.col(i) : c, dy = o.dy ? o.dy(i) : 0, dx = o.dx ? o.dx(i) : 0;
    drawChar(str[i], x + i * 8 * sx + dx, y + dy, col, sx, sy, o.shadow ?? -1);
  }
}
const centreX = (str, sx = 1) => ((SW - str.length * 8 * sx) / 2) | 0;

// ---------- sprites ----------
// A multicolour sprite: rows of 12 chars (each a fat 2x1 pixel), map char -> colour, '.' transparent.
// s scales it (s = 1: a plain sprite, 2: X/Y-expanded; bigger = drawn in bitmap mode as a "big sprite").
function sprite(rows, x, y, map, s = 1, o = {}) {
  const fw = 2 * s, fh = s;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r], wob = o.wob ? o.wob(r) : 0;
    for (let i = 0; i < row.length; i++) {
      const ch = row[o.flip ? row.length - 1 - i : i]; if (ch === '.' || ch === ' ') continue;
      const c = map[ch]; if (c == null) continue;
      rect(x + i * fw + wob, y + r * fh, fw, fh, c);
    }
  }
}

// ---------- Clawd, as a 12x21 multicolour sprite ----------
// b body (light red), k outline/eyes (black), d shade and legs (orange). o: eyes, mouth, aL/aR (-1 down, 0 out, 1 up),
// walk (0/1: which legs lift), view (front/side/back), hop (px the body sits higher, legs stretch)
function clawdRows(o = {}) {
  const G = Array.from({ length: 21 }, () => Array(12).fill('.'));
  const set = (c, r, ch) => { if (r >= 0 && r < 21 && c >= 0 && c < 12) G[r][c] = ch; };
  const view = o.view || 'front', L = view === 'side' ? 3 : 1, R = view === 'side' ? 8 : 10;
  const top = 4, bot = 15;
  for (let r = top; r <= bot; r++) for (let c = L; c <= R; c++) {
    const edge = r === top || r === bot || c === L || c === R;
    set(c, r, edge ? 'k' : r >= bot - 3 ? 'd' : 'b');
  }
  if (view === 'side') for (let r = top + 1; r < bot; r++) set(L + 1, r, 'd');   // the darker side face
  // legs
  const legs = view === 'side' ? [4, 7] : [2, 4, 7, 9];
  legs.forEach((c, i) => { const lift = o.walk != null && (i % 2) === (o.walk % 2) ? 1 : 0; for (let r = bot + 1; r <= bot + 4 - lift; r++) set(c, r, 'd'); });
  // arms: one fat pixel nub each side, down / out / up
  const arm = (c, a) => {
    if (a > .5) for (let r = 5; r <= 9; r++) set(c, r, 'b');
    else if (a < -.5) for (let r = 9; r <= 12; r++) set(c, r, 'b');
    else { set(c, 8, 'b'); set(c, 9, 'b'); }
  };
  if (view === 'front' || view === 'back') { arm(0, o.aL ?? 0); arm(11, o.aR ?? 0); }
  else { arm(9, o.aL ?? 0); }
  if (view !== 'back') face(G, set, o, view);
  hat(set, o.hat, view);
  if (o.lid && view === 'front') {   // the lunchbox lid: the top of the body hinges up, teeth in the gap
    const k = Math.min(4, Math.round(o.lid));
    for (let r = top; r <= top + 4; r++) for (let c = 0; c < 12; c++) { G[r - k][c] = G[r][c]; }
    for (let r = top + 5 - k; r <= top + 4; r++) for (let c = L; c <= R; c++) G[r][c] = c === L || c === R ? 'k' : 'r';
    for (let c = L + 1; c < R; c += 2) { set(c, top + 5 - k, 'w'); set(c + 1, top + 4, 'w'); }
  }
  return G.map(r => r.join(''));
}
function face(G, set, o, view) {
  const lk = Math.round(clampV(o.look || 0, -1, 1)), ex = (view === 'side' ? [7] : [3, 8]).map(c => c + lk), e = o.eyes || 'normal';
  for (const c of ex) {
    if (e === 'normal') { set(c, 7, 'k'); set(c, 8, 'k'); set(c, 9, 'k'); }
    else if (e === 'happy') { set(c - 1, 8, 'k'); set(c, 7, 'k'); set(c + 1, 8, 'k'); }
    else if (e === 'closed') { set(c - 1, 8, 'k'); set(c, 8, 'k'); set(c + 1, 8, 'k'); }
    else if (e === 'red') { set(c, 7, 'r'); set(c, 8, 'r'); set(c, 9, 'r'); set(c - 1, 8, 'r'); }
    else if (e === 'star') { set(c, 7, 'y'); set(c - 1, 8, 'y'); set(c, 8, 'y'); set(c + 1, 8, 'y'); set(c, 9, 'y'); }
    else if (e === 'x') { set(c - 1, 7, 'k'); set(c + 1, 7, 'k'); set(c, 8, 'k'); set(c - 1, 9, 'k'); set(c + 1, 9, 'k'); }
    else if (e === 'swirl') { const ph = o.ph || 0; [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([a, b2], i) => { if ((i + ph) % 4 !== 0) set(c + a, 8 + b2, 'k'); }); }
    else if (e === 'heart') { set(c - 1, 7, 'r'); set(c + 1, 7, 'r'); set(c - 1, 8, 'r'); set(c, 8, 'r'); set(c + 1, 8, 'r'); set(c, 9, 'r'); }
  }
  const mx = view === 'side' ? 7 : 5;
  if (o.mouth === 'o') { set(mx, 11, 'k'); if (view !== 'side') set(mx + 1, 11, 'k'); }
  if (o.mouth === 'grin') for (let c = mx - 1; c <= mx + (view === 'side' ? 0 : 2); c++) set(c, 11, 'k');
  if (o.mouth === 'open') { for (let c = mx; c <= mx + 1; c++) { set(c, 10, 'k'); set(c, 11, 'r'); set(c, 12, 'k'); } }
  if (o.mouth === 'frown') { set(mx - 1, 12, 'k'); set(mx, 11, 'k'); set(mx + 1, 11, 'k'); if (view !== 'side') set(mx + 2, 12, 'k'); }
  if (o.blush && view !== 'side') { set(2, 10, 'r'); set(9, 10, 'r'); }
}
// hats sit in the four free rows above the body (0..3), plus face pieces
function hat(set, h, view) {
  if (!h) return;
  const c0 = view === 'side' ? 3 : 1, c1 = view === 'side' ? 8 : 10, mid = (c0 + c1) / 2;
  const row = (r, a, b, ch) => { for (let c = a; c <= b; c++) set(c, r, ch); };
  if (h === 'crown') { row(3, mid - 2.5, mid + 2.5, 'y'); [mid - 2.5, mid - .5, mid + .5, mid + 2.5].forEach(c => set(c, 2, 'y')); set(mid - 2.5, 1, 'y'); set(mid + 2.5, 1, 'y'); set(mid - .5, 1, 'y'); }
  if (h === 'party') { row(3, mid - 1.5, mid + 1.5, 'p'); row(2, mid - .5, mid + .5, 'p'); row(1, mid - .5, mid + .5, 'p'); set(mid - .5, 0, 'y'); }
  if (h === 'hard') { row(3, c0, c1, 'y'); row(2, mid - 2.5, mid + 2.5, 'y'); row(1, mid - 1.5, mid + 1.5, 'y'); }
  if (h === 'band') row(5, c0 + 1, c1 - 1, 'w');
  if (h === 'cat') { set(c0, 3, 'b'); set(c0 + 1, 3, 'b'); set(c0, 2, 'b'); set(c1, 3, 'b'); set(c1 - 1, 3, 'b'); set(c1, 2, 'b'); }
  if (h === 'hood') { row(3, c0, c1, 'p'); row(2, mid - 3.5, mid + 3.5, 'p'); row(1, mid - 1.5, mid + 1.5, 'p'); set(mid + .5, 0, 'p'); set(mid - .5, 2, 'y'); }
  if (h === 'fedora') { row(3, c0, c1, 'k'); row(2, mid - 2.5, mid + 2.5, 'k'); row(1, mid - 2.5, mid + 2.5, 'k'); row(2, mid - 2.5, mid + 2.5, 'r'); }
  if (h === 'halo') { row(1, mid - 2.5, mid + 2.5, 'y'); }
  if (h === 'bow') { set(c1 - 2, 3, 'r'); set(c1 - 1, 3, 'r'); set(c1, 3, 'r'); set(c1 - 2, 2, 'r'); set(c1, 2, 'r'); }
  if (h === 'shades' && view !== 'back') row(7, view === 'side' ? 6 : 2, view === 'side' ? 8 : 9, 'k'), view === 'side' ? row(8, 6, 8, 'k') : (row(8, 2, 4, 'k'), row(8, 7, 9, 'k'));
  if (h === 'mask' && view !== 'back') { row(7, c0 + 1, c1 - 1, 'p'); row(8, c0 + 1, c1 - 1, 'p'); (view === 'side' ? [7] : [3, 8]).forEach(c => { set(c, 7, 'k'); set(c, 8, 'k'); }); }
  if (h === 'bowtie' && view !== 'back') { set(mid - 1.5, 13, 'r'); set(mid - .5, 13, 'r'); set(mid + .5, 13, 'r'); set(mid + 1.5, 13, 'r'); }
}
const CLAWD_MAP = { b: C.lred, k: C.black, d: C.orange, r: C.red, y: C.yellow, w: C.white, p: C.purple, g: C.grey, c: C.cyan };
function clawd(x, y, s, o = {}) {                // (x, y) = top-left of the sprite box; box is 24s x 21s
  const rows = clawdRows(o), hop = o.hop || 0;
  sprite(rows, x, y - hop, { ...CLAWD_MAP, ...(o.map || {}) }, s, { flip: o.flip, wob: o.wob });
}

// The Researcher: lab coat, glasses, scribbly hair. frame 0 arms down, 1 arms up (the robot)
const RESEARCHER = [[
  '....kkkk....', '...kkkkkk...', '..kkkkkkkk..', '..kffffffk..', '..gggffggg..', '..gkgffgkg..', '..ffffffff..', '...ffkkff...',
  '....ffff....', '..wwwwwwww..', '.wwwwkkwwww.', '.wwwwkkwwww.', 'w.wwwwwwww.w', 'w.wwwwwwww.w', 'f.wwwwwwww.f', '..wwwwwwww..',
  '..wwwwwwww..', '...kk..kk...', '...kk..kk...', '..kkk..kkk..', '............'], null];
RESEARCHER[1] = RESEARCHER[0].map((r, i) => i >= 12 && i <= 14 ? '.' + r.slice(1, 11) + '.' : i === 9 ? 'f' + r.slice(1, 11) + 'f' : i === 10 || i === 11 ? 'w' + r.slice(1, 11) + 'w' : r);
const RESEARCHER_MAP = { k: C.black, f: C.lred, g: C.lgrey, w: C.white };

// ---------- present ----------
let outC, outX, smallC, smallX, img, scan;
function vicInit() {
  outC = document.getElementById('out'); outX = outC.getContext('2d');
  smallC = document.createElement('canvas'); smallC.width = FW; smallC.height = FH; smallX = smallC.getContext('2d');
  img = smallX.createImageData(FW, FH);
  scan = document.createElement('canvas'); scan.width = 1920; scan.height = 1080; const s = scan.getContext('2d');
  for (let y = 0; y < 1080; y += 4) { s.fillStyle = 'rgba(0,0,0,.20)'; s.fillRect(0, y + 3, 1920, 1); }
  const g = s.createRadialGradient(960, 540, 400, 960, 540, 1200); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  s.fillStyle = g; s.fillRect(0, 0, 1920, 1080);
}
function present(fade = 0) {
  const d = img.data;
  for (let i = 0; i < FW * FH; i++) { const c = RGB[fade ? fadeCol(FB[i], fade) : FB[i]], j = i * 4; d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255; }
  smallX.putImageData(img, 0, 0);
  outX.imageSmoothingEnabled = false;
  outX.drawImage(smallC, 0, 0, 1920, 1080);
  outX.drawImage(scan, 0, 0);
}
