// src/auth/types.ts
export type Role = "ADMIN" | "EMPLOYEE" | "USER";
export type User = { id: number; name: string; email: string; role: Role };
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
