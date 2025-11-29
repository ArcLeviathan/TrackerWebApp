const DB_KEY = "trackerDB"; // a reference point for the API 'localStorage', which allows to save each item even if the website is closed.

function updateTime() { // this function will update the time set in the main webpage.
    const now = new Date(); // now is set as a const variable. const variables basically do not change.
    const timeString = now.toLocaleTimeString(); // timeString is set as constant. .toLocaleTimeString() gets the local time from your own settings.
    document.getElementById('time-tracker').textContent = timeString; // looks for 'time-tracker' set in every ID.
}
setInterval(updateTime, 1000); // updates every 1 second (1000 in milliseconds).

let items = []; // set items as a let; let are variables that change over time. This is the main variable which holds the tasks that you have.
let today = new Date().toLocaleDateString(); // today is set as a variable, which determines the present date.

function loadItems() { // this function will allow to load the items. Items in the webtracker are the "tasks" that you do.
    const saved = JSON.parse(localStorage.getItem(today)) || []; // saved is set as a constant. localStorage.getItem(today) looks for the browser's storage for any data stored under "today" JSON.parse converts the string back into an array. || [] is used if you haven't set an array. 
    // basically, this piece of code above will load previous tasks that you loaded (from localStorage).
    items = saved; // saves the current items from "saved", which saves the saved items (from previous days) to be saved into the present.
    renderItems(); // loads the renderItems function, which updates the item-list (.html files)
}

function saveItems() { // this function is your current list of tasks set daily to be saved.
    localStorage.setItem(today, JSON.stringify(items)); // This saves the items. JSON.stringify turns 'items' array into a string so it can be saved.
}

function addItem() { // this function will add new items to be added in the list.
    const input = document.getElementById('new-item'); // gets the item named in the textbox to be added as "input".
    if (input.value) { // if input has a value, do:
        items.push({ name: input.value, done: false }); // adds the inputted item into the items array.
        input.value = ''; // clears the textbox
        saveItems();
        renderItems();
    }
}

function deleteItem(index) { // this will delete the item from the list of dailies. [CURRENTLY NOT USED]
    items.splice(index, 1);
    saveItems();
    renderItems();
}

function confirmItems() { // this will set the items currently as done. [CURRENTLY NOT USED]
    items.forEach(item => item.done = true);
    saveItems();
    renderItems();
}

function renderItems() { // renders the current items set.
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

function toggleDone(index) { // toggles if the items are done.
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