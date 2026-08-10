import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isProfessorRoute = nextUrl.pathname.startsWith("/professor");
  const isStudentRoute = nextUrl.pathname.startsWith("/student");
  const isAttendanceRoute = nextUrl.pathname.startsWith("/attendance");
  const isLoginRoute = nextUrl.pathname === "/login";

  // 1. If not logged in and accessing protected routes, redirect to /login
  if (!isLoggedIn) {
    if (isProfessorRoute || isStudentRoute || isAttendanceRoute) {
      return Response.redirect(new URL("/login", nextUrl));
    }
    return;
  }

  // 2. If logged in
  if (isLoggedIn) {
    // If on /login page, redirect to correct dashboard
    if (isLoginRoute) {
      if (role === "professor") {
        return Response.redirect(new URL("/professor/dashboard", nextUrl));
      } else {
        return Response.redirect(new URL("/student/dashboard", nextUrl));
      }
    }

    // Role-based route protection
    if (isProfessorRoute && role !== "professor") {
      // Students cannot access professor routes
      return Response.redirect(new URL("/student/dashboard", nextUrl));
    }

    if (isStudentRoute && role !== "student") {
      // Professors cannot access student routes
      return Response.redirect(new URL("/professor/dashboard", nextUrl));
    }
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
