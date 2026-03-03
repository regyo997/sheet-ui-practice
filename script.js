const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1rLNBWb_kXwvv7JOgjKy6WPLDysBZPrEM5GlP1t57xFE/export?format=csv&gid=0';

let allData = [];
let currentPage = 0;
const ITEMS_PER_PAGE = 9;
const PAGE_SWITCH_INTERVAL = 10000; // 10 seconds

// Initialize
function init() {
    updateClock();
    setInterval(updateClock, 1000);

    fetchData();
    // Refresh data every 1 minute
    setInterval(fetchData, 60000);

    // Page rotation
    setInterval(() => {
        if (allData.length > ITEMS_PER_PAGE) {
            currentPage = (currentPage + 1) % Math.ceil(allData.length / ITEMS_PER_PAGE);
            renderPage();
        }
    }, PAGE_SWITCH_INTERVAL);
}

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${h}:${m}:${s}`;
}

async function fetchData() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = parseCSV(csvText);

        // Filter: 顯示/隱藏 must be TRUE
        allData = rows.filter(row => row.display === 'TRUE');

        renderPage();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        // Simple CSV split, handling potential commas in values if necessary
        // But for this simple sheet, splitting by comma is likely enough
        const values = line.split(',').map(v => v.trim());
        const entry = {};

        // Mapping based on provided headers:
        // 梯次編號, 名稱, 起, 訖, 可報名人數, 已報名人數, 可遞補人數, 顯示/隱藏
        entry.id = values[0];
        entry.name = values[1];
        entry.startTime = values[2];
        entry.endTime = values[3];
        entry.maxCapacity = values[4];
        entry.registered = values[5];
        entry.waiting = values[6];
        entry.display = values[7];

        return entry;
    });
}

function renderPage() {
    const gridMain = document.getElementById('grid-main');
    gridMain.innerHTML = '';

    const startIdx = currentPage * ITEMS_PER_PAGE;
    const pageItems = allData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    pageItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="card-header">
                <h2 class="card-title">${item.name}</h2>
                <div class="badge-circle">${item.id}</div>
            </div>
            <div class="stats-row">
                <div class="stat-item">
                    <div class="stat-label">可報名人數</div>
                    <div class="stat-value blue">${item.maxCapacity}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">已報名人數</div>
                    <div class="stat-value navy">${item.registered}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">可遞補人數</div>
                    <div class="stat-value green">${item.waiting}</div>
                </div>
            </div>
        `;

        gridMain.appendChild(card);
    });

    // If less than 9 items, add placeholders to keep 3x3 structure if desired,
    // or just let it be. Usually 3x3 looks better filled.
}

init();
