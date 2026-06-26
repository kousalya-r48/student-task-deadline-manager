const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const taskList = document.getElementById("taskList");

const progressBar = document.getElementById("progressBar");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const overdueTasks = document.getElementById("overdueTasks");

const searchInput = document.getElementById("searchInput");
const darkModeBtn = document.getElementById("darkModeBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

if ("Notification" in window) {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

renderTasks();

addBtn.addEventListener("click", () => {

    const task = taskInput.value.trim();
    const deadline = deadlineInput.value;

    if (task === "" || deadline === "") {
        alert("Please enter both task and deadline.");
        return;
    }

    tasks.push({
        task,
        deadline,
        completed: false
    });

    saveTasks();

    taskInput.value = "";
    deadlineInput.value = "";

    renderTasks();
});

searchInput.addEventListener("input", renderTasks);

darkModeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }

});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function daysLeft(deadline) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(deadline);

    const diff = dueDate - today;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function updateProgressBar() {

    if (tasks.length === 0) {
        progressBar.style.width = "0%";
        return;
    }

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const percentage =
        (completed / tasks.length) * 100;

    progressBar.style.width =
        percentage + "%";
}

function updateStats() {

    const total = tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const pending =
        total - completed;

    const overdue =
        tasks.filter(task =>
            !task.completed &&
            daysLeft(task.deadline) < 0
        ).length;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    overdueTasks.textContent = overdue;
}

function renderTasks() {

    taskList.innerHTML = "";

    const searchText =
        searchInput.value.toLowerCase();

    tasks.forEach((item, index) => {

        if (
            !item.task
                .toLowerCase()
                .includes(searchText)
        ) {
            return;
        }

        const remainingDays =
            daysLeft(item.deadline);

        const li =
            document.createElement("li");

        let cardClass = "";

        if (item.completed) {
            cardClass = "done-card";
        }
        else if (remainingDays < 0) {
            cardClass = "overdue";
        }
        else if (remainingDays <= 3) {
            cardClass = "warning";
        }

        if (cardClass) {
            li.classList.add(cardClass);
        }

        let status = "";

        if (item.completed) {
            status = "✅ Completed";
        }
        else if (remainingDays < 0) {
            status = "🔴 Overdue";
        }
        else if (remainingDays <= 3) {
            status = "🟠 Due Soon";
        }
        else {
            status = "🟢 On Track";
        }

        li.innerHTML = `
            <div class="task-header">
                <span class="${item.completed ? "completed" : ""}">
                    ${item.task}
                </span>
            </div>

            <p class="deadline">
                📅 Deadline:
                ${item.deadline}
            </p>

            <p class="days-left">
                ⏳ Days Left:
                ${remainingDays}
            </p>

            <p>${status}</p>

            <div class="buttons">

                <button
                    class="complete-btn"
                    onclick="completeTask(${index})">

                    ${item.completed ? "Undo" : "Complete"}

                </button>

                <button
                    class="reschedule-btn"
                    onclick="rescheduleTask(${index})">

                    Reschedule

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${index})">

                    Delete

                </button>

            </div>
        `;

        taskList.appendChild(li);

    });

    updateProgressBar();
    updateStats();
    checkReminders();
}

function completeTask(index) {

    tasks[index].completed =
        !tasks[index].completed;

    saveTasks();
    renderTasks();
}

function deleteTask(index) {

    const confirmDelete =
        confirm("Delete this task?");

    if (!confirmDelete) return;

    tasks.splice(index, 1);

    saveTasks();
    renderTasks();
}

function rescheduleTask(index) {

    const newDate = prompt(
        "Enter new deadline (YYYY-MM-DD)",
        tasks[index].deadline
    );

    if (!newDate) return;

    tasks[index].deadline =
        newDate;

    saveTasks();
    renderTasks();
}

function checkReminders() {

    if (Notification.permission !== "granted") {
        return;
    }

    tasks.forEach(task => {

        if (task.completed) return;

        const remaining =
            daysLeft(task.deadline);

        if (remaining === 1) {

            new Notification(
                "Task Reminder",
                {
                    body:
                        task.task +
                        " is due tomorrow!"
                }
            );

        }

    });

}