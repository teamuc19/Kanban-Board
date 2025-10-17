<script>
  export let showDialog;
  export let newTask;
  export let addTask;
  export let closeDialog;
</script>

{#if showDialog}
  <dialog open class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <form
      class="w-[min(92vw,420px)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
      on:submit|preventDefault={addTask}
      aria-label="New Task Dialog"
    >
      <div class="px-5 pt-5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">New Task</h2>
      </div>

      <div class="px-5 py-4 space-y-3">
        <label class="block">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Title *</span>
          <input
            class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-slate-800 dark:text-slate-100"
            placeholder="Title"
            bind:value={newTask.title}
            required
          />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
          <textarea
            class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-slate-800 dark:text-slate-100"
            rows="3"
            placeholder="Details…"
            bind:value={newTask.desc}
          ></textarea>
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Due</span>
          <input
            type="date"
            class="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-slate-800 dark:text-slate-100"
            bind:value={newTask.due}
          />
        </label>
      </div>

      <div class="px-5 pb-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
        <button type="button" on:click={closeDialog}
                class="rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          Cancel
        </button>
        <button type="submit"
                class="rounded-xl px-4 py-2 font-medium bg-sky-600 hover:bg-sky-500 active:scale-[.98] text-white shadow-md shadow-sky-900/30">
          Add
        </button>
      </div>
    </form>
  </dialog>
{/if}