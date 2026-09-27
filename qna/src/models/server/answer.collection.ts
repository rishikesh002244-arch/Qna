import { Permission, Role } from "node-appwrite";
import { db, answerCollection } from "../name";
import { databases } from "./config";

export async function createAnswerCollection() {
    try {
        await databases.createCollection(db, answerCollection, answerCollection, [
            Permission.read(Role.any()),
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]);
        console.log("Answer Collection Created");
    } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err?.code !== 409) {
            console.log("Answer collection notice:", err?.message || error);
        }
    }

    try {
        await Promise.all([
            databases.createStringAttribute(db, answerCollection, "content", 10000, true),
            databases.createStringAttribute(db, answerCollection, "questionId", 50, true),
            databases.createStringAttribute(db, answerCollection, "authorId", 50, true),
        ]);
        console.log("Answer Collection Attributes Created");
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.log("Answer collection attributes existing or setup:", err?.message || error);
    }
}
