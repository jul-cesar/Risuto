import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card"; // Asumiendo que usas shadcn/ui u otra librería similar

interface FeatureCardProps {
  children: ReactNode;
  height?: string;
}

export function FeatureCard({ children, height = "h-24" }: FeatureCardProps) {
  return (
    <Card>
      <CardContent className={height}>
        {children}
      </CardContent>
    </Card>
  );
}