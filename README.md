# Routify

A calendar visualizer that parses `.ics` files, geocodes event locations, and displays a time-aware schedule with commutes.

## Repo overview

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** FastAPI, SQLModel

### Features

- Upload and parse `.ics` calendar files
- Geocode event locations
- Visualize daily schedules with estimated commute times
- Share schedules via unique links

## Development setup

### Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

### Environment variables

Create a .env file in both backend/ and frontend/ based on .env.example.

### Database

A SQLite database (`app/database.db`) is auto-generated at runtime using SQLModel. No setup or migration required.
