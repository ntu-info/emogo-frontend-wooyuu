import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './utils/database';
import { requestNotificationPermission, scheduleDailyNotifications } from './utils/notifications';

export default function RootLayout() {
  useEffect(() => {
    async function setup() {
      // 初始化資料庫
      await initDatabase();
      
      // 請求通知權限並排程
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDailyNotifications();
      }
    }
    setup();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="vlog"
          options={{ title: '錄製 Vlog', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}