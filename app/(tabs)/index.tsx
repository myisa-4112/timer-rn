import React, { useReducer, useEffect, useRef } from 'react';
import {
  View, Text, Button, TextInput, SectionList,
  StyleSheet, Modal, TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const initialState = {
  timers: [],
  name: '',
  minutes: '',
  category: '',
  completedTimers: [],
  showModal: false,
  modalText: '',
  attemptedSubmit: false,
  collapsedCategories: {},
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME': return { ...state, name: action.payload };
    case 'SET_MINUTES': return { ...state, minutes: action.payload };
    case 'SET_CATEGORY': return { ...state, category: action.payload };
    case 'SET_ATTEMPTED_SUBMIT': return { ...state, attemptedSubmit: action.payload };
    case 'TOGGLE_CATEGORY': return {
      ...state,
      collapsedCategories: {
        ...state.collapsedCategories,
        [action.payload]: !state.collapsedCategories[action.payload],
      },
    };
    case 'ADD_TIMER': {
      const newTimer = {
        id: Date.now().toString(),
        name: state.name,
        category: state.category,
        duration: parseInt(state.minutes),
        remaining: parseInt(state.minutes),
        running: false,
      };
      return {
        ...state,
        timers: [...state.timers, newTimer],
        name: '',
        minutes: '',
        category: '',
        attemptedSubmit: false,
      };
    }
    case 'TICK':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload && timer.remaining > 0
            ? { ...timer, remaining: timer.remaining - 1 }
            : timer
        ),
      };
    case 'TOGGLE_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload ? { ...timer, running: !timer.running } : timer
        ),
      };
    case 'RESET_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload
            ? { ...timer, remaining: timer.duration, running: false }
            : timer
        ),
      };
    case 'DELETE_TIMER':
      return {
        ...state,
        timers: state.timers.filter(timer => timer.id !== action.payload),
      };
    case 'COMPLETE_TIMER': {
      const completed = state.timers.find(t => t.id === action.payload);
      return {
        ...state,
        timers: state.timers.map(t =>
          t.id === action.payload ? { ...t, running: false } : t
        ),
        completedTimers: [
          ...state.completedTimers,
          { id: Date.now().toString(), name: completed.name, time: new Date().toLocaleString() },
        ],
        showModal: true,
        modalText: completed.name,
      };
    }
    case 'CLOSE_MODAL':
      return { ...state, showModal: false, modalText: '' };
    case 'LOAD_TIMERS':
      return { ...state, timers: action.payload };
    case 'LOAD_HISTORY':
      return { ...state, completedTimers: action.payload };
    case 'START_CATEGORY':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.category === action.payload ? { ...timer, running: true } : timer
        ),
      };
    case 'PAUSE_CATEGORY':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.category === action.payload ? { ...timer, running: false } : timer
        ),
      };
    case 'RESET_CATEGORY':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.category === action.payload
            ? { ...timer, remaining: timer.duration, running: false }
            : timer
        ),
      };
    default:
      return state;
  }
}

export default function TimerScreen() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef(null);
  const router = useRouter();

  // Load timers and history on mount
  useEffect(() => {
    AsyncStorage.getItem('timers').then(data => {
      if (data) dispatch({ type: 'LOAD_TIMERS', payload: JSON.parse(data) });
    });
    AsyncStorage.getItem('history').then(data => {
      if (data) dispatch({ type: 'LOAD_HISTORY', payload: JSON.parse(data) });
    });
  }, []);

  // Save timers whenever timers state changes
  useEffect(() => {
    AsyncStorage.setItem('timers', JSON.stringify(state.timers));
  }, [state.timers]);

  // Save completedTimers (history) whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('history', JSON.stringify(state.completedTimers))
      .then(() => console.log('History saved:', state.completedTimers))
      .catch(e => console.error('Saving history failed', e));
  }, [state.completedTimers]);

  // Timer ticking logic
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      state.timers.forEach(timer => {
        if (timer.running && timer.remaining > 0) {
          dispatch({ type: 'TICK', payload: timer.id });
        } else if (timer.running && timer.remaining === 0) {
          dispatch({ type: 'COMPLETE_TIMER', payload: timer.id });
        }
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [state.timers]);

  const groupedTimers = Object.values(
    state.timers.reduce((groups, timer) => {
      if (!groups[timer.category]) groups[timer.category] = { title: timer.category, data: [] };
      groups[timer.category].data.push(timer);
      return groups;
    }, {})
  );

  const canAdd = state.name && state.minutes && state.category;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Timer App</Text>
        <TouchableOpacity
          onPress={() => router.push('/history')}
          accessibilityLabel="Go to History"
        >
          <MaterialIcons name="history" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, state.attemptedSubmit && !state.name && styles.inputWarning]}
        placeholder="Timer Name"
        placeholderTextColor="#999"
        value={state.name}
        onChangeText={text => dispatch({ type: 'SET_NAME', payload: text })}
      />
      {state.attemptedSubmit && !state.name && (
        <Text style={styles.errorText}>Please enter a timer name.</Text>
      )}

      <TextInput
        style={[styles.input, state.attemptedSubmit && !state.minutes && styles.inputWarning]}
        placeholder="Duration (seconds)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={state.minutes}
        onChangeText={text => dispatch({ type: 'SET_MINUTES', payload: text })}
      />
      {state.attemptedSubmit && !state.minutes && (
        <Text style={styles.errorText}>Please enter the duration in seconds.</Text>
      )}

      <TextInput
        style={[styles.input, state.attemptedSubmit && !state.category && styles.inputWarning]}
        placeholder="Category"
        placeholderTextColor="#999"
        value={state.category}
        onChangeText={text => dispatch({ type: 'SET_CATEGORY', payload: text })}
      />
      {state.attemptedSubmit && !state.category && (
        <Text style={styles.errorText}>Please enter a category.</Text>
      )}

      <View style={{ marginBottom: 10 }}>
      <Button
        title="Add Timer"
        onPress={() => {
          if (canAdd) dispatch({ type: 'ADD_TIMER' });
          else dispatch({ type: 'SET_ATTEMPTED_SUBMIT', payload: true });
        }}
        disabled={!canAdd}
      />
      </View>

      <SectionList
        sections={groupedTimers}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: title })}
            >
              <Text style={styles.categoryHeader}>{title}</Text>
            </TouchableOpacity>

            <View style={styles.bulkActions}>
              <TouchableOpacity
                onPress={() => dispatch({ type: 'START_CATEGORY', payload: title })}
                style={styles.bulkButton}
                accessibilityLabel={`Start all timers in ${title}`}
              >
                <MaterialIcons name="play-arrow" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => dispatch({ type: 'PAUSE_CATEGORY', payload: title })}
                style={styles.bulkButton}
                accessibilityLabel={`Pause all timers in ${title}`}
              >
                <MaterialIcons name="pause" size={24} color="#FFC107" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => dispatch({ type: 'RESET_CATEGORY', payload: title })}
                style={styles.bulkButton}
                accessibilityLabel={`Reset all timers in ${title}`}
              >
                <MaterialIcons name="replay" size={24} color="#03A9F4" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: title })}
                style={{ marginLeft: 8 }}
                accessibilityLabel={`${state.collapsedCategories[title] ? 'Expand' : 'Collapse'} ${title} category`}
              >
                <MaterialIcons
                  name={state.collapsedCategories[title] ? 'expand-more' : 'expand-less'}
                  size={24}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderItem={({ item, section }) => {
          if (state.collapsedCategories[section.title]) return null;

          const percentage = Math.round(((item.duration - item.remaining) / item.duration) * 100);

          return (
            <View style={styles.timerItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.timerName}>{item.name}</Text>
                <Text>{item.remaining} seconds remaining</Text>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[styles.progressBarFill, { width: `${percentage}%` }]}
                  />
                </View>
              </View>


              <View style={styles.timerButtons}>
                <TouchableOpacity
                  onPress={() => dispatch({ type: 'TOGGLE_TIMER', payload: item.id })}
                  accessibilityLabel={item.running ? `Pause timer ${item.name}` : `Start timer ${item.name}`}
                  style={{ marginRight: 15 }}
                >
                  <MaterialIcons name={item.running ? 'pause' : 'play-arrow'} size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => dispatch({ type: 'RESET_TIMER', payload: item.id })}
                  accessibilityLabel={`Reset timer ${item.name}`}
                  style={ { marginRight: 15 } }
                >
                  <MaterialIcons name="replay" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => dispatch({ type: 'DELETE_TIMER', payload: item.id })}
                  accessibilityLabel={`Delete timer ${item.name}`}
                >
                  <FontAwesome name="trash" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={state.showModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => dispatch({ type: 'CLOSE_MODAL' })}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
              Timer "{state.modalText}" completed!
            </Text>
            <Button title="Close" onPress={() => dispatch({ type: 'CLOSE_MODAL' })} />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#fff' },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 10, borderRadius: 5,
    color: '#000',
  },
  inputWarning: {
    borderColor: 'red',
  },
  errorText: { color: 'red', marginBottom: 10 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingVertical: 5, paddingHorizontal: 10,
  },
  categoryHeader: { fontSize: 22, fontWeight: 'bold' },
  bulkActions: { flexDirection: 'row', alignItems: 'center' },
  bulkButton: { marginHorizontal: 5 },
  timerItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ddd',
  },
  timerName: { fontSize: 18 },
  progressBarBackground: {
    height: 8, backgroundColor: '#eee', borderRadius: 4, marginTop: 5, width: 150,
  },
  progressBarFill: {
    height: 8, backgroundColor: '#FFA500', borderRadius: 4,
  },
  timerButtons: {
    flexDirection: 'row', alignItems: 'center', marginLeft: 10,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center',
  },
});
