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

  // --- 阶段 1: 打印静态开场行 ---
  if (phase === "static") {
    const current = staticTerminalLines[staticIndex];

    if (!staticLineEls[staticIndex]) {
      const line = document.createElement("div");
      const prefixSpan = document.createElement("span");
      prefixSpan.className = "terminal-prefix";
      prefixSpan.textContent = PROMPT_PREFIX;

      const textSpan = document.createElement("span");
      // 初始时不加 with-cursor，由下面的逻辑统一控制
      textSpan.className = ""; 

      line.appendChild(prefixSpan);
      line.appendChild(textSpan);
      linesEl.appendChild(line);
      staticLineEls[staticIndex] = { line, textSpan };
    }

    // 确保只有当前正在打字的行有光标
    staticLineEls.forEach((item, index) => {
      if (item && item.textSpan) {
        if (index === staticIndex) {
          item.textSpan.classList.add("with-cursor");
        } else {
          item.textSpan.classList.remove("with-cursor");
        }
      }
    });

    if (charIndex === 0 && !prefixPauseDone) {
      prefixPauseDone = true;
      setTimeout(runTerminal, 320);
      return;
    }

    const { textSpan } = staticLineEls[staticIndex];
    textSpan.textContent = current.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex === current.length) {
      // 这一行打完了，立刻移除当前行的光标，防止两行光标并存
      textSpan.classList.remove("with-cursor");
      
      staticIndex += 1;
      charIndex = 0;
      prefixPauseDone = false;

      const isLastStatic = staticIndex >= staticTerminalLines.length;

      setTimeout(() => {
        if (isLastStatic) {
          phase = "rolePrefix";
          if (promptEl) promptEl.style.display = "block";
          if (promptRolePrefixEl) promptRolePrefixEl.textContent = "";
        }
        runTerminal();
      }, 600);
      return;
    }

    const speed = 140 + Math.random() * 60;
    setTimeout(runTerminal, speed);
    return;
  }

  // --- 阶段 2: 打印 "I'm a..." 前缀 (带打字机效果) ---
  if (phase === "rolePrefix") {
    const current = ROLE_STATIC_PREFIX;

    if (charIndex === 0 && !prefixPauseDone) {
      prefixPauseDone = true;
      if (promptPrefixEl) promptPrefixEl.textContent = PROMPT_PREFIX;
      setTimeout(runTerminal, 200);
      return;
    }

    if (promptRolePrefixEl) {
      promptRolePrefixEl.classList.add("with-cursor");
      promptRolePrefixEl.textContent = current.slice(0, charIndex + 1);
    }

    charIndex++;

    if (charIndex === current.length) {
      setTimeout(() => {
        // 前缀打完，光标交给下一个元素
        if (promptRolePrefixEl) promptRolePrefixEl.classList.remove("with-cursor");
        phase = "roles";
        charIndex = 0;
        prefixPauseDone = false;
        runTerminal();
      }, 400);
      return;
    }

    setTimeout(runTerminal, 80 + Math.random() * 40);
    return;
  }

  // --- 阶段 3: 循环角色标签 ---
  const currentRole = roleLabels[roleIndex];

  if (!deleting) {
    if (charIndex === 0 && !prefixPauseDone) {
      prefixPauseDone = true;
      setTimeout(runTerminal, 320);
      return;
    }
    // 激活最终循环处的光标
    if (typed) typed.classList.add("with-cursor");
    typed.textContent = currentRole.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentRole.length) {
      deleting = true;
      setTimeout(runTerminal, 2000);
      return;
    }
  } else {
    const nextLength = Math.max(charIndex - 1, 0);
    typed.textContent = currentRole.slice(0, nextLength);
    charIndex = nextLength;

    if (charIndex === 0) {
      deleting = false;
      prefixPauseDone = false;
      roleIndex = (roleIndex + 1) % roleLabels.length;
    }
  }

  const speed = deleting ? 60 : 120;
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
