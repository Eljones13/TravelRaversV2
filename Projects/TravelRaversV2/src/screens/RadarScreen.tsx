import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import TacticalRadar, { RadarPoint } from '../components/TacticalRadar';

// MOCK DATA: Simulating squad members based on the concept image
const MOCK_SQUAD: RadarPoint[] = [
  { id: '1', name: 'SARAH', distance: 400, bearing: 45 },  // NE
  { id: '2', name: 'MIKE', distance: 150, bearing: 180 },  // S
  { id: '3', name: 'BASE CAMP', distance: 800, bearing: 270 }, // W
];

export const RadarScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TACTICAL RADAR PULSE</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Main Radar View */}
      <View style={styles.radarContainer}>
        <TacticalRadar points={MOCK_SQUAD} maxRange={1000} />
      </View>

      {/* Concept Info Text below Radar */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Concept: Visualizing friend locations via compass vectors and GPS lat/long.</Text>
        <Text style={styles.infoText}>Benefit: Situational awareness at a glance. Find your squad without the grid.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(204, 0, 255, 0.2)', // Radar purple accent glow
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.module.RADAR,
    fontFamily: 'ShareTechMono-Regular',
    fontSize: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
    letterSpacing: 2,
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 24,
    marginBottom: 40,
  },
  infoText: {
    color: Colors.dim,
    fontFamily: 'Rajdhani-Medium',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
});
