# sid.py: a small MOS 6581 SID emulator plus a 4-bit "digi" channel, driven by a 50 Hz (PAL frame) player the way a
# C64 music routine drives the chip from the raster interrupt, and an arranger that turns analyze.py's data into a
# C64 cover of the song.
#
#   usage: python sid.py notes.json drums.wav <start s in drums.wav> out.wav [original.wav] [--window=a:b] [--solo=lead,bass,arp,digi]
#          [--gain=lead,bass,arp,digi] [--raw=1]
#     original.wav (optional): the original mix; the master volume then follows its sections (quiet verse, breakdown).
#     --window: render only song seconds a..b (quick checks). --solo: render only those voices (checks).
#
# The arrangement (one register write per voice per 1/50 s frame, like a real player):
#   V1  lead: the singer, as NOTES. Each syllable onset starts a note (hard restart, so the envelope re-triggers);
#       pitch changes inside a syllable slide (portamento); long notes get a delayed vibrato; each note's sustain level
#       follows how loud it was sung. Pulse wave with a per-note PWM sweep, an octave above the voice.
#   V2  bass: the bass stem's own notes, one per beat. Full sections: eighth notes with an octave pop, sawtooth
#       through the resonant low-pass, cutoff pumping on the beat. Sparse sections (no drums): long mellow notes.
#   V3  chords: full sections: the classic 50 Hz arpeggio (pulse), stealing a frame of noise for each hi-hat.
#       Sparse sections: a soft triangle broken-chord pattern in sixteenths.
#   D   digi: the song's drum stem, 4 bits through $D418, one sample per raster line (15.6 kHz), so hi-hats survive.
# The chip runs 8x oversampled (352.8 kHz) and is decimated with a proper anti-alias filter, like the real chip's
# ~1 MHz output being filtered, so the pulse and saw waves don't alias into harsh inharmonic tones.
import sys, json, numpy as np, soundfile as sf, librosa
from numba import njit
from scipy.signal import resample_poly, butter, lfilter, medfilt

CLOCK, SR, FPS, OS = 985248.0, 44100, 50, 8
SRI, SPF = SR * OS, SR // FPS * OS                      # internal rate; internal samples per frame (7056)
RATE = np.array([2, 8, 16, 24, 38, 56, 68, 80, 100, 250, 500, 800, 1000, 3000, 5000, 8000]) / 1000.0   # attack s; decay/release ~3x

@njit(cache=True)
def render(freq, pw, wave, gate, ad, sr_, fc, res, route, vol, dq, dsr, mute, gain, out):
    # freq/pw/wave/gate/ad/sr_: [frames, 3]; fc (Hz) / res (0..15) / route / vol: [frames]; dq: 4-bit digi at dsr Hz
    nf = freq.shape[0]
    acc = np.zeros(3); env = np.zeros(3); state = np.zeros(3, dtype=np.int64)   # 0 release, 1 attack, 2 decay/sustain
    lfsr = np.full(3, 0x7FFFF8, dtype=np.int64); prevbit = np.zeros(3, dtype=np.int64); nz = np.zeros(3)
    lastgate = np.zeros(3, dtype=np.int64)
    lp = 0.0; bp = 0.0
    for f in range(nf):
        for v in range(3):
            if gate[f, v] and not lastgate[v]: state[v] = 1
            if not gate[f, v] and lastgate[v]: state[v] = 0
            lastgate[v] = gate[f, v]
        g = 2.0 * np.sin(np.pi * min(fc[f], 18000.0) / SRI); q = 1.05 - res[f] / 18.0
        for s in range(SPF):
            i = f * SPF + s
            mixf = 0.0; mixd = 0.0
            for v in range(3):
                acc[v] += freq[f, v] * CLOCK / SRI
                if acc[v] >= 16777216.0: acc[v] -= 16777216.0
                a = int(acc[v]) & 0xFFFFFF
                bit = (a >> 19) & 1
                if bit and not prevbit[v]:
                    b = ((lfsr[v] >> 22) ^ (lfsr[v] >> 17)) & 1
                    lfsr[v] = ((lfsr[v] << 1) | b) & 0x7FFFFF
                    l = lfsr[v]
                    nz[v] = (((l >> 20) & 1) << 11 | ((l >> 18) & 1) << 10 | ((l >> 14) & 1) << 9 | ((l >> 11) & 1) << 8 |
                             ((l >> 9) & 1) << 7 | ((l >> 5) & 1) << 6 | ((l >> 2) & 1) << 5 | (l & 1) << 4)
                prevbit[v] = bit
                w = wave[f, v]
                if w == 1:   x = float(a >> 12)                                              # sawtooth
                elif w == 2: x = 4095.0 if (a >> 12) >= pw[f, v] else 0.0                    # pulse
                elif w == 3: x = float(((a >> 11) ^ (0x1FFF if a & 0x800000 else 0)) & 0xFFF) # triangle
                elif w == 4: x = nz[v]                                                       # noise
                else:        x = 2048.0
                # envelope: linear attack; decay and release step down at the attack rate divided by the SID's
                # piecewise "exponential" divisors (1, 2, 4, 8, 16, 30 below levels 93, 54, 26, 14, 6)
                A = ad[f, v] >> 4; D = ad[f, v] & 15; S = (sr_[f, v] >> 4) * 17.0; R = sr_[f, v] & 15
                if state[v] == 1:
                    env[v] += 255.0 / (RATE[A] * SRI)
                    if env[v] >= 255.0: env[v] = 255.0; state[v] = 2
                else:
                    e = env[v]; div = 1.0 if e > 93 else 2.0 if e > 54 else 4.0 if e > 26 else 8.0 if e > 14 else 16.0 if e > 6 else 30.0
                    if state[v] == 2:
                        if e > S:
                            env[v] -= 255.0 / (RATE[D] * SRI) / div
                            if env[v] < S: env[v] = S
                    else:
                        env[v] -= 255.0 / (RATE[R] * SRI) / div
                        if env[v] < 0.0: env[v] = 0.0
                if mute[v]: continue
                y = (x - 2048.0) * env[v] / 255.0 * gain[v]
                if (route[f] >> v) & 1: mixf += y
                else: mixd += y
            hp = mixf - lp - q * bp                     # resonant state-variable low-pass on the routed voices
            bp += g * hp; lp += g * bp
            o = (lp + mixd) * vol[f] / 15.0 / 2048.0 * .33
            if not mute[3]:
                k = min(int(i * dsr / SRI), dq.shape[0] - 1)
                o += (dq[k] - 7.5) / 7.5 * .30 * gain[3]  # $D418 digi: the volume nibble IS the sample
            out[i] = o
    return out

