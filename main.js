/* ── Year ─────────────────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

const projectsGridEl = document.getElementById('projects-grid');
const projectsStatusEl = document.getElementById('projects-status');

/* ── Typewriter ────────────────────────────────────────────────── */
const phrases = window.TYPEWRITER_PHRASES || [];
let pi = 0, ci = 0, deleting = false;
const el = document.getElementById('typewriter');
function type() {
  const phrase = phrases[pi];
  if (!deleting) {
    el.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { deleting = true; setTimeout(type, 1800); return; }
  } else {
    el.textContent = phrase.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 45 : 90);
}
type();

function createExternalLinkIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '13');
  svg.setAttribute('height', '13');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.5');

  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3');
  svg.appendChild(path);
  return svg;
}

function renderProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';

  const icon = document.createElement('div');
  icon.className = 'card-icon';
  icon.textContent = project.icon || '🚀';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = project.title || 'Untitled Project';

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = project.description || '';

  const tags = document.createElement('div');
  tags.className = 'card-tags';
  (Array.isArray(project.tags) ? project.tags : []).forEach((tagText) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = tagText;
    tags.appendChild(tag);
  });

  const link = document.createElement('a');
  link.className = 'card-link';
  link.href = project.url || '#';
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = project.linkText || 'Open Link';
  link.appendChild(createExternalLinkIcon());

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(tags);
  card.appendChild(link);
  return card;
}

function observeProjectCards() {
  const cards = document.querySelectorAll('.project-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach((card) => observer.observe(card));
}

function loadProjects() {
  if (!projectsGridEl || !projectsStatusEl) {
    return;
  }

  try {
    const projects = window.PROJECTS;
    if (!Array.isArray(projects)) {
      throw new Error('projects.js must define window.PROJECTS as an array');
    }

    projectsGridEl.innerHTML = '';
    projects.forEach((project) => {
      projectsGridEl.appendChild(renderProjectCard(project));
    });

    projectsStatusEl.style.display = projects.length ? 'none' : 'block';
    projectsStatusEl.textContent = projects.length ? '' : 'No projects found.';

    observeProjectCards();
  } catch (error) {
    console.error(error);
    projectsStatusEl.style.display = 'block';
    projectsStatusEl.textContent = 'Could not load projects right now. Please check projects.js format.';
  }
}

loadProjects();

/* ── Particle canvas ──────────────────────────────────────────── */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const COUNT = Math.min(80, Math.floor((W * H) / 16000));
for (let i = 0; i < COUNT; i++) {
  particles.push({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.4 + 0.3,
    dx: (Math.random() - 0.5) * 0.35,
    dy: (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.5 + 0.15,
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(108,143,255,${p.alpha})`;
    ctx.fill();
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(108,143,255,${0.07 * (1 - dist/120)})`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ── Nav scroll tint ──────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const styles = getComputedStyle(document.documentElement);
  const navBg = styles.getPropertyValue('--nav-bg').trim() || 'rgba(10,13,20,0.6)';
  const navBgScrolled = styles.getPropertyValue('--nav-bg-scrolled').trim() || 'rgba(10,13,20,0.92)';
  document.querySelector('nav').style.background = window.scrollY > 30 ? navBgScrolled : navBg;
}, { passive: true });
