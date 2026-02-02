const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1coDkjr-pp5ILwziUBHcYLu0s-N3Q6WRr3kFGxG0gNh0/export?format=csv&gid=0';

let visitorsChartInstance = null;
let vehiclesChartInstance = null;

async function fetchData() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = parseCSV(csvText);

        if (rows.length > 0) {
            updateDashboard(rows);
            updateCharts(rows);
            updateLastUpdatedTime();
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('last-updated').textContent = '資料載入失敗，請檢查連線';
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');

    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
            date: values[0],
            totalVisitors: parseInt(values[1]),
            totalVehicles: parseInt(values[2]),
            currentVisitors: parseInt(values[3]),
            currentVehicles: parseInt(values[4])
        };
    });

    // Check if the last row is empty or invalid, just in case
    return data.filter(item => !isNaN(item.totalVisitors));
}

function updateDashboard(data) {
    const latest = data[data.length - 1]; // Get the last row

    // Animate numbers
    animateValue("current-visitors", 0, latest.currentVisitors, 1000);
    animateValue("current-vehicles", 0, latest.currentVehicles, 1000);
    animateValue("total-visitors", 0, latest.totalVisitors, 1000);
    animateValue("total-vehicles", 0, latest.totalVehicles, 1000);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateCharts(data) {
    // Get last 7 records for the chart
    const recentData = data.slice(-7);
    const labels = recentData.map(d => d.date);
    const visitorsData = recentData.map(d => d.currentVisitors);
    const vehiclesData = recentData.map(d => d.currentVehicles);

    initVisitorsChart(labels, visitorsData);
    initVehiclesChart(labels, vehiclesData);
}

function initVisitorsChart(labels, data) {
    const ctx = document.getElementById('visitorsChart').getContext('2d');

    if (visitorsChartInstance) {
        visitorsChartInstance.destroy();
    }

    visitorsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '當下人次',
                data: data,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#38bdf8',
                pointRadius: 4
            }]
        },
        options: getChartOptions('人次')
    });
}

function initVehiclesChart(labels, data) {
    const ctx = document.getElementById('vehiclesChart').getContext('2d');

    if (vehiclesChartInstance) {
        vehiclesChartInstance.destroy();
    }

    vehiclesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '當下車次',
                data: data,
                borderColor: '#fcba03', // Orange/Yellowish
                backgroundColor: 'rgba(252, 186, 3, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#fcba03',
                pointRadius: 4
            }]
        },
        options: getChartOptions('車次')
    });
}

function getChartOptions(label) {
    return {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#94a3b8'
                }
            }
        }
    };
}

function updateLastUpdatedTime() {
    const now = new Date();
    document.getElementById('last-updated').textContent = `更新時間: ${now.toLocaleTimeString()}`;
}

// Initial Fetch
fetchData();

// Auto-refresh every 5 seconds
setInterval(fetchData, 5000);
