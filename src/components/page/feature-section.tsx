import { FeatureCard } from "./feature-card";

export function FeatureSection() {
  return (
    <div className="mt-16 text-left w-full max-w-4xl">
      <p className="text-xs font-mono mb-2 text-muted-foreground">RISUTO LETS YOU</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard>
          <div>
        <h3 className="font-semibold text-lg mb-1">Books</h3>
          </div>
        </FeatureCard>
        <FeatureCard>
          <div>
        <h3 className="font-semibold text-lg mb-1">Review</h3>
          </div>
        </FeatureCard>
        <FeatureCard>
          <div>
        <h3 className="font-semibold text-lg mb-1">Collaborate</h3>
          </div>
        </FeatureCard>
      </div>
    </div>
  );
}