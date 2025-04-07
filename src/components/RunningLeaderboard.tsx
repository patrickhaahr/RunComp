"use client";

import { runners } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const RunningLeaderboard = () => {
  // Sort runners by distance (highest first)
  const sortedRunners = [...runners].sort((a, b) => b.distance - a.distance);
  
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Champion card */}
      {sortedRunners.length > 0 && (
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-16" />
          <CardContent className="p-6 pt-0 -mt-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-md">
                <AvatarImage src={sortedRunners[0].avatar} alt={sortedRunners[0].name} />
                <AvatarFallback>{sortedRunners[0].name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-bold">{sortedRunners[0].name}</h2>
                </div>
                <p className="text-sm text-muted-foreground">Leading the competition</p>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Badge variant="outline" className="px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                  <Activity className="h-3.5 w-3.5 mr-1.5" />
                  {sortedRunners[0].distance.toFixed(1)} km
                </Badge>
                
                <Badge variant="outline" className="px-3 py-1">
                  {sortedRunners[0].runs} runs
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Runners up list */}
      <div className="space-y-2">
        {sortedRunners.slice(1).map((runner, index) => (
          <Card key={runner.id} className={cn(
            "transition-all hover:shadow",
            index === 0 && "border-l-4 border-l-gray-300 dark:border-l-gray-600"
          )}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                {index + 2}
              </div>
              
              <Avatar className="h-10 w-10 border border-muted">
                <AvatarImage src={runner.avatar} alt={runner.name} />
                <AvatarFallback>{runner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{runner.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {runner.distance.toFixed(1)} km • {runner.runs} runs
                </p>
              </div>
              
              {index === 0 && (
                <Badge variant="secondary" className="hidden sm:flex gap-1 items-center">
                  <Medal className="h-3 w-3" />
                  <span>Silver</span>
                </Badge>
              )}
              
              {index === 1 && (
                <Badge variant="secondary" className="hidden sm:flex gap-1 items-center text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900">
                  <Medal className="h-3 w-3" />
                  <span>Bronze</span>
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 