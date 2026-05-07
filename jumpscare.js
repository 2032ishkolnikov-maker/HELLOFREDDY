// jumpscare.js
// One shared "very scary jumpscare" used on every death screen across the game.
//
// How to use:
//   1. Add <script src="jumpscare.js"></script> to your HTML page.
//   2. Anywhere in your code, call:
//        window.runJumpscare(() => { /* show the death screen here */ });
//   3. The jumpscare plays (face + scream + flashes + shake) for ~1.1s,
//      then fades and runs your callback.
//
// What happens visually:
//   - Black overlay snaps onto the screen
//   - A giant menacing animatronic face zooms in (CSS-drawn, no image needed)
//   - Two huge glowing red/white eyes pulse
//   - A mouth full of sharp teeth gapes open
//   - Red flashes strobe over the screen
//   - Static crackle, screen shake violently
//   - Loud screech + bass boom + noise burst (Web Audio API, no sound files)

(function () {
  let audioCtx;

  // ── Sound: a layered scream ──
  function playScream() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const c = audioCtx;

    // 1. Bass boom — sweeps from 40Hz down to 20Hz, loud and sub-feeling
    const boom = c.createOscillator();
    const boomGain = c.createGain();
    boom.type = 'sawtooth';
    boom.frequency.setValueAtTime(40, c.currentTime);
    boom.frequency.exponentialRampToValueAtTime(20, c.currentTime + 0.8);
    boomGain.gain.setValueAtTime(0.5, c.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.85);
    boom.connect(boomGain).connect(c.destination);
    boom.start();
    boom.stop(c.currentTime + 0.85);

    // 2. Rising shriek — sweeps from 150Hz up to 1500Hz, classic horror sting
    const shriek = c.createOscillator();
    const shriekGain = c.createGain();
    shriek.type = 'sawtooth';
    shriek.frequency.setValueAtTime(150, c.currentTime);
    shriek.frequency.exponentialRampToValueAtTime(1500, c.currentTime + 0.55);
    shriekGain.gain.setValueAtTime(0.4, c.currentTime);
    shriekGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
    shriek.connect(shriekGain).connect(c.destination);
    shriek.start();
    shriek.stop(c.currentTime + 0.6);

    // 3. Static crackle — random noise burst that fades out, sounds like glitched audio
    const noiseBuf = c.createBuffer(1, c.sampleRate * 0.35, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const noise = c.createBufferSource();
    noise.buffer = noiseBuf;
    const noiseGain = c.createGain();
    noiseGain.gain.value = 0.25;
    noise.connect(noiseGain).connect(c.destination);
    noise.start();
  }

  // ── Inject CSS once (the styles for the overlay and face) ──
  function ensureStyles() {
    if (document.getElementById('__jumpscareStyle')) return;
    const style = document.createElement('style');
    style.id = '__jumpscareStyle';
    style.textContent = `
      #__jumpscareOverlay {
        position: fixed;
        inset: 0;
        z-index: 99999999;
        background: #000;
        overflow: hidden;
        pointer-events: none;
        animation: __jsShake 0.04s linear infinite;
      }
      @keyframes __jsShake {
        0%   { transform: translate(0, 0); }
        25%  { transform: translate(-15px, 10px); }
        50%  { transform: translate(12px, -10px); }
        75%  { transform: translate(-10px, -12px); }
        100% { transform: translate(10px, 12px); }
      }
      #__jumpscareOverlay .__js-flash {
        position: absolute;
        inset: 0;
        background: #ff0000;
        opacity: 0;
        animation: __jsFlash 0.13s 6;
      }
      @keyframes __jsFlash {
        0%, 100% { opacity: 0; }
        50%      { opacity: 0.85; }
      }
      #__jumpscareOverlay .__js-static {
        position: absolute;
        inset: 0;
        background-image:
          repeating-linear-gradient(0deg,  rgba(255,255,255,0.7) 0 1px, transparent 1px 3px),
          repeating-linear-gradient(90deg, rgba(255,0,0,0.5)     0 2px, transparent 2px 5px);
        opacity: 0.35;
        animation: __jsStatic 0.05s steps(2) infinite;
      }
      @keyframes __jsStatic {
        0%   { transform: translate(0, 0); }
        100% { transform: translate(2px, 3px); }
      }
      /* The big head */
      #__jumpscareOverlay .__js-face {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 95vmin;
        height: 95vmin;
        transform: translate(-50%, -50%) scale(0);
        background: radial-gradient(circle at 50% 38%, #2a0500 0%, #1a0000 40%, #000 80%);
        border-radius: 50%;
        box-shadow: 0 0 200px #ff0000 inset, 0 0 80px #ff0000;
        animation: __jsFace 0.4s ease-out forwards;
      }
      @keyframes __jsFace {
        0%   { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
        60%  { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
      }
      /* Glowing eyes */
      #__jumpscareOverlay .__js-eye {
        position: absolute;
        top: 32%;
        width: 16vmin;
        height: 16vmin;
        background: radial-gradient(circle, #ffffff 0%, #ffaa00 25%, #ff0000 60%, #5a0000 100%);
        border-radius: 50%;
        box-shadow: 0 0 80px #ffffff, 0 0 160px #ff0000, 0 0 240px #ff0000;
        animation: __jsEyeGlow 0.18s alternate infinite;
      }
      #__jumpscareOverlay .__js-eye.left  { left: 18%; }
      #__jumpscareOverlay .__js-eye.right { right: 18%; }
      @keyframes __jsEyeGlow {
        0%   { box-shadow: 0 0 60px #ff0000,  0 0 120px #ff0000, 0 0 200px #ff0000; }
        100% { box-shadow: 0 0 100px #ffffff, 0 0 200px #ffaa00, 0 0 300px #ff0000; }
      }
      /* Open mouth with sharp teeth */
      #__jumpscareOverlay .__js-mouth {
        position: absolute;
        bottom: 16%;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 13vmin;
        background: #050000;
        border-radius: 50% 50% 50% 50% / 30% 30% 100% 100%;
        box-shadow: 0 0 40px #5a0000 inset;
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        padding: 0 6%;
      }
      #__jumpscareOverlay .__js-tooth {
        width: 8%;
        height: 80%;
        background: linear-gradient(to bottom, #ffeedd 0%, #aa9988 100%);
        clip-path: polygon(50% 100%, 0 0, 100% 0);
        box-shadow: 0 0 6px #ffffff;
      }
    `;
    document.head.appendChild(style);
  }

  // Build a fresh overlay every call so the CSS animations restart cleanly.
  function buildOverlay() {
    // Remove any leftover overlay from a previous call
    const old = document.getElementById('__jumpscareOverlay');
    if (old) old.remove();

    ensureStyles();

    const overlay = document.createElement('div');
    overlay.id = '__jumpscareOverlay';
    overlay.innerHTML = `
      <div class="__js-flash"></div>
      <div class="__js-face">
        <div class="__js-eye left"></div>
        <div class="__js-eye right"></div>
        <div class="__js-mouth">
          <div class="__js-tooth"></div>
          <div class="__js-tooth"></div>
          <div class="__js-tooth"></div>
          <div class="__js-tooth"></div>
          <div class="__js-tooth"></div>
          <div class="__js-tooth"></div>
        </div>
      </div>
      <div class="__js-static"></div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  // Public API: run the jumpscare and call `callback` after `duration` ms.
  // The overlay fades out and is removed before the callback fires, so any
  // death screen you show inside the callback is visible underneath.
  window.runJumpscare = function (callback, duration) {
    duration = duration || 1100;
    callback = callback || function () {};

    const overlay = buildOverlay();
    playScream();

    // Fade out near the end
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.2s';
      overlay.style.opacity = '0';
    }, duration - 200);

    // Then remove + run callback
    setTimeout(() => {
      overlay.remove();
      callback();
    }, duration);
  };
})();
