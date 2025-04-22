"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { refineWorkDescription } from "@/actions/refinewd";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RefineWorkDescriptionPage() {
  const [result, setResult] = useState(null);
  const [isImproving, setIsImproving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: "",
      position: "",
      jobDescription: "",
    },
  });

  const handleImproveDescription = async (data) => {
    setIsImproving(true);
    const formData = new FormData();
    formData.append("companyName", data.companyName);
    formData.append("position", data.position);
    formData.append("jobDescription", data.jobDescription);

    try {
      const response = await refineWorkDescription(formData);
      setResult(response);
    } catch (error) {
      setResult({ error: "An unexpected error occurred." });
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Refine Work Description</h1>
      <form onSubmit={handleSubmit(handleImproveDescription)} className="space-y-4">
        <div>
          <label htmlFor="companyName" className="block font-medium mb-5">
            Company Name
          </label>
          <input
            id="companyName"
            {...register("companyName", { required: "Company name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm">{errors.companyName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="position" className="block font-medium mb-5">
            Position
          </label>
          <input
            id="position"
            {...register("position", { required: "Position is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.position && (
            <p className="text-red-500 text-sm">{errors.position.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="jobDescription" className="block font-medium mb-5">
            Work Description 
          </label>
          <textarea
            id="jobDescription"
            {...register("jobDescription", { required: "Job description is required" })}
            className="w-full p-2 border rounded"
            rows="6"
            placeholder="Write the job description here in simple words..."
          />
          {errors.jobDescription && (
            <p className="text-red-500 text-sm">{errors.jobDescription.message}</p>
          )}
        </div>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={isImproving || !watch("jobDescription")}
          className="p-5 cursor-pointer"
          
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
      </form>

      {result && (
        <div className="mt-6">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Refined Descriptions</h2>
              <Card>
              <ul className="list-disc pl-5">
                {result.descriptions.map((desc, index) => (
                  <li key={index} className="mb-2">
                    {desc}
                  </li>
                ))}
              </ul>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}