<script>
  import "../app.css";
  let { children } = $props();
</script>

<svelte:head>
  <meta name="theme-color" content="#0f172a" />
  <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

{@render children?.()}
