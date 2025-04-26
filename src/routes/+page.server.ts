import { redirect } from '@sveltejs/kit';

export const actions = {
	google: async ({ locals: { supabase }, url }) => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${url.origin}/auth/callback`
			}
		});

		if (data.url) {
			redirect(302, data.url);
		}
	},
	logOut: async ({ locals: { supabase } }) => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Error signing out:', error.message);
		} else {
			throw redirect(302, '/');
		}
	}
};
