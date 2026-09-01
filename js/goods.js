const TAG_COLORS = {
    event: { bg: '#e0dfff', text: '#000000', group: 'event' },
    character: { bg: '#fac462', text: '#000000', group: 'character' },
    item: { bg: '#475569', text: '#ffffff', group: 'item' },
    comiket: { bg: '#e0dfff', text: '#000000', group: 'comiket' },
    anniversary: { bg: '#266AFF', text: '#ffffff', group: 'anniversary' },
    birthday: { bg: '#ff3391', text: '#ffffff', group: 'birthday' }
};

function getTagConfig(tag) {
    const t = tag.trim().toLowerCase();
    if (/^c(9[5-9]|10[0-8])$/i.test(t) || t === 'comiket') return { ...TAG_COLORS.comiket };
    if (/^([4-9]|10)th_anniversary$/i.test(t) || t === 'anniversary') return { ...TAG_COLORS.anniversary };
    if (/^birthday_20(19|2[0-6])$/i.test(t) || t === 'birthday') return { ...TAG_COLORS.birthday};
    if (t === "holo_fes") return {bg: '#5edbed', text: '#000000', group: 'event' };
    if (t === "album_release") return {bg: '#9926ff', text: '#000000', group: 'event' };

    if (t === "ankimo") return {bg: '#fac462', text: '#000000', group: "character"};
    if (t === "nunnun") return {bg: '#ffffff', text: '#000000', group: "character"};
    if (t === "multiple_talents") return {bg: '#ff00ff', text: '#ffffff', group: "character"};

    const itemColors = {
        "signed": {bg: '#dc9d00', text: '#000000'},
        "cards_postcards": { bg: '#f87171', text: '#000000' },
        "stickers": { bg: '#fb923c', text: '#000000' },
        "button_badges": { bg: '#facc15', text: '#000000' },
        "keyholders": { bg: '#4ade80', text: '#000000' },
        "acrylic_stands": { bg: '#2dd4bf', text: '#000000' },
        "figures": { bg: '#38bdf8', text: '#000000' },
        "clothings": { bg: '#818cf8', text: '#ffffff' },
        "clothing": { bg: '#818cf8', text: '#ffffff' },
        "accessories": { bg: '#c084fc', text: '#ffffff' },
        "caps_hats": { bg: '#f472b6', text: '#000000' },
        "bags_backpacks": { bg: '#fb7185', text: '#000000' },
        "pouches": { bg: '#a3e635', text: '#000000' },
        "cups": { bg: '#34d399', text: '#000000' },
        "badges": { bg: '#eab308', text: '#000000' },
        "tapestries": { bg: '#60a5fa', text: '#000000' },
        "penlights": { bg: '#a78bfa', text: '#ffffff' },
        "plushies": { bg: '#f43f5e', text: '#ffffff' },
        "cushions_body pillows": { bg: '#14b8a6', text: '#000000' },
        "tcg_related": { bg: '#d946ef', text: '#ffffff' },
        "voice_tracks": { bg: '#a3f6f5', text: '#000000' },
        "cd_dvd": { bg: '#f3e635', text: '#000000' },
        "files": { bg: '#affff0', text: '#000000' },
        "acrylic_panels": { bg: '#57A639', text: '#ffffff' },
        "books": { bg: '#231A24', text: '#ffffff' },
        "art": { bg: '#3c7c71', text: '#ffffff' },
        "others": { bg: '#94a3b8', text: '#000000' }
    };
    return itemColors[t] || { ...TAG_COLORS.item };
}

const ALL_TAGS = [
    'comiket', 'c95', 'c96', 'c97', 'c98', 'c99', 'c100', 'c101', 'c102', 'c103', 'c104', 'c105', 'c106', 'c107', 'c108',
    'anniversary', '4th_anniversary', '5th_anniversary', '6th_anniversary', '7th_anniversary', '8th_anniversary', '9th_anniversary', '10th_anniversary',
    'birthday', 'birthday_2019', 'birthday_2020', 'birthday_2021', 'birthday_2022', 'birthday_2023', 'birthday_2024', 'birthday_2025', 'birthday_2026',
    'holo_fes','album_release',
    'signed','cards_postcards', 'stickers', 'button_badges', 'keyholders', 'acrylic_stands', 'figures', 'clothings', 'accessories', 'caps_hats', 'bags_backpacks', 'pouches', 'cups', 'badges', 'tapestries', 'penlights', 'plushies', 'cushions_body pillows', 'tcg_related', 'voice_tracks', 'cd_dvd', 'files', 'acrylic_panels', 'books', 'art', 'others',
    'ankimo', 'nunnun', 'multiple_talents'
];

