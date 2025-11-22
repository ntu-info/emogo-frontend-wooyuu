import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllSurveys, getAllLocations, getAllVlogs, exportAllData } from '../utils/database';

export default function DataScreen() {
  const [surveys, setSurveys] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vlogs, setVlogs] = useState([]);
  const [activeTab, setActiveTab] = useState('surveys');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setSurveys(await getAllSurveys());
    setLocations(await getAllLocations());
    setVlogs(await getAllVlogs());
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      
      // 建立匯出資料夾
      const exportDir = FileSystem.documentDirectory + 'data/';
      const dirInfo = await FileSystem.getInfoAsync(exportDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });
      }

      // 儲存 JSON 檔案
      const filename = `export_${Date.now()}.json`;
      const filepath = exportDir + filename;
      await FileSystem.writeAsStringAsync(filepath, JSON.stringify(data, null, 2));

      // 分享檔案
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath);
      } else {
        Alert.alert('成功', `已匯出到: ${filepath}`);
      }
    } catch (error) {
      Alert.alert('錯誤', '匯出失敗: ' + error.message);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-TW');
  };

  const getMoodEmoji = (mood) => ['😢', '😕', '😐', '🙂', '😄'][mood - 1] || '❓';
  const getEnergyEmoji = (energy) => ['😴', '🥱', '😌', '💪', '⚡'][energy - 1] || '❓';
  const getStressEmoji = (stress) => ['😌', '🙂', '😐', '😰', '🤯'][stress - 1] || '❓';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的記錄</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['surveys', 'vlogs', 'locations'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'surveys' ? `問卷 (${surveys.length})` :
               tab === 'vlogs' ? `Vlogs (${vlogs.length})` :
               `GPS (${locations.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.listContainer}>
        {activeTab === 'surveys' && surveys.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
            <View style={styles.cardRow}>
              <Text>心情 {getMoodEmoji(item.mood)}</Text>
              <Text>精力 {getEnergyEmoji(item.energy)}</Text>
              <Text>壓力 {getStressEmoji(item.stress)}</Text>
            </View>
          </View>
        ))}

        {activeTab === 'vlogs' && vlogs.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.cardFilename}>{item.filename}</Text>
          </View>
        ))}

        {activeTab === 'locations' && locations.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.cardCoords}>
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
          </View>
        ))}

        {((activeTab === 'surveys' && surveys.length === 0) ||
          (activeTab === 'vlogs' && vlogs.length === 0) ||
          (activeTab === 'locations' && locations.length === 0)) && (
          <Text style={styles.emptyText}>尚無記錄</Text>
        )}
      </ScrollView>

      {/* Export Button */}
      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportButtonText}>匯出所有資料</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardFilename: {
    fontSize: 14,
    color: '#333',
  },
  cardCoords: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  exportButton: {
    backgroundColor: '#34C759',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});