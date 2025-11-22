import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: '首頁',
        }}
      />
      <Tabs.Screen
        name="survey"
        options={{
          title: '問卷',
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: '資料',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
        }}
      />
    </Tabs>
  );
}