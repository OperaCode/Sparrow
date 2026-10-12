import { Stack } from 'expo-router';
import { DraftProvider } from '@/contexts/DraftContext';

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
