import { auth } from "@clerk/nextjs/server";
import {
  getInterviewById,
  getLatestInterviews,
} from "@/actions/generate-interview";
import InterviewCard from "@/components/ui/InterviewCard";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/data/dummy";

async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return <p>Please log in to view your interviews.</p>;
  }

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewById(userId),
    getLatestInterviews({ userId }),
  ]);

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = allInterview?.length > 0;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4">
      {/* CTA Section */}
      <section className="card-cta py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-6 max-w-lg w-full text-center">
            <p className="text-lg">
              Practice real interview questions and get instant feedback
            </p>
            <Button asChild className="btn-primary w-full sm:w-auto mx-auto sm:mx-0 mt-10">
              <Link href="/ai-assistant-interview/mockinterview">
                Start an Interview
              </Link>
            </Button>
          </div>
          <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
        </div>
      </section>

      {/* Your Interviews Section */}
      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-2xl font-semibold">Your Interviews</h2>
        <div className="interviews-section flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4">
          {Array.isArray(dummyInterviews) && dummyInterviews.length > 0 ? (
            dummyInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>Error: Interviews data is not an array.</p>
          )}
          {/* Uncomment this to use real data instead of dummyInterviews */}
          {/* {hasPastInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={userId}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven't taken any interviews yet</p>
          )} */}
        </div>
      </section>

      {/* Take Interviews Section */}
      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-2xl font-semibold">Take Interviews</h2>
        <div className="interviews-section flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4">
          {hasUpcomingInterviews ? (
            allInterview.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={userId}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;