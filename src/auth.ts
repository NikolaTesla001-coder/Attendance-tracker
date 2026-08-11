import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const emailLower = user.email.toLowerCase();

      // 1. Check if professor
      if (process.env.PROFESSOR_EMAIL && emailLower === process.env.PROFESSOR_EMAIL.toLowerCase()) {
        user.role = "professor";
        return true;
      }

      // 2. Check if whitelisted student
      try {
        await connectToDatabase();
        const student = await Student.findOne({ email: emailLower, active: true });
        if (student) {
          user.role = "student";
          user.rollNo = student.rollNo;
          user.studentId = student._id.toString();
          return true;
        }
      } catch (err) {
        console.error("Sign-in database check error:", err);
      }

      return false; // AccessDenied
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "student";
        token.rollNo = user.rollNo;
        token.studentId = user.studentId;
        token.picture = user.image; // Capture Google profile image URL
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.rollNo = token.rollNo as string | undefined;
        session.user.studentId = token.studentId as string | undefined;
        session.user.image = token.picture as string | null; // Map Google profile image URL to session
      }
      return session;
    },
  },
});
