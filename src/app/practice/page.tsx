import type { Metadata } from "next";
import { PracticeWorkspace } from "@/components/practice/PracticeWorkspace";
import { normalizePracticeScreen, type PracticeScreenId } from "@/components/practice/practice-config";

interface PracticePageProps {
  searchParams: Promise<{ screen?: string | string[] }>;
}

const TITLES_BY_SCREEN: Record<PracticeScreenId, string> = {
  "01": "New interview · Interview ni Lods",
  "02": "Live interview · Interview ni Lods",
  "03": "Live score preview · Interview ni Lods",
  "04": "Interview results · Interview ni Lods",
};

export async function generateMetadata({ searchParams }: PracticePageProps): Promise<Metadata> {
  const params = await searchParams;
  const screen = normalizePracticeScreen(params.screen);
  return {
    title: TITLES_BY_SCREEN[screen],
  };
}

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
  const screen = normalizePracticeScreen(params.screen);
  return <PracticeWorkspace key={screen} initialScreen={screen} />;
}
