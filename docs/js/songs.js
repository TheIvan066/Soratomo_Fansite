const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function chordTranspose(chordLine, steps) {
    if (!chordLine || chordLine === "") return "";
    return chordLine.replace(/[A-G]#?/g, (match) => {
        let index = scale.indexOf(match);
        if (index === -1) return match;
        let newIndex = (index + steps) % 12;
        if (newIndex < 0) newIndex += 12;
        return scale[newIndex];
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const appRoot = document.getElementById("song-app-root");
    if (!appRoot) return;

    const dataSource = appRoot.getAttribute("data-source");
    let currentKeyShift = 0;
    let songData = null;
    let albumNavigation = {prev: null, next: null, totalInAlbum: 0};

    // Autoscroll state (0.1 to 3.0 in 0.1 increments)
    let isAutoScrolling = false;
    let scrollSpeed = parseFloat(localStorage.getItem("se_scroll_speed")) || 1.0;
    if (scrollSpeed < 0.1 || scrollSpeed > 3.0 || Number.isNaN(scrollSpeed)) {
        scrollSpeed = 1.0;
    }
    scrollSpeed = Math.round(scrollSpeed * 10) / 10;
    let scrollRafId = null;
    let lastFrameTime = null;
    let exactScrollTop = 0;

    let globalLanguage = localStorage.getItem("soratomo_lang") || "en";
    let lyricsLanguage = localStorage.getItem("se_lyrics_lang") || "en";
    let romajiActive = localStorage.getItem("se_romaji_active") !== "false";
    let notesActive = localStorage.getItem("se_notes_active") !== "false";

    const uiTranslations = {
        en: {
            artist: "Artist",
            composer: "Composer",
            lyricist: "Lyricist",
            album: "Album",
            releaseDate: "Release Date",
            chordsTitle: "Chords",
            callsTitle: "Call Guide",
            lyricsTitle: "Lyrics",
            legendTitle: "Legend:",
            legendLyrics: "Lyrics",
            legendCall: "Sounded Response",
            legendAction: "Action",
            btnLabel: "English",
            legendPenlight: "Penlight Colour",
            guide: "Guide",
            callGuideText: "P : Claps | p : Claps (Fast) | ℗ : Claps | - : Rest | = : Rest (half) | ≣ : Rest (Quarter) | 🔁 : Penlight Circle | LH : Left Hand | RH : Right Hand",
            linksTitle: "Links",
            prevSong: "Prev",
            nextSong: "Next"
        },
        zh: {
            artist: "歌手",
            composer: "作曲",
            lyricist: "作詞",
            album: "專輯",
            releaseDate: "發行日期",
            chordsTitle: "和弦",
            callsTitle: "Call 表",
            lyricsTitle: "歌詞",
            legendTitle: "圖例:",
            legendLyrics: "歌詞",
            legendCall: "Call",
            legendAction: "動作",
            btnLabel: "繁中",
            guide: "符號說明",
            legendPenlight: "Penlight 顏色",
            callGuideText: "P : 拍手 | p : 拍手 (快) | ℗ : 拍手 | - : 停頓 | = : 停頓 (半拍) | ≣ : 停頓 (¼拍) | 🔁 : Penlight 轉圈 | LH : 左手 | RH : 右手",
            linksTitle: "連結",
            prevSong: "上一首",
            nextSong: "下一首"
        },
        ja: {
            artist: "アーティスト",
            composer: "作曲",
            lyricist: "作詞",
            album: "アルバム",
            releaseDate: "発売日",
            chordsTitle: "コード",
            callsTitle: "コール",
            lyricsTitle: "歌詞",
            legendTitle: "凡例:",
            legendLyrics: "歌詞",
            legendCall: "掛け声",
            legendAction: "アクション",
            btnLabel: "日本語",
            legendPenlight: "サイリュームカラー",
            guide: "符号説明",
            callGuideText: "P : 拍手 | p : 拍手 (速い) | ℗ : 拍手 | - : 休み | = : 休み (半拍) | ≣ : 休み (¼拍) | 🔁 : ペンライトグルグル | LH : 左手 | RH : 右手",
            linksTitle: "リンク",
            prevSong: "前へ",
            nextSong: "次へ"
        }
    };

    if (!document.getElementById("fa-cdn")) {
        const fa = document.createElement("link");
        fa.id = "fa-cdn";
        fa.rel = "stylesheet";
        fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
        document.head.appendChild(fa);
    }
    if (!document.getElementById("tailwind-cdn")) {
        const tw = document.createElement("script");
        tw.id = "tailwind-cdn";
        tw.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
        document.head.appendChild(tw);
    }

    Promise.all([
        fetch(dataSource).then(res => res.json()),
        fetch('/data/song_list.json').then(res => res.json()).catch(() => [])
    ])
        .then(([song, songList]) => {
            songData = song;
            computeAlbumNavigation(songList);
            initLayout();
        })
        .catch(err => console.error("Error loading song data:", err));

    function computeAlbumNavigation(songList) {
        if (!songData || !songData.meta || !songData.meta.album || !Array.isArray(songList)) return;

        const albumSongs = songList.filter(item => item.album === songData.meta.album);
        albumNavigation.totalInAlbum = albumSongs.length;

        const currentIndex = albumSongs.findIndex(item =>
            item.title === songData.meta.title || item.slug === songData.meta.slug
        );

        if (currentIndex !== -1 && albumSongs.length > 1) {
            const prevIndex = (currentIndex - 1 + albumSongs.length) % albumSongs.length;
            const nextIndex = (currentIndex + 1) % albumSongs.length;

            albumNavigation.prev = albumSongs[prevIndex];
            albumNavigation.next = albumSongs[nextIndex];
        }
    }

    function formatSpeed(val) {
        return `${val.toFixed(1)}x`;
    }

    function setScrollSpeed(newSpeed) {
        const clamped = Math.min(3.0, Math.max(0.1, Math.round(newSpeed * 10) / 10));
        scrollSpeed = clamped;
        localStorage.setItem("se_scroll_speed", scrollSpeed.toFixed(1));

        const speedLabel = document.getElementById("chord-speed-label");
        const speedReadout = document.getElementById("chord-speed-readout");
        const thumb = document.getElementById("chord-speed-thumb");

        if (speedLabel) speedLabel.textContent = formatSpeed(scrollSpeed);
        if (speedReadout) speedReadout.textContent = formatSpeed(scrollSpeed);

        if (thumb) {
            // 3.0x is at top (0%), 0.1x is at bottom (100%)
            const ratio = (3.0 - scrollSpeed) / (3.0 - 0.1);
            thumb.style.top = `${ratio * 100}%`;
        }
    }

    function initLayout() {
        if (!document.querySelector('meta[name="viewport"]')) {
            const metaViewport = document.createElement("meta");
            metaViewport.name = "viewport";
            metaViewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
            document.head.appendChild(metaViewport);
        }

        appRoot.className = "w-full max-w-none p-0 text-slate-800 dark:text-slate-100 font-sans antialiased text-sm sm:text-base";

        let styleOverride = document.getElementById("song-engine-widescreen-css");
        if (!styleOverride) {
            styleOverride = document.createElement("style");
            styleOverride.id = "song-engine-widescreen-css";
            styleOverride.innerHTML = `
                #song-app-root {
                    -webkit-text-size-adjust: 100%;
                    text-size-adjust: 100%;
                }
                :has(#song-app-root) .md-typeset > h1 {
                    display: none !important;
                }
                :has(#song-app-root) .md-content,
                :has(#song-app-root) .md-content__inner,
                :has(#song-app-root) .md-main__inner {
                    max-width: 100% !important;
                    width: 100% !important;
                    padding-left: 6px !important;
                    padding-right: 6px !important;
                }
                :has(#song-app-root) .md-sidebar--secondary {
                    display: none !important;
                }

                .se-full-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr);
                    gap: 16px;
                    width: 100%;
                }
                @media (min-width: 1024px) {
                    .se-full-grid {
                        grid-template-columns: 48% 52%;
                        align-items: start;
                    }
                }
                
                .chord-line-row {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                    white-space: pre !important;
                    letter-spacing: 0px !important;
                    word-spacing: normal !important;
                }
                .chord-line-row .chord-val,
                .chord-line-row .text-val {
                    font-family: inherit !important;
                    letter-spacing: inherit !important;
                    line-height: 1.4 !important;
                }                

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #475569;
                }

                /* Mobile Font Scale Overrides (Ultra Small) */
                @media (max-width: 639px) {
                    #song-app-root {
                        font-size: 0.725rem !important; /* ~11.5px base */
                    }
                    #song-app-root h1 {
                        font-size: 1.35rem !important; /* Main title */
                    }
                    #song-app-root h2 {
                        font-size: 0.75rem !important; /* Section headings */
                    }
                    #song-app-root .text-xs,
                    #song-app-root .text-\[10px\],
                    #song-app-root .text-\[11px\] {
                        font-size: 0.65rem !important; /* Sub-labels & metadata */
                    }
                    /* Keep Original Key display prominent on mobile */
                    #song-app-root .original-key-label {
                        font-size: 0.85rem !important;
                    }
                    /* Lyrics scaling */
                    #lyrics-viewport p.text-base {
                        font-size: 0.75rem !important; /* Main lyrics (JA) */
                    }
                    #lyrics-viewport p.text-\[13px\] {
                        font-size: 0.65rem !important; /* Translations */
                    }
                    #lyrics-viewport p.text-xs {
                        font-size: 0.6rem !important; /* Romaji */
                    }
                    /* Chords and Call guide scaling */
                    .chord-line-row .text-val {
                        font-size: 0.75rem !important;
                    }
                    .chord-line-row .chord-val {
                        font-size: 0.625rem !important;
                    }
                    #calls-viewport .text-sm {
                        font-size: 0.675rem !important;
                    }
                    /* Button label scaling */
                    button, select {
                        font-size: 0.65rem !important;
                    }
                }
            `;
            document.head.appendChild(styleOverride);
        }

        renderAppLayout();
    }

    function updateAutoScrollBtnUI() {
        const btn = document.getElementById("chord-autoscroll-btn");
        if (!btn) return;

        if (isAutoScrolling) {
            btn.innerHTML = `<i class="fa-solid fa-pause text-sky-400"></i>`;
            btn.setAttribute("aria-label", "Pause scrolling");
            btn.setAttribute("title", "Pause");
        } else {
            btn.innerHTML = `<i class="fa-solid fa-play text-emerald-400"></i>`;
            btn.setAttribute("aria-label", "Start scrolling");
            btn.setAttribute("title", "Scroll");
        }
    }

    function stopAutoScroll() {
        isAutoScrolling = false;
        if (scrollRafId) {
            cancelAnimationFrame(scrollRafId);
            scrollRafId = null;
        }
        lastFrameTime = null;
        updateAutoScrollBtnUI();
    }

    function startAutoScroll() {
        const viewport = document.getElementById("chords-viewport");
        if (!viewport) return;

        // If already at the very bottom, do not start
        if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1) {
            stopAutoScroll();
            return;
        }

        isAutoScrolling = true;
        exactScrollTop = viewport.scrollTop; // Start from current scroll position
        lastFrameTime = performance.now();
        updateAutoScrollBtnUI();

        const step = (now) => {
            if (!isAutoScrolling) return;

            const currentViewport = document.getElementById("chords-viewport");
            if (!currentViewport) {
                stopAutoScroll();
                return;
            }

            const deltaSeconds = (now - lastFrameTime) / 1000;
            lastFrameTime = now;

            // Sync if user manually scrolled the container while active
            if (Math.abs(currentViewport.scrollTop - exactScrollTop) > 2) {
                exactScrollTop = currentViewport.scrollTop;
            }

            // Base speed: 24px per second at 1.0x speed
            const pixelsPerSecond = 24 * scrollSpeed;
            exactScrollTop += pixelsPerSecond * deltaSeconds;
            currentViewport.scrollTop = exactScrollTop;

            // Stop when reaching the end of the chords viewport
            if (currentViewport.scrollTop + currentViewport.clientHeight >= currentViewport.scrollHeight - 1) {
                stopAutoScroll();
                return;
            }

            scrollRafId = requestAnimationFrame(step);
        };

        scrollRafId = requestAnimationFrame(step);
    }

    function renderAppLayout() {
        const t = uiTranslations[globalLanguage];

        // Preserve current chord scroll offset across full re-renders (e.g., language switch)
        const existingViewport = document.getElementById("chords-viewport");
        const savedChordScroll = existingViewport ? existingViewport.scrollTop : 0;

        let descriptionText = "";
        if (songData.meta.description) {
            if (typeof songData.meta.description === "object") {
                descriptionText = songData.meta.description[globalLanguage]
                    || songData.meta.description["en"]
                    || Object.values(songData.meta.description)[0]
                    || "";
            } else if (typeof songData.meta.description === "string") {
                descriptionText = songData.meta.description;
            }
        }

        let row1Details = [`<i class="fa-solid fa-microphone-lines text-sky-400 mr-1"></i> ${t.artist}:${songData.meta.artist}`];
        if (songData.meta.composer) row1Details.push(`${t.composer}:${songData.meta.composer}`);
        if (songData.meta.lyricist) row1Details.push(`${t.lyricist}:${songData.meta.lyricist}`);

        let row2Details = [];
        if (songData.meta.album) row2Details.push(`${t.album}:${songData.meta.album}`);
        if (songData.meta.releaseDate) row2Details.push(`${t.releaseDate}:${songData.meta.releaseDate}`);

        let linksDropdownHtml = '';
        if (songData.meta.links && songData.meta.links.length > 0) {
            let linksItems = songData.meta.links.map(link =>
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="block text-sky-400 hover:text-sky-300 hover:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded transition-colors whitespace-nowrap text-left">${link.name}</a>`
            ).join("");

            linksDropdownHtml = `
                <div id="links-wrapper" class="relative inline-block">
                    <span id="links-trigger" class="cursor-pointer text-sky-500 hover:text-sky-400">
                        <i class="fa-solid fa-link"></i> ${t.linksTitle}
                    </span>
                    <div id="links-dropdown-menu" class="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full pt-2 z-[9999]" style="display: none;">
                        <div class="bg-slate-900 text-white dark:bg-slate-800 text-xs font-medium rounded-lg shadow-xl border border-slate-700 p-1 flex flex-col gap-0.5 min-w-[120px]">
                            ${linksItems}
                        </div>
                    </div>
                </div>
            `;
            row2Details.push(linksDropdownHtml);
        }

        let descriptionHtml = '';
        if (descriptionText) {
            descriptionHtml = `
                <hr class="border-slate-800 my-2 w-full" />
                <p class="text-xs text-slate-300 font-normal leading-relaxed text-center sm:text-left m-0">
                    ${descriptionText}
                </p>
            `;
        }

        let navButtonsHtml = '';
        if (albumNavigation.totalInAlbum > 1) {
            const prevBtnHtml = albumNavigation.prev
                ? `<a href="${albumNavigation.prev.slug}" class="flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all bg-black hover:bg-slate-900 text-white border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-1.5 no-underline shadow-sm" title="${albumNavigation.prev.title}">
                    <i class="fa-solid fa-chevron-left text-[10px]"></i> ${t.prevSong}
                   </a>`
                : '';

            const nextBtnHtml = albumNavigation.next
                ? `<a href="${albumNavigation.next.slug}" class="flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all bg-black hover:bg-slate-900 text-white border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-1.5 no-underline shadow-sm" title="${albumNavigation.next.title}">
                    ${t.nextSong} <i class="fa-solid fa-chevron-right text-[10px]"></i>
                   </a>`
                : '';

            navButtonsHtml = `
                <div class="flex items-center gap-2 w-full">
                    ${prevBtnHtml}${nextBtnHtml}
                </div>
            `;
        }

        appRoot.innerHTML = `
            <div class="bg-slate-950 dark:bg-black rounded-xl p-6 shadow-md border border-slate-800 mb-5 flex flex-col sm:flex-row justify-between items-center min-h-[90px] gap-4">
                <div class="flex flex-col justify-center w-full sm:w-auto space-y-1.5">
                    <h1 class="text-4xl font-bold tracking-tight text-center sm:text-left" style="color: #0146ea;">
                        ${songData.meta.title}
                    </h1>
                    <div class="text-xs text-slate-200 font-medium tracking-wide text-center sm:text-left">
                        ${row1Details.join(' &nbsp;|&nbsp; ')}
                    </div>
                    <div class="text-xs text-slate-400 font-medium tracking-wide text-center sm:text-left flex flex-wrap justify-center sm:justify-start gap-x-2">
                        ${row2Details.join(' &nbsp;|&nbsp; ')}
                    </div>
                    ${descriptionHtml}
                </div>
                
                <div class="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[200px] shrink-0">
                    <div class="bg-black border border-slate-700 rounded-lg p-1 flex items-center shadow-sm w-full">
                        <button id="toggle-global-lang" class="w-full py-1.5 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer bg-black hover:bg-slate-900 text-white border-none flex items-center justify-center">
                            <i class="fa-solid fa-earth-americas mr-1.5"></i> ${t.btnLabel}
                        </button>
                    </div>
                    ${navButtonsHtml}
                </div>
            </div>
            <div class="se-full-grid">
                <div class="space-y-5">
                    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-visible">
                        <div class="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 rounded-t-xl flex items-center justify-between gap-2 min-h-[58px]">
                            <h2 class="text-base font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-2 m-0 self-center">
                                <i class="fa-solid fa-guitar"></i> ${t.chordsTitle}
                            </h2>
                            <div class="flex flex-col items-end gap-1.5 self-center w-[185px] sm:w-[215px] shrink-0">
                                <div class="bg-black border border-slate-700 rounded-lg p-1 px-2.5 flex items-center justify-between gap-2 shadow-sm w-full h-[32px]">
                                    <span class="original-key-label text-sm sm:text-base font-semibold text-sky-400 font-mono tracking-tight leading-none shrink-0">${songData.meta.originalKey} <span class="text-slate-400 text-xs font-normal">→</span></span>
                                    <select id="key-transposer" class="bg-black text-slate-200 text-xs font-medium outline-none cursor-pointer font-mono border-none py-0.5 text-right">
                                        <option value="0">Original Key</option>
                                        <option value="1">key +1</option><option value="2">key +2</option><option value="3">key +3</option>
                                        <option value="4">key +4</option><option value="5">key +5</option><option value="6">key +6</option>
                                        <option value="-1">key -1</option><option value="-2">key -2</option><option value="-3">key -3</option>
                                        <option value="-4">key -4</option><option value="-5">key -5</option><option value="-6">key -6</option>
                                    </select>
                                </div>
                                <div class="bg-black border border-slate-700 rounded-lg p-1 px-2 flex items-center justify-between gap-1.5 shadow-sm w-full h-[32px] relative">
                                    <button id="chord-autoscroll-btn" type="button" class="w-8 shrink-0 text-xs font-medium cursor-pointer bg-transparent hover:opacity-80 border-none p-0 flex items-center justify-center transition-opacity" aria-label="Start scrolling" title="Scroll">
                                        <i class="fa-solid fa-play text-emerald-400"></i>
                                    </button>
                                    <span class="text-slate-700 shrink-0">|</span>
                                    <div id="speed-dropdown-wrapper" class="relative flex-1 min-w-0">
                                        <button id="chord-speed-trigger" type="button" class="w-full bg-black text-slate-200 hover:text-sky-400 text-xs font-medium cursor-pointer font-mono border-none py-0.5 px-1.5 flex items-center justify-between gap-1 transition-colors" title="Scroll Speed (0.1x - 3.0x)">
                                            <span id="chord-speed-label">${formatSpeed(scrollSpeed)}</span>
                                            <i class="fa-solid fa-caret-down text-[10px] text-slate-400"></i>
                                        </button>
                                        <div id="chord-speed-bar" class="hidden absolute right-0 top-full mt-1.5 w-[76px] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-xl py-2 px-2 z-[9999] flex flex-col items-center gap-1.5 select-none">
                                            <button id="chord-speed-plus" type="button" class="w-7 h-7 rounded-full bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-normal flex items-center justify-center cursor-pointer border-none transition-colors" title="+0.1x">
                                                +
                                            </button>
                                            <div id="chord-speed-track-area" class="relative w-7 h-[136px] flex items-center justify-center cursor-pointer touch-none">
                                                <div class="w-1 h-full rounded-full bg-slate-700 pointer-events-none"></div>
                                                <div id="chord-speed-thumb" class="w-4 h-2 rounded-full bg-slate-200 shadow border border-slate-400/50 -translate-y-1/2 pointer-events-none transition-[top] duration-75" style="position: absolute; top: ${((3.0 - scrollSpeed) / 2.9) * 100}%;"></div>
                                            </div>
                                            <button id="chord-speed-minus" type="button" class="w-7 h-7 rounded-full bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-normal flex items-center justify-center cursor-pointer border-none transition-colors" title="-0.1x">
                                                −
                                            </button>
                                            <button id="chord-speed-readout" type="button" class="text-[11px] font-mono font-normal text-slate-400 hover:text-sky-400 leading-none pt-0.5 bg-transparent border-none cursor-pointer transition-colors" title="Reset to 1.0x">
                                                ${formatSpeed(scrollSpeed)}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p-4">
                            <div id="chords-viewport" class="max-h-[400px] overflow-y-auto overflow-x-auto space-y-4 pr-1 font-mono text-sm custom-scrollbar"></div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[480px]">
                        <div class="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center min-h-[58px]">
                            <h2 class="text-base font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-2 m-0 self-center">
                                <i class="fa-solid fa-bullhorn"></i> ${t.callsTitle}
                            </h2>
                        </div>
                        <div class="bg-slate-100/70 dark:bg-slate-950/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-medium items-center shadow-inner">
                            <div class="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mr-1">${t.legendTitle}</div>
                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-sky-500 border border-sky-600"></span> <span class="text-slate-600 dark:text-slate-400">${t.legendLyrics}</span></div>
                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-600"></span> <span class="text-slate-600 dark:text-slate-400">${t.legendCall}</span></div>
                            <div class="flex items-center gap-1.5 relative">
                                <span class="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-600"></span> 
                                <span class="text-slate-600 dark:text-slate-400 flex items-center gap-1 relative">
                                    ${t.legendAction} 
                                    <button id="call-guide-btn" type="button" class="text-[10px] font-normal text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline cursor-pointer ml-1 bg-transparent border-none p-0">
                                        ${t.guide}
                                    </button>
                                    <div id="call-guide-popup" class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-normal rounded p-2.5 shadow-xl w-64 sm:w-72 text-center z-50 border border-slate-700/30 leading-relaxed">
                                        ${t.callGuideText}
                                    </div>
                                </span>
                            </div>
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-slate-600 dark:text-slate-400 font-medium">${t.legendPenlight}:</span>
                                <div id="legend-penlight-colors" class="flex gap-1"></div>
                            </div>
                        </div>
                        <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div id="calls-viewport" class="space-y-3 pr-1 text-sm"></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden lg:sticky lg:top-4">
                    <div class="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-h-[96px]">
                        <h2 class="text-base font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 m-0 min-w-0 self-center">
                            <i class="fa-solid fa-language shrink-0"></i> 
                            <span class="truncate">${t.lyricsTitle}</span>
                        </h2>
                        <div class="flex flex-col items-center gap-1.5 shrink-0 self-center w-full sm:w-auto sm:min-w-[280px]">
                            <div class="flex items-center gap-1.5 w-full justify-center">
                                <div class="bg-black border border-slate-700 rounded-lg p-1.5 flex items-center justify-center shadow-sm flex-1">
                                    <button id="toggle-romaji" class="w-full text-center whitespace-nowrap"></button>
                                </div>
                                <div class="bg-black border border-slate-700 rounded-lg p-1.5 flex items-center justify-center shadow-sm flex-1">
                                    <button id="toggle-notes" class="w-full text-center whitespace-nowrap"></button>
                                </div>
                            </div>
                            <div class="bg-black border border-slate-700 rounded-lg p-1.5 px-2 flex items-center justify-center shadow-sm w-full">
                                <button id="toggle-language" class="w-full text-center whitespace-nowrap"></button>
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <div id="lyrics-viewport" class="max-h-[750px] overflow-y-auto space-y-4 pr-1 text-sm custom-scrollbar"></div>
                    </div>
                </div>
            </div>
        `;

        const wrapper = document.getElementById("links-wrapper");
        const menu = document.getElementById("links-dropdown-menu");

        if (wrapper && menu) {
            wrapper.addEventListener("mouseenter", () => {
                menu.style.display = "block";
            });
            wrapper.addEventListener("mouseleave", () => {
                menu.style.display = "none";
            });
        }

        const guideBtn = document.getElementById("call-guide-btn");
        const guidePopup = document.getElementById("call-guide-popup");

        if (guideBtn && guidePopup) {
            guideBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const isHidden = guidePopup.classList.contains("hidden");
                if (isHidden) {
                    guidePopup.classList.remove("hidden");
                } else {
                    guidePopup.classList.add("hidden");
                }
            });

            document.addEventListener("click", (e) => {
                if (!guideBtn.contains(e.target) && !guidePopup.contains(e.target)) {
                    guidePopup.classList.add("hidden");
                }
            });
        }

        const keyTransposer = document.getElementById("key-transposer");
        if (keyTransposer) {
            keyTransposer.value = currentKeyShift;
            keyTransposer.addEventListener("change", (e) => {
                const vp = document.getElementById("chords-viewport");
                const currentTop = vp ? vp.scrollTop : 0;
                currentKeyShift = parseInt(e.target.value);
                renderChords();
                if (vp) vp.scrollTop = currentTop;
            });
        }

        const autoScrollBtn = document.getElementById("chord-autoscroll-btn");
        const speedTrigger = document.getElementById("chord-speed-trigger");
        const speedBar = document.getElementById("chord-speed-bar");
        const speedPlus = document.getElementById("chord-speed-plus");
        const speedMinus = document.getElementById("chord-speed-minus");
        const speedReadout = document.getElementById("chord-speed-readout");
        const trackArea = document.getElementById("chord-speed-track-area");

        if (speedTrigger && speedBar) {
            speedTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                speedBar.classList.toggle("hidden");
                if (!speedBar.classList.contains("hidden")) {
                    setScrollSpeed(scrollSpeed);
                }
            });

            if (speedPlus) {
                speedPlus.addEventListener("click", (e) => {
                    e.stopPropagation();
                    setScrollSpeed(scrollSpeed + 0.1);
                });
            }

            if (speedMinus) {
                speedMinus.addEventListener("click", (e) => {
                    e.stopPropagation();
                    setScrollSpeed(scrollSpeed - 0.1);
                });
            }

            if (speedReadout) {
                speedReadout.addEventListener("click", (e) => {
                    e.stopPropagation();
                    setScrollSpeed(1.0);
                });
            }

            if (trackArea) {
                let isDragging = false;

                const updateFromPointerY = (clientY) => {
                    const rect = trackArea.getBoundingClientRect();
                    if (rect.height <= 0) return;
                    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
                    const rawSpeed = 3.0 - ratio * (3.0 - 0.1);
                    setScrollSpeed(rawSpeed);
                };

                trackArea.addEventListener("pointerdown", (e) => {
                    e.stopPropagation();
                    isDragging = true;
                    trackArea.setPointerCapture(e.pointerId);
                    updateFromPointerY(e.clientY);
                });

                trackArea.addEventListener("pointermove", (e) => {
                    if (!isDragging) return;
                    updateFromPointerY(e.clientY);
                });

                const endDrag = () => {
                    isDragging = false;
                };
                trackArea.addEventListener("pointerup", endDrag);
                trackArea.addEventListener("pointercancel", endDrag);
            }

            document.addEventListener("click", (e) => {
                if (!speedTrigger.contains(e.target) && !speedBar.contains(e.target)) {
                    speedBar.classList.add("hidden");
                }
            });
        }

        if (autoScrollBtn) {
            updateAutoScrollBtnUI();
            autoScrollBtn.addEventListener("click", () => {
                if (isAutoScrolling) {
                    stopAutoScroll();
                } else {
                    startAutoScroll();
                }
            });
        }

        document.getElementById("toggle-global-lang").onclick = () => {
            if (globalLanguage === "en") globalLanguage = "zh";
            else if (globalLanguage === "zh") globalLanguage = "ja";
            else globalLanguage = "en";
            localStorage.setItem("soratomo_lang", globalLanguage);
            renderAppLayout();
        };

        buttons();
        renderChords();
        renderCalls();
        renderLyrics();

        const restoredViewport = document.getElementById("chords-viewport");
        if (restoredViewport && savedChordScroll > 0) {
            restoredViewport.scrollTop = savedChordScroll;
        }
    }

    function renderChords() {
        const container = document.getElementById("chords-viewport");
        container.innerHTML = "";
        if (!songData.chords) return;

        songData.chords.forEach(sec => {
            let sectionBlock = document.createElement("div");
            sectionBlock.className = "mb-5 last:mb-0 bg-slate-50/70 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 space-y-2";
            sectionBlock.innerHTML = `<div class="text-[10px] font-semibold uppercase tracking-widest text-sky-500 border-b border-sky-500/10 pb-0.5 mb-1 inline-block">${sec.section}</div>`;

            sec.lines.forEach(line => {
                let lineRow = document.createElement("div");
                lineRow.className = "chord-line-row flex flex-col py-0.5 overflow-x-auto";

                if (line.c) {
                    let transposedChords = chordTranspose(line.c, currentKeyShift);
                    let chordSpan = document.createElement("div");
                    chordSpan.className = "chord-val text-xs font-semibold text-pink-500 select-none min-h-[1.25rem]";
                    chordSpan.textContent = transposedChords;
                    lineRow.appendChild(chordSpan);
                }

                if (line.t) {
                    let textSpan = document.createElement("div");
                    textSpan.className = "text-val text-base font-normal text-sky-600 dark:text-sky-400";
                    textSpan.textContent = line.t;
                    lineRow.appendChild(textSpan);
                }
                sectionBlock.appendChild(lineRow);
            });
            container.appendChild(sectionBlock);
        });
    }

    function renderCalls() {
        const container = document.getElementById("calls-viewport");
        container.innerHTML = "";

        const legendContainer = document.getElementById("legend-penlight-colors");
        if (legendContainer && songData.meta.penlight_color) {
            legendContainer.innerHTML = songData.meta.penlight_color.map(hex =>
                `<span class="w-4 h-4 rounded-sm border border-slate-300" style="background-color: ${hex}"></span>`
            ).join("");
        }

        if (!songData.calls) return;

        songData.calls.forEach(item => {
            let block = document.createElement("div");
            block.className = "p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 shadow-sm flex flex-col gap-0.5 font-sans tracking-wide";

            let row1 = document.createElement("div");
            row1.className = "text-sm font-normal text-sky-600 dark:text-sky-400 leading-normal";
            row1.textContent = item.lyrics || "";
            block.appendChild(row1);

            let row2 = document.createElement("div");
            row2.className = "text-sm font-normal text-rose-500 dark:text-rose-400 min-h-[1.1rem] whitespace-pre-wrap leading-normal";
            if (item.call) {
                if (typeof item.call.snap === "number" && item.lyrics) {
                    let words = item.lyrics.split(" ");
                    let leadingWords = words.slice(0, item.call.snap).join(" ");
                    let paddingSpaces = " ".repeat(leadingWords.length + (leadingWords ? 1 : 0));
                    row2.textContent = paddingSpaces + item.call.text;
                } else {
                    row2.textContent = item.call.text || item.call;
                }
            }
            block.appendChild(row2);

            if (item.extra_row && item.action) {
                let row3 = document.createElement("div");
                row3.className = "text-sm font-normal text-amber-600 dark:text-amber-400 min-h-[1rem] whitespace-pre-wrap leading-normal pt-0.5";
                if (typeof item.action.snap === "number" && item.lyrics) {
                    let words = item.lyrics.split(" ");
                    let leadingWords = words.slice(0, item.action.snap).join(" ");
                    let paddingSpaces = " ".repeat(leadingWords.length + (leadingWords ? 1 : 0));
                    row3.textContent = paddingSpaces + item.action.text;
                } else {
                    row3.textContent = (item.action.text || item.action);
                }
                block.appendChild(row3);
            }
            container.appendChild(block);
        });
    }

    function renderLyrics() {
        const container = document.getElementById("lyrics-viewport");
        container.innerHTML = "";
        if (!songData.lyrics) return;

        songData.lyrics.forEach(line => {
            let translation = lyricsLanguage === "en" ? line.en : line.zh;
            let notesHtml = "";

            if (notesActive && line.notes && line.notes.length > 0) {
                let noteItems = line.notes.map(n => `
                    <div class="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-xs shadow-inner">
                        <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-[12px] font-semibold">${n.word}</strong>
                        <span class="mx-1 text-slate-300 dark:text-slate-700">|</span>
                        <span class="text-slate-600 dark:text-slate-400">${n.meaning}</span>
                    </div>
                `).join("");
                notesHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">${noteItems}</div>`;
            }

            let lyricStyle = "text-white dark:text-white";

            let lineBlock = document.createElement("div");
            lineBlock.className = "bg-slate-50/40 dark:bg-slate-950/10 p-3.5 rounded-lg border border-slate-100 dark:border-slate-900/50 space-y-1 shadow-sm";
            lineBlock.innerHTML = `
                <p class="text-base font-semibold tracking-wide ${lyricStyle}">${line.ja}</p>
                <p class="text-xs font-mono text-sky-600 dark:text-sky-400 tracking-wider ${romajiActive ? '' : 'hidden'}">${line.romaji}</p>
                <p class="text-[13px] text-slate-400 dark:text-slate-400 font-normal leading-relaxed border-l-2 border-slate-500 dark:border-slate-700 pl-2 italic">“ ${translation} ”</p>
                ${notesHtml}
            `;
            container.appendChild(lineBlock);
        });
    }

    function buttons() {
        const btnRomaji = document.getElementById("toggle-romaji");
        const btnNotes = document.getElementById("toggle-notes");
        const btnLang = document.getElementById("toggle-language");

        const styleActive = "w-full py-0.5 text-[11px] font-semibold rounded transition-all cursor-pointer bg-slate-800 text-white border border-transparent";
        const styleInactive = "w-full py-0.5 text-[11px] font-normal rounded transition-all cursor-pointer bg-transparent text-slate-500 border border-transparent";

        let rOn = "Romaji On", rOff = "Romaji Off", nOn = "Notes On", nOff = "Notes Off";
        if (globalLanguage === "zh") {
            rOn = "羅馬字 開";
            rOff = "羅馬字 關";
            nOn = "註解 開";
            nOff = "註解 關";
        } else if (globalLanguage === "ja") {
            rOn = "ローマ字 表示";
            rOff = "ローマ字 非表示";
            nOn = "解説 表示";
            nOff = "解説 非表示";
        }

        btnRomaji.innerText = romajiActive ? rOn : rOff;
        btnRomaji.className = romajiActive ? styleActive : styleInactive;

        btnNotes.innerText = notesActive ? nOn : nOff;
        btnNotes.className = notesActive ? styleActive : styleInactive;

        btnLang.innerText = lyricsLanguage === "en" ? "English" : "繁體中文";
        btnLang.className = "w-full py-0.5 text-[11px] font-semibold rounded transition-all cursor-pointer bg-slate-800 text-white border border-transparent";

        btnRomaji.onclick = () => {
            romajiActive = !romajiActive;
            localStorage.setItem("se_romaji_active", romajiActive);
            renderAppLayout();
        };

        btnNotes.onclick = () => {
            notesActive = !notesActive;
            localStorage.setItem("se_notes_active", notesActive);
            renderAppLayout();
        };

        btnLang.onclick = () => {
            lyricsLanguage = (lyricsLanguage === "en") ? "zh" : "en";
            localStorage.setItem("se_lyrics_lang", lyricsLanguage);
            renderAppLayout();
        };
    }
});