import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { type, role, level, techstack, amount, userid } = await request.json();

    // Generate interview questions using Google Gemini AI
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `The job role is ${role}.
      The job experience level is ${level}.
      The industry is ${industry}.
      If the industry is tech-related, the tech stack used in the job is: ${techstack}.
      The focus between behavioural and technical questions should lean towards: ${type}.
      The amount of questions required is: ${amount}.
      Please return only the questions, without any additional text.
      The questions are going to be read by a voice assistant, so do not use any special characters that might break the voice assistant.
      Return the questions formatted like this: ["Question 1", "Question 2", "Question 3"]
      
      Thank you!
      
      
      `,
    });

    // Convert questions from string to array
    const parsedQuestions = JSON.parse(questions);

    // Save the interview to PostgreSQL using Prisma
    const interview = await db.interview.create({
      data: {
        role,
        type,
        level,
        techstack: techstack.split(","), // Store as an array
        questions: parsedQuestions, // Store questions array
        userId: userid,
        finalized: true,
        //coverImage: getRandomInterviewCover(),
        createdAt: new Date(),
      },
    });

    return new Response(JSON.stringify({ success: true, interview }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
} 


export async function GET() {
  return Response.json({success:true , data: 'Thank you'}, { status: 200})
}