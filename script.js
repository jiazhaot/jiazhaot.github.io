const PROMPT_PREFIX = "MacBook-Pro:~ patrickteng$ ";
const ROLE_STATIC_PREFIX = "I'm a...";

const staticTerminalLines = [
  "Hi, I'm Patrick",
  "I'm coding, creating, and teaching."
];

const roleLabels = [
  " Programmer 💻",
  " UX Designer 🎨",
  " Early Childhood Teacher 🎓",
  " Frisbee Enthusiast 🥏"
];

const THEME_KEY = "theme"; // "light" | "dark"
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

const promptPrefixEl = document.getElementById("prompt-prefix");
const promptRolePrefixEl = document.getElementById("prompt-role-prefix");
const typed = document.getElementById("typed");
const promptEl = document.querySelector(".prompt");
const linesEl = document.getElementById("terminal-lines");
const terminalTimeEl = document.getElementById("terminal-time");

// During the static intro phase, 隐藏第三行的前缀，且不显示光标；
// 只有开始轮播身份标签时才一起出现，避免前两行打字阶段出现“多余光标”的视觉 bug。
if (promptPrefixEl) promptPrefixEl.textContent = "";
if (promptEl) promptEl.style.display = "none";

if (promptRolePrefixEl) {
  // During the static intro phase, we don't show "I'm a..."
  promptRolePrefixEl.textContent = "";
}

let phase = "static"; // "static" | "roles"
let staticIndex = 0;
let roleIndex = 0;
let charIndex = 0;
let deleting = false;
let prefixPauseDone = false;
const staticLineEls = []; // cache for the two static line elements

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
  if (!typed || !linesEl) return;

  // First phase: type and "commit" two static lines that stay in history.
  if (phase === "static") {
    const current = staticTerminalLines[staticIndex];

    // Ensure a fixed DOM element exists for this static line
    if (!staticLineEls[staticIndex]) {
      const line = document.createElement("div");
      const prefixSpan = document.createElement("span");
      prefixSpan.className = "terminal-prefix";
      prefixSpan.textContent = PROMPT_PREFIX;

      const textSpan = document.createElement("span");
      textSpan.className = "with-cursor";

      line.appendChild(prefixSpan);
      line.appendChild(textSpan);
      linesEl.appendChild(line);
      staticLineEls[staticIndex] = { line, textSpan };
    }

    if (charIndex === 0 && !prefixPauseDone) {
      prefixPauseDone = true;
      setTimeout(runTerminal, 320);
      return;
    }

    staticLineEls.forEach((item, index) => {
      if (!item) return;
      if (index === staticIndex) {
        item.textSpan.classList.add("with-cursor");
      } else {
        item.textSpan.classList.remove("with-cursor");
      }
    });

    const { textSpan } = staticLineEls[staticIndex];
    textSpan.textContent = current.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex === current.length) {
      staticIndex += 1;
      charIndex = 0;
      prefixPauseDone = false;

      const isLastStatic = staticIndex >= staticTerminalLines.length;

      // Small pause, then either move to next static line or start roles loop.
      setTimeout(() => {
        if (isLastStatic) {
          // After the two intro lines, show "I'm a..." before looping roles.
          if (promptRolePrefixEl) {
            promptRolePrefixEl.textContent = ROLE_STATIC_PREFIX;
          }
          if (promptPrefixEl) promptPrefixEl.textContent = PROMPT_PREFIX;
          if (promptEl) promptEl.style.display = "block";
          staticLineEls.forEach((item) => {
            if (item?.textSpan) item.textSpan.classList.remove("with-cursor");
          });
          phase = "roles";
        }
        runTerminal();
      }, 600);
      return;
    }

    // Slow typing for the two intro lines as well.
    const speed = 140 + Math.random() * 60;
    setTimeout(runTerminal, speed);
    return;
  }

  // Second phase: loop through role labels, only updating the label part.
  const current = roleLabels[roleIndex];

  if (!deleting) {
    if (charIndex === 0 && !prefixPauseDone) {
      prefixPauseDone = true;
      setTimeout(runTerminal, 320);
      return;
    }
    if (typed) typed.classList.add("with-cursor");
    typed.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      deleting = true;
      // Longer pause to let each label stay visible.
      setTimeout(runTerminal, 2000);
      return;
    }
  } else {
    const nextLength = Math.max(charIndex - 1, 0);
    typed.textContent = current.slice(0, nextLength);
    charIndex = nextLength;

    if (charIndex === 0) {
      deleting = false;
      prefixPauseDone = false;
      roleIndex = (roleIndex + 1) % roleLabels.length;
    }
  }

  // Slow down typing & deleting for clearer effect.
  const speed = deleting ? 90 : 140;
  setTimeout(runTerminal, speed + Math.random() * 40);
}

function formatTerminalTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `[${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}]`;
}

function startTerminalClock() {
  if (!terminalTimeEl) return;
  const update = () => {
    terminalTimeEl.textContent = formatTerminalTime(new Date());
  };
  update();
  setInterval(update, 1000);
}

const GITHUB_USER = "jiazhaot";
const GITHUB_PER_PAGE = 100;

const fallbackProjects = [
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

async function fetchGitHubRepos() {
  const headers = { "Accept": "application/vnd.github+json" };
  let page = 1;
  let all = [];

  while (true) {
    const url = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=${GITHUB_PER_PAGE}&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("github_fetch_failed");
    const data = await res.json();
    all = all.concat(data);
    if (data.length < GITHUB_PER_PAGE) break;
    page += 1;
  }

  return all
    .filter((repo) => !repo.fork)
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .map((repo) => ({
      name: repo.name,
      description: repo.description || "No description provided.",
      tech: repo.topics?.length ? repo.topics.slice(0, 4) : [],
      stars: repo.stargazers_count ?? 0,
      language: repo.language || "Other",
      repo: repo.html_url,
      demo: repo.homepage || repo.html_url
    }));
}

async function renderProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  grid.innerHTML = "";

  let projects = fallbackProjects;
  try {
    const fromGitHub = await fetchGitHubRepos();
    if (fromGitHub.length) projects = fromGitHub;
  } catch (error) {
    projects = fallbackProjects;
  }

  projects.forEach((p) => {
    const el = document.createElement("article");
    el.className = "project-card";
    el.innerHTML = `
      <div class="row">
        <strong>${p.name}</strong>
        <span class="tag">${p.language}</span>
      </div>
      <p class="muted">${p.description}</p>
      ${p.tech.length ? `<div class="tags">${p.tech.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
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
  startTerminalClock();
  runTerminal();
  renderProjects();
  if (window.lucide) window.lucide.createIcons();
});
