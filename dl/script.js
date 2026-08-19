/* ============================================================
   深度学习指南 —— 交互脚本
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. 数学公式渲染 (KaTeX) ---------- */
  function renderMath() {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false }
          ],
          throwOnError: false,
          strict: false
        });
      } catch (e) {
        console.warn("KaTeX 渲染失败：", e);
      }
    }
  }

  /* ---------- 2. 主题切换 ---------- */
  const themeBtn = document.getElementById("themeBtn");
  const html = document.documentElement;

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    if (themeBtn) themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
    try { localStorage.setItem("dl-theme", theme); } catch (e) {}
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("dl-theme"); } catch (e) {}
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ---------- 3. 移动端侧边栏 ---------- */
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");
  const overlay = document.getElementById("overlay");

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("show");
    });
  }
  if (overlay) overlay.addEventListener("click", closeSidebar);
  // 点击导航链接后关闭移动端侧边栏
  document.querySelectorAll(".sidebar-nav .nav-link").forEach(function (link) {
    link.addEventListener("click", closeSidebar);
  });

  /* ---------- 4. 面试题卡折叠 ---------- */
  document.querySelectorAll(".qa").forEach(function (qa) {
    const head = qa.querySelector(".qa-head");
    if (!head) return;
    head.addEventListener("click", function () {
      qa.classList.toggle("open");
    });
  });

  /* ---------- 5. 滚动监听：阅读进度 + 章节高亮 + 回到顶部 ---------- */
  const progress = document.getElementById("readProgress");
  const toTop = document.getElementById("toTop");
  const navLinks = Array.from(document.querySelectorAll(".sidebar-nav .nav-link"));
  const topbarTitle = document.getElementById("topbarTitle");
  const sections = navLinks
    .map(function (link) {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return null;
      const el = document.querySelector(id);
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  const defaultTitle = topbarTitle ? topbarTitle.textContent : "";

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // 阅读进度
    if (progress && docHeight > 0) {
      progress.style.width = Math.min(100, (scrollTop / docHeight) * 100) + "%";
    }

    // 回到顶部按钮
    if (toTop) toTop.classList.toggle("show", scrollTop > 500);

    // 章节高亮
    let current = null;
    const offset = 120;
    for (const s of sections) {
      if (s.el.offsetTop - offset <= scrollTop) {
        current = s;
      }
    }
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    if (current) {
      current.link.classList.add("active");
      if (topbarTitle) topbarTitle.textContent = current.link.textContent.trim();
    } else if (topbarTitle) {
      topbarTitle.textContent = defaultTitle;
    }
  }

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 6. 键盘快捷键 ---------- */
  // 按 "/" 聚焦搜索？本版无搜索框，改为展开/收起全部面试题
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const allQa = document.querySelectorAll(".qa");
      const anyClosed = Array.from(allQa).some(function (q) { return !q.classList.contains("open"); });
      allQa.forEach(function (q) {
        if (anyClosed) q.classList.add("open");
        else q.classList.remove("open");
      });
    }
  });

  /* ---------- 6.5 代码高亮 (highlight.js) ---------- */
  function highlightCode() {
    if (window.hljs) {
      document.querySelectorAll("pre code").forEach(function (block) {
        try { hljs.highlightElement(block); } catch (e) {}
      });
    }
  }

  /* ---------- 启动 ---------- */
  initTheme();
  renderMath();
  highlightCode();
})();
