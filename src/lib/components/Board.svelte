<script>
  import Lane from "./Lane.svelte";
  import TaskDialog from "./TaskDialog.svelte";
  import { lanes } from "$lib/stores";
  import { onMount } from "svelte";

  const STORAGE_KEY = "kanbanData";

  let showDialog = false;
  let newTask = { title: "", desc: "", due: "", points: "", priority: "Medium" };
  let isBrowser = false;
  let unsubscribe;

  // Filter (nur Textsuche)
  let query = "";

  // Geo-Info
  let userCountry = "…";

  onMount(() => {
    isBrowser = true;

    // Laden
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) lanes.set(JSON.parse(saved));
    } catch {}

    // ---- MIGRATION & SORTIERUNG: DO · DOING · DONE · ARCHIV ----
    lanes.update((all) => {
      const DEFAULTS = {
        DO:      "bg-slate-100 dark:bg-slate-800/40",
        DOING:   "bg-amber-50 dark:bg-amber-900/20",
        DONE:    "bg-emerald-50 dark:bg-emerald-900/20",
        ARCHIV:  "bg-indigo-50 dark:bg-indigo-900/20"
      };
      const ORDER = ["DO", "DOING", "DONE", "ARCHIV"];

      const mapTitle = (t) => {
        if (!t) return t;
        const up = String(t).toUpperCase().trim();
        if (up === "BACKLOG") return "DO";
        if (up === "IN PROGRESS") return "DOING";
        if (up === "REVIEW" || up === "REVIEWED") return "ARCHIV";
        if (up === "ARCHIVE" || up === "ARCHIVED") return "ARCHIV";
        if (["DO","DOING","DONE","ARCHIV"].includes(up)) return up;
        return up;
      };

      const normalized = all.map(l => ({ ...l, title: mapTitle(l.title) }));

      // Doppelte Titel zusammenführen
      const byTitle = new Map();
      for (const lane of normalized) {
        const key = lane.title;
        if (!byTitle.has(key)) {
          byTitle.set(key, { title: key, color: lane.color, tasks: [...(lane.tasks || [])] });
        } else {
          byTitle.get(key).tasks.push(...(lane.tasks || []));
        }
      }

      // Fehlende Lanes ergänzen + Farbe defaulten
      for (const key of ORDER) {
        if (!byTitle.has(key)) {
          byTitle.set(key, { title: key, color: DEFAULTS[key], tasks: [] });
        } else if (!byTitle.get(key).color) {
          byTitle.get(key).color = DEFAULTS[key];
        }
      }

      return ORDER.map(k => byTitle.get(k));
    });
    // ---- /MIGRATION & SORTIERUNG ----

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

    // Geo-API (Land)
    fetch("https://ipapi.co/json/")
      .then(r => r.ok ? r.json() : null)
      .then(data => userCountry = data?.country_name || "Unbekannt")
      .catch(() => userCountry = "Unbekannt");

    // PWA: Service Worker registrieren
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => { if (unsubscribe) unsubscribe(); };
  });

  function addTask() {
    if (!newTask.title.trim()) { alert("Title required!"); return; }
    lanes.update((all) => {
      const task = {
        ...newTask,
        id: Date.now(),
        created: new Date().toISOString(),
        points: newTask.points === "" ? null : Number(newTask.points)
      };
      all[0].tasks.push(task); // in "DO"
      return all.slice();
    });
    newTask = { title: "", desc: "", due: "", points: "", priority: "Medium" };
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

      // Benachrichtigen, wenn nach DONE verschoben
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

      <!-- Filter-Zeile: nur Textsuche -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
        <input
          class="w-full md:w-[320px] rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-slate-100 placeholder:text-slate-300/60"
          placeholder="Filter tasks… (Title/Description)"
          bind:value={query}
        />

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
        <Lane
          {lane}
          laneIndex={i}
          filter={query}
          onDrop={drop}
          onDragStart={dragStart}
          onRemove={removeTask}
        />
      {/each}
    </section>
  </main>

  <footer class="border-t border-white/10 py-6 mt-6 text-center text-sm text-slate-300">
    🌍 Your country: <span class="font-medium text-slate-100">{userCountry}</span>
  </footer>
</div>

<TaskDialog {showDialog} {newTask} {addTask} {closeDialog} />
