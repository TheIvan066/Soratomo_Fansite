function getTagConfig(tag) {
    const t = tag.trim().toLowerCase();

    for (const rule of TAG_PATTERN_RULES) {
        if (rule.pattern.test(t) || t === rule.parent) {
            return { ...TAG_COLORS[rule.configKey] };
        }
    }

    if (TAG_DEFINITIONS[t]) {
        return { ...TAG_DEFINITIONS[t] };
    }

    return { ...TAG_COLORS.item };
}

let goodsInventory = [];
let goodsActiveLanguage = localStorage.getItem('soratomo_lang') || 'en';

//search
let whitelistTags = new Set();
let blacklistTags = new Set();
let goodsListTarget = 'whitelist';
let goodsMatchLogic = 'ALL';
let isFilterDropdownOpen = false;
let isSideDrawerOpen = false;
let goodsSortingDirection = [true, true, true, false];

let goodsSearchQuery = '';
let goodsSearchCaseSensitive = false;
let goodsDateFrom = '';
let goodsDateTo = '';
let goodsSortOrder = 'date_desc';

//image
let imageZoomMode = 'none';
let imageHoldTimer = null;
let imagePointerDownPos = null;
const IMAGE_LONG_HOLD_MS = 350;

const FALLBACK_I18N = {
    search_placeholder: 'Search name, tag, date... (use !term to exclude)',
    case_sensitive: 'Case Sensitive',
    date_from: 'From',
    date_to: 'To',
    date_range_label: 'Release Date',
    clear_dates: 'Clear Dates',
    sort_label: 'Sort By',
    sort_old_new: 'Old to New',
    sort_new_old: 'New to Old',
    sort_name: 'Order of Name',
    side_btn: 'Filters',
    drawer_title: 'Filters & Search',
    collapse_sidebar: 'Collapse Menu'
};

function getI18n(key) {
    const dict = (typeof goodsDict !== 'undefined' && goodsDict[goodsActiveLanguage]) || {};
    if (dict[key] !== undefined) return dict[key];
    const enDict = (typeof goodsDict !== 'undefined' && goodsDict.en) || {};
    if (enDict[key] !== undefined) return enDict[key];
    return FALLBACK_I18N[key] || key;
}

document.addEventListener("DOMContentLoaded", startGoodsEngine);

