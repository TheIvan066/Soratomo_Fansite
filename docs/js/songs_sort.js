let sortDirections = [true, true, true, true];
let allSongs = []; // Global storage for filtering

function sortSongsTable(columnIndex) {
    const table = document.getElementById("songs-dashboard-table");
    const tbody = document.getElementById("dashboard-table-body");
    if (!table || !tbody) return;

    const rows = Array.from(tbody.getElementsByTagName("tr"));
    if (rows.length <= 1) return;

    const ascending = sortDirections[columnIndex];
    sortDirections[columnIndex] = !ascending;

    rows.sort((rowA, rowB) => {
        let cellA = rowA.getElementsByTagName("td")[columnIndex]?.innerText.trim() || "";
        let cellB = rowB.getElementsByTagName("td")[columnIndex]?.innerText.trim() || "";

        return ascending
            ? cellA.localeCompare(cellB, undefined, { numeric: true, sensitivity: "base" })
            : cellB.localeCompare(cellA, undefined, { numeric: true, sensitivity: "base" });
    });

    rows.forEach(row => tbody.appendChild(row));
}

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("dashboard-table-body");
    const searchInput = document.getElementById("song-search");

    // Fetch data and store it
    fetch('/docs/songs_manifest.json')
        .then(res => res.json())
        .then(data => {
            allSongs = data;
            renderTable(allSongs);
        });

    // Search event listener
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allSongs.filter(song => {
            // Combine all fields into one searchable string
            const searchString = `${song.title} ${song.artist} ${song.composer} ${song.lyrics}`.toLowerCase();
            return searchString.includes(query);
        });
        const searchWrapper = document.getElementById('search-wrapper');
        if (searchWrapper) {
            // Use setProperty with !important to override theme CSS
            searchWrapper.style.setProperty('display', 'flex', 'important');
            searchWrapper.style.setProperty('justify-content', 'flex-end', 'important');
            searchWrapper.style.setProperty('width', '100%', 'important');
        }
        renderTable(filtered);
    });

    function renderTable(songs) {
    tbody.innerHTML = "";
    songs.forEach(song => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors";

        tr.innerHTML = `
            <!-- Applied padding: 1px and tightened width to 66px (64px image + 1px padding on each side) -->
            <td style="padding: 1px !important; text-align: center !important; vertical-align: middle !important; width: 66px !important; max-width: 66px !important">
                <img src="${song.coverUrl}" 
                    alt="${song.title} Cover" 
                    style="width: 64px !important; height: 64px !important; object-fit: cover !important; display: block !important; margin: auto !important;">
            </td>
            <!-- ... rest of your code ... -->
        `;
        tbody.appendChild(tr);
    });
}
});