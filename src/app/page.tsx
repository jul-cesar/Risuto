import { Hero } from "@/components/page/hero";
import { ActionButton } from "@/components/page/action-button";
import { FeatureSection } from "@/components/page/feature-section";


export default function Home() {
  return (
    <div className="flex-1 bg-gradient-to-b from-background-secondary to-background flex flex-col items-center justify-center text-foreground px-2">

      <Hero />

      <ActionButton href="/dashboard">
        Get started !
      </ActionButton>

      <p className="text-xs text-muted-foreground font-mono mt-2">
        Social network for your fav books
      </p>

      <FeatureSection />
    </div>
  );
}
