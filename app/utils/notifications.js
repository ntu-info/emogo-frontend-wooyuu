import * as Notifications from 'expo-notifications';

// 設定通知處理方式
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 請求通知權限
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 排程每日三次通知 (9:00, 14:00, 20:00)
export async function scheduleDailyNotifications() {
  // 先取消所有現有通知
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const times = [
    { hour: 9, minute: 0 },   // 早上 9 點
    { hour: 14, minute: 0 },  // 下午 2 點
    { hour: 20, minute: 0 },  // 晚上 8 點
  ];
  
  for (const time of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Experience Sampling',
        body: '是時候記錄你的心情了！點擊填寫問卷。',
        data: { screen: 'survey' },
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
    });
  }
  
  console.log('已排程每日三次通知');
}

// 取得所有已排程的通知
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// 取消所有通知
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}