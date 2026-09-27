import { Permission, Role } from "node-appwrite";
import { db, questionCollection } from "../name";
import { databases } from "./config";

export async function createQuestionCollection() {
    try {
        await databases.createCollection(db, questionCollection, questionCollection, [
            Permission.read(Role.any()),
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]);
        console.log("Question Collection Created");
    } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err?.code !== 409) {
            console.log("Question collection notice:", err?.message || error);
        }
    }

    try {
        await Promise.all([
            databases.createStringAttribute(db, questionCollection, "title", 100, true),
            databases.createStringAttribute(db, questionCollection, "content", 10000, true),
            databases.createStringAttribute(db, questionCollection, "authorId", 50, true),
            databases.createStringAttribute(db, questionCollection, "tags", 50, true, undefined, true),
            databases.createStringAttribute(db, questionCollection, "attachmentId", 50, false),
        ]);
        console.log("Question Collection Attributes Created");
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.log("Question collection attributes existing or setup:", err?.message || error);
    }
}