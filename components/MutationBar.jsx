import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PALETTE } from '../constants';

export default function MutationBar({ mutations }) {
  if (!mutations || mutations.length === 0) return null;
  return (
    <View style={styles.container}>
      {mutations.map(m => (
        <View key={m.id} style={styles.mutation}>
          <Text style={styles.icon}>🧬</Text>
          <View style={{flex:1}}>
            <Text style={styles.name}>{m.name}</Text>
            <Text style={styles.desc}>{m.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(20,20,40,0.92)',
    borderRadius: 12,
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: PALETTE.upgradeBlue,
    maxWidth: 340,
    alignSelf: 'center',
  },
  mutation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  icon: {
    fontSize: 22,
    marginRight: 8,
    marginTop: 2,
  },
  name: {
    color: PALETTE.upgradeBlue,
    fontWeight: 'bold',
    fontSize: 15,
  },
  desc: {
    color: PALETTE.textMuted,
    fontSize: 13,
  },
});