function injectGoodsStyles() {
    if (!document.getElementById("goods-mobile-responsive-css")) {
        const style = document.createElement("style");
        style.id = "goods-mobile-responsive-css";
        style.innerHTML = `
            /* Overlay setup */
            #goods-rotate-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(15, 23, 42, 0.95);
                color: #ffffff;
                z-index: 99999;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 2rem;
                backdrop-filter: blur(8px);
            }

            #goods-rotate-overlay .rotate-content {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                align-items: center;
                font-weight: 600;
                line-height: 1.5;
            }

            #goods-rotate-overlay .rotate-icon {
                font-size: 3rem;
                animation: rotate-anim 2s infinite ease-in-out;
                margin-bottom: 0.5rem;
            }

            @keyframes rotate-anim {
                0% { transform: rotate(0deg); }
                50% { transform: rotate(90deg); }
                100% { transform: rotate(0deg); }
            }

            /* Ensure full table content is visible without right-edge clipping at any zoom/width */
            #goods-app-root {
                width: 100%;
                max-width: 100%;
                min-width: 0;
                box-sizing: border-box;
            }

            #goods-table-scroll-wrap {
                width: 100%;
                max-width: 100%;
                min-width: 0;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                border-radius: 0.5rem;
                box-sizing: border-box;
            }

            #goods-table-scroll-wrap table {
                width: 100%;
                max-width: 100%;
                min-width: 0;
                table-layout: auto;
                border-collapse: collapse;
                box-sizing: border-box;
            }

            #goods-table-scroll-wrap th,
            #goods-table-scroll-wrap td {
                box-sizing: border-box;
                overflow-wrap: anywhere;
                word-break: break-word;
            }

            .goods-thumb-img {
                max-width: 88px;
                max-height: 116px;
                border-radius: 0.5rem;
                object-fit: cover;
                border: 1px solid #374151;
                cursor: zoom-in;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
                transition: transform 0.15s ease, border-color 0.15s ease;
            }

            .goods-thumb-img:hover {
                border-color: #60a5fa;
                transform: scale(1.03);
            }

            /* Image Zoom Lightbox (Click toggle & Long-hold momentary zoom) */
            #goods-image-zoom-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background-color: rgba(2, 6, 23, 0.88);
                backdrop-filter: blur(4px);
                z-index: 100050;
                justify-content: center;
                align-items: center;
                padding: 1.5rem;
                box-sizing: border-box;
                user-select: none;
                -webkit-user-select: none;
            }

            #goods-image-zoom-overlay.open {
                display: flex;
            }

            #goods-image-zoom-img {
                max-width: min(92vw, 1100px);
                max-height: 88vh;
                width: auto;
                height: auto;
                border-radius: 0.65rem;
                border: 2px solid #475569;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75);
                object-fit: contain;
                cursor: zoom-out;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
            }

            /* In-flow Filter Bar below title & language toggle */
            #goods-sticky-filter-bar {
                position: relative;
                z-index: 20;
                background-color: rgba(15, 23, 42, 0.96);
                border: 1px solid #374151;
                padding: 0.55rem 0.75rem;
                margin-top: 0.5rem;
                margin-bottom: 0.75rem;
                border-radius: 0.5rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
                box-sizing: border-box;
            }

            .goods-search-row {
                display: flex;
                align-items: center;
                gap: 0.45rem;
                width: 100%;
                box-sizing: border-box;
            }

            #goods-search-row {
                margin-bottom: 0.45rem;
            }

            .goods-search-input {
                flex: 1 1 auto;
                width: 100%;
                min-width: 0;
                padding: 0.36rem 0.65rem;
                border-radius: 0.375rem;
                border: 1px solid #4b5563;
                background-color: #0f172a;
                color: #f8fafc;
                font-size: 0.8rem;
                outline: none;
                box-sizing: border-box;
            }

            .goods-search-input:focus {
                border-color: #60a5fa;
            }

            /* Symbol-only Aa button with hover tooltip */
            .goods-case-toggle-btn {
                position: relative;
                flex: 0 0 auto;
                width: 2.15rem;
                height: 2.05rem;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 0.375rem;
                font-size: 0.8rem;
                font-weight: 800;
                letter-spacing: -0.03em;
                cursor: pointer;
                border: 1px solid #4b5563;
                background-color: #1e293b;
                color: #cbd5e1;
                white-space: nowrap;
                box-sizing: border-box;
            }

            .goods-case-toggle-btn:hover {
                background-color: #334155;
                color: #ffffff;
            }

            .goods-case-toggle-btn.active-case {
                background-color: #2563eb;
                border-color: #60a5fa;
                color: #ffffff;
            }

            .goods-case-toggle-btn::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: calc(100% + 6px);
                right: 0;
                background-color: #020617;
                color: #f8fafc;
                border: 1px solid #475569;
                border-radius: 0.35rem;
                padding: 0.25rem 0.5rem;
                font-size: 0.72rem;
                font-weight: 600;
                letter-spacing: normal;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                opacity: 0;
                pointer-events: none;
                transform: translateY(2px);
                transition: opacity 0.14s ease, transform 0.14s ease;
                z-index: 10020;
            }

            .goods-case-toggle-btn:hover::after,
            .goods-case-toggle-btn:focus-visible::after {
                opacity: 1;
                transform: translateY(0);
            }

            #goods-filter-topbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .goods-date-sort-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.6rem;
                flex-wrap: wrap;
                margin-top: 0.45rem;
                padding-top: 0.45rem;
                border-top: 1px dashed #334155;
                font-size: 0.75rem;
                color: #e2e8f0;
            }

            .goods-date-group {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                flex-wrap: wrap;
            }

            .goods-date-input {
                padding: 0.22rem 0.4rem;
                border-radius: 0.3rem;
                border: 1px solid #4b5563;
                background-color: #0f172a;
                color: #f8fafc;
                font-size: 0.75rem;
                white-space: nowrap;
            }

            .goods-sort-group {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                flex-wrap: wrap;
            }

            .goods-sort-select {
                padding: 0.25rem 0.5rem;
                border-radius: 0.3rem;
                border: 1px solid #4b5563;
                background-color: #1e293b;
                color: #f8fafc;
                font-size: 0.75rem;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }

            #goods-filter-dropdown-body {
                margin-top: 0.55rem;
                padding-top: 0.55rem;
                border-top: 1px solid #374151;
            }

            #goods-filter-dropdown-body.hidden-dropdown {
                display: none !important;
            }

            .goods-mode-controls-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-bottom: 0.5rem;
            }

            .goods-toggle-group {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                flex-wrap: wrap;
            }

            .goods-action-btn {
                padding: 0.3rem 0.65rem;
                border-radius: 0.375rem;
                font-size: 0.75rem;
                font-weight: 700;
                cursor: pointer;
                border: 1px solid #4b5563;
                transition: all 0.15s ease;
                white-space: nowrap;
            }

            #goods-filter-toggle-btn {
                background-color: #1e293b;
                color: #f8fafc;
            }
            #goods-filter-toggle-btn:hover {
                background-color: #334155;
            }

            .goods-reset-all-btn {
                background-color: #991b1b;
                color: #ffffff;
                border-color: #dc2626;
            }
            .goods-reset-all-btn:hover {
                background-color: #b91c1c;
            }

            .goods-reset-current-footer {
                display: flex;
                justify-content: flex-end;
                margin-top: 0.75rem;
                padding-top: 0.5rem;
                border-top: 1px dashed #374151;
            }

            .goods-reset-current-btn {
                background-color: #374151;
                color: #f3f4f6;
                border-color: #6b7280;
            }
            .goods-reset-current-btn:hover {
                background-color: #4b5563;
            }

            /* Floating Side Button (always accessible anywhere during scroll) */
            #goods-side-trigger-btn {
                position: fixed;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10000;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                padding: 0.75rem 0.45rem;
                background-color: #1e293b;
                color: #f8fafc;
                border: 1px solid #475569;
                border-right: none;
                border-radius: 0.5rem 0 0 0.5rem;
                box-shadow: -4px 4px 14px rgba(0, 0, 0, 0.55);
                font-size: 0.8rem;
                font-weight: 700;
                cursor: pointer;
                letter-spacing: 0.05em;
                white-space: nowrap;
            }
            #goods-side-trigger-btn:hover {
                background-color: #2563eb;
                border-color: #60a5fa;
            }

            /* Slide-over Side Drawer Backdrop */
            #goods-side-backdrop {
                display: none;
                position: fixed;
                inset: 0;
                background-color: rgba(2, 6, 23, 0.65);
                backdrop-filter: blur(2px);
                z-index: 10001;
            }
            #goods-side-backdrop.open {
                display: block;
            }

            /* Non-scrolling outer shell so collapse button stays strictly in middle of sidebar */
            #goods-side-drawer-shell {
                position: fixed;
                top: 0;
                right: -600px;
                width: min(560px, 92vw);
                height: 100vh;
                z-index: 10002;
                transition: right 0.22s ease;
                box-sizing: border-box;
                overflow: visible;
            }
            #goods-side-drawer-shell.open {
                right: 0;
            }

            /* Collapse button pinned to the vertical middle of the sidebar itself */
            #goods-side-collapse-btn {
                position: absolute;
                top: 50%;
                left: -1.45rem;
                transform: translateY(-50%);
                z-index: 10003;
                width: 1.45rem;
                height: 4.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #1e293b;
                color: #e2e8f0;
                border: 1px solid #475569;
                border-right: none;
                border-radius: 0.5rem 0 0 0.5rem;
                box-shadow: -3px 0 10px rgba(0, 0, 0, 0.45);
                font-size: 0.9rem;
                font-weight: 800;
                cursor: pointer;
                padding: 0;
            }
            #goods-side-collapse-btn:hover {
                background-color: #2563eb;
                border-color: #60a5fa;
                color: #ffffff;
            }

            /* Scrollable content inside the sidebar */
            #goods-side-drawer {
                width: 100%;
                height: 100%;
                background-color: #0f172a;
                color: #f8fafc;
                border-left: 1px solid #334155;
                box-shadow: -8px 0 24px rgba(0, 0, 0, 0.65);
                padding: 0.9rem 1rem;
                overflow-y: auto;
                box-sizing: border-box;
            }

            #goods-side-drawer-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.5rem;
                padding-bottom: 0.6rem;
                margin-bottom: 0.65rem;
                border-bottom: 1px solid #334155;
                position: sticky;
                top: 0;
                background-color: #0f172a;
                z-index: 2;
            }

            #goods-side-drawer-title {
                font-size: 0.95rem;
                font-weight: 700;
                color: #ffffff;
                white-space: nowrap;
            }

            .goods-drawer-section {
                margin-bottom: 0.75rem;
                padding-bottom: 0.6rem;
                border-bottom: 1px dashed #334155;
            }

            .goods-drawer-section-label {
                font-size: 0.75rem;
                font-weight: 700;
                color: #94a3b8;
                margin-bottom: 0.35rem;
                display: block;
            }

            .goods-drawer-tags-wrap {
                display: flex;
                flex-wrap: wrap;
                gap: 0.35rem;
            }

            .goods-drawer-tags-wrap button {
                white-space: nowrap;
            }

            /* Show rotate warning overlay on portrait mobile screens */
            @media screen and (max-width: 768px) and (orientation: portrait) {
                #goods-rotate-overlay {
                    display: flex !important;
                }
            }

            /* Responsive UI adjustments for mobile & zoomed views */
            @media (max-width: 640px) {
                #goods-app-root {
                    font-size: 0.78rem !important;
                }

                #ui-title {
                    font-size: 1.2rem !important;
                    margin-bottom: 0.5rem !important;
                }

                #ui-mode-label, #ui-label-events, #ui-label-items, #ui-label-chars {
                    font-size: 0.72rem !important;
                }

                #goods-app-root button {
                    font-size: 0.68rem !important;
                    padding: 0.2rem 0.38rem !important;
                }

                #goods-tags-event button,
                #goods-tags-character button,
                #goods-tags-item button,
                .goods-drawer-tags-wrap button {
                    font-size: 0.65rem !important;
                    padding: 0.15rem 0.35rem !important;
                }

                #goods-app-root table {
                    font-size: 0.72rem !important;
                }

                #goods-app-root td, #goods-app-root th {
                    padding: 0.35rem 0.3rem !important;
                }

                .goods-thumb-img {
                    max-width: 56px !important;
                    max-height: 72px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    if (!document.getElementById("goods-rotate-overlay")) {
        const overlay = document.createElement("div");
        overlay.id = "goods-rotate-overlay";
        overlay.innerHTML = `
            <div class="rotate-content">
                <div class="rotate-icon">📱🔄</div>
                <p>画面を横にしてご覧ください~</p>
                <p>Please Rotate Your Phone For A Better Experience~</p>
                <p>請將螢幕旋轉至橫向以最佳體驗~</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    setupImageZoomLightbox();
}

function setupImageZoomLightbox() {
    if (!document.getElementById("goods-image-zoom-overlay")) {
        const overlay = document.createElement("div");
        overlay.id = "goods-image-zoom-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");

        const zoomImg = document.createElement("img");
        zoomImg.id = "goods-image-zoom-img";
        zoomImg.alt = "";
        zoomImg.draggable = false;

        overlay.appendChild(zoomImg);
        document.body.appendChild(overlay);

        overlay.addEventListener("pointerup", (e) => {
            if (imageZoomMode === 'toggled' && (e.target === overlay || e.target === zoomImg)) {
                closeImageZoom();
            }
        });

        window.addEventListener("pointerup", () => {
            clearImageHoldTimer();
            if (imageZoomMode === 'holding') {
                closeImageZoom();
            }
        });

        window.addEventListener("pointercancel", () => {
            clearImageHoldTimer();
            if (imageZoomMode === 'holding') {
                closeImageZoom();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && imageZoomMode !== 'none') {
                closeImageZoom();
            }
        });
    }
}

