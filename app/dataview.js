import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { getAllSentiments, getAllLocations, getAllVlogs } from "../lib/database";

export default function DataViewScreen() {
  const router = useRouter();
  const [sentiments, setSentiments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vlogs, setVlogs] = useState([]);
  const [activeTab, setActiveTab] = useState("sentiments");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const s = await getAllSentiments();
      const l = await getAllLocations();
      const v = await getAllVlogs();
      setSentiments(s);
      setLocations(l);
      setVlogs(v);
    } catch (error) {
      console.log("Error loading data:", error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderSentiments = () => (
    <View>
      <Text style={styles.sectionTitle}>Sentiments ({sentiments.length})</Text>
      {sentiments.length === 0 ? (
        <Text style={styles.emptyText}>No sentiment data yet</Text>
      ) : (
        sentiments.map((item, index) => (
          <View key={item.id || index} style={styles.card}>
            <Text style={styles.cardTitle}>Record #{sentiments.length - index}</Text>
            <Text style={styles.cardText}>Mood: {item.mood}/5</Text>
            <Text style={styles.cardText}>Energy: {item.energy}/5</Text>
            <Text style={styles.cardText}>Stress: {item.stress}/5</Text>
            <Text style={styles.cardTime}>{formatDate(item.timestamp)}</Text>
          </View>
        ))
      )}
    </View>
  );

  const renderLocations = () => (
    <View>
      <Text style={styles.sectionTitle}>Locations ({locations.length})</Text>
      {locations.length === 0 ? (
        <Text style={styles.emptyText}>No location data yet</Text>
      ) : (
        locations.map((item, index) => (
          <View key={item.id || index} style={styles.card}>
            <Text style={styles.cardTitle}>Record #{locations.length - index}</Text>
            <Text style={styles.cardText}>Latitude: {item.latitude.toFixed(6)}</Text>
            <Text style={styles.cardText}>Longitude: {item.longitude.toFixed(6)}</Text>
            <Text style={styles.cardTime}>{formatDate(item.timestamp)}</Text>
          </View>
        ))
      )}
    </View>
  );

  const renderVlogs = () => (
    <View>
      <Text style={styles.sectionTitle}>Vlogs ({vlogs.length})</Text>
      {vlogs.length === 0 ? (
        <Text style={styles.emptyText}>No vlog data yet</Text>
      ) : (
        vlogs.map((item, index) => (
          <View key={item.id || index} style={styles.card}>
            <Text style={styles.cardTitle}>Vlog #{vlogs.length - index}</Text>
            <Text style={styles.cardText} numberOfLines={1}>
              File: {item.file_path.split("/").pop()}
            </Text>
            <Text style={styles.cardTime}>{formatDate(item.timestamp)}</Text>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sentiments" && styles.activeTab]}
          onPress={() => setActiveTab("sentiments")}
        >
          <Text style={[styles.tabText, activeTab === "sentiments" && styles.activeTabText]}>
            Sentiments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "locations" && styles.activeTab]}
          onPress={() => setActiveTab("locations")}
        >
          <Text style={[styles.tabText, activeTab === "locations" && styles.activeTabText]}>
            Locations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "vlogs" && styles.activeTab]}
          onPress={() => setActiveTab("vlogs")}
        >
          <Text style={[styles.tabText, activeTab === "vlogs" && styles.activeTabText]}>
            Vlogs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data list */}
      <ScrollView style={styles.scrollView}>
        {activeTab === "sentiments" && renderSentiments()}
        {activeTab === "locations" && renderLocations()}
        {activeTab === "vlogs" && renderVlogs()}
      </ScrollView>

      {/* Refresh button */}
      <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
        <Text style={styles.refreshText}>Refresh Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007AFF",
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
