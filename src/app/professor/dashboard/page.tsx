import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import ProfessorDashboardClient from "./ProfessorDashboardClient";

export default async function ProfessorDashboardPage() {
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

  return <ProfessorDashboardClient onSignOut={handleSignOut} user={user} />;
}