function clearImageHoldTimer() {
    if (imageHoldTimer !== null) {
        clearTimeout(imageHoldTimer);
        imageHoldTimer = null;
    }
}

function openImageZoom(src, alt, mode) {
    if (!src) return;
    const overlay = document.getElementById("goods-image-zoom-overlay");
    const zoomImg = document.getElementById("goods-image-zoom-img");
    if (!overlay || !zoomImg) return;

    zoomImg.src = src;
    zoomImg.alt = alt || "";
    imageZoomMode = mode;
    overlay.classList.add("open");
}

function closeImageZoom() {
    clearImageHoldTimer();
    const overlay = document.getElementById("goods-image-zoom-overlay");
    const zoomImg = document.getElementById("goods-image-zoom-img");
    imageZoomMode = 'none';
    imagePointerDownPos = null;
    if (overlay) overlay.classList.remove("open");
    if (zoomImg) zoomImg.removeAttribute("src");
}

function attachZoomHandlersToThumbnail(imgEl, src, alt) {
    if (!imgEl || !src) return;

    imgEl.draggable = false;

    imgEl.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    imgEl.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        e.preventDefault();
        clearImageHoldTimer();
        imagePointerDownPos = { x: e.clientX, y: e.clientY };

        imageHoldTimer = setTimeout(() => {
            imageHoldTimer = null;
            if (imageZoomMode === 'none') {
                openImageZoom(src, alt, 'holding');
            }
        }, IMAGE_LONG_HOLD_MS);
    });

    imgEl.addEventListener("pointermove", (e) => {
        if (!imagePointerDownPos || !imageHoldTimer) return;
        const dx = e.clientX - imagePointerDownPos.x;
        const dy = e.clientY - imagePointerDownPos.y;
        if (Math.hypot(dx, dy) > 10) {
            clearImageHoldTimer();
        }
    });

    imgEl.addEventListener("pointerup", (e) => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        const wasHolding = imageZoomMode === 'holding';
        const hadPendingHoldTimer = imageHoldTimer !== null;
        clearImageHoldTimer();

        if (wasHolding) {
            closeImageZoom();
            return;
        }

        if (hadPendingHoldTimer) {
            if (imageZoomMode === 'toggled') {
                closeImageZoom();
            } else {
                openImageZoom(src, alt, 'toggled');
            }
        }
        imagePointerDownPos = null;
    });

    imgEl.addEventListener("pointerleave", () => {
        clearImageHoldTimer();
        if (imageZoomMode === 'holding') {
            closeImageZoom();
        }
    });
}

function getDirectChildOfRoot(root, el) {
    let curr = el;
    while (curr && curr.parentElement && curr.parentElement !== root) {
        curr = curr.parentElement;
    }
    return curr && curr.parentElement === root ? curr : null;
}

function findHeaderAnchor(root, tableAnchor) {
    const titleEl = document.getElementById("ui-title");
    const langEl = document.getElementById("lang-btn-en") || document.getElementById("lang-btn-ja") || document.getElementById("lang-btn-zh");

    for (const candidate of [titleEl, langEl]) {
        if (!candidate) continue;
        const directChild = getDirectChildOfRoot(root, candidate);
        if (directChild && directChild !== tableAnchor) {
            return directChild.nextSibling;
        }
    }
    return tableAnchor;
}

function ensureTableScrollWrapper(tableEl) {
    if (!tableEl || !tableEl.parentElement) return;
    if (tableEl.parentElement.id === "goods-table-scroll-wrap") return;

    const wrap = document.createElement("div");
    wrap.id = "goods-table-scroll-wrap";
    tableEl.parentElement.insertBefore(wrap, tableEl);
    wrap.appendChild(tableEl);
}

function setSideDrawerOpen(open) {
    isSideDrawerOpen = Boolean(open);
    const shell = document.getElementById("goods-side-drawer-shell");
    const backdrop = document.getElementById("goods-side-backdrop");
    if (shell) shell.classList.toggle("open", isSideDrawerOpen);
    if (backdrop) backdrop.classList.toggle("open", isSideDrawerOpen);
    if (isSideDrawerOpen) {
        renderSideDrawerControls();
    }
}

function buildDateSortBlock(prefix) {
    const row = document.createElement("div");
    row.className = "goods-date-sort-row";

    const dateGroup = document.createElement("div");
    dateGroup.className = "goods-date-group";

    const dateLabel = document.createElement("span");
    dateLabel.className = "goods-i18n-date-label";
    dateLabel.style.fontWeight = "700";
    dateLabel.style.whiteSpace = "nowrap";

    const fromLabel = document.createElement("span");
    fromLabel.className = "goods-i18n-from-label";
    fromLabel.style.color = "#94a3b8";
    fromLabel.style.whiteSpace = "nowrap";

    const fromInput = document.createElement("input");
    fromInput.id = `${prefix}-date-from`;
    fromInput.type = "date";
    fromInput.className = "goods-date-input";
    fromInput.value = goodsDateFrom;
    fromInput.addEventListener("change", (e) => {
        goodsDateFrom = e.target.value;
        syncInputsFromState();
        renderGoodsTable();
    });

    const toLabel = document.createElement("span");
    toLabel.className = "goods-i18n-to-label";
    toLabel.style.color = "#94a3b8";
    toLabel.style.whiteSpace = "nowrap";

    const toInput = document.createElement("input");
    toInput.id = `${prefix}-date-to`;
    toInput.type = "date";
    toInput.className = "goods-date-input";
    toInput.value = goodsDateTo;
    toInput.addEventListener("change", (e) => {
        goodsDateTo = e.target.value;
        syncInputsFromState();
        renderGoodsTable();
    });

    const clearDatesBtn = document.createElement("button");
    clearDatesBtn.type = "button";
    clearDatesBtn.className = "goods-action-btn goods-i18n-clear-dates";
    clearDatesBtn.style.backgroundColor = "#334155";
    clearDatesBtn.style.color = "#e2e8f0";
    clearDatesBtn.style.padding = "0.2rem 0.45rem";
    clearDatesBtn.onclick = () => {
        goodsDateFrom = '';
        goodsDateTo = '';
        syncInputsFromState();
        renderGoodsTable();
    };

    dateGroup.appendChild(dateLabel);
    dateGroup.appendChild(fromLabel);
    dateGroup.appendChild(fromInput);
    dateGroup.appendChild(toLabel);
    dateGroup.appendChild(toInput);
    dateGroup.appendChild(clearDatesBtn);

    const sortGroup = document.createElement("div");
    sortGroup.className = "goods-sort-group";

    const sortLabel = document.createElement("span");
    sortLabel.className = "goods-i18n-sort-label";
    sortLabel.style.fontWeight = "700";
    sortLabel.style.whiteSpace = "nowrap";

    const sortSelect = document.createElement("select");
    sortSelect.id = `${prefix}-sort-select`;
    sortSelect.className = "goods-sort-select";
    sortSelect.innerHTML = `
        <option value="date_desc"></option>
        <option value="date_asc"></option>
        <option value="name_asc"></option>
    `;
    sortSelect.value = goodsSortOrder;
    sortSelect.addEventListener("change", (e) => {
        goodsSortOrder = e.target.value;
        syncInputsFromState();
        renderGoodsTable();
    });

    sortGroup.appendChild(sortLabel);
    sortGroup.appendChild(sortSelect);

    row.appendChild(dateGroup);
    row.appendChild(sortGroup);
    return row;
}

