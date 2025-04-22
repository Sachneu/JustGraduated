"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { createClerkClient } from "@clerk/backend";

// Initialize Clerk client with secret key
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              salaryRanges: insights.salaryRanges,
              growthRate: insights.growthRate,
              demandLevel: insights.demandLevel, // Already "HIGH", etc., from generateAIInsights
              topSkills: insights.topSkills,
              marketOutlook: insights.marketOutlook, // Already "POSITIVE", etc.
              keyTrends: insights.keyTrends,
              recommendedSkills: insights.recommendedSkills,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry, // From onboarding form
            experience: data.experience ? parseInt(data.experience) : null,
            bio: data.bio, // From onboarding form
            skills: data.skills, // From onboarding form
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
      }
    );

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  console.log("Authenticated Clerk User ID:", userId);
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    console.log("User not found, creating new user for Clerk ID:", userId);
    const clerkUser = await clerk.users.getUser(userId);
    user = await db.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || `${userId}@example.com`,
        name: clerkUser.firstName || clerkUser.fullName || "Unnamed User", // From Clerk
        imageUrl: clerkUser.imageUrl || "https://via.placeholder.com/150", // From Clerk
        industry: null, // Awaiting onboarding
        bio: null, // Awaiting onboarding
        experience: null,
        skills: [], // Awaiting onboarding
      },
    });
    console.log("New user created:", user);
  }

  try {
    const userData = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!userData?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}