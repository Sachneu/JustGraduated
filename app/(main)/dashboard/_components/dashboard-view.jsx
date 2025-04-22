"use client";

import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardView = ({ insights }) => {
  const [selectedRole, setSelectedRole] = useState("");

  // Handle role selection from dropdown
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Get salary details for the selected role
  const selectedSalary = insights?.salaryRanges.find(
    (range) => range.role === selectedRole
  );

  // Map skills/trends to documentation URLs
  const getDocUrl = (item) => {
    const docUrls = {
      Python: "https://docs.python.org/3/",
      JavaScript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      AWS: "https://docs.aws.amazon.com/",
      Java: "https://docs.oracle.com/en/java/",
      "Cloud Computing": "https://cloud.google.com/docs",
      Docker: "https://docs.docker.com/",
      Kubernetes: "https://kubernetes.io/docs/",
      "AI/ML": "https://developers.google.com/machine-learning",
      Cybersecurity: "https://owasp.org/www-project-top-ten/",
      DevOps: "https://docs.microsoft.com/en-us/devops/",
      "Remote Work": "https://www.atlassian.com/remote-work-guide",
    };
    return (
      docUrls[item] ||
      "https://www.google.com/search?q=" +
        encodeURIComponent(item + " documentation")
    );
  };

  // Dynamic background colors based on data
  const getMarketOutlookColor = (outlook) => {
    switch (outlook) {
      case "POSITIVE":
        return "bg-green-100 dark:bg-green-700";
      case "NEUTRAL":
        return "bg-yellow-100 dark:bg-yellow-900";
      case "NEGATIVE":
        return "bg-red-100 dark:bg-red-900";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const getDemandLevelColor = (level) => {
    switch (level) {
      case "HIGH":
        return "bg-green-200 dark:bg-green-800";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-900";
      case "LOW":
        return "bg-red-100 dark:bg-red-900";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const getGrowthRateColor = (rate) => {
    if (rate > 5) return "bg-green-300 dark:bg-green-900";
    if (rate >= 0) return "bg-yellow-100 dark:bg-yellow-900";
    return "bg-red-100 dark:bg-red-900";
  };

  // Prepare data for Recharts
  const chartData = selectedSalary
    ? [
        { name: "Min", salary: selectedSalary.min },
        { name: "Max", salary: selectedSalary.max },
        { name: "Median", salary: selectedSalary.median },
      ]
    : [];

  if (!insights) {
    return (
      <div className="p-6 text-center text-gray-800 dark:text-gray-200">
        No insights available
      </div>
    );
  }

  // Date formatting with date-fns
  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true }
  );

  return (
    <div className="p-4 my-14 max-w-6xl mx-auto">
      {/* Top Metrics with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Market Outlook */}
        <div
          className={`${getMarketOutlookColor(
            insights.marketOutlook
          )} p-10 rounded-lg shadow-xl hover:shadow-2xl flex items-center transition-shadow`}
        >
          <svg
            className="w-8 h-8 text-gray-700 dark:text-gray-300 mr-3 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Market Outlook
            </h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {insights.marketOutlook}
            </p>
          </div>
        </div>

        {/* Demand Level */}
        <div
          className={`${getDemandLevelColor(
            insights.demandLevel
          )} p-10 rounded-lg shadow-xl hover:shadow-2xl flex items-center transition-shadow`}
        >
          <svg
            className="w-8 h-8 text-gray-700 dark:text-gray-300 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Demand Level
            </h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {insights.demandLevel}
            </p>
          </div>
        </div>

        {/* Growth Rate with Update Info */}
        <div
          className={`${getGrowthRateColor(
            insights.growthRate
          )} p-10 rounded-lg shadow-xl hover:shadow-2xl flex items-center transition-shadow`}
        >
          <svg
            className="w-8 h-8 text-gray-700 dark:text-gray-300 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Growth Rate
            </h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {insights.growthRate}%
            </p>
          </div>
        </div>
      </div>
      <Badge
        variant="outline"
        className="text-xs text-gray-600 dark:text-gray-400"
      >
        Last updated: {lastUpdatedDate}
      </Badge>
      <Badge
        variant="outline"
        className="text-xs text-gray-600 dark:text-gray-400"
      >
        Next Update: {nextUpdateDistance}
      </Badge>

      {/* Salary Ranges Dropdown (Centered) */}
      <div className="mb-8 flex flex-col mt-20">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Salary Ranges by Role
        </h2>
        <select
          value={selectedRole}
          onChange={handleRoleChange}
          className="w-full md:w-1/3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <option value="">Select a Role</option>
          {insights.salaryRanges.map((range) => (
            <option key={range.role} value={range.role}>
              {range.role} ({range.location})
            </option>
          ))}
        </select>

        {selectedSalary && (
          <div className="mt-4 w-full md:w-1/3">
            <div></div>
            {/* Recharts Bar Chart */}
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 30, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 0, 0, 0.1)"
                  />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    stroke="#888"
                  />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                    }}
                  />
                  <Bar dataKey="salary" fill="#36A2EB" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Skills and Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Skills (AI-Generated) */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Top Skills
          </h2>
          <ul className="space-y-2">
            {insights.topSkills.map((skill) => (
              <li key={skill}>
                <Badge variant="secondary">
                  <a
                    href={getDocUrl(skill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 dark:text-gray-200  cursor-pointer"
                  >
                    {skill}
                  </a>
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Skills */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Recommended Skills
          </h2>
          <ul className="space-y-2">
            {insights.recommendedSkills.map((skill) => (
              <li key={skill}>
                <Badge variant="secondary">
                  <a
                    href={getDocUrl(skill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 dark:text-gray-200 hover:underline cursor-pointer"
                  >
                    {skill}
                  </a>
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Trends */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Key Industry Trends
          </h2>
          <ul className="space-y-2">
            {insights.keyTrends.map((trend) => (
              <li key={trend}>
                <a
                  href={getDocUrl(trend)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-gray-100 hover:underline cursor-pointer"
                >
                  {trend}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
