import { NextRequest, NextResponse } from "next/server";
import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { ID } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";

export async function POST(request: NextRequest) {
  try {
    const { questionId, answer, authorId } = await request.json();

    if (!questionId || !answer || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields: questionId, answer, authorId" },
        { status: 400 }
      );
    }

    const response = await databases.createDocument(
      db,
      answerCollection,
      ID.unique(),
      { content: answer, questionId: questionId, authorId: authorId }
    );

    try {
      const prefs = await users.getPrefs<UserPrefs>(authorId);
      const currentRep = Number(prefs?.reputation ?? 0);
      await users.updatePrefs(authorId, {
        reputation: currentRep + 1,
      });
    } catch (prefError) {
      console.warn("Could not update user reputation:", prefError);
    }

    return NextResponse.json(response, {
      status: 201,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "An error occurred while processing the request.",
      },
      { status: error?.status || error?.code || 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { answerId } = await request.json();
    if (!answerId) {
      return NextResponse.json({ error: "Missing answerId" }, { status: 400 });
    }

    const answer = await databases.getDocument(db, answerCollection, answerId);
    const response = await databases.deleteDocument(
      db,
      answerCollection,
      answerId
    );

    if (answer?.authorId) {
      try {
        const prefs = await users.getPrefs<UserPrefs>(answer.authorId);
        const currentRep = Number(prefs?.reputation ?? 0);
        await users.updatePrefs(answer.authorId, {
          reputation: Math.max(0, currentRep - 1),
        });
      } catch (prefError) {
        console.warn("Could not update user reputation:", prefError);
      }
    }

    return NextResponse.json(
      { data: response, message: "Answer deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "An error occurred while processing the request.",
      },
      { status: error?.status || error?.code || 500 }
    );
  }
}
