<script>
  import Lane from "./Lane.svelte";
  import TaskDialog from "./TaskDialog.svelte";
  import { lanes } from "$lib/stores";
  import { onMount } from "svelte";

  // --- UI State ---
  let showDialog = false;
  let newTask = { title: "", desc: "", due: "" };

  // --- Persistenz ---
  let isBrowser = false;
  let unsubscribe;

  // Migration alter Namen (Backlog/Review -> Do/Archiv) + Sortierung
  function migrateIfNeeded(data) {
    if (!Array.isArray(data)) return null;
    const map = { Backlog: "Do", Doing: "Doing", Done: "Done", Review: "Archiv" };
    const renamed = data.map((l) => ({ ...l, title: map[l.title] ?? l.title }));
    const order = ["Do", "Doing", "Done", "Archiv"];
    renamed.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    return renamed;
  }

  onMount(() => {
    isBrowser = true;

    // Laden
    try {
      const saved = localStorage.getItem("kanbanData");
      if (saved) {
        const migrated = migrateIfNeeded(JSON.parse(saved));
        if (migrated) {
          lanes.set(migrated);
          localStorage.setItem("kanbanData", JSON.stringify(migrated));
        }
      }
    } catch {}

    // Speichern (einmalige Subscription)
    unsubscribe = lanes.subscribe((value) => {
      if (!isBrowser) return;
      try { localStorage.setItem("kanbanData", JSON.stringify(value)); } catch {}
    });

    // Notifications-Rechte (später für „Done“)
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => { if (unsubscribe) unsubscribe(); };
  });

  // --- Dialog-Handler (Stub; echtes Hinzufügen kommt im nächsten Commit) ---
  function addTask() {
    alert("Add Task folgt im nächsten Commit ✅");
    showDialog = false;
  }
  function closeDialog() {
    showDialog = false;
  }
</script>

<!-- Header mit Button (öffnet nur den Dialog) -->
<header class="max-w-7xl mx-auto px-4 pt-10 pb-6">
  <div class="flex flex-col items-center gap-4">
    <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight">
      Kanban <span class="text-sky-400">Board</span>
    </h1>
    <button
      on:click={() => (showDialog = true)}
      class="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium bg-sky-600 hover:bg-sky-500 active:scale-[.98] text-white shadow-md shadow-sky-900/30"
    >
      <span class="text-lg">➕</span> New Task
    </button>
  </div>
</header>

<!-- Board bleibt wie gehabt: -->
<main class="max-w-7xl mx-auto px-4 pb-12">
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {#each $lanes as lane, i}
      <Lane {lane} laneIndex={i} />
    {/each}
  </section>
</main>

<!-- Dialog (funktioniert, speichert aber noch nicht wirklich) -->
<TaskDialog {showDialog} {newTask} {addTask} {closeDialog} />
