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

# Apply pending migrations and start the application.
#
# This was previously `prisma db push --accept-data-loss`, switched to
# after `migrate deploy` hit a crash loop (P3005: "database schema is not
# empty"). That happened because the database had been provisioned via
# `db push`, not tracked migrations, so it had no _prisma_migrations
# history for `migrate deploy` to reconcile against - `migrate deploy`
# was correctly refusing to guess. `db push --accept-data-loss` "fixed"
# the crash loop by sidestepping migrations entirely, but it runs on
# every container start/restart and will SILENTLY apply destructive
# schema changes (dropped/renamed columns) straight to production data
# with no review, the moment any future schema.prisma change removes or
# renames something.
#
# Fixed at the root instead: the database needs a one-time migration
# baseline (`prisma migrate resolve --applied <migration>` for each
# existing migration, after confirming zero schema drift via
# `prisma migrate diff`) before this reverted command will work - see
# agents/01-context/known-issues.md ("Dockerfile used db push in
# production") for the exact one-time steps. Do this before/during the
# next deploy with this image, or migrate deploy will crash-loop again
# exactly like before.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
