# 🎵 Songs Database

<div id="dashboard-app-root" class="w-full clear-both block my-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 min-h-[150px]">

    <!-- Table -->
    <table id="songs-dashboard-table" style="display: table !important; width: 100% !important; table-layout: fixed;" ...>      <thead>
            <tr class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                <th class="p-4 w-24 text-center">Cover</th>
                <th onclick="sortSongsTable(1)" class="p-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 select-none transition-colors whitespace-nowrap" style="text-align: center !important;">Song Title <i class="fa-solid fa-sort ml-1.5 text-slate-400 text-xs"></i></th>
                <th onclick="sortSongsTable(2)" class="p-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 select-none transition-colors whitespace-nowrap" style="text-align: center !important;">Album <i class="fa-solid fa-sort ml-1.5 text-slate-400 text-xs"></i></th>
                <th onclick="sortSongsTable(3)" class="p-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 select-none transition-colors whitespace-nowrap" style="text-align: center !important;">Release Date <i class="fa-solid fa-sort ml-1.5 text-slate-400 text-xs"></i></th>
            </tr>
        </thead>
        <tbody id="dashboard-table-body" class="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200"></tbody>
    </table>
</div>

<script>
let allSongs = []; // Store full data here

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("dashboard-table-body");
    const searchInput = document.getElementById("song-search");

    fetch('/data/song_list.json') 
        .then(response => response.json())
        .then(data => {
            allSongs = data;
            renderTable(allSongs);
        });

    // Filtering logic
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allSongs.filter(song => 
            song.title.toLowerCase().includes(query) || 
            song.album.toLowerCase().includes(query)
        );
        renderTable(filtered);
    });

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
});
</script>