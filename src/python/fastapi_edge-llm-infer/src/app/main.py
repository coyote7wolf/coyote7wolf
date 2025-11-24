import json
import time
from typing import Dict, List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from loguru import logger
from pydantic import BaseModel, Field

from config.settings import get_settings
from llm.loader import generate_chat_completion, get_emb_llm
from llm.token_utils import count_messages_tokens, count_tokens

app = FastAPI(title="Local LLM Inference API", version="0.1.0")
settings = get_settings()


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatCompletionRequest(BaseModel):
    model: Optional[str] = Field(None, description="Reserved for compatibility")
    messages: List[Message]
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    stream: bool = True


class ChatCompletionChunkChoiceDelta(BaseModel):
    role: Optional[str] = None
    content: Optional[str] = None


class ChatCompletionChunkChoice(BaseModel):
    index: int
    delta: ChatCompletionChunkChoiceDelta
    finish_reason: Optional[str] = None


class ChatCompletionChunk(BaseModel):
    id: str
    object: str = "chat.completion.chunk"
    created: int
    model: str = "local-llm"
    choices: List[ChatCompletionChunkChoice]


class ChatCompletionResponseChoice(BaseModel):
    index: int
    message: Message
    finish_reason: str


class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str = "local-llm"
    choices: List[ChatCompletionResponseChoice]
    usage: Optional[Dict[str, int]] = None


class EmbeddingsRequest(BaseModel):
    model: Optional[str] = None
    input: List[str]


class EmbeddingData(BaseModel):
    index: int
    embedding: List[float]
    object: str = "embedding"


class EmbeddingsResponse(BaseModel):
    object: str = "list"
    data: List[EmbeddingData]
    model: str = "local-llm"
    usage: Optional[Dict[str, int]] = None


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest):
    start_time = int(time.time())
    messages_payload = [m.model_dump() for m in req.messages]
    prompt_tokens = count_messages_tokens(
        messages_payload, use_tiktoken=settings.use_tiktoken
    )

    try:
        if req.stream:

            def event_stream():
                completion_tokens = 0
                accumulated = ""
                for part in generate_chat_completion(
                    messages_payload,
                    stream=True,
                    max_tokens=req.max_tokens,
                    temperature=req.temperature,
                ):
                    # Support both chat-style (delta.content) and completion-style (text) chunks
                    choice = part.get("choices", [{}])[0]
                    piece = None
                    if isinstance(choice, dict):
                        piece = (
                            choice.get("delta", {}).get("content")
                            if choice.get("delta")
                            else None
                        )
                        if not piece:
                            piece = choice.get("text")
                    if piece:
                        accumulated += piece
                        completion_tokens = count_tokens(
                            accumulated, use_tiktoken=settings.use_tiktoken
                        )
                        chunk = ChatCompletionChunk(
                            id=f"chatcmpl-stream-{start_time}",
                            created=start_time,
                            choices=[
                                ChatCompletionChunkChoice(
                                    index=0,
                                    delta=ChatCompletionChunkChoiceDelta(content=piece),
                                )
                            ],
                        )
                        yield f"data: {chunk.model_dump_json()}\n\n"
                usage_obj = {
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": prompt_tokens + completion_tokens,
                }
                yield f"data: {json.dumps({'usage': usage_obj})}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(event_stream(), media_type="text/event-stream")
        else:
            result = generate_chat_completion(
                messages_payload,
                stream=False,
                max_tokens=req.max_tokens,
                temperature=req.temperature,
            )
            choice0 = result["choices"][0]
            if isinstance(choice0, dict):
                if "message" in choice0 and isinstance(choice0["message"], dict):
                    text = choice0["message"].get("content", "")
                elif "text" in choice0:
                    text = choice0["text"]
                else:
                    raise KeyError("No 'message' or 'text' field in completion choice")
            else:
                raise TypeError("Unexpected choice object type")
            completion_tokens = count_tokens(text, use_tiktoken=settings.use_tiktoken)
            resp = ChatCompletionResponse(
                id=f"chatcmpl-{start_time}",
                created=start_time,
                choices=[
                    ChatCompletionResponseChoice(
                        index=0,
                        message=Message(role="assistant", content=text),
                        finish_reason="stop",
                    )
                ],
                usage={
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": prompt_tokens + completion_tokens,
                },
            )
            return JSONResponse(content=resp.model_dump())
    except Exception as e:
        logger.exception("Error generating completion")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/embeddings")
