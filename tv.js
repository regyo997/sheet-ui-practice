const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1rLNBWb_kXwvv7JOgjKy6WPLDysBZPrEM5GlP1t57xFE/export?format=csv&gid=0';

let allData = [];
let currentPage = 0;
const ITEMS_PER_PAGE = 10;
const PAGE_SWITCH_INTERVAL = 10000; // 10 seconds

// Test data for Dev Mode (?env=dev)
const DEV_DATA = [
    { id: '1', name: '第一梯次 (DEV)', startTime: '0800', endTime: '0830', maxCapacity: '55', registered: '50', waiting: '5', display: 'TRUE' },
    { id: '2', name: '第二梯次 (DEV)', startTime: '0830', endTime: '0900', maxCapacity: '40', registered: '38', waiting: '2', display: 'TRUE' },
    { id: '3', name: '第三梯次 (DEV)', startTime: '0900', endTime: '0930', maxCapacity: '80', registered: '75', waiting: '5', display: 'TRUE' },
    { id: '4', name: '第四梯次 (DEV)', startTime: '0930', endTime: '1000', maxCapacity: '60', registered: '60', waiting: '0', display: 'TRUE' },
    { id: '5', name: '第五梯次 (DEV)', startTime: '1000', endTime: '1030', maxCapacity: '35', registered: '30', waiting: '5', display: 'TRUE' },
    { id: '6', name: '第六梯次 (DEV)', startTime: '1030', endTime: '1100', maxCapacity: '75', registered: '65', waiting: '10', display: 'TRUE' },
    { id: '7', name: '第七梯次 (DEV)', startTime: '1100', endTime: '1130', maxCapacity: '50', registered: '48', waiting: '2', display: 'TRUE' },
    { id: '8', name: '第八梯次 (DEV)', startTime: '1130', endTime: '1200', maxCapacity: '30', registered: '25', waiting: '5', display: 'TRUE' },
    { id: '9', name: '第九梯次 (DEV)', startTime: '1300', endTime: '1330', maxCapacity: '20', registered: '15', waiting: '5', display: 'TRUE' },
    { id: '10', name: '第十梯次 (DEV)', startTime: '1330', endTime: '1400', maxCapacity: '45', registered: '40', waiting: '5', display: 'TRUE' },
    { id: '11', name: '第十一梯次 (DEV)', startTime: '1400', endTime: '1430', maxCapacity: '50', registered: '50', waiting: '0', display: 'TRUE' },
    { id: '12', name: '第十二梯次 (DEV)', startTime: '1430', endTime: '1500', maxCapacity: '60', registered: '55', waiting: '5', display: 'TRUE' }
];

function init() {
    updateClock();
    setInterval(updateClock, 1000);
    fetchData();
    setInterval(fetchData, 60000);
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
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('env') === 'dev') {
        allData = DEV_DATA;
        renderPage();
        return;
    }
    try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        processCSV(csvText);
    } catch (e) {
        console.warn('Fetch failed', e);
    }
}

function processCSV(csvText) {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return;
    allData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
            id: values[0],
            name: values[1],
            maxCapacity: values[4],
            registered: values[5],
            waiting: values[6],
            display: values[7]
        };
    }).filter(item => item.display && item.display.toUpperCase() === 'TRUE');
    renderPage();
}

function renderPage() {
    const gridMain = document.getElementById('grid-main');
    gridMain.innerHTML = '';
    const startIdx = currentPage * ITEMS_PER_PAGE;
    const items = allData.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    items.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.style.animationDelay = `${idx * 0.05}s`;
        card.innerHTML = `
            <div class="card-header">
                <span class="badge-circle">${item.id}</span>
                <h2 class="card-title">${item.name}</h2>
            </div>
            <div class="stats-row">
                <div class="stat-item">
                    <span class="stat-label">可報名人數</span>
                    <span class="val blue">${item.maxCapacity}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">已報名人數</span>
                    <span class="val navy">${item.registered}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">可遞補人數</span>
                    <span class="val green">${item.waiting}</span>
                </div>
            </div>
        `;
        gridMain.appendChild(card);
    });
}
init();
