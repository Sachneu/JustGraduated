"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateFeedback(transcript) {
  const user = await checkUser(); // Use checkUser for authentication

  const userProfile = await db.user.findUnique({
    where: { clerkUserId: user.id },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!userProfile) throw new Error("User profile not found");

  const formattedTranscript = transcript
    .map(({ role, content }) => `- ${role}: ${content}\n`)
    .join("");


  // Define the AI prompt
  const prompt = `
    You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
    Transcript:
    ${formattedTranscript}

    Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
    - **Communication Skills**: Clarity, articulation, structured responses.
    - **Technical Knowledge**: Understanding of key concepts for the role.
    - **Problem-Solving**: Ability to analyze problems and propose solutions.
    - **Cultural & Role Fit**: Alignment with company values and job role.
    - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.getText();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    let feedback;
    try {
      feedback = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error("Invalid feedback format returned by AI");
    }

    if (!feedback.categoryScores || !Array.isArray(feedback.categoryScores)) {
      throw new Error("Invalid feedback structure");
    }

    return feedback;
  } catch (error) {
    console.error("Error generating feedback:", error.message);
    throw new Error("Failed to generate feedback");
  }
}

// Example of how to get the interview and feedback
export async function getInterviewById(id) {
  return await db.interview.findUnique({
    where: { id },
  });
}

export async function getFeedbackByInterviewId({ interviewId, userId }) {
  return await db.feedback.findFirst({
    where: { interviewId, userId },
  });
}

export async function getLatestInterviews({ userId, limit = 20 }) {
  return await db.interview.findMany({
    where: {
      finalized: true,
      NOT: { userId },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getInterviewsByUserId(userId) {
  return await db.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
