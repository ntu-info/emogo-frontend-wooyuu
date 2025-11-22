import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getAllSurveys, getAllLocations, getAllVlogs } from '../utils/database';

export default function HomeScreen() {
  const [counts, setCounts] = useState({ surveys: 0, locations: 0, vlogs: 0 });

  useFocusEffect(
    useCallback(() => {
      async function loadCounts() {
        const surveys = await getAllSurveys();
        const locations = await getAllLocations();
        const vlogs = await getAllVlogs();
        setCounts({
          surveys: surveys.length,
          locations: locations.length,
          vlogs: vlogs.length,
        });
      }
      loadCounts();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Experience Sampling</Text>
      <Text style={styles.subtitle}>每日三次記錄你的心情</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{counts.surveys}</Text>
          <Text style={styles.statLabel}>問卷</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{counts.vlogs}</Text>
          <Text style={styles.statLabel}>Vlogs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{counts.locations}</Text>
          <Text style={styles.statLabel}>GPS</Text>
        </View>
      </View>

      <Link href="/(tabs)/survey" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>開始記錄</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/vlog" asChild>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>錄製 Vlog</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});