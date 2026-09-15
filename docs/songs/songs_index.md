# 🎵 Songs Database

<div id="dashboard-app-root" class="w-full clear-both block my-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 min-h-[150px]">

    <!-- Table -->
    <table id="songs-dashboard-table" style="display: table !important; width: 100% !important; table-layout: fixed;">
        <thead>
            <tr class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                <th class="p-4 w-24 text-center font-bold" style="text-align: center !important;">Cover</th>
                <th onclick="sortSongsTable('title')" class="p-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 select-none transition-colors whitespace-nowrap font-bold" style="text-align: center !important;">Song Title <i class="fa-solid fa-sort ml-1.5 text-slate-400 text-xs"></i></th>
                <th onclick="sortSongsTable('album')" class="p-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 select-none transition-colors whitespace-nowrap font-bold" style="text-align: center !important;">Album <i class="fa-solid fa-sort ml-1.5 text-slate-400 text-xs"></i></th>
                <th onclick="sortSongsTable('releaseDate')" class="p-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 select-none transition-colors whitespace-nowrap font-bold" style="text-align: center !important;">Release Date <i class="fa-solid fa-sort ml-1.5 text-slate-400 text-xs"></i></th>
            </tr>
        </thead>
        <tbody id="dashboard-table-body" class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200"></tbody>
    </table>
</div>

<script>
let allSongs = [];
let currentFilteredSongs = [];
let albumNewestDates = {}; // Cache to store each album's newest release date
let currentSortKey = 'album'; 
let sortAscending = true; // Default: oldest to newest

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("dashboard-table-body");
    const searchInput = document.getElementById("song-search");

    fetch('/data/song_list.json') 
        .then(response => response.json())
        .then(data => {
            allSongs = data;
            calculateAlbumNewestDates(allSongs);
            currentFilteredSongs = [...allSongs];
            
            // Initial render sorted by album (oldest to newest album based on their newest track)
            sortData('album', true);
        });

    // Calculate the latest release date for each album across the dataset
    function calculateAlbumNewestDates(songs) {
        albumNewestDates = {};
        songs.forEach(song => {
            const albumName = song.album || "Unknown Album";
            const songDate = new Date(song.releaseDate).getTime();

            if (!albumNewestDates[albumName] || songDate > albumNewestDates[albumName]) {
                albumNewestDates[albumName] = songDate;
            }
        });
    }

    // Filtering logic
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            currentFilteredSongs = allSongs.filter(song => 
                song.title.toLowerCase().includes(query) || 
                song.album.toLowerCase().includes(query)
            );
            applyCurrentSortAndRender();
        });
    }

    function renderTable(songs) {
        tbody.innerHTML = "";
        songs.forEach(song => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors";
            tr.innerHTML = `
                <td class="p-3" style="text-align: center !important; vertical-align: middle !important; display: table-cell !important; width: 64px !important; min-width: 64px !important;">
                    <img src="${song.coverUrl}" style="width: 96px !important; height: 96px !important;" class="rounded-lg object-cover border border-slate-200 dark:border-slate-700 mx-auto shadow-sm">
                </td>
                <td class="p-4 font-black" style="text-align: center !important; vertical-align: middle !important; display: table-cell !important;">
                    <a href="${song.slug}" class="text-sky-600 dark:text-sky-400 hover:underline flex items-center justify-center gap-2">${song.title}</a>
                </td>
                <td class="p-4 font-medium text-slate-500 dark:text-slate-400" style="text-align: center !important; vertical-align: middle !important; display: table-cell !important;">${song.album}</td>
                <td class="p-4 font-mono text-xs tracking-wider text-slate-500" style="text-align: center !important; vertical-align: middle !important; display: table-cell !important;">${song.releaseDate}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Global sorting handler bound to table headers
    window.sortSongsTable = function(key) {
        if (currentSortKey === key) {
            sortAscending = !sortAscending; // Toggle ascending/descending
        } else {
            currentSortKey = key;
            sortAscending = true; // Default to ascending when selecting a new header
        }
        sortData(currentSortKey, sortAscending);
    };

    function sortData(key, asc) {
        currentFilteredSongs.sort((a, b) => {
            if (key === 'album') {
                const dateA = albumNewestDates[a.album] || 0;
                const dateB = albumNewestDates[b.album] || 0;

                // Sort albums based on their newest track's release date
                if (dateA !== dateB) {
                    return asc ? dateA - dateB : dateB - dateA;
                }
                // Fallback secondary sort: alphabetical album name
                return a.album.localeCompare(b.album);
            }

            let valA = a[key] || '';
            let valB = b[key] || '';

            if (key === 'releaseDate') {
                valA = new Date(valA);
                valB = new Date(valB);
            } else {
                valA = valA.toString().toLowerCase();
                valB = valB.toString().toLowerCase();
            }

            if (valA < valB) return asc ? -1 : 1;
            if (valA > valB) return asc ? 1 : -1;
            return 0;
        });

        renderTable(currentFilteredSongs);
    }

    function applyCurrentSortAndRender() {
        sortData(currentSortKey, sortAscending);
    }
});
</script>