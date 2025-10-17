<script>
  import TaskCard from "./TaskCard.svelte";
  export let lane;
  export let laneIndex;
  export let onDrop;
  export let onDragStart;
  export let onRemove;

  // Für Archive-Aktion bubbled TaskCard ein Custom-Event hoch
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
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
      {#if lane.tasks.length === 0}
        <p class="text-sm text-slate-300/80 text-center py-6">
          Drop items here…
        </p>
      {/if}

      <div class="space-y-3">
        {#each lane.tasks as task (task.id)}
          <TaskCard
            role="listitem"
            {task}
            {laneIndex}
            {onDragStart}
            onRemove={onRemove}
            on:archive={(e) => dispatch("archive", e.detail)}
          />
        {/each}
      </div>
    </div>
  </div>
</div>
