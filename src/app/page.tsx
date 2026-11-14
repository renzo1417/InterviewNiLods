import { CustomerStoriesSection } from "@/components/landing/CustomerStoriesSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StartPracticingSection } from "@/components/landing/StartPracticingSection";
import { WorkshopSection } from "@/components/landing/WorkshopSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-white">
      <HeroSection />
      <HowItWorksSection />
      <WorkshopSection />
      <FeaturesSection />
      <CustomerStoriesSection />
      <FaqSection />
      <StartPracticingSection />
      <FooterSection />
    </main>
  );
}

