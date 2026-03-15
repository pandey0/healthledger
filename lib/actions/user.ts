"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type UpdateProfilePayload = {
  name?: string;
  gender?: string;
  dateOfBirth?: string;
};

export async function updateUserProfile(payload: UpdateProfilePayload) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Unauthorized." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.gender !== undefined && { gender: payload.gender }),
        ...(payload.dateOfBirth !== undefined && {
          dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
        }),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/vault");

    return { success: true };
  } catch (error) {
    console.error("Action Error: Failed to update profile.", error);
    return { success: false, error: "Failed to save profile." };
  }
}
