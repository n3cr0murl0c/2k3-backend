#!/bin/ash
bun run medusa telemetry --disable
bun run medusa user -e medusaUser@testmail.com -p change-the-user
bun run $1