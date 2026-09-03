import { Stack } from 'expo-router';

export default function ErrandLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="request" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}
