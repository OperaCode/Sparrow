import { Stack } from 'expo-router';
import { DraftProvider } from '@/contexts/draft.context';

export default function SendLayout() {
  return (
    <DraftProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="package" />
         <Stack.Screen name="pickup" />
        <Stack.Screen name="destination" />
        <Stack.Screen name="summary" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="confirmation" />
      </Stack>
    </DraftProvider>
  );
}
