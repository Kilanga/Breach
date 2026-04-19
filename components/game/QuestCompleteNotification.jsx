import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function QuestCompleteNotification({ quest, onHide }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(fadeAnim, { toValue: 0, duration: 320, useNativeDriver: true })
    ]).start(() => onHide && onHide());
    Haptics.notificationAsync && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }] }>
      <View style={styles.card}>
        <Text style={styles.title}>🎉 Quête terminée !</Text>
        <Text style={styles.desc}>{quest.desc}</Text>
        <Text style={styles.reward}>+{quest.reward.amount} {quest.reward.type === 'fragments' ? 'Fragments' : ''}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  card: {
    backgroundColor: 'rgba(30,30,40,0.97)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#FFCC44',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 22,
    color: '#FFCC44',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  reward: {
    fontSize: 16,
    color: '#FFCC44',
    fontWeight: 'bold',
  },
});
