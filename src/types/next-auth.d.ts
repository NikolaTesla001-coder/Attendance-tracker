import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      rollNo?: string;
      studentId?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    rollNo?: string;
    studentId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    rollNo?: string;
    studentId?: string;
  }
}
