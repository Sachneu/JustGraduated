"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateTechSpecificQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result.jsx";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { Link, Loader2 } from "lucide-react";

// List of available tech stacks
const techStacks = [
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "Ruby",
  "Go",
  "TypeScript",
  "PHP",
  "SQL",
  "React",
  "Node.js",
  "Django",
  "Spring Boot",
];

export default function QuizSpecific() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedTechStack, setSelectedTechStack] = useState(null);
  const [quizData, setQuizData] = useState(null);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: generatedQuizData,
    setData: setGeneratedQuizData,
  } = useFetch(() => generateTechSpecificQuiz(selectedTechStack));

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  console.log(resultData);

  useEffect(() => {
    if (generatedQuizData) {
      setQuizData(generatedQuizData);
      setAnswers(new Array(generatedQuizData.length).fill(null));
    }
  }, [generatedQuizData]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setSelectedTechStack(null);
    setQuizData(null);
    setGeneratedQuizData(null);
    setResultData(null);
  };

  // Loading state while generating quiz
  if (generatingQuiz) {
    return (
      <div className="mt-10 text-center text-gray-600">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span
            className="text-3xl"
            style={{
              display: "inline-block",
              animation: "twinkle 1.5s infinite",
              background: "linear-gradient(45deg, #3B82F6, #A855F7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ✦
          </span>
          <span>Generating {selectedTechStack} mock questions using AI...</span>
        </div>
        <BarLoader width={"100%"} color="gray" />
        <style jsx>{`
          @keyframes twinkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  // Show results if quiz is completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  // Show tech stack selection if not selected
  if (!selectedTechStack) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Tech-Specific Knowledge Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Select a tech stack to test your knowledge with 10 questions tailored to that technology.
          </p>
          <Select onValueChange={setSelectedTechStack}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a tech stack" />
            </SelectTrigger>
            <SelectContent>
              {techStacks.map((tech) => (
                <SelectItem key={tech} value={tech}>
                  {tech}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter>
          <Button
            onClick={generateQuizFn}
            className="w-full"
            disabled={!selectedTechStack}
          >
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Show initial quiz start screen if quiz data is not yet generated
  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your {selectedTechStack} knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to {selectedTechStack}.
            Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length} ({selectedTechStack})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>
        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className="space-y-2"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion]}
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto"
        >
          {savingResult && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
}