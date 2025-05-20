import { db } from "@/db";
import { Users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUser = async (userId: string) => {
    try {
        if (!userId) {
        return {
            success: false,
            message: "User ID is required",
        };
        }
    
        const user = await db
        .select()
        .from(Users)
        .where(eq(Users.clerk_user_id, userId))
        .get();
    
        if (!user) {
        return {
            success: false,
            message: "User not found",
        };
        }
    
        return {
        success: true,
        data: user,
        };
    } catch (error) {
        console.error(
        "Error retrieving user:",
       
        );
        return {
        success: false,
        message: "An unexpected error occurred while retrieving the user",
        };
    }
    }