def hz2reg(hz): return int(round(hz * 16777216 / CLOCK))
def m2hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def smooth(a, w): return np.convolve(a, np.ones(w) / w, mode='same')

# ---------- chords: 24 triad templates, Viterbi-smoothed over beats, nudged toward the song's key ----------
MAJ_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
def track_chords(bchroma, stay_p=.86):
    C = np.array(bchroma) + 1e-6; C /= C.sum(1, keepdims=True)
    key = int(np.argmax([np.corrcoef(np.roll(MAJ_PROFILE, k), C.sum(0))[0, 1] for k in range(12)]))
    diatonic = {(key, 0), ((key + 5) % 12, 0), ((key + 7) % 12, 0), ((key + 9) % 12, 1), ((key + 2) % 12, 1), ((key + 4) % 12, 1)}
    T = []
    for r in range(12):
        for m in (0, 1):
            v = np.zeros(12); v[r] = 1; v[(r + (3 if m else 4)) % 12] = .8; v[(r + 7) % 12] = .9; T.append((r, m, v / np.linalg.norm(v)))
    E = np.array([[np.dot(c / np.linalg.norm(c), tv) + (.06 if (r, m) in diatonic else 0) for (r, m, tv) in T] for c in C]) * 14
    n, k = E.shape; stay, move = np.log(stay_p), np.log((1 - stay_p) / (k - 1))
    score = E[0].copy(); back = np.zeros((n, k), dtype=int)
    for i in range(1, n):
        trans = score[:, None] + np.where(np.eye(k, dtype=bool), stay, move)
        back[i] = trans.argmax(0); score = trans.max(0) + E[i]
    path = [int(score.argmax())]
    for i in range(n - 1, 0, -1): path.append(back[i][path[-1]])
    path.reverse()
    return [(T[j][0], T[j][1]) for j in path], key

