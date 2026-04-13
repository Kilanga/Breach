/**
 * BREACH — Error Boundary
 * Capture les erreurs React pour éviter un crash silencieux.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE } from '../constants';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[BREACH] Erreur critique :', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>💥 Erreur critique</Text>
          <Text style={styles.msg}>{this.state.error?.message || 'Une erreur inattendue est survenue.'}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.btnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4455',
    marginBottom: 16,
  },
  msg: {
    fontSize: 13,
    color: PALETTE.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  btn: {
    backgroundColor: '#1A0A0A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF4455',
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  btnText: {
    fontSize: 15,
    color: '#FF4455',
    fontWeight: 'bold',
  },
});
