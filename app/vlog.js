import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { documentDirectory, getInfoAsync, makeDirectoryAsync, copyAsync, deleteAsync } from 'expo-file-system/legacy';
import { saveVlog } from './utils/database';

export default function VlogScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [facing, setFacing] = useState('front');

  // 確保 vlogs 資料夾存在
  useEffect(() => {
    async function ensureDir() {
      const dir = documentDirectory + 'vlogs/';
      const info = await getInfoAsync(dir);
      if (!info.exists) {
        await makeDirectoryAsync(dir, { intermediates: true });
      }
    }
    ensureDir();
  }, []);

  if (!permission) {
    return <View style={styles.container}><Text>載入中...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>需要相機權限才能錄製 Vlog</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>授予權限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    // 3秒倒數
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(null);
    setIsRecording(true);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 1,
      });

      // 儲存到 vlogs 資料夾
      const filename = `vlog_${Date.now()}.mp4`;
      const newPath = documentDirectory + 'vlogs/' + filename;
      
      await copyAsync({
        from: video.uri,
        to: newPath,
      });
      
      // 刪除原始暫存檔
      try {
        await deleteAsync(video.uri, { idempotent: true });
      } catch (e) {
        // 忽略刪除錯誤
      }

      // 記錄到資料庫
      await saveVlog(filename, newPath);

      Alert.alert('成功', '已儲存 1 秒 Vlog！', [
        { text: '確定', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('錯誤', '錄製失敗: ' + error.message);
    } finally {
      setIsRecording(false);
    }
  };

  const toggleFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
      >
        {countdown && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
            <Text style={styles.flipText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={startRecording}
            disabled={isRecording || countdown !== null}
          >
            <View style={[styles.recordInner, isRecording && styles.recordingInner]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <Text style={styles.hint}>
        {isRecording ? '錄製中...' : countdown ? '準備...' : '點擊錄製 1 秒 Vlog'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  countdownText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#fff',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  flipButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipText: {
    fontSize: 30,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    borderColor: '#ff4444',
  },
  recordInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff4444',
  },
  recordingInner: {
    borderRadius: 8,
    width: 30,
    height: 30,
  },
  closeButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 30,
    color: '#fff',
  },
  hint: {
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 16,
  },
});