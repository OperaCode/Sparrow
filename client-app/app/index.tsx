import { router, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth.context';

export default function Index() {
  const { isAuthed, profile } = useAuth();

  if (!isAuthed) return <Redirect href="/auth/phone" />;

  if (isAuthed && (!profile?.name || !profile?.community)) {
    return <Redirect href="/auth/onboarding" />;
  }

  if (isAuthed && profile?.name && profile?.community) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/phone" />;
}
