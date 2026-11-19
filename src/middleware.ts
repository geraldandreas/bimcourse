import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "bimcourse_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bimcourse_super_secret_jwt_key_2026_xyz_production_ready"
);

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: "superadmin" | "admin" | "pengajar" | "siswa" | "mahasiswa";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /profile
  if (pathname.startsWith("/profile")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // Protect /dashboard and all subroutes
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const session = payload as unknown as TokenPayload;
      const userRole = session.role;

      // Siswa / Mahasiswa or any unauthorized role CANNOT access /dashboard -> Redirect to /profile
      if (userRole === "siswa" || (userRole as string) === "mahasiswa" || !["superadmin", "admin", "pengajar"].includes(userRole)) {
        return NextResponse.redirect(new URL("/profile", req.url));
      }

      // Root /dashboard or /dashboard/ redirect to user's assigned role workspace
      if (pathname === "/dashboard" || pathname === "/dashboard/") {
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url));
      }

      // Strict role authorization checks
      if (pathname.startsWith("/dashboard/superadmin")) {
        if (userRole !== "superadmin") {
          const fallback = userRole === "admin" ? "/dashboard/admin" : userRole === "pengajar" ? "/dashboard/pengajar" : "/profile";
          return NextResponse.redirect(new URL(fallback, req.url));
        }
      } else if (pathname.startsWith("/dashboard/admin")) {
        if (userRole !== "superadmin" && userRole !== "admin") {
          const fallback = userRole === "pengajar" ? "/dashboard/pengajar" : "/profile";
          return NextResponse.redirect(new URL(fallback, req.url));
        }
      } else if (pathname.startsWith("/dashboard/pengajar")) {
        if (userRole !== "superadmin" && userRole !== "admin" && userRole !== "pengajar") {
          return NextResponse.redirect(new URL("/profile", req.url));
        }
      } else if (pathname.startsWith("/dashboard/siswa")) {
        // Students use /profile instead of /dashboard/siswa
        return NextResponse.redirect(new URL("/profile", req.url));
      }

      return NextResponse.next();
    } catch {
      // Invalid/expired token
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/profile", "/profile/:path*"],
};
