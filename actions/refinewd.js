"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function refineWorkDescription(formData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  const companyName = formData.get("companyName");
  const position = formData.get("position");
  const jobDescription = formData.get("jobDescription");

  // Validation
  if (!companyName || !position || !jobDescription) {
    return {
      error: "Please provide company name, position, and job description.",
    };
  }

  // Construct prompt for Gemini AI
  const industry = user.industryInsight?.industry || "general";
  const prompt = `
    As an expert resume writer, generate 3-4 concise work descriptions for a ${position} at ${companyName} in the ${industry} industry, based on this job description: "${jobDescription}".
    Format the response as a list of bullet points (e.g., "- Description 1", "- Description 2").
    Follow these guidelines:
    1. Use strong action verbs (e.g., "Developed", "Led", "Optimized", "Collaborated").
    2. Include metrics and results where possible (e.g., "increased efficiency by 20%").
    3. Highlight relevant technical skills from ${industry} (e.g., ${user.industryInsight?.topSkills?.join(", ") || "general skills"}).
    4. Keep it concise but detailed.
    5. Focus on achievements over responsibilities.
    6. Use industry-specific keywords from ${industry}.
    Return only the list, no additional text or explanations.
  `;

  try {
    // Call Gemini AI
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse response into an array
    const descriptions = responseText
      .split("\n")
      .filter((line) => line.startsWith("-") && line.trim().length > 1)
      .map((line) => line.replace(/^-/, "").trim())
      .slice(0, 4);


    // Save to WorkDescription model
    /*const workDescription = await db.workDescription.upsert({
      where: {
        userId_companyName_position: {
          userId: user.id,
          companyName,
          position,
        },
      },
      update: {
        content: descriptions.join("\n"),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        companyName,
        position,
        content: descriptions.join("\n"),
      },
    });*/

    revalidatePath("/refinejd"); // Adjust path as needed

    return {
      success: true,
      descriptions,
      //id: workDescription.id,
    };
  } catch (error) {
    console.error("Error refining work description:", error);
    return {
      error: "Failed to generate refined descriptions. Please try again.",
    };
  }
}