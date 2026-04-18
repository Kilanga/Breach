import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function RelicNotification({ relic, onHide }) {
  const anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(anim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => onHide && onHide());
  }, [relic]);

  if (!relic) return null;

  return (
    <Animated.View style={[styles.container, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }] }] }>
      <Text style={styles.icon}>{relic.icon || '🔸'}</Text>
      <View style={styles.texts}>
        <Text style={styles.title}>{relic.name}</Text>
        <Text style={styles.desc}>{relic.desc}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,220,0,0.97)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    zIndex: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: { fontSize: 32, marginRight: 14 },
  texts: { flex: 1 },
  title: { fontSize: 17, fontWeight: 'bold', color: '#7B5B00', marginBottom: 2 },
  desc: { fontSize: 13, color: '#5A4A00' },
});
