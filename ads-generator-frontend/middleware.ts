import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    // inside export default withAuth(...
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl
      const hasToken = !!token || !!req.cookies.get('access_token') // Checks both NextAuth and your manual cookie

      // Allow auth pages
      if (
         pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/forgot-password') ||
          pathname.startsWith('/reset-password') ||
          pathname.startsWith('/verify-otp') ||
          pathname.startsWith('/portfolio') 
      ) {
        return true
      }

      // Require at least one token for everything else (dashboard, etc.)
      return hasToken
    },
  },
  },
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ads/:path*',
    '/campaigns/:path*',
    '/ai/:path*',
    '/media/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-otp',
    '/portfolio/:path*', 
  ],
}

/*2. The "Refinement" (May change later)
This is the part we "hot-wired" to get you moving:

middleware.ts: Currently, your middleware manually checks for req.cookies.get('access_token').

The Future: Once you fully integrate NextAuth (now called Auth.js) with your custom backend, NextAuth will handle the 
token automatically. You will eventually be able to remove the manual cookie check and just rely on the token object
 that NextAuth provides.*/
