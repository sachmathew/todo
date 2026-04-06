var tabs = ['date-todo', 'todo-log'];
var dateSearchForm = document.getElementById("date-search");
var dateInput = document.getElementById("date");
var date = "";
var addTODOForm = document.getElementById("add-todo");
var addTODOText = document.getElementById("add-todo-text");
var todoListContainer = document.getElementById("todo-list-elements");
var local_todos = {};
var addWeeklyForm = document.getElementById("add-weekly");
var addWeeklyText = document.getElementById("add-weekly-text");
var weeklyContainer = document.getElementById("weekly-elements");
var weeklyItems = [];
var addMonthlyForm = document.getElementById("add-monthly");
// Add the storage key as an app-wide constant
var STORAGE_KEY = "todo";
// Listen to form submissions.
dateSearchForm.addEventListener("submit", searchDate);
addTODOForm.addEventListener("submit", addTODO);
addWeeklyForm.addEventListener("submit", addWeekly);
function startup() {
    toggleTabs('date-todo');
    dateInput.valueAsDate = new Date();
    searchDate();
    renderWeeklies();
}
function searchDate(event) {
    if (event) {
        event.preventDefault();
    }
    date = dateInput.value;
    renderTODOsFromDate(date);
}
function addTODO(event) {
    console.log("add todo");
    if (event) {
        event.preventDefault();
    }
    if (addTODOText.value) {
        var todos = getAllStoredTODOs();
        if (!todos[date]) {
            todos[date] = [];
        }
        todos[date].push({ description: addTODOText.value, date: date, completed: false });
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        addTODOForm.reset();
        renderTODOsFromDate(date);
    }
}
function toggleTabs(toggled_tab) {
    for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
        var tab = tabs_1[_i];
        var t = document.getElementById(tab);
        if (toggled_tab === tab) {
            t.style.display = "block";
        }
        else {
            t.style.display = "none";
        }
    }
}
function getAllStoredTODOs() {
    var data = window.localStorage.getItem(STORAGE_KEY);
    var todos = data ? JSON.parse(data) : {};
    //console.log("todos");
    //console.dir(todos);
    return todos;
}
function renderTODOsFromDate(date) {
    var todos = getAllStoredTODOs();
    for (var key in local_todos) {
        local_todos[key].remove();
    }
    local_todos = {};
    var date_todos = todos[date];
    if (date_todos && date_todos.length > 0) {
        for (var _i = 0, date_todos_1 = date_todos; _i < date_todos_1.length; _i++) {
            var todo = date_todos_1[_i];
            var todoLI = renderTODO(todo);
            local_todos[todo.description] = todoLI;
            todoListContainer.appendChild(todoLI);
        }
    }
    var weeklies = getAllStoredWeeklies();
    if (weeklies && weeklies.length > 0) {
        for (var _a = 0, weeklies_1 = weeklies; _a < weeklies_1.length; _a++) {
            var weekly = weeklies_1[_a];
            var day_of_week = (new Date(date)).getDay();
            console.log("".concat(weekly.description, " ").concat(day_of_week, ": ").concat(weekly.days[day_of_week]));
            if (weekly.days[day_of_week] && !(weekly.description in local_todos)) {
                var todoLI = renderTODO({
                    description: weekly.description,
                    date: date,
                    completed: false
                });
                local_todos[weekly.description] = todoLI;
                todoListContainer.appendChild(todoLI);
            }
        }
    }
}
function renderTODO(todo) {
    var todoLI = document.createElement("li");
    var checkbox = document.createElement("input");
    var n = Object.keys(local_todos).length;
    checkbox.type = "checkbox";
    checkbox.id = "todo_".concat(n);
    checkbox.name = "todo_".concat(n);
    checkbox.checked = todo.completed;
    checkbox.onchange = saveTODOsFromCurrentDate;
    todoLI.appendChild(checkbox);
    var label = document.createElement("label");
    label.htmlFor = "todo_".concat(n);
    label.textContent = todo.description;
    todoLI.appendChild(label);
    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "X";
    deleteButton.onclick = function () {
        todoLI.remove();
        delete local_todos[todo.description];
        saveTODOsFromCurrentDate();
    };
    todoLI.appendChild(deleteButton);
    return todoLI;
}
function saveTODOsFromCurrentDate() {
    var todos = getAllStoredTODOs();
    var todos_to_update = [];
    for (var key in local_todos) {
        var todo = {
            description: local_todos[key].getElementsByTagName("label")[0].textContent,
            date: date,
            completed: local_todos[key].getElementsByTagName("input")[0].checked
        };
        todos_to_update.push(todo);
    }
    todos[date] = todos_to_update;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
function addWeekly(event) {
    console.log("add weekly");
    if (event) {
        event.preventDefault();
    }
    if (addWeeklyText.value) {
        var days = [
            document.getElementById("mon_add").checked,
            document.getElementById("tue_add").checked,
            document.getElementById("wed_add").checked,
            document.getElementById("thu_add").checked,
            document.getElementById("fri_add").checked,
            document.getElementById("sat_add").checked,
            document.getElementById("sun_add").checked,
        ];
        storeNewWeekly(addWeeklyText.value, days);
        addWeeklyForm.reset();
        renderWeeklies();
    }
}
function storeNewWeekly(description, days) {
    var weeklies = getAllStoredWeeklies();
    if (!weeklies) {
        weeklies = [];
    }
    weeklies.push({ description: description, days: days });
    window.localStorage.setItem(STORAGE_KEY + "_weeklies", JSON.stringify(weeklies));
}
function getAllStoredWeeklies() {
    var data = window.localStorage.getItem(STORAGE_KEY + "_weeklies");
    var weeklies = data ? JSON.parse(data) : [];
    console.log("weeklies");
    console.dir(weeklies);
    return weeklies;
}
function renderWeeklies() {
    var weeklies = getAllStoredWeeklies();
    if (!weeklies || weeklies.length === 0) {
        return;
    }
    weeklyItems.forEach(function (weeklyItem) {
        weeklyItem.remove();
    });
    weeklyItems = [];
    weeklies.forEach(function (weekly) {
        var weeklyItem = renderWeekly(weekly.description, weekly.days);
        weeklyItems.push(weeklyItem);
        weeklyContainer.appendChild(weeklyItem);
    });
}
function renderWeekly(description, days) {
    var weeklyItem = document.createElement("li");
    var n = weeklyItems.length;
    var dows = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    var label = document.createElement("label");
    label.id = "weekly_".concat(n);
    label.textContent = description;
    weeklyItem.appendChild(label);
    dows.forEach(function (dow) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "".concat(dow, "_").concat(n);
        checkbox.name = "".concat(dow, "_").concat(n);
        checkbox.checked = days[dows.indexOf(dow)];
        checkbox.onchange = saveWeeklies;
        weeklyItem.appendChild(checkbox);
        var dayLabel = document.createElement("label");
        dayLabel.htmlFor = "".concat(dow, "_").concat(n);
        dayLabel.textContent = dow.charAt(0).toUpperCase();
        weeklyItem.appendChild(dayLabel);
    });
    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "X";
    deleteButton.onclick = function () {
        weeklyItem.remove();
        weeklyItems.splice(weeklyItems.indexOf(weeklyItem), 1);
        saveWeeklies();
    };
    weeklyItem.appendChild(deleteButton);
    return weeklyItem;
}
function saveWeeklies() {
    var weeklies = [];
    weeklyItems.forEach(function (weeklyItem) {
        var description = weeklyItem.getElementsByTagName("label")[0].textContent;
        var id = weeklyItem.getElementsByTagName("label")[0].id;
        var n = Number(id.substring(id.lastIndexOf("_") + 1));
        var days = [
            document.getElementById("mon_".concat(n)).checked,
            document.getElementById("tue_".concat(n)).checked,
            document.getElementById("wed_".concat(n)).checked,
            document.getElementById("thu_".concat(n)).checked,
            document.getElementById("fri_".concat(n)).checked,
            document.getElementById("sat_".concat(n)).checked,
            document.getElementById("sun_".concat(n)).checked,
        ];
        weeklies.push({ description: description, days: days });
    });
    window.localStorage.setItem(STORAGE_KEY + "_weeklies", JSON.stringify(weeklies));
}
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}
startup();
