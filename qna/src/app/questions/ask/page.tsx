import React from "react";
import QuestionForm from "@/components/QuestionForm";

export const metadata = {
  title: "Ask a Question - QnA Hub",
  description: "Ask a public programming question to get answers from the developer community.",
};

export default function AskQuestionPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>🚀 Ask a Public Question</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Get help from developers worldwide. Be specific and include relevant code snippets.
        </p>
      </div>

      <QuestionForm />
    </div>
  );
}
