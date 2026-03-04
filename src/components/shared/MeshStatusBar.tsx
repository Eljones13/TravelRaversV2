import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLOR_CYAN, FONT_MONO } from '../../theme/tokens';

const MESSAGES = [
  'SCANNING FOR SQUAD...',
  'MESH ACTIVE // SEARCHING',
  'NO NODES DETECTED',
  'OFFLINE_READY // STANDBY',
];

export default function MeshStatusBar() {
  const [index, setIndex]   = useState(0);
  const fadeAnim            = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const cycle = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIndex(prev => (prev + 1) % MESSAGES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(cycle);
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
        {MESSAGES[index]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  message: {
    fontFamily: FONT_MONO,
    fontSize: 9,
    color: COLOR_CYAN,
    opacity: 0.5,
    letterSpacing: 1,
  },
});
