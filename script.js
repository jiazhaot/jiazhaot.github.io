const terminalLines = [
  "npm run dev -- --turbo",
  "next build && next start",
  "fetching github stats...",
  "deploying to vercel...",
  "done in 1.23s"
];

const THEME_KEY = "theme"; // "light" | "dark"
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

const typed = document.getElementById("typed");
const cursor = document.querySelector(".cursor");
const linesEl = document.getElementById("terminal-lines");

let lineIndex = 0;
let charIndex = 0;
let deleting = false;

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  updateThemeToggle(theme);
}

function updateThemeToggle(theme) {
  if (!themeIcon || !themeLabel) return;
  const nextTheme = theme === "dark" ? "light" : "dark";
  themeLabel.textContent = nextTheme === "light" ? "Light" : "Dark";
  themeIcon.setAttribute("data-lucide", nextTheme === "light" ? "sun" : "moon");
  if (window.lucide) window.lucide.createIcons();
}

function initTheme() {
  const theme = getPreferredTheme();
  setTheme(theme);

  // If user never chose manually, keep following system changes.
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (mq && !localStorage.getItem(THEME_KEY)) {
    mq.addEventListener("change", () => setTheme(getPreferredTheme()));
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      setTheme(next);
    });
  }
}

function typeLoop() {
  const current = terminalLines[lineIndex];
  if (!deleting) {
    typed.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
      if (linesEl) {
        const line = document.createElement("div");
        line.textContent = `$ ${current}`;
        linesEl.appendChild(line);
        linesEl.scrollTop = linesEl.scrollHeight;
      }
      return;
    }
  } else {
    typed.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      lineIndex = (lineIndex + 1) % terminalLines.length;
    }
  }
  const speed = deleting ? 35 : 80;
  setTimeout(typeLoop, speed + Math.random() * 40);
}

const projects = [
  {
    name: "Terminalfolio",
    description: "Minimal terminal-inspired portfolio template with dark mode.",
    tech: ["Next.js", "Tailwind", "Framer Motion"],
    stars: 128,
    language: "TypeScript",
    repo: "https://github.com/example/terminalfolio",
    demo: "#"
  },
  {
    name: "OSS Automator",
    description: "GitHub Actions toolkit for linting, tests, and release tagging.",
    tech: ["Node.js", "GitHub API"],
    stars: 256,
    language: "JavaScript",
    repo: "https://github.com/example/oss-automator",
    demo: "#"
  },
  {
    name: "Photon Gallery",
    description: "Responsive masonry photo grid with lazy loading.",
    tech: ["React", "CSS Grid"],
    stars: 96,
    language: "TypeScript",
    repo: "https://github.com/example/photon-gallery",
    demo: "#"
  }
];

function renderProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  grid.innerHTML = "";

  projects.forEach((p) => {
    const el = document.createElement("article");
    el.className = "project-card";
    el.innerHTML = `
      <div class="row">
        <strong>${p.name}</strong>
        <span class="tag">${p.language}</span>
      </div>
      <p class="muted">${p.description}</p>
      <div class="tags">
        ${p.tech.map((t) => `<span class="tag">${t}</span>`).join("")}
      </div>
      <div class="project-meta">
        <span>★ ${p.stars}</span>
      </div>
      <div class="links">
        <a class="link" href="${p.repo}" target="_blank" rel="noreferrer">Repo</a>
        <a class="link" href="${p.demo}" target="_blank" rel="noreferrer">Demo</a>
      </div>
    `;
    grid.appendChild(el);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  typeLoop();
  renderProjects();
  if (window.lucide) window.lucide.createIcons();
});
