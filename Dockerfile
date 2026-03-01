FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/

RUN npm ci --workspace=shared --workspace=backend


FROM deps AS build

COPY shared/ shared/
COPY backend/ backend/

RUN npm run build --workspace=shared && npm run build --workspace=backend


FROM node:22-bookworm-slim AS runtime

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/

RUN npm ci --omit=dev --workspace=shared --workspace=backend

COPY --from=build /app/shared/dist shared/dist
COPY --from=build /app/backend/build backend/build

EXPOSE 3000
CMD ["node", "backend/build/backend/src/server.js"]
