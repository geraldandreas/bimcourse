import { NextResponse } from "next/server";
import { getCurrentUser, getSession, createSessionToken, setSessionCookie, UserRole } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    const user = await getCurrentUser();
    
    if (!user || !session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Auto-sync session cookie if SuperAdmin changed the user's role in database!
    if (session.role !== user.role) {
      const refreshedToken = await createSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      });
      await setSessionCookie(refreshedToken);
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
