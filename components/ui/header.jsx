// components/ui/header.jsx (Client Component)
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "./button";
import { ModeToggle } from "./ModeToggle";
import { GaugeCircle, FileText, PenBox, GraduationCap, Wand2, StarsIcon, ChevronDown, BarChart2, BarChart2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() { // Remove async
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 w-full border-b py-2 backdrop-blur-md bg-background/80 z-50 supports-[background-filter]:bg-background/60">
      <nav className="container mx-auto px-1 h-16 flex items-center justify-between">
        <Link href="/dashboard">
          {mounted && (
            <Image
              src={resolvedTheme === "dark" ? "/logowhite.png" : "/logo.png"}
              alt="JustGraduated Logo"
              width={200}
              height={60}
              className="h-[145px] py-1 w-auto object-contain"
              priority
            />
          )}
        </Link>

        <div className="flex items-center gap-4">
          <SignedIn>

            {/* Get Industry Insight Button */}
            <Link href="/dashboard">
              <Button className="flex items-center gap-2 cursor-pointer">
                <BarChart2Icon className="h-4 w-4" />
                <span className="hidden md:block">Get Industry Insight</span>
              </Button>
            </Link> 

            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 cursor-pointer">
                  <StarsIcon className="h-4 w-4" />
                  <span className="hidden md:block">Career Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/resume" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Build Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/coverletter" className="flex items-center gap-2">
                    <PenBox className="h-4 w-4" />
                    <span>Write Cover Letter</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/mockinterview" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Knowledge Quiz</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/refinejd" className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    <span>Refine Job Descriptions</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/ai-resume-review" className="flex items-center gap-2">
                    <GaugeCircle className="h-4 w-4" />
                    <span>AI Resume Review</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          {/* Mode Toggle */}
          <ModeToggle />

          {/* Auth Buttons */}
          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="cursor-pointer">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}