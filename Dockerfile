# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .

# Build-time env vars for $env/static/private
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG EXPENSE_TRACKER_DATABASE_URL
ENV EXPENSE_TRACKER_DATABASE_URL=$EXPENSE_TRACKER_DATABASE_URL
ARG EXPENSE_TRACKER_PASSWORD_HASH
ENV EXPENSE_TRACKER_PASSWORD_HASH=$EXPENSE_TRACKER_PASSWORD_HASH
ARG EXPENSE_TRACKER_TOKEN_SALT
ENV EXPENSE_TRACKER_TOKEN_SALT=$EXPENSE_TRACKER_TOKEN_SALT

RUN npx svelte-kit sync
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "build/index.js"]
