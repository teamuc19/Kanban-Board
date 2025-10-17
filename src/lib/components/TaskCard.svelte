<script>
  import { createEventDispatcher, onMount } from "svelte";
  export let task;
  export let onDragStart;
  export let laneIndex;
  export let onRemove;
  export let role = "listitem";

  const dispatch = createEventDispatcher();
  const isDoneLane = (idx) => idx === 2;

  function archive() {
    dispatch("archive", { taskId: task.id, fromLaneIndex: laneIndex });
  }

  function confirmRemove() {
    if (confirm(`Delete "${task.title}"?`)) onRemove(task.id, laneIndex);
  }

  function onKeydown(e) {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      confirmRemove();
    } else if (e.key.toLowerCase() === "a" && isDoneLane(laneIndex)) {
      e.preventDefault();
      archive();
    }
  }
</script>

<article
  {role}
  tabindex="0"
  draggable="true"
  on:dragstart={(e) => onDragStart(e, task, laneIndex)}
  on:keydown={onKeydown}
  aria-label={task.title}
  class="group bg-white/95 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/40
         rounded-xl p-3 shadow-sm hover:shadow-md focus:ring-2 ring-sky-400 outline-none
         transition-shadow cursor-grab active:cursor-grabbing"
>
  <div class="flex items-start justify-between gap-3">
    <h3 class="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{task.title}</h3>

    <div class="flex items-center gap-1">
      {#if isDoneLane(laneIndex)}
        <button
          type="button"
          class="shrink-0 rounded-lg px-2 py-1 text-[12px] text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          aria-label="Archive task"
          on:click={archive}
          title="Archive (A)"
        >
          📦
        </button>
      {/if}
      <button
        type="button"
        class="shrink-0 rounded-lg px-2 py-1 text-[12px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        aria-label="Delete task"
        on:click={confirmRemove}
        title="Delete (Del)"
      >
        🗑️
      </button>
    </div>
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
