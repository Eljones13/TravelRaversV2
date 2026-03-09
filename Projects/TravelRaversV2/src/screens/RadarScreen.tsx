import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlowBorderCard } from '../components/GlowBorderCard';
import { Colors } from '../constants/colors';

type RadarScreenProps = {
  navigation: { goBack: () => void };
};

export const RadarScreen: React.FC<RadarScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>RADAR</Text>
        <Text style={styles.subtitle}>Nearby Festivals</Text>
      </View>
      <GlowBorderCard accentColor={Colors.module.RADAR}>
        <Text style={styles.placeholder}>Session 1-B will style this screen.</Text>
      </GlowBorderCard>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: {
    color: Colors.module.RADAR,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0px 0px 6px ${Colors.module.RADAR}` } as any,
      default: { textShadowColor: Colors.module.RADAR, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 }
    }),
  },
  subtitle: { color: Colors.dim, fontSize: 10, letterSpacing: 2, marginTop: 2 },
  placeholder: { color: Colors.dim, fontSize: 12 },
});
