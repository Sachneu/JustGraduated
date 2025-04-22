"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

const CoverLetterPreview = ({ content }) => {
  return (
    <div className="py-4 preview-container">
      <div className="editor-wrapper">
        <ReactMarkdown className="custom-preview">{content}</ReactMarkdown>
      </div>
      <style jsx>{`
        .preview-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .editor-wrapper {
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 1rem;
        }

        .custom-preview {
          background: #ffffff;
          color: #000000;
          min-height: 700px;
        }

        @media (prefers-color-scheme: dark) {
          .custom-preview {
            background: #000000;
            color: #ffffff;
          }
          .editor-wrapper {
            border-color: #333333;
          }
        }
      `}</style>
    </div>
  );
};

export default CoverLetterPreview;