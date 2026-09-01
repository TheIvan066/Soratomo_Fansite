---
hide:
  - toc
---
<div id="goods-app-root" style="width: 100%; background-color: #111827; border: 1px solid #1f2937; border-radius: 0.75rem; padding: 1.5rem; color: #e5e7eb; font-family: ui-sans-serif, system-ui, sans-serif; box-sizing: border-box; display: block; margin: 1rem 0;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #374151; padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
    <h1 id="ui-title" style="margin: 0; font-size: 1.5rem; font-weight: 800; color: white; display: flex; align-items: center; gap: 0.5rem;">🎁 Official Merch Directory</h1>
    <div style="display: flex; background-color: #030712; border: 1px solid #374151; border-radius: 0.5rem; padding: 0.25rem; gap: 0.25rem;">
      <button id="lang-btn-en" onclick="selectGoodsLanguage('en')" style="padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 700; background-color: white; color: black; border: none; cursor: pointer; transition: 0.2s;">English</button>
      <button id="lang-btn-ja" onclick="selectGoodsLanguage('ja')" style="padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 700; background-color: transparent; color: #9ca3af; border: none; cursor: pointer; transition: 0.2s;">日本語</button>
      <button id="lang-btn-zh" onclick="selectGoodsLanguage('zh')" style="padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 700; background-color: transparent; color: #9ca3af; border: none; cursor: pointer; transition: 0.2s;">繁體中文</button>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
    <span id="ui-mode-label" style="font-size: 0.875rem; font-weight: 700; color: #9ca3af;">Search Mode:</span>
    <div style="display: flex; background-color: #030712; border: 1px solid #374151; border-radius: 0.5rem; padding: 0.25rem; gap: 0.25rem;">
      <button id="mode-btn-ANY" onclick="setSearchMode('ANY')" style="padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 700; background-color: white; color: black; border: none; cursor: pointer; transition: 0.2s;">Include Any</button>
      <button id="mode-btn-ALL" onclick="setSearchMode('ALL')" style="padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 700; background-color: transparent; color: #9ca3af; border: none; cursor: pointer; transition: 0.2s;">Include All</button>
      <button id="mode-btn-EXCLUDE" onclick="setSearchMode('EXCLUDE')" style="padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 700; background-color: transparent; color: #9ca3af; border: none; cursor: pointer; transition: 0.2s;">Exclude Selected</button>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; background-color: #1f293780; padding: 1rem; border-radius: 0.5rem; border: 1px solid #374151;">
    <div style="display: flex; align-items: flex-start; gap: 1rem; width: 100%;">
      <div id="ui-label-events" style="width: 80px; min-width: 80px; font-size: 0.75rem; font-weight: 700; color: #9ca3af; padding-top: 0.25rem;">Events</div>
      <div id="goods-tags-event" style="display: flex; flex-wrap: wrap; gap: 0.5rem; flex: 1;"></div>
    </div>
    <div style="display: flex; align-items: flex-start; gap: 1rem; width: 100%;">
      <div id="ui-label-items" style="width: 80px; min-width: 80px; font-size: 0.75rem; font-weight: 700; color: #9ca3af; padding-top: 0.25rem;">Items</div>
      <div id="goods-tags-item" style="display: flex; flex-wrap: wrap; gap: 0.5rem; flex: 1;"></div>
    </div>
    <div style="display: flex; align-items: flex-start; gap: 1rem; width: 100%;">
      <div id="ui-label-chars" style="width: 80px; min-width: 80px; font-size: 0.75rem; font-weight: 700; color: #9ca3af; padding-top: 0.25rem;">Chars</div>
      <div id="goods-tags-character" style="display: flex; flex-wrap: wrap; gap: 0.5rem; flex: 1;"></div>
    </div>
  </div>
  <div style="width: 100%; overflow-x: auto; border: 1px solid #374151; border-radius: 0.5rem; background-color: #111827;">
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
      <colgroup>
        <col style="width: 30%;"><col style="width: 120px;"><col style="width: 30%;"><col style="width: 15%;"><col style="width: 15%;">
      </colgroup>
      <thead style="background-color: #1f2937; border-bottom: 1px solid #374151;">
        <tr>
          <th id="th-name" onclick="sortGoodsTable(0)" style="padding: 1rem; cursor: pointer; color: #d1d5db; font-weight: 700;">Name ▼</th>
          <th id="th-pic" style="padding: 1rem; text-align: center; color: #d1d5db; font-weight: 700;">Picture</th>
          <th id="th-tags" style="padding: 1rem; color: #d1d5db; font-weight: 700;">Tags</th>
          <th id="th-date" onclick="sortGoodsTable(3)" style="padding: 1rem; cursor: pointer; color: #d1d5db; font-weight: 700;">Date ▼</th>
          <th id="th-src" style="padding: 1rem; text-align: center; color: #d1d5db; font-weight: 700;">Source</th>
        </tr>
      </thead>
      <tbody id="goods-table-body"></tbody>
    </table>
  </div>
</div>