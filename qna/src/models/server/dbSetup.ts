import { db } from "../name";
import { createAnswerCollection } from "./answer.collection";
import { createCommentCollection } from "./comment.collection";
import { createQuestionCollection } from "./question.collection";
import { createVoteCollection } from "./vote.collection";
import { getOrCreateStorage } from "./storageSetup";
import { databases } from "./config";

export async function getOrCreateDB() {
    try {
        await databases.get(db);
        console.log("Database Connected");
    } catch {
        try {
            await databases.create(db, db);
            console.log("Database Created");
        } catch (createErr: unknown) {
            const err = createErr as { message?: string };
            console.log("Error creating database:", err?.message || createErr);
        }
    }

    try {
        await Promise.all([
            createQuestionCollection(),
            createAnswerCollection(),
            createCommentCollection(),
            createVoteCollection(),
            getOrCreateStorage(),
        ]);
        console.log("Database & Collections setup complete.");
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.log("Error setting up collections/storage:", error?.message || err);
    }

    return databases;
}
