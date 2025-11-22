import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      {/* First tab uses the index.js screen in this folder */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Survey",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Data & Settings",
        }}
      />
    </Tabs>
  );
}