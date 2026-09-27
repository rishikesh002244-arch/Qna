import { databases, users } from "@/models/server/config";
import {
  answerCollection,
  commentCollection,
  db,
  questionAttachmentBucket,
  questionCollection,
  voteCollection,
} from "@/models/name";
import env from "@/app/env";
import VoteButtons from "@/components/VoteButtons";
import Comments from "@/components/Comments";
import Answers from "@/components/Answers";
import { MarkdownPreview } from "@/components/RTE";
import slugify from "@/utils/slugify";
import convertDateToRelativeTime from "@/utils/relativeTime";
import { Query } from "node-appwrite";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { IconEdit } from "@tabler/icons-react";

export const revalidate = 0;

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await params;

  let question: any = null;
  let author: any = { name: "User", $id: "", reputation: 0 };
  let questionUpvotes: any = { total: 0, documents: [] };
  let questionDownvotes: any = { total: 0, documents: [] };
  let questionComments: any = { total: 0, documents: [] };
  let answersList: any = { total: 0, documents: [] };
  let attachmentUrl: string | null = null;

  try {
    // 1. Fetch Question Document
    question = await databases.getDocument(db, questionCollection, id);

    // 2. Fetch Author Data (as plain JS object)
    try {
      if (question.authorId) {
        const rawAuthor = await users.get(question.authorId);
        author = {
          $id: rawAuthor.$id,
          name: rawAuthor.name || "User",
          reputation: Number(rawAuthor.prefs?.reputation ?? 0),
        };
      }
    } catch (_e) {
      author = { name: "User", $id: question.authorId || "", reputation: 0 };
    }

    // 3. Attachment image if present
    if (question.attachmentId && env.appwrite.endpoint) {
      attachmentUrl = `${env.appwrite.endpoint}/storage/buckets/${questionAttachmentBucket}/files/${question.attachmentId}/preview?project=${env.appwrite.projectId}`;
    }

    // 4. Fetch Question Votes & Comments in parallel
    const [upvotesRes, downvotesRes, commentsRes, answersRes] = await Promise.all([
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", "question"),
        Query.equal("typeId", id),
        Query.equal("voteStatus", "upvoted"),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", "question"),
        Query.equal("typeId", id),
        Query.equal("voteStatus", "downvoted"),
      ]),
      databases.listDocuments(db, commentCollection, [
        Query.equal("type", "question"),
        Query.equal("typeId", id),
        Query.orderDesc("$createdAt"),
      ]),
      databases.listDocuments(db, answerCollection, [
        Query.equal("questionId", id),
        Query.orderDesc("$createdAt"),
      ]),
    ]);

    questionUpvotes = JSON.parse(JSON.stringify(upvotesRes));
    questionDownvotes = JSON.parse(JSON.stringify(downvotesRes));

    // Attach plain author objects to comments
    const commentsWithAuthors = await Promise.all(
      commentsRes.documents.map(async (c) => {
        let commentAuthor = { name: "User", $id: c.authorId || "" };
        try {
          if (c.authorId) {
            const rawCA = await users.get(c.authorId);
            commentAuthor = { $id: rawCA.$id, name: rawCA.name || "User" };
          }
        } catch (_e) {}
        return { ...c, author: commentAuthor };
      })
    );
    questionComments = JSON.parse(JSON.stringify({ ...commentsRes, documents: commentsWithAuthors }));

    // Attach authors, votes, and comments to answers
    const answersWithDetails = await Promise.all(
      answersRes.documents.map(async (ans) => {
        let ansAuthor = { name: "User", $id: ans.authorId || "", reputation: 0 };
        try {
          if (ans.authorId) {
            const rawAA = await users.get(ans.authorId);
            ansAuthor = {
              $id: rawAA.$id,
              name: rawAA.name || "User",
              reputation: Number(rawAA.prefs?.reputation ?? 0),
            };
          }
        } catch (_e) {}

        const [ansUpvotes, ansDownvotes, ansComments] = await Promise.all([
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "answer"),
            Query.equal("typeId", ans.$id),
            Query.equal("voteStatus", "upvoted"),
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "answer"),
            Query.equal("typeId", ans.$id),
            Query.equal("voteStatus", "downvoted"),
          ]),
          databases.listDocuments(db, commentCollection, [
            Query.equal("type", "answer"),
            Query.equal("typeId", ans.$id),
            Query.orderDesc("$createdAt"),
          ]),
        ]);

        const ansCommentsWithAuthors = await Promise.all(
          ansComments.documents.map(async (ac) => {
            let acAuthor = { name: "User", $id: ac.authorId || "" };
            try {
              if (ac.authorId) {
                const rawACA = await users.get(ac.authorId);
                acAuthor = { $id: rawACA.$id, name: rawACA.name || "User" };
              }
            } catch (_e) {}
            return { ...ac, author: acAuthor };
          })
        );

        return {
          ...ans,
          author: ansAuthor,
          upvotesDocuments: ansUpvotes,
          downvotesDocuments: ansDownvotes,
          comments: { ...ansComments, documents: ansCommentsWithAuthors },
        };
      })
    );
    answersList = JSON.parse(JSON.stringify({ ...answersRes, documents: answersWithDetails }));
  } catch (error) {
    console.error("Error loading question detail page:", error);
    return notFound();
  }

  const authorName = author?.name || "Anonymous";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="border-b border-slate-800 pb-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            {question.title}
          </h1>
          <Link
            href={`/questions/${question.$id}/${slugify(question.title)}/edit`}
            className="flex items-center gap-1.5 shrink-0 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition duration-200"
          >
            <IconEdit className="h-4 w-4 text-cyan-400" />
            <span>Edit</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
          <span>Asked <strong className="text-slate-200">{convertDateToRelativeTime(new Date(question.$createdAt))}</strong></span>
          <span>•</span>
          <span>Answers <strong className="text-slate-200">{answersList.total}</strong></span>
          <span>•</span>
          <span>Author <Link href={`/users/${question.authorId}/${slugify(authorName)}`} className="text-cyan-400 hover:underline">{authorName}</Link></span>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex justify-center md:block">
          <VoteButtons
            type="question"
            id={question.$id}
            upvotes={questionUpvotes}
            downvotes={questionDownvotes}
          />
        </div>

        <div className="space-y-6 overflow-hidden">
          <div className="prose prose-invert max-w-none text-slate-200 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <MarkdownPreview source={question.content} />

            {attachmentUrl && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-400 mb-2 font-semibold">📎 Attached Image:</p>
                <picture>
                  <img
                    src={attachmentUrl}
                    alt="Question attachment"
                    className="max-h-96 w-auto rounded-xl border border-slate-800 object-contain"
                  />
                </picture>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {question.tags &&
              question.tags.map((t: string) => (
                <Link
                  key={t}
                  href={`/?tag=${encodeURIComponent(t)}`}
                  className="rounded-lg bg-cyan-950/80 px-3 py-1 font-mono text-xs text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900 transition duration-200"
                >
                  #{t}
                </Link>
              ))}
          </div>

          {/* Comments Section */}
          <Comments
            comments={questionComments}
            type="question"
            typeId={question.$id}
          />
        </div>
      </div>

      {/* Answers List & Post Form */}
      <div className="pt-8 border-t border-slate-800">
        <Answers answers={answersList} questionId={question.$id} />
      </div>
    </div>
  );
}
