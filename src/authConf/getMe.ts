// src/api/getMe.ts
import { get } from "@/hooks/fecthing/get";
export type Role = "ADMIN" | "EMPLOYEE";
export type Me = { id: number; name: string; email: string; role: Role };


export async function getMeAuth(): Promise<{
  authenticated: boolean;
  user: Me | null;
}> {
  try {
    const user = await get<Me>("account/me");
    return { authenticated: true, user };
  } catch (err: any) {
    if (
      typeof err?.message === "string" &&
      err.message.includes("status: 401")
    ) {
      return { authenticated: false, user: null };
    }
    throw err;
  }
}
