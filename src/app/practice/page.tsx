import Link from "next/link";
import { SirBotMark } from "@/components/landing/SirBotMark";

export default function PracticePlaceholderPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <SirBotMark className="h-[96px] w-[88px]" />
      <p className="mt-6 text-[12px] font-semibold uppercase tracking-wide text-[#7453a6]">
        Interview ni Lods
      </p>
      <h1 className="mt-2 text-[32px] font-semibold text-[#242126]">
        Practice workspace coming next
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-[1.5] text-[#716a79]">
        This route will host the interview setup and live coaching screens from the Figma design.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-[44px] items-center justify-center rounded-[11px] bg-[#242126] px-6 text-[13px] font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        ← Back to landing
      </Link>
    </main>
  );
}

