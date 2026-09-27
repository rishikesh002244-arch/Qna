import { Permission, Role } from "node-appwrite";
import { db, commentCollection } from "../name";
import { databases } from "./config";

export async function createCommentCollection() {
    try {
        await databases.createCollection(db, commentCollection, commentCollection, [
            Permission.read(Role.any()),
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]);
        console.log("Comment Collection Created");
    } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err?.code !== 409) {
            console.log("Comment collection notice:", err?.message || error);
        }
    }

    try {
        await Promise.all([
            databases.createStringAttribute(db, commentCollection, "content", 1000, true),
            databases.createEnumAttribute(db, commentCollection, "type", ["question", "answer"], true),
            databases.createStringAttribute(db, commentCollection, "typeId", 50, true),
            databases.createStringAttribute(db, commentCollection, "authorId", 50, true),
        ]);
        console.log("Comment Collection Attributes Created");
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.log("Comment collection attributes existing or setup:", err?.message || error);
    }
}
