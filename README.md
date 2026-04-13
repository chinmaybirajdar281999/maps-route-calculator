# Maps Route & Toll Calculator

A full-stack route planner and toll estimator built with React, Mapbox, Node.js, Express, PostgreSQL, and Redis.

## Project Overview

This application allows users to calculate driving routes, compare alternate routes, and estimate toll charges in INR based on route geometry and a toll plaza database. It uses Mapbox Geocoding and Directions APIs for mapping and routing, and performs geospatial toll detection on the backend.

## Key Features

- Multi-route selection via Mapbox `alternatives=true`
- Toll detection using route geometry and toll plaza locations
- Multi-vehicle toll optimization for car, truck, bus, and motorcycle
- INR toll conversion from USD toll rates
- Toll breakdown and total cost display for selected route
- Route filters for fastest, shortest, and lowest toll options
- Autocomplete suggestions for source and destination
- Toll plaza markers on the map for selected routes
- Route history for recent search recall
- Backend caching for faster repeat route lookups

## Tech Stack

- Frontend: React, Tailwind CSS, Mapbox GL JS
- Backend: Node.js, Express, Axios
- Database: PostgreSQL
- Cache: Redis
- APIs: Mapbox Geocoding + Directions

## Repository Structure

- `backend/` - Express server and toll routing logic
- `frontend/` - React application and map UI
- `database/` - PostgreSQL schema and seed data

## Setup

### Prerequisites

- Node.js 18+ / npm
- PostgreSQL
- Redis
- Mapbox access token

### Database

1. Create the database:
   ```bash
   createdb route_toll_db
   ```
2. Run the schema script:
   ```bash
   psql -U <your_user> -d route_toll_db -f database/schema.sql
   ```

### Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file with:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   MAPBOX_ACCESS_TOKEN=your_mapbox_token
   DB_HOST=localhost
   DB_NAME=route_toll_db
   DB_USER=<your_db_user>
   DB_PASSWORD=<your_db_password>
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```
3. Start the backend:
   ```bash
   npm start
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the frontend:
   ```bash
   npm start
   ```
3. Open the app in the browser at `http://localhost:3000`

## Usage

- Enter source and destination locations.
- Click `Calculate Route` to load routes.
- Select among alternate routes.
- View toll breakdown and total toll cost.

## Testing

Use the backend API directly for route validation:

```bash
curl -X POST http://localhost:3001/api/route/calculate \
  -H "Content-Type: application/json" \
  -d '{"source":{"lat":19.077793,"lng":72.87872},"destination":{"lat":18.515669,"lng":73.856285},"vehicleType":"car"}'
```

## Enhancements

- Add multi-vehicle toll calculation for `bus`, `truck`, and `motorcycle`
- Integrate Mapbox Places autocomplete for source/destination input
- Add route filtering by shortest, fastest, and lowest tolls
- Add toll plaza map markers
- Add CI/CD, linting, and automated tests
- Add Docker support for local development

## Resume-Friendly Summary

- Built a full-stack route and toll planner with Mapbox routing, PostgreSQL geospatial toll detection, and React map UI.
- Implemented alternate route selection, INR conversion, and toll breakdown.
- Added backend caching and route validation for production-readiness.
