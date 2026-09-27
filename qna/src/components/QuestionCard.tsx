"use client";

import React from "react";
import { BorderBeam } from "./magicui/border-beam";
import Link from "next/link";
import slugify from "@/utils/slugify";
import { avatars } from "@/models/client/config";
import convertDateToRelativeTime from "@/utils/relativeTime";

interface QuestionCardProps {
  ques: any;
}

const QuestionCard = ({ ques }: QuestionCardProps) => {
  const [height, setHeight] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [ref]);

  const authorName = ques.author?.name || "Anonymous";
  const authorId = ques.authorId || ques.author?.$id || "";
  const reputation = ques.author?.prefs?.reputation ?? ques.author?.reputation ?? 0;
  const avatarUrl = String(avatars.getInitials(authorName, 28, 28));

  return (
    <div
      ref={ref}
      className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm transition duration-300 hover:border-slate-700 hover:bg-slate-900 sm:flex-row sm:items-center"
    >
      <BorderBeam size={Math.max(120, height)} duration={12} delay={9} colorFrom="#38bdf8" colorTo="#a855f7" />
      
      <div className="relative shrink-0 flex sm:flex-col justify-between sm:justify-center gap-4 text-xs text-slate-400 sm:text-right border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0 sm:pr-6">
        <div>
          <span className="text-base font-bold text-slate-200 block">{ques.totalVotes || 0}</span>
          <span>votes</span>
        </div>
        <div>
          <span className="text-base font-bold text-cyan-400 block">{ques.totalAnswers || 0}</span>
          <span>answers</span>
        </div>
      </div>

      <div className="relative w-full space-y-3">
        <Link
          href={`/questions/${ques.$id}/${slugify(ques.title || "question")}`}
          className="group block"
        >
          <h2 className="text-lg font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2">
            {ques.title}
          </h2>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {ques.tags &&
              ques.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="rounded-md bg-slate-800/80 px-2.5 py-1 font-mono text-cyan-300 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
          </div>

          <div className="flex items-center gap-3 text-slate-400 ml-auto">
            <div className="flex items-center gap-1.5">
              <picture>
                <img src={avatarUrl} alt={authorName} className="rounded-full h-5 w-5" />
              </picture>
              <Link
                href={authorId ? `/users/${authorId}/${slugify(authorName)}` : "#"}
                className="text-slate-200 font-medium hover:text-cyan-400 transition-colors"
              >
                {authorName}
              </Link>
              <span className="text-slate-500 font-mono">({reputation})</span>
            </div>
            <span>•</span>
            <span>asked {convertDateToRelativeTime(new Date(ques.$createdAt))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