// 🌐 TRANSLATION DICTIONARY
const goodsDict = {
    'en': {
        title: 'Merch Directory',
        header_name: 'Name',
        header_pic: 'Image',
        header_tags: 'Tags',
        header_date: 'Release Date',
        header_src: 'Source',
        smode_any:'Match Any',
        smode_all:'Match All',
        smode_exclude:'Exclude Selected',
        mode:'Filter Mode',
        events:'Event',
        items:'Item Type',
        chars:'Character',
        link:'Link',
        tags: {
            'comiket': 'Comiket',
            'c95': 'C95',
            'c96': 'C96',
            'c97': 'C97',
            'c98': 'C98',
            'c99': 'C99',
            'c100': 'C100',
            'c101': 'C101',
            'c102': 'C102',
            'c103': 'C103',
            'c104': 'C104',
            'c105': 'C105',
            'c106': 'C106',
            'c107': 'C107',
            'c108': 'C108',

            'anniversary': 'Anniversary',
            '4th_anniversary': '4th Anniversary',
            '5th_anniversary': '5th Anniversary',
            '6th_anniversary': '6th Anniversary',
            '7th_anniversary': '7th Anniversary',
            '8th_anniversary': '8th Anniversary',
            '9th_anniversary': '9th Anniversary',
            '10th_anniversary': '10th Anniversary',

            'birthday': 'Birthday',
            'birthday_2019': 'Birthday 2019',
            'birthday_2020': 'Birthday 2020',
            'birthday_2021': 'Birthday 2021',
            'birthday_2022': 'Birthday 2022',
            'birthday_2023': 'Birthday 2023',
            'birthday_2024': 'Birthday 2024',
            'birthday_2025': 'Birthday 2025',
            'birthday_2026': 'Birthday 2026',

            'holo_fes': 'Holo Fes',
            'album_release': 'Album Release',

            'signed': 'Signed',
            'cards_postcards': 'Cards / Postcards',
            'stickers': 'Stickers',
            'button_badges': 'Button Badges',
            'keyholders': 'Keyholders',
            'acrylic_stands': 'Acrylic Stands',
            'figures': 'Figures',
            'clothings': 'Clothings',
            'accessories': 'Accessories',
            'caps_hats': 'Caps / Hats',
            'bags_backpacks': 'Bags / Backpacks',
            'pouches': 'Pouches',
            'cups': 'Cups',
            'badges': 'Badges',
            'tapestries': 'Tapestries',
            'penlights': 'Penlights',
            'plushies': 'Plushies',
            'cushions_body pillows': 'Cushions / Body Pillows',
            'tcg_related': 'TCG Related',
            'voice_tracks': 'Voice Tracks',
            'cd_dvd': 'CD / DVD',
            'files': 'Files',
            'acrylic_panels': 'Acrylic Panels',
            'books': 'Book Covers / Bookmarks',
            'art': 'Art Panels / Canvas Boards',
            'others': 'Others',

            'ankimo': 'Ankimo',
            'nunnun': 'Nunnun(๑╹ᆺ╹)',
            'multiple_talents': 'Multiple Talents'
        }
    },

    'ja': {
        title: 'グッズディレクトリ',
        header_name: 'グッズ',
        header_pic: 'イメージ',
        header_tags: 'タグ',
        header_date: '発売日',
        header_src: 'リンク',
        smode_any:'いずれか一致',
        smode_all:'すべて一致',
        smode_exclude:'選択済みを除外',
        mode:'検索モード',
        events:'イベント',
        items:'種類',
        chars:'キャラ',
        link:'リンク',
        tags: {
            'comiket': 'コミケ',
            'c95': 'C95',
            'c96': 'C96',
            'c97': 'C97',
            'c98': 'C98',
            'c99': 'C99',
            'c100': 'C100',
            'c101': 'C101',
            'c102': 'C102',
            'c103': 'C103',
            'c104': 'C104',
            'c105': 'C105',
            'c106': 'C106',
            'c107': 'C107',
            'c108': 'C108',

            'anniversary': '周年記念',
            '4th_anniversary': '4周年記念',
            '5th_anniversary': '5周年記念',
            '6th_anniversary': '6周年記念',
            '7th_anniversary': '7周年記念',
            '8th_anniversary': '8周年記念',
            '9th_anniversary': '9周年記念',
            '10th_anniversary': '10周年記念',

            'birthday': '誕生日',
            'birthday_2019': '誕生日 2019',
            'birthday_2020': '誕生日 2020',
            'birthday_2021': '誕生日 2021',
            'birthday_2022': '誕生日 2022',
            'birthday_2023': '誕生日 2023',
            'birthday_2024': '誕生日 2024',
            'birthday_2025': '誕生日 2025',
            'birthday_2026': '誕生日 2026',

            'holo_fes': 'Holo Fes',
            'album_release': 'アルバムリリース',

            'signed': 'サイン入り',
            'cards_postcards': 'カード / ポストカード',
            'stickers': 'ステッカー',
            'button_badges': '缶バッジ',
            'keyholders': 'キーホルダー',
            'acrylic_stands': 'アクリルスタンド',
            'figures': 'フィギュア',
            'clothings': '衣類',
            'accessories': 'アクセサリー',
            'caps_hats': 'キャップ / 帽子',
            'bags_backpacks': 'バッグ / リュック',
            'pouches': 'ポーチ',
            'cups': 'カップ',
            'badges': 'バッジ',
            'tapestries': 'タペストリー',
            'penlights': 'ペンライト',
            'plushies': 'ぬいぐるみ',
            'cushions_body pillows': 'クッション / 抱き枕',
            'tcg_related': 'TCG関連',
            'voice_tracks': 'ボイス',
            'cd_dvd': 'CD / DVD',
            'files': 'ファイル',
            'acrylic_panels': 'アクリルパネル',
            'books': 'ブックカバー / しおり',
            'art': '複製原画',
            'others': 'その他',

            'ankimo': 'あん肝',
            'nunnun': 'ぬんぬん(๑╹ᆺ╹)',
            'multiple_talents': '複数タレント'
        }
    },

    'zh': {
        title: '周邊目錄',
        header_name: '周邊',
        header_pic: '圖片',
        header_tags: '標籤',
        header_date: '發售日',
        header_src: '連結',
        smode_any:'符合任一',
        smode_all:'符合全部',
        smode_exclude:'排除所選',
        mode:'捜尋模式',
        events:'活動',
        items:'種類',
        chars:'角色',
        link:'連結',
        tags: {
            'comiket': 'Comiket',
            'c95': 'C95',
            'c96': 'C96',
            'c97': 'C97',
            'c98': 'C98',
            'c99': 'C99',
            'c100': 'C100',
            'c101': 'C101',
            'c102': 'C102',
            'c103': 'C103',
            'c104': 'C104',
            'c105': 'C105',
            'c106': 'C106',
            'c107': 'C107',
            'c108': 'C108',

            'anniversary': '週年紀念',
            '4th_anniversary': '4週年紀念',
            '5th_anniversary': '5週年紀念',
            '6th_anniversary': '6週年紀念',
            '7th_anniversary': '7週年紀念',
            '8th_anniversary': '8週年紀念',
            '9th_anniversary': '9週年紀念',
            '10th_anniversary': '10週年紀念',

            'birthday': '生日',
            'birthday_2019': '生日 2019',
            'birthday_2020': '生日 2020',
            'birthday_2021': '生日 2021',
            'birthday_2022': '生日 2022',
            'birthday_2023': '生日 2023',
            'birthday_2024': '生日 2024',
            'birthday_2025': '生日 2025',
            'birthday_2026': '生日 2026',

            'holo_fes': 'Holo Fes',
            'album_release': '剪輯發售',

            'signed': '簽名',
            'cards_postcards': '卡片 / 明信片',
            'stickers': '貼紙',
            'button_badges': '襟章',
            'keyholders': '鑰匙圈',
            'acrylic_stands': '立牌',
            'figures': '模型',
            'clothings': '服飾',
            'accessories': '飾品',
            'caps_hats': '帽',
            'bags_backpacks': '袋 / 背包',
            'pouches': '小包',
            'cups': '杯',
            'badges': '徽章',
            'tapestries': '掛軸',
            'penlights': '應援棒',
            'plushies': '玩偶',
            'cushions_body pillows': '抱枕',
            'tcg_related': '卡牌遊戲相關',
            'voice_tracks': '音聲',
            'cd_dvd': 'CD / DVD',
            'files': '文件夾',
            'acrylic_panels': '亞克力板',
            'books': '書套 / 書簽',
            'art': '複製原畫',
            'others': '其他',

            'ankimo': 'Ankimo',
            'nunnun': 'Nunnun(๑╹ᆺ╹)',
            'multiple_talents': '多位藝人'
        }
    }
};


