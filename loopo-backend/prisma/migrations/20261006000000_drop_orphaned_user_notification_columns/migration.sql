-- Drops columns left over from an earlier version of UserNotification
-- (superseded by `message`/`metadata`) that were never removed when the
-- live dev DB was synced via `prisma db push` instead of a tracked
-- migration. `body` is NOT NULL with no default, so every real insert via
-- the current schema (which only knows `message`) was failing with a null
-- constraint violation on `body`.
ALTER TABLE "user_notifications"
  DROP COLUMN "body",
  DROP COLUMN "data",
  DROP COLUMN "readAt";