function buildSearchRow(prefix) {
    const searchRow = document.createElement("div");
    searchRow.className = "goods-search-row";
    if (prefix === "main") searchRow.id = "goods-search-row";

    const searchInput = document.createElement("input");
    searchInput.id = `${prefix}-search-input`;
    searchInput.type = "text";
    searchInput.className = "goods-search-input";
    searchInput.value = goodsSearchQuery;
    searchInput.addEventListener("input", (e) => {
        goodsSearchQuery = e.target.value;
        syncInputsFromState(e.target);
        renderGoodsTable();
    });

    const caseBtn = document.createElement("button");
    caseBtn.id = `${prefix}-case-toggle-btn`;
    caseBtn.type = "button";
    caseBtn.className = "goods-case-toggle-btn";
    caseBtn.innerText = "Aa";
    caseBtn.onclick = () => {
        goodsSearchCaseSensitive = !goodsSearchCaseSensitive;
        updateSearchDateSortLabels();
        renderGoodsTable();
    };

    searchRow.appendChild(searchInput);
    searchRow.appendChild(caseBtn);
    return searchRow;
}

function syncInputsFromState(skipInputEl = null) {
    ["main", "drawer"].forEach(prefix => {
        const sIn = document.getElementById(`${prefix}-search-input`);
        if (sIn && sIn !== skipInputEl && sIn.value !== goodsSearchQuery) {
            sIn.value = goodsSearchQuery;
        }
        const fIn = document.getElementById(`${prefix}-date-from`);
        if (fIn && fIn.value !== goodsDateFrom) fIn.value = goodsDateFrom;

        const tIn = document.getElementById(`${prefix}-date-to`);
        if (tIn && tIn.value !== goodsDateTo) tIn.value = goodsDateTo;

        const sortSel = document.getElementById(`${prefix}-sort-select`);
        if (sortSel && sortSel.value !== goodsSortOrder) sortSel.value = goodsSortOrder;
    });
}

function setupFloatingSideFilter() {
    if (!document.getElementById("goods-side-trigger-btn")) {
        const triggerBtn = document.createElement("button");
        triggerBtn.id = "goods-side-trigger-btn";
        triggerBtn.type = "button";
        triggerBtn.onclick = () => setSideDrawerOpen(!isSideDrawerOpen);
        document.body.appendChild(triggerBtn);
    }

    if (!document.getElementById("goods-side-backdrop")) {
        const backdrop = document.createElement("div");
        backdrop.id = "goods-side-backdrop";
        backdrop.onclick = () => setSideDrawerOpen(false);
        document.body.appendChild(backdrop);
    }

    if (!document.getElementById("goods-side-drawer-shell")) {
        const shell = document.createElement("div");
        shell.id = "goods-side-drawer-shell";

        // Collapse button positioned on the left-middle side of the sidebar itself
        const collapseBtn = document.createElement("button");
        collapseBtn.id = "goods-side-collapse-btn";
        collapseBtn.type = "button";
        collapseBtn.innerText = "›";
        collapseBtn.onclick = () => setSideDrawerOpen(false);

        const drawer = document.createElement("aside");
        drawer.id = "goods-side-drawer";
        drawer.setAttribute("aria-label", "Goods Filters");

        const header = document.createElement("div");
        header.id = "goods-side-drawer-header";

        const title = document.createElement("span");
        title.id = "goods-side-drawer-title";

        const headerRight = document.createElement("div");
        headerRight.style.display = "inline-flex";
        headerRight.style.gap = "0.4rem";

        const resetBtn = document.createElement("button");
        resetBtn.type = "button";
        resetBtn.className = "goods-action-btn goods-reset-all-btn";
        resetBtn.onclick = resetAllFilters;

        headerRight.appendChild(resetBtn);
        header.appendChild(title);
        header.appendChild(headerRight);

        const searchSec = document.createElement("div");
        searchSec.className = "goods-drawer-section";
        searchSec.appendChild(buildSearchRow("drawer"));

        const dateSortSec = document.createElement("div");
        dateSortSec.className = "goods-drawer-section";
        dateSortSec.appendChild(buildDateSortBlock("drawer"));

        const modeSec = document.createElement("div");
        modeSec.className = "goods-drawer-section";
        modeSec.innerHTML = `
            <div class="goods-mode-controls-row" style="margin-bottom:0;">
                <div class="goods-toggle-group">
                    <button id="drawer-list-whitelist" type="button"></button>
                    <button id="drawer-list-blacklist" type="button"></button>
                </div>
                <div class="goods-toggle-group">
                    <button id="drawer-mode-ALL" type="button"></button>
                    <button id="drawer-mode-ANY" type="button"></button>
                </div>
            </div>
        `;

        const tagsSec = document.createElement("div");
        tagsSec.id = "goods-drawer-tags-container";

        const footerSec = document.createElement("div");
        footerSec.className = "goods-reset-current-footer";
        const resetCurr = document.createElement("button");
        resetCurr.id = "drawer-reset-current-btn";
        resetCurr.type = "button";
        resetCurr.className = "goods-action-btn goods-reset-current-btn";
        resetCurr.onclick = resetCurrentSelectionMode;
        footerSec.appendChild(resetCurr);

        drawer.appendChild(header);
        drawer.appendChild(searchSec);
        drawer.appendChild(dateSortSec);
        drawer.appendChild(modeSec);
        drawer.appendChild(tagsSec);
        drawer.appendChild(footerSec);

        shell.appendChild(collapseBtn);
        shell.appendChild(drawer);
        document.body.appendChild(shell);

        document.getElementById("drawer-list-whitelist")?.addEventListener("click", () => selectListTarget('whitelist'));
        document.getElementById("drawer-list-blacklist")?.addEventListener("click", () => selectListTarget('blacklist'));
        document.getElementById("drawer-mode-ALL")?.addEventListener("click", () => setMatchLogic('ALL'));
        document.getElementById("drawer-mode-ANY")?.addEventListener("click", () => setMatchLogic('ANY'));
    }

    renderSideDrawerControls();
}

