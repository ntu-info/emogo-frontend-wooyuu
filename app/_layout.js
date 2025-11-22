import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="details"
        options={{ title: "Details" }}
      />
      <Stack.Screen
        name="camera"
        options={{ title: "Record Vlog" }}
      />
    </Stack>
  );
}