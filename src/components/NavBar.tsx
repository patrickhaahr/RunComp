"use client";

import Link from "next/link";
import { useAuth } from "./auth/auth-provider";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { User, LogIn } from "lucide-react";

interface NavBarProps {
  showHeading?: boolean;
}

export const NavBar = ({ showHeading = false }: NavBarProps) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <div className="mb-8">
      {/* Three-column layout: invisible spacer, logo, auth controls */}
      <div className="grid grid-cols-3 py-4">
        {/* Left column - invisible spacer */}
        <div className="w-full"></div>
        
        {/* Center column - logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-0.5">
              <div className="bg-background rounded-full px-4 py-1">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-medium">
                  RunComp
                </span>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Right column - auth controls */}
        <div className="flex justify-end items-center gap-2">
          {user ? (
            <Button asChild size="sm">
              <Link href="/profile" aria-label="Your Profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex flex-col items-end">
              <Button asChild size="sm">
                <Link href="/signup" aria-label="Sign Up">
                  <LogIn className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Conditional heading */}
      {showHeading && !isAuthenticated && (
        <div className="max-w-md mx-auto mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Running Competition
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Who will go the distance? Track everyone&apos;s progress in our friendly competition.
          </p>
        </div>
      )}
    </div>
  );
}; 