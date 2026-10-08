import { Stack } from 'expo-router';
import { ErrandCartProvider } from '@/contexts/ErrandCartContext';

export default function ErrandLayout() {
  return (
    <ErrandCartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="type" />
        <Stack.Screen name="groceries-categories" />
        <Stack.Screen name="groceries-products" />
        <Stack.Screen name="groceries-cart" />
        <Stack.Screen name="food-vendors" />
        <Stack.Screen name="food-menu" />
        <Stack.Screen name="food-cart" />
        <Stack.Screen name="address" />
        <Stack.Screen name="summary" />
        <Stack.Screen name="request" />
        <Stack.Screen name="confirmation" />
      </Stack>
    </ErrandCartProvider>
  );
}
