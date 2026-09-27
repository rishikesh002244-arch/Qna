import { getOrCreateDB } from "@/models/server/dbSetup";
import { databases, users } from "@/models/server/config";
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import QuestionCard from "@/components/QuestionCard";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { Query } from "node-appwrite";
import React from "react";
import { IconPlus, IconSparkles } from "@tabler/icons-react";

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; tag?: string }>;
}) {
  const { page = "1", search = "", tag = "" } = await searchParams;
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limit = 10;
  const offset = (pageNumber - 1) * limit;

  let questions: any = { total: 0, documents: [] };
  let dbError = "";

  try {
    // 1. Ensure DB & collections exist
    await getOrCreateDB();

    // 2. Build Appwrite Queries
    const queries: string[] = [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (tag) {
      queries.push(Query.equal("tags", tag));
    }
    if (search) {
      queries.push(Query.search("title", search));
    }

    // 3. Fetch questions
    const response = await databases.listDocuments(db, questionCollection, queries);

    // 4. Enrich questions with author data, votes count, and answers count
    const enrichedDocuments = await Promise.all(
      response.documents.map(async (ques) => {
        let author = { name: "Developer", $id: ques.authorId || "", reputation: 0 };
        try {
          if (ques.authorId) {
            const rawUser = await users.get(ques.authorId);
            author = {
              $id: rawUser.$id,
              name: rawUser.name || "Developer",
              reputation: Number(rawUser.prefs?.reputation ?? 0),
            };
          }
        } catch (_err) {}

        const [votesRes, answersRes] = await Promise.all([
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "question"),
            Query.equal("typeId", ques.$id),
          ]),
          databases.listDocuments(db, answerCollection, [
            Query.equal("questionId", ques.$id),
          ]),
        ]);

        const upvotes = votesRes.documents.filter((v) => v.voteStatus === "upvoted").length;
        const downvotes = votesRes.documents.filter((v) => v.voteStatus === "downvoted").length;

        return {
          ...ques,
          author,
          totalVotes: upvotes - downvotes,
          totalAnswers: answersRes.total,
        };
      })
    );

    questions = JSON.parse(JSON.stringify({ ...response, documents: enrichedDocuments }));
  } catch (_err: any) {
    console.error("Error loading questions feed:", _err);
    dbError = _err?.message || String(_err);
  }

  return (
    <div className="space-y-8">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-8 md:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
            <IconSparkles className="h-3.5 w-3.5" />
            <span>Community Driven Q&A Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Where Developers <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Ask & Learn</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Get instant answers to technical questions, share your programming expertise, and build community reputation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/questions/ask"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-indigo-600 transition duration-200"
            >
              <IconPlus className="h-4 w-4" />
              <span>Ask a Question</span>
            </Link>

            {tag && (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-mono text-cyan-300 border border-slate-700 hover:bg-slate-700 transition"
              >
                Clear Tag Filter (#{tag}) ✕
              </Link>
            )}
          </div>
        </div>
      </div>

      {dbError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
          ⚠️ Database warning: {dbError}
        </div>
      )}

      {/* Questions Feed Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {tag ? `Tag: #${tag}` : search ? `Search: "${search}"` : "All Questions"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {questions.documents.length} of {questions.total} questions
          </p>
        </div>

        <Link
          href="/questions/ask"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
        >
          Ask Question
        </Link>
      </div>

      {/* Questions List */}
      {questions.documents.length > 0 ? (
        <div className="space-y-4">
          {questions.documents.map((ques: any) => (
            <QuestionCard key={ques.$id} ques={ques} />
          ))}

          <React.Suspense fallback={null}>
            <Pagination total={questions.total} limit={limit} />
          </React.Suspense>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="text-4xl">🔍</div>
          <h3 className="text-xl font-bold text-slate-200">No questions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {tag || search
              ? "No questions match your filter criteria. Try searching for something else or clearing filters."
              : "Be the first developer to ask a question!"}
          </p>
          <Link
            href="/questions/ask"
            className="inline-block rounded-xl bg-cyan-600 px-5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
          >
            Ask the First Question
          </Link>
        </div>
      )}
    </div>
  );
}
