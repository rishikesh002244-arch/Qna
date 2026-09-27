import { databases } from "@/models/server/config";
import { db, questionCollection } from "@/models/name";
import QuestionForm from "@/components/QuestionForm";
import { notFound } from "next/navigation";
import React from "react";

export const revalidate = 0;

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await params;
  let question: any = null;

  try {
    const rawQuestion = await databases.getDocument(db, questionCollection, id);
    question = JSON.parse(JSON.stringify(rawQuestion));
  } catch (error) {
    console.error("Error fetching question for edit:", error);
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>✏️ Edit Question</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Revise your question details or add extra context.
        </p>
      </div>

      <QuestionForm question={question} />
    </div>
  );
}
