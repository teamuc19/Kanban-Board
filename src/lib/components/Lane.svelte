<script>
  import TaskCard from "./TaskCard.svelte";
  export let lane;
  export let laneIndex;
  export let onDrop;
  export let onDragStart;
  export let onRemove;
  export let filter = "";

  const matchesText = (task, q) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (task.title?.toLowerCase().includes(s) || task.desc?.toLowerCase().includes(s));
  };

  // Summe der Story Points
  $: totalPoints = (lane.tasks || [])
    .map(t => typeof t.points === "number" ? t.points : 0)
    .reduce((a,b) => a + b, 0);

  const isOverdue = (task) => {
    if (!task.due) return false;
    const today = new Date();
    const due = new Date(task.due);
    return !isNaN(due) && due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
</script>

<div class="space-y-3">
  <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow overflow-hidden">
    <div class="sticky top-0 z-10 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-white/10 to-transparent flex items-center justify-between">
      <h2 class="text-sm font-semibold tracking-wide uppercase text-slate-200">
        {lane.title}
      </h2>
      <div class="text-xs text-slate-300">
        <span class="inline-block rounded-lg bg-white/10 px-2 py-1">Σ Story Points: <strong>{totalPoints}</strong></span>
      </div>
    </div>

    <div
      class={`lane-${lane.title.toLowerCase()} ${lane.color} min-h-[420px] max-h-[70vh] overflow-y-auto p-3`}
      role="list"
      aria-label={`Lane ${lane.title}`}
      on:dragover|preventDefault
      on:drop={(e) => onDrop(e, laneIndex)}
    >
      {#if lane.tasks.filter((t) => matchesText(t, filter)).length === 0}
        <p class="text-sm text-slate-300/80 text-center py-6">
          {filter ? "No matches…" : "Drop items here…"}
        </p>
      {/if}

      <div class="space-y-3">
        {#each lane.tasks.filter((t) => matchesText(t, filter)) as task (task.id)}
          <div class={isOverdue(task) ? "ring-1 ring-rose-400/70 rounded-xl" : ""}>
            <TaskCard
              role="listitem"
              {task}
              {laneIndex}
              {onDragStart}
              onRemove={onRemove}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
