import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import {
  scheduleDailyNotifications,
  cancelAllNotifications,
  getScheduledNotifications,
} from '../utils/notifications';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    checkNotifications();
  }, []);

  const checkNotifications = async () => {
    const scheduled = await getScheduledNotifications();
    setScheduledCount(scheduled.length);
    setNotificationsEnabled(scheduled.length > 0);
  };

  const toggleNotifications = async (value) => {
    if (value) {
      await scheduleDailyNotifications();
      Alert.alert('已開啟', '每日三次提醒已排程 (9:00, 14:00, 20:00)');
    } else {
      await cancelAllNotifications();
      Alert.alert('已關閉', '所有通知已取消');
    }
    checkNotifications();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>設定</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知</Text>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>每日提醒</Text>
            <Text style={styles.settingHint}>9:00, 14:00, 20:00</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>

        <Text style={styles.infoText}>
          已排程通知數量: {scheduledCount}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>關於</Text>
        <Text style={styles.aboutText}>
          Experience Sampling App{'\n'}
          用於收集每日情緒、Vlog 和位置資料
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>資料說明</Text>
        <Text style={styles.aboutText}>
          • 問卷: 情緒、精力、壓力 (1-5分){'\n'}
          • Vlog: 1秒影片記錄{'\n'}
          • GPS: 經緯度座標{'\n\n'}
          每次提交問卷時會自動記錄GPS位置
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});