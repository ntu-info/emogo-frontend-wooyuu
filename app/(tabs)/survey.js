import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { saveSurvey, saveLocation } from '../utils/database';

const QUESTIONS = [
  { key: 'mood', label: '心情', emoji: ['😢', '😕', '😐', '🙂', '😄'] },
  { key: 'energy', label: '精力', emoji: ['😴', '🥱', '😌', '💪', '⚡'] },
  { key: 'stress', label: '壓力', emoji: ['😌', '🙂', '😐', '😰', '🤯'] },
];

export default function SurveyScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState({ mood: 3, energy: 3, stress: 3 });
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 儲存問卷
      await saveSurvey(answers.mood, answers.energy, answers.stress);

      // 取得並儲存 GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        await saveLocation(location.coords.latitude, location.coords.longitude);
      }

      Alert.alert('成功', '已儲存你的記錄！', [
        { text: '確定', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('錯誤', '儲存失敗，請再試一次');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>今天感覺如何？</Text>

      {QUESTIONS.map(q => (
        <View key={q.key} style={styles.questionContainer}>
          <Text style={styles.questionLabel}>{q.label}</Text>
          <View style={styles.emojiRow}>
            {q.emoji.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiButton,
                  answers[q.key] === index + 1 && styles.emojiSelected
                ]}
                onPress={() => handleSelect(q.key, index + 1)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? '儲存中...' : '提交並記錄位置'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  questionContainer: {
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
  questionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emojiButton: {
    padding: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  emoji: {
    fontSize: 30,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});