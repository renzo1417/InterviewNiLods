"""OpenAI-compatible JSON client with .env config and token cap."""

from __future__ import annotations

import json
import os
import re
from typing import Any
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

API_KEY = os.getenv("AIKI_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
BASE_URL = os.getenv("AIKI_BASE_URL") or "https://aiki-labs.up.railway.app/api/v1"
MODEL = os.getenv("AIKI_MODEL") or "gpt-6-luna"
MAX_TOKENS = max(64, min(int(os.getenv("MAX_COMPLETION_TOKENS") or "700"), 800))


class LLMResponseError(RuntimeError):
    """Raised when the model fails to return valid JSON."""


class LLMClient:
    """Small wrapper around OpenAI chat completions returning parsed JSON dicts."""

    def __init__(self, client: OpenAI | None = None, model: str = MODEL) -> None:
        self.model = model
        if client is not None:
            self._client = client
        else:
            if not API_KEY:
                raise LLMResponseError("Missing AIKI_API_KEY environment variable.")
            self._client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

    def _ask_json(self, messages: list[dict[str, str]], max_tokens: int) -> str:
        res = self._client.chat.completions.create(
            model=self.model,
            messages=messages,  # type: ignore[arg-type]
            response_format={"type": "json_object"},
            max_completion_tokens=min(max_tokens, MAX_TOKENS),
        )
        raw = (res.choices[0].message.content or "").strip()
        match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", raw, flags=re.DOTALL | re.IGNORECASE)
        return match.group(1).strip() if match else raw

    def chat_json(self, messages: list[dict[str, str]], max_tokens: int = MAX_TOKENS) -> dict[str, Any]:
        """Request a JSON object from the LLM, retrying once if malformed."""
        raw = self._ask_json(messages, max_tokens)
        try:
            data = json.loads(raw)
            if isinstance(data, dict):
                return data
        except json.JSONDecodeError:
            pass

        repaired = self._ask_json(
            [*messages, {"role": "assistant", "content": raw}, {"role": "user", "content": "Return ONLY a valid JSON object."}],
            max_tokens,
        )
        try:
            data = json.loads(repaired)
        except json.JSONDecodeError as exc:
            raise LLMResponseError(f"Invalid JSON from model: {repaired[:160]}") from exc
        if not isinstance(data, dict):
            raise LLMResponseError("Model output must be a JSON object.")
        return data