async def embeddings(req: EmbeddingsRequest):
    if not settings.enable_embeddings:
        raise HTTPException(status_code=400, detail="Embeddings disabled in settings.")
    try:
        llm = get_emb_llm()
        vectors = []
        total_tokens = 0
        for idx, text in enumerate(req.input):
            emb_result = llm.create_embedding(
                text
            )  # llama.cpp returns { 'data': [ { 'embedding': [...] } ] }
            emb_vec = emb_result["data"][0]["embedding"]
            # Handle per-token embeddings (nested list) by pooling strategy.
            if emb_vec and isinstance(emb_vec[0], list):  # list[list[float]] shape
                token_embeddings = emb_vec  # type: ignore
                if len(token_embeddings) == 0:
                    raise RuntimeError("Received empty per-token embedding list")
                pool = settings.embed_pool.lower()
                dim = len(token_embeddings[0])
                if any(len(tok) != dim for tok in token_embeddings):
                    raise RuntimeError(
                        "Inconsistent token embedding dimensions; cannot pool"
                    )
                if pool == "first":
                    emb_vec = token_embeddings[0]
                else:
                    # mean or sum
                    accum = [0.0] * dim
                    for token_vec in token_embeddings:
                        for i, v in enumerate(token_vec):
                            accum[i] += v
                    if pool == "mean":
                        scale = 1.0 / len(token_embeddings)
                        emb_vec = [v * scale for v in accum]
                    else:  # sum
                        emb_vec = accum
            # If still nested irregularly, attempt flatten
            if emb_vec and any(isinstance(x, list) for x in emb_vec):
                try:
                    flat: List[float] = []
                    for item in emb_vec:
                        if isinstance(item, list):
                            flat.extend(float(x) for x in item)
                        else:
                            flat.append(float(item))
                    emb_vec = flat
                except Exception as fe:
                    raise RuntimeError(f"Unable to flatten embedding: {fe}")
            vectors.append(EmbeddingData(index=idx, embedding=emb_vec))
            total_tokens += count_tokens(text, use_tiktoken=settings.use_tiktoken)
        resp = EmbeddingsResponse(
            data=vectors,
            usage={
                "prompt_tokens": total_tokens,
                "total_tokens": total_tokens,
            },
        )
        return JSONResponse(content=resp.model_dump())
    except Exception as e:
        logger.exception("Error creating embeddings")
        raise HTTPException(status_code=500, detail=str(e))


class CompletionRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None


@app.post("/v1/completions")
async def completions(req: CompletionRequest):
    """Plain completion endpoint for debugging models whose chat template crashes."""
    from llm.loader import get_gen_llm  # local import to avoid circular

    llm = get_gen_llm()
    try:
        result = llm.create_completion(
            prompt=req.prompt,
            max_tokens=req.max_tokens or settings.max_tokens,
            temperature=(
                req.temperature if req.temperature is not None else settings.temperature
            ),
            top_p=settings.top_p,
            top_k=settings.top_k,
            repeat_penalty=settings.repeat_penalty,
        )
        text = result["choices"][0]["text"]
        return {
            "id": f"cmpl-{int(time.time())}",
            "object": "text_completion",
            "text": text,
        }
    except Exception as e:
        logger.exception("Error generating completion")
        raise HTTPException(status_code=500, detail=str(e))


# Utility endpoints (optional future) could include /v1/translate, /v1/summarize referencing shared core
