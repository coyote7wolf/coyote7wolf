from typing import Dict, List

# Prompts are split across segments to keep lines short.
TRANSLATION_SYSTEM = (
    "You are a precise bilingual translation assistant. Preserve meaning, "
    "tone, and domain terminology."
)
SUMMARY_SYSTEM = (
    "You are an expert analyst. Produce concise structured summaries with "
    "key points, metrics, and risks."
)


def build_translation_messages(
    text: str, target_lang: str = "zh-TW"
) -> List[Dict[str, str]]:
    return [
        {"role": "system", "content": TRANSLATION_SYSTEM},
        {"role": "user", "content": f"Translate into {target_lang}:\n{text}"},
    ]


def build_summary_messages(text: str, bullet: bool = True) -> List[Dict[str, str]]:
    style = "Return bullet points" if bullet else "Return a concise paragraph"
    return [
        {"role": "system", "content": SUMMARY_SYSTEM},
        {
            "role": "user",
            "content": f"Summarize the following. {style}.\n===\n{text}\n===",
        },
    ]