// ==========================================
// ⚙️ STATE & INITIALIZATION
// ==========================================
let goodsInventory = [];
let goodsActiveLanguage = 'en';
let selectedFilterTags = new Set();
let goodsSearchMode = 'ANY';
let goodsSortingDirection = [true, true, true, false];

document.addEventListener("DOMContentLoaded", startGoodsEngine);

function startGoodsEngine() {
    if (!document.getElementById("goods-app-root")) return;
    fetch('/data/goods.json')
        .then(res => res.json())
        .then(data => {
            goodsInventory = data;
            updateUI();
            renderTagSearchCloud();
            renderGoodsLedgerTable();
        });
}

// ==========================================
// 🌍 UI UPDATER
// ==========================================
function updateUI() {
    const d = goodsDict[goodsActiveLanguage];
    document.getElementById('ui-title').innerHTML = `${d.title}`;
    document.getElementById('ui-mode-label').innerText = `${d.mode}:`;
    document.getElementById('mode-btn-ANY').innerText = d.smode_any;
    document.getElementById('mode-btn-ALL').innerText = d.smode_all;
    document.getElementById('mode-btn-EXCLUDE').innerText = d.smode_exclude;
    document.getElementById('ui-label-events').innerText = d.events;
    document.getElementById('ui-label-items').innerText = d.items;
    document.getElementById('ui-label-chars').innerText = d.chars;
    document.getElementById('th-name').innerHTML = `${d.header_name} ▼`;
    document.getElementById('th-pic').innerText = d.header_pic;
    document.getElementById('th-tags').innerText = d.header_tags;
    document.getElementById('th-date').innerHTML = `${d.header_date} ▼`;
    document.getElementById('th-src').innerText = d.header_src;
}

