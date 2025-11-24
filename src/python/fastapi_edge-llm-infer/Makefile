# Convenience Makefile for local LLM inference server
# Usage: make run / make chat PROMPT="Hello" / etc.
# run target now auto-runs `uv sync` and activates .venv before launching.

PYTHON=python
# Use module form to avoid 'uvicorn: command not found' when scripts dir not on PATH
UVICORN=$(PYTHON) -m uvicorn

# If FAST=1 is passed, skip uv sync (faster subsequent starts)
FAST ?= 0
ifeq ($(FAST),1)
SYNC_CMD = @echo "[run] FAST=1 -> skip uv sync"
else
SYNC_CMD = @echo "[run] syncing deps (override with FAST=1)" && uv sync
endif
APP=app.main:app
HOST?=0.0.0.0
PORT?=8000
PYTHONPATH:=src
ENV_EXPORT=PYTHONPATH=$(PYTHONPATH)

run:
	@command -v uv >/dev/null 2>&1 || { echo "uv not installed. Install: curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
	$(SYNC_CMD)
	@echo "[run] checking MODEL_PATH"
	@if [ -f .env ]; then . .env; fi; \
	if [ -z "$$MODEL_PATH" ]; then echo "[run][error] MODEL_PATH not set (edit .env or run: make tiny)"; exit 2; fi; \
	if [ ! -f "$$MODEL_PATH" ]; then echo "[run][error] MODEL_PATH file not found: $$MODEL_PATH"; echo "Hint: make tiny 或重新下載對應模型"; exit 3; fi; \
	echo "[run] using MODEL_PATH=$$MODEL_PATH";
	@echo "[run] activating venv + starting server"
	. .venv/bin/activate && $(ENV_EXPORT) $(UVICORN) $(APP) --host $(HOST) --port $(PORT)

run-reload:
	@command -v uv >/dev/null 2>&1 || { echo "uv not installed. Install: curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
	$(SYNC_CMD)
	@echo "[run-reload] checking MODEL_PATH"
	@if [ -f .env ]; then . .env; fi; \
	if [ -z "$$MODEL_PATH" ]; then echo "[run-reload][error] MODEL_PATH not set (edit .env or run: make tiny)"; exit 2; fi; \
	if [ ! -f "$$MODEL_PATH" ]; then echo "[run-reload][error] MODEL_PATH file not found: $$MODEL_PATH"; exit 3; fi; \
	echo "[run-reload] using MODEL_PATH=$$MODEL_PATH";
	@echo "[run-reload] activating venv + starting server (reload)"
	. .venv/bin/activate && $(ENV_EXPORT) $(UVICORN) $(APP) --reload --host $(HOST) --port $(PORT)

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

# Download default model
download:
	$(PYTHON) scripts/download_model.py

# Download small model variant (1.5B)
small:
	SMALL=1 $(PYTHON) scripts/download_model.py

# Download TinyLlama 1.1B Chat model and write MODEL_PATH to .env
tiny:
	@model_file="models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"; \
	if [ -f "$$model_file" ]; then \
		echo "[tiny] model already present: $$model_file (skipping download)"; \
		grep -q '^MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' .env 2>/dev/null || { echo 'MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' >> .env; echo '[tiny] appended MODEL_PATH to .env'; }; \
	else \
		echo "[tiny] downloading TinyLlama model..."; \
		MODEL_REPO=TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF \
		MODEL_FILE=tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
		$(PYTHON) scripts/download_model.py && \
		grep -q '^MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' .env 2>/dev/null || echo 'MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' >> .env; \
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
	@model_file="models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"; \
	if [ -f "$$model_file" ]; then rm -f "$$model_file" && echo "[tiny-clean] removed $$model_file"; else echo "[tiny-clean] file not found (nothing to do)"; fi; \
	if [ -f .env ]; then \
		tmpfile=$$(mktemp); \
		grep -v '^MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' .env > $$tmpfile && mv $$tmpfile .env && echo "[tiny-clean] removed MODEL_PATH line from .env" || true; \
	fi

# Run all basic endpoint checks sequentially (requires jq)
smoke:
	set -e; \
	echo 'Health:'; curl -s http://localhost:$(PORT)/health | jq .; \
	echo 'Chat:'; curl -s -X POST http://localhost:$(PORT)/v1/chat/completions -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"Hi"}],"stream":false}' | jq '.choices[0].message.content'; \
	echo 'Completion:'; curl -s -X POST http://localhost:$(PORT)/v1/completions -H 'Content-Type: application/json' -d '{"prompt":"Say hi"}' | jq '.text'; \
	echo 'Embeddings:'; curl -s -X POST http://localhost:$(PORT)/v1/embeddings -H 'Content-Type: application/json' -d '{"input":["test"]}' | jq '.data[0].embedding|length'

# Restart server quickly (kill existing uvicorn then background start)
restart:
	pkill -f uvicorn || true
	$(SYNC_CMD)
	@echo "[restart] activating venv + background start"
	. .venv/bin/activate && $(ENV_EXPORT) $(UVICORN) $(APP) --host $(HOST) --port $(PORT) &

# -------- Multilingual & translation tests --------
health:
	curl -s http://localhost:$(PORT)/health | jq .

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

# Show current model size + sha256 based on MODEL_PATH
sha:
	@if [ -f .env ]; then . .env; fi; \
	if [ -z "$$MODEL_PATH" ]; then echo "[sha][error] MODEL_PATH not set"; exit 2; fi; \
	if [ ! -f "$$MODEL_PATH" ]; then echo "[sha][error] file not found: $$MODEL_PATH"; exit 3; fi; \
	size_bytes=$$(stat -f%z "$$MODEL_PATH" 2>/dev/null || stat -c%s "$$MODEL_PATH"); \
	size_mb=$$(awk "BEGIN {printf \"%.2f\", $$size_bytes/1024/1024}"); \
	if command -v shasum >/dev/null 2>&1; then sha256=$$(shasum -a 256 "$$MODEL_PATH" | awk '{print $$1}'); else sha256="(shasum not available)"; fi; \
	echo "[sha] MODEL_PATH=$$MODEL_PATH"; \
	echo "[sha] size=$$size_mb MB"; \
	echo "[sha] sha256=$$sha256"

# One-shot end-to-end: download tiny if missing -> start server -> wait health -> multi-suite -> shutdown
ensure:
	@echo "[ensure] ensuring tiny model present"; \
	$(MAKE) tiny >/dev/null || true; \
	echo "[ensure] starting server (background)"; \
	FAST=1 $(MAKE) restart >/dev/null; \
	echo "[ensure] waiting for health..."; \
	ok=0; for i in $$(seq 1 25); do curl -sf http://localhost:$(PORT)/health >/dev/null && ok=1 && break; sleep 1; done; \
	if [ $$ok -ne 1 ]; then echo "[ensure][error] server health not ready after timeout"; pkill -f uvicorn || true; exit 5; fi; \
	echo "[ensure] health OK -> running multilingual suite"; \
	$(MAKE) multi-suite; \
	echo "[ensure] tests done -> stopping server"; \
	pkill -f uvicorn || true; \
	echo "[ensure] SUCCESS"

.PHONY: run run-reload chat completion stream embeddings download small tiny tiny-clean smoke restart \
health chat-en chat-zh chat-mix translate-en2zh translate-zh2en translate-zh2ja translate-en2fr translate-context multi-suite sha ensure
