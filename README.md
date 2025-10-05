# Routify

A calendar visualizer that parses `.ics` files, geocodes event locations, and displays a time-aware schedule with commutes.

## Repo overview

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** FastAPI, SQLModel
- **Database:** PostgreSQL (via Docker)

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

### Extension setup

During development, compile Tailwind CSS into `styles.css` with:

```bash
cd ../routify-extension
npm install
npx tailwindcss -i ./tailwind.css -o ./styles.css --minify --watch
```

To run this extension in Chrome, open `chrome://extensions`, enable Developer Mode, and click Load unpacked to select the `routify-extension/` folder. Firefox is not supported. Only `popup.html`, `popup.js`, `styles.css`, and `manifest.json` are needed to run the extension.

### Environment variables

Create a .env file in both `backend/` and `frontend/` based on .env.example.

### Database

A Postgres database is required for development. Make sure to set the `DATABASE_URL` in your `backend/.env` file. You can run Postgres locally using the provided `docker-compose.yml`:

```bash
# Start a local Postgres instance
docker compose up -d

# Stop and remove the instance and its data
docker compose down --volumes
```

If `DATABASE_URL` is not set, the app falls back to a local SQLite database at `app/database.db`, with no setup required.

## Current Progress

### Frontend
- **Deployed on Amazon S3** with static website hosting enabled.  
- Accessible via:
  - [http://www.routify.tech/](http://www.routify.tech/)
  - [http://www.routify.tech.s3-website-us-east-1.amazonaws.com/](http://www.routify.tech.s3-website-us-east-1.amazonaws.com/)
- Domain managed via **DotTech Domains**, pointing to the S3 bucket.  
- Environment variable configuration:
  ```bash
  VITE_API_BASE_URL=http://<EC2-PUBLIC-IP>:8000

### Future Work 

- Enable SSL/TLS for secure connections
- Set up CI/CD pipeline for automated deployments
