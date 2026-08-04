import React from 'react';
import { SafeAreaView, Text, View, StatusBar } from 'react-native';

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{flex:1, backgroundColor:'#0D0D14'}}>
        <View style={{padding:24}}>
          <Text style={{color:'#6C4EFF', fontSize:28, fontWeight:'700'}}>Novel Mixes</Text>
          <Text style={{color:'#D9D9D9', marginTop:12, fontSize:16}}>
            Live audio platform — MVP. Tap a stream, join live, feel the moment.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}