import type { Metadata } from "next";
import { AuthExperience } from "@/components/auth/AuthExperience";
import { AUTH_MODE_CONTENT } from "@/components/auth/auth-config";

export const metadata: Metadata = {
  title: AUTH_MODE_CONTENT.forgot.documentTitle,
};

export default function ForgotPasswordPage() {
  return <AuthExperience initialMode="forgot" />;
}
