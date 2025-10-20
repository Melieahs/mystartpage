// index.js
(function(){
  function createShortcutElement(item){
    const a = document.createElement('a');
    a.className = 'shortcut-card';
    a.href = item.url;
    a.target = '_blank';
    // icon element: if item.icon present use <img>, else show first letter or generic glyph
    const iconWrap = document.createElement('div');
    iconWrap.className = 'icon';
    if(item.icon) {
      const img = document.createElement('img');
      img.src = item.icon;
      img.alt = item.name || '';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '8px';
      img.onerror = function(){ this.style.display = 'none'; iconWrap.textContent = item.name ? item.name[0] : '🔗'; };
      iconWrap.appendChild(img);
    } else {
      // fallback glyph or initial
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
    if (themeBtn) themeBtn.addEventListener('click', function(){ if (typeof toggleTheme === 'function') toggleTheme(); });

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

    // load and render saved shortcuts
    const saved = window.tryParseJSON ? tryParseJSON(localStorage.getItem('shortcuts'), []) : [];
    renderShortcuts(saved);

    // lucky button
    const luckyBtn = document.getElementById('luckyBtn');
    if (luckyBtn){
      luckyBtn.addEventListener('click', ()=>{
        window.open('https://www.bing.com/search?q=' + encodeURIComponent('随机'), '_blank');
      });
    }

    // logo error silent fallback
    const img = document.getElementById('logoImg');
    if (img) img.addEventListener('error', ()=>{ /* silent fallback */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
