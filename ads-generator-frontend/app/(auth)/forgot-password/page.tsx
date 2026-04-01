'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Zap, KeyRound } from 'lucide-react'
import { useForgotPassword } from '../../../src/hooks/useAuth'

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { mutate: forgotPassword, isPending } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = (data: ForgotForm) => {
    forgotPassword(
      { email: data.email },
      {
        onSuccess: () => {
          toast.success('Reset link sent to your email!')
          router.push(`/verify-otp?email=${data.email}`)
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to send reset link')
        },
      },
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#080808' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 border"
        style={{
          backgroundColor: '#111111',
          borderColor: '#1f1f1f',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
            style={{ backgroundColor: '#f59e0b' }}
          >
            <Zap className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-bold text-white">AdsGenerator</span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #f59e0b' }}
          >
            <KeyRound className="w-8 h-8" style={{ color: '#f59e0b' }} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Forgot password?
          </h1>
          <p className="text-sm" style={{ color: '#a1a1aa' }}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-all duration-200 focus:border-amber-500"
              style={{
                backgroundColor: '#1a1a1a',
                borderColor: '#1f1f1f',
              }}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 rounded-xl font-semibold text-black transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#f59e0b' }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-sm mt-6" style={{ color: '#a1a1aa' }}>
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-semibold transition-colors hover:text-amber-400"
            style={{ color: '#f59e0b' }}
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}//http://localhost:3000/forgot-password