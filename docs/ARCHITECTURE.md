
# Architecture Overview

## Frontend
- React Native single codebase
- Navigation: React Navigation
- UI: Figma designs -> component library

## Backend
- Firebase Auth for users
- Firestore for metadata (streams, tags, profiles)
- Firebase Functions for server logic and webhooks

## Live Audio
- Use Agora or WebRTC for low-latency audio
- Stream metadata via Firestore
- CDN or relay for scale if needed

## Analytics and Monitoring
- Firebase Analytics for events
- Sentry for crash reporting

## Deployment
- CI via GitHub Actions
- Firebase deploy for backend
- TestFlight and Play Console for mobile betas