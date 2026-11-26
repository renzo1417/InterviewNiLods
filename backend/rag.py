"""Lightweight ChromaDB RAG using ChromaDB's local all-MiniLM-L6-v2 ONNX embeddings."""

from __future__ import annotations

import io
from pathlib import Path
import re
from typing import Any

import chromadb
from docx import Document
from pypdf import PdfReader

MAX_BYTES = 5 * 1024 * 1024
MAX_CHARS = 15_000
KB_DIR = Path(__file__).resolve().parent / "knowledge_base"


def extract_resume_text(filename: str, content: bytes) -> str:
    """Extract plain text from an uploaded .pdf, .docx, .txt, or .md file."""
    if not content or len(content) > MAX_BYTES:
        raise ValueError("Resume must be non-empty and under 5 MB.")
    ext = Path(filename or "").suffix.lower()
    if ext == ".pdf":
        raw = "\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(content)).pages)
    elif ext == ".docx":
        doc = Document(io.BytesIO(content))
        raw = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    elif ext in {".txt", ".md"}:
        raw = content.decode("utf-8", errors="replace")
    else:
        raise ValueError("Unsupported file type. Upload a .pdf, .docx, .txt, or .md file.")

    text = re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]+", " ", raw)).strip()
    if len(text) < 20:
        raise ValueError("Could not extract enough readable text from this file.")
    return text[:MAX_CHARS]


def split_text(text: str, chunk_size: int = 450, overlap: int = 80) -> list[str]:
    """Split text into overlapping chunks so context isn't lost at boundaries."""
    chunks, start = [], 0
    while start < len(text):
        piece = text[start : start + chunk_size].strip()
        if piece:
            chunks.append(piece)
        if start + chunk_size >= len(text):
            break
        start += max(1, chunk_size - overlap)
    return chunks


class InterviewRAG:
    """Ephemeral ChromaDB store for coaching guides and uploaded resumes (all-MiniLM-L6-v2)."""

    def __init__(self, kb_dir: Path = KB_DIR, embedding_function: Any = None) -> None:
        self._client = chromadb.EphemeralClient()
        opts = {"embedding_function": embedding_function} if embedding_function else {}
        self._guides = self._client.get_or_create_collection(name="interview_guides", **opts)
        self._resumes = self._client.get_or_create_collection(name="resumes", **opts)

        if kb_dir.exists() and self._guides.count() == 0:
            for path in sorted(kb_dir.glob("*.md")):
                chunks = split_text(path.read_text(encoding="utf-8").strip(), 450, 60)
                if chunks:
                    self._guides.add(
                        ids=[f"kb-{path.stem}-{i}" for i in range(len(chunks))],
                        documents=chunks,
                        metadatas=[{"source": path.name} for _ in chunks],
                    )

    def index_resume(self, resume_id: str, filename: str, text: str) -> dict[str, Any]:
        chunks = split_text(text)
        if not chunks:
            raise ValueError("Resume contains no indexable text.")
        self._resumes.add(
            ids=[f"{resume_id}-c{i}" for i in range(len(chunks))],
            documents=chunks,
            metadatas=[{"resume_id": resume_id, "filename": filename} for _ in chunks],
        )
        preview = text[:180].replace("\n", " ").strip() + ("..." if len(text) > 180 else "")
        return {"resume_id": resume_id, "filename": filename, "char_count": len(text), "chunk_count": len(chunks), "preview": preview}

    def has_resume(self, resume_id: str) -> bool:
        return len(self._resumes.get(where={"resume_id": resume_id}, include=[])["ids"]) > 0

    def retrieve_context(self, query: str, role: str, resume_id: str | None = None, top_k: int = 2) -> dict[str, list[str]]:
        guide_chunks, resume_chunks, sources = [], [], []
        if self._guides.count() > 0:
            res = self._guides.query(query_texts=[f"{role} interview: {query}"], n_results=min(top_k, self._guides.count()))
            for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
                guide_chunks.append(doc[:420])
                src = f"Guide: {meta.get('source', 'guide')}"
                if src not in sources:
                    sources.append(src)
        if resume_id:
            match_count = len(self._resumes.get(where={"resume_id": resume_id}, include=[])["ids"])
            if match_count > 0:
                res = self._resumes.query(query_texts=[query], where={"resume_id": resume_id}, n_results=min(top_k, match_count))
                for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
                    resume_chunks.append(doc[:420])
                    src = f"Resume: {meta.get('filename', 'resume')}"
                    if src not in sources:
                        sources.append(src)
        return {"resume_chunks": resume_chunks, "guide_chunks": guide_chunks, "sources": sources}
