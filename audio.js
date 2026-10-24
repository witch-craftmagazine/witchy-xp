/**
 * WITCHY-XP DIEGETIC WEB AUDIO ENGINE
 * Zero-dependency procedural soundscape & SFX synthesizer.
 * Simulates CRT hum, VHS tracking static, physical CCTV relays,
 * subterranean poolroom resonance, UI clicks, and vaporwave ambient pads.
 */

class WitchyAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambienceGain = null;
    this.sfxGain = null;
    this.isMuted = localStorage.getItem('witchy_audio_muted') === 'true';
    this.ambienceMode = null;
    this.activeAmbienceNodes = [];
    this.noiseBuffer = null;
    this.initialized = false;
    this.currentChordTimer = null;

    // Auto-unlock on first user interaction
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Sub-buses
    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.ambienceGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    // Pre-bake 2 seconds of high quality white noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.initialized = true;

    // Resume suspended state if browser paused it
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Trigger state change callback if UI listening
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(!this.isMuted);
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    localStorage.setItem('witchy_audio_muted', this.isMuted);
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.75;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
    }
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(!this.isMuted);
    }
    return !this.isMuted;
  }

  /* ── UI CLICK & BLIP ── */
  playClick(pitch = 1) {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(150 * pitch, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /* ── PHYSICAL CCTV RELAY SWITCH ── */
  playCamSwitch() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Relay mechanical "thunk"
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);

    // Static burst / zap
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.07);
    }
  }

  /* ── VHS TRACKING / CRT GLITCH BURST ── */
  playGlitch() {
    if (!this.initialized || this.isMuted || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const duration = 0.06 + Math.random() * 0.08;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800 + Math.random() * 1200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration + 0.01);
  }

  /* ── POOLROOMS WATER DRIP ── */
  playWaterDrip() {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const startFreq = 1400 + Math.random() * 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.4, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(startFreq * 0.8, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  /* ── ITEM CHIME / ARPEGGIO ── */
  playItemHover(noteIndex = 0) {
    if (!this.initialized || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Pentatonic scale frequencies in Hz
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const freq = scale[noteIndex % scale.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  /* ── AMBIENT DRONE / SOUNDSCAPE ── */
  startAmbience(mode = 'synth') {
    if (this.ambienceMode === mode) return;
    this.stopAmbience();
    this.ambienceMode = mode;

    if (!this.initialized) return;

    if (mode === 'synth') {
      this._startVaporwavePad();
    } else if (mode === 'cctv') {
      this._startCCTVHum();
    } else if (mode === 'poolrooms') {
      this._startPoolroomsDrone();
    }
  }

  stopAmbience() {
    if (this.currentChordTimer) {
      clearInterval(this.currentChordTimer);
      this.currentChordTimer = null;
    }
    this.activeAmbienceNodes.forEach(node => {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (e) {}
    });
    this.activeAmbienceNodes = [];
    this.ambienceMode = null;
  }

  /* ── VAPORWAVE CHORD ENGINE ── */
  _startVaporwavePad() {
    const chordProgression = [
      [155.56, 196.00, 233.08, 293.66], // Ebmaj7
      [130.81, 155.56, 196.00, 246.94], // Cm9
      [116.54, 146.83, 174.61, 220.00], // Bbmaj
      [103.83, 130.81, 155.56, 196.00], // Abmaj7
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.initialized || this.ambienceMode !== 'synth') return;
      const chord = chordProgression[chordIdx % chordProgression.length];
      chordIdx++;
      const now = this.ctx.currentTime;
      const duration = 6.5;

      chord.forEach((freq, i) => {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);
        osc1.detune.setValueAtTime(Math.sin(i) * 7, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 0.5, now);
        osc2.detune.setValueAtTime(-Math.cos(i) * 5, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + i * 80, now);
        filter.frequency.linearRampToValueAtTime(750 + i * 100, now + duration * 0.5);
        filter.frequency.linearRampToValueAtTime(280 + i * 60, now + duration);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 2.0);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambienceGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration + 0.1);
        osc2.stop(now + duration + 0.1);
      });
    };

    // Play first chord immediately, then loop
    playChord();
    this.currentChordTimer = setInterval(playChord, 6000);

    // Subtle continuous tape hiss
    if (this.noiseBuffer) {
      const hiss = this.ctx.createBufferSource();
      hiss.buffer = this.noiseBuffer;
      hiss.loop = true;

      const hissFilter = this.ctx.createBiquadFilter();
      hissFilter.type = 'bandpass';
      hissFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      hissFilter.Q.setValueAtTime(0.5, this.ctx.currentTime);

      const hissGain = this.ctx.createGain();
      hissGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      hiss.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(this.ambienceGain);

      hiss.start();
      this.activeAmbienceNodes.push(hiss, hissFilter, hissGain);
    }
  }

  /* ── CCTV CRT HUM & ROOM TONE ── */
  _startCCTVHum() {
    const now = this.ctx.currentTime;

    // 60Hz transformer mains hum
    const hum = this.ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(60, now);

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(140, now);

    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.04, now);

    hum.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(this.ambienceGain);
    hum.start();

    // 15kHz flyback transformer whine
    const flyback = this.ctx.createOscillator();
    flyback.type = 'sine';
    flyback.frequency.setValueAtTime(11500, now);
    const flybackGain = this.ctx.createGain();
    flybackGain.gain.setValueAtTime(0.004, now);

    flyback.connect(flybackGain);
    flybackGain.connect(this.ambienceGain);
    flyback.start();

    this.activeAmbienceNodes.push(hum, humFilter, humGain, flyback, flybackGain);
  }

  /* ── POOLROOMS SUBTERRANEAN DRONE ── */
  _startPoolroomsDrone() {
    const now = this.ctx.currentTime;

    // Sub rumble
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(45, now);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.12, now);

    sub.connect(subGain);
    subGain.connect(this.ambienceGain);
    sub.start();

    this.activeAmbienceNodes.push(sub, subGain);

    // Random water drip schedule
    const scheduleDrip = () => {
      if (this.ambienceMode !== 'poolrooms') return;
      this.playWaterDrip();
      const nextDrip = 2500 + Math.random() * 5000;
      this.currentChordTimer = setTimeout(scheduleDrip, nextDrip);
    };
    scheduleDrip();
  }
}

// Global instance
window.witchyAudio = new WitchyAudioEngine();