function renderSideDrawerControls() {
    const d = goodsDict[goodsActiveLanguage] || goodsDict.en;
    const triggerBtn = document.getElementById("goods-side-trigger-btn");
    const drawerTitle = document.getElementById("goods-side-drawer-title");
    const collapseBtn = document.getElementById("goods-side-collapse-btn");
    const resetCurrBtn = document.getElementById("drawer-reset-current-btn");

    const hasDateFilter = Boolean(goodsDateFrom || goodsDateTo) ? 1 : 0;
    const hasSearchFilter = Boolean(goodsSearchQuery.trim()) ? 1 : 0;
    const totalActive = whitelistTags.size + blacklistTags.size + hasDateFilter + hasSearchFilter;

    if (triggerBtn) {
        triggerBtn.innerText = `${getI18n('side_btn')}${totalActive > 0 ? ` (${totalActive})` : ''}`;
    }
    if (drawerTitle) {
        drawerTitle.innerText = `${getI18n('drawer_title')}${totalActive > 0 ? ` (${totalActive})` : ''}`;
    }
    if (collapseBtn) {
        const collapseLabel = getI18n('collapse_sidebar');
        collapseBtn.title = collapseLabel;
        collapseBtn.setAttribute("aria-label", collapseLabel);
    }
    if (resetCurrBtn) {
        const listName = goodsListTarget === 'blacklist' ? d.blacklist : d.whitelist;
        resetCurrBtn.innerText = `${d.reset_current} (${listName})`;
    }

    const wlBtn = document.getElementById("drawer-list-whitelist");
    const blBtn = document.getElementById("drawer-list-blacklist");
    if (wlBtn) {
        const isActive = goodsListTarget === 'whitelist';
        wlBtn.innerText = `${d.whitelist}${whitelistTags.size > 0 ? ` (${whitelistTags.size})` : ''}`;
        wlBtn.style.cssText = `background-color:${isActive ? '#ffffff' : 'transparent'};color:${isActive ? '#000000' : '#d1d5db'};border:${isActive ? '1px solid transparent' : '1px solid #4b5563'};border-radius:0.25rem;padding:0.22rem 0.55rem;font-size:0.75rem;font-weight:700;cursor:pointer;white-space:nowrap;`;
    }
    if (blBtn) {
        const isActive = goodsListTarget === 'blacklist';
        blBtn.innerText = `${d.blacklist}${blacklistTags.size > 0 ? ` (${blacklistTags.size})` : ''}`;
        blBtn.style.cssText = `background-color:${isActive ? '#dc2626' : 'transparent'};color:${isActive ? '#ffffff' : '#d1d5db'};border:${isActive ? '1px solid transparent' : '1px solid #4b5563'};border-radius:0.25rem;padding:0.22rem 0.55rem;font-size:0.75rem;font-weight:700;cursor:pointer;white-space:nowrap;`;
    }

    ['ALL', 'ANY'].forEach(logic => {
        const btn = document.getElementById(`drawer-mode-${logic}`);
        if (!btn) return;
        const isActive = goodsMatchLogic === logic;
        btn.innerText = logic === 'ALL' ? d.smode_all : d.smode_any;
        btn.style.cssText = `background-color:${isActive ? '#ffffff' : 'transparent'};color:${isActive ? '#000000' : '#9ca3af'};border:${isActive ? '1px solid transparent' : '1px solid #4b5563'};border-radius:0.25rem;padding:0.22rem 0.55rem;font-size:0.75rem;font-weight:700;cursor:pointer;white-space:nowrap;`;
    });

    const tagsContainer = document.getElementById("goods-drawer-tags-container");
    if (!tagsContainer) return;
    tagsContainer.innerHTML = "";

    const groups = [
        { label: d.events, filterFn: conf => conf.group === 'event' || PARENT_TAG_GROUPS.includes(conf.group) },
        { label: d.items, filterFn: conf => !['event', 'character'].includes(conf.group) && !PARENT_TAG_GROUPS.includes(conf.group) },
        { label: d.chars, filterFn: conf => conf.group === 'character' }
    ];

    groups.forEach(g => {
        const sec = document.createElement("div");
        sec.className = "goods-drawer-section";

        const lbl = document.createElement("span");
        lbl.className = "goods-drawer-section-label";
        lbl.innerText = g.label;
        sec.appendChild(lbl);

        const wrap = document.createElement("div");
        wrap.className = "goods-drawer-tags-wrap";

        ALL_TAGS.forEach(tagKey => {
            const conf = getTagConfig(tagKey);
            if (!g.filterFn(conf)) return;

            const isWhitelisted = whitelistTags.has(tagKey);
            const isBlacklisted = blacklistTags.has(tagKey);

            let label = getLocalizedTag(tagKey);
            let bgColor = conf.bg;
            let textColor = conf.text;
            let borderStyle = '1px solid transparent';
            let opacityStyle = '1';

            if (isBlacklisted) {
                label = `× ${label}`;
                bgColor = '#4b5563';
                textColor = '#d1d5db';
                opacityStyle = '0.65';
                borderStyle = goodsListTarget === 'blacklist' ? '2px solid #9ca3af' : '1px dashed #9ca3af';
            } else if (isWhitelisted) {
                borderStyle = goodsListTarget === 'whitelist' ? '2px solid #ffffff' : '1px dashed #ffffff';
            }

            const btn = document.createElement("button");
            btn.type = "button";
            btn.innerText = label;
            btn.onclick = () => toggleSelectTag(tagKey);
            btn.style.cssText = `background-color:${bgColor};color:${textColor};border:${borderStyle};opacity:${opacityStyle};border-radius:0.25rem;padding:0.22rem 0.55rem;font-size:0.75rem;font-weight:700;cursor:pointer;white-space:nowrap;`;
            wrap.appendChild(btn);
        });

        sec.appendChild(wrap);
        tagsContainer.appendChild(sec);
    });
}

