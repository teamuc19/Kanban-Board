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

  // --- ICS (single all-day event) ---
  function downloadICS() {
    const startDate = isValid(dueAt) ? dueAt : new Date();
    const uid = `${task.id || Date.now()}@kanban.local`;
    const dtstamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'"); // UTC stamp

    // Ganztag: DTSTART/DTEND nur als Datum; DTEND = Folgetag
    const DTSTART = format(startDate, "yyyyMMdd");
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    const DTEND = format(endDate, "yyyyMMdd");

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//kanban//svelte//DE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${DTSTART}`,
      `DTEND;VALUE=DATE:${DTEND}`,
      `SUMMARY:${escapeICS(task?.title || "Task")}`,
      `DESCRIPTION:${escapeICS(task?.desc || "")}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    triggerDownload(new Blob([lines], { type: "text/calendar;charset=utf-8;" }),
      fileSafe(task?.title || "task") + ".ics");
  }

  const escapeICS = (s) =>
    String(s).replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");
  const fileSafe = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "task";
  function triggerDownload(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
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
        on:click={downloadICS}
        title="ICS"
        aria-label="Download ICS"
      >ICS</button>

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
