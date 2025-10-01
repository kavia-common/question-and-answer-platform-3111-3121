Frontend environment configuration

- The app reads environment.apiBaseUrl to call the backend.
- Default development/prod base URL is 'http://localhost:3001' to match the FastAPI backend in this project.
- You may switch to '/api' if serving through a reverse proxy or gateway that routes to the backend.
- To deploy, ensure CORS or proxying is configured accordingly on the backend or gateway.

Required environment variables (set in deployment system, not committed here):
- None strictly required by the frontend at build time. Adjust environment.ts and environment.prod.ts as needed.
