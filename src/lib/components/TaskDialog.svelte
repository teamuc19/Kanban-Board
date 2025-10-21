<script>
  import { tick } from "svelte";
  export let showDialog;
  export let newTask;     // { title, desc, due, points, priority }
  export let addTask;
  export let closeDialog;

  let titleEl;
  $: if (showDialog) { tick().then(() => titleEl?.focus()); }

  function onKeydown(e) {
    if (!showDialog) return;
    if (e.key === "Escape") { e.preventDefault(); closeDialog(); }
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if showDialog}
  <!-- Overlay etwas weicher -->
  <dialog
    open
    class="fixed inset-0 z-50 flex items-center justify-center bg-[#90D5FF]/40 p-4"
    aria-modal="true"
  >
    <form
      class="w-[min(92vw,560px)] rounded-2xl border border-[#1b5673]/15 bg-white/95 text-slate-900 shadow-2xl"
      on:submit|preventDefault={addTask}
      aria-label="New Task Dialog"
    >
      <div class="px-6 pt-6 pb-3 border-b border-[#1b5673]/15 bg-[#90D5FF]/30 rounded-t-2xl">
        <h2 class="text-lg font-semibold text-[#1b5673] tracking-tight">New Task</h2>
      </div>

      <div class="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block md:col-span-2">
          <span class="text-sm text-[#1b5673]">Title *</span>
          <input
            bind:this={titleEl}
            class="mt-1 w-full rounded-lg border border-[#1b5673]/25 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#90D5FF]/40"
            placeholder="Title"
            bind:value={newTask.title}
            required
          />
        </label>

        <label class="block md:col-span-2">
          <span class="text-sm text-[#1b5673]">Description</span>
          <textarea
            class="mt-1 w-full rounded-lg border border-[#1b5673]/25 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#90D5FF]/40"
            rows="3"
            placeholder="Details…"
            bind:value={newTask.desc}
          ></textarea>
        </label>

        <label class="block">
          <span class="text-sm text-[#1b5673]">Due-Date</span>
          <input
            type="date"
            class="mt-1 w-full rounded-lg border border-[#1b5673]/25 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#90D5FF]/40"
            bind:value={newTask.due}
          />
        </label>

        <label class="block">
          <span class="text-sm text-[#1b5673]">Story Points</span>
          <input
            type="number" min="0" step="1"
            class="mt-1 w-full rounded-lg border border-[#1b5673]/25 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#90D5FF]/40"
            placeholder="e.g. 3"
            bind:value={newTask.points}
          />
        </label>

        <label class="block">
          <span class="text-sm text-[#1b5673]">Priority</span>
          <select
            class="mt-1 w-full rounded-lg border border-[#1b5673]/25 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#90D5FF]/40"
            bind:value={newTask.priority}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
      </div>

      <div class="px-6 pb-6 pt-3 border-t border-[#1b5673]/15 flex justify-end gap-2 rounded-b-2xl">
        <button
          type="button"
          on:click={closeDialog}
          class="rounded-lg px-4 py-2 border border-[#1b5673]/25 text-[#1b5673] bg-white hover:bg-[#90D5FF]/20 text-sm font-medium transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="rounded-lg px-4 py-2 bg-[#1b5673] text-white hover:brightness-95 active:translate-y-px text-sm font-medium shadow-sm transition"
        >
          Add
        </button>
      </div>
    </form>
  </dialog>
{/if}
