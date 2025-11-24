from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_path: str = "./models/qwen2-7b-instruct-q4_k_m.gguf"
    n_ctx: int = 4096
    n_gpu_layers: int = 0  # Set >0 if you compiled llama.cpp with metal on mac
    n_threads: int | None = None  # Allow manual CPU thread override
    # Some very small / quantized models can crash llama.cpp chat interface; allow forcing plain completion path
    force_completion_fallback: bool = False
    temperature: float = 0.7
    top_p: float = 0.95
    top_k: int = 40
    repeat_penalty: float = 1.1
    max_tokens: int = 512
    log_level: str = "INFO"
    enable_streaming: bool = True
    # Feature flags
    enable_embeddings: bool = True  # default on to allow /v1/embeddings
    enable_rag: bool = False
    use_tiktoken: bool = True
    embed_pool: str = (
        "mean"  # mean|first|sum pooling strategy for per-token embeddings collapse
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