# ---------- the singer, as notes ----------
def lead_notes(d, n, tun):
    v = np.array([np.nan if x is None else x for x in d['vocal'][:n]]); vr = np.array(d['vrms'][:n]); on_ = np.array(d['vonset'][:n])
    for i in range(n):                                   # pyin's octave slips
        if not np.isnan(v[i]):
            nb = np.nanmedian(v[max(0, i - 8):i + 9])
            while v[i] - nb > 7: v[i] -= 12
            while nb - v[i] > 7: v[i] += 12
    voiced = ~np.isnan(v) & (vr > .045)
    for i in range(1, n - 2):                            # bridge 1–2 frame dropouts
        if not voiced[i] and voiced[i - 1] and (voiced[i + 1] or voiced[i + 2]): voiced[i] = True; v[i] = v[i - 1]
    p = np.where(voiced, v - tun, np.nan)
    ps = p.copy()
    for i in range(n):
        if voiced[i]: ps[i] = np.nanmedian(p[max(0, i - 2):i + 3])
    peaks = set(librosa.util.peak_pick(on_, pre_max=3, post_max=3, pre_avg=6, post_avg=6, delta=.07, wait=6).tolist())
    notes = []
    i = 0
    while i < n:
        if not voiced[i]: i += 1; continue
        j = i
        while j < n and voiced[j]: j += 1
        # boundaries inside this sung run: syllable onsets (re-trigger) and held pitch changes (slide)
        bounds = {i: False}
        cur = round(ps[i])
        k = i + 1
        while k < j:
            if k in peaks and k - max(bounds) >= 4 and j - k >= 3: bounds[k] = False; cur = round(ps[k])
            elif all(abs(ps[m] - cur) > .65 for m in range(k, min(j, k + 4))) and j - k >= 4 and k - max(bounds) >= 4:
                bounds[k] = True; cur = round(np.median(ps[k:k + 4]))
            k += 1
        starts = sorted(bounds)
        for a, b in zip(starts, starts[1:] + [j]):
            x = {'s': a, 'e': b, 'm': int(round(np.median(ps[a:b]))), 'vel': float(np.mean(vr[a:b])), 'legato': bounds[a]}
            if x['legato'] and notes and notes[-1]['e'] == a and notes[-1]['m'] == x['m']: notes[-1]['e'] = b   # same pitch: one note
            else: notes.append(x)
        i = j
    return notes

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opts = dict(a[2:].split('=') for a in sys.argv[1:] if a.startswith('--'))
    notes_path, drums_path, start, outp = args[0], args[1], float(args[2]), args[3]
    orig = args[4] if len(args) > 4 else None
    d = json.load(open(notes_path)); n = len(d['vocal'])
    tun = d.get('tuning', 0.0)
    t = np.arange(n) / FPS + start
    beats = np.array(d['beats']); per = np.median(np.diff(beats))
    k = np.clip(np.searchsorted(beats, t, side='right') - 1, 0, len(beats) - 1)
    nxt = np.append(beats[1:], beats[-1] + per)
    bp = np.where(t < beats[0], (t - beats[0]) / per, np.where(t >= beats[-1], len(beats) - 1 + (t - beats[-1]) / per, k + (t - beats[k]) / (nxt[k] - beats[k])))
    M = lambda m: hz2reg(m2hz(m + tun))                  # play in the recording's own tuning

    freq = np.zeros((n, 3)); pw = np.full((n, 3), 2048, dtype=np.int64); wave = np.zeros((n, 3), dtype=np.int64)
    gate = np.zeros((n, 3), dtype=np.int64); ad = np.zeros((n, 3), dtype=np.int64); sr_ = np.zeros((n, 3), dtype=np.int64)
    fc = np.full(n, 1200.0); res = np.full(n, 10.0); route = np.full(n, 2, dtype=np.int64); vol = np.full(n, 15.0)

    # ---- sections: where the drums play, the arrangement is "full"; elsewhere "sparse" (hysteresis on 1.5 s energy)
    dr = smooth(np.array(d['drms'][:n]), 75); full = np.zeros(n, bool); st = False
    for i in range(n):
        st = dr[i] > .16 if not st else dr[i] > .08
        full[i] = st
    bass_on = smooth(np.array(d['brms'][:n]), 15) > .04
    music_on = (smooth(np.array(d['orms'][:n]), 25) > .04) | bass_on

    # ---- chords and bass notes per beat
    chords, key = track_chords(d['bchroma'], float(opts.get('stay', .86)))
    bas = np.array([np.nan if x is None else x for x in d['bass'][:n]])
    bnote = []
    for j in range(len(beats)):
        a = int((beats[j] - start) * FPS); b = int(((beats[j + 1] if j + 1 < len(beats) else beats[j] + per) - start) * FPS)
        seg = bas[max(0, a):max(0, b)]; ok = seg[~np.isnan(seg)]
        root = chords[j][0]
        m = int(round(np.median(ok) - tun)) if len(ok) >= max(2, .4 * len(seg)) else 36 + root
        while m > 43: m -= 12
        while m < 28: m += 12
        bnote.append(m)
    def chord_at(b):
        j = int(np.clip(np.floor(b), 0, len(chords) - 1)); return chords[j], bnote[j], j
    hi = np.array(d['hi'][:n])

    for i in range(n):
        b = bp[i]; (root, minor), bn, j = chord_at(b)
        tones = [0, 3, 7] if minor else [0, 4, 7]
        base = 60 + root - (12 if root > 7 else 0)
        # ---- V2 bass
        if full[i]:
            e8 = b * 2; ph = e8 - np.floor(e8)
            pop = 12 if (int(np.floor(b * 4)) % 4) == 3 else 0
            freq[i, 1] = M(bn + pop); wave[i, 1] = 1
            gate[i, 1] = 1 if bass_on[i] and ph < .72 else 0
            ad[i, 1] = 0x06; sr_[i, 1] = 0x89
            fc[i] = 700 + 1900 * np.exp(-(b - np.floor(b)) * 4) + 500 * np.sin(b / 32 * np.pi) ** 2; res[i] = 11
        else:
            freq[i, 1] = M(bn); wave[i, 1] = 1
            newnote = j > 0 and bnote[j] != bnote[j - 1] or int(np.floor(b)) % 4 == 0
            atstart = (b - np.floor(b)) < .08
            gate[i, 1] = 0 if (atstart and newnote) or not bass_on[i] else 1   # re-trigger on changes and each bar
            ad[i, 1] = 0x2A; sr_[i, 1] = 0xA8
            fc[i] = 420 + 180 * np.exp(-(b - np.floor(b)) * 2); res[i] = 6
        # ---- V3 chords
        if full[i]:
            m = base + tones[i % 3] + (12 if int(np.floor(b / 4)) % 2 else 0)
            freq[i, 2] = M(m); wave[i, 2] = 2; pw[i, 2] = int(900 + 600 * np.sin(i * .02))
            gate[i, 2] = 1 if music_on[i] else 0; ad[i, 2] = 0x00; sr_[i, 2] = 0x7A if music_on[i] else 0x00
        elif opts.get('sparse', 'soft') == 'broken':   # a triangle broken-chord pattern in sixteenths
            pat = [0, 1, 2, 3, 2, 1, 0, 2]; s16 = int(np.floor(b * 4)); st16 = (b * 4 - s16) < .25
            step = pat[s16 % 8]; m = base + (tones[step] if step < 3 else 12)
            freq[i, 2] = M(m); wave[i, 2] = 3
            gate[i, 2] = 0 if st16 or not music_on[i] else 1
            ad[i, 2] = 0x06; sr_[i, 2] = 0x55
        else:                                            # a soft sustained chord: the 50 Hz arp on triangle, or a slower pulse arp
            soft = opts.get('sparse', 'soft') == 'soft'
            m = base + tones[(i if soft else i // 2) % 3]
            freq[i, 2] = M(m); wave[i, 2] = 3 if soft else 2; pw[i, 2] = 1600
            gate[i, 2] = 1 if music_on[i] else 0; ad[i, 2] = 0x40; sr_[i, 2] = (0xA6 if soft else 0x66) if music_on[i] else 0
    for i in range(1, n - 1):                            # hi-hats stolen from the arp channel, full sections only
        if full[i] and hi[i] > .35 and hi[i] > hi[i - 1] * 1.3:
            wave[i, 2] = 4; freq[i, 2] = hz2reg(9000); ad[i, 2] = 0x00; sr_[i, 2] = 0xF2; gate[i, 2] = 1

    # ---- V1 lead, from notes
    notes = lead_notes(d, n, tun)
    vels = np.array([x['vel'] for x in notes]); vlo, vhi = np.percentile(vels, 10), np.percentile(vels, 90)
    prev = None
    for x in notes:
        s, e, m = x['s'], x['e'], x['m'] + 12
        S = int(np.clip(round(9 + 6 * (x['vel'] - vlo) / (vhi - vlo + 1e-9)), 8, 15))
        glide_from = prev['m'] + 12 if (x['legato'] and prev is not None and prev['e'] >= s - 1) else None
        for f in range(s, e):
            age = f - s
            pitch = m
            if glide_from is not None and age < 8: pitch = m + (glide_from - m) * np.exp(-age / 1.6)
            depth = .28 * np.clip((age - 12) / 15, 0, 1)
            pitch += depth * np.sin(2 * np.pi * 5.6 * age / FPS)
            freq[f, 0] = M(pitch); wave[f, 0] = 2
            pw[f, 0] = int(1300 + 650 * np.sin(age * .07))  # a fresh PWM sweep on each note
            ad[f, 0] = 0x08; sr_[f, 0] = (S << 4) | 0x7
            gate[f, 0] = 1
        # hard restart: a new syllable right after the last note gets one frame of gate-off to re-trigger the envelope
        if not x['legato'] and s > 0 and gate[s - 1, 0]: gate[s - 1, 0] = 0
        for f in range(e, min(n, e + 14)):                   # the release tail keeps the note's pitch and timbre
            if gate[f, 0]: break
            freq[f, 0] = freq[e - 1, 0]; wave[f, 0] = 2; pw[f, 0] = pw[e - 1, 0]; ad[f, 0] = 0x08; sr_[f, 0] = sr_[e - 1, 0]
        prev = x

    # ---- master volume follows the original's sections (3 s loudness), within the SID's 4-bit range
    if orig:
        ref, _ = librosa.load(orig, sr=SR, mono=True, offset=start, duration=n / FPS)
        r = librosa.feature.rms(y=ref, frame_length=2048, hop_length=SR // FPS)[0][:n]
        db = 20 * np.log10(smooth(np.pad(r, (0, max(0, n - len(r)))), 150) + 1e-5)
        lo, hi_ = np.percentile(db, 5), np.percentile(db, 95)
        vol = np.round(np.clip(11 + 4 * (db - lo) / (hi_ - lo + 1e-9), 10, 15))

    # ---- D: the digi channel
    drm, _ = librosa.load(drums_path, sr=SR, mono=True, offset=start, duration=n / FPS)
    DSR = int(opts.get('dsr', 15639))                                    # one 4-bit write per raster line: 985248 / 63 cycles
    low = librosa.resample(drm, orig_sr=SR, target_sr=DSR)
    low = low / (np.percentile(np.abs(low), 99.5) + 1e-9)
    mu = float(opts.get('mu', 0))
    low = np.sign(low) * np.log1p(mu * np.minimum(np.abs(low), 1.5)) / np.log1p(mu) if mu > 0 else np.tanh(low * 1.6)
    low[np.abs(low) < float(opts.get('dgate', 0))] = 0.0               # gate: silence between hits, no 4-bit hiss
    dq = np.clip(np.round(low * 7.5 + 7.5), 0, 15).astype(np.float64)

    # ---- optional window / solo (for checking one part)
    a, b = 0, n
    if 'window' in opts: wa, wb = map(float, opts['window'].split(':')); a, b = int((wa - start) * FPS), int((wb - start) * FPS)
    mute = np.array([1, 1, 1, 1]) if 'solo' in opts else np.zeros(4, dtype=np.int64)
    if 'solo' in opts:
        for s in opts['solo'].split(','): mute[['lead', 'bass', 'arp', 'digi'].index(s)] = 0
    dq_w = dq[int(a / FPS * DSR):]
    sl = slice(a, b)
    out = np.zeros((b - a) * SPF, dtype=np.float32)
    # the mix, set from the original's stem balance in the choruses (vocal ~0.5x the drums, bass ~0.5x, the rest ~0.35x),
    # with the lead a little hotter than the real vocal because it has to carry the tune alone
    gain = np.array([float(x) for x in opts.get('gain', '.4,.57,.34,1').split(',')])
    render(freq[sl], pw[sl], wave[sl], gate[sl], ad[sl], sr_[sl], fc[sl], res[sl], route[sl], vol[sl], dq_w, float(DSR), mute.astype(np.int64), gain, out)
    y = resample_poly(out.astype(np.float64), 1, OS)                         # anti-aliased decimation to 44.1 kHz
    b1 = np.exp(-2 * np.pi * 14000 / SR); y = lfilter([1 - b1], [1, -b1], y)  # the C64 output stage: gentle low-pass
    bb, aa = butter(1, 25 / (SR / 2), 'high'); y = lfilter(bb, aa, y)         # and DC block
    if 'raw' not in opts:                                                     # normalise; the rare highest peaks are
        pk = np.percentile(np.abs(y), 99.99) + 1e-9; y = y / pk * .85             # rounded off softly instead of setting the level
        big = np.abs(y) > .85; y[big] = np.sign(y[big]) * (.85 + .1 * np.tanh((np.abs(y[big]) - .85) / .1))
    if b == n and a == 0:
        fl = int(1.2 * SR); y[-fl:] *= np.linspace(1, 0, fl)
    sf.write(outp, np.stack([y, y], 1), SR, subtype='PCM_16')
    if 'debug' in opts: np.savez(outp + '.npz', full=full, gate=gate, wave=wave, freq=freq, vol=vol, sr=sr_)
    print('wrote', outp, len(y) / SR, 's', '| key', 'C C# D D# E F F# G G# A A# B'.split()[key], '| lead notes', len(notes), '| tuning', round(tun, 3))

if __name__ == '__main__':
    main()
