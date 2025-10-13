<script>
  export let task;
  export let onDragStart;
  export let laneIndex;
  export let onRemove;
  export let role = "listitem";
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
    <h3 class="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{task.title}</h3>

    <button
      type="button"
      class="shrink-0 rounded-lg px-2 py-1 text-[12px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
      aria-label="Delete task"
      on:click={() => onRemove(task.id, laneIndex)}
    >
      🗑️
    </button>
  </div>

  {#if task.desc}
    <p class="mt-1 text-[13px] text-slate-600 dark:text-slate-300 line-clamp-3">{task.desc}</p>
  {/if}

  {#if task.due}
    <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
      🗓️ {task.due}
    </p>
  {/if}
</article>
