// bookmarks.js - 修正版（支持即时搜索过滤、稳健渲染）
(function(){
  let bookmarks = [];
  const STORAGE_KEY = 'flatBookmarks_v1';

  function loadSaved(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { bookmarks = JSON.parse(raw); } catch(e){ bookmarks = []; }
    } else {
      bookmarks = [];
    }
  }

  function saveAndRender(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    renderList();
  }

  function ordered(list){
    return (list || bookmarks).slice().sort((a,b)=> (b.pinned?1:0) - (a.pinned?1:0));
  }

  function createCardElement(bm, idx){
    const a = document.createElement('a');
    a.className = 'card';
    a.href = bm.url;
    a.target = '_blank';
    a.draggable = true;
    a.dataset.i = idx;
    a.dataset.name = (bm.name||'').toLowerCase();

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = bm.name || bm.url;

    const pin = document.createElement('span');
    pin.className = 'pin';
    pin.title = '固定/取消固定';
    pin.textContent = bm.pinned ? '📌' : '📍';

    a.appendChild(title);
    a.appendChild(pin);

    a.addEventListener('dragstart', onDragStart);
    a.addEventListener('dragend', onDragEnd);
    a.addEventListener('dragover', e=>e.preventDefault());
    a.addEventListener('drop', onDrop);

    pin.addEventListener('click', function(ev){ ev.preventDefault(); ev.stopPropagation(); togglePin(bm); });

    return a;
  }

  function renderList(filter){
    const container = document.getElementById('list');
    if(!container) return;
    container.innerHTML = '';

    const kw = (filter || '').trim().toLowerCase();

    if (!bookmarks.length){
      container.innerHTML = '<div class="empty">暂无书签。点击导入 Edge/Chrome 导出的 HTML 文件。</div>';
      return;
    }

    const ord = ordered();
    const visible = ord.filter(bm=>{
      if(!kw) return true;
      const name = (bm.name||'').toLowerCase();
      const url = (bm.url||'').toLowerCase();
      return name.includes(kw) || url.includes(kw);
    });

    if(!visible.length){
      container.innerHTML = '<div class="empty">未匹配到任何书签。</div>';
      return;
    }

    visible.forEach((bm, idx)=>{
      const el = createCardElement(bm, idx);
      container.appendChild(el);
    });

    // ensure container-level drag handlers present
    container.addEventListener('dragover', e=>e.preventDefault());
    container.addEventListener('drop', onDropToList);
  }

  // import HTML bookmarks (flat)
  function importFromFile(file){
    if(!file) return;
    const r = new FileReader();
    r.onload = function(evt){
      const html = evt.target.result;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const links = Array.from(doc.querySelectorAll('a[href]'));
      const seen = new Set(bookmarks.map(b=>b.url));
      links.forEach(a=>{
        const url = a.href || a.getAttribute('href') || '';
        const name = (a.textContent || url).trim();
        if (url && !seen.has(url)) {
          bookmarks.push({ name, url, pinned: false });
          seen.add(url);
        }
      });
      saveAndRender();
    };
    r.readAsText(file, 'utf-8');
  }

  // drag/drop helpers
  function onDragStart(e){
    e.currentTarget.classList.add('dragging');
    const idx = parseInt(e.currentTarget.dataset.i,10);
    e.dataTransfer.setData('application/json', JSON.stringify({ fromIndex: idx }));
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragEnd(e){ e.currentTarget.classList.remove('dragging'); }
  function onDrop(e){
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json'); if(!data) return;
    const { fromIndex } = JSON.parse(data);
    const toIndex = parseInt(e.currentTarget.dataset.i,10);
    moveBookmark(fromIndex, toIndex);
  }
  function onDropToList(e){
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json'); if(!data) return;
    const { fromIndex } = JSON.parse(data);
    moveBookmark(fromIndex, bookmarks.length);
  }
  function moveBookmark(fromVisibleIndex, toVisibleIndex){
    const ord = ordered();
    const item = ord[fromVisibleIndex];
    if(!item) return;
    const storedIdx = bookmarks.indexOf(item);
    if(storedIdx !== -1) bookmarks.splice(storedIdx,1);
    if(toVisibleIndex >= ord.length) bookmarks.push(item);
    else {
      const toItem = ord[toVisibleIndex];
      const insertAt = bookmarks.indexOf(toItem);
      if(insertAt === -1) bookmarks.push(item); else bookmarks.splice(insertAt,0,item);
    }
    saveAndRender();
  }

  function togglePin(item){
    item.pinned = !item.pinned;
    saveAndRender();
  }

  // wire UI
  function init(){
    if (typeof loadTheme === 'function') loadTheme();
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.addEventListener('click', function(){ if (typeof toggleTheme === 'function') toggleTheme(); });

    const fileInput = document.getElementById('fileInput');
    const importBtn = document.getElementById('importBtn');
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('search');

    // load data before wiring search so initial render contains cards
    loadSaved();
    renderList();

    if (importBtn && fileInput) importBtn.addEventListener('click', ()=>fileInput.click());
    if (fileInput) fileInput.addEventListener('change', function(e){ const f = e.target.files && e.target.files[0]; if(f) importFromFile(f); e.target.value = ''; });

    if (clearBtn) clearBtn.addEventListener('click', function(){ if(confirm('确认清除本地保存的书签？')) { localStorage.removeItem(STORAGE_KEY); bookmarks = []; renderList(); } });

    if (searchInput) searchInput.addEventListener('input', function(){
      const kw = (searchInput.value || '').trim().toLowerCase();
      renderList(kw);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
