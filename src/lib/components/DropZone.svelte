<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SupabaseClient, User } from '@supabase/supabase-js';
	import { toast } from 'svelte-sonner';
	import { filesStore } from '$lib/store';

	const { supabase, user }: { supabase: SupabaseClient; user: User | null } = $props();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);
	const BUCKET_NAME = 'uploads';

	async function uploadFilesToSupabase(files: File[]) {
		if (!user) {
			toast.error('You must be logged in to upload files');
			return;
		}

		toast.promise(
			(async () => {
				const uploadPromises = files.map(async (file) => {
					const filePath = `${user.id}/${crypto.randomUUID()}-${file.name}`;

					// Upload to Supabase Storage
					const { error: uploadError } = await supabase.storage
						.from(BUCKET_NAME)
						.upload(filePath, file);

					if (uploadError) {
						throw new Error(`Failed to upload: ${file.name} - ${uploadError.message}`);
					}

					// Generate signed URL
					const { data: signedUrlData, error: urlError } = await supabase.storage
						.from(BUCKET_NAME)
						.createSignedUrl(filePath, 3600); // 1 hour expiration

					if (urlError) {
						// Clean up the uploaded file if URL generation fails
						await supabase.storage.from(BUCKET_NAME).remove([filePath]);
						throw new Error(`Failed to generate URL: ${file.name}`);
					}

					// Save file metadata to database
					const { error: insertError } = await supabase.from('files').insert([
						{
							user_id: user.id,
							file_path: filePath,
							file_name: file.name,
							file_type: file.type,
							download_url: signedUrlData.signedUrl,
							bucket_name: BUCKET_NAME
						}
					]);

					if (insertError) {
						// Clean up the uploaded file if DB insert fails
						await supabase.storage.from(BUCKET_NAME).remove([filePath]);
						throw new Error(`Failed to save record: ${file.name}`);
					}

					return {
						user_id: user.id,
						file_path: filePath,
						file_name: file.name,
						file_type: file.type,
						download_url: signedUrlData.signedUrl,
						created_at: new Date().toISOString(),
						bucket_name: BUCKET_NAME
					};
				});

				const newFiles = await Promise.all(uploadPromises);
				filesStore.update((currentFiles) => [...newFiles, ...currentFiles]);
			})(),
			{
				loading: 'Uploading files...',
				success: '✅ Files uploaded successfully!',
				error: (err) => (err instanceof Error ? err.message : '❌ Upload failed')
			}
		);
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input?.files;
		if (files) {
			const uploadedFiles = Array.from(files).filter(validateFileSize);
			if (uploadedFiles.length > 0) {
				uploadFilesToSupabase(uploadedFiles);
			}
		}
	}

	function validateFileSize(file: File) {
		const fileSizeLimit = 10 * 1024 * 1024;
		return file.size <= fileSizeLimit;
	}
</script>

<button
	onclick={() => fileInput?.click()}
	ondragenter={(e: DragEvent) => {
		e.preventDefault();
		isDragging = true;
	}}
	ondragleave={(e: DragEvent) => {
		e.preventDefault();
		isDragging = false;
	}}
	ondrop={(e: DragEvent) => {
		e.preventDefault();
		isDragging = false;
		const files = e.dataTransfer?.files;
		if (files) {
			const droppedFiles = Array.from(files).filter(validateFileSize);
			if (droppedFiles.length > 0) {
				uploadFilesToSupabase(droppedFiles);
			} else {
				alert('Some files are too big.');
			}
		}
	}}
	ondragover={(e: DragEvent) => {
		e.preventDefault();
	}}
	class={cn('w-full rounded-lg bg-border/50 h-44 border-4 border-dashed relative', {
		'bg-primary/30': isDragging
	})}
>
	{#if isDragging}
		Drop files here
	{:else}
		Drag and Drop or click to add files
	{/if}
	<input onchange={handleFileUpload} type="file" bind:this={fileInput} hidden multiple />
</button>
