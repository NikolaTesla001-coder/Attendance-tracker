import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import ProfessorHistoryClient from "./ProfessorHistoryClient";

export default async function ProfessorHistoryPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "professor") {
    redirect("/login");
  }

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  const user = {
    name: session.user.name || "Professor",
    email: session.user.email || "",
    image: session.user.image || null,
  };

  return <ProfessorHistoryClient onSignOut={handleSignOut} user={user} />;
}

