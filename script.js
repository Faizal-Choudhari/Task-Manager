let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filter = document.getElementById("filter");
const sort = document.getElementById("sort");

document.getElementById("addBtn").addEventListener("click", addTask);

taskInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") addTask();
});

searchInput.addEventListener("input", renderTasks);
filter.addEventListener("change", renderTasks);
sort.addEventListener("change", renderTasks);

function addTask() {

    const name = taskInput.value.trim();

    if (!name) {
        alert("Please enter a task.");
        return;
    }

    tasks.push({
        id: Date.now(),
        name: name,
        category: category.value,
        priority: priority.value,
        dueDate: dueDate.value,
        completed: false
    });

    saveTasks();

    taskInput.value = "";
    dueDate.value = "";

    renderTasks();
}

function renderTasks() {

    let result = [...tasks];

    const search = searchInput.value.toLowerCase();

    result = result.filter(task =>
        task.name.toLowerCase().includes(search)
    );

    if (filter.value === "pending") {
        result = result.filter(task => !task.completed);
    }

    if (filter.value === "completed") {
        result = result.filter(task => task.completed);
    }

    if (filter.value === "high") {
        result = result.filter(task => task.priority === "High");
    }

    if (sort.value === "name") {
        result.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    if (sort.value === "date") {
        result.sort((a, b) =>
            (a.dueDate || "9999").localeCompare(b.dueDate || "9999")
        );
    }

    if (sort.value === "priority") {

        const order = {
            High: 1,
            Medium: 2,
            Low: 3
        };

        result.sort((a, b) =>
            order[a.priority] - order[b.priority]
        );
    }

    taskList.innerHTML = "";

    document.getElementById("emptyMessage").style.display =
        result.length ? "none" : "block";

    result.forEach(task => {

        const div = document.createElement("div");

        div.className =
            "task " + (task.completed ? "completed" : "");

        div.innerHTML = `
            <input
                type="checkbox"
                class="check"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})"
            >

            <div class="task-info">

                <div class="task-name">
                    ${escapeHTML(task.name)}
                </div>

                <div class="task-details">
                    Category: ${task.category}
                    ${task.dueDate ? " | Due: " + task.dueDate : ""}
                </div>

            </div>

            <span class="priority ${task.priority}">
                ${task.priority}
            </span>

            <div class="actions">

                <button
                    class="edit"
                    onclick="editTask(${task.id})">
                    ✏️
                </button>

                <button
                    class="delete"
                    onclick="deleteTask(${task.id})">
                    🗑️
                </button>

            </div>
        `;

        taskList.appendChild(div);
    });

    updateDashboard();
}

function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
    }

    saveTasks();
    renderTasks();
}

function deleteTask(id) {

    if (!confirm("Delete this task?")) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const newName = prompt("Edit task:", task.name);

    if (newName === null) return;

    if (!newName.trim()) {
        alert("Task cannot be empty.");
        return;
    }

    task.name = newName.trim();

    saveTasks();
    renderTasks();
}

function updateDashboard() {

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const pending = total - completed;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progress").textContent =
        percentage + "%";

    document.getElementById("progressFill").style.width =
        percentage + "%";
}

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

document.getElementById("themeBtn").addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");

        const dark =
            document.body.classList.contains("dark");

        document.getElementById("themeBtn").textContent =
            dark ? "☀️" : "🌙";

        localStorage.setItem("darkMode", dark);
    }
);

if (localStorage.getItem("darkMode") === "true") {

    document.body.classList.add("dark");

    document.getElementById("themeBtn").textContent = "☀️";
}

renderTasks();