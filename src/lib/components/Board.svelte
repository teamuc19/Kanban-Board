<script>
  import Lane from "./Lane.svelte";
  import TaskDialog from "./TaskDialog.svelte";
  import { lanes } from "$lib/stores";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { format } from "date-fns";

  const STORAGE_KEY = "kanbanData";

  let showDialog = false;
  let newTask = { title: "", desc: "", due: "", points: "", priority: "Medium" };
  let isBrowser = false;
  let unsubscribe;

  let query = "";
  let userCountry = "…";

  onMount(() => {
    isBrowser = true;

    // localStorage -> Store
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) lanes.set(JSON.parse(saved));
    } catch {}

    // Lanes normalisieren (DO, DOING, DONE, ARCHIV)
    lanes.update((all = []) => {
      const ORDER = ["DO", "DOING", "DONE", "ARCHIV"];
      const mapTitle = (t) => {
        const up = String(t || "").toUpperCase().trim();
        if (up === "BACKLOG") return "DO";
        if (up === "IN PROGRESS") return "DOING";
        if (up === "REVIEW" || up === "REVIEWED" || up === "ARCHIVE" || up === "ARCHIVED") return "ARCHIV";
        if (ORDER.includes(up)) return up;
        return up || "DO";
      };
      const normalized = all.map(l => ({ title: mapTitle(l.title), color: "bg-white", tasks: l.tasks || [] }));
      const byTitle = new Map();
      for (const lane of normalized) {
        if (!byTitle.has(lane.title)) byTitle.set(lane.title, { ...lane });
        else byTitle.get(lane.title).tasks.push(...lane.tasks);
      }
      for (const key of ORDER)
        if (!byTitle.has(key)) byTitle.set(key, { title:key, color:"bg-white", tasks:[] });
      return ORDER.map(k => byTitle.get(k));
    });

    // Store -> localStorage
    unsubscribe = lanes.subscribe((v) => {
      if (!isBrowser) return;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch {}
    });

    // Geo-IP
    fetch("https://ipapi.co/json/").then(r => r.ok ? r.json() : null)
      .then(data => userCountry = data?.country_name || "Unbekannt")
      .catch(() => userCountry = "Unbekannt");

    // Notifications: Permission holen
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // PWA-SW nur in Prod
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => unsubscribe?.();
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

  function dragStart(e, task, from) { e.dataTransfer?.setData("text/plain", JSON.stringify({ task, from })); }
  function drop(e, toIndex) {
    const raw = e.dataTransfer.getData("text/plain"); if (!raw) return;
    let data; try { data = JSON.parse(raw); } catch { return; }
    const { task, from } = data;
    lanes.update((all) => {
      all[from].tasks = all[from].tasks.filter(t => t.id !== task.id);
      all[toIndex].tasks.push(task);
      if (isBrowser && all[toIndex].title === "DONE" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Task done", { body: task.title });
      }
      return all.slice();
    });
  }
  const removeTask = (taskId, fromLaneIndex) =>
    lanes.update((all) => { all[fromLaneIndex].tasks = all[fromLaneIndex].tasks.filter(t => t.id !== taskId); return all.slice(); });
  const closeDialog = () => (showDialog = false);

  // ---------- CSV EXPORT: ALLE ITEMS ----------
  function exportAllCSV() {
    const data = get(lanes) || [];
    const header = "lane,title,desc,created,due,points,priority,id\n";
    const rows = [];

    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    for (const lane of data) {
      for (const t of lane.tasks || []) {
        rows.push([
          lane.title,
          t.title ?? "",
          t.desc ?? "",
          t.created ? format(new Date(t.created), "yyyy-MM-dd") : "",
          t.due ?? "",
          t.points ?? "",
          t.priority ?? "",
          t.id ?? ""
        ].map(esc).join(","));
      }
    }

    const csv = header + rows.join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kanban_export.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
</script>

<div class="min-h-screen overflow-x-hidden" style="background:#90D5FF;">
  <header class="max-w-6xl mx-auto px-4 pt-8 pb-4">
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-2xl md:text-3xl font-semibold text-[#1b5673]">Kanban Board</h1>

      <div class="flex w-full max-w-xl gap-2">
        <input
          class="flex-1 rounded border border-black/10 bg-white px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1b5673]/50"
          placeholder="Filter tasks…"
          bind:value={query}
        />
        <button
          on:click={() => (showDialog = true)}
          class="rounded bg-[#1b5673] text-white px-4 py-2 hover:brightness-95 active:translate-y-px"
        >
          New Task
        </button>
        <button
          on:click={exportAllCSV}
          class="rounded border border-black/20 bg-white text-[#1b5673] px-4 py-2 hover:bg-white/80"
          title="Export all items as CSV"
        >
          Export All CSV
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 pb-10">
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each $lanes as lane, i}
        <Lane {lane} laneIndex={i} filter={query} onDrop={drop} onDragStart={dragStart} onRemove={removeTask} />
      {/each}
    </section>
  </main>

  <footer class="border-t border-black/10 py-4 text-center text-sm text-[#1b5673]">
    Country: <span class="font-medium">{userCountry}</span>
  </footer>
</div>

<TaskDialog {showDialog} {newTask} {addTask} {closeDialog} />
