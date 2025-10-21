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

  $: totalPoints = (lane.tasks || [])
    .map(t => (typeof t.points === "number" ? t.points : 0))
    .reduce((a,b) => a + b, 0);

  const isOverdue = (task) => {
    if (!task.due) return false;
    const today = new Date();
    const due = new Date(task.due);
    return !isNaN(due) && due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
</script>

<div class="space-y-2">
  <div class="rounded border border-black/10 bg-white">
    <div class="sticky top-0 z-10 px-3 py-2 border-b border-black/10 flex items-center justify-between bg-white/85 backdrop-blur">
      <h2 class="text-xs font-semibold uppercase text-[#1b5673]">{lane.title}</h2>
      <span class="text-[11px] text-[#1b5673] bg-[#90D5FF]/40 border border-black/10 rounded px-2 py-0.5">
        {totalPoints}
      </span>
    </div>

    <div
      class={`lane-${lane.title.toLowerCase()} min-h-[480px] max-h-[70vh] overflow-y-auto overflow-x-hidden p-3`}
      role="list"
      aria-label={`Lane ${lane.title}`}
      on:dragover|preventDefault
      on:drop={(e) => onDrop(e, laneIndex)}
    >
      {#if lane.tasks.filter((t) => matchesText(t, filter)).length === 0}
        <p class="text-sm text-[#1b5673]/70 text-center py-6">
          {filter ? "No matches…" : "Drop items here…"}
        </p>
      {/if}

      <div class="space-y-2">
        {#each lane.tasks.filter((t) => matchesText(t, filter)) as task (task.id)}
          <div class={isOverdue(task) ? "ring-1 ring-rose-400/60 rounded" : ""}>
            <TaskCard role="listitem" {task} {laneIndex} {onDragStart} onRemove={onRemove} />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
