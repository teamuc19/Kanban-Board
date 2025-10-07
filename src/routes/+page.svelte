<script lang="ts">
  // Noch keine Logik, nur Layout
</script>

<!-- NAVBAR -->
<header class="wrap topbar">
  <h1 class="brand">Kanban Board</h1>
  <nav class="actions">
    <button class="btn primary">+ Issue</button>
  </nav>
</header>

<!-- BOARD -->
<main class="wrap board">
  <section class="lane">
    <header class="lane-head todo"><h2>Do</h2></header>
    <div class="lane-body"></div>
  </section>

  <section class="lane">
    <header class="lane-head doing"><h2>Doing</h2></header>
    <div class="lane-body"></div>
  </section>

  <section class="lane">
    <header class="lane-head done"><h2>Done</h2></header>
    <div class="lane-body"></div>
  </section>

  <section class="lane">
    <header class="lane-head archive"><h2>Archiv</h2></header>
    <div class="lane-body"></div>
  </section>
</main>

<!-- FOOTER -->
<footer class="wrap foot">
  <span>© {new Date().getFullYear()} – Mein erstes Commit 🚀</span>
</footer>

<style>
  :global(html){color-scheme:dark}
  :global(body){margin:0;background:#f4f6fb;color:#0b1021;font-family:ui-sans-serif,system-ui}

  .wrap{max-width:1100px;margin:0 auto;padding:16px}

  /* NAV */
  .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  .brand{font-size:26px;font-weight:800}
  .actions{display:flex;gap:8px}
  .btn{border:0;border-radius:14px;padding:10px 14px;cursor:pointer;background:#0ea5e9;color:#fff;box-shadow:0 6px 20px rgba(2,6,23,.08)}

  /* BOARD */
  .board{display:grid;gap:16px}
  @media(min-width:900px){.board{grid-template-columns:repeat(4,1fr)}}

  .lane{background:#fff;border-radius:16px;box-shadow:0 12px 35px rgba(2,6,23,.08);overflow:hidden;display:flex;flex-direction:column}
  .lane-head{padding:12px 14px;color:#fff;font-weight:700}
  .lane-head.todo{background:#1e3a8a}
  .lane-head.doing{background:#f59e0b}
  .lane-head.done{background:#10b981}
  .lane-head.archive{background:#8b5cf6}
  .lane-body{padding:12px;min-height:200px;background:#f8fafc}

  /* FOOTER */
  .foot{margin-top:20px;text-align:center;color:#475569}
</style>
