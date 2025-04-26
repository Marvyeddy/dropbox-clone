import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies, url }) => {
	let { user, session } = await safeGetSession();

	if (user && url.pathname === '/') {
		// redirect to the dashboard if the user is already logged in
		throw redirect(303, '/dashboard');
	}

	if (!user && url.pathname !== '/') {
		// redirect to the login page if the user is not logged in
		throw redirect(303, '/');
	}

	return {
		user,
		cookies: cookies.getAll()
	};
};
