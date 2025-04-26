<script lang="ts">
	let { user } = $props();
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import ToggleMode from './ToggleMode.svelte';
</script>

<header class="p-2 flex items-center justify-between sticky top-0 left-0 z-50 bg-background">
	<a href="/" class="flex items-center gap-2">
		<img src="/logo.svg" alt="Logo" class="bg-blue-600 p-2 rounded-lg" />
		<p class="font-semibold text-xl hidden md:block">Dropbox</p>
	</a>

	<div class="flex items-center gap-x-3">
		<ToggleMode />
		{#if user}
			<Avatar.Root>
				<Avatar.Image src={user?.user_metadata?.avatar_url} alt="avatar_url" />
				<Avatar.Fallback>CN</Avatar.Fallback>
			</Avatar.Root>

			<form action="/?/logOut" method="POST">
				<Button
					type="submit"
					size="sm"
					variant="secondary"
					class="text-base hover:bg-destructive hover:text-white">Logout</Button
				>
			</form>
		{/if}
	</div>
</header>
