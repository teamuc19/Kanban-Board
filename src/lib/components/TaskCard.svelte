<script>
  // KEIN date-fns mehr – alles mit reinem JS

  export let task;
  export let onDragStart;
  export let laneIndex;
  export let onRemove;
  export let role = "listitem";

  // yyyy-MM-dd Formatierung
  function fmt(iso) {
    if (!iso) return "—";
    try {
      const d = new Date(String(iso));
      if (isNaN(d)) return String(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return String(iso);
    }
  }

  // Start-of-day helper
  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // Overdue?
  $: overdue = (() => {
    if (!task?.due) return false;
    try {
      const due = new Date(String(task.due));
      if (isNaN(due)) return false;
      const today = new Date();
      return startOfDay(due) < startOfDay(today);
    } catch {
      return false;
    }
  })();

  // ICS-Export
  function exportICS(t) {
    const uid = `${t.id}@kanban.local`;
    const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const due = t.due ? t.due.replace(/[-:]/g, "").split("T")[0] : null;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kanban Board//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      t.title ? `SUMMARY:${t.title.replace(/\n/g, " ")}` : "SUMMARY:Task",
      t.desc ? `DESCRIPTION:${t.desc.replace(/\n/g, " ")}` : "",
      due ? `DUE;VALUE=DATE:${due}` : "",
      "END:VEVENT",
      "END:VCALENDAR"
    ].filter(Boolean).join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (t.title || "task") + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Web Share API
  async function shareTask(t) {
    const text = [t.title, t.desc && `— ${t.desc}`, t.due && `(Due: ${fmt(t.due)})`]
      .filter(Boolean).join(" ");
    if (navigator.share) {
      try { await navigator.share({ title: t.title, text }); }
      catch { /* abgebrochen */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Info kopiert (Web Share nicht verfügbar).");
      } catch {
        alert("Web Share/Clipboard nicht verfügbar.");
      }
    }
  }
</script>

<article
  {role}
  draggable="true"
  on:dragstart={(e) => onDragStart(e, task, laneIndex)}
  aria-label={task.title}
  class="group bg-white/95 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/40
         rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
>
  <div class="flex items-start justify-between gap-3">
    <div class="flex items-center gap-2">
      <h3 class="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{task.title}</h3>
      {#if overdue}
        <span class="inline-flex items-center rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200 px-2 py-[2px] text-[10px] font-semibold">
          OVERDUE
        </span>
      {/if}
    </div>

    <div class="flex items-center gap-1">
      <button
        type="button"
        class="shrink-0 rounded-lg px-2 py-1 text-[12px] text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20"
        aria-label="Share task"
        title="Share"
        on:click={() => shareTask(task)}
      >⤴️</button>
      <button
        type="button"
        class="shrink-0 rounded-lg px-2 py-1 text-[12px] text-emerald-700 hover:bg-emerald-50 dark:hover=g-emerald-900/20"
        aria-label="Export as ICS"
        title="Export .ics"
        on:click={() => exportICS(task)}
      >📅</button>
      <button
        type="button"
        class="shrink-0 rounded-lg px-2 py-1 text-[12px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        aria-label="Delete task"
        on:click={() => onRemove(task.id, laneIndex)}
      >🗑️</button>
    </div>
  </div>

  <!-- Tabelle mit allen Eigenschaften -->
  <div class="mt-2 overflow-hidden rounded-lg border border-slate-200/70 dark:border-slate-700/50">
    <table class="w-full text-[12px]">
      <tbody class="divide-y divide-slate-200/70 dark:divide-slate-700/50">
        <tr>
          <th class="text-left px-2 py-1 bg-slate-50 dark:bg-slate-800/60 w-28">Description</th>
          <td class="px-2 py-1 text-slate-700 dark:text-slate-200">{task.desc || "—"}</td>
        </tr>
        <tr>
          <th class="text-left px-2 py-1 bg-slate-50 dark:bg-slate-800/60">Creation-Date</th>
          <td class="px-2 py-1">{fmt(task.created)}</td>
        </tr>
        <tr>
          <th class="text-left px-2 py-1 bg-slate-50 dark:bg-slate-800/60">Due-Date</th>
          <td class="px-2 py-1">{fmt(task.due)}</td>
        </tr>
        <tr>
          <th class="text-left px-2 py-1 bg-slate-50 dark:bg-slate-800/60">Story Points</th>
          <td class="px-2 py-1">{task.points ?? "—"}</td>
        </tr>
        <tr>
          <th class="text-left px-2 py-1 bg-slate-50 dark:bg-slate-800/60">Priority</th>
          <td class="px-2 py-1">{task.priority || "—"}</td>
        </tr>
      </tbody>
    </table>
  </div>
</article>
