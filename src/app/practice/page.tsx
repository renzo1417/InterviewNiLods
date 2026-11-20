import type { Metadata } from "next";
import { PracticeWorkspace } from "@/components/practice/PracticeWorkspace";
import {
  normalizeWorkspaceScreen,
  type WorkspaceScreenId,
} from "@/components/practice/workspace-data";

interface PracticePageProps {
  searchParams: Promise<{ screen?: string | string[] }>;
}

const TITLES_BY_SCREEN: Record<WorkspaceScreenId, string> = {
  "01": "New interview · Interview ni Lods",
  "02": "Live interview · Interview ni Lods",
  "03": "Live score preview · Interview ni Lods",
  "04": "Interview results · Interview ni Lods",
  "05": "Session transcript · Interview ni Lods",
  sessions: "Your sessions · Interview ni Lods",
  "sessions-empty": "Your sessions · Interview ni Lods",
  "sessions-loading": "Syncing sessions · Interview ni Lods",
  "sessions-error": "Sessions · Interview ni Lods",
  tips: "Interview tips · Interview ni Lods",
  "tips-detail": "Interview guide · Interview ni Lods",
  "tips-saved": "Saved guides · Interview ni Lods",
  profile: "Profile · Interview ni Lods",
  "profile-account": "Account & preferences · Interview ni Lods",
  "profile-saved": "Saved answers · Interview ni Lods",
  help: "Help & support · Interview ni Lods",
};

export async function generateMetadata({
  searchParams,
}: PracticePageProps): Promise<Metadata> {
  const params = await searchParams;
  const screen = normalizeWorkspaceScreen(params.screen);
  return {
    title: TITLES_BY_SCREEN[screen],
  };
}

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
  const screen = normalizeWorkspaceScreen(params.screen);
  return <PracticeWorkspace key={screen} initialScreen={screen} />;
}
