#!/usr/bin/env bash
# Clean-checkout smoke test: clones this repo's current HEAD into a fresh
# /tmp directory and runs a real install + build + unit/integration test
# cycle there. Confirms the app doesn't secretly depend on local state (node_modules
# drift, .next cache, uncommitted files) that wouldn't exist for a fresh clone/CI runner.
#
# Only exercises committed history - uncommitted changes aren't included,
# same as a CI checkout. Doesn't run e2e (needs real Google/OpenAI/Redis
# config beyond what's safe to fabricate here).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$(mktemp -d -t friday-smoke-XXXXXX)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "==> Cloning $REPO_ROOT (HEAD) into $WORK_DIR"
git clone --quiet --no-local "$REPO_ROOT" "$WORK_DIR"
cd "$WORK_DIR"

echo "==> Writing a dummy .env.local (schema-valid, no real credentials)"
cat > .env.local <<EOF
AUTH_SECRET="smoke-test-secret-0123456789abcdef0123456789"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/smoke_test"
GOOGLE_CREDENTIALS='{"web":{"client_id":"smoke-test-client-id","client_secret":"smoke-test-client-secret"}}'
OPENAI_API_KEY="sk-smoke-test"
EOF

echo "==> Installing dependencies (frozen lockfile)"
pnpm install --frozen-lockfile

echo "==> Type-checking"
npx tsc --noEmit

echo "==> Linting"
pnpm lint

echo "==> Building"
pnpm build

echo "==> Running unit/integration tests"
pnpm test

echo "==> Smoke test passed: $(git -C "$WORK_DIR" rev-parse --short HEAD)"
