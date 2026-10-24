/**
 * CCTV / LIMINAL AUDIO CONTROLLER
 * Integrates procedural audio with surveillance camera & poolrooms environments.
 */

(function () {
  const isPoolrooms = window.location.pathname.includes('poolrooms');
  const ambienceType = isPoolrooms ? 'poolrooms' : 'cctv';

  const unlockAudio = () => {
    if (window.witchyAudio) {
      window.witchyAudio.startAmbience(ambienceType);
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  // Map room navigation click: play heavy mechanical camera switch SFX
  document.addEventListener('click', (e) => {
    if (e.target.closest('.map-room')) {
      if (window.witchyAudio) window.witchyAudio.playCamSwitch();
    } else if (e.target.closest('button, a')) {
      if (window.witchyAudio) window.witchyAudio.playClick();
    }
  });

  // Observe static bursts and glitch triggers in DOM
  const burstEl = document.getElementById('static-burst');
  if (burstEl && window.MutationObserver) {
    const obs = new MutationObserver(() => {
      if (burstEl.style.opacity && parseFloat(burstEl.style.opacity) > 0.04) {
        if (window.witchyAudio) window.witchyAudio.playGlitch();
      }
    });
    obs.observe(burstEl, { attributes: true, attributeFilter: ['style'] });
  }
})();
