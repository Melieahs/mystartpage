// main.js - 公共工具与主题管理（MV3 兼容）
(function() {
  function applyTheme(theme) {
    if (theme === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }

  function detectSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function loadTheme() {
    const saved = localStorage.getItem('theme');
    function _apply() {
      applyTheme(saved || detectSystemTheme());
    }
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', _apply, { once: true });
    } else {
      _apply();
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    return isDark;
  }

  function tryParseJSON(s, fallback) {
    try { return JSON.parse(s); } catch (e) { return fallback; }
  }

  window.applyTheme = applyTheme;
  window.detectSystemTheme = detectSystemTheme;
  window.loadTheme = loadTheme;
  window.toggleTheme = toggleTheme;
  window.tryParseJSON = tryParseJSON;

  loadTheme();
})();

