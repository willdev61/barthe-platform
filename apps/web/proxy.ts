import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/import", "/dossiers"]
const authRoutes = ["/login"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let session = null
  try {
    const res = await fetch(
      new URL("/api/auth/get-session", request.nextUrl.origin),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    )
    if (res.ok) {
      const data = await res.json()
      session = data?.session ?? data ?? null
    }
  } catch {
    // Session check failed — treat as unauthenticated
  }

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
