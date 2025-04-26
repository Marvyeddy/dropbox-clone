<script>
	import '../app.css';
	import '@fontsource/geist-sans';
	import { goto, invalidate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	let { data, children } = $props();
	let { user, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			const newUser = newSession?.user;
			const currentUser = user;

			// Invalidate if the user has changed (log in, log out, or switch account)
			if (newUser?.id !== currentUser?.id) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />
<Header {user} />
{@render children()}
