// Global Transposition Map
const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function transposeLine(chordLine, steps) {
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

    // Cross-page state retention using localStorage
    let globalLanguage = localStorage.getItem("se_global_lang") || "en";   // App UI Language ("en", "zh", "ja")
    let lyricsLanguage = localStorage.getItem("se_lyrics_lang") || "en";   // Translation track language ("en", "zh")
    let romajiActive = localStorage.getItem("se_romaji_active") !== "false";
    let notesActive = localStorage.getItem("se_notes_active") !== "false";

    // Global App Shell Translations (Now with Japanese Support)
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
            callGuideText: "P : Claps (Crotchet) | p : Claps (Quaver) | ℗ : Claps (Semiquaver) | - : Crotchet | = : Quaver | ≣ : Semiquaver | 🔁 : Penlight Circle",
            linksTitle: "Links"
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
            legendPenlight: "Penlight 顔色",
            callGuideText: "P : 拍手 (四分音符) | p : 拍手 (八分音符)| ℗ : 拍手 (十六分音符) | - : 四分音符 | = : 八分音符 | ≣ : 十六分音符 | 🔁 : Penlight 轉圈",
            linksTitle: "連結"
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
            callGuideText: "P : 拍手 (四分音符) | p : 拍手 (八分音符) | ℗ : 拍手 (十六分音符) | - : 四分音符 | = : 八分音符 | ≣ : 十六分音符 | 🔁 : ペンライトグルグル",
            linksTitle: "リンク"
        }
    };

    // Dynamically mount CDNs safely
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

    fetch(dataSource)
        .then(res => res.json())
        .then(data => {
            songData = data;
            initLayout();
        })
        .catch(err => console.error("Error loading song data:", err));

    function initLayout() {
        appRoot.className = "w-full max-w-none p-0 text-slate-800 dark:text-slate-100 font-sans antialiased";

        let styleOverride = document.getElementById("song-engine-widescreen-css");
        if (!styleOverride) {
            styleOverride = document.createElement("style");
            styleOverride.id = "song-engine-widescreen-css";
            styleOverride.innerHTML = `
                /* Hides ONLY the document title that is a direct child of md-typeset */
                :has(#song-app-root) .md-typeset > h1 {
                    display: none !important;
                }
            
                /* Standard layout overrides */
                :has(#song-app-root) .md-content,
                :has(#song-app-root) .md-content__inner,
                :has(#song-app-root) .md-main__inner {
                    max-width: 100% !important;
                    width: 100% !important;
                    padding-left: 10px !important;
                    padding-right: 10px !important;
                }
                :has(#song-app-root) .md-sidebar--secondary {
                    display: none !important;
                }
                .se-full-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                    width: 100%;
                }
                @media (min-width: 1024px) {
                    .se-full-grid {
                        grid-template-columns: 48% 52%;
                        align-items: start;
                    }
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
            `;
            document.head.appendChild(styleOverride);
        }

        renderAppLayout();
    }

