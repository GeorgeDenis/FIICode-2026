# UrbanPulse

A hyper-local community resilience app that connects neighbors for mutual aid, emergency coordination, and resource sharing.

## Tech Stack

**Backend**
- FastAPI (Python)
- PostgreSQL 15
- SQLAlchemy
- WebSockets for real-time features
- OpenAI Vision API for document OCR

**Frontend**
- React Native with Expo
- Expo Router for navigation
- Expo SecureStore for token storage

---

## Architecture

The app follows a standard three-tier architecture. The React Native client communicates with a FastAPI backend over HTTPS/WSS, which in turn connects to a managed PostgreSQL database. Real-time features (Crisis Mode alerts, live feed updates, safety check-ins) run over a persistent WebSocket connection.

---

## Deployment

### Database — Neon.tech

We use Neon for managed PostgreSQL 15 hosting. Neon provides automatic point-in-time recovery up to 7 days, meaning the database can be restored to any previous state without additional infrastructure. The connection uses SSL and the pooled connection string to handle concurrent requests efficiently.

### Backend — Railway

The FastAPI backend is deployed on Railway, connected directly to the GitHub repository. Every push to `main` triggers an automatic redeploy. Railway handles HTTPS termination, so the app is served over SSL without any additional configuration.

Environment variables (database URL, secret keys, API keys) are managed through Railway's environment variable dashboard and never committed to the repository.

### Frontend — Expo + EAS Update

The React Native app is distributed via EAS Update, which hosts the JavaScript bundle on Expo's servers. Users open the app through Expo Go — no app store submission required. Updates are published with:

```bash
eas update --branch production --message "description"
```

The app automatically picks up the latest bundle on next launch. Local development uses the Metro bundler over the local network, while the production bundle points to the Railway backend via environment variables.

---

## Database Backups

Neon provides automatic daily snapshots and point-in-time recovery for up to 7 days on the free tier. No additional backup infrastructure is needed. Restoration can be triggered directly from the Neon dashboard.

---

## Demo Access

The live application is accessible via Expo Go. Install Expo Go on your device and then scan this QR code with your camera:
<img width="994" height="612" alt="image" src="https://github.com/user-attachments/assets/de320f44-4ad4-44d0-83f3-896a6e17c2ca" />

