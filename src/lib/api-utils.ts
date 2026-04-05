import { NextResponse } from "next/server";
import { auth } from "./auth";
import type { Role } from "@/generated/prisma/client";

export async function getSession() {
  return await auth();
}

export async function requireAuth(requiredRole?: Role) {
  const session = await getSession();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
