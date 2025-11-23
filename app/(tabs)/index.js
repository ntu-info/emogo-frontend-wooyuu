import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { saveSentiment, saveLocation, initDatabase } from "../../lib/database";

export default function HomeScreen() {
  const router = useRouter();
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initDatabase();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Save sentiment
      await saveSentiment(mood, energy, stress);

      // Get and save GPS location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          // Try to get current position with timeout
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            mayShowUserSettingsDialog: true,
          });
          await saveLocation(location.coords.latitude, location.coords.longitude);
        } catch (locError) {
          // Fallback: try last known location
          const lastLocation = await Location.getLastKnownPositionAsync({});
          if (lastLocation) {
            await saveLocation(lastLocation.coords.latitude, lastLocation.coords.longitude);
          } else {
            console.log("Location unavailable, skipping GPS save");
          }
        }
      }

      Alert.alert("Success", "Data saved! Now record a 1-second vlog.", [
        { text: "Record Vlog", onPress: () => router.push("/camera") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  const renderSlider = (label, value, setValue) => (
    <View style={styles.sliderContainer}>
      <Text style={styles.label}>{label}: {value}</Text>
      <View style={styles.buttonRow}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.numButton, value === num && styles.numButtonActive]}
            onPress={() => setValue(num)}
          >
            <Text style={[styles.numText, value === num && styles.numTextActive]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>

      {renderSlider("Mood (1=Bad, 5=Great)", mood, setMood)}
      {renderSlider("Energy (1=Low, 5=High)", energy, setEnergy)}
      {renderSlider("Stress (1=Low, 5=High)", stress, setStress)}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Saving..." : "Submit & Record Vlog"}
        </Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 30,
    marginTop: 20,
  },
  sliderContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  numButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  numButtonActive: {
    backgroundColor: "#007AFF",
  },
  numText: {
    fontSize: 18,
    color: "#333",
  },
  numTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
