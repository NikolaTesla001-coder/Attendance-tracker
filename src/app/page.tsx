import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "professor") {
    redirect("/professor/dashboard");
  } else if (role === "student") {
    redirect("/student/dashboard");
  } else {
    redirect("/login?error=AccessDenied");
  }
}

