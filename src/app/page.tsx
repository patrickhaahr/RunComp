import { RunningLeaderboard } from "@/components/RunningLeaderboard";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-6 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <div className="max-w-md mx-auto mb-12 text-center pt-8">
          <div className="inline-block mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-0.5">
            <div className="bg-background rounded-full px-4 py-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-medium">
                RunComp
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Running Competition
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Who will go the distance? Track everyone's progress in our friendly competition.
          </p>
        </div>
        
        <RunningLeaderboard />

      </div>
    </main>
  );
}
