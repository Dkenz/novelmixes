/**
 * Agora-Wired POCPlayer.js
 * Novel Mixes — First real live audio moment.
 *
 * Requirements:
 * npm install react-native-agora
 * Add AGORA_APP_ID to your .env.local
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Switch } from 'react-native';
import RtcEngine, {
  ChannelProfile,
  ClientRole
} from 'react-native-agora';

export default function POCPlayer() {
  const engineRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const init = async () => {
      try {
        const engine = await RtcEngine.create(process.env.AGORA_APP_ID);
        engineRef.current = engine;

        await engine.enableAudio();
        await engine.setChannelProfile(ChannelProfile.LiveBroadcasting);
        await engine.setClientRole(ClientRole.Broadcaster);

        engine.addListener('JoinChannelSuccess', () => {
          setJoined(true);
          setStatus('joined');
        });

        engine.addListener('UserJoined', uid => {
          console.log('Remote user joined:', uid);
        });

        engine.addListener('UserOffline', uid => {
          console.log('Remote user left:', uid);
        });
      } catch (err) {
        console.error('Agora init error:', err);
        setStatus('error');
      }
    };

    init();

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  const startPOC = async () => {
    setStatus('joining');
    try {
      await engineRef.current.joinChannel(
        null,              // token (null for dev)
        'novelmixes-poc',  // channel name
        null,
        0                  // local UID
      );
    } catch (err) {
      console.error('Join error:', err);
      setStatus('error');
    }
  };

  const stopPOC = async () => {
    setStatus('leaving');
    try {
      await engineRef.current.leaveChannel();
      setJoined(false);
      setStatus('idle');
    } catch (err) {
      console.error('Leave error:', err);
      setStatus('error');
    }
  };

  const toggleMute = async val => {
    setMuted(val);
    try {
      await engineRef.current.muteLocalAudioStream(val);
    } catch (err) {
      console.error('Mute error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agora POC — Novel Mixes</Text>
      <Text style={styles.sub}>Status: {status}</Text>

      <View style={styles.row}>
        <Button
          title={joined ? 'Leave Channel' : 'Join Channel'}
          onPress={joined ? stopPOC : startPOC}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Mute</Text>
        <Switch value={muted} onValueChange={toggleMute} />
      </View>

      <Text style={styles.note}>
        If you hear audio between two devices, congratulations — Novel Mixes is alive.
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