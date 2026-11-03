# GymGrog

A tiny, offline-first gym companion built for one person: lose weight, train the back, fit the gym around surfing.

- **Program**: three rotating full-body sessions (A: pull + legs, B: push + legs, C: circuit) plus a short "surfed today" session. No calendar. The app always shows the next session up; you do it whenever you get to the gym.
- **Variation**: movement patterns are fixed, the exercise inside each pattern rotates every 4-week block from the pool of exercises you have rated like / ok. Parked ("unknown") and "never" exercises stay out.
- **In session**: suggested weight from your last performance (progression when you hit the top of the rep range), set logging, rest timer with beep and vibration, coaching cues per exercise.
- **Tracking**: rolling 14-day session count against a minimum and a goal, surf days, body weight trend with a chart, full history.
- **Data**: everything lives in your browser's localStorage. Export and import JSON from Settings. No account, no server.

## Run it

Any static file server works. For example:

```bash
python3 -m http.server 8787
```

then open http://localhost:8787 on your computer. To use it on your phone at the gym, host the folder on GitHub Pages (or any static host) and "Add to Home Screen" from Safari/Chrome; the service worker keeps it working offline.

Research behind the program: `research/01-training-best-practices.md`.
