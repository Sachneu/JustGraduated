"use client";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function GetStarted() {
  const router = useRouter();

  return (
    <section className="py-30  from-primary to-secondary text-grey text-center">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ready to Start Your Career?
        </h2>
        <p className="mt-4 text-lg">
          Take the next step in your journey. Optimize your resume, prepare for interviews, and land your dream job!
        </p>

        {/* If signed in → Go to dashboard | If signed out → Show Sign-in Modal */}
        <div className="mt-8">
          <SignedOut>
            <SignInButton mode="modal" signInFallbackRedirectUrl="/dashboard">
              <button className="px-6 py-3 text-lg font-semibold bg-white text-primary rounded-lg shadow-xl hover:shadow-xl transition-all animate-bounce dark:bg-gray-800 dark:text-white cursor-pointer">
              Start your Journey Today ➔
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 text-lg font-semibold bg-white text-primary rounded-lg shadow-xl hover:shadow-xl transition-all animate-bounce dark:bg-gray-800 dark:text-white cursor-pointer"
            >
              Go To Dashboard ➔
            </button>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}
