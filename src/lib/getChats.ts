import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { and, eq, gte } from "drizzle-orm";

export const getChats = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

  const userChats = await db
    .select()
    .from(chats)
    .where(
      and(eq(chats.userId, userId), gte(chats.createdAt, today)) // Compare date objects directly
    );

  return userChats.length;
};
