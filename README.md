# Novel Mixes (NM)

**Go Live. Connect. Earn.**

Novel Mixes is a live platform for creators and listeners — music, gaming, talk, and real connection. MVP focuses on live audio/video, creator-driven tagging, and basic monetization hooks.

Founder: Keynes · Domain: [NovelMixes.com](https://novelmixes.com)

## Repo structure

| Path | What |
| --- | --- |
| `/web` | Branded web app (landing, live rooms, Go Live, auth) |
| `/mobile` | React Native app + Agora live-audio POC |
| `/backend` | Firebase functions and Firestore schema |
| `/docs` | Architecture, roadmap, API |
| `/design` | Mockups and wireframes |

## Quick start (web)

```bash
cd web
npm install
npm run dev
```

## Quick start (mobile)

```bash
cd mobile
npm install
npx react-native run-ios   # or run-android
```

## Backend

```bash
cd backend
npm install
firebase emulators:start
```

## Contributing

- Feature branches: `feature/<short-desc>`
- Open PRs against `Main`
- Use the issue templates in `.github/`
