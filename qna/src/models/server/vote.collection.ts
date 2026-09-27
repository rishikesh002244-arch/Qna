import { Permission, Role } from "node-appwrite";
import { db, voteCollection } from "../name";
import { databases } from "./config";

export async function createVoteCollection() {
    try {
        await databases.createCollection(db, voteCollection, voteCollection, [
            Permission.read(Role.any()),
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]);
        console.log("Vote Collection Created");
    } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err?.code !== 409) {
            console.log("Vote collection notice:", err?.message || error);
        }
    }

    try {
        await Promise.all([
            databases.createEnumAttribute(db, voteCollection, "type", ["question", "answer"], true),
            databases.createStringAttribute(db, voteCollection, "typeId", 50, true),
            databases.createEnumAttribute(db, voteCollection, "voteStatus", ["upvoted", "downvoted"], true),
            databases.createStringAttribute(db, voteCollection, "votedById", 50, true),
        ]);
        console.log("Vote Collection Attributes Created");
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.log("Vote collection attributes existing or setup:", err?.message || error);
    }
}
