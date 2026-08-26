#!/bin/sh
exec node "$(dirname "$0")/node_modules/twenty-sdk/dist/cli.cjs" "$@"
