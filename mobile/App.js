import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#0D0D14'}}>
      <View style={{padding:20}}>
        <Text style={{color:'#fff', fontSize:24}}>Novel Mixes (NM)</Text>
        <Text style={{color:'#D9D9D9', marginTop:10}}>Live audio platform — MVP</Text>
      </View>
    </SafeAreaView>
  );
}