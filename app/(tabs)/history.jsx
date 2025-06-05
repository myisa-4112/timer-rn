import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const router = useRouter();

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('history');
      console.log('Loaded history:', data);
      if (data) setHistory(JSON.parse(data));
      else setHistory([]);
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back to Timers"
          style={styles.homeIcon}
        >
          <MaterialIcons name="home" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No history yet.</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  homeIcon: {
    padding: 5,
  },
  historyItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  name: { fontSize: 18 },
  time: { fontSize: 14, color: '#666' },
});
