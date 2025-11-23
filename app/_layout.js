import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: "Back" }}>
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
      <Stack.Screen
        name="dataview"
        options={{ title: "View Data" }}
      />
    </Stack>
  );
}
