import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/admin/login',
  },
})

// Protect all /admin/* EXCEPT /admin/login
export const config = {
  matcher: ['/admin/((?!login).*)'],
}
