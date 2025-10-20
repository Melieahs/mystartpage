// index.js - 修正版（包含 bingSubmit 点击处理）
(function(){
  function createShortcutElement(item){
    const a = document.createElement('a');
    a.className = 'shortcut-card';
    a.href = item.url;
    a.target = '_blank';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'icon';
    if(item.icon){
      const img = document.createElement('img');
      img.src = item.icon;
      img.alt = item.name || '';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '8px';
      img.onerror = function(){ this.style.display = 'none'; iconWrap.textContent = item.name ? item.name[0] : '🔗'; };
      iconWrap.appendChild(img);
    } else {
      iconWrap.textContent = item.name ? item.name[0].toUpperCase() : '🔗';
    }

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = item.name || item.url;

    a.appendChild(iconWrap);
    a.appendChild(label);
    return a;
  }

  function renderShortcuts(data){
    const container = document.getElementById('shortcutContainer');
    container.innerHTML = '';
    (data || []).forEach(item=>{
      const el = createShortcutElement(item);
      container.appendChild(el);
    });
  }

  function init(){
    if (typeof loadTheme === 'function') loadTheme();
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.addEventListener('click', ()=> toggleTheme());

    // 文件输入由加号按钮触发；文件输入本身保持隐藏
    const shortcutsFile = document.getElementById('shortcutsFile');
    const openBtn = document.getElementById('openShortcutsFile');
    if (openBtn && shortcutsFile) openBtn.addEventListener('click', ()=>shortcutsFile.click());
    if (shortcutsFile) {
      shortcutsFile.addEventListener('change', function(e){
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = function(evt){
          const raw = evt.target.result;
          const arr = window.tryParseJSON ? tryParseJSON(raw, null) : null;
          if (!Array.isArray(arr)) {
            alert('导入失败：请提供 JSON 数组，例如 [{ "name":"X", "url":"https://...", "icon":"path/to/icon.png" }]');
            return;
          }
          localStorage.setItem('shortcuts', JSON.stringify(arr));
          renderShortcuts(arr);
        };
        r.readAsText(f, 'utf-8');
        e.target.value = '';
      });
    }

    // 加载并渲染已保存的快捷方式
    const saved = window.tryParseJSON ? tryParseJSON(localStorage.getItem('shortcuts'), []) : [];
    renderShortcuts(saved);

    // 搜索表单：回车触发 Bing（默认提交）
    const form = document.getElementById('searchForm');
    const input = document.getElementById('searchInput');
    if (form && input) {
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const q = input.value.trim();
        if (q) {
          // 回车或提交（Bing）
          window.location.href = 'https://www.bing.com/search?q=' + encodeURIComponent(q);
        }
      });
    }

    // Bing 按钮点击处理（修复点）
    const bingBtn = document.getElementById('bingSubmit');
    if (bingBtn && input) {
      bingBtn.addEventListener('click', function(){
        const q = input.value.trim();
        if (q) {
          window.location.href = 'https://www.bing.com/search?q=' + encodeURIComponent(q);
        } else {
          // 若为空，也跳转到 Bing 首页
          window.location.href = 'https://www.bing.com/';
        }
      });
    }

    // Copilot 按钮：询问 Copilot（点击）
    const copilotBtn = document.getElementById('copilotBtn');
    if (copilotBtn && input) {
      copilotBtn.addEventListener('click', function(){
        const q = input.value.trim();
        if (q) {
          window.location.href = 'https://copilot.microsoft.com/?q=' + encodeURIComponent(q);
        } else {
          window.location.href = 'https://copilot.microsoft.com/';
        }
      });
    }

    // luckyBtn fallback (if you still have a "手气不错" button)
    const luckyBtn = document.getElementById('luckyBtn');
    if (luckyBtn){
      luckyBtn.addEventListener('click', ()=>{
        window.open('https://www.bing.com/search?q=' + encodeURIComponent('随机'), '_blank');
      });
    }

    // logo fallback
    const img = document.getElementById('logoImg');
    if (img) img.addEventListener('error', ()=>{ /* silent fallback */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
