#!/bin/sh
set -e
# Keep DB columns in sync with schema (no migration history in repo)
npx prisma db push --skip-generate
exec node dist/index.js
