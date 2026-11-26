"""Minimal FastAPI HTTP bridge connecting the Next.js UI to InterviewEngine + ChromaDB."""

from __future__ import annotations

from uuid import uuid4
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .interview_engine import InterviewEngine
from .llm_client import CORS_ORIGINS, LLMClient, LLMResponseError, MODEL
from .rag import InterviewRAG, extract_resume_text
from .schemas import CreateSessionRequest, ResumeUploadResponse, SessionRecord, SubmitAnswerRequest, SubmitAnswerResponse

app = FastAPI(title="Interview ni Lods API", version="1.1.0")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

sessions: dict[str, SessionRecord] = {}
_rag: InterviewRAG | None = None
_engine: InterviewEngine | None = None


def get_rag() -> InterviewRAG:
    global _rag
    if _rag is None:
        _rag = InterviewRAG()
    return _rag


def get_engine() -> InterviewEngine:
    global _engine
    if _engine is None:
        _engine = InterviewEngine(LLMClient(), rag=get_rag())
    return _engine


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "model": MODEL,
        "rag": "chromadb (all-MiniLM-L6-v2)",
        "defenses": ["input_filtering", "xml_tagging", "sandwich_defense", "instruction_defense"],
    }


@app.post("/api/resumes/upload")
async def upload_resume(file: UploadFile = File(...)) -> JSONResponse:
    filename = file.filename or "resume.txt"
    try:
        text = extract_resume_text(filename, await file.read())
        resume_id = f"resume-{uuid4().hex[:10]}"
        meta = get_rag().index_resume(resume_id=resume_id, filename=filename, text=text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return JSONResponse(content=ResumeUploadResponse(resumeId=meta["resume_id"], filename=meta["filename"], charCount=meta["char_count"], chunkCount=meta["chunk_count"], preview=meta["preview"]).model_dump(by_alias=True))


@app.post("/api/sessions")
def create_session(body: CreateSessionRequest) -> JSONResponse:
    try:
        record = get_engine().start_session(body.config, resume_id=body.resume_id, resume_filename=body.resume_filename)
    except LLMResponseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    sessions[record.state.id] = record
    return JSONResponse(content=record.state.model_dump(by_alias=True))


@app.get("/api/sessions")
def list_sessions() -> JSONResponse:
    return JSONResponse(content=[rec.state.model_dump(by_alias=True) for rec in reversed(list(sessions.values()))])


@app.get("/api/sessions/{session_id}")
def get_session(session_id: str) -> JSONResponse:
    record = sessions.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail="Session not found.")
    return JSONResponse(content=record.state.model_dump(by_alias=True))


@app.post("/api/sessions/{session_id}/answer")
def submit_answer(session_id: str, body: SubmitAnswerRequest) -> JSONResponse:
    record = sessions.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail="Session not found.")
    if record.state.status == "completed":
        raise HTTPException(status_code=400, detail="Session is already completed.")
    try:
        updated, accepted, reason = get_engine().submit_answer(record, body.answer)
    except LLMResponseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    sessions[session_id] = updated
    return JSONResponse(content=SubmitAnswerResponse(session=updated.state, accepted=accepted, refusalReason=reason).model_dump(by_alias=True))


@app.post("/api/sessions/{session_id}/end")
def end_session(session_id: str) -> JSONResponse:
    record = sessions.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail="Session not found.")
    finalized = get_engine().finalize_session(record)
    sessions[session_id] = finalized
    return JSONResponse(content=finalized.state.model_dump(by_alias=True))
