"use client";

import { databases } from "@/models/client/config";
import { db, voteCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { Models, Query } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";

interface VoteButtonsProps {
  type: "question" | "answer";
  id: string;
  upvotes: Models.DocumentList<Models.Document> | { total: number; documents: Models.Document[] };
  downvotes: Models.DocumentList<Models.Document> | { total: number; documents: Models.Document[] };
  className?: string;
}

const VoteButtons = ({
  type,
  id,
  upvotes,
  downvotes,
  className,
}: VoteButtonsProps) => {
  const [votedDocument, setVotedDocument] = React.useState<any>(undefined);
  const [voteResult, setVoteResult] = React.useState<number>((upvotes?.total || 0) - (downvotes?.total || 0));

  const { user } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      if (user) {
        try {
          const response = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", id),
            Query.equal("votedById", user.$id),
          ]);
          setVotedDocument(response.documents[0] || null);
        } catch (error) {
          console.error("Error fetching vote status:", error);
          setVotedDocument(null);
        }
      } else {
        setVotedDocument(null);
      }
    })();
  }, [user, id, type]);

  const handleVote = async (status: "upvoted" | "downvoted") => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          votedById: user.$id,
          voteStatus: status,
          type,
          typeId: id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit vote");

      setVoteResult(data.data.voteResult);
      setVotedDocument(data.data.document);
    } catch (error: any) {
      window.alert(error?.message || "Something went wrong voting");
    }
  };

  return (
    <div className={cn("flex shrink-0 flex-col items-center justify-start gap-y-2", className)}>
      <button
        aria-label="Upvote"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition duration-200 hover:bg-slate-800",
          votedDocument && votedDocument.voteStatus === "upvoted"
            ? "border-orange-500 bg-orange-500/20 text-orange-400"
            : "border-slate-700 text-slate-400"
        )}
        onClick={() => handleVote("upvoted")}
      >
        <IconCaretUpFilled className="h-5 w-5" />
      </button>

      <span className="font-semibold text-slate-200 text-sm">{voteResult}</span>

      <button
        aria-label="Downvote"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition duration-200 hover:bg-slate-800",
          votedDocument && votedDocument.voteStatus === "downvoted"
            ? "border-orange-500 bg-orange-500/20 text-orange-400"
            : "border-slate-700 text-slate-400"
        )}
        onClick={() => handleVote("downvoted")}
      >
        <IconCaretDownFilled className="h-5 w-5" />
      </button>
    </div>
  );
};

export default VoteButtons;
