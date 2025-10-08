<script>
  import { lanes } from "$lib/stores";
</script>

<div class="min-h-screen bg-slate-900 text-slate-100">
  <main class="max-w-7xl mx-auto p-6">
    <h1 class="text-3xl font-extrabold">Kanban <span class="text-sky-400">Board</span></h1>
    <section class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {#each $lanes as lane}
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">{lane.title}</div>
      {/each}
    </section>
  </main>
</div>
