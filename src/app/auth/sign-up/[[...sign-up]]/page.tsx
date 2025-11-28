import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page - Redirecting to sign in.'
};

export default function Page() {
  // Signup is disabled - all users are created by admins
  // Redirect to sign-in page
  redirect('/auth/sign-in');
}
