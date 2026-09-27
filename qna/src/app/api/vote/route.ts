import { databases } from "@/models/client/config";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { Query, ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const votedById = body.votedById || body.voteById;
    const { voteStatus, type, typeId } = body;

    if (!votedById || !voteStatus || !type || !typeId) {
      return NextResponse.json(
        { error: "Missing required vote parameters" },
        { status: 400 }
      );
    }

    // 1. Find existing vote by this user on this item
    const existingVotes = await databases.listDocuments(db, voteCollection, [
      Query.equal("type", type),
      Query.equal("typeId", typeId),
      Query.equal("votedById", votedById),
    ]);

    let targetDoc: any = null;
    let voteDoc: any = null;

    // Get Target (Question or Answer) author
    try {
      targetDoc = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );
    } catch (err) {
      console.warn("Could not find target document for vote:", err);
    }

    if (existingVotes.documents.length > 0) {
      const prevVote = existingVotes.documents[0];
      
      if (prevVote.voteStatus === voteStatus) {
        // User clicked same vote button again -> remove vote
        await databases.deleteDocument(db, voteCollection, prevVote.$id);
        voteDoc = null;

        if (targetDoc?.authorId) {
          try {
            const authorPrefs = await users.getPrefs<UserPrefs>(targetDoc.authorId);
            const currentRep = Number(authorPrefs?.reputation ?? 0);
            const delta = prevVote.voteStatus === "upvoted" ? -1 : 1;
            await users.updatePrefs(targetDoc.authorId, {
              reputation: Math.max(0, currentRep + delta),
            });
          } catch (e) {
            console.warn("Could not update reputation:", e);
          }
        }
      } else {
        // User changed vote from upvoted to downvoted or vice versa -> update vote
        voteDoc = await databases.updateDocument(db, voteCollection, prevVote.$id, {
          voteStatus,
        });

        if (targetDoc?.authorId) {
          try {
            const authorPrefs = await users.getPrefs<UserPrefs>(targetDoc.authorId);
            const currentRep = Number(authorPrefs?.reputation ?? 0);
            // Changing upvoted -> downvoted is -2 rep, downvoted -> upvoted is +2 rep
            const delta = voteStatus === "upvoted" ? 2 : -2;
            await users.updatePrefs(targetDoc.authorId, {
              reputation: Math.max(0, currentRep + delta),
            });
          } catch (e) {
            console.warn("Could not update reputation:", e);
          }
        }
      }
    } else {
      // First time voting -> create new vote document
      voteDoc = await databases.createDocument(db, voteCollection, ID.unique(), {
        type,
        typeId,
        votedById,
        voteStatus,
      });

      if (targetDoc?.authorId) {
        try {
          const authorPrefs = await users.getPrefs<UserPrefs>(targetDoc.authorId);
          const currentRep = Number(authorPrefs?.reputation ?? 0);
          const delta = voteStatus === "upvoted" ? 1 : -1;
          await users.updatePrefs(targetDoc.authorId, {
            reputation: Math.max(0, currentRep + delta),
          });
        } catch (e) {
          console.warn("Could not update reputation:", e);
        }
      }
    }

    // Calculate updated upvotes & downvotes
    const [upvotes, downvotes] = await Promise.all([
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "upvoted"),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "downvoted"),
      ]),
    ]);

    return NextResponse.json(
      {
        data: {
          document: voteDoc,
          voteResult: upvotes.total - downvotes.total,
        },
        message: "Vote processed successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "An error occurred while processing vote.",
      },
      { status: error?.status || error?.code || 500 }
    );
  }
}