function renderAppLayout() {
        const t = uiTranslations[globalLanguage];

        // Row 1 Metadata (Artist, Composer, Lyricist)
        let row1Details = [`<i class="fa-solid fa-microphone-lines text-sky-400 mr-1"></i> ${t.artist}: ${songData.meta.artist}`];
        if (songData.meta.composer) row1Details.push(`${t.composer}: ${songData.meta.composer}`);
        if (songData.meta.lyricist) row1Details.push(`${t.lyricist}: ${songData.meta.lyricist}`);

        // Row 2 Metadata (Album, Release Date, Description)
        let row2Details = [];
        if (songData.meta.album) row2Details.push(`${t.album}: ${songData.meta.album}`);
        if (songData.meta.releaseDate) row2Details.push(`${t.releaseDate}: ${songData.meta.releaseDate}`);

        // Logic for Links Dropdown
        let linksDropdownHtml = '';
        if (songData.meta.links && songData.meta.links.length > 0) {
            let linksItems = songData.meta.links.map(link =>
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="block text-sky-400 hover:text-sky-300 hover:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded transition-colors whitespace-nowrap text-left">${link.name}</a>`
            ).join("");

            // Note: Added pt-2 (padding-top) to act as a physical bridge for the mouse
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

        if (songData.meta.description) row2Details.push(songData.meta.description);

        appRoot.innerHTML = `
            <div class="bg-slate-950 dark:bg-black rounded-xl p-6 shadow-md border border-slate-800 mb-5 flex flex-col sm:flex-row justify-between items-center min-h-[90px] gap-4">
                <div class="flex flex-col justify-center w-full sm:w-auto space-y-1">
                    <h1 class="text-4xl font-black tracking-tight text-center sm:text-left" style="color: #0146ea;">
                        ${songData.meta.title}
                    </h1>
                    <!-- Changed p to div to allow block-level dropdowns -->
                    <div class="text-xs text-slate-200 font-black tracking-wide text-center sm:text-left">
                        ${row1Details.join(' &nbsp;|&nbsp; ')}
                    </div>
                    <!-- Changed p to div -->
                    <div class="text-xs text-slate-400 font-black tracking-wide text-center sm:text-left flex flex-wrap justify-center sm:justify-start gap-x-2">
                        ${row2Details.join(' &nbsp;|&nbsp; ')}
                    </div>
                </div>
                
                <button id="toggle-global-lang" class="w-36 py-2 text-xs font-black rounded-lg transition-all border shadow-sm cursor-pointer bg-sky-600 hover:bg-sky-500 text-white border-sky-700 shrink-0">
                    <i class="fa-solid fa-earth-americas mr-1.5"></i> ${t.btnLabel}
                </button>
            </div>

            <div class="se-full-grid">
                <div class="space-y-5">
                    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div class="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between min-h-[58px]">
                            <h2 class="text-base font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-2 m-0 self-center">
                                <i class="fa-solid fa-guitar"></i> ${t.chordsTitle}
                            </h2>
                            <div class="bg-black border border-slate-700 rounded-lg p-1 px-2 flex items-center gap-2 shadow-sm self-center">
                                <span class="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-tight">${songData.meta.originalKey}  →</span>
                                <select id="key-transposer" class="bg-black text-white text-xs font-black outline-none cursor-pointer font-mono border-none py-0.5">
                                    <option value="0">Original Key</option>
                                    <option value="1">key +1</option><option value="2">key +2</option><option value="3">key +3</option>
                                    <option value="4">key +4</option><option value="5">key +5</option><option value="6">key +6</option>
                                    <option value="-1">key -1</option><option value="-2">key -2</option><option value="-3">key -3</option>
                                    <option value="-4">key -4</option><option value="-5">key -5</option><option value="-6">key -6</option>
                                </select>
                            </div>
                        </div>
                        <div class="p-4">
                            <div id="chords-viewport" class="max-h-[400px] overflow-y-auto overflow-x-auto space-y-4 pr-1 font-mono text-sm custom-scrollbar"></div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[480px]">
                        <div class="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center min-h-[58px]">
                            <h2 class="text-base font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-2 m-0 self-center">
                                <i class="fa-solid fa-bullhorn"></i> ${t.callsTitle}
                            </h2>
                        </div>
                        <div class="bg-slate-100/70 dark:bg-slate-950/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold items-center shadow-inner">
                            <div class="text-[10px] uppercase tracking-wider font-black text-slate-400 mr-1">${t.legendTitle}</div>
                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-sky-500 border border-sky-600"></span> <span class="text-slate-600 dark:text-slate-400">${t.legendLyrics}</span></div>
                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-600"></span> <span class="text-slate-600 dark:text-slate-400">${t.legendCall}</span></div>
                            <div class="flex items-center gap-1.5">
                                <span class="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-600"></span> 
                                <span class="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                    ${t.legendAction} 
                                    <span class="relative group cursor-help text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                        (Guide)
                                        <span class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:inline-block bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-normal rounded p-2 shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700/30">
                                            ${t.callGuideText}
                                        </span>
                                    </span>
                                </span>
                            </div>
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-slate-600 dark:text-slate-400 font-bold">${t.legendPenlight}:</span>
                                <div id="legend-penlight-colors" class="flex gap-1"></div>
                            </div>
                        </div>
                        <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div id="calls-viewport" class="space-y-3 pr-1 text-sm"></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden lg:sticky lg:top-4">
                    <div class="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 min-h-[96px]">
                        <h2 class="text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 m-0 min-w-0 self-center">
                            <i class="fa-solid fa-language shrink-0"></i> 
                            <span class="truncate">${t.lyricsTitle}</span>
                        </h2>
                        <div class="flex flex-col items-center gap-1.5 shrink-0 self-center min-w-[325px]">
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

        // Attach event listeners for the dropdown
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

        // Restore active selection key
        const keyTransposer = document.getElementById("key-transposer");
        if (keyTransposer) {
            keyTransposer.value = currentKeyShift;
            keyTransposer.addEventListener("change", (e) => {
                currentKeyShift = parseInt(e.target.value);
                renderChords();
            });
        }

        // Global Loop Switcher
        document.getElementById("toggle-global-lang").onclick = () => {
            if (globalLanguage === "en") globalLanguage = "zh";
            else if (globalLanguage === "zh") globalLanguage = "ja";
            else globalLanguage = "en";
            localStorage.setItem("se_global_lang", globalLanguage);
            renderAppLayout();
        };

        setupWorkspaceToggles();
        renderChords();
        renderCalls();
        renderLyricsWorkspace();
    }

    function renderChords() {
        const container = document.getElementById("chords-viewport");
        container.innerHTML = "";
        if (!songData.chords) return;

        songData.chords.forEach(sec => {
            let sectionBlock = document.createElement("div");
            sectionBlock.className = "mb-5 last:mb-0 bg-slate-50/70 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 space-y-2";
            sectionBlock.innerHTML = `<div class="text-[10px] font-black uppercase tracking-widest text-sky-500 border-b border-sky-500/10 pb-0.5 mb-1 inline-block">${sec.section}</div>`;

            sec.lines.forEach(line => {
                let lineRow = document.createElement("div");
                lineRow.className = "flex flex-col tracking-wide leading-relaxed py-0.5 overflow-x-auto whitespace-pre";

                if (line.c) {
                    let transposedChords = transposeLine(line.c, currentKeyShift);
                    let chordSpan = document.createElement("div");
                    chordSpan.className = "text-xs font-black text-pink-500 select-none min-h-[1.25rem]";
                    chordSpan.textContent = transposedChords;
                    lineRow.appendChild(chordSpan);
                }

                if (line.t) {
                    let textSpan = document.createElement("div");
                    // Overridden to always render layout text elements as clean blue segments in chords section
                    textSpan.className = "text-base font-medium text-sky-600 dark:text-sky-400";
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
            row1.className = "text-sm font-medium text-sky-600 dark:text-sky-400 leading-normal";
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

    function renderLyricsWorkspace() {
        const container = document.getElementById("lyrics-viewport");
        container.innerHTML = "";
        if (!songData.lyrics) return;

        songData.lyrics.forEach(line => {
            let translation = lyricsLanguage === "en" ? line.en : line.zh;
            let notesHtml = "";

            if (notesActive && line.notes && line.notes.length > 0) {
                let noteItems = line.notes.map(n => `
                    <div class="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-xs shadow-inner">
                        <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-[12px]">${n.word}</strong>
                        <span class="mx-1 text-slate-300 dark:text-slate-700">|</span>
                        <span class="text-slate-600 dark:text-slate-400">${n.meaning}</span>
                    </div>
                `).join("");
                notesHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">${noteItems}</div>`;
            }

            // Forced to clean white configuration styling rules across all screens
            let lyricStyle = "text-white dark:text-white";

            let lineBlock = document.createElement("div");
            lineBlock.className = "bg-slate-50/40 dark:bg-slate-950/10 p-3.5 rounded-lg border border-slate-100 dark:border-slate-900/50 space-y-1 shadow-sm";
            lineBlock.innerHTML = `
                <p class="text-base font-bold tracking-wide ${lyricStyle}">${line.ja}</p>
                <p class="text-xs font-mono text-sky-600 dark:text-sky-400 tracking-wider ${romajiActive ? '' : 'hidden'}">${line.romaji}</p>
                <p class="text-[13px] text-slate-400 dark:text-slate-400 font-medium leading-relaxed border-l-2 border-slate-500 dark:border-slate-700 pl-2 italic">“ ${translation} ”</p>
                ${notesHtml}
            `;
            container.appendChild(lineBlock);
        });
    }

    function setupWorkspaceToggles() {
        const btnRomaji = document.getElementById("toggle-romaji");
        const btnNotes = document.getElementById("toggle-notes");
        const btnLang = document.getElementById("toggle-language");

        const styleActive = "w-full py-0.5 text-[11px] font-black rounded transition-all cursor-pointer bg-slate-800 text-white border border-transparent";
        const styleInactive = "w-full py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer bg-transparent text-slate-500 border border-transparent";

        let rOn = "Romaji On", rOff = "Romaji Off", nOn = "Notes On", nOff = "Notes Off";
        if (globalLanguage === "zh") {
            rOn = "羅馬字 開"; rOff = "羅馬字 關"; nOn = "註解 開"; nOff = "註解 關";
        } else if (globalLanguage === "ja") {
            rOn = "ローマ字 表示"; rOff = "ローマ字 非表示"; nOn = "解説 表示"; nOff = "解説 非表示";
        }

        btnRomaji.innerText = romajiActive ? rOn : rOff;
        btnRomaji.className = romajiActive ? styleActive : styleInactive;

        btnNotes.innerText = notesActive ? nOn : nOff;
        btnNotes.className = notesActive ? styleActive : styleInactive;

        btnLang.innerText = lyricsLanguage === "en" ? "English" : "繁體中文";
        btnLang.className = "w-full py-0.5 text-[11px] font-black rounded transition-all cursor-pointer bg-slate-800 text-white border border-transparent";

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