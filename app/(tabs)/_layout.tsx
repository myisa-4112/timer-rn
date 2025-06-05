import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === 'index' ? 'timer' : 'history';
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFA500',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      {/* Screens will be automatically picked up from file names, 
          so you do NOT have to explicitly declare them here in Expo Router */}
    </Tabs>
  );
}
