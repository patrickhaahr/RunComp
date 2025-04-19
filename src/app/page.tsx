import { Suspense } from "react";
import { RunningLeaderboard } from "@/components/RunningLeaderboard";
import { NavBar } from "@/components/NavBar";

// Use client-side authentication check instead of server-side
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-6 pb-16">
      <div className="container mx-auto px-4">
        <NavBar showHeading={true} />
        
        <Suspense fallback={<div />}>
          <RunningLeaderboard />
        </Suspense>
      </div>
    </main>
  );
}
