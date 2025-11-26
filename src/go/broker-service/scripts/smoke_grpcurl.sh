#!/bin/bash
# grpcurl smoke test for syncCoreAI-broker-service
set -e

# PublishEvent
resp=$(grpcurl -plaintext -d '{"topic":"test-topic","payload":"hello","token":"test-token"}' localhost:3301 event.EventBus/PublishEvent)
echo "PublishEvent resp: $resp"

# ListTopics
resp=$(grpcurl -plaintext -d '{"token":"test-token"}' localhost:3301 event.EventBus/ListTopics)
echo "ListTopics resp: $resp"

# SubscribeEvent (stream, get 1 message)
grpcurl -plaintext -d '{"topic":"test-topic","token":"test-token"}' localhost:3301 event.EventBus/SubscribeEvent | head -n 1

echo "grpcurl smoke test completed."