function selectGoodsLanguage(lang) {
    goodsActiveLanguage = lang;
    ['en', 'ja', 'zh'].forEach(l => {
        const btn = document.getElementById(`lang-btn-${l}`);
        if (!btn) return;
        btn.style.backgroundColor = (l === lang) ? 'white' : 'transparent';
        btn.style.color = (l === lang) ? 'black' : '#9ca3af';
    });
    updateUI();
    renderTagSearchCloud();
    renderGoodsLedgerTable();
}

function setSearchMode(mode) {
    goodsSearchMode = mode;
    ['ANY', 'ALL', 'EXCLUDE'].forEach(m => {
        const btn = document.getElementById(`mode-btn-${m}`);
        if (!btn) return;
        btn.style.backgroundColor = (m === mode) ? 'white' : 'transparent';
        btn.style.color = (m === mode) ? 'black' : '#9ca3af';
    });
    renderGoodsLedgerTable();
}

function toggleSelectTag(tagKey) {
    if (selectedFilterTags.has(tagKey)) selectedFilterTags.delete(tagKey);
    else selectedFilterTags.add(tagKey);
    renderTagSearchCloud();
    renderGoodsLedgerTable();
}

function getLocalizedName(item) {
    return (item.name && (item.name[goodsActiveLanguage] || item.name['en'])) || 'Unknown Item';
}

