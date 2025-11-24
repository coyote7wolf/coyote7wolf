from __future__ import annotations

from typing import List

try:
    import tiktoken  # type: ignore

    _HAS_TIKTOKEN = True
except Exception:  # pragma: no cover
    _HAS_TIKTOKEN = False

# Provide a simple heuristic tokenizer fallback
# English avg ~4 chars per token; Chinese each char ~1 token (rough approximation)


def approximate_token_count(text: str) -> int:
    if not text:
        return 0
    # Count CJK separately (rough) to avoid underestimating multi-byte sequences
    cjk = sum(1 for ch in text if ord(ch) >= 0x4E00 and ord(ch) <= 0x9FFF)
    ascii_len = len(text) - cjk
    est = cjk + ascii_len // 4
    return max(1, est)


_enc_cache = None


def encode_with_tiktoken(
    text: str, model_name: str = "gpt-3.5-turbo"
) -> List[int]:  # model name for encoding selection
    global _enc_cache
    if not _HAS_TIKTOKEN:
        raise RuntimeError("tiktoken not available")
    if _enc_cache is None:
        try:
            _enc_cache = tiktoken.get_encoding("cl100k_base")
        except Exception:
            _enc_cache = tiktoken.get_encoding("r50k_base")
    return _enc_cache.encode(text)


def count_tokens(text: str, use_tiktoken: bool = True) -> int:
    if use_tiktoken and _HAS_TIKTOKEN:
        try:
            return len(encode_with_tiktoken(text))
        except Exception:
            pass
    return approximate_token_count(text)


def count_messages_tokens(messages: List[dict], use_tiktoken: bool = True) -> int:
    total_text = "".join(m.get("content", "") for m in messages)
    return count_tokens(total_text, use_tiktoken=use_tiktoken)
