'use client'

import { useState, Suspense } from 'react' // Added Suspense import
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Zap, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useResetPassword } from '../../../src/hooks/useAuth'

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetForm = z.infer<typeof resetSchema>

// Move the logic into a sub-component to use Suspense correctly
function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate: resetPassword, isPending } = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = (data: ResetForm) => {
    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }
    resetPassword(
      { token, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success('Password reset successfully!')
          router.push('/login')
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to reset password')
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
            <ShieldCheck className="w-8 h-8" style={{ color: '#f59e0b' }} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Reset password
          </h1>
          <p className="text-sm" style={{ color: '#a1a1aa' }}>
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-all duration-200 focus:border-amber-500"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderColor: '#1f1f1f',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#a1a1aa' }}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-all duration-200 focus:border-amber-500"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderColor: '#1f1f1f',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#a1a1aa' }}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 rounded-xl font-semibold text-black transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#f59e0b' }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
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
}

// 3. THIS IS THE WRAPPER PART
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}