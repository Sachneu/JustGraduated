"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { improveWithAI, saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  // Watch form fields for preview updates
  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(` ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(` ${contactInfo.mobile}`);
    if (contactInfo.linkedin) parts.push(`${contactInfo.linkedin}`);
    //if (contactInfo.twitter) parts.push(` [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}\n\n`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n\n\n\n\n");
  };

  const [isGenerating, setIsGenerating] = useState(false);

  /*const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      doc.setFont("helvetica");
  
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const maxContentHeight = pageHeight - margin * 2;
  
      const lines = previewContent.split("\n");
      let yPosition = margin;
      let inContactSection = false;
  
      // First Pass: Calculate total height
      let totalHeight = 0;
      lines.forEach((line) => {
        const cleanLine = line.replace(/<[^>]+>/g, "").trim();
        if (cleanLine.startsWith("## ") && cleanLine.includes(user.fullName)) {
          totalHeight += 6;
        } else if (inContactSection && cleanLine.includes("📧")) {
          totalHeight += 4;
        } else if (cleanLine.startsWith("## ")) {
          totalHeight += 5;
        } else if (cleanLine.startsWith("### ")) {
          totalHeight += 4;
        } else if (cleanLine.startsWith("- ")) {
          totalHeight += 3;
        } else if (cleanLine.startsWith("**")) {
          totalHeight += 3;
        } else if (cleanLine.trim()) {
          const splitText = doc.splitTextToSize(cleanLine, pageWidth - margin * 2);
          totalHeight += splitText.length * 3;
        } else {
          totalHeight += 2;
        }
      });
  
      // Calculate scaling factor
      let scaleFactor = 1;
      if (totalHeight > maxContentHeight) {
        scaleFactor = maxContentHeight / totalHeight;
      }
  
      // Second Pass: Render content
      inContactSection = false;
      yPosition = margin;
  
      lines.forEach((line) => {
        const cleanLine = line.replace(/<[^>]+>/g, "").trim();
  
       if (cleanLine.startsWith("## ") && cleanLine.includes(user.fullName)) {
          doc.setFontSize(Math.max(6, 20 * scaleFactor));
          doc.setFont("helvetica", "bold");
          const name = cleanLine.replace("## ", "");
           const textWidth = doc.getTextWidth(name);
          doc.text(name, (pageWidth - textWidth) / 2, yPosition);
          yPosition += 6 * scaleFactor;
          inContactSection = true;
        } else if (inContactSection) {
          doc.setFontSize(Math.max(6, 12 * scaleFactor));
          doc.setFont("helvetica", "normal");
          const textWidth = doc.getTextWidth(cleanLine);
          doc.text(cleanLine, (pageWidth - textWidth) / 2, yPosition);
          yPosition += 6 * scaleFactor;
          inContactSection = false;
        } else if (cleanLine.startsWith("## ")) {
          doc.setFontSize(Math.max(6, 18 * scaleFactor));
          doc.setFont("helvetica", "bold");
          doc.text(cleanLine.replace("## ", ""), margin, yPosition);
          yPosition += 7 * scaleFactor;
        } else if (cleanLine.startsWith("### ")) {
          doc.setFontSize(Math.max(8, 15 * scaleFactor));
          doc.setFont("helvetica", "bold");
          doc.text(cleanLine.replace("### ", ""), margin, yPosition);
          yPosition += 4 * scaleFactor;
        } else if (cleanLine.trim()) {
          doc.setFontSize(Math.max(6, 15 * scaleFactor));
          doc.setFont("helvetica", "normal");
          const splitText = doc.splitTextToSize(cleanLine, pageWidth - margin * 2);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 3 * scaleFactor;
        } else {
          yPosition += 2 * scaleFactor;
        }
      });
  
      // Generate the PDF as a Blob
      const pdfBlob = doc.output("blob");
  
      // Create a URL for the Blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
  
      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  }; */

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      doc.setFont("helvetica");
  
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const maxContentHeight = pageHeight - margin * 2;
  
      const lines = previewContent.split("\n");
      let yPosition = margin;
      let inContactSection = false;
  
      lines.forEach((line) => {
        const cleanLine = line.replace(/<[^>]+>/g, "").trim();
  
        // Page break handling
        if (yPosition > maxContentHeight) {
          doc.addPage();
          yPosition = margin;
        }
  
        if (cleanLine.startsWith("## ") && cleanLine.includes(user.fullName)) {
          doc.setFontSize(20);
          doc.setFont("helvetica", "bold");
          const name = cleanLine.replace("## ", "");
          const textWidth = doc.getTextWidth(name);
          doc.text(name, (pageWidth - textWidth) / 2, yPosition);
          yPosition += 10;
          inContactSection = true;
        } else if (inContactSection) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          const textWidth = doc.getTextWidth(cleanLine);
          doc.text(cleanLine, (pageWidth - textWidth) / 2, yPosition);
          yPosition += 8;
        } else if (cleanLine.startsWith("## ")) {
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text(cleanLine.replace("## ", ""), margin, yPosition);
          yPosition += 8;
        } else if (cleanLine.startsWith("### ")) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(cleanLine.replace("### ", ""), margin, yPosition);
          yPosition += 6;
        } else if (cleanLine.startsWith("- ") || cleanLine.startsWith("**")) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.text(cleanLine, margin, yPosition);
          yPosition += 5;
        } else if (cleanLine.trim()) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          const splitText = doc.splitTextToSize(cleanLine, pageWidth - margin * 2);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5;
        } else {
          yPosition += 3;
        }
      });
  
      // Generate the PDF
      doc.save("resume.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  




  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n") // Normalize newlines
        .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
        .trim();

      console.log(previewContent, formattedContent);
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("summary", improvedContent);
      toast.success("Summary improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve summary");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  const handleImproveSummary = async (fieldName) => {
    const currentValue = watch(fieldName);
    if (!currentValue) {
      toast.error("Please enter a summary first");
      return;
    }
    console.log("Improving field:", fieldName, currentValue);
    try {
      await improveWithAIFn({ current: currentValue, type: fieldName });
    } catch (err) {
      console.error("Error in handleImproveSummary", err);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="text- font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                    error={errors.summary}
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}

              {/* Improve with AI Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleImproveSummary("summary")}
                disabled={isImproving || !watch("summary")}
              >
                {isImproving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Improve with AI
                  </>
                )}
              </Button>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose editied markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg ">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
          <div className="border p-4">
            <div id="resume-pdf">
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: "white",
                  color: "black",
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
