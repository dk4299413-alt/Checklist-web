const STORAGE_KEY = "checklist_tasks_v1";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentFilter = "all";

const $ = id => document.getElementById(id);
const taskInput = $("taskInput");
const prioritySelect = $("prioritySelect");
const taskList = $("taskList");
const emptyState = $("emptyState");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask() {
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }
  tasks.unshift({
    id: Date.now(),
    title,
    priority: prioritySelect.value,
    completed: false
  });
  taskInput.value = "";
  prioritySelect.value = "medium";
  save();
  render();
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  save(); render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save(); render();
}

function filteredTasks() {
  if (currentFilter === "active") return tasks.filter(t => !t.completed);
  if (currentFilter === "completed") return tasks.filter(t => t.completed);
  return tasks;
}

function render() {
  const visible = filteredTasks();
  taskList.innerHTML = visible.map(t => `
    <article class="task ${t.completed ? "done" : ""}">
      <button class="check" aria-label="${t.completed ? "Mark active" : "Mark complete"}" onclick="toggleTask(${t.id})">
        ${t.completed ? "✓" : ""}
      </button>
      <div class="task-title">${escapeHtml(t.title)}</div>
      <span class="priority ${t.priority}">${t.priority}</span>
      <button class="delete" aria-label="Delete task" onclick="deleteTask(${t.id})">×</button>
    </article>
  `).join("");

  const completed = tasks.filter(t => t.completed).length;
  const active = tasks.length - completed;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  $("allCount").textContent = tasks.length;
  $("activeCount").textContent = active;
  $("completedCount").textContent = completed;
  $("progressPercent").textContent = percent + "%";
  $("progressText").textContent = `${completed} of ${tasks.length} done`;
  $("taskSummary").textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  document.querySelector(".progress-ring").style.background =
    `conic-gradient(#fff ${percent * 3.6}deg, rgba(255,255,255,.18) ${percent * 3.6}deg)`;

  const noVisible = visible.length === 0;
  emptyState.style.display = noVisible ? "block" : "none";
  if (currentFilter === "completed") {
    $("emptyTitle").textContent = "No completed tasks";
    $("emptyText").textContent = "Completed tasks will appear here.";
  } else if (currentFilter === "active") {
    $("emptyTitle").textContent = "All caught up!";
    $("emptyText").textContent = "You have no active tasks.";
  } else {
    $("emptyTitle").textContent = "No tasks yet";
    $("emptyText").textContent = "Add your first task above and start checking things off.";
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

$("addTask").addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

$("clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  save(); render();
});

$("clearAll").addEventListener("click", () => {
  if (tasks.length && confirm("Delete all tasks?")) {
    tasks = [];
    save(); render();
  }
});

render();
