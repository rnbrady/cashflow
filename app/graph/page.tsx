import { ChartPage } from "@/components/chart-page";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="h-screen overflow-hidden" data-theme="transparency">
      <Suspense fallback={null}>
        <ChartPage />
      </Suspense>
    </main>
  );
}
