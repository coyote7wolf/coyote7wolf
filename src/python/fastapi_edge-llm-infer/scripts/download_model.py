"""Flexible model downloader with Hugging Face hub support.

Environment variable precedence (unless explicit CLI flags provided):
    MODEL_REPO   HuggingFace repo id (default: TheBloke/Qwen2-7B-Instruct-GGUF)
    MODEL_FILE   GGUF file name (default: qwen2-7b-instruct.Q4_K_M.gguf)
    HF_TOKEN     (optional) Hugging Face access token for gated models
    SMALL=1      If set, switch to a smaller default model (e.g. Qwen2-1.5B-Instruct Q4)

CLI flags override env vars when supplied:
    --repo  <repo id>
    --file  <filename.gguf>
    --token <hf token>
    --small (shortcut to choose the SMALL defaults)

Examples:
    python scripts/download_model.py \
        --repo TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF \
        --file tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
    SMALL=1 python scripts/download_model.py
    HF_TOKEN=xxxx python scripts/download_model.py \
        --repo Qwen/Qwen2-0.5B-Instruct-GGUF \
        --file qwen2-0_5b-instruct.Q4_K_M.gguf
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Optional

import requests
from huggingface_hub import hf_hub_download

try:
    # Newer versions expose errors in utils
    from huggingface_hub.utils import HfHubHTTPError  # type: ignore
except Exception:  # pragma: no cover
    try:
        from huggingface_hub import HfHubHTTPError  # fallback older style
    except Exception:

        class HfHubHTTPError(Exception):
            pass


DEFAULT_REPO = "TheBloke/Qwen2-7B-Instruct-GGUF"
DEFAULT_FILE = "qwen2-7b-instruct.Q4_K_M.gguf"
SMALL_REPO = "TheBloke/Qwen2-1.5B-Instruct-GGUF"
SMALL_FILE = "qwen2-1_5b-instruct.Q4_K_M.gguf"


def getenv(name: str, default: Optional[str] = None) -> Optional[str]:
    return os.environ.get(name, default)


def download_via_hub(repo: str, filename: str, dest: Path, token: Optional[str]):
    """Download using huggingface_hub with resume + optional auth.

    Adds a revision pin (default: main) for reproducibility.
    """
    print(f"Attempting HuggingFace hub download: repo={repo}, file={filename}")
    try:
        local_path = hf_hub_download(
            repo_id=repo,
            filename=filename,
            token=token,
            revision="main",
            resume_download=True,
        )
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not Path(local_path).samefile(dest):
            # Copy to destination
            with open(local_path, "rb") as src, open(dest, "wb") as dst:
                dst.write(src.read())
        print("Download complete (hub). ->", dest)
    except HfHubHTTPError as e:
        if getattr(e, "response", None) is not None and e.response.status_code == 401:
            print(
                "401 Unauthorized: accept model terms or set HF_TOKEN env var before retrying."
            )
        raise


def download_direct(repo: str, filename: str, dest: Path):
    """Fallback direct HTTP download (no auth, may fail for gated repos)."""
    base = f"https://huggingface.co/{repo}/resolve/main/{filename}?download=true"
    print(f"Attempting direct download: {base}")
    r = requests.get(base, stream=True, timeout=30)
    r.raise_for_status()
    total = int(r.headers.get("content-length", 0))
    chunk = 1024 * 1024
    downloaded = 0
    dest.parent.mkdir(parents=True, exist_ok=True)
    with open(dest, "wb") as f:
        for part in r.iter_content(chunk_size=chunk):
            if part:
                f.write(part)
                downloaded += len(part)
                if total:
                    pct = downloaded / total * 100
                    print(
                        f"{pct:5.1f}% {downloaded/1024/1024:,.1f}MB / {total/1024/1024:,.1f}MB",
                        end="\r",
                    )
    print("\nDownload complete (direct). ->", dest)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Download a GGUF model file from Hugging Face"
    )
    parser.add_argument("--repo", help="HuggingFace repo id (owner/name)")
    parser.add_argument("--file", help="Model filename (GGUF)")
    parser.add_argument("--token", help="HF token (overrides HF_TOKEN env)")
    parser.add_argument(
        "--small",
        action="store_true",
        help="Use SMALL defaults (1.5B instruct variant)",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    env_small = getenv("SMALL") is not None
    want_small = args.small or env_small

    # Determine base defaults
    default_repo = SMALL_REPO if want_small else DEFAULT_REPO
    default_file = SMALL_FILE if want_small else DEFAULT_FILE

    # Resolve with CLI override > env > default
    repo = args.repo or getenv("MODEL_REPO", default_repo)
    filename = args.file or getenv("MODEL_FILE", default_file)
    token = args.token or getenv("HF_TOKEN") or None

    # Keep original explicit mapping for default path compatibility if using defaults
    if not want_small and filename == DEFAULT_FILE:
        dest = Path("models/qwen2-7b-instruct-q4_k_m.gguf")
    else:
        dest = Path("models") / filename

    if dest.exists():
        print("Model file already exists ->", dest)
        return

    print(f"Downloading model (repo={repo}, file={filename}) ...")
    # Try hub first
    try:
        download_via_hub(repo, filename, dest, token)
        return
    except (HfHubHTTPError, OSError, ValueError) as e:
        print("Hub download failed:", e)
        print("Falling back to direct URL...")
    # Fallback direct
    try:
        download_direct(repo, filename, dest)
    except (requests.HTTPError, OSError) as e:
        print("Direct download failed:", e)
        print("All download methods failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
