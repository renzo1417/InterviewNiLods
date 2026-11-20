import type { Metadata } from "next";
import { AuthExperience } from "@/components/auth/AuthExperience";
import {
  AUTH_MODE_CONTENT,
  isInitialSigninError,
  normalizeAuthMode,
} from "@/components/auth/auth-config";

interface AuthPageProps {
  searchParams: Promise<{ mode?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: AuthPageProps): Promise<Metadata> {
  const params = await searchParams;
  const mode = normalizeAuthMode(params.mode);
  return {
    title: AUTH_MODE_CONTENT[mode].documentTitle,
  };
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const mode = normalizeAuthMode(params.mode);
  const initialError = isInitialSigninError(params.mode);
  return (
    <AuthExperience
      key={`${mode}-${initialError ? "err" : "ok"}`}
      initialMode={mode}
      initialSigninError={initialError}
    />
  );
}
