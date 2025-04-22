"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { generateFeedback } from "@/actions/generate-interview";
import { Card, CardContent, CardHeader, CardFooter } from "./card";
import { Button } from "./button"; // Assuming you have a Button component

const CallStatus = {
  INACTIVE: "INACTIVE",
  CONNECTING: "CONNECTING",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};


const Agent = ({ userName, userId, interviewId, feedbackId, type, questions }) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  const handleCallStart = () => setCallStatus(CallStatus.ACTIVE);
  const handleCallEnd = () => setCallStatus(CallStatus.FINISHED);
  const handleSpeechStart = () => setIsSpeaking(true);
  const handleSpeechEnd = () => setIsSpeaking(false);
  const handleError = (error) => console.error("VAPI Error:", error);
  const handleMessage = (message) => {
    if (message.type === "transcript" && message.transcriptType === "final") {
      const newMessage = { role: message.role, content: message.transcript };
      setMessages((prev) => [...prev, newMessage]);
    }
  };
  // VAPI Event Listeners
  useEffect(() => {
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("error", handleError);
  
    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("message", handleMessage);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("error", handleError);
    };
  }, []);

  // Handle Call End and Feedback
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    if (callStatus === CallStatus.FINISHED && interviewId) {
      const handleGenerateFeedback = async () => {
        const { success, feedbackId: id } = await generateFeedback({
          interviewId,
          userId,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.error("Error saving feedback");
          router.push("/dashboard"); // Redirect to dashboard on error
        }
      };

      if (type === "generate") {
        router.push("/dashboard"); // Adjust as needed
      } else {
        handleGenerateFeedback();
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  // Call Handling Functions
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN, {
          variableValues: { username: userName, userid: userId },
        });
      } else {
        const formattedQuestions = questions
          ? questions.map((q) => `- ${q}`).join("\n")
          : "";
        await vapi.start(interviewer, {
          variableValues: { questions: formattedQuestions },
        });
      }
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Interview Generation
        </h1>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Interviewer Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="flex items-center justify-center relative p-6">
              <div className="relative">
                <Image
                  src="/robot.png"
                  alt="AI Interviewer"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
                {isSpeaking && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            </CardHeader>
            <CardContent className="text-center p-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Interviewer
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Your AI-powered assistant is ready to conduct your interview.
              </p>
            </CardContent>
          </Card>

          {/* User Profile Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="flex justify-center p-6">
              <Image
                src="/robot.png" // Replace with actual user image if available
                alt="User Profile"
                width={100}
                height={100}
                className="rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
            </CardHeader>
            <CardContent className="text-center p-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                "User"
              </h3>
            </CardContent>
          </Card>
        </div>

        
        {messages.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Conversation Transcript
            </h2>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {messages.map((msg, index) => (
                <p
                  key={index}
                  className={cn(
                    "text-sm p-2 rounded-lg",
                    msg.role === "user"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ml-auto"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
                    "max-w-[75%] transition-opacity duration-500 animate-fadeIn"
                  )}
                >
                  {msg.content}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="mt-8 flex justify-center gap-4">
          {callStatus !== CallStatus.ACTIVE ? (
            <Button
              onClick={handleCall}
              disabled={callStatus === CallStatus.CONNECTING}
              className={cn(
                "relative bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium py-3 px-6 rounded-full",
                callStatus === CallStatus.CONNECTING && "opacity-75 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "absolute w-3 h-3 bg-green-300 rounded-full animate-ping top-1 right-1",
                  callStatus !== CallStatus.CONNECTING && "hidden"
                )}
              />
              <span className="relative cursor-pointer">
                {callStatus === CallStatus.CONNECTING ? "Connecting..." : "Start Interview"}
              </span>
            </Button>
          ) : (
            <Button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full"
            >
              End Interview
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agent;