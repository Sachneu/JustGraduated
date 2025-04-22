import {
    BrainCircuit,
    Briefcase,
    LineChart,
    ScrollText,
    GaugeCircle,
    PenLine,
    Sparkles,
  } from "lucide-react";
  
  // ✅ Exported array of features specific to JustGraduated
  export const features = [
    {
      icon: <Sparkles className="w-10 h-10 mb-4 text-primary" />,
      title: "AI Resume Review",
      description:
        "Analyze your resume with AI and get instant feedback to improve ATS compatibility and structure.",
    },
    {
      icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
      title: "Smart Resume Builder",
      description:
        "Design job-ready resumes with a clean, customizable builder powered by smart suggestions.",
    },
    {
      icon: <PenLine className="w-10 h-10 mb-4 text-primary" />,
      title: "AI Cover Letter Generator",
      description:
        "Generate compelling, personalized cover letters based on job descriptions and your experience.",
    },
    {
      icon: <Briefcase className="w-10 h-10 mb-4 text-primary" />,
      title: "Mock Interview Prep",
      description:
        "Practice interviews with AI-generated questions and performance tracking over time.",
    },
   
    {
        icon: <BrainCircuit className="w-10 h-10 mb-4 text-primary" />,
        title: "AI Work Description Rewriter",
        description:
          "Transform bland job descriptions into powerful, results-driven statements with AI.",
    },
      
    {
      icon: <GaugeCircle className="w-10 h-10 mb-4 text-primary" />,
      title: "Performance Dashboard",
      description:
        "Track your progress, quiz scores, interview history, and resume score — all in one place.",
    },
  ];
  