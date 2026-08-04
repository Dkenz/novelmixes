/**
 * POCPlayer.js
 * Minimal Agora POC screen (React Native).
 * Clean, simple, and ready for you to wire up the SDK.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Switch } from 'react-native';

export default function POCPlayer() {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    // Initialize Agora engine here once you install the SDK.
    return () => {
      // Cleanup engine here.
    };
  }, []);

  const startPOC = async () => {
    setStatus('joining');
    try {
      // TODO: join channel using Agora SDK
      setJoined(true);
      setStatus('joined');
    } catch (err) {
      console.error('POC join error', err);
      setStatus('error');
    }
  };

  const stopPOC = async () => {
    setStatus('leaving');
    try {
      // TODO: leave channel
      setJoined(false);
      setStatus('idle');
    } catch (err) {
      console.error('POC leave error', err);
      setStatus('error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>POC Live Audio Player</Text>
      <Text style={styles.sub}>Status: {status}</Text>

      <View style={styles.row}>
        <Button
          title={joined ? 'Leave Channel' : 'Join Channel'}
          onPress={joined ? stopPOC : startPOC}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Mute</Text>
        <Switch
          value={muted}
          onValueChange={val => {
            setMuted(val);
            // TODO: engine.muteLocalAudioStream(val)
          }}
        />
      </View>

      <Text style={styles.note}>
        Wire this up with react-native-agora and you’re officially dangerous.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0D0D14', flex: 1 },
  title: { color: '#6C4EFF', fontSize: 22, fontWeight: '700' },
  sub: { color: '#D9D9D9', marginTop: 8 },
  row: { marginTop: 16, flexDirection: 'row', alignItems: 'center' },
  label: { color: '#D9D9D9', marginRight: 8 },
  note: { color: '#9AA0B2', marginTop: 20 }
});