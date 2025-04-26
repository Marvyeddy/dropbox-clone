<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { filesStore } from '$lib/store';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Loader2 } from '@lucide/svelte';

	import * as Dialog from '$lib/components/ui/dialog';

	const supabase = page.data.supabase;
	const user = page.data.user;

	type FileData = {
		id: string;
		user_id: string;
		file_path: string;
		file_name: string;
		file_type: string;
		created_at: string;
		download_url: string;
	};

	let deletingId = $state<string | null>(null);

	function getPublicUrl(file_path: string): string {
		// Use Supabase's built-in getPublicUrl method
		const { data } = supabase.storage.from('uploads').getPublicUrl(file_path);
		return data.publicUrl;
	}

	export async function fetchFiles() {
		try {
			const { data, error } = await supabase
				.from('files')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;

			const filesWithUrls = data.map((file: FileData) => ({
				...file,
				download_url: getPublicUrl(file.file_path)
			}));

			filesStore.set(filesWithUrls);
		} catch (error) {
			console.error('Error fetching files:', error);
			toast.error('Failed to load files');
		}
	}

	onMount(fetchFiles);

	async function deleteFile(file: FileData) {
		if (!file.id) {
			// Try using file_path as fallback identifier
			if (!file.file_path) {
				toast.error('File identifier missing');
				return;
			}
			// For files without ID, we'll use file_path as the identifier
			deletingId = file.file_path;
		} else {
			deletingId = file.id;
		}

		if (user?.id !== file.user_id) {
			toast.error('You can only delete your own files');
			deletingId = null;
			return;
		}

		try {
			// Delete from storage first
			const { error: storageError } = await supabase.storage
				.from('uploads')
				.remove([file.file_path]);

			if (storageError) throw storageError;

			// Then delete from database
			const deleteCondition = file.id
				? { column: 'id', value: file.id }
				: { column: 'file_path', value: file.file_path };

			const { error: dbError } = await supabase
				.from('files')
				.delete()
				.eq(deleteCondition.column, deleteCondition.value);

			if (dbError) throw dbError;

			toast.success(`"${file.file_name}" deleted successfully`);
			await fetchFiles(); // Refresh the list
		} catch (error) {
			console.error('Delete error:', error);
			toast.error(`Failed to delete "${file.file_name}"`);
		} finally {
			deletingId = null;
		}
	}
</script>

<div class="my-10 border rounded-md shadow-md">
	<h1 class="py-5 font-medium pl-5">Files ({$filesStore.length})</h1>

	{#if $filesStore.length > 0}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Type</Table.Head>
					<Table.Head>File Name</Table.Head>
					<Table.Head>File Type</Table.Head>
					<Table.Head>Date Added</Table.Head>
					<Table.Head>Link</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each $filesStore as file}
					<Table.Row>
						<Table.Cell>{file.file_type.split('/')[0] || 'File'}</Table.Cell>
						<Table.Cell>{file.file_name}</Table.Cell>
						<Table.Cell>{file.file_type}</Table.Cell>
						<Table.Cell>{new Date(file.created_at).toLocaleDateString()}</Table.Cell>
						<Table.Cell>
							<a
								href={file.download_url}
								class="text-blue-600 hover:underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								Download
							</a>
						</Table.Cell>

						<Table.Cell class="text-right">
							<Dialog.Root>
								<Dialog.Trigger>
									<Button
										variant="ghost"
										size="sm"
										class="text-red-600 hover:text-red-800 hover:bg-red-50"
									>
										<Trash2 />
									</Button>
								</Dialog.Trigger>
								<Dialog.Content>
									<Dialog.Header>
										<Dialog.Title>Are you sure you want to delete this file?</Dialog.Title>
									</Dialog.Header>

									<Dialog.Description>
										This action cannot be undone. This will permanently delete your file and remove
										your data from our servers.
									</Dialog.Description>

									<Dialog.Footer>
										<Button
											variant="destructive"
											size="sm"
											onclick={() => deleteFile(file)}
											disabled={deletingId === file.id || deletingId === file.file_path}
										>
											{#if deletingId === file.id || deletingId === file.file_path}
												<Loader2 class="w-4 h-4 animate-spin mr-1" />
												Deleting...
											{:else}
												Delete
											{/if}
										</Button>
									</Dialog.Footer>
								</Dialog.Content>
							</Dialog.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{:else}
		<div class="flex items-center justify-center mb-5">
			<p class="text-gray-400 text-sm">No files uploaded</p>
		</div>
	{/if}
</div>
