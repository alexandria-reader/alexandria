Alexandria is an open source language learning app that allows users learn languages using text.

Read about how we made it [here](https://alexandria-reader.github.io/).

Alexandria is accessible [here](https://tryalexandria.com/).

# Project structure

This is a monorepo with three packages:

- `backend/` — Express + TypeScript API server
- `frontend/` — React + Vite + TypeScript client
- `shared/` — `@alexandria/shared` types used by both packages

Managed with [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces).

# Running Alexandria locally for development

1. Follow the instructions [here](https://docs.docker.com/get-docker/) to install Docker Desktop
2. Clone this repo: `git clone git@github.com:alexandria-reader/alexandria.git`
3. Run `npm install` from the root directory
4. Add a `.env` file to `backend/` with the values from `backend/src/model/.env.sample`
5. Add a `.env` file to `frontend/` (see `frontend/.env.vault` for the shape)
6. Run `npm run docker:start` to start the database
7. Run `npm run dev` to start both backend and frontend

The backend runs on `http://localhost:3001` and the frontend on `http://localhost:3000`.

# Testing

Run `npm test` from the root to run backend tests. This requires a running Postgres instance — use `npm run pgtest` to spin up a Docker container, run tests, and tear it down automatically.

# Troubleshooting

If you get a 500 error from the languages endpoint, make sure the database is running and seeded. Start it with `npm run docker:start`.
