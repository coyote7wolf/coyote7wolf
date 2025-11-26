#!/bin/bash
# smoke_grpcurl.sh

set -e

PROTO=api/sync.proto
ADDR=localhost:3202

# 1. SyncDelta
grpcurl -plaintext -import-path api -proto sync.proto \
  -d '{"user_id":"u1","doc_id":"d1","delta":"patch1"}' \
  $ADDR sync.SyncService/SyncDelta

# 2. GetVersions
grpcurl -plaintext -import-path api -proto sync.proto \
  -d '{"user_id":"u1","doc_id":"d1"}' \
  $ADDR sync.SyncService/GetVersions

# 3. Replay
grpcurl -plaintext -import-path api -proto sync.proto \
  -d '{"user_id":"u1","doc_id":"d1","deltas":["p1","p2"]}' \
  $ADDR sync.SyncService/Replay

# 4. GetStatus
grpcurl -plaintext -import-path api -proto sync.proto \
  -d '{"user_id":"u1","doc_id":"d1"}' \
  $ADDR sync.SyncService/GetStatus

echo "gRPC smoke test completed."
