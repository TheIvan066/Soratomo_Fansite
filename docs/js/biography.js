(function () {
  const jsonPath = '../data/biography.json';

  const translations = {
    en: {
      title: "Biography Directory",
      searchPlaceholder: "Search events, tags, dates (EN/JA/ZH)...",
      allTags: "All Tags",
      newest: "Newest First",
      oldest: "Oldest First",
      timelineView: "Timeline",
      gridView: "Grid",
      noEvents: "No matching events found.",
      sources: "Sources:",
      watchOnYouTube: "Watch on YouTube",
      smode_any: "Match Any",
      smode_all: "Match All",
      smode_exclude: "Exclude Selected",
      mode: "Filter Mode",
      events: "Event",
      tagsLabel: "Tags",
      fromDate: "From:",
      toDate: "To:",
      clearDates: "Clear Dates",
      tags: {
        "fansite": "Fan Site",
        "board_game": "Board Game",
        "mapping": "GIS Mapping",
        "development": "Development",
        "music": "Music",
        "literature": "Literature",
        "release": "Release",
        "project": "Project",
        "milestone": "Milestone",
        "database": "Database",
        "python": "Python",
        "qgis": "QGIS",
        "mahjong": "Mahjong"
      }
    },
    ja: {
      title: "バイオグラフィディレクトリ",
      searchPlaceholder: "イベント、タグ、日付を検索 (EN/JA/ZH)...",
      allTags: "すべてのタグ",
      newest: "新しい順",
      oldest: "古い順",
      timelineView: "タイムライン",
      gridView: "グリッド",
      noEvents: "一致するイベントが見つかりませんでした。",
      sources: "ソース:",
      watchOnYouTube: "YouTubeで見る",
      smode_any: "いずれか一致",
      smode_all: "すべて一致",
      smode_exclude: "選択済みを除外",
      mode: "検索モード",
      events: "イベント",
      tagsLabel: "タグ",
      fromDate: "開始日:",
      toDate: "終了日:",
      clearDates: "日付クリア",
      tags: {
        "fansite": "ファンサイト",
        "board_game": "ボードゲーム",
        "mapping": "GISマッピング",
        "development": "開発",
        "music": "音楽",
        "literature": "文学",
        "release": "リリース",
        "project": "プロジェクト",
        "milestone": "マイルストーン",
        "database": "データベース",
        "python": "Python",
        "qgis": "QGIS",
        "mahjong": "麻雀"
      }
    },
    zh: {
      title: "傳記目錄",
      searchPlaceholder: "搜尋事件、標籤、日期 (EN/JA/ZH)...",
      allTags: "所有標籤",
      newest: "最新優先",
      oldest: "最舊優先",
      timelineView: "時間軸",
      gridView: "網格",
      noEvents: "找不到符合條件的事件。",
      sources: "相關來源：",
      watchOnYouTube: "在 YouTube 上觀看",
      smode_any: "符合任一",
      smode_all: "符合全部",
      smode_exclude: "排除所選",
      mode: "捜尋模式",
      events: "活動",
      tagsLabel: "標籤",
      fromDate: "從:",
      toDate: "到:",
      clearDates: "清除日期",
      tags: {
        "fansite": "粉絲網站",
        "board_game": "桌上遊戲",
        "mapping": "GIS地圖",
        "development": "開發",
        "music": "音樂",
        "literature": "文學",
        "release": "發布",
        "project": "專案",
        "milestone": "里程碑",
        "database": "資料庫",
        "python": "Python",
        "qgis": "QGIS",
        "mahjong": "麻雀"
      }
    }
  };

  const BIO_TAG_COLORS = {
    "fansite": { bg: '#e0dfff', text: '#000000' },
    "board_game": { bg: '#475569', text: '#ffffff' },
    "mapping": { bg: '#2dd4bf', text: '#000000' },
    "development": { bg: '#818cf8', text: '#ffffff' },
    "music": { bg: '#a78bfa', text: '#ffffff' },
    "literature": { bg: '#f59e0b', text: '#000000' },
    "release": { bg: '#9926ff', text: '#ffffff' },
    "project": { bg: '#38bdf8', text: '#000000' },
    "milestone": { bg: '#ff3391', text: '#ffffff' },
    "database": { bg: '#60a5fa', text: '#000000' },
    "python": { bg: '#3776ab', text: '#ffffff' },
    "qgis": { bg: '#589632', text: '#ffffff' },
    "mahjong": { bg: '#10b981', text: '#ffffff' }
  };

  function getTagConfig(tag) {
    const t = tag.trim().toLowerCase();
    return BIO_TAG_COLORS[t] || { bg: '#94a3b8', text: '#000000' };
  }

  function getLocalizedText(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
      return field[currentLang] || field['en'] || field['ja'] || field['zh'] || Object.values(field)[0] || '';
    }
    return '';
  }

  function getSearchableText(field) {
    if (!field) return '';
    if (typeof field === 'string') return field.toLowerCase();
    if (typeof field === 'object') {
      return Object.values(field).map(v => (v || '')).join(' ').toLowerCase();
    }
    return '';
  }

  function parseMediaStyling(mediaObj, defaultAlt) {
    let url = '';
    let alt = defaultAlt;
    let style = '';
    let wrapperStyle = '';
    let size = 'small'; // Defaults to small

    if (typeof mediaObj === 'string') {
      url = mediaObj;
    } else if (typeof mediaObj === 'object' && mediaObj !== null) {
      url = mediaObj.url || '';
      alt = mediaObj.alt || defaultAlt;
      if (mediaObj.size !== undefined) {
        size = mediaObj.size;
      }

      let customStyle = '';
      if (mediaObj.width) customStyle += `width: ${mediaObj.width}; `;
      if (mediaObj.height) customStyle += `height: ${mediaObj.height}; `;
      if (mediaObj.maxWidth) customStyle += `max-width: ${mediaObj.maxWidth}; `;
      if (mediaObj.maxHeight) customStyle += `max-height: ${mediaObj.maxHeight}; `;

      if (size === 'small') {
        customStyle += `max-width: 260px; width: 100%; `;
      } else if (size === 'medium') {
        customStyle += `max-width: 480px; width: 100%; `;
      } else if (size === 'large') {
        customStyle += `max-width: 750px; width: 100%; `;
      } else if (size === 'full' || size === 'none') {
        customStyle += `width: 100%; `;
      } else if (size) {
        customStyle += `max-width: ${size}; width: 100%; `;
      }

      if (mediaObj.style) customStyle += mediaObj.style;
      style = customStyle;

      if (mediaObj.align === 'center') {
        wrapperStyle = 'text-align: center; margin-left: auto; margin-right: auto;';
      } else if (mediaObj.align === 'right') {
        wrapperStyle = 'text-align: right; margin-left: auto; margin-right: 0;';
      } else {
        wrapperStyle = 'text-align: left; margin-left: 0; margin-right: auto;';
      }
    }

    if (!style.includes('max-width') && !style.includes('width') && size !== 'full' && size !== 'none') {
      style += 'max-width: 260px; width: 100%;';
    }

    return { url, alt, style, wrapperStyle };
  }

  function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  function isYouTubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  let currentLang = localStorage.getItem('soratomo_lang') || 'en';
  let currentView = 'timeline';
  let currentSort = 'newest';
  let searchMode = 'ANY';
  let selectedFilterTags = new Set();
  let searchQuery = '';
  let startDateFilter = '';
  let endDateFilter = '';
  let eventsData = [];
  let allAvailableTags = new Set();

  function getLocalizedTag(tag) {
    const cleanTag = tag.trim().toLowerCase();
    return translations[currentLang].tags[cleanTag] || tag;
  }

  async function init() {
    const container = document.getElementById('biography-app');
    if (!container) return;

    container.innerHTML = `
      <style>
        .bio-wrapper { 
          width: 100%;
          background-color: #111827;
          border: 1px solid #1f2937;
          border-radius: 0.75rem;
          padding: 1.5rem;
          color: #e5e7eb;
          font-family: ui-sans-serif, system-ui, sans-serif;
          box-sizing: border-box;
          display: block;
          margin: 1rem 0;
        }

        .bio-sticky-header {
          position: sticky;
          top: 0;
          background-color: #111827;
          z-index: 30;
          padding: 0.75rem 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid #374151;
          box-shadow: 0 4px 6px -2px rgba(0, 0, 0, 0.4);
          transition: all 0.25s ease-in-out;
          cursor: pointer;
        }

        .bio-sticky-header.scrolled {
          top: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid #374151;
          padding: 0.4rem 0.75rem;
          background-color: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(8px);
        }
        .bio-sticky-header.scrolled .bio-header-row {
          margin-bottom: 0.4rem;
        }
        .bio-sticky-header.scrolled .bio-title-heading {
          font-size: 1.3rem;
        }
        .bio-sticky-header.scrolled .bio-controls {
          padding: 0.4rem;
          margin-bottom: 0;
          background: transparent;
          border: none;
        }
        .bio-sticky-header.scrolled .bio-date-range-row,
        .bio-sticky-header.scrolled .filter-mode-container {
          display: none;
        }

        .bio-sticky-header.scrolled.expanded {
          padding: 0.75rem 1rem;
        }
        .bio-sticky-header.scrolled.expanded .bio-controls {
          padding: 0.75rem;
          background: #0b0f19;
          border: 1px solid #374151;
          gap: 0.6rem;
        }
        .bio-sticky-header.scrolled.expanded .bio-date-range-row,
        .bio-sticky-header.scrolled.expanded .filter-mode-container {
          display: flex;
        }

        .bio-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          transition: margin 0.25s ease;
        }
        .bio-title-heading {
          font-size: 2.2rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
          transition: font-size 0.25s ease;
        }
        
        .bio-lang-switch {
          display: inline-flex;
          background: #0b0f19;
          border: 1px solid #374151;
          border-radius: 0.5rem;
          padding: 3px;
          gap: 2px;
        }
        .bio-lang-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          padding: 0.4rem 0.8rem;
          border-radius: 0.35rem;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .bio-lang-btn:hover {
          color: #ffffff;
        }
        .bio-lang-btn.active {
          background: #ffffff;
          color: #000000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .bio-controls { 
          background: #0b0f19; 
          padding: 0.85rem 1rem 0.6rem 1rem; 
          border-radius: 0.5rem; 
          border: 1px solid #374151; 
          margin-bottom: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          transition: all 0.25s ease;
        }
        .bio-controls-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
        }
        .bio-search-bar { 
          flex: 1; 
          min-width: 180px; 
          max-width: 100%;
          padding: 0.5rem 0.75rem; 
          border-radius: 0.5rem; 
          border: 1px solid #374151; 
          background: #030712; 
          color: #f3f4f6; 
          font-size: 0.9rem; 
          transition: all 0.25s ease;
        }
        .bio-search-bar::placeholder { color: #6b7280; }
        
        .bio-select, .bio-btn, .bio-date-input { 
          padding: 0.4rem 0.6rem; 
          border-radius: 0.5rem; 
          border: 1px solid #374151; 
          background: #030712; 
          color: #d1d5db; 
          cursor: pointer; 
          font-size: 0.85rem; 
          font-weight: 700;
          transition: background 0.2s;
        }
        .bio-date-input { cursor: text; color-scheme: dark; }
        .bio-select:hover, .bio-btn:hover {
          background: #1f2937;
          color: #ffffff;
        }
        .bio-btn.active { 
          background: #ffffff; 
          color: #000000; 
          border-color: #374151; 
        }
        .bio-toolbar-group { 
          display: flex; 
          gap: 0.5rem; 
          align-items: center; 
          flex-wrap: wrap; 
        }

        .bio-date-range-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          padding-top: 0.4rem;
          border-top: 1px solid #374151;
          font-size: 0.85rem;
          font-weight: 700;
          color: #9ca3af;
        }
        .bio-date-field {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-mode-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: 0.85rem;
          font-weight: 700;
          color: #9ca3af;
        }
        .mode-button-group {
          display: inline-flex;
          background: #030712;
          border: 1px solid #374151;
          border-radius: 0.5rem;
          padding: 3px;
          gap: 2px;
        }
        .mode-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          padding: 0.4rem 0.6rem;
          border-radius: 0.35rem;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mode-btn:hover {
          color: #ffffff;
        }
        .mode-btn.active {
          background: #ffffff;
          color: #000000;
        }

        .tag-cloud-section {
          background: #0b0f19;
          border: 1px solid #374151;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 0.75rem;
          align-items: center;
        }
        @media(max-width: 768px) {
          .tag-cloud-section { grid-template-columns: 1fr; }
        }
        .tag-category-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #9ca3af;
        }
        .tag-buttons-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        
        .bio-timeline { position: relative; padding-left: 2rem; border-left: 3px solid #374151; margin-left: 1rem; width: 100%; box-sizing: border-box; }
        .bio-timeline-item { position: relative; margin-bottom: 2.5rem; width: 100%; }
        .bio-timeline-dot { position: absolute; left: -2.38rem; top: 0.35rem; width: 14px; height: 14px; border-radius: 50%; background: #9ca3af; border: 3px solid #111827; }
        
        .bio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; width: 100%; }
        
        .bio-card { background: #0b0f19; border: 1px solid #374151; border-radius: 0.5rem; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); transition: transform 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box; }
        .bio-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.4); }
        .bio-date { font-size: 0.85rem; font-weight: 700; color: #9ca3af; margin-bottom: 0.4rem; }
        .bio-title { font-size: 1.2rem; font-weight: bold; color: #ffffff; margin-bottom: 0.5rem; }
        .bio-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
        
        .bio-content-block { margin-bottom: 1rem; }
        .bio-text-block { font-size: 0.8rem; line-height: 1.4; color: #d1d5db; }
        .bio-text-block p { margin: 0 0 0.5rem 0; }
        .bio-text-block ul, .bio-text-block ol { margin: 0 0 0.5rem 1.4rem; padding: 0; }
        .bio-text-block li { margin-bottom: 0.15rem; }
        .bio-text-block a { color: #60a5fa; text-decoration: underline; font-weight: 600; }
        .bio-text-block a:hover { color: #93c5fd; }

        .bio-image-block img { width: 100%; height: auto; border-radius: 0.5rem; border: 1px solid #374151; display: block; background: #030712; }
        
        .bio-video-block { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 0.5rem; border: 1px solid #374151; background: #030712; width: 100%; }
        .bio-video-block iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        
        .bio-local-video-block {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #374151;
          background: #030712;
          display: block;
        }

        .bio-fallback-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.5rem;
          background: #1f2937;
          color: #f3f4f6;
          padding: 0.4rem 0.8rem;
          border-radius: 0.35rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          border: 1px solid #374151;
          transition: background 0.2s, border-color 0.2s;
        }
        .bio-fallback-btn:hover {
          background: #374151;
          border-color: #4b5563;
          color: #ffffff;
        }

        .bio-sources { font-size: 0.85rem; border-top: 1px solid #374151; padding-top: 0.75rem; color: #9ca3af; margin-top: 1rem; }
        .bio-sources a { color: #60a5fa; text-decoration: underline; font-weight: 600; }
        .bio-sources a:hover { color: #93c5fd; }
      </style>

      <div class="bio-wrapper">
        <div class="bio-sticky-header" id="bio-sticky-header">
          <div class="bio-header-row">
            <h2 id="bio-main-title" class="bio-title-heading">Biography Directory</h2>
            <div class="bio-lang-switch">
              <button class="bio-lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" id="lang-btn-en">English</button>
              <button class="bio-lang-btn ${currentLang === 'ja' ? 'active' : ''}" data-lang="ja" id="lang-btn-ja">日本語</button>
              <button class="bio-lang-btn ${currentLang === 'zh' ? 'active' : ''}" data-lang="zh" id="lang-btn-zh">繁體中文</button>
            </div>
          </div>

          <div class="bio-controls">
            <div class="bio-controls-row">
              <input type="text" id="bio-search" class="bio-search-bar" placeholder="${translations[currentLang].searchPlaceholder}">
              
              <div class="bio-toolbar-group">
                <select id="bio-sort-select" class="bio-select">
                  <option value="newest">${translations[currentLang].newest}</option>
                  <option value="oldest">${translations[currentLang].oldest}</option>
                </select>
                <button class="bio-btn ${currentView === 'timeline' ? 'active' : ''}" id="bio-view-timeline">${translations[currentLang].timelineView}</button>
                <button class="bio-btn ${currentView === 'grid' ? 'active' : ''}" id="bio-view-grid">${translations[currentLang].gridView}</button>
              </div>
            </div>

            <div class="bio-controls-row">
              <div class="filter-mode-container">
                <span id="label-mode-text">${translations[currentLang].mode}:</span>
                <div class="mode-button-group">
                  <button class="mode-btn ${searchMode === 'ANY' ? 'active' : ''}" onclick="setSearchMode('ANY')" id="mode-btn-ANY">${translations[currentLang].smode_any}</button>
                  <button class="mode-btn ${searchMode === 'ALL' ? 'active' : ''}" onclick="setSearchMode('ALL')" id="mode-btn-ALL">${translations[currentLang].smode_all}</button>
                  <button class="mode-btn ${searchMode === 'EXCLUDE' ? 'active' : ''}" onclick="setSearchMode('EXCLUDE')" id="mode-btn-EXCLUDE">${translations[currentLang].smode_exclude}</button>
                </div>
              </div>
            </div>

            <div class="bio-date-range-row">
              <div class="bio-date-field">
                <span id="label-from-date">${translations[currentLang].fromDate}</span>
                <input type="date" id="bio-start-date" class="bio-date-input">
              </div>
              <div class="bio-date-field">
                <span id="label-to-date">${translations[currentLang].toDate}</span>
                <input type="date" id="bio-end-date" class="bio-date-input">
              </div>
              <button id="bio-clear-dates-btn" class="bio-btn">${translations[currentLang].clearDates}</button>
            </div>
          </div>
        </div>

        <div class="tag-cloud-section">
          <div class="tag-category-label" id="label-tags-cat">${translations[currentLang].tagsLabel}</div>
          <div class="tag-buttons-wrapper" id="bio-tags-container"></div>
        </div>

        <div id="bio-content-area"></div>
      </div>
    `;

    window.addEventListener('scroll', () => {
      const header = document.getElementById('bio-sticky-header');
      if (header) {
        if (window.scrollY > 160) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
          header.classList.remove('expanded');
        }
      }
    });

    const headerEl = document.getElementById('bio-sticky-header');
    if (headerEl) {
      headerEl.addEventListener('click', (e) => {
        if (!headerEl.classList.contains('scrolled')) return;
        const isInteractive = e.target.closest('input, button, select, a, label');
        if (!isInteractive) {
          headerEl.classList.toggle('expanded');
        }
      });
    }

    container.querySelectorAll('.bio-lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentLang = e.target.getAttribute('data-lang');
        localStorage.setItem('soratomo_lang', currentLang);
        container.querySelectorAll('.bio-lang-btn').forEach(b => {
          const isL = b.getAttribute('data-lang') === currentLang;
          b.classList.toggle('active', isL);
          b.style.backgroundColor = isL ? 'white' : 'transparent';
          b.style.color = isL ? 'black' : '#9ca3af';
        });
        updateUI();
      });
    });

    document.getElementById('bio-search').addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderEvents();
    });
    document.getElementById('bio-start-date').addEventListener('change', (e) => {
      startDateFilter = e.target.value;
      renderEvents();
    });
    document.getElementById('bio-end-date').addEventListener('change', (e) => {
      endDateFilter = e.target.value;
      renderEvents();
    });
    document.getElementById('bio-clear-dates-btn').addEventListener('click', () => {
      document.getElementById('bio-start-date').value = '';
      document.getElementById('bio-end-date').value = '';
      startDateFilter = '';
      endDateFilter = '';
      renderEvents();
    });
    document.getElementById('bio-sort-select').addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderEvents();
    });
    document.getElementById('bio-view-timeline').addEventListener('click', () => {
      currentView = 'timeline';
      document.getElementById('bio-view-timeline').classList.add('active');
      document.getElementById('bio-view-grid').classList.remove('active');
      renderEvents();
    });
    document.getElementById('bio-view-grid').addEventListener('click', () => {
      currentView = 'grid';
      document.getElementById('bio-view-grid').classList.add('active');
      document.getElementById('bio-view-timeline').classList.remove('active');
      renderEvents();
    });

    try {
      const response = await fetch(jsonPath);
      const data = await response.json();
      eventsData = data.events || [];

      eventsData.forEach(ev => {
        if (ev.tags) ev.tags.forEach(t => allAvailableTags.add(t));
      });

      renderTagCloud();
      renderEvents();
    } catch (err) {
      console.error("Failed to load biography JSON:", err);
      document.getElementById('bio-content-area').innerHTML = `<p style="color:#ef4444; text-align:center; padding: 2rem;">Error loading biography data from ${jsonPath}</p>`;
    }
  }

  window.setSearchMode = function(mode) {
    searchMode = mode;
    ['ANY', 'ALL', 'EXCLUDE'].forEach(m => {
      const btn = document.getElementById(`mode-btn-${m}`);
      if (btn) {
        const isActive = (m === mode);
        btn.classList.toggle('active', isActive);
        btn.style.backgroundColor = isActive ? 'white' : 'transparent';
        btn.style.color = isActive ? 'black' : '#9ca3af';
      }
    });
    renderEvents();
  };

  function toggleSelectTag(tagKey) {
    if (selectedFilterTags.has(tagKey)) selectedFilterTags.delete(tagKey);
    else selectedFilterTags.add(tagKey);
    renderTagCloud();
    renderEvents();
  }

  function renderTagCloud() {
    const container = document.getElementById('bio-tags-container');
    if (!container) return;
    container.innerHTML = '';

    allAvailableTags.forEach(tag => {
      const isSelected = selectedFilterTags.has(tag);
      const conf = getTagConfig(tag);
      const btn = document.createElement('button');
      btn.innerText = getLocalizedTag(tag);
      btn.onclick = () => toggleSelectTag(tag);
      btn.style.cssText = `
        background-color: ${conf.bg};
        color: ${conf.text};
        border: ${isSelected ? '2px solid white' : '1px solid transparent'};
        border-radius: 0.25rem;
        padding: 0.2rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
      `;
      container.appendChild(btn);
    });
  }

  function updateUI() {
    const t = translations[currentLang];
    document.getElementById('bio-main-title').textContent = t.title;
    document.getElementById('bio-search').placeholder = t.searchPlaceholder;
    document.getElementById('bio-view-timeline').textContent = t.timelineView;
    document.getElementById('bio-view-grid').textContent = t.gridView;
    document.getElementById('label-mode-text').textContent = t.mode + ':';
    document.getElementById('label-tags-cat').textContent = t.tagsLabel;
    document.getElementById('label-from-date').textContent = t.fromDate;
    document.getElementById('label-to-date').textContent = t.toDate;
    document.getElementById('bio-clear-dates-btn').textContent = t.clearDates;
    document.getElementById('mode-btn-ANY').textContent = t.smode_any;
    document.getElementById('mode-btn-ALL').textContent = t.smode_all;
    document.getElementById('mode-btn-EXCLUDE').textContent = t.smode_exclude;

    ['en', 'ja', 'zh'].forEach(l => {
      const btn = document.getElementById(`lang-btn-${l}`);
      if (btn) {
        const isActive = (l === currentLang);
        btn.style.backgroundColor = isActive ? 'white' : 'transparent';
        btn.style.color = isActive ? 'black' : '#9ca3af';
      }
    });

    const sortSelect = document.getElementById('bio-sort-select');
    if (sortSelect) {
      sortSelect.innerHTML = `
        <option value="newest" ${currentSort === 'newest' ? 'selected' : ''}>${t.newest}</option>
        <option value="oldest" ${currentSort === 'oldest' ? 'selected' : ''}>${t.oldest}</option>
      `;
    }
    renderTagCloud();
    renderEvents();
  }

  function renderEvents() {
    const area = document.getElementById('bio-content-area');
    if (!area) return;
    const t = translations[currentLang];

    let filtered = eventsData.filter(ev => {
      const titleField = ev.title || ev.name || '';
      const allTitles = getSearchableText(titleField);

      let allDescs = '';
      if (ev.content && Array.isArray(ev.content)) {
        allDescs = ev.content.map(b => {
          if (b.type === 'text') {
            return getSearchableText(b);
          }
          return b.url || '';
        }).join(' ');
      } else {
        const descField = ev.description || ev.mainDescription || '';
        allDescs = getSearchableText(descField);
      }

      const tagsEn = (ev.tags || []).map(tag => translations.en.tags[tag.toLowerCase()] || tag).join(' ').toLowerCase();
      const tagsJa = (ev.tags || []).map(tag => translations.ja.tags[tag.toLowerCase()] || tag).join(' ').toLowerCase();
      const tagsZh = (ev.tags || []).map(tag => translations.zh.tags[tag.toLowerCase()] || tag).join(' ').toLowerCase();
      const rawTags = (ev.tags || []).join(' ').toLowerCase();
      const dateStr = (ev.date || '').toLowerCase();

      const matchesSearch = !searchQuery ||
        allTitles.includes(searchQuery) ||
        allDescs.includes(searchQuery) ||
        rawTags.includes(searchQuery) ||
        tagsEn.includes(searchQuery) ||
        tagsJa.includes(searchQuery) ||
        tagsZh.includes(searchQuery) ||
        dateStr.includes(searchQuery);

      if (!matchesSearch) return false;

      if (startDateFilter && ev.date < startDateFilter) return false;
      if (endDateFilter && ev.date > endDateFilter) return false;

      if (selectedFilterTags.size === 0) return true;

      const evTags = ev.tags || [];
      const matchesSelectedCount = evTags.filter(tag => selectedFilterTags.has(tag)).length;

      if (searchMode === 'ANY') {
        return matchesSelectedCount > 0;
      } else if (searchMode === 'ALL') {
        for (let tag of selectedFilterTags) {
          if (!evTags.includes(tag)) return false;
        }
        return true;
      } else if (searchMode === 'EXCLUDE') {
        return matchesSelectedCount === 0;
      }
      return true;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return currentSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    if (filtered.length === 0) {
      area.innerHTML = `<p style="text-align: center; padding: 2rem; color: #9ca3af;">${t.noEvents}</p>`;
      return;
    }

    const buildCardHtml = (ev) => {
      const titleField = ev.title || ev.name || '';
      const title = getLocalizedText(titleField);
      const tagsHtml = (ev.tags || []).map(tag => {
        const conf = getTagConfig(tag);
        return `<span style="background:${conf.bg}; color:${conf.text}; padding:0.15rem 0.4rem; border-radius:0.25rem; font-size:0.7rem; font-weight:700; white-space:nowrap;">${getLocalizedTag(tag)}</span>`;
      }).join('');

      let bodyHtml = '';
      const contentBlocks = ev.content;

      if (contentBlocks && Array.isArray(contentBlocks)) {
        bodyHtml = contentBlocks.map(block => {
          if (block.type === 'text') {
            const textVal = getLocalizedText(block);
            return `<div class="bio-content-block bio-text-block">${textVal}</div>`;
          } else if (block.type === 'image') {
            const imgData = parseMediaStyling(block, title);
            return `
              <div class="bio-content-block" style="${imgData.wrapperStyle}">
                <div class="bio-image-block" style="display: inline-block; ${imgData.style}">
                  <img src="${imgData.url}" alt="${imgData.alt}" loading="lazy">
                </div>
              </div>
            `;
          } else if (block.type === 'video') {
            const vidData = parseMediaStyling(block, title);
            if (isYouTubeUrl(block.url)) {
              return `
                <div class="bio-content-block" style="${vidData.wrapperStyle}">
                  <div style="display: inline-block; width: 100%; ${vidData.style}">
                    <div class="bio-video-block">
                      <iframe src="${getYouTubeEmbedUrl(block.url)}" allowfullscreen></iframe>
                    </div>
                    <div style="text-align: left;">
                      <a href="${block.url}" target="_blank" rel="noopener" class="bio-fallback-btn">
                        ▶ ${t.watchOnYouTube}
                      </a>
                    </div>
                  </div>
                </div>
              `;
            } else {
              return `
                <div class="bio-content-block" style="${vidData.wrapperStyle}">
                  <div style="display: inline-block; width: 100%; ${vidData.style}">
                    <video class="bio-local-video-block" controls preload="metadata">
                      <source src="${block.url}" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              `;
            }
          }
          return '';
        }).join('');
      } else {
        const imagesList = ev.images || (ev.image ? [ev.image] : []);
        const mediaHtml = imagesList.length > 0 ? `
          <div class="bio-content-block">
            ${imagesList.map(img => {
              const imgData = parseMediaStyling(img, title);
              return `
                <div style="${imgData.wrapperStyle} margin-bottom: 0.5rem;">
                  <div class="bio-image-block" style="display: inline-block; ${imgData.style}">
                    <img src="${imgData.url}" alt="${imgData.alt}" loading="lazy">
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : '';

        const videosList = ev.videos || (ev.video ? [ev.video] : []);
        const videoHtml = videosList.length > 0 ? videosList.map(vid => {
          const vidUrl = typeof vid === 'string' ? vid : vid.url;
          const vidData = parseMediaStyling(vid, title);
          if (isYouTubeUrl(vidUrl)) {
            return `
              <div class="bio-content-block" style="${vidData.wrapperStyle}">
                <div style="display: inline-block; width: 100%; ${vidData.style}">
                  <div class="bio-video-block">
                    <iframe src="${getYouTubeEmbedUrl(vidUrl)}" allowfullscreen></iframe>
                  </div>
                  <div style="text-align: left;">
                    <a href="${vidUrl}" target="_blank" rel="noopener" class="bio-fallback-btn">
                      ▶ ${t.watchOnYouTube}
                    </a>
                  </div>
                </div>
              </div>
            `;
          } else {
            return `
              <div class="bio-content-block" style="${vidData.wrapperStyle}">
                <div style="display: inline-block; width: 100%; ${vidData.style}">
                  <video class="bio-local-video-block" controls preload="metadata">
                    <source src="${vidUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            `;
          }
        }).join('') : '';

        const descField = ev.description || ev.mainDescription || '';
        const desc = getLocalizedText(descField);
        const descHtml = desc ? `<div class="bio-content-block bio-text-block">${desc}</div>` : '';

        bodyHtml = mediaHtml + videoHtml + descHtml;
      }

      let sourcesHtml = '';
      if (ev.sources && ev.sources.length > 0) {
        const sourceLinks = ev.sources.map(s => {
          const labelText = getLocalizedText(s.label) || s.url;
          return `<div style="margin-top: 0.25rem;"><a href="${s.url}" target="_blank" rel="noopener">🔗 ${labelText}</a></div>`;
        }).join('');
        sourcesHtml = `<div class="bio-sources"><strong>${t.sources}</strong><div style="margin-top: 0.35rem;">${sourceLinks}</div></div>`;
      }

      return `
        <div class="bio-card">
          <div class="bio-date">📅 ${ev.date}</div>
          <div class="bio-title">${title}</div>
          <div class="bio-tags">${tagsHtml}</div>
          ${bodyHtml}
          ${sourcesHtml}
        </div>
      `;
    };

    if (currentView === 'timeline') {
      let html = '<div class="bio-timeline">';
      filtered.forEach(ev => {
        html += `
          <div class="bio-timeline-item">
            <div class="bio-timeline-dot"></div>
            ${buildCardHtml(ev)}
          </div>
        `;
      });
      html += '</div>';
      area.innerHTML = html;
    } else {
      let html = '<div class="bio-grid">';
      filtered.forEach(ev => {
        html += buildCardHtml(ev);
      });
      html += '</div>';
      area.innerHTML = html;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();