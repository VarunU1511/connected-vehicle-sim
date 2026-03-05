# Builder Image
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY simulation/package.json ./simulation/
COPY services/telemetry-processor/package.json ./services/telemetry-processor/
COPY infra/package.json ./infra/
COPY tsconfig.json ./

# Install dependencies (ignoring scripts for security in build phase)
RUN yarn install --immutable --mode=skip-build

COPY simulation ./simulation
COPY shared ./shared

# Compile TypeScript for the producer simulation
RUN yarn workspace simulation tsc

# Production Image
FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/simulation/package.json ./simulation/
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/simulation/dist ./simulation/dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

# The default command to run the simulation
CMD ["node", "simulation/dist/producer.js"]
