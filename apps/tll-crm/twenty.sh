#!/bin/sh
# Any CLI command without yarn: ./twenty.sh remote:list, plan, apply
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}" \
  exec node "$(dirname "$0")/node_modules/twenty-sdk/dist/cli.cjs" "$@"
