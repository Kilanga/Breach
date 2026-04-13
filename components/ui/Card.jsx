import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PALETTE } from './Palette';

export default function Card({ children, style, ...props }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PALETTE.bgCard,
    borderRadius: 18,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: PALETTE.border,
  },
});
