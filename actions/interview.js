"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry || "general technology"
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error("Invalid quiz format returned by AI");
    }

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error("Invalid quiz structure: 'questions' must be an array");
    }

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error.message);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function generateTechSpecificQuiz(techStack) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    if (!techStack) {
      throw new Error("Tech stack is required");
    }
  
    const prompt = `
      Generate a technical quiz with 10 multiple-choice questions specifically for ${techStack}.
      Each question should have:
      - A question related to ${techStack}.
      - Four answer options (one correct, three incorrect).
      - The correct answer.
      - A brief explanation of why the correct answer is correct.
      Format the response as a JSON array of objects, where each object has the following structure:
      {
        "question": "Question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "Correct option",
        "explanation": "Explanation text"
      }
    `;
  
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      let quiz;
      try {
        quiz = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Error parsing AI response for tech-specific quiz:", parseError);
        throw new Error("Invalid quiz format returned by AI");
      }
  
      if (!Array.isArray(quiz)) {
        throw new Error("Invalid quiz structure: response must be an array");
      }
  
      return quiz;
    } catch (error) {
      console.error("Error generating tech-specific quiz:", error.message);
      throw new Error("Failed to generate tech-specific quiz questions");
    }
}


export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${
        user.industry || "general technology"
      } technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);
      improvementTip = tipResult.response.text().trim();
      console.log("Improvement Tip:", improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error.message);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error.message);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        quizScore: true,
        category: true,
        improvementTip: true,
        createdAt: true,
        questions: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50, // Limit to 50 assessments for performance
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error.message);
    throw new Error("Failed to fetch assessments");
  }
}