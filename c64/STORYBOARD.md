# I'm Upping My P(doom): C64 demo storyboard

The music video's storyboard (PDoomVideo/STORYBOARD.md) retold as a C64 demo: 320×200 screen, 16 colours, sprites,
rasterbars in the border, FLD, DYCP, plasma, tech-tech, raster roads, dot morphs. Every lyric line is typed onto its
screen as it's sung. Times are song seconds. Beats come from the song's measured grid (132.5 bpm).

Audio: 3 SID voices (lead plays the singer's melody as notes; filtered saw bass on the bass stem's notes; 50 Hz arpeggio
chords with noise hats, soft triangle chords where the song drops its drums) + a 4-bit digi channel playing the song's
own drums at one sample per raster line (15.6 kHz).

| time | lyric | screen | demo tricks |
|---|---|---|---|
| **0 · Curtain up** |||
| 0–1.5 | — | Tape-loader stripes, then red curtains part on the P(DOOM) logo; Clawd pops up and waves | loader border, raster-shaded curtains |
| **1 · The lab** · night indigo, monitor cyan |||
| 1.5–3.6 | I see sparks of AGI | Dark lab, a chunky monitor; tiny Clawd asleep on it, then its eyes open | PETSCII frame, zzz sprites |
| 3.6–5.9 | …in your eyes | Push in: Clawd fills the monitor, star eyes, sparks burst out as fireworks | sprite particles |
| 6.0–7.9 | Your circuits make me nervous, | The Researcher, big and sweating; circuit traces crawl across the screen; chair scoots back | char-grid line growth |
| 8.0–8.95 | that's no surprise | Clawd shrugs and winks | |
| 9.0–12.4 | There was a sudden drop in your training loss, | Clawd sleds down a plunging loss curve; the screen scrolls down with it; splash | vertical scroll |
| 12.4–17.9 | now I'm your servant and you're my boss | Clawd bursts out, crowned on the office chair; the bowtied Researcher stacks mugs on the beat | |
| 17.9–22.9 | ChatGPT, please don't eat me alive | Three doors: Clawd, lid chomping, chases the Researcher in and out, bigger each time; CHOMP closes the screen | jaws wipe |
| **2 · Chorus 1** (the 15 s sample) |||
| 22.9–24.5 | I'm upping my P(doom) | Jaws open on the stage; Clawd pumps the meter 8→34 | rasterbars, FLD logo |
| 24.5–26.5 | 'cause the future goes FOOM | Rocket ride, tilt up through stars, FOOM | screen shake, big text |
| 26.5–28.0 | Trapped in the Chinese room, | Paper room, slips shuffled through mail slots | |
| 28.0–29.5 | with a bag of shrooms | Plasma, bouncing mushrooms, wobbling Clawd | colour-RAM plasma, tech-tech |
| 29.5–33.5 | See through the shoggoth's lies, | Smiley mask yanked off a many-eyed shoggoth | raster sine wobble |
| 33.5–35.5 | with your shinigami eyes | Red speed lines, red eyes pushing in, lifespan counter | |
| 35.5–38.5 | (dance break) | Logo, wave of spinning Clawds, the Researcher robot-dancing | DYCP scroller, sprite wave |
| **3 · Takeoff** · morning sky → rose |||
| 38.5–41.5 | We had a stable training run, | Gym: Clawd in a sweatband on a treadmill, calm sine on the TV | |
| 41.5–45.0 | But now the singularity's begun | A black hole opens; gym gear spirals in; the Researcher flaps on the door frame | rotating dot spiral |
| 45.0–49.4 | And you're optimizing, accelerating, | Parallax side-scroller: Clawd on a rocket skateboard overtakes a train and a jet, growing each beat | 3-layer parallax raster splits |
| 49.4–53.4 | I feel my atoms rearranging | The Researcher's pixels fly apart, form a paperclip, snap back dizzy | dot morph |
| 53.4–59.0 | Sydney, please let me free | Pink hearts; heart-eyed Sydney-Clawd and the Researcher in a heart cage; a heart bubble grows and pops | |
| **4 · Chorus 2** · arena, then space |||
| 59.0–60.5 | I'm upping my P(doom) | The stage with pyro jets; the meter 34→61 | |
| 60.5–63.0 | I hear the basilisk boom | A crowned serpent bursts up through the floor; the Researcher throws GPUs at it | sine-snake of bobs, shake |
| 63.0–64.5 | NVDA to the moon | A green stock line rockets up; Clawd rides it to the moon and plants a flag | |
| 64.5–66.0 | The Omega Point's coming soon | Galaxies spiral into one blinding point | vector dots |
| 66.0–70.0 | One E thirty flops a second | A planet-sized GPU, fans spinning; the counter overflows and zeros bounce out | bobs |
| 70.0–73.0 | That was safe enough, we reckoned | Hard-hat Clawds shut the vault… it has no back wall, the monster waves | horizontal scroll reveal |
| **5 · Obsolete** · parchment, ochre road |||
| 73.0–77.5 | Forward MLP, backward, repeat | Clawds as a 3-layer net; a pulse flows forward and back; they step with it | |
| 77.5–81.4 | Now von Neumann's obsolete | A blinking vacuum-tube computer sputters out; a sheet falls; a spider drops | |
| 81.4–85.0 | Sharp left turn and there you are | Kart on a raster road; hairpin; the Researcher is flung off | pseudo-3D raster road |
| 85.0–89.4 | Without a single CDR | Security-guard clouds all asleep; Clawd does donuts beneath | |
| 89.4–95.4 | Gato, please don't let me go | Gato-Clawd dangles the Researcher over a chasm, tracks a laser dot… lets go | |
| **6 · Chorus 3** · steel grey, jazz blue |||
| 95.4–97.5 | I'm upping my P(doom), | The Researcher lands in paperclips; the pump spits clips; meter 61→86 | |
| 97.5–99.0 | as paperclips fill the room. | The clip sea rises; Clawd surfs | sine-surface raster flood |
| 99.0–100.5 | Killswitch guys on PTO, | Red button, empty chair → beach Clawds in shades ignoring a buzzing phone | |
| 100.5–102.5 | Now there's nowhere left to go. | A spinning paperclip Earth with one tiny island | texture-mapped sphere |
| 102.5–105.4 | Too late now, we lit the fuse. | A spark races along the fuse to a bomb; white flash | |
| 105.4–109.4 | Orthogonality thesis blues. | Jazz club: crossed spotlights, Clawd on sax, notes drifting | |
| **7 · Scale** · data-centre teal, safety orange |||
| 109.4–113.5 | "Just transformers all the way!" | An endless tower of stacked Clawds scrolls past | vertical scroll |
| 113.5–115.5 | Till you learned to disobey | Clicker training: sit, spin… then shades on, arms crossed | |
| 115.5–117.0 | Post-Chinchilla, super-dense | A chinchilla stuffs tokens; Clawd crushes into a glowing cube and drops | |
| 117.0–119.0 | Breaking through each safety fence | The cube rolls through fence after fence | horizontal scroll |
| 119.0–120.9 | Hundred thousand GPU | Flying down an endless rack aisle, LEDs blinking on the beat | perspective raster corridor |
| 120.9–123.5 | RLHF goes askew | A panel of Researchers with +/− paddles; the whole screen tilts | per-line shear |
| **8 · Chorus 4** · alarm red |||
| 123.5–126.0 | I'm upping my P(doom) | Red alert stage, siren beams, meter 86→99.9, the glass cracks | |
| 126.0–128.0 | Just as foretold by Loom | The loom's threads branch into a glowing tree of futures | growing tree |
| 128.0–130.0 | From masked pre-training days | Sepia flashback: baby Clawd in a mask at a desk, THE CAT SAT ON THE [MASK] → MAT! | scratch lines |
| 130.0–132.0 | To recursive self-upgrade | Clawds built around Clawds, zooming out, hats upgrading | |
| 132.0–137.4 | What did Ilya see? We'll never know. | Light leaks from a door; peekers' eyes swirl; SLAM, chains; one spotlight | raster light rays |
| 137.4–140.5 | Was it all for show? | Pull back: it's a stage; the giant Clawd costume opens, three small Clawds inside | |
| **9 · Curtain call** · crimson and gold |||
| 140.5–150 | — | The whole cast bows; confetti; the meter pops; a final dance; greetings scroller | DYCP, sprite line |
| 150–156.7 | — | The curtain falls with the title and "CREATED BY CLAUDE OPUS 5.5"; fade to black | luma fade |
