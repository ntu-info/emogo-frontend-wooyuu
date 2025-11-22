import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { saveVlog } from "../lib/database";

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    setIsRecording(true);
    setCountdown(1);

    try {
      // Start recording
      const videoPromise = cameraRef.current.recordAsync({
        maxDuration: 1,
      });

      // Countdown timer
      setTimeout(() => {
        setCountdown(0);
      }, 1000);

      const video = await videoPromise;

      if (video?.uri) {
        // Save to data folder
        const dataDir = FileSystem.documentDirectory + "data/";
        const dirInfo = await FileSystem.getInfoAsync(dataDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dataDir, { intermediates: true });
        }

        const filename = `vlog_${Date.now()}.mp4`;
        const newPath = dataDir + filename;
        await FileSystem.moveAsync({ from: video.uri, to: newPath });

        // Save to database
        await saveVlog(newPath);

        Alert.alert("Success", "Vlog recorded and saved!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }

    setIsRecording(false);
    setCountdown(null);
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        mode="video"
      >
        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordText}>
            {isRecording ? "Recording..." : "Record 1s Vlog"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "#fff",
  },
  controls: {
    padding: 20,
    backgroundColor: "#000",
  },
  recordButton: {
    backgroundColor: "#ff4444",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  recordingButton: {
    backgroundColor: "#aa0000",
  },
  recordText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    padding: 15,
  },
  cancelText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
  },
  message: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
