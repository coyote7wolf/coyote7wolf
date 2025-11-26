# Convenience Makefile for syncCoreAI LLM Adapter Service
# Usage: make run / make chat PROMPT="Hello" / etc.

PNPM := pnpm
NODE := node
APP_NAME := synccoreai-llm-adapter-service
HOST ?= 0.0.0.0
PORT ?= 3602

# Model configuration
MODEL_PATH ?= ./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
LLM_PROVIDER ?= local

run: tiny
	@echo "[run] installing dependencies"
	@command -v pnpm >/dev/null 2>&1 || { echo "pnpm not installed. Install: npm install -g pnpm"; exit 1; }
	$(PNPM) install
	@echo "[run] checking MODEL_PATH"
	@if [ ! -f "$(MODEL_PATH)" ]; then echo "[run][error] MODEL_PATH file not found: $(MODEL_PATH)"; echo "Hint: run 'make tiny' to download"; exit 3; fi; \
	echo "[run] using MODEL_PATH=$(MODEL_PATH)";
	@echo "[run] starting LLM Adapter Service with local LLM provider"
	LLM_PROVIDER=$(LLM_PROVIDER) MODEL_PATH=$(MODEL_PATH) $(PNPM) start:dev

build:
	@echo "[build] building application"
	$(PNPM) install
	$(PNPM) build

start:
	@echo "[start] starting LLM Adapter Service"
	$(PNPM) start

# Download TinyLlama 1.1B Chat model and write MODEL_PATH to .env
tiny:
	@model_file="$(MODEL_PATH)"; \
	if [ -f "$$model_file" ]; then \
		echo "[tiny] model already present: $$model_file (skipping download)"; \
		grep -q '^MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' .env 2>/dev/null || { echo 'MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' >> .env; echo '[tiny] appended MODEL_PATH to .env'; }; \
	else \
		echo "[tiny] creating models directory..."; \
		mkdir -p models; \
		echo "[tiny] downloading TinyLlama model (this may take a few minutes)..."; \
		curl -L -o "$$model_file" "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf" && \
		if [ -f .env ]; then grep -q '^MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' .env 2>/dev/null || echo 'MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' >> .env; else echo 'MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' > .env; fi; \
		echo "[tiny] downloaded and set MODEL_PATH"; \
	fi; \
	if command -v shasum >/dev/null 2>&1; then \
		sha256=$$(shasum -a 256 "$$model_file" | awk '{print $$1}'); \
		echo "[tiny] sha256=$$sha256"; \
	fi; \
	size_bytes=$$(stat -f%z "$$model_file" 2>/dev/null || stat -c%s "$$model_file"); \
	size_mb=$$(awk "BEGIN {printf \"%.2f\", $$size_bytes/1024/1024}"); \
	echo "[tiny] size=$$size_mb MB"

tiny-clean:
	@model_file="$(MODEL_PATH)"; \
	if [ -f "$$model_file" ]; then rm -f "$$model_file" && echo "[tiny-clean] removed $$model_file"; else echo "[tiny-clean] file not found (nothing to do)"; fi; \
	if [ -f .env ]; then \
		tmpfile=$$(mktemp); \
		grep -v '^MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' .env > $$tmpfile && mv $$tmpfile .env && echo "[tiny-clean] removed MODEL_PATH line from .env" || true; \
	fi

# Simple one-off chat (non-stream) using curl
chat:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"'"$${PROMPT:-Hello, who are you?}"'"}],"stream":false}' | jq '.choices[0].message.content'

# Plain completion path
completion:
	curl -s -X POST http://localhost:$(PORT)/v1/completions -H 'Content-Type: application/json' -d '{"prompt":"'"$${PROMPT:-Explain recursion concisely.}"'"}' | jq '.text'

# Streaming example
stream:
	curl -N -X POST http://localhost:$(PORT)/v1/chat/completions -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"'"$${PROMPT:-Stream a short story about a cat.}"'"}],"stream":true}'

# Embeddings example
embeddings:
	curl -s -X POST http://localhost:$(PORT)/v1/embeddings -H 'Content-Type: application/json' -d '{"input":["Hello world","測試 嵌入"]}' | jq '.data[0].embedding[:8]'

# Health check
health:
	curl -s http://localhost:$(PORT)/health | jq .

# LLM specific endpoints
llm-generate:
	curl -s -X POST http://localhost:$(PORT)/llm/generate -H 'Content-Type: application/json' -d '{"prompt":"'"$${PROMPT:-Explain AI}"'","maxTokens":100,"temperature":0.7}' | jq '.'

llm-embedding:
	curl -s -X POST http://localhost:$(PORT)/llm/embedding -H 'Content-Type: application/json' -d '{"text":"'"$${TEXT:-Hello world}"'"}' | jq '.'

llm-health:
	curl -s http://localhost:$(PORT)/llm/health | jq '.'

llm-config:
	curl -s http://localhost:$(PORT)/llm/config | jq '.'

# LoRA endpoints
lora-train:
	curl -s -X POST http://localhost:$(PORT)/v1/lora/train -H 'Content-Type: application/json' -d '{"model":"tinyllama","datasetPath":"./data","epochs":3}' | jq '.'

lora-status:
	curl -s http://localhost:$(PORT)/v1/lora/status/$(JOB_ID) | jq '.'

lora-result:
	curl -s http://localhost:$(PORT)/v1/lora/result/$(JOB_ID) | jq '.'

# Fine-tuning endpoints
fine-tune:
	curl -s -X POST http://localhost:$(PORT)/v1/fine-tune -H 'Content-Type: application/json' -d '{"model":"tinyllama","datasetPath":"./data","epochs":3}' | jq '.'

fine-tune-status:
	curl -s http://localhost:$(PORT)/v1/fine-tune/status/$(JOB_ID) | jq '.'

fine-tune-result:
	curl -s http://localhost:$(PORT)/v1/fine-tune/result/$(JOB_ID) | jq '.'

# Run all basic endpoint checks sequentially (requires jq)
smoke:
	set -e; \
	echo 'Health:'; curl -s http://localhost:$(PORT)/health | jq .; \
	echo 'Chat:'; curl -s -X POST http://localhost:$(PORT)/v1/chat/completions -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"Hi"}],"stream":false}' | jq '.choices[0].message.content'; \
	echo 'Completion:'; curl -s -X POST http://localhost:$(PORT)/v1/completions -H 'Content-Type: application/json' -d '{"prompt":"Say hi"}' | jq '.text'; \
	echo 'Embeddings:'; curl -s -X POST http://localhost:$(PORT)/v1/embeddings -H 'Content-Type: application/json' -d '{"input":["test"]}' | jq '.data[0].embedding|length'; \
	echo 'LLM Generate:'; curl -s -X POST http://localhost:$(PORT)/llm/generate -H 'Content-Type: application/json' -d '{"prompt":"Test"}' | jq '.'; \
	echo 'LLM Embedding:'; curl -s -X POST http://localhost:$(PORT)/llm/embedding -H 'Content-Type: application/json' -d '{"text":"Test"}' | jq '.'; \
	echo 'LLM Health:'; curl -s http://localhost:$(PORT)/llm/health | jq '.'; \
	echo 'LLM Config:'; curl -s http://localhost:$(PORT)/llm/config | jq '.'

# -------- Multilingual & translation tests --------
chat-en:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions \
	  -H 'Content-Type: application/json' \
	  -d '{"messages":[{"role":"user","content":"Explain recursion concisely."}],"stream":false}' | jq '.choices[0].message.content'

chat-zh:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions \
	  -H 'Content-Type: application/json' \
	  -d '{"messages":[{"role":"user","content":"請用中文簡短解釋遞迴是什麼?"}],"stream":false}' | jq '.choices[0].message.content'

chat-mix:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions \
	  -H 'Content-Type: application/json' \
	  -d '{"messages":[{"role":"user","content":"Explain 什麼是機器學習 in bilingual (English + 中文)."}],"stream":false}' | jq '.choices[0].message.content'

translate-en2zh:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions \
	  -H 'Content-Type: application/json' \
	  -d '{"messages":[{"role":"user","content":"Translate to Chinese: Large Language Models enable advanced reasoning."}],"stream":false}' | jq '.choices[0].message.content'

translate-zh2en:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions \
	  -H 'Content-Type: application/json' \
	  -d '{"messages":[{"role":"user","content":"Translate to English: 我喜歡學習大型語言模型"}],"stream":false}' | jq '.choices[0].message.content'

translate-zh2ja:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions \
	  -H 'Content-Type: application/json' \
	  -d '{"messages":[{"role":"user","content":"Translate to Japanese: 我喜歡學習大型語言模型"}],"stream":false}' | jq '.choices[0].message.content'

translate-en2fr:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions \
	  -H 'Content-Type: application/json' \
	  -d '{"messages":[{"role":"user","content":"Translate to French: I enjoy experimenting with open source AI models."}],"stream":false}' | jq '.choices[0].message.content'

translate-context:
	curl -s -X POST http://localhost:$(PORT)/v1/chat/completions \
	  -H 'Content-Type: application/json' \
	  -d '{"messages":[{"role":"user","content":"請先用英文總結: 大型語言模型讓開發者可以更快構建應用, 然後把你的英文總結翻譯成日文"}],"stream":false}' | jq '.choices[0].message.content'

multi-suite:
	set -e; \
	$(MAKE) chat-en; \
	$(MAKE) chat-zh; \
	$(MAKE) chat-mix; \
	$(MAKE) translate-en2zh; \
	$(MAKE) translate-zh2en; \
	$(MAKE) translate-zh2ja; \
	$(MAKE) translate-en2fr; \
	$(MAKE) translate-context

# Test targets
test:
	@echo "[test] running unit tests"
	$(PNPM) test

test-watch:
	@echo "[test-watch] running tests in watch mode"
	$(PNPM) test:watch

test-smoke:
	@echo "[test-smoke] running smoke tests"
	$(PNPM) test:smoke

# Database targets
migrate:
	@echo "[migrate] running database migrations"
	$(PNPM) migrate

studio:
	@echo "[studio] starting Prisma Studio"
	$(PNPM) studio

# Clean up
clean:
	@echo "[clean] removing dist directory"
	rm -rf dist/
	@echo "[clean] removing node_modules (optional - commented out)"
	@echo "To remove node_modules, run: rm -rf node_modules"

# Lint
lint:
	@echo "[lint] running linter"
	$(PNPM) lint 2>/dev/null || echo "Lint script not configured"

# One-shot end-to-end: install deps -> start server -> wait health -> multi-suite -> shutdown
ensure: tiny
	@echo "[ensure] installing dependencies"; \
	$(PNPM) install >/dev/null || true; \
	echo "[ensure] building application"; \
	$(PNPM) build >/dev/null || true; \
	echo "[ensure] starting service (background) with local LLM provider"; \
	LLM_PROVIDER=$(LLM_PROVIDER) MODEL_PATH=$(MODEL_PATH) $(PNPM) start &>/dev/null & \
	echo "[ensure] waiting for health..."; \
	ok=0; for i in $$(seq 1 25); do curl -sf http://localhost:$(PORT)/health >/dev/null && ok=1 && break; sleep 1; done; \
	if [ $$ok -ne 1 ]; then echo "[ensure][error] service health not ready after timeout"; pkill -f "pnpm start" || true; exit 5; fi; \
	echo "[ensure] health OK -> running multilingual suite"; \
	$(MAKE) multi-suite; \
	echo "[ensure] tests done -> stopping service"; \
	pkill -f "pnpm start" || true; \
	echo "[ensure] SUCCESS"

# Restart server quickly (kill existing then background start)
restart:
	pkill -f "pnpm start" || true
	@echo "[restart] starting LLM Adapter Service with local LLM provider"
	LLM_PROVIDER=$(LLM_PROVIDER) MODEL_PATH=$(MODEL_PATH) $(PNPM) start &>/dev/null &

.PHONY: run build start chat completion stream embeddings health llm-generate llm-embedding llm-health llm-config \
lora-train lora-status lora-result fine-tune fine-tune-status fine-tune-result smoke test test-watch test-smoke \
migrate studio clean lint chat-en chat-zh chat-mix translate-en2zh translate-zh2en translate-zh2ja translate-en2fr \
translate-context multi-suite ensure restart tiny tiny-clean
