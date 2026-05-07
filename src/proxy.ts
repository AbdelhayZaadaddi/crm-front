import { NextRequest, NextResponse } from 'next/server'

const protectedPrefixes = ['/dashboard']
const publicPaths = ['/login', '/register']

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