function setupStickyFilterDropdown() {
    const root = document.getElementById("goods-app-root");
    if (!root) return;

    const tableEl = root.querySelector("table") || document.getElementById("goods-table-body")?.closest("table");
    if (tableEl) {
        ensureTableScrollWrapper(tableEl);
    }

    setupFloatingSideFilter();

    if (document.getElementById("goods-sticky-filter-bar")) return;
    if (!tableEl) return;

    const scrollWrap = document.getElementById("goods-table-scroll-wrap") || tableEl;
    const tableAnchor = getDirectChildOfRoot(root, scrollWrap) || scrollWrap;
    const insertBeforeNode = findHeaderAnchor(root, tableAnchor);

    const stickyBar = document.createElement("div");
    stickyBar.id = "goods-sticky-filter-bar";

    // 1. Search Bar ABOVE the filter section
    stickyBar.appendChild(buildSearchRow("main"));

    // 2. Top row: Dropdown toggle + Reset All
    const topBar = document.createElement("div");
    topBar.id = "goods-filter-topbar";

    const toggleBtn = document.createElement("button");
    toggleBtn.id = "goods-filter-toggle-btn";
    toggleBtn.type = "button";
    toggleBtn.className = "goods-action-btn";
    toggleBtn.onclick = toggleFilterDropdown;

    const resetAllBtn = document.createElement("button");
    resetAllBtn.id = "goods-reset-all-btn";
    resetAllBtn.type = "button";
    resetAllBtn.className = "goods-action-btn goods-reset-all-btn";
    resetAllBtn.onclick = resetAllFilters;

    topBar.appendChild(toggleBtn);
    topBar.appendChild(resetAllBtn);
    stickyBar.appendChild(topBar);

    // 3. Date range + Sort selector right below dropdown & reset all
    stickyBar.appendChild(buildDateSortBlock("main"));

    // 4. Collapsible tag filter section
    const dropdownBody = document.createElement("div");
    dropdownBody.id = "goods-filter-dropdown-body";
    dropdownBody.className = isFilterDropdownOpen ? "" : "hidden-dropdown";

    const modeRow = document.createElement("div");
    modeRow.className = "goods-mode-controls-row";

    const listToggleGroup = document.createElement("div");
    listToggleGroup.className = "goods-toggle-group";

    const modeLabel = document.getElementById("ui-mode-label");
    if (modeLabel) {
        listToggleGroup.appendChild(modeLabel);
    }

    const whitelistBtn = document.createElement("button");
    whitelistBtn.id = "list-btn-whitelist";
    whitelistBtn.type = "button";
    whitelistBtn.onclick = () => selectListTarget('whitelist');

    const blacklistBtn = document.createElement("button");
    blacklistBtn.id = "list-btn-blacklist";
    blacklistBtn.type = "button";
    blacklistBtn.onclick = () => selectListTarget('blacklist');

    listToggleGroup.appendChild(whitelistBtn);
    listToggleGroup.appendChild(blacklistBtn);

    const matchLogicGroup = document.createElement("div");
    matchLogicGroup.className = "goods-toggle-group";

    const matchAllBtn = document.getElementById("mode-btn-ALL") || document.createElement("button");
    matchAllBtn.id = "mode-btn-ALL";
    matchAllBtn.type = "button";
    matchAllBtn.onclick = () => setMatchLogic('ALL');

    const matchAnyBtn = document.getElementById("mode-btn-ANY") || document.createElement("button");
    matchAnyBtn.id = "mode-btn-ANY";
    matchAnyBtn.type = "button";
    matchAnyBtn.onclick = () => setMatchLogic('ANY');

    const legacyExcludeBtn = document.getElementById("mode-btn-EXCLUDE");
    if (legacyExcludeBtn) legacyExcludeBtn.remove();

    matchLogicGroup.appendChild(matchAllBtn);
    matchLogicGroup.appendChild(matchAnyBtn);

    modeRow.appendChild(listToggleGroup);
    modeRow.appendChild(matchLogicGroup);
    dropdownBody.appendChild(modeRow);

    const tagTargets = [
        document.getElementById("ui-label-events"),
        document.getElementById("goods-tags-event"),
        document.getElementById("ui-label-items"),
        document.getElementById("goods-tags-item"),
        document.getElementById("ui-label-chars"),
        document.getElementById("goods-tags-character")
    ].filter(Boolean);

    const directTagBlocks = [];
    tagTargets.forEach(el => {
        const directChild = getDirectChildOfRoot(root, el);
        if (
            directChild &&
            directChild !== tableAnchor &&
            !directChild.querySelector("#ui-title") &&
            !directChild.querySelector("#lang-btn-en") &&
            !directTagBlocks.includes(directChild)
        ) {
            directTagBlocks.push(directChild);
        }
    });

    directTagBlocks.forEach(block => dropdownBody.appendChild(block));

    Array.from(root.children).forEach(child => {
        if (
            child !== stickyBar &&
            child !== tableAnchor &&
            !child.querySelector("#ui-title") &&
            !child.querySelector("#lang-btn-en") &&
            !child.querySelector("table") &&
            child.innerText.trim() === ""
        ) {
            child.remove();
        }
    });

    const footerDiv = document.createElement("div");
    footerDiv.className = "goods-reset-current-footer";

    const resetCurrentBtn = document.createElement("button");
    resetCurrentBtn.id = "goods-reset-current-btn";
    resetCurrentBtn.type = "button";
    resetCurrentBtn.className = "goods-action-btn goods-reset-current-btn";
    resetCurrentBtn.onclick = resetCurrentSelectionMode;

    footerDiv.appendChild(resetCurrentBtn);
    dropdownBody.appendChild(footerDiv);

    stickyBar.appendChild(dropdownBody);

    root.insertBefore(stickyBar, insertBeforeNode);
}

function toggleFilterDropdown() {
    isFilterDropdownOpen = !isFilterDropdownOpen;
    const body = document.getElementById("goods-filter-dropdown-body");
    if (body) {
        body.classList.toggle("hidden-dropdown", !isFilterDropdownOpen);
    }
    updateFilterHeaderButtons();
}

function updateFilterHeaderButtons() {
    const d = goodsDict[goodsActiveLanguage];
    const toggleBtn = document.getElementById("goods-filter-toggle-btn");
    const resetAllBtns = document.querySelectorAll(".goods-reset-all-btn");
    const resetCurrentBtn = document.getElementById("goods-reset-current-btn");

    const hasDateFilter = Boolean(goodsDateFrom || goodsDateTo) ? 1 : 0;
    const hasSearchFilter = Boolean(goodsSearchQuery.trim()) ? 1 : 0;
    const totalActive = whitelistTags.size + blacklistTags.size + hasDateFilter + hasSearchFilter;
    const arrow = isFilterDropdownOpen ? "▲" : "▼";
    const countBadge = totalActive > 0 ? ` (${totalActive})` : "";

    if (toggleBtn) {
        toggleBtn.innerText = `${d.filter_toggle}${countBadge} ${arrow}`;
    }
    resetAllBtns.forEach(btn => {
        btn.innerText = d.reset_all;
    });
    if (resetCurrentBtn) {
        const currentListName = goodsListTarget === 'blacklist' ? d.blacklist : d.whitelist;
        resetCurrentBtn.innerText = `${d.reset_current} (${currentListName})`;
    }
    renderSideDrawerControls();
}

function updateSearchDateSortLabels() {
    const caseLabel = getI18n('case_sensitive');

    document.querySelectorAll(".goods-search-input").forEach(input => {
        input.placeholder = getI18n('search_placeholder');
    });

    document.querySelectorAll(".goods-case-toggle-btn").forEach(btn => {
        btn.innerText = "Aa";
        btn.title = caseLabel;
        btn.setAttribute("data-tooltip", caseLabel);
        btn.setAttribute("aria-label", caseLabel);
        btn.classList.toggle("active-case", goodsSearchCaseSensitive);
    });

    document.querySelectorAll(".goods-i18n-date-label").forEach(el => {
        el.innerText = `${getI18n('date_range_label')}:`;
    });
    document.querySelectorAll(".goods-i18n-from-label").forEach(el => {
        el.innerText = getI18n('date_from');
    });
    document.querySelectorAll(".goods-i18n-to-label").forEach(el => {
        el.innerText = getI18n('date_to');
    });
    document.querySelectorAll(".goods-i18n-clear-dates").forEach(el => {
        el.innerText = getI18n('clear_dates');
    });
    document.querySelectorAll(".goods-i18n-sort-label").forEach(el => {
        el.innerText = `${getI18n('sort_label')}:`;
    });

    document.querySelectorAll(".goods-sort-select").forEach(select => {
        const opts = select.options;
        if (opts[0]) { opts[0].value = 'date_desc'; opts[0].text = getI18n('sort_new_old'); }
        if (opts[1]) { opts[1].value = 'date_asc'; opts[1].text = getI18n('sort_old_new'); }
        if (opts[2]) { opts[2].value = 'name_asc'; opts[2].text = getI18n('sort_name'); }
        select.value = goodsSortOrder;
    });
}

function startGoodsEngine() {
    if (!document.getElementById("goods-app-root")) return;
    injectGoodsStyles();
    setupStickyFilterDropdown();
    fetch('/data/goods.json')
        .then(res => res.json())
        .then(data => {
            goodsInventory = Array.isArray(data) ? data : [];
            selectGoodsLanguage(goodsActiveLanguage);
        })
        .catch(err => {
            console.error("Failed to load /data/goods.json:", err);
            selectGoodsLanguage(goodsActiveLanguage);
        });
}

