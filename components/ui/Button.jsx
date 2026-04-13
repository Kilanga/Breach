import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { PALETTE } from './Palette';

export default function Button({ label, onPress, icon, primary, style, disabled }) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        primary && styles.btnPrimary,
        disabled && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <View style={styles.contentRow}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.text, primary && styles.textPrimary, disabled && styles.textDisabled]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: PALETTE.bgCard,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 2,
    borderColor: PALETTE.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  btnPrimary: {
    backgroundColor: PALETTE.hp,
    borderColor: PALETTE.hp,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  text: {
    fontSize: 18,
    color: PALETTE.textPrimary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  textPrimary: {
    color: '#fff',
  },
  textDisabled: {
    color: PALETTE.textDim,
  },
});
