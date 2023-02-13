#!/usr/bin/env zsh
sophondev generate ./schema.sophon -t ts-socketio-server -o ./src/schema.ts
sophondev generate ./schema.sophon -t ts-socketio-client -o ../client/src/schema.ts