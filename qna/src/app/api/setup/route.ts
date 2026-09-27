import { NextResponse } from "next/server";
import { getOrCreateDB } from "@/models/server/dbSetup";
import { databases } from "@/models/server/config";
import { db } from "@/models/name";

export async function GET() {
    try {
        await getOrCreateDB();
        const dbInfo = await databases.get(db);
        const collections = await databases.listCollections(db);
        return NextResponse.json({
            success: true,
            message: "Appwrite connection successful and database initialized!",
            database: dbInfo,
            collectionsCount: collections.total,
            collections: collections.collections.map((c) => ({
                id: c.$id,
                name: c.name,
            })),
        });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            {
                success: false,
                error: err?.message || "Failed to initialize Appwrite Database",
            },
            { status: 500 }
        );
    }
}
