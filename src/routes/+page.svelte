<script lang="ts">
	let { data } = $props();
	let { supabase } = $derived(data);

	import Button from '$lib/components/ui/button/button.svelte';
	import { CircleArrowUp } from '@lucide/svelte';
</script>

<div class="bg-[#1e1919] h-screen">
	<div class="text-white text-center pt-[72px] max-w-[777px] mx-auto px-4 md:px-0">
		<h1 class="md:text-6xl text-3xl">
			Securely Collaborate on your content with your team and clients
		</h1>
		<p class="md:text-lg text-sm mt-5">
			Store, share, and access your files effortlessly—anytime, anywhere. Our cloud-based platform
			makes it easy to keep your documents, photos, and videos safe and organized.
		</p>

		<form action="?/google" method="post">
			<Button class="font-bold mt-4 bg-blue-600 hover:bg-secondary text-black" type="submit">
				Get Started
				<CircleArrowUp class="size-5" />
			</Button>
		</form>
	</div>
	<video
		src="https://aem.dropbox.com/cms/content/dam/dropbox/warp/en-us/dropbox/dbx1-hero-1920x1080.mp4"
		class="mt-10 h-[calc(100vh-72px)] w-full object-cover"
		autoplay
		playsinline
		loop
		muted
	>
		Browser
	</video>
</div>
