import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function LoginRewardNotification({ reward, onHide }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(anim, { toValue: 0, duration: 350, useNativeDriver: true })
    ]).start(() => onHide && onHide());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);
  return (
    <Animated.View style={[styles.container, {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [40,0] }) }],
    }]}
    pointerEvents="none"
    >
      <View style={styles.inner}>
        <Text style={styles.emoji}>🎁</Text>
        <Text style={styles.title}>Récompense de connexion !</Text>
        <Text style={styles.desc}>Série : {reward.streak} jour{reward.streak > 1 ? 's' : ''}</Text>
        <Text style={styles.reward}>+{reward.amount} Fragments</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 300,
  },
  inner: {
    backgroundColor: 'rgba(30,30,40,0.97)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#44FF88',
    shadowColor: '#44FF88',
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  emoji: { fontSize: 38, marginBottom: 6 },
  title: { fontSize: 18, color: '#44FF88', fontWeight: 'bold', marginBottom: 2 },
  desc: { fontSize: 15, color: '#FFF', marginBottom: 4, textAlign: 'center' },
  reward: { fontSize: 13, color: '#44FF88', fontWeight: 'bold' },
});
