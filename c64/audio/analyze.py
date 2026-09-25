# analyze.py: turn the separated stems of the original song into SID note data at 50 Hz (one C64 PAL frame),
# plus the song's beat grid and a chord per beat.
#   usage: python analyze.py <stems dir> <start s within stems> <length s> <out.json>
# The stems come from demucs (htdemucs): vocals / bass / drums / other.
import sys, json, numpy as np, librosa
d, start, length, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
SR, HOP = 44100, 882                     # 44100 / 882 = 50 frames per second
NAMES = 'C C# D D# E F F# G G# A A# B'.split()
def load(n): y, _ = librosa.load(f'{d}/{n}.wav', sr=SR, mono=True, offset=start, duration=length); return y
def track(y, fmin, fmax):
    f0, vo, vp = librosa.pyin(y, fmin=fmin, fmax=fmax, sr=SR, frame_length=2048 if fmin > 60 else 4096, hop_length=HOP)
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=HOP)[0]
    n = min(len(f0), len(rms)); midi = np.where(vo[:n], librosa.hz_to_midi(np.nan_to_num(f0[:n], nan=1.0)), np.nan)
    return midi, rms[:n] / (np.percentile(rms, 99.5) + 1e-9), vp[:n]
voc, vrms, _ = track(load('vocals'), 90, 900)
bas, brms, _ = track(load('bass'), 30, 260)
oth_y = load('other')
oth, orms, oprob = track(oth_y, 150, 1400)                # the instrumental melody, for stretches without vocals
dr = load('drums')
n = min(len(voc), len(bas), len(oth))

# ---- beats: track the full mix with a strong prior at the drum stem's tempo, then keep the grid steady
mix = load('vocals') + load('bass') + oth_y + dr
tempo, beats = librosa.beat.beat_track(y=mix, sr=SR, hop_length=512, start_bpm=132.6, tightness=400, units='time')
beats = np.asarray(beats)

# ---- a chord per beat: root from the bass (it's clean), major/minor from the chroma of bass + other
chroma = librosa.feature.chroma_cqt(y=oth_y + .6 * load('bass'), sr=SR, hop_length=HOP)
chords = []
for k in range(len(beats)):
    a = int(beats[k] * 50); b = int((beats[k + 1] if k + 1 < len(beats) else beats[k] + .45) * 50)
    bm = [m for m in bas[a:b] if not np.isnan(m)]
    ch = chroma[:, a:b].mean(1) if b > a else np.zeros(12)
    if bm: root = int(round(np.median(bm))) % 12
    else: root = int(np.argmax(ch))
    minor = ch[(root + 3) % 12] > ch[(root + 4) % 12] * 1.15
    chords.append([round(float(beats[k]), 3), root, 1 if minor else 0])

# ---- per-beat chroma (other + some bass) for the chord tracker in sid.py, and the song's tuning offset
bchroma = []
for k in range(len(beats)):
    a = int(beats[k] * 50); b = int((beats[k + 1] if k + 1 < len(beats) else beats[k] + .45) * 50)
    bchroma.append(np.round(chroma[:, a:max(b, a + 1)].mean(1), 3).tolist())
tuning = float(librosa.estimate_tuning(y=oth_y + load('vocals'), sr=SR))     # in fractions of a semitone
# ---- syllable onsets in the vocal, and drum energy (the song's sections: no drums in the intro and the breakdown)
vy = load('vocals')
vonset = librosa.onset.onset_strength(y=vy, sr=SR, hop_length=HOP, aggregate=np.median, fmax=4000)
drms = librosa.feature.rms(y=dr, frame_length=2048, hop_length=HOP)[0]
f = lambda a: [None if np.isnan(m) else round(float(m), 2) for m in a[:n]]
r = lambda a: [round(float(x), 3) for x in a[:n]]
S = np.abs(librosa.stft(dr, n_fft=2048, hop_length=HOP)); fr = librosa.fft_frequencies(sr=SR, n_fft=2048)
hi = S[fr > 6000].sum(0)
json.dump({'fps': 50, 'tempo': float(np.atleast_1d(tempo)[0]), 'beats': [round(float(b), 3) for b in beats], 'chords': chords,
           'vocal': f(voc), 'vrms': r(vrms), 'bass': f(bas), 'brms': r(brms), 'other': f(oth), 'orms': r(orms), 'oprob': r(oprob),
           'hi': r(hi / (np.percentile(hi, 99.5) + 1e-9)), 'bchroma': bchroma, 'tuning': tuning,
           'vonset': r(vonset / (np.percentile(vonset, 99.5) + 1e-9)), 'drms': r(drms / (np.percentile(drms, 99) + 1e-9))}, open(out, 'w'))
print('frames', n, 'tempo', tempo, 'beats', len(beats), 'tuning', tuning)
print(' '.join(NAMES[c[1]] + ('m' if c[2] else '') for c in chords))
