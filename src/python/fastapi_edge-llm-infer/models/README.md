# models/

This directory is intentionally empty (no large model binaries are versioned).

Download a quantized GGUF model with the provided script:

```bash
python scripts/download_model.py                # default (attempt 7B)
SMALL=1 python scripts/download_model.py        # smaller 1.5B model

# Custom example
MODEL_REPO=TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF \
MODEL_FILE=tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
python scripts/download_model.py
```

After download, set or update `.env`:

```bash
echo "MODEL_PATH=./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf" >> .env
```

Do NOT commit `.gguf`, `.bin`, `.safetensors` files—these are ignored by `.gitignore`.

If you truly need to distribute a pointer, consider Git LFS, but prefer instructing users to download locally.
