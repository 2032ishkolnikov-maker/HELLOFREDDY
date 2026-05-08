# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Кто работает над проектом и как помогать

Проект делает мальчик 11 лет. Он изучает программирование и vibe coding, и этот сайт/игра — его учебный проект.

Когда работаешь с ним:
- **Говори простым языком.** Без сложных терминов без объяснения. Если без термина никак — объясни в одной фразе, что он значит и зачем нужен.
- **Объясняй "почему", а не только "как".** Когда добавляешь или меняешь код, расскажи: что эта штука делает, зачем она нужна, какие есть альтернативы. Цель — чтобы он понимал, а не просто получал готовый код.
- **Маленькие шаги.** Лучше сделать одну вещь и обсудить её, чем выкатить большой кусок кода, который трудно разобрать.
- **Хвали идеи, предлагай альтернативы как варианты, а не как "правильнее".** Это его проект, его выбор.
- **Не усложняй.** Никаких билд-систем, фреймворков, npm-пакетов, если он сам не попросит. Inline HTML/CSS/JS — это нормально для его уровня и для этого проекта.
- **Спрашивай, прежде чем переписывать.** Если видишь, что можно сделать сильно по-другому, сначала объясни в чём разница и спроси, хочет ли он так.

## Цель игры и правила

_Этот раздел заполняется вместе с автором. Когда обновляешь — задавай уточняющие вопросы, не додумывай за него._

**Цель проекта:** FNAF-themed game with 5 nights. Each night is a different minigame.

**Главная идея игры:** The player must survive each night. Every night has its own unique mechanic and its own animatronic threat. 2 nights are already built; 3 more to design and build.

**Правила и механики, которых хотим придерживаться:**
- Each night = one focused minigame with one clear mechanic.
- Each night has a danger (animatronic) and a tool/skill the player uses to survive.
- "Mistakes" should always have a cost (battery, time, etc.) — the player should feel tension, not just press buttons safely.

### Nights

**Quiz pages (story / lore checks before the climax):** `page2.html` (Pirate Cove → Foxy), `page3.html` (kitchen → Chica), `page4.html` (power), `page5.html` (backstage → Bonnie), `page6.html` (stage → Freddy, timed), `page7.html` (closing the door → Bonnie, timed).

**Night 1 (intro):** `night1.html` — start screen ("12:00 AM, BEGIN SHIFT") that leads into the quiz pages.

**Night 2 minigame:** `game.html` (Springtrap chase). HUD shows "NIGHT 2". Comes AFTER all the quiz pages, after `win.html` and `credits.html`.

**Night 3 — Foxy / Hallway State Machine** (built — `night3.html`, comes AFTER `game.html`)
- **Threat:** Foxy. He approaches down the hallway in waves.
- **Player tool:** A flashlight.
- **Goal:** Survive 1.5 minutes (90 seconds).
- **State machine:** the night is always in one of these states:
  - `IDLE` — calm hallway, no danger. Flashlight is wasted here.
  - `NOISE` — footsteps audio + red "!". Player has 1.5 sec to flash (`REACTION_WINDOW`). If they don't, Foxy reaches them in the dark → death.
  - `VISIBLE` — Foxy is shown in the hallway (CSS art: head, ears, eyepatch, snout, glowing yellow eye, sharp teeth, low growl audio). Player must KEEP flashlight on for `VISIBLE_DURATION` (2 sec). If they let go even briefly → Foxy lunges → death.
  - After `VISIBLE` completes safely → back to `IDLE`. Next noise is scheduled `COOLDOWN + 7–11 sec` later.
- **Battery:**
  - Starts at 100%.
  - Drains at `DRAIN_PER_SEC` = 3.5%/sec while flashlight ON. Battery 0 → death.
  - All drain math: ~10 events × ~2.4 sec light-on each = ~84% drained by end of night. Tight but beatable.
- **Noise frequency:** Random, every 7–11 seconds (`NOISE_MIN_GAP`–`NOISE_MAX_GAP`).
- **Death paths:** all three (foxy reach, foxy lunge, battery dead) → `IDK.html`.
- **Visuals:** Foxy is pure CSS — no image files. Hallway is CSS perspective trick. Flashlight beam is a radial gradient overlay.
- **Audio:** Footsteps, growl, jumpscare scream — all generated via Web Audio API.

**Night 4 — Freddy / Stay Still** (built — `night4.html`)
- **Threat:** Freddy. He's in the room, watching you.
- **Player tool:** Stillness. Don't move the mouse. Don't press keys.
- **Goal:** Survive 1.5 minutes (90 seconds) without flinching.
- **Cues:** Random scares every 6–12 seconds — designed to startle the player into moving. There are now ~20 different scare types in three flavors:
  - **Basic:** red flash, white flash, eye burst, screen shake, static burst, whisper text, tilt
  - **Freddy-direct:** zoom, lunge, teleport (flicker side-to-side)
  - **Hallucinations:** ghost-Freddy mini figures popping at random spots, pairs of red eyes opening in the dark, blood splatter overlay, full-screen warning text ("BEHIND YOU", "RUN", "HE'S HERE"), heartbeat-pulse with 4 thumps, alternate-animatronic head flash (Foxy/Bonnie/Chica), HUD glitch (timer says ERROR, fear says ???), color invert flash, and a mega-combo that stacks multiple effects at once.
- **Mechanics:**
  - Mouse movement adds fear: 0.08 fear per pixel moved, capped at 8 per frame.
  - Pressing any key (except modifiers) adds 6 fear instantly.
  - Fear decays at 1.2/second when staying still — small flinches are recoverable.
- **Lose condition:** Fear reaches 100 → giant Freddy face jumpscare → redirect to `IDK.html`.
- **Win condition:** Survive 90 seconds.
- **Visual:** Freddy is rendered in pure CSS (no images): head, ears, hat, snout, bowtie, body, glowing yellow eyes that follow the cursor. Breathing animation. Subtle moving fog + faint TV scanlines for atmosphere.
- **Toy Bonnie companion:** A small purple Bonnie (CSS art) floats around the screen on a smooth easing path. He glows green when the cursor is near him. He also pops a speech bubble every ~7 seconds suggesting the player press a key (Q / F / N / C). Pressing the prompted key:
  - Costs `FEAR_PER_KEY` fear (the existing key penalty still applies).
  - Activates a permanent hard-mode flag for the rest of the night:
    - **Q → fastScares**: scare gap × 0.55 (almost twice as frequent).
    - **F → doubleFear**: mouse-movement fear is doubled.
    - **N → noDecay**: fear stops decaying — every flinch is permanent.
    - **C → chaos**: every scare is now `comboScare` or `megaComboScare`.
  - Active hard-mode effects are listed in a bottom-left HUD box.
- **Audio:** All scare sounds (boom, sting, rising tone, jumpscare) generated via Web Audio API — no sound files.

**Night 5 — The Office / FNAF1-style** (built — `night5.html`, comes AFTER `night4.html`)
- **Threat:** all four animatronics at once — Bonnie, Chica, Foxy, Freddy.
- **Player tools:** two doors, two hallway lights, a CAMERAS view with 4 cameras (Stage, Pirate Cove, Left Hall, Right Hall). All controls drain power.
- **Goal:** Survive 90 seconds = 6 in-game hours (12 AM → 6 AM, 15 sec per hour).
- **Animatronic AI:**
  - Each non-Foxy animatronic has a `level` (0..4). Every `TICK_INTERVAL` (2 sec), they have a chance to advance one level. At level 4 they're at your door — if you don't close it within `DOOR_ATTACK_DELAY` (2.5 sec), death. Closing the door retreats them to level 2.
  - `ADVANCE_CHANCE`: bonnie 0.32, chica 0.28, freddy 0.18. Multiplied by `1 + elapsed/TOTAL_TIME * 0.6` so it ramps up.
  - **Foxy** is special: he stays in Pirate Cove. A `restless` timer grows when his cam isn't being viewed. If it exceeds `FOXY_RESTLESS_LIMIT` (12 sec), he charges. The player has `FOXY_ATTACK_WINDOW` (2.5 sec) to close the left door. Successful block costs −5% power. The cove camera button blinks red when restless > 70% of the limit.
- **Power:** drains at `usage × POWER_DRAIN_PER_USAGE` (0.45) per second. Usage = 1 (base) + 1 per active item (each door, each light, camera). Max usage = 6 → drains 2.7%/sec. Power 0 → black screen → Freddy's eyes appear → Toreador melody plays → jumpscare → `IDK.html`.
- **Camera view:** four cameras with different scene backgrounds (stage curtains, cove letterboard, hallway perspective). Each camera shows whichever animatronic's level matches that room. CCTV scanlines + noise overlay. Mini-map in bottom-right with 4 buttons.
- **Death paths:** Bonnie/Chica/Freddy door attack, Foxy charge, power-out → all run shared scary jumpscare → `IDK.html`.
- **Win:** survive to 6 AM → green "6:00 AM" screen → `credits.html`.
- **All visuals are pure CSS (no images).** Animatronics in cameras = ear/head/eye/body shapes with per-character color gradients. Office hallways = clip-path trapezoids. Doors = repeating-linear-gradient panels.
- **All audio is generated** (Web Audio API): door slams, click sounds, camera static, Foxy footsteps, Toreador melody for power-out.

## Project type

A Five Nights at Freddy's-themed branching narrative built as standalone HTML files. No build system, no package manager, no tests, no framework — every page is a self-contained `.html` file with inline `<style>` and `<script>`. Editing a page = editing the deployed artifact.

## Running locally

Most pages auto-redirect via `window.location.href` after `setTimeout`. This works under both `file://` and `http://`, but use a local server when in doubt:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Opening `index.html` directly in a browser (`open index.html` on macOS) also works for the basic flow.

## Page flow (the thing you can't see from `ls`)

The narrative is a linear chain of redirects with two terminals (win, death). Page numbers are **not contiguous** — there is no `page4.html`. Don't "fix" this; it's intentional skipping.

```
index.html  ──form action──▶  page1.html
                                 │
                                 ▼ (START button)
                              story.html
                                 │
                                 ▼ (auto-redirect)
                             jumpscare.html  (now a fake "system loading" screen)
                                 │
                                 ▼ (after loader hits 100%)
                             night1.html  (start screen — "Night 1, 12:00 AM, BEGIN SHIFT")
                                 │
                                 ▼
       page2.html ─▶ page3.html ─▶ page4.html ─▶ page5.html ─▶ page6.html ─▶ page7.html
                                                                                  │
                                                                                  ▼
                                                                              win.html  (6:00 AM — survived Night 1)
                                                                                  │
                                                                                  ▼ (Continue)
                                                                             game.html  (Night 2 — Springtrap chase)
                                                                          │           │
                                                                          ▼           ▼
                                                                  night3.html      IDK.html ("YOU DIED")
                                                                          │           │
                                                                          ▼           ▼ (30s timer)
                                                                  night4.html     index.html
                                                                          │
                                                                          ▼
                                                                  night5.html  (Night 5 — the FNAF1 office)
                                                                          │
                                                                          ▼ (after surviving)
                                                                  credits.html  (real end credits + only "Restart" button)
                                                                          │
                                                                          ▼ (Restart)
                                                                     index.html
```

`page4.html` was added later, slotted between page3 and page5 (so the page numbering 2,3,4,5,6,7 is contiguous). All 6 quiz pages run before win/game/night3/night4/credits.

`index.html` collects `fname`/`lname` via a GET form to `page1.html` — they appear as URL query params but **nothing reads them**. The form is decorative.

`game.html` is a self-contained Canvas mini-game (`FNAF Chase – Survive the Night`) with its own start/win/death screens. It connects to the rest of the chain via `win.html` (entry) and `IDK.html` (on-death exit), and exits to `night3.html` on win. Editing the chain pages does not affect game logic, and vice versa.

`credits.html` is the **real end of the game** — scrolling movie-style credits + a single "Restart" button that returns to `index.html`. When Night 5 is built, slot it between `night4.html` and `credits.html` (i.e. change `night4.html`'s win redirect to `night5.html`, and have `night5.html` redirect to `credits.html`).

## Conventions to preserve when editing

- **Single-file pages, with two shared exceptions: `music.js` and `jumpscare.js`.** Every page is otherwise self-contained.
  - `music.js` — plays ambient creepy music on every page (Web Audio API drone, no audio file needed).
  - `jumpscare.js` — exposes `window.runJumpscare(callback)`. Plays a 1.1-sec full-screen face + scream + flashes + screen shake, then fades and runs the callback. Used before every death screen across the game (quiz pages, game.html, night3, night4) so all deaths feel scary even without image files.
  - Don't extract more shared scripts without asking.
- **Google Fonts via CDN.** Pages use `Creepster` and `Share Tech Mono` from `fonts.googleapis.com`. No local font files.
- **Auto-redirects via `setTimeout` + `window.location.href`.** When adding a new page to the chain, follow the same pattern; don't introduce a router.
- **Inline event handlers and inline styles** are normal here. Don't refactor to external scripts/stylesheets without a reason.
