<script>
  import Lane from "./Lane.svelte";
  import TaskDialog from "./TaskDialog.svelte";
  import { lanes } from "$lib/stores";
  import { onMount } from "svelte";

  const STORAGE_KEY = "kanbanData";

  let showDialog = false;
  let newTask = { title: "", desc: "", due: "" };
  let isBrowser = false;
  let unsubscribe;

  onMount(() => {
    isBrowser = true;

    // Laden
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) lanes.set(JSON.parse(saved));
    } catch {}

    // Alte/abweichende Titel ins gewünschte Set heben (DO/DOING/DONE/ARCHIV)
    lanes.update((all) => {
      const mapTitle = (t) => {
        if (!t) return t;
        const up = String(t).toUpperCase();
        if (up === "DO" || up === "BACKLOG") return "DO";
        if (up === "DOING" || up === "IN PROGRESS") return "DOING";
        if (up === "DONE" || up === "REVIEW" || up === "REVIEWED") return "DONE";
        if (up === "ARCHIV" || up === "ARCHIVE" || up === "ARCHIVED") return "ARCHIV";
        return up;
      };
      all.forEach((lane) => (lane.title = mapTitle(lane.title)));
      return all.slice();
    });

    // Speichern
    unsubscribe = lanes.subscribe((value) => {
      if (!isBrowser) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {}
    });

    // Notifications
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => { if (unsubscribe) unsubscribe(); };
  });

  function addTask() {
    if (!newTask.title.trim()) { alert("Title required!"); return; }
    lanes.update((all) => {
      const task = { ...newTask, id: Date.now(), created: new Date().toISOString() };
      all[0].tasks.push(task); // in "DO"
      return all.slice();
    });
    newTask = { title: "", desc: "", due: "" };
    showDialog = false;
  }

  function dragStart(e, task, from) {
    e.dataTransfer?.setData("text/plain", JSON.stringify({ task, from }));
  }

  function drop(e, toIndex) {
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    let data; try { data = JSON.parse(raw); } catch { return; }
    const { task, from } = data;

    lanes.update((all) => {
      all[from].tasks = all[from].tasks.filter((t) => t.id !== task.id);
      all[toIndex].tasks.push(task);

      // ACHTUNG: auf "DONE" prüfen (Großschreibung)
      if (
        isBrowser &&
        all[toIndex].title === "DONE" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("✅ Task Done", { body: task.title });
      }
      return all.slice();
    });
  }

  function removeTask(taskId, fromLaneIndex) {
    lanes.update((all) => {
      all[fromLaneIndex].tasks = all[fromLaneIndex].tasks.filter(t => t.id !== taskId);
      return all.slice();
    });
  }

  function closeDialog() { showDialog = false; }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-100">
  <header class="max-w-7xl mx-auto px-4 pt-10 pb-6">
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight">
        Kanban <span class="text-sky-400">Board</span>
      </h1>
      <div class="flex gap-3">
        <button
          on:click={() => (showDialog = true)}
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium bg-sky-600 hover:bg-sky-500 active:scale-[.98] text-white shadow-md shadow-sky-900/30"
        >
          <span class="text-lg">➕</span> New Task
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 pb-12">
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {#each $lanes as lane, i}
        <Lane {lane} laneIndex={i} onDrop={drop} onDragStart={dragStart} onRemove={removeTask} />
      {/each}
    </section>
  </main>
</div>

<TaskDialog {showDialog} {newTask} {addTask} {closeDialog} />
