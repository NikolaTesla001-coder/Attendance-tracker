import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginFormClient from "./LoginFormClient";

interface PageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  const { error } = await searchParams;

  // If already logged in, redirect immediately to respective portal
  if (session && session.user) {
    const role = session.user.role;
    if (role === "professor") {
      redirect("/professor/dashboard");
    } else if (role === "student") {
      redirect("/student/dashboard");
    }
  }

  return <LoginFormClient error={error} />;
}

