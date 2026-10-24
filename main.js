/* ══════════════════════════════════════════════
   DEATHCAP — VHS ANIMATION & UI SCRIPTS
   ══════════════════════════════════════════════ */


window.addEventListener("load", () => {
    window.scrollTo(0, 150); // match your spacer height
});


/* ── VHS CANVAS ANIMATION ── */

const canvas = document.getElementById('vhs-bg');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

let noiseOffset = 0;
const strips    = [];
const stripsMax = 6;

function makeStrip() {
  return {
    y:       Math.random() * canvas.height,
    h:       Math.random() * 6 + 1,
    speed:   Math.random() * 4 + 1,
    opacity: Math.random() * 0.35 + 0.05,
    color:   Math.random() > 0.5 ? '#ff71ce' : '#01cdfe',
    dx:      (Math.random() - 0.5) * 60,
    life:    Math.random() * 80 + 20,
    age:     0,
  };
}

function drawVHS() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Deep background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,   '#080112');
  bg.addColorStop(0.5, '#0d0221');
  bg.addColorStop(1,   '#150030');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle star field
  const seed = Math.floor(noiseOffset * 0.2);
  for (let i = 0; i < 120; i++) {
    const sx = ((i * 137 + seed * 3) % W);
    const sy = ((i * 97  + seed * 2) % H);
    const r  = i % 5 === 0 ? 1.5 : 0.8;
    const a  = 0.2 + (Math.sin(noiseOffset * 0.02 + i) * 0.5 + 0.5) * 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    const c = i % 3 === 0 ? `rgba(255,113,206,${a})` :
              i % 3 === 1 ? `rgba(1,205,254,${a})`   : `rgba(185,103,255,${a})`;
    ctx.fillStyle = c;
    ctx.fill();
  }

  // Slow aurora bands
  for (let b = 0; b < 3; b++) {
    const by  = H * (0.2 + b * 0.25) + Math.sin(noiseOffset * 0.005 + b * 2) * 40;
    const bh  = 80 + Math.sin(noiseOffset * 0.003 + b) * 30;
    const ga  = ctx.createRadialGradient(W * 0.5, by, 0, W * 0.5, by, W * 0.5);
    const cols = ['rgba(185,103,255,0.04)', 'rgba(1,205,254,0.04)', 'rgba(255,113,206,0.04)'];
    ga.addColorStop(0, cols[b]);
    ga.addColorStop(1, 'transparent');
    ctx.fillStyle = ga;
    ctx.fillRect(0, by - bh, W, bh * 2);
  }

  // VHS tracking error strips
  if (strips.length < stripsMax && Math.random() < 0.015) strips.push(makeStrip());
  for (let i = strips.length - 1; i >= 0; i--) {
    const s = strips[i];
    s.age++;
    s.y += s.speed;
    if (s.y > H || s.age > s.life) { strips.splice(i, 1); continue; }
    const progress = s.age / s.life;
    const fade = progress < 0.1
      ? progress / 0.1
      : progress > 0.8
        ? 1 - (progress - 0.8) / 0.2
        : 1;
    ctx.fillStyle = s.color.replace(')', `,${s.opacity * fade})`).replace('rgb', 'rgba');
    ctx.fillRect(s.dx * progress, s.y, W + Math.abs(s.dx), s.h);
  }

  // Occasional full-frame digital noise burst
  if (Math.random() < 0.004) {
    if (window.witchyAudio) window.witchyAudio.playGlitch();
    const numBlocks = Math.floor(Math.random() * 15) + 3;
    for (let n = 0; n < numBlocks; n++) {
      const nx = Math.random() * W;
      const ny = Math.random() * H;
      const nw = Math.random() * 80 + 10;
      const nh = Math.random() * 6 + 2;
      ctx.fillStyle = Math.random() > 0.5
        ? `rgba(1,205,254,${Math.random() * 0.3})`
        : `rgba(255,113,206,${Math.random() * 0.3})`;
      ctx.fillRect(nx, ny, nw, nh);
    }
  }

  noiseOffset++;
  requestAnimationFrame(drawVHS);
}

drawVHS();

/* ── CSS VHS STRIP FLICKER ── */

const vhsStrips = document.querySelectorAll('.vhs-strip');
setInterval(() => {
  if (Math.random() < 0.3) {
    if (window.witchyAudio) window.witchyAudio.playGlitch();
    vhsStrips.forEach(s => { s.style.display = 'block'; });
    setTimeout(
      () => vhsStrips.forEach(s => { s.style.display = 'none'; }),
      80 + Math.random() * 150
    );
  }
}, 2000);

/* ── AUDIO SYSTEM INTEGRATION ── */

const trayAudio = document.getElementById('tray-audio-toggle');
const trayAudioTaskbar = document.getElementById('tray-audio-toggle-taskbar');

function syncAudioIcons(active) {
  [trayAudio, trayAudioTaskbar].forEach(icon => {
    if (icon) {
      icon.style.opacity = active ? '1' : '0.35';
      icon.title = active ? 'Audio: Active (Click to Mute)' : 'Audio: Muted (Click to Unmute)';
    }
  });
}

if (window.witchyAudio) {
  syncAudioIcons(!window.witchyAudio.isMuted);
  window.witchyAudio.onStateChange = syncAudioIcons;

  const handleAudioToggle = (e) => {
    e.stopPropagation();
    const unmuted = window.witchyAudio.toggleMute();
    syncAudioIcons(unmuted);
    if (unmuted) {
      window.witchyAudio.playClick(1.5);
      window.witchyAudio.startAmbience('synth');
    }
  };

  if (trayAudio) trayAudio.addEventListener('click', handleAudioToggle);
  if (trayAudioTaskbar) trayAudioTaskbar.addEventListener('click', handleAudioToggle);
}

// Start vaporwave synth ambience on first interaction
const startAudioOnAction = () => {
  if (window.witchyAudio) {
    window.witchyAudio.startAmbience('synth');
  }
  window.removeEventListener('click', startAudioOnAction);
  window.removeEventListener('keydown', startAudioOnAction);
};
window.addEventListener('click', startAudioOnAction);
window.addEventListener('keydown', startAudioOnAction);

// Global UI clicks
document.addEventListener('click', (e) => {
  if (e.target.closest('button, .xp-menu-item, .xp-btn, .vp-btn, a, .vp-card, .xp-toolbar-btn, .xp-addressbar-input, .desktop-icon, .taskbar-item, .start-item')) {
    if (window.witchyAudio) window.witchyAudio.playClick();
  }
});

// Menubar "Synth" item feature
document.querySelectorAll('.xp-menu-item').forEach(item => {
  if (item.textContent.trim() === 'Synth') {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      if (window.witchyAudio) {
        window.witchyAudio.playItemHover(Math.floor(Math.random() * 6));
      }
    });
  }
});

/* ── LIVE CLOCK ── */

function updateClock() {
  const now = new Date();
  const t   = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const elTray   = document.getElementById('tray-time');
  const elTrayTb = document.getElementById('tray-time-taskbar');
  const elStatus = document.getElementById('clock-status');
  const elSys    = document.getElementById('sys-time');
  if (elTray)   elTray.textContent   = t;
  if (elTrayTb) elTrayTb.textContent = t;
  if (elStatus) elStatus.textContent = `UPTIME: ${t}`;
  if (elSys)    elSys.textContent    = `> SYS TIME: ${t}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ══════════════════════════════════════════════
   PHASE 3: INTERACTIVE WINDOWS & TASKBAR ENGINE
   ══════════════════════════════════════════════ */

let highestZIndex = 120;

function focusWindow(win) {
  if (!win) return;
  highestZIndex++;
  win.style.zIndex = highestZIndex;
  document.querySelectorAll('.xp-window').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  updateTaskbar();
}

function openWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  win.style.display = 'block';
  setTimeout(() => {
    win.style.opacity = '1';
    win.style.transform = 'none';
  }, 10);
  focusWindow(win);
  if (window.witchyAudio) window.witchyAudio.playClick(1.2);
}

window.openWindow = openWindow;
window.focusWindow = focusWindow;

// Window dragging engine
document.querySelectorAll('.xp-window').forEach(win => {
  const titlebar = win.querySelector('.xp-titlebar');
  if (!titlebar) return;

  // Focus on window click/tap
  win.addEventListener('mousedown', () => focusWindow(win));
  win.addEventListener('touchstart', () => focusWindow(win), { passive: true });

  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  const onDragStart = (e) => {
    if (e.target.closest('.xp-controls, .xp-btn, select, input, button')) return;
    if (win.classList.contains('maximized')) return;

    isDragging = true;
    focusWindow(win);

    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

    startX = clientX;
    startY = clientY;

    const rect = win.getBoundingClientRect();
    const style = window.getComputedStyle(win);
    if (style.position !== 'fixed' && style.position !== 'absolute') {
      win.style.position = 'fixed';
      win.style.width = rect.width + 'px';
      win.style.left = rect.left + 'px';
      win.style.top = rect.top + 'px';
      win.style.margin = '0';
    }

    initialLeft = parseFloat(win.style.left) || rect.left;
    initialTop = parseFloat(win.style.top) || rect.top;

    e.preventDefault();
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

    const dx = clientX - startX;
    const dy = clientY - startY;

    const newLeft = Math.max(-100, Math.min(window.innerWidth - 80, initialLeft + dx));
    const newTop = Math.max(0, Math.min(window.innerHeight - 60, initialTop + dy));

    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;
  };

  const onDragEnd = () => {
    isDragging = false;
  };

  titlebar.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  titlebar.addEventListener('touchstart', onDragStart, { passive: false });
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('touchend', onDragEnd);

  // Window control buttons
  const minBtn = win.querySelector('.xp-btn-min');
  if (minBtn) {
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      win.style.display = 'none';
      if (window.witchyAudio) window.witchyAudio.playClick(0.8);
      updateTaskbar();
    });
  }

  const maxBtn = win.querySelector('.xp-btn-max');
  if (maxBtn) {
    maxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (win.classList.contains('maximized')) {
        win.classList.remove('maximized');
        win.style.left = win.dataset.prevLeft || '';
        win.style.top = win.dataset.prevTop || '';
        win.style.width = win.dataset.prevWidth || '';
      } else {
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevWidth = win.style.width;
        win.classList.add('maximized');
      }
      if (window.witchyAudio) window.witchyAudio.playClick(1.2);
    });
  }

  const closeBtn = win.querySelector('.xp-btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      win.style.display = 'none';
      if (window.witchyAudio) window.witchyAudio.playClick(0.7);
      updateTaskbar();
    });
  }
});

// Taskbar synchronization
const taskbarTasks = document.getElementById('xp-taskbar-tasks');

function updateTaskbar() {
  if (!taskbarTasks) return;
  taskbarTasks.innerHTML = '';

  document.querySelectorAll('.xp-window[data-task-title]').forEach(win => {
    const isVisible = win.style.display !== 'none' && window.getComputedStyle(win).display !== 'none';
    const isActive = win.classList.contains('active') && isVisible;
    const title = win.dataset.taskTitle || 'Window';
    const icon = win.dataset.taskIcon || 'icons/briefcase.png';

    const item = document.createElement('div');
    item.className = `taskbar-item ${isActive ? 'active' : ''}`;
    item.innerHTML = `<img src="${icon}" alt=""><span>${title}</span>`;

    item.addEventListener('click', () => {
      if (!isVisible) {
        win.style.display = 'block';
        focusWindow(win);
      } else if (isActive) {
        win.style.display = 'none';
        updateTaskbar();
      } else {
        focusWindow(win);
      }
      if (window.witchyAudio) window.witchyAudio.playClick();
    });

    taskbarTasks.appendChild(item);
  });
}

updateTaskbar();

// Start menu handling
const startBtn = document.getElementById('xp-start-btn');
const startMenu = document.getElementById('xp-start-menu');

function toggleStartMenu(force) {
  if (!startMenu) return;
  const show = typeof force === 'boolean' ? force : startMenu.style.display === 'none';
  startMenu.style.display = show ? 'block' : 'none';
  if (show && window.witchyAudio) window.witchyAudio.playClick(1.4);
}
window.toggleStartMenu = toggleStartMenu;

if (startBtn) {
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });
}

document.addEventListener('click', (e) => {
  if (startMenu && startMenu.style.display !== 'none' && !e.target.closest('#xp-start-menu') && !e.target.closest('#xp-start-btn')) {
    toggleStartMenu(false);
  }
});

// Shutdown modal controls
function openShutdownModal() {
  const modal = document.getElementById('xp-shutdown-screen');
  const dialog = document.getElementById('shutdown-dialog');
  const blackout = document.getElementById('shutdown-blackout');
  if (modal) {
    modal.style.display = 'flex';
    if (dialog) dialog.style.display = 'block';
    if (blackout) blackout.style.display = 'none';
    if (window.witchyAudio) window.witchyAudio.playClick();
  }
}

function closeShutdownModal() {
  const modal = document.getElementById('xp-shutdown-screen');
  if (modal) modal.style.display = 'none';
  if (window.witchyAudio) window.witchyAudio.playClick(0.8);
}

function executeShutdown() {
  const choice = document.getElementById('shutdown-choice')?.value;
  const dialog = document.getElementById('shutdown-dialog');
  const blackout = document.getElementById('shutdown-blackout');
  const text = document.getElementById('shutdown-text');

  if (dialog) dialog.style.display = 'none';
  if (blackout) blackout.style.display = 'flex';

  if (window.witchyAudio) {
    window.witchyAudio.playGlitch();
    window.witchyAudio.stopAmbience();
  }

  if (text) {
    if (choice === 'ascend') {
      text.innerHTML = 'ASCENDING TO CLOUD DREAMSCAPE...<br><span style="font-size:1.4rem; color:var(--cyan);">> REALITY BUFFER FLUSHED</span>';
    } else if (choice === 'restart') {
      text.innerHTML = 'RESTARTING WITCHY XP...<br><span style="font-size:1.4rem; color:var(--cyan);">> RELOADING PARADISE.DLL</span>';
      setTimeout(() => window.location.reload(), 1800);
    } else {
      text.innerHTML = 'It is now safe to turn off your computer.<br><span style="font-size:1.2rem; color:rgba(255,113,206,0.6); margin-top:8px; display:block;">IT IS WATCHING</span>';
    }
  }
}

function rebootSystem() {
  const modal = document.getElementById('xp-shutdown-screen');
  if (modal) modal.style.display = 'none';
  if (window.witchyAudio) {
    window.witchyAudio.playGlitch();
    window.witchyAudio.startAmbience('synth');
  }
}

window.openShutdownModal = openShutdownModal;
window.closeShutdownModal = closeShutdownModal;
window.executeShutdown = executeShutdown;
window.rebootSystem = rebootSystem;

/* ── WINDOW LOAD TRANSITIONS ── */

document.querySelectorAll('.xp-window').forEach((w, i) => {
  w.style.opacity   = '0';
  w.style.transform = 'translateY(16px)';
  w.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  setTimeout(() => {
    w.style.opacity   = '1';
    w.style.transform = 'none';
  }, 200 + i * 180);
});
