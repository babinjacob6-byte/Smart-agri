# AgroSense AI - PRD

## Problem Statement
Build a responsive web application called AgroSense AI — a smart post-harvest storage monitoring dashboard. Works on mobile and desktop with React + Tailwind CSS + FastAPI + MongoDB.

## Architecture
- **Frontend**: React 19, Tailwind CSS, Recharts, Shadcn/UI components
- **Backend**: FastAPI with MongoDB (Motor async driver)
- **Database**: MongoDB with 3 collections (monitoring, history, alerts)
- **Design**: Dark-green (#1A7A3C) + white, Cabinet Grotesk headings, Inter body text

## User Personas
- Agricultural warehouse managers monitoring storage conditions
- Farm enterprise operators tracking crop spoilage risk
- Supply chain supervisors reviewing sensor data and alerts

## Core Requirements
- Real-time dashboard with risk score gauge and sensor readings
- AI advisory insights with driver analysis and crop profiles
- Historical trends visualization with multi-metric charts
- Alert management with filtering and severity indicators
- Simulate alert functionality for testing/demo purposes

## What's Been Implemented (April 2026)
- [x] Full FastAPI backend with MongoDB seeding on startup
- [x] 6 API endpoints: dashboard, insights, trends, alerts, simulate-alert, reset-simulation
- [x] Dashboard page: SVG risk gauge (animated), 6 sensor cards, primary driver
- [x] Insights page: AI Advisory card, Primary Driver bars, Crop Profile with dropdown, Recommended Actions
- [x] Trends page: Recharts multi-line chart with toggle buttons, min/max/current stat cards
- [x] Alerts page: Filter tabs, chronological alert list, sticky warning banner
- [x] Responsive layout: sidebar on desktop, bottom nav on mobile
- [x] Simulate Alert FAB: bumps risk to 89/ALERT, resets on click
- [x] All tests passing: 25/25 backend, 100% frontend

## Prioritized Backlog
### P0 (Done)
- All 4 screens functional with API-backed data
- Responsive navigation
- Simulate alert flow

### P1
- Real sensor data integration (IoT device connectivity)
- User authentication for multi-user access
- Multiple godown/warehouse support

### P2
- Push notifications for critical alerts
- Historical data export (CSV/PDF)
- AI-powered predictive analytics with actual LLM integration
- Multi-language support (regional Indian languages)

## Next Tasks
- Connect to real IoT sensor endpoints
- Add user auth for multi-tenant access
- Implement real-time WebSocket updates for live sensor feeds
