"use client";

import { Models } from "appwrite";
import React from "react";
import VoteButtons from "./VoteButtons";
import { useAuthStore } from "@/store/Auth";
import { avatars } from "@/models/client/config";
import RTE, { MarkdownPreview } from "./RTE";
import Comments from "./Comments";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { IconTrash } from "@tabler/icons-react";

interface AnswersProps {
  answers: Models.DocumentList<Models.Document> | { total: number; documents: Models.Document[] };
  questionId: string;
}

const Answers = ({ answers: _answers, questionId }: AnswersProps) => {
  const [answers, setAnswers] = React.useState(_answers || { total: 0, documents: [] });
  const [newAnswer, setNewAnswer] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAnswer.trim() || !user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questionId,
          answer: newAnswer.trim(),
          authorId: user.$id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit answer");

      setNewAnswer("");
      setAnswers((prev) => ({
        total: (prev.total || 0) + 1,
        documents: [
          {
            ...data,
            author: user,
            upvotesDocuments: { documents: [], total: 0 },
            downvotesDocuments: { documents: [], total: 0 },
            comments: { documents: [], total: 0 },
          },
          ...(prev.documents || []),
        ],
      }));
    } catch (error: any) {
      window.alert(error?.message || "Error creating answer");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnswer = async (answerId: string) => {
    try {
      const response = await fetch("/api/answer", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId: answerId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete answer");

      setAnswers((prev) => ({
        total: Math.max(0, (prev.total || 0) - 1),
        documents: (prev.documents || []).filter((answer) => answer.$id !== answerId),
      }));
    } catch (error: any) {
      window.alert(error?.message || "Error deleting answer");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
        <span>💬 {answers.total || 0} Answers</span>
      </h2>

      {answers.documents && answers.documents.map((answer: any) => {
        const authorName = answer.author?.name || "Anonymous";
        const authorId = answer.authorId || answer.author?.$id || "";
        const reputation = answer.author?.prefs?.reputation ?? answer.author?.reputation ?? 0;
        const avatarUrl = String(avatars.getInitials(authorName, 36, 36));

        return (
          <div key={answer.$id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex gap-4">
              <div className="flex shrink-0 flex-col items-center gap-4">
                <VoteButtons
                  type="answer"
                  id={answer.$id}
                  upvotes={answer.upvotesDocuments || { total: 0, documents: [] }}
                  downvotes={answer.downvotesDocuments || { total: 0, documents: [] }}
                />
                {user?.$id === answer.authorId && (
                  <button
                    aria-label="Delete Answer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors"
                    onClick={() => deleteAnswer(answer.$id)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="w-full overflow-hidden space-y-4">
                <div className="prose prose-invert max-w-none text-slate-200">
                  <MarkdownPreview source={answer.content} />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <picture>
                    <img src={avatarUrl} alt={authorName} className="rounded-lg h-8 w-8" />
                  </picture>
                  <div className="text-xs">
                    <Link
                      href={authorId ? `/users/${authorId}/${slugify(authorName)}` : "#"}
                      className="font-medium text-cyan-400 hover:underline"
                    >
                      {authorName}
                    </Link>
                    <p className="text-slate-400">
                      Reputation: <strong className="text-slate-200">{reputation}</strong>
                    </p>
                  </div>
                </div>
                <Comments
                  comments={answer.comments || { total: 0, documents: [] }}
                  className="mt-4"
                  type="answer"
                  typeId={answer.$id}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="pt-6 border-t border-slate-800">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Your Answer</h3>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <RTE value={newAnswer} onChange={(value) => setNewAnswer(value || "")} />
            <button
              disabled={loading || !newAnswer.trim()}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition duration-200"
            >
              {loading ? "Posting Answer..." : "Post Your Answer"}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-sm text-slate-400">
            Please{" "}
            <Link href="/login" className="text-cyan-400 font-medium hover:underline">
              Sign In
            </Link>{" "}
            to submit an answer.
          </div>
        )}
      </div>
    </div>
  );
};

export default Answers;
