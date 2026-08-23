# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configurations and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Remove development packages
RUN npm prune --production

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built code and dependencies from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Run prisma migration deploy and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
