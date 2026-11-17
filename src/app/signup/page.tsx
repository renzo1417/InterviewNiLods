import type { Metadata } from "next";
import { AuthExperience } from "@/components/auth/AuthExperience";
import { AUTH_MODE_CONTENT } from "@/components/auth/auth-config";

export const metadata: Metadata = {
  title: AUTH_MODE_CONTENT.signup.documentTitle,
};

export default function SignUpPage() {
  return <AuthExperience initialMode="signup" />;
}
