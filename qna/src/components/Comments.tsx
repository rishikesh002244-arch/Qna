"use client";

import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import { IconTrash } from "@tabler/icons-react";
import { ID, Models } from "appwrite";
import Link from "next/link";
import React from "react";

interface CommentsProps {
  comments: Models.DocumentList<Models.Document> | { total: number; documents: Models.Document[] };
  type: "question" | "answer";
  typeId: string;
  className?: string;
}

const Comments = ({
  comments: _comments,
  type,
  typeId,
  className,
}: CommentsProps) => {
  const [comments, setComments] = React.useState(_comments || { total: 0, documents: [] });
  const [newComment, setNewComment] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const response = await databases.createDocument(db, commentCollection, ID.unique(), {
        content: newComment.trim(),
        authorId: user.$id,
        type: type,
        typeId: typeId,
      });

      setNewComment("");
      setComments((prev) => ({
        total: (prev.total || 0) + 1,
        documents: [{ ...response, author: user }, ...(prev.documents || [])],
      }));
    } catch (error: any) {
      window.alert(error?.message || "Error creating comment");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await databases.deleteDocument(db, commentCollection, commentId);

      setComments((prev) => ({
        total: Math.max(0, (prev.total || 0) - 1),
        documents: (prev.documents || []).filter((comment) => comment.$id !== commentId),
      }));
    } catch (error: any) {
      window.alert(error?.message || "Error deleting comment");
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 border-t border-slate-800 pt-3 text-sm text-slate-300", className)}>
      {comments.documents && comments.documents.length > 0 ? (
        comments.documents.map((comment: any) => {
          const authorName = comment.author?.name || "User";
          const authorId = comment.authorId || comment.author?.$id || "";
          return (
            <div key={comment.$id} className="flex items-start justify-between gap-2 py-1 border-b border-slate-800/60 last:border-b-0">
              <p className="leading-relaxed">
                <span className="text-slate-200">{comment.content}</span>{" "}
                <span className="text-slate-500">—</span>{" "}
                <Link
                  href={authorId ? `/users/${authorId}/${slugify(authorName)}` : "#"}
                  className="text-cyan-400 font-medium hover:underline"
                >
                  {authorName}
                </Link>{" "}
                <span className="text-xs text-slate-500">
                  {convertDateToRelativeTime(new Date(comment.$createdAt))}
                </span>
              </p>
              {user?.$id === comment.authorId && (
                <button
                  aria-label="Delete comment"
                  onClick={() => deleteComment(comment.$id)}
                  className="shrink-0 text-rose-400 hover:text-rose-300 transition-colors p-1"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })
      ) : null}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
        <input
          type="text"
          className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500 transition-colors"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default Comments;
