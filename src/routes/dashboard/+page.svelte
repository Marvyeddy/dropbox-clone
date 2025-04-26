<script lang="ts">
	import DataGrid from '$lib/components/DataGrid.svelte';
	import DropZone from '$lib/components/DropZone.svelte';

	const { data } = $props();
	const { supabase, user } = $derived(data);
</script>

<div class="max-w-5xl mx-auto">
	<DropZone {supabase} {user} />
	<DataGrid />
</div>
