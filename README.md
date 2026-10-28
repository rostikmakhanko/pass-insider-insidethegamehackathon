# Pass Insider

Pass Insider is a football passing-combination analysis workbench built for the Microsoft Premier League Hackathon. It combines an interactive React pitch with a Flask API that evaluates a sequence of passes against player positions.

## Solution overview

The solution has two independently deployable parts:

| Part | Technology | Purpose | Deployment target |
|---|---|---|---|
| Analysis API | Python, Flask, Pydantic, Gunicorn | Validates pass and player data and calculates geometric and heuristic metrics | Azure Container Apps |
| Web application | React, TypeScript, Vite, Tailwind CSS | Interactive tactical workbench, passing network, spatial views, match vault, and insight panel | Vercel |

## How analysis works

`POST /api/analyze` accepts a single frozen pitch frame and a sequence of passes. The API:

1. Validates the JSON structure, field types, pitch coordinates, player and pass limits, IDs, team membership, and pass references.
2. Converts pitch coordinates from percentages to metres on a 105 × 68 m pitch and orients each team so it attacks toward the same goal.
3. Calculates pass distance and forward gain, whether the pass is progressive, enters the final third or penalty area, how many opponents block the lane, receiver pressure, an estimated completion likelihood, and a goal-threat change.
4. Returns per-pass analysis, summary statistics, warnings, and a short summary. Passes to an opponent are treated as turnovers and excluded from key-pass selection.

The completion likelihood and threat gain are heuristic estimates, not event-data or tracking-data model outputs. Constants and calculations are implemented in `analysis.py`.

### API endpoints

- `GET /api/health` — returns `{"ok": true}` when the API is healthy.
- `POST /api/analyze` — accepts and analyzes a pass-sequence payload.

The analyze endpoint requires `Content-Type: application/json`. Invalid JSON returns `400`, unsupported content types return `415`, and schema or cross-reference errors return `422` with field-level details. Other HTTP errors are returned in a consistent JSON error envelope.

Example request:

```json
{
  "schema_version": 1,
  "match": {
    "home_team": "Home FC",
    "away_team": "Away FC",
    "competition": "Premier League"
  },
  "players": [
    { "id": "h1", "team": "home", "x": 30, "y": 50, "name": "Home passer", "number": 8, "position": "CM" },
    { "id": "h2", "team": "home", "x": 55, "y": 45, "name": "Home receiver", "number": 10, "position": "AM" },
    { "id": "a1", "team": "away", "x": 58, "y": 48, "name": "Away defender", "number": 4, "position": "CB" }
  ],
  "passes": [
    { "id": "p1", "from": "h1", "to": "h2", "type": "ground" }
  ]
}
```

Coordinates `x` and `y` are numbers from `0` to `100`; `x` follows the pitch length and `y` its width. Pass types are `ground`, `lofted`, `through`, and `cross`. Request limits are 2–22 players, no more than 11 per team, and 1–50 passes. The request/response contract and validation are defined in `models.py` and `validation.py`.

## Repository map

```text
.
├── app.py                 # Flask routes, including /api/health and /api/analyze
├── analysis.py            # Pitch geometry and pass/situation analysis
├── models.py              # Pydantic API request and response models
├── validation.py          # Payload and cross-reference validation
├── errors.py              # JSON API error handlers
├── requirements.txt       # Python dependencies
├── Dockerfile             # Gunicorn container for the API
├── gunicorn.conf.py       # Production server configuration (port 50505)
├── infra/                 # Existing Azure App Service Bicep scaffold
└── frontend/
    ├── src/
    │   ├── App.tsx        # Workbench state and top-level views
    │   ├── components/    # Pitch, network, spatial, vault, and insight UI
    │   ├── data/          # Sample matches and mock insight responses
    │   └── types.ts       # Frontend data types
    ├── package.json
    └── vite.config.ts
```

## Run locally

### API server

Requires Python 3.11 or later.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
flask --app app run --host 0.0.0.0 --port 50505
```

Check the health endpoint:

```bash
curl http://localhost:50505/api/health
```

To try the analysis endpoint, save the JSON request above as `request.json` and run:

```bash
curl -X POST http://localhost:50505/api/analyze \
  -H 'Content-Type: application/json' \
  --data @request.json
```

Alternatively, run the production-style Gunicorn server locally:

```bash
gunicorn --config gunicorn.conf.py app:app
```

### Frontend

Requires Node.js and npm. In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (by default, `http://localhost:3000`). The current frontend uses local sample data and mock insight responses; it does not need the Flask server running.

Useful frontend scripts, run from `frontend/`:

```bash
npm run lint    # TypeScript type check
npm run build   # Production build into frontend/dist
npm run preview # Serve the production build locally
```

## Deploy

### API to Azure Container Apps

The API container listens on port `50505`, as configured in `Dockerfile` and `gunicorn.conf.py`. You need an Azure subscription, Azure CLI, and the Container Apps CLI extension. Sign in first:

```bash
az login
az extension add --name containerapp --upgrade
```

Create a resource group and deploy the repository's Dockerfile as a Container App:

```bash
az group create --name <resource-group> --location <azure-region>

az containerapp up \
  --name <container-app-name> \
  --resource-group <resource-group> \
  --location <azure-region> \
  --source . \
  --ingress external \
  --target-port 50505
```

`az containerapp up` builds and deploys the source and provisions supporting Container Apps resources when required. After deployment, use the app's HTTPS URL to verify `GET /api/health`. For later releases, rerun the deploy command from the repository root.

For a manually managed image pipeline, build and push the `Dockerfile` image to Azure Container Registry, then configure the Container App to use that image and expose ingress on port `50505`. Keep model credentials and other secrets in Container Apps secrets; do not put credentials in the image, source tree, or README. The current checked-in API does not require model credentials.

### Frontend to Vercel

Deploy `frontend/` as the Vercel project root:

1. Import the Git repository into Vercel and set **Root Directory** to `frontend`.
2. Select the Vite framework preset, or configure the build command as `npm run build` and the output directory as `dist`.
3. Deploy. Vercel installs the dependencies from `frontend/package.json` and serves the generated static site.

You can also deploy with the Vercel CLI:

```bash
cd frontend
npx vercel
npx vercel --prod
```