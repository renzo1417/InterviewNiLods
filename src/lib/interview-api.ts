import type {
  InterviewSetupConfig,
  PracticeSessionState,
} from "@/components/practice/practice-config";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export interface UploadedResumeInfo {
  resumeId: string;
  filename: string;
  charCount: number;
  chunkCount: number;
  preview: string;
}

export interface SubmitAnswerApiResponse {
  session: PracticeSessionState;
  accepted: boolean;
  refusalReason?: string | null;
}

async function parseErrorDetail(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    if (data?.detail) return data.detail;
  } catch {
    // Ignore non-JSON error bodies
  }
  return `Request failed (${response.status})`;
}

export async function uploadResumeFile(file: File): Promise<UploadedResumeInfo> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorDetail(response));
  }
  return (await response.json()) as UploadedResumeInfo;
}

export async function createBackendSession(
  config: InterviewSetupConfig,
  resume?: UploadedResumeInfo | null
): Promise<PracticeSessionState> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      config,
      resumeId: resume?.resumeId ?? null,
      resumeFilename: resume?.filename ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorDetail(response));
  }
  return (await response.json()) as PracticeSessionState;
}

export async function submitBackendAnswer(
  sessionId: string,
  answer: string
): Promise<SubmitAnswerApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${encodeURIComponent(sessionId)}/answer`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    }
  );

  if (!response.ok) {
    throw new Error(await parseErrorDetail(response));
  }
  return (await response.json()) as SubmitAnswerApiResponse;
}

export async function endBackendSession(
  sessionId: string
): Promise<PracticeSessionState> {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${encodeURIComponent(sessionId)}/end`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(await parseErrorDetail(response));
  }
  return (await response.json()) as PracticeSessionState;
}
