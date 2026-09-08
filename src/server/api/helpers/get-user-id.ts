import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserIdByClerkId(clerkId: string): Promise<number> {
    const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .then((rows) => rows[0]);

    if (user) return user.id;

    // No row yet — the Clerk `user.created` webhook can't reach localhost during
    // development, so backfill the account from Clerk on first API call.
    let primaryEmail = "";
    let firstName: string | null = null;
    let lastName: string | null = null;
    let imageUrl: string | null = null;

    try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkId);
        primaryEmail = clerkUser.primaryEmailAddress?.emailAddress ?? "";
        firstName = clerkUser.firstName ?? null;
        lastName = clerkUser.lastName ?? null;
        imageUrl = clerkUser.imageUrl ?? null;
    } catch {
        // Last resort: never let a missing email block the insert.
    }

    await db
        .insert(users)
        .values({
            clerkId,
            email: primaryEmail || `${clerkId}@placeholder.invalid`,
            firstName,
            lastName,
            profileImageUrl: imageUrl,
        })
        .onConflictDoNothing({ target: users.clerkId });

    const created = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .then((rows) => rows[0]);

    if (!created) throw new Error("User not found");
    return created.id;
}