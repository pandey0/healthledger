import "server-only";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cache } from "react";

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  age: number | null;
};

function calculateAge(dob: Date | null): number | null {
  if (!dob) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        gender: true,
        dateOfBirth: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      age: calculateAge(user.dateOfBirth),
    };
  } catch (error) {
    console.error("DAL Error: Failed to fetch user profile.", error);
    return null;
  }
});
