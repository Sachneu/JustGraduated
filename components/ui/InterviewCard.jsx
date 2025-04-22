import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { getFeedbackByInterviewId } from "@/actions/generate-interview";
import { Button } from "./button";
import { Card } from "./card";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}) => {
  const feedback = userId && interviewId
    ? await getFeedbackByInterviewId({ interviewId, userId }).catch((error) => {
        console.error("Error fetching feedback:", error);
        return null;
      })
    : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  
  const badgeStyles = {
    Behavioral: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Mixed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Technical: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }[normalizedType] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="w-[360px] max-sm:w-full m-2 transform transition-all hover:scale-[1.02]">
      <Card className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 h-full">
        {/* Badge */}
        <div className={`absolute top-0 right-0 ${badgeStyles} px-3 py-1 rounded-bl-lg font-medium text-sm`}>
          {normalizedType}
        </div>

        {/* Main Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative">
            <Image
              src="https://randomuser.me/api/portraits/women/37.jpg"
              alt="cover-image"
              width={80}
              height={80}
              className="rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
            />
          </div>

          {/* Title */}
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize text-center">
            {role} Interview
          </h3>

          {/* Tech Stack (if provided) */}
          {techstack && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center">
              {techstack.join(", ")}
            </p>
          )}

          {/* Meta Info */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Image
                src="/calendar.svg"
                width={18}
                height={18}
                alt="calendar"
                className="opacity-70 dark:invert"
              />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/star.svg"
                width={18}
                height={18}
                alt="star"
                className="opacity-70 dark:invert"
              />
              <span className="font-medium">
                {feedback?.totalScore || "---"}/100
              </span>
            </div>
          </div>

          {/* Feedback */}
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-center text-sm line-clamp-2 px-2 flex-grow">
            {feedback?.finalAssessment ||
              "Ready to test your skills? Take this interview to get started!"}
          </p>

          {/* Action Button */}
          <Button className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-800 dark:hover:from-indigo-700 dark:hover:to-purple-900 text-white font-medium py-2 rounded-lg transition-colors duration-200">
            <Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
              {feedback ? "View Feedback" : "View Interview"}
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Updated wrapper component for proper side-by-side layout
export const InterviewCardList = ({ interviews }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-center gap-4 p-4 max-w-full">
      {interviews.map((interview) => (
        <InterviewCard
          key={interview.interviewId}
          {...interview}
        />
      ))}
    </div>
  );
};

export default InterviewCard;