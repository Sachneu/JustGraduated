import { Brain, Target, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // Utility for conditional classNames (common in ShadCN)

// StatsCards component
export default function StatsCards({ assessments, isLoading = false, error = null }) {
  // Function to calculate average score
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  // Function to get the latest assessment
  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[assessments.length - 1];
  };

  // Function to calculate total questions practiced
  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  // Function to determine score color based on performance
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  // If there's an error, display it
  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error || "Failed to load stats. Please try again later."}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-1">
        {/* Average Score Card */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Trophy
                  className="h-4 w-4 text-muted-foreground"
                  aria-label="Trophy icon"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your average score across all assessments</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div
                className={cn(
                  "text-2xl font-bold",
                  getScoreColor(Number(getAverageScore()))
                )}
                aria-label={`Average score: ${getAverageScore()}%`}
              >
                {getAverageScore()}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Across all assessments</p>
          </CardContent>
        </Card>

        {/* Questions Practiced Card */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Practiced</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Brain
                  className="h-4 w-4 text-muted-foreground"
                  aria-label="Brain icon"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Total number of questions you’ve practiced</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div
                className="text-2xl font-bold"
                aria-label={`Total questions practiced: ${getTotalQuestions()}`}
              >
                {getTotalQuestions()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total questions</p>
          </CardContent>
        </Card>

        {/* Latest Score Card */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Target
                  className="h-4 w-4 text-muted-foreground"
                  aria-label="Target icon"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your score from the most recent quiz</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div
                className={cn(
                  "text-2xl font-bold",
                  getScoreColor(getLatestAssessment()?.quizScore || 0)
                )}
                aria-label={`Latest score: ${getLatestAssessment()?.quizScore || 0}%`}
              >
                {getLatestAssessment()?.quizScore.toFixed(1) || 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Most recent quiz</p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}