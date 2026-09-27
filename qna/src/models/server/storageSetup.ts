import { Permission, Role } from "node-appwrite";
import { questionAttachmentBucket } from "../name";
import { storage } from "./config";

export async function getOrCreateStorage() {
    try {
        await storage.getBucket(questionAttachmentBucket);
        console.log("Storage Bucket Connected");
    } catch {
        try {
            await storage.createBucket(
                questionAttachmentBucket,
                questionAttachmentBucket,
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ],
                false,
                undefined,
                undefined,
                ["jpg", "png", "gif", "jpeg", "webp", "heic"]
            );
            console.log("Storage Bucket Created");
        } catch (createErr: unknown) {
            const err = createErr as { message?: string };
            console.log("Storage bucket creation notice:", err?.message || createErr);
        }
    }
}
