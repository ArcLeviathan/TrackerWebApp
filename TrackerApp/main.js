const DB_KEY = "trackerDB"; // <-- Move this to the top

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('time-tracker').textContent = timeString;
}
setInterval(updateTime, 1000);

// main.js additions
let items = [];
let today = new Date().toLocaleDateString();

function loadItems() {
    const saved = JSON.parse(localStorage.getItem(today)) || [];
    items = saved;
    renderItems();
}

function saveItems() {
    localStorage.setItem(today, JSON.stringify(items));
}

function addItem() {
    const input = document.getElementById('new-item');
    if (input.value) {
        items.push({ name: input.value, done: false });
        input.value = '';
        saveItems();
        renderItems();
    }
}

function deleteItem(index) {
    items.splice(index, 1);
    saveItems();
    renderItems();
}

function confirmItems() {
    items.forEach(item => item.done = true);
    saveItems();
    renderItems();
}

function renderItems() {
    const list = document.getElementById('item-list');
    list.innerHTML = '';
    items.forEach((item, i) => {
        list.innerHTML += `<li>
            <input type="checkbox" ${item.done ? 'checked' : ''} onclick="toggleDone(${i})">
            ${item.name}
            <button onclick="deleteItem(${i})">Delete</button>
        </li>`;
    });
}

function toggleDone(index) {
    items[index].done = !items[index].done;
    saveItems();
    renderItems();
}

window.onload = function() {
    updateTime();
    setInterval(updateTime, 1000);

    // Daily item logic (for pages with item-list)
    if (document.getElementById('item-list')) {
        loadItems();
        // Reset if day has changed
        if (localStorage.getItem('lastDate') !== today) {
            localStorage.setItem('lastDate', today);
            localStorage.setItem(today, JSON.stringify([]));
        }
    }

    // Dailies/Weeklies display logic (for index.html)
    if (document.querySelector('.list-of-dailies') && document.querySelector('.list-of-weeklies')) {
        renderDailiesAndWeeklies();
    }
};
// Load database from localStorage
function loadDB() {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : { dailies: [], weeklies: [] };
}

// Render dailies and weeklies on index.html
function renderDailiesAndWeeklies() {
    const db = loadDB();

    // Dailies
    const dailiesList = document.querySelector('.list-of-dailies');
    dailiesList.innerHTML = '<h2>Daily</h2>';
    if (db.dailies.length === 0) {
        dailiesList.innerHTML += '<p>No dailies configured.</p>';
    } else {
        dailiesList.innerHTML += '<ul>' +
            db.dailies.map(d => `<li>${d.name} (Reset: ${d.resetTime || '00:00'})</li>`).join('') +
            '</ul>';
    }

    // Weeklies
    const weekliesList = document.querySelector('.list-of-weeklies');
    weekliesList.innerHTML = '<h2>Weekly</h2>';
    if (db.weeklies.length === 0) {
        weekliesList.innerHTML += '<p>No weeklies configured.</p>';
    } else {
        weekliesList.innerHTML += '<ul>' +
            db.weeklies.map(w => {
                const days = w.weekdays ? w.weekdays.map(n => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][n]).join(', ') : '';
                return `<li>${w.name} (${days})</li>`;
            }).join('') +
            '</ul>';
    }
}
// config.html

function addDailyConfig() {
    const name = document.getElementById('new-item').value;
    const resetTime = document.getElementById('reset-time').value;
    if (!name) return;
    const db = loadDB();
    db.dailies.push({ name, resetTime });
    saveDB(db);
    document.getElementById('new-item').value = '';
    document.getElementById('reset-time').value = '00:00';
}

function addWeeklyConfig() {
    const name = document.getElementById('new-weekly-item').value;
    const weekdayCheckboxes = document.querySelectorAll('#weekday-checkboxes input[type="checkbox"]:checked');
    const weekdays = Array.from(weekdayCheckboxes).map(cb => parseInt(cb.value));
    if (!name || weekdays.length === 0) return;
    const db = loadDB();
    db.weeklies.push({ name, weekdays });
    saveDB(db);
    document.getElementById('new-weekly-item').value = '';
    weekdayCheckboxes.forEach(cb => cb.checked = false);
}

// Save database to localStorage
function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}