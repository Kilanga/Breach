import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PALETTE } from './Palette';

export function Title({ children, style, ...props }) {
  return (
    <Text style={[styles.title, style]} {...props}>{children}</Text>
  );
}

export function Subtitle({ children, style, ...props }) {
  return (
    <Text style={[styles.subtitle, style]} {...props}>{children}</Text>
  );
}

export function Body({ children, style, ...props }) {
  return (
    <Text style={[styles.body, style]} {...props}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    color: PALETTE.textPrimary,
    lineHeight: 22,
  },
});
