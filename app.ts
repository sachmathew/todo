//const tabs: readonly string[] = ['date-todo', 'todo-log'];

const dateSearchForm: HTMLFormElement = <HTMLFormElement>document.getElementById("date-search");
const dateInput: HTMLInputElement = <HTMLInputElement>document.getElementById("date");
let date:string = "";

const addTODOForm: HTMLFormElement = <HTMLFormElement>document.getElementById("add-todo");
const addTODOText: HTMLInputElement = <HTMLInputElement>document.getElementById("add-todo-text");
const todoListContainer: HTMLElement = <HTMLElement>document.getElementById("todo-list-elements");
let local_todos: {[description: string]: HTMLLIElement;} = {};

const addWeeklyForm: HTMLFormElement = <HTMLFormElement>document.getElementById("add-weekly");
const addWeeklyText: HTMLInputElement = <HTMLInputElement>document.getElementById("add-weekly-text");
const weeklyContainer: HTMLElement = <HTMLElement>document.getElementById("weekly-elements");
let weeklyItems: HTMLLIElement[] = [];

const addMonthlyForm: HTMLFormElement = <HTMLFormElement>document.getElementById("add-monthly");


// Add the storage key as an app-wide constant
const STORAGE_KEY = "todo";

// Listen to form submissions.
dateSearchForm.addEventListener("change", searchDate);
addTODOForm.addEventListener("submit", addTODO);
addWeeklyForm.addEventListener("submit", addWeekly);

interface TODO {
  recurrence?: string;
  description: string;
  date: string;
  completed: boolean;
}

interface RecurringTODO {
  description: string;
  startDate?: string;
  endDate?: string;
  
}

function startup(){
  //toggleTabs('date-todo');
  dateInput.valueAsDate = new Date();
  searchDate();
  renderWeeklies();
}

function searchDate(event?: Event) {
  if(event) { event.preventDefault(); }
  date = dateInput.value;
  renderTODOsFromDate(date);
}

function addTODO(event?: Event) {
  console.log("add todo");
  if(event) { event.preventDefault(); }
  if (addTODOText.value) {
    let todos: {[date: string]: TODO[];} = getAllStoredTODOs();
    if(!todos[date]) { todos[date] = []}
    todos[date].push({description: addTODOText.value, date: date, completed: false});
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    addTODOForm.reset();
    renderTODOsFromDate(date);
  }
}

/*function toggleTabs(toggled_tab: string) {
  for(const tab of tabs) {
    let t:HTMLElement = <HTMLElement>document.getElementsByClassName(tab)[0];
    if(toggled_tab === tab) { t.style.display = "block"; } 
    else { t.style.display = "none"; }
  }
}*/

function getAllStoredTODOs(): {[date: string]: TODO[];} {
  const data = window.localStorage.getItem(STORAGE_KEY);
  let todos: {[date: string]: TODO[];} = data ? JSON.parse(data) : {};
  //console.log("todos");
  //console.dir(todos);
  return todos;
}

function renderTODOsFromDate(date: string) {
  const todos = getAllStoredTODOs();
  for(const key in local_todos) {
    local_todos[key].remove();
  }
  local_todos = {};
  const date_todos: TODO[] = todos[date];
  if (date_todos && date_todos.length > 0) {
    for(const todo of date_todos) {
      const todoLI: HTMLLIElement = renderTODO(todo);
      local_todos[todo.description] = todoLI;
      todoListContainer.appendChild(todoLI);
    }
  }

  const weeklies = getAllStoredWeeklies();
  if (weeklies && weeklies.length > 0) {
    for(const weekly of weeklies) {
      const day_of_week = (new Date(date)).getDay();
      console.log(`${weekly.description} ${day_of_week}: ${weekly.days[day_of_week]}`);
      if(weekly.days[day_of_week] && !(weekly.description in local_todos)) {
        const todoLI = renderTODO({
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

function renderTODO(todo: TODO): HTMLLIElement {
  const todoLI: HTMLLIElement = document.createElement("li");
  const checkbox: HTMLInputElement = document.createElement("input");
  const n = Object.keys(local_todos).length;
  checkbox.type = "checkbox"
  checkbox.id = `todo_${n}`;
  checkbox.name = `todo_${n}`;
  checkbox.checked = todo.completed;
  checkbox.onchange = saveTODOsFromCurrentDate;
  todoLI.appendChild(checkbox);
  const label: HTMLLabelElement = document.createElement("label");
  label.htmlFor = `todo_${n}`;
  label.textContent = todo.description;
  todoLI.appendChild(label);
  const deleteButton: HTMLButtonElement = document.createElement("button");
  deleteButton.innerHTML = "X";
  deleteButton.onclick = function(){
    todoLI.remove();
    delete local_todos[todo.description];
    saveTODOsFromCurrentDate();
  }
  todoLI.appendChild(deleteButton);
  return todoLI;
}

function saveTODOsFromCurrentDate() {
  const todos = getAllStoredTODOs();
  let todos_to_update = []
  for(const key in local_todos) {
    const todo: TODO = {
      description: local_todos[key].getElementsByTagName("label")[0].textContent,
      date: date,
      completed: local_todos[key].getElementsByTagName("input")[0].checked
    };
    todos_to_update.push(todo);
  }
  todos[date] = todos_to_update;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addWeekly(event?: Event) {
  console.log("add weekly");
  if(event) { event.preventDefault(); }
  if (addWeeklyText.value) {
    let days: boolean[] = [
      (<HTMLInputElement>document.getElementById(`mon_add`)).checked,
      (<HTMLInputElement>document.getElementById(`tue_add`)).checked,
      (<HTMLInputElement>document.getElementById(`wed_add`)).checked,
      (<HTMLInputElement>document.getElementById(`thu_add`)).checked,
      (<HTMLInputElement>document.getElementById(`fri_add`)).checked,
      (<HTMLInputElement>document.getElementById(`sat_add`)).checked,
      (<HTMLInputElement>document.getElementById(`sun_add`)).checked,
    ];
    storeNewWeekly(addWeeklyText.value, days)
    addWeeklyForm.reset();
    renderWeeklies();
  }
}

function storeNewWeekly(description: string, days: boolean[]) {
  let weeklies = getAllStoredWeeklies();
  if(!weeklies) { weeklies = []; }
  weeklies.push({ description, days });
  window.localStorage.setItem(STORAGE_KEY+"_weeklies", JSON.stringify(weeklies));
}

function getAllStoredWeeklies() {
  const data = window.localStorage.getItem(STORAGE_KEY+"_weeklies");
  let weeklies = data ? JSON.parse(data) : [];
  console.log("weeklies");
  console.dir(weeklies);
  return weeklies;
}

function renderWeeklies() {
  const weeklies = getAllStoredWeeklies();
  if (!weeklies || weeklies.length === 0) {
    return;
  }
  weeklyItems.forEach((weeklyItem) => {
    weeklyItem.remove();
  });
  weeklyItems = [];
  weeklies.forEach((weekly) => {
    const weeklyItem = renderWeekly(weekly.description, weekly.days)
    weeklyItems.push(weeklyItem);
    weeklyContainer.appendChild(weeklyItem);
  });
}

function renderWeekly(description: string, days: boolean[]) {
  const weeklyItem: HTMLLIElement = document.createElement("li");
  const n = weeklyItems.length;
  const dows = ["mon", "tue", "wed" ,"thu", "fri", "sat", "sun"];
  const label: HTMLLabelElement = document.createElement("label");
  label.id = `weekly_${n}`;
  label.textContent = description;
  weeklyItem.appendChild(label);
  dows.forEach((dow) => {
    const checkbox: HTMLInputElement = document.createElement("input");
    checkbox.type = "checkbox"
    checkbox.id = `${dow}_${n}`;
    checkbox.name = `${dow}_${n}`;
    checkbox.checked = days[dows.indexOf(dow)];
    checkbox.onchange = saveWeeklies;
    weeklyItem.appendChild(checkbox);
    const dayLabel: HTMLLabelElement = document.createElement("label");
    dayLabel.htmlFor = `${dow}_${n}`;
    dayLabel.textContent = dow.charAt(0).toUpperCase();
    weeklyItem.appendChild(dayLabel);
  });
  const deleteButton: HTMLButtonElement = document.createElement("button");
  deleteButton.innerHTML = "X";
  deleteButton.onclick = function(){
    weeklyItem.remove();
    weeklyItems.splice(weeklyItems.indexOf(weeklyItem), 1);
    saveWeeklies();
  }
  weeklyItem.appendChild(deleteButton);
  return weeklyItem;
}

function saveWeeklies() {
  let weeklies = []
  weeklyItems.forEach( (weeklyItem) => {
    const description = weeklyItem.getElementsByTagName("label")[0].textContent;
    const id = weeklyItem.getElementsByTagName("label")[0].id;
    const n = Number(id.substring(id.lastIndexOf("_")+1));
    let days = [
      (<HTMLInputElement>document.getElementById(`mon_${n}`)).checked,
      (<HTMLInputElement>document.getElementById(`tue_${n}`)).checked,
      (<HTMLInputElement>document.getElementById(`wed_${n}`)).checked,
      (<HTMLInputElement>document.getElementById(`thu_${n}`)).checked,
      (<HTMLInputElement>document.getElementById(`fri_${n}`)).checked,
      (<HTMLInputElement>document.getElementById(`sat_${n}`)).checked,
      (<HTMLInputElement>document.getElementById(`sun_${n}`)).checked,
    ];
    weeklies.push({ description, days });
  });
  window.localStorage.setItem(STORAGE_KEY+"_weeklies", JSON.stringify(weeklies));
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

startup();