function updateUI() {
    const d = goodsDict[goodsActiveLanguage];
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };
    const setHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    setHtml('ui-title', `${d.title}`);
    setText('ui-mode-label', `${d.mode}:`);

    const wlCount = whitelistTags.size;
    const blCount = blacklistTags.size;
    setText('list-btn-whitelist', `${d.whitelist}${wlCount > 0 ? ` (${wlCount})` : ''}`);
    setText('list-btn-blacklist', `${d.blacklist}${blCount > 0 ? ` (${blCount})` : ''}`);

    setText('mode-btn-ALL', d.smode_all);
    setText('mode-btn-ANY', d.smode_any);

    setText('ui-label-events', d.events);
    setText('ui-label-items', d.items);
    setText('ui-label-chars', d.chars);
    setHtml('th-name', `${d.header_name} ▼`);
    setText('th-pic', d.header_pic);
    setText('th-tags', d.header_tags);
    setHtml('th-date', `${d.header_date} ▼`);
    setText('th-src', d.header_src);

    updateSearchDateSortLabels();
    updateFilterHeaderButtons();
}

function preserveScrollPosition(callback) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const tbody = document.getElementById("goods-table-body");
    const table = tbody?.closest("table");
    const prevHeight = table ? table.offsetHeight : 0;

    if (table && prevHeight > 0) {
        table.style.minHeight = `${prevHeight}px`;
    }

    callback();

    requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
        if (table) {
            table.style.minHeight = "";
        }
    });
}

function syncModeButtonStyles() {
    ['whitelist', 'blacklist'].forEach(target => {
        const btn = document.getElementById(`list-btn-${target}`);
        if (!btn) return;
        const isActive = (goodsListTarget === target);
        btn.style.backgroundColor = isActive ? (target === 'blacklist' ? '#dc2626' : '#ffffff') : 'transparent';
        btn.style.color = isActive ? (target === 'blacklist' ? '#ffffff' : '#000000') : '#d1d5db';
        btn.style.border = isActive ? '1px solid transparent' : '1px solid #4b5563';
        btn.style.borderRadius = '0.25rem';
        btn.style.padding = '0.2rem 0.5rem';
        btn.style.fontSize = '0.75rem';
        btn.style.fontWeight = '700';
        btn.style.cursor = 'pointer';
    });

    ['ALL', 'ANY'].forEach(logic => {
        const btn = document.getElementById(`mode-btn-${logic}`);
        if (!btn) return;
        const isActive = (goodsMatchLogic === logic);
        btn.style.backgroundColor = isActive ? '#ffffff' : 'transparent';
        btn.style.color = isActive ? '#000000' : '#9ca3af';
        btn.style.border = isActive ? '1px solid transparent' : '1px solid #4b5563';
        btn.style.borderRadius = '0.25rem';
        btn.style.padding = '0.2rem 0.5rem';
        btn.style.fontSize = '0.75rem';
        btn.style.fontWeight = '700';
        btn.style.cursor = 'pointer';
    });
}

function selectGoodsLanguage(lang) {
    preserveScrollPosition(() => {
        goodsActiveLanguage = lang;
        localStorage.setItem('soratomo_lang', lang);
        ['en', 'ja', 'zh'].forEach(l => {
            const btn = document.getElementById(`lang-btn-${l}`);
            if (!btn) return;
            btn.style.backgroundColor = (l === lang) ? 'white' : 'transparent';
            btn.style.color = (l === lang) ? 'black' : '#9ca3af';
        });
        syncModeButtonStyles();
        updateUI();
        renderTagSearchBox();
        renderGoodsTable();
    });
}

function selectListTarget(target) {
    preserveScrollPosition(() => {
        goodsListTarget = target;
        syncModeButtonStyles();
        updateUI();
        renderTagSearchBox();
        renderGoodsTable();
    });
}

function setMatchLogic(logic) {
    preserveScrollPosition(() => {
        goodsMatchLogic = logic;
        syncModeButtonStyles();
        updateUI();
        renderTagSearchBox();
        renderGoodsTable();
    });
}

function toggleSelectTag(tagKey) {
    preserveScrollPosition(() => {
        if (goodsListTarget === 'blacklist') {
            if (blacklistTags.has(tagKey)) {
                blacklistTags.delete(tagKey);
            } else {
                blacklistTags.add(tagKey);
                whitelistTags.delete(tagKey);
            }
        } else {
            if (whitelistTags.has(tagKey)) {
                whitelistTags.delete(tagKey);
            } else {
                whitelistTags.add(tagKey);
                blacklistTags.delete(tagKey);
            }
        }
        syncModeButtonStyles();
        updateUI();
        renderTagSearchBox();
        renderGoodsTable();
    });
}

function resetCurrentSelectionMode() {
    preserveScrollPosition(() => {
        if (goodsListTarget === 'blacklist') {
            blacklistTags.clear();
        } else {
            whitelistTags.clear();
        }
        syncModeButtonStyles();
        updateUI();
        renderTagSearchBox();
        renderGoodsTable();
    });
}

function resetAllFilters() {
    preserveScrollPosition(() => {
        whitelistTags.clear();
        blacklistTags.clear();
        goodsSearchQuery = '';
        goodsDateFrom = '';
        goodsDateTo = '';

        syncInputsFromState();
        syncModeButtonStyles();
        updateUI();
        renderTagSearchBox();
        renderGoodsTable();
    });
}

function getLocalizedName(item) {
    return (item.name && (item.name[goodsActiveLanguage] || item.name['en'])) || 'Unknown Item';
}

function getLocalizedTag(tag) {
    return goodsDict[goodsActiveLanguage].tags?.[tag.toLowerCase()] || tag;
}

function getItemSearchHaystack(item) {
    const parts = [];
    if (item.name && typeof item.name === 'object') {
        Object.values(item.name).forEach(v => { if (v) parts.push(String(v)); });
    }
    (item.tags || []).forEach(t => {
        parts.push(String(t));
        ['en', 'ja', 'zh'].forEach(lang => {
            const translated = goodsDict?.[lang]?.tags?.[String(t).toLowerCase()];
            if (translated) parts.push(String(translated));
        });
    });
    if (item.releaseDate) parts.push(String(item.releaseDate));
    return parts.join(' \n ');
}

function matchesSearchQuery(item) {
    const raw = goodsSearchQuery.trim();
    if (!raw) return true;

    const tokens = raw.split(/\s+/).filter(Boolean);
    const haystackRaw = getItemSearchHaystack(item);
    const haystack = goodsSearchCaseSensitive ? haystackRaw : haystackRaw.toLowerCase();

    for (const token of tokens) {
        const isNot = token.startsWith('!') && token.length > 1;
        const termRaw = isNot ? token.slice(1) : token;
        const term = goodsSearchCaseSensitive ? termRaw : termRaw.toLowerCase();
        const found = haystack.includes(term);

        if (isNot && found) return false;
        if (!isNot && !found) return false;
    }
    return true;
}

function parseReleaseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const normalized = dateStr.trim().replace(/[./]/g, '-');
    const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
        const y = Number(match[1]);
        const m = Number(match[2]) - 1;
        const d = Number(match[3]);
        return new Date(y, m, d).getTime();
    }
    const parsed = Date.parse(dateStr);
    return Number.isNaN(parsed) ? null : parsed;
}

function matchesDate(item) {
    if (!goodsDateFrom && !goodsDateTo) return true;
    const itemTs = parseReleaseDate(item.releaseDate);
    if (itemTs === null) return false;

    if (goodsDateFrom) {
        const fromTs = parseReleaseDate(goodsDateFrom);
        if (fromTs !== null && itemTs < fromTs) return false;
    }
    if (goodsDateTo) {
        const toTs = parseReleaseDate(goodsDateTo);
        if (toTs !== null && itemTs > toTs) return false;
    }
    return true;
}

function renderTagSearchBox() {
    const containers = {
        event: document.getElementById("goods-tags-event"),
        character: document.getElementById("goods-tags-character"),
        item: document.getElementById("goods-tags-item")
    };
    Object.values(containers).forEach(c => { if (c) c.innerHTML = ""; });

    ALL_TAGS.forEach(tagKey => {
        const conf = getTagConfig(tagKey);
        const btn = document.createElement("button");
        btn.type = "button";

        const isWhitelisted = whitelistTags.has(tagKey);
        const isBlacklisted = blacklistTags.has(tagKey);

        let label = getLocalizedTag(tagKey);
        let bgColor = conf.bg;
        let textColor = conf.text;
        let borderStyle = '1px solid transparent';
        let opacityStyle = '1';

        if (isBlacklisted) {
            label = `× ${label}`;
            bgColor = '#4b5563';
            textColor = '#d1d5db';
            opacityStyle = '0.65';
            borderStyle = goodsListTarget === 'blacklist' ? '2px solid #9ca3af' : '1px dashed #9ca3af';
        } else if (isWhitelisted) {
            borderStyle = goodsListTarget === 'whitelist' ? '2px solid #ffffff' : '1px dashed #ffffff';
        }

        btn.innerText = label;
        btn.onclick = () => toggleSelectTag(tagKey);
        btn.style.cssText = `background-color: ${bgColor}; color: ${textColor}; border: ${borderStyle}; opacity: ${opacityStyle}; border-radius: 0.25rem; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; white-space: nowrap;`;

        if (conf.group === 'event' || PARENT_TAG_GROUPS.includes(conf.group)) {
            containers.event?.appendChild(btn);
        } else if (conf.group === 'character') {
            containers.character?.appendChild(btn);
        } else {
            containers.item?.appendChild(btn);
        }
    });

    renderSideDrawerControls();
}

function expandSelectedTags(tagSet) {
    return Array.from(tagSet).flatMap(s => {
        if (PARENT_TAG_GROUPS.includes(s)) {
            return ALL_TAGS.filter(t => getTagConfig(t).group === s);
        }
        return [s];
    });
}

function sortFilteredGoods(list) {
    const copy = [...list];
    if (goodsSortOrder === 'name_asc') {
        copy.sort((a, b) => getLocalizedName(a).localeCompare(getLocalizedName(b), goodsActiveLanguage));
    } else if (goodsSortOrder === 'date_asc') {
        copy.sort((a, b) => {
            const ta = parseReleaseDate(a.releaseDate);
            const tb = parseReleaseDate(b.releaseDate);
            if (ta === null && tb === null) return 0;
            if (ta === null) return 1;
            if (tb === null) return -1;
            return ta - tb;
        });
    } else {
        // Default: 'date_desc' (new to old)
        copy.sort((a, b) => {
            const ta = parseReleaseDate(a.releaseDate);
            const tb = parseReleaseDate(b.releaseDate);
            if (ta === null && tb === null) return 0;
            if (ta === null) return 1;
            if (tb === null) return -1;
            return tb - ta;
        });
    }
    return copy;
}

function renderGoodsTable() {
    const tbody = document.getElementById("goods-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const expandedBlacklist = expandSelectedTags(blacklistTags);
    const whitelistGroups = Array.from(whitelistTags).map(s =>
        PARENT_TAG_GROUPS.includes(s)
            ? ALL_TAGS.filter(t => getTagConfig(t).group === s)
            : [s]
    );

    let filteredList = goodsInventory.filter(item => {
        const itemTags = item.tags || [];

        if (!matchesSearchQuery(item)) return false;
        if (!matchesDate(item)) return false;

        if (expandedBlacklist.length > 0) {
            const hasBlacklisted = itemTags.some(t => expandedBlacklist.includes(t));
            if (hasBlacklisted) return false;
        }

        if (whitelistGroups.length > 0) {
            if (goodsMatchLogic === 'ANY') {
                return whitelistGroups.some(group => group.some(t => itemTags.includes(t)));
            } else {
                return whitelistGroups.every(group => group.some(t => itemTags.includes(t)));
            }
        }

        return true;
    });

    filteredList = sortFilteredGoods(filteredList);

    filteredList.forEach(item => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #374151";

        const itemName = getLocalizedName(item);
        const tagsHtml = (item.tags || []).map(t => `<span style="background:${getTagConfig(t).bg}; color:${getTagConfig(t).text}; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 700; white-space: nowrap;">${getLocalizedTag(t)}</span>`).join("");

        const tdName = document.createElement("td");
        tdName.style.cssText = "padding: 0.65rem 0.55rem; font-weight: 700; color: white;";
        tdName.textContent = itemName;

        const tdPic = document.createElement("td");
        tdPic.style.cssText = "padding: 0.5rem 0.4rem; text-align: center; vertical-align: middle;";
        const imgEl = document.createElement("img");
        imgEl.src = item.pictureUrl || '';
        imgEl.alt = itemName;
        imgEl.className = "goods-thumb-img";
        attachZoomHandlersToThumbnail(imgEl, item.pictureUrl || '', itemName);
        tdPic.appendChild(imgEl);

        const tdTags = document.createElement("td");
        tdTags.style.cssText = "padding: 0.65rem 0.55rem;";
        const tagsWrap = document.createElement("div");
        tagsWrap.style.cssText = "display: flex; flex-wrap: wrap; gap: 0.25rem;";
        tagsWrap.innerHTML = tagsHtml;
        tdTags.appendChild(tagsWrap);

        const tdDate = document.createElement("td");
        tdDate.style.cssText = "padding: 0.65rem 0.5rem; font-size: 0.82rem; color: #9ca3af; white-space: nowrap;";
        tdDate.textContent = item.releaseDate || 'TBD';

        const tdSrc = document.createElement("td");
        tdSrc.style.cssText = "padding: 0.65rem 0.45rem; text-align: center; vertical-align: middle; white-space: nowrap;";
        const linkEl = document.createElement("a");
        linkEl.href = item.originalUrl || '#';
        linkEl.target = "_blank";
        linkEl.rel = "noopener noreferrer";
        linkEl.style.cssText = "display: inline-flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.35rem 0.5rem; border-radius: 0.5rem; background: #030712; color: #d1d5db; border: 1px solid #374151; text-decoration: none; font-size: 0.7rem; font-weight: 700; line-height: 1.2; white-space: nowrap;";
        linkEl.innerHTML = `<span>${goodsDict[goodsActiveLanguage].link}↗</span>`;
        tdSrc.appendChild(linkEl);

        tr.appendChild(tdName);
        tr.appendChild(tdPic);
        tr.appendChild(tdTags);
        tr.appendChild(tdDate);
        tr.appendChild(tdSrc);
        tbody.appendChild(tr);
    });

    updateFilterHeaderButtons();
}

function sortGoodsTable(columnIndex) {
    if (columnIndex === 0) {
        goodsSortOrder = 'name_asc';
    } else if (columnIndex === 3) {
        goodsSortOrder = goodsSortOrder === 'date_desc' ? 'date_asc' : 'date_desc';
    }
    syncInputsFromState();
    renderGoodsTable();
}