import glob
import traceback
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional

from llama_cpp import Llama
from loguru import logger

from config.settings import get_settings

_settings = get_settings()
_gen_model: Optional[Llama] = None
_emb_model: Optional[Llama] = None
_model_lock = Lock()
_model_path_cache: Optional[Path] = None


def _init_llama(model_path: Path, embedding: bool) -> Llama:
    return Llama(
        model_path=str(model_path),
        n_ctx=_settings.n_ctx,
        n_gpu_layers=_settings.n_gpu_layers,
        n_threads=_settings.n_threads,
        logits_all=False,
        embedding=embedding,
        use_mmap=True,
        use_mlock=False,
        verbose=False,
    )


def _resolve_model_path() -> Path:
    model_path = Path(_settings.model_path)
    if not model_path.exists():
        logger.warning(f"Configured model path not found: {model_path}")
        candidates = sorted(glob.glob("models/*.gguf"))
        if candidates:
            candidates.sort(key=lambda p: Path(p).stat().st_size, reverse=True)
            chosen = candidates[0]
            logger.warning(f"Auto-selected model fallback: {chosen}")
            model_path = Path(chosen)
        else:
            raise FileNotFoundError(
                "No model file found. Expected "
                f"{model_path}. Place a GGUF under models/ or run scripts/download_model.py"
            )
    return model_path


def get_gen_llm() -> Llama:
    global _gen_model, _model_path_cache
    if _gen_model is None:
        with _model_lock:
            if _gen_model is None:
                path = _resolve_model_path()
                logger.info(f"Loading generation model from {path}")
                try:
                    _gen_model = _init_llama(path, embedding=False)
                except ValueError as e:
                    if "NULL pointer" in str(e):
                        logger.error("Gen model load NULL pointer; retrying once")
                        _gen_model = _init_llama(path, embedding=False)
                    else:
                        raise
                _model_path_cache = path
                logger.success("Generation model loaded")
    return _gen_model


def get_emb_llm() -> Llama:
    global _emb_model, _model_path_cache
    if not _settings.enable_embeddings:
        raise RuntimeError("Embeddings disabled in settings")
    if _emb_model is None:
        with _model_lock:
            if _emb_model is None:
                path = _resolve_model_path()
                logger.info(f"Loading embedding model from {path}")
                _emb_model = _init_llama(path, embedding=True)
                _model_path_cache = path
                logger.success("Embedding model loaded")
    return _emb_model


def _messages_to_prompt(messages: List[Dict[str, str]]) -> str:
    system_parts = [m["content"] for m in messages if m.get("role") == "system"]
    user_parts = [m["content"] for m in messages if m.get("role") != "system"]
    return "\n".join(system_parts + user_parts)


def generate_chat_completion(
    messages: List[Dict[str, str]],
    stream: bool = True,
    max_tokens: Optional[int] = None,
    temperature: Optional[float] = None,
    **kwargs: Any,
):
    llm = get_gen_llm()
    max_tokens = max_tokens or _settings.max_tokens
    temperature = temperature if temperature is not None else _settings.temperature

    # Allow explicit forcing of completion path (helps with models whose chat template crashes)
    if _settings.force_completion_fallback:
        prompt = _messages_to_prompt(messages)
        logger.info("force_completion_fallback=True -> using create_completion")
        return llm.create_completion(
            prompt=prompt,
            stream=stream,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=_settings.top_p,
            top_k=_settings.top_k,
            repeat_penalty=_settings.repeat_penalty,
            **kwargs,
        )

    try:
        if stream:
            return llm.create_chat_completion(
                messages=messages,
                stream=True,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=_settings.top_p,
                top_k=_settings.top_k,
                repeat_penalty=_settings.repeat_penalty,
                **kwargs,
            )
        else:
            return llm.create_chat_completion(
                messages=messages,
                stream=False,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=_settings.top_p,
                top_k=_settings.top_k,
                repeat_penalty=_settings.repeat_penalty,
                **kwargs,
            )
    except Exception as e:
        # Detect NULL pointer specifically and try a safer path once
        null_ptr = isinstance(e, ValueError) and "NULL pointer" in str(e)
        if null_ptr:
            logger.warning(
                "NULL pointer during chat_completion; switching to completion prompt path"
            )
        else:
            logger.warning(
                f"create_chat_completion failed ({e}); falling back to create_completion"
            )
        prompt = _messages_to_prompt(messages)
        try:
            if stream:
                return llm.create_completion(
                    prompt=prompt,
                    stream=True,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=_settings.top_p,
                    top_k=_settings.top_k,
                    repeat_penalty=_settings.repeat_penalty,
                    **kwargs,
                )
            else:
                return llm.create_completion(
                    prompt=prompt,
                    stream=False,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=_settings.top_p,
                    top_k=_settings.top_k,
                    repeat_penalty=_settings.repeat_penalty,
                    **kwargs,
                )
        except Exception as inner:
            tb = traceback.format_exc(limit=3)
            logger.error(f"Fallback completion also failed: {inner}\n{tb}")
            raise
