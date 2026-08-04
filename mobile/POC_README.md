# POC Live Audio — Novel Mixes

Purpose  
Prove low-latency audio using Agora (or WebRTC). Minimal flow: join channel, leave channel, mute/unmute, measure latency.

Setup  
1. Install SDK:  
   `npm install react-native-agora`  
2. Add AGORA_APP_ID to `.env.local`  
3. Run Metro:  
   - `npx react-native start`  
   - `npx react-native run-ios` or `run-android`

Testing  
- Open app on two devices.  
- Navigate to POC Player.  
- Join same channel.  
- Speak into one device.  
- Confirm audio on the other.

Metrics  
- Join time  
- Latency  
- Packet loss  
- Crash rate

Notes  
This is intentionally minimal. Once Agora is wired, you’ll have your first live audio moment.