import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import Cookies from 'js-cookie'
import axiosInstance from './axios'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: any) {
      try {
        // Send google user to our NestJS backend
        const response = await axiosInstance.post('/auth/google/callback', {
          email: user.email,
          name: user.name,
          picture: user.image,
        })
        const { access_token } = response.data.data
        Cookies.set('access_token', access_token, { expires: 7 })
        return true
      } catch (error) {
        return false
      }
    },
    async session({ session, token }: any) {
      session.user.id = token.sub
      return session
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}

export default NextAuth(authOptions)