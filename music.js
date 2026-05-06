// music.js
// Plays creepy ambient music on every page.
// We don't load any sound file — we GENERATE the sound from scratch
// using the Web Audio API. This way it works on every page with no
// extra files and no copyright worries.
//
// How to use: just add <script src="music.js"></script> at the bottom
// of any HTML page. Music will start the first time the user clicks
// or presses a key (browsers block sound until the user interacts).

(function () {
  let started = false; // make sure we only start once per page

  function startMusic() {
    if (started) return;
    started = true;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // ── Master volume ──
    // We fade it in slowly (over 3 seconds) so it doesn't suddenly POP.
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0, audioCtx.currentTime);
    master.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 3);
    master.connect(audioCtx.destination);

    // ── Drone chord ──
    // Three low tones played at the same time form a creepy chord.
    // These numbers are frequencies in Hz (how high or low the note is).
    // 55 = low A, 65.41 = C, 82.41 = E → that's an A minor chord (sad/scary).
    const drones = [55, 65.41, 82.41];
    drones.forEach(freq => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.5;
      osc.connect(gain).connect(master);
      osc.start();
    });

    // ── Low rumble noise layer ──
    // Random "static" filtered to be very low-pitched.
    // Adds a subtle "wind through the building" feel.
    const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 150;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.05;

    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.start();
  }

  // Browsers don't allow sound until the user interacts with the page.
  // So we wait for the first click, key press, or touch — then start.
  // { once: true } means the listener fires only one time, then auto-removes.
  ['click', 'keydown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, startMusic, { once: true });
  });
})();
