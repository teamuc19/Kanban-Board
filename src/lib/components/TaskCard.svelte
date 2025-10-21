<script>
  import { format, parseISO, isValid, formatDistanceToNow } from "date-fns";
  import { de } from "date-fns/locale";

  export let task;
  export let laneIndex;
  export let onDragStart;
  export let onRemove;

  const handleDragStart = (e) => onDragStart?.(e, task, laneIndex);
  const remove = () => onRemove?.(task.id, laneIndex);

  // --- Helpers: date-fns ---
  const toDate = (v) => (typeof v === "string" ? parseISO(v) : (v ? new Date(v) : new Date()));
  const fmtAbs = (d, pat = "dd.MM.yyyy") => (isValid(d) ? format(d, pat, { locale: de }) : "");
  const fmtRel = (d) => (isValid(d) ? formatDistanceToNow(d, { addSuffix: true, locale: de }) : "");

  const createdAt = toDate(task?.created || new Date());
  const dueAt = task?.due ? toDate(task.due) : null;

  // --- Share ---
  function shareTask() {
    const text =
`Task: ${task.title ?? ""}
Description: ${task.desc ?? ""}
Due: ${dueAt ? fmtAbs(dueAt) : "-"}
Points: ${task.points ?? "-"}
Priority: ${task.priority ?? "-"}`;
    if (navigator.share) {
      navigator.share({ title: task.title || "Task", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      alert("Task-Details wurden in die Zwischenablage kopiert.");
    }
  }

  // --- CSV (single) ---
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  function downloadCSV() {
    const header = "id,title,desc,created,due,points,priority,laneIndex\n";
    const row = [
      task.id ?? "",
      task.title ?? "",
      task.desc ?? "",
      isValid(createdAt) ? format(createdAt, "yyyy-MM-dd") : "",
      isValid(dueAt) ? format(dueAt, "yyyy-MM-dd") : (task.due ?? ""),
      task.points ?? "",
      task.priority ?? "",
      laneIndex ?? ""
    ].map(esc).join(",");
    const blob = new Blob([header + row], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    const safeName = (task.title || "task").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    a.href = URL.createObjectURL(blob);
    a.download = `${safeName || "task"}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  // A11y: Rolle + Tastatur
  function onKeydown(e) { if (e.key === "Enter" || e.key === " ") e.preventDefault(); }
</script>

<div
  class="rounded border border-orange-200 bg-orange-50 p-3 shadow-sm cursor-move max-w-full overflow-hidden"
  draggable="true"
  on:dragstart={handleDragStart}
  role="button"
  tabindex="0"
  aria-label={`Drag task: ${task?.title ?? "task"}`}
  on:keydown={onKeydown}
>
  <!-- Kopf: Titel + Aktionen -->
  <div class="grid grid-cols-1 md:[grid-template-columns:minmax(0,1fr)_auto] gap-2 items-start">
    <h3 class="font-medium text-slate-800 min-w-0 break-words" title={task.title}>
      {task.title}
    </h3>

    <div class="flex items-center gap-1 justify-start md:justify-end shrink-0 flex-wrap whitespace-nowrap">
      <button
        type="button"
        class="text-xs px-2 py-1 rounded border border-black/10 hover:bg-white/60"
        on:click={shareTask}
        title="Share"
        aria-label="Share task"
      >Share</button>

      <button
        type="button"
        class="text-xs px-2 py-1 rounded border border-black/10 hover:bg-white/60"
        on:click={downloadCSV}
        title="CSV"
        aria-label="Download CSV"
      >CSV</button>

      <button
        type="button"
        class="text-xs px-2 py-1 rounded border border-black/10 hover:bg-white/60"
        on:click={remove}
        title="Delete"
        aria-label="Delete task"
      >Delete</button>
    </div>
  </div>

  <!-- Beschreibung -->
  {#if task.desc}
    <p class="mt-2 text-[13px] text-slate-700 break-words">{task.desc}</p>
  {/if}

  <!-- Divider -->
  <div class="my-3 h-px bg-orange-200/70"></div>

  <!-- Eigenschaften: Liste mit date-fns-Formatierung -->
  <ul class="space-y-1.5 text-[13px]">
    <li class="flex items-baseline justify-between gap-3">
      <span class="text-slate-600">Creation-Date</span>
      <span class="font-medium text-slate-800" title={fmtRel(createdAt)}>
        {fmtAbs(createdAt)} <span class="text-slate-500">({fmtRel(createdAt)})</span>
      </span>
    </li>

    {#if dueAt}
      <li class="flex items-baseline justify-between gap-3">
        <span class="text-slate-600">Due-Date</span>
        <span class="font-medium text-slate-800" title={fmtRel(dueAt)}>
          {#if isValid(dueAt)}
            {fmtAbs(dueAt)} <span class="text-slate-500">({fmtRel(dueAt)})</span>
          {:else}
            {task.due}
          {/if}
        </span>
      </li>
    {/if}

    {#if task.points != null}
      <li class="flex items-baseline justify-between gap-3">
        <span class="text-slate-600">Story Points</span>
        <span class="font-medium text-slate-800">{task.points}</span>
      </li>
    {/if}

    {#if task.priority}
      <li class="flex items-baseline justify-between gap-3">
        <span class="text-slate-600">Priority</span>
        <span class="font-medium text-slate-800">{task.priority}</span>
      </li>
    {/if}
  </ul>
</div>