// 🏷️ RENDER ENGINE
function getLocalizedTag(tag) {
    return goodsDict[goodsActiveLanguage].tags?.[tag.toLowerCase()] || tag;
}

function renderTagSearchCloud() {
  const containers = {
        event: document.getElementById("goods-tags-event"),
        character: document.getElementById("goods-tags-character"),
        item: document.getElementById("goods-tags-item")
    };
    Object.values(containers).forEach(c => { if(c) c.innerHTML = ""; });

    ALL_TAGS.forEach(tagKey => {
        const conf = getTagConfig(tagKey);
        const btn = document.createElement("button");
        btn.innerText = getLocalizedTag(tagKey);
        btn.onclick = () => toggleSelectTag(tagKey);
        btn.style.cssText = `background-color: ${conf.bg}; color: ${conf.text}; border: ${selectedFilterTags.has(tagKey) ? '2px solid white' : '1px solid transparent'}; border-radius: 0.25rem; padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; white-space: nowrap;`;

        if (conf.group === 'event'|| ['comiket', 'anniversary', 'birthday'].includes(conf.group)) {
            containers.event?.appendChild(btn);
        } else if (conf.group === 'character') {
            containers.character?.appendChild(btn);
        } else {
            containers.item?.appendChild(btn);
        }
    });
}

function renderGoodsLedgerTable() {
   const tbody = document.getElementById("goods-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const activeFilters = Array.from(selectedFilterTags).flatMap(s => {
        const conf = getTagConfig(s);
        if (['comiket', 'anniversary', 'birthday'].includes(s)) {
            return ALL_TAGS.filter(t => getTagConfig(t).group === s);
        }
        return s;
    });

    let filteredList = goodsInventory.filter(item => {
        if (selectedFilterTags.size === 0) return true;
        const matches = item.tags?.filter(t => activeFilters.includes(t)) || [];
        if (goodsSearchMode === 'ANY') return matches.length > 0;
        if (goodsSearchMode === 'ALL') return selectedFilterTags.size === 0 || activeFilters.every(f => item.tags?.includes(f));
        return matches.length === 0;
    });

    filteredList.forEach(item => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #374151";

        const tagsHtml = (item.tags || []).map(t => `<span style="background:${getTagConfig(t).bg}; color:${getTagConfig(t).text}; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 700; white-space: nowrap;">${getLocalizedTag(t)}</span>`).join("");

        tr.innerHTML = `
            <td style="padding: 1rem; font-weight: 700; color: white;">${getLocalizedName(item)}</td>
            <td style="text-align: center;"><img src="${item.pictureUrl || ''}" style="max-width: 96px; max-height: 128px; border-radius: 0.5rem; object-fit: cover; border: 1px solid #374151;"></td>
            <td style="padding: 1rem;"><div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">${tagsHtml}</div></td>
            <td style="padding: 1rem; font-size: 0.85rem; color: #9ca3af;">${item.releaseDate || 'TBD'}</td>
            <td style="text-align: center; vertical-align: middle;">
                <a href="${item.originalUrl || '#'}" target="_blank" 
                   style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.4rem 0.6rem; border-radius: 0.5rem; background: #030712; color: #d1d5db; border: 1px solid #374151; text-decoration: none; font-size: 0.7rem; font-weight: 700; line-height: 1.2;">
                    <span>${goodsDict[goodsActiveLanguage].link}↗</span>
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function sortGoodsTable(columnIndex) {
    const tbody = document.getElementById("goods-table-body");
    const rows = Array.from(tbody.getElementsByTagName("tr"));
    const ascending = goodsSortingDirection[columnIndex];
    goodsSortingDirection[columnIndex] = !ascending;
    rows.sort((a, b) => {
        let vA = a.cells[columnIndex].innerText.trim();
        let vB = b.cells[columnIndex].innerText.trim();
        return ascending ? vA.localeCompare(vB) : vB.localeCompare(vA);
    });
    rows.forEach(row => tbody.appendChild(row));
}