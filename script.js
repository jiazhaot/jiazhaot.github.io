const PROMPT_PREFIX = "MacBook-Pro:~ patrickteng$ ";

const staticTerminalLines = [
  "Hi, I'm Patrick",
  "I'm coding, creating, and teaching."
];

const roleLines = [
  "I'm a...Programmer 💻",
  "I'm a...UX Designer 🎨",
  "I'm a...Early Childhood Teacher 🎓",
  "I'm a...Frisbee Enthusiast 🥏"
];

const THEME_KEY = "theme"; // "light" | "dark"
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

const promptPrefixEl = document.getElementById("prompt-prefix");
const typed = document.getElementById("typed");
const cursor = document.querySelector(".cursor");
const linesEl = document.getElementById("terminal-lines");

if (promptPrefixEl) {
  promptPrefixEl.textContent = PROMPT_PREFIX;
}

let phase = "static"; // "static" | "roles"
let staticIndex = 0;
let roleIndex = 0;
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

function runTerminal() {
  if (!typed) return;

  // First phase: type and "commit" two static lines that stay in history.
  if (phase === "static") {
    const current = staticTerminalLines[staticIndex];
    typed.textContent = current.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex === current.length) {
      // Push the fully typed static line into the history area.
      if (linesEl) {
        const line = document.createElement("div");
        const prefixSpan = document.createElement("span");
        prefixSpan.className = "terminal-prefix";
        prefixSpan.textContent = PROMPT_PREFIX;

        const textSpan = document.createElement("span");
        textSpan.textContent = current;

        line.appendChild(prefixSpan);
        line.appendChild(textSpan);
        linesEl.appendChild(line);
        linesEl.scrollTop = linesEl.scrollHeight;
      }

      staticIndex += 1;
      charIndex = 0;

      const isLastStatic = staticIndex >= staticTerminalLines.length;

      // Small pause, then either move to next static line or start roles loop.
      setTimeout(() => {
        typed.textContent = "";
        if (isLastStatic) {
          phase = "roles";
        }
        runTerminal();
      }, 600);
      return;
    }

    const speed = 80 + Math.random() * 40;
    setTimeout(runTerminal, speed);
    return;
  }

  // Second phase: loop through role lines, only updating the suffix part.
  const current = roleLines[roleIndex];

  if (!deleting) {
    typed.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(runTerminal, 1200);
      return;
    }
  } else {
    const nextLength = Math.max(charIndex - 1, 0);
    typed.textContent = current.slice(0, nextLength);
    charIndex = nextLength;

    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roleLines.length;
    }
  }

  const speed = deleting ? 40 : 80;
  setTimeout(runTerminal, speed + Math.random() * 40);
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
  runTerminal();
  renderProjects();
  if (window.lucide) window.lucide.createIcons();
});
