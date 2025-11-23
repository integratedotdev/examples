<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
  :global(html),
  :global(body) {
    margin: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  :global(button) {
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    border: none;
    background-color: #000;
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
  }

  :global(button:disabled) {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>