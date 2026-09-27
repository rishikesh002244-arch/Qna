import { databases, users } from "@/models/server/config";
import { answerCollection, db, questionCollection } from "@/models/name";
import QuestionCard from "@/components/QuestionCard";
import { avatars } from "@/models/client/config";
import { Query } from "node-appwrite";
import { notFound } from "next/navigation";
import React from "react";

export const revalidate = 0;

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await params;
  let userObj: any = null;
  let userQuestions: any = { total: 0, documents: [] };
  let userAnswers: any = { total: 0, documents: [] };

  try {
    const rawUser = await users.get(id);
    userObj = {
      $id: rawUser.$id,
      name: rawUser.name || "Developer",
      $createdAt: rawUser.$createdAt,
      prefs: { reputation: Number(rawUser.prefs?.reputation ?? 0) },
    };

    const [questionsRes, answersRes] = await Promise.all([
      databases.listDocuments(db, questionCollection, [
        Query.equal("authorId", id),
        Query.orderDesc("$createdAt"),
      ]),
      databases.listDocuments(db, answerCollection, [
        Query.equal("authorId", id),
        Query.orderDesc("$createdAt"),
      ]),
    ]);

    // Attach plain user object to each question
    const questionsWithAuthor = questionsRes.documents.map((q) => ({
      ...q,
      author: userObj,
    }));

    userQuestions = JSON.parse(JSON.stringify({ ...questionsRes, documents: questionsWithAuthor }));
    userAnswers = JSON.parse(JSON.stringify(answersRes));
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return notFound();
  }

  const userName = userObj.name || "Developer";
  const reputation = userObj.prefs?.reputation ?? 0;
  const avatarUrl = String(avatars.getInitials(userName, 80, 80));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Profile Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <picture>
          <img src={avatarUrl} alt={userName} className="h-20 w-20 rounded-2xl border-2 border-cyan-500/40 shadow-lg" />
        </picture>

        <div className="space-y-2 text-center md:text-left flex-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{userName}</h1>
          <p className="text-xs font-mono text-slate-400">User ID: {userObj.$id}</p>
          <p className="text-xs text-slate-400">Joined: {new Date(userObj.$createdAt).toLocaleDateString()}</p>
        </div>

        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-center">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 min-w-[90px]">
            <span className="text-2xl font-bold text-cyan-400 block">{reputation}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Reputation</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 min-w-[90px]">
            <span className="text-2xl font-bold text-slate-100 block">{userQuestions.total}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Questions</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 min-w-[90px]">
            <span className="text-2xl font-bold text-slate-100 block">{userAnswers.total}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Answers</span>
          </div>
        </div>
      </div>

      {/* User Questions Feed */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>❓ Questions Asked ({userQuestions.total})</span>
        </h2>

        {userQuestions.documents.length > 0 ? (
          <div className="space-y-4">
            {userQuestions.documents.map((ques: any) => (
              <QuestionCard key={ques.$id} ques={ques} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-sm text-slate-400">
            No questions asked yet.
          </div>
        )}
      </div>
    </div>
  );
}
