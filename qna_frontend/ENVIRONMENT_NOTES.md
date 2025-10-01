Frontend environment configuration

- The app reads environment.apiBaseUrl to call the backend.
- Default is '/api'. Configure reverse proxy or change environment files to point at the backend host (e.g., 'http://localhost:8000').
- To deploy, ensure CORS or proxying is configured accordingly on the backend or gateway.

Required environment variables (set in deployment system, not committed here):
- None strictly required by the frontend at build time. Adjust environment.ts as needed.
