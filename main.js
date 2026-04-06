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
    vhsStrips.forEach(s => { s.style.display = 'block'; });
    setTimeout(
      () => vhsStrips.forEach(s => { s.style.display = 'none'; }),
      80 + Math.random() * 150
    );
  }
}, 2000);

/* ── LIVE CLOCK ── */

function updateClock() {
  const now = new Date();
  const t   = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const elTray   = document.getElementById('tray-time');
  const elStatus = document.getElementById('clock-status');
  const elSys    = document.getElementById('sys-time');
  if (elTray)   elTray.textContent   = t;
  if (elStatus) elStatus.textContent = `UPTIME: ${t}`;
  if (elSys)    elSys.textContent    = `> SYS TIME: ${t}`;
}
updateClock();
setInterval(updateClock, 1000);

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
