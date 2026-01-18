# Idea11y Flask server

This folder contains the **backend server** for Idea11y.  
It is a Python / Flask API used by the frontend Miro plugin in the repository root.

## Getting Started

### 1. Create and activate a virtualenv

```sh
cd server
python -m venv venv         # or: virtualenv venv
source venv/bin/activate    # on macOS / Linux
# On Windows: venv\Scripts\activate
```

### 2. Install Python packages

```sh
pip install -r requirements.txt
```

### 3. Run the Flask server

```sh
python app.py
```

By default, the server listens on port `5000` and exposes endpoints under `/api`, for example:

- `GET /api` – health check / hello endpoint.
- `POST /api/grouping` – groups Miro board items.
- `POST /api/editing_group` – computes a good position for a new note.

When running locally, the frontend can be pointed to this server by using the base URL `http://127.0.0.1:5000/api` (see `src/api/grouping.tsx` in the repo root).
