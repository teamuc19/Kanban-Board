<script>
  import TaskCard from "./TaskCard.svelte";
  export let lane;
  export let laneIndex;
  export let onDrop;
  export let onDragStart;
  export let onRemove;
  export let filter = "";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  const matches = (task, q) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (task.title?.toLowerCase().includes(s) || task.desc?.toLowerCase().includes(s));
  };

  const isOverdue = (task) => {
    if (!task.due) return false;
    const today = new Date();
    const due = new Date(task.due);
    // Nur "offen" (nicht Done/Archiv) hervorheben → wir lassen es Lane-agnostisch,
    // Darstellung übernimmt TaskCard per Klassennamen.
    return !isNaN(due) && due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
</script>

<div class="space-y-3">
  <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow overflow-hidden">
    <div class="sticky top-0 z-10 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-white/10 to-transparent flex items-center justify-between">
      <h2 class="text-sm font-semibold tracking-wide uppercase text-slate-200">
        {lane.title}
      </h2>
      <span class="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-200" aria-label={`Tasks in ${lane.title}: ${lane.tasks.length}`}>
        {lane.tasks.length}
      </span>
    </div>

    <div
      class={`lane-${lane.title.toLowerCase()} ${lane.color} min-h-[420px] max-h-[70vh] overflow-y-auto p-3`}
      role="list"
      aria-label={`Lane ${lane.title}`}
      on:dragover|preventDefault
      on:drop={(e) => onDrop(e, laneIndex)}
    >
      {#if lane.tasks.filter((t) => matches(t, filter)).length === 0}
        <p class="text-sm text-slate-300/80 text-center py-6">
          {filter ? "No matches…" : "Drop items here…"}
        </p>
      {/if}

      <div class="space-y-3">
        {#each lane.tasks.filter((t) => matches(t, filter)) as task (task.id)}
          <div class={isOverdue(task) ? "ring-1 ring-rose-400/60 rounded-xl" : ""}>
            <TaskCard
              role="listitem"
              {task}
              {laneIndex}
              {onDragStart}
              onRemove={onRemove}
              on:archive={(e) => dispatch("archive", e.detail)}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
