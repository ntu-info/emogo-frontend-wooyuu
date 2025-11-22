import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { getAllSentiments, getAllLocations, getAllVlogs } from "../../lib/database";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [stats, setStats] = useState({ sentiments: 0, locations: 0, vlogs: 0 });

  useEffect(() => {
    loadStats();
    checkNotificationStatus();
  }, []);

  const loadStats = async () => {
    try {
      const sentiments = await getAllSentiments();
      const locations = await getAllLocations();
      const vlogs = await getAllVlogs();
      setStats({
        sentiments: sentiments.length,
        locations: locations.length,
        vlogs: vlogs.length,
      });
    } catch (error) {
      console.log("Error loading stats:", error);
    }
  };

  const checkNotificationStatus = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    setNotificationsEnabled(scheduled.length > 0);
  };

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please enable notifications");
      return;
    }

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule 3 daily notifications at 9am, 2pm, 8pm
    const times = [
      { hour: 9, minute: 0 },
      { hour: 14, minute: 0 },
      { hour: 20, minute: 0 },
    ];

    for (const time of times) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Experience Sampling",
          body: "Time to record how you're feeling!",
        },
        trigger: {
          type: "daily",
          hour: time.hour,
          minute: time.minute,
        },
      });
    }

    setNotificationsEnabled(true);
    Alert.alert("Success", "Notifications set for 9:00, 14:00, and 20:00 daily");
  };

  const disableNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    setNotificationsEnabled(false);
    Alert.alert("Disabled", "All notifications cancelled");
  };

  const exportData = async () => {
    try {
      const sentiments = await getAllSentiments();
      const locations = await getAllLocations();
      const vlogs = await getAllVlogs();

      // Create data folder if not exists
      const dataDir = FileSystem.documentDirectory + "data/";
      const dirInfo = await FileSystem.getInfoAsync(dataDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dataDir, { intermediates: true });
      }

      // Export sentiments to JSON
      const sentimentsJson = JSON.stringify(sentiments, null, 2);
      const sentimentsPath = dataDir + "sentiments.json";
      await FileSystem.writeAsStringAsync(sentimentsPath, sentimentsJson);

      // Export locations to JSON
      const locationsJson = JSON.stringify(locations, null, 2);
      const locationsPath = dataDir + "locations.json";
      await FileSystem.writeAsStringAsync(locationsPath, locationsJson);

      // Export vlogs metadata to JSON
      const vlogsJson = JSON.stringify(vlogs, null, 2);
      const vlogsPath = dataDir + "vlogs.json";
      await FileSystem.writeAsStringAsync(vlogsPath, vlogsJson);

      // Create summary
      const summary = {
        exportDate: new Date().toISOString(),
        counts: {
          sentiments: sentiments.length,
          locations: locations.length,
          vlogs: vlogs.length,
        },
        timeRange: {
          first: sentiments.length > 0 ? sentiments[sentiments.length - 1].timestamp : null,
          last: sentiments.length > 0 ? sentiments[0].timestamp : null,
        },
      };
      const summaryPath = dataDir + "summary.json";
      await FileSystem.writeAsStringAsync(summaryPath, JSON.stringify(summary, null, 2));

      Alert.alert(
        "Export Complete",
        `Exported to data folder:\n- ${sentiments.length} sentiments\n- ${locations.length} locations\n- ${vlogs.length} vlogs`,
        [
          { text: "OK" },
          { text: "Share Sentiments", onPress: () => shareFile(sentimentsPath) },
        ]
      );

      loadStats();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const shareFile = async (filePath) => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath);
    } else {
      Alert.alert("Sharing not available");
    }
  };

  const viewDataFolder = async () => {
    try {
      const dataDir = FileSystem.documentDirectory + "data/";
      const dirInfo = await FileSystem.getInfoAsync(dataDir);

      if (!dirInfo.exists) {
        Alert.alert("No Data", "No data has been exported yet");
        return;
      }

      const files = await FileSystem.readDirectoryAsync(dataDir);
      Alert.alert("Data Folder Contents", files.join("\n") || "Empty");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings & Data</Text>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Collected Data</Text>
        <Text style={styles.stat}>Sentiments: {stats.sentiments}</Text>
        <Text style={styles.stat}>Locations: {stats.locations}</Text>
        <Text style={styles.stat}>Vlogs: {stats.vlogs}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadStats}>
          <Text style={styles.refreshText}>Refresh Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Reminders</Text>
        <Text style={styles.description}>
          {notificationsEnabled
            ? "Notifications: ON (9:00, 14:00, 20:00)"
            : "Notifications: OFF"}
        </Text>
        <TouchableOpacity
          style={[styles.button, notificationsEnabled && styles.buttonDanger]}
          onPress={notificationsEnabled ? disableNotifications : setupNotifications}
        >
          <Text style={styles.buttonText}>
            {notificationsEnabled ? "Disable Notifications" : "Enable 3x Daily Reminders"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <TouchableOpacity style={styles.button} onPress={exportData}>
          <Text style={styles.buttonText}>Export All Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={viewDataFolder}>
          <Text style={styles.buttonTextSecondary}>View Data Folder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  stat: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonDanger: {
    backgroundColor: "#ff4444",
  },
  buttonSecondary: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonTextSecondary: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
  },
  refreshButton: {
    marginTop: 10,
  },
  refreshText: {
    color: "#007AFF",
    fontSize: 14,
  },
});
