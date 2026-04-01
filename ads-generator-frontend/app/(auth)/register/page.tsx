'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { useRegister } from '../../../src/hooks/useAuth'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { mutate: register, isPending } = useRegister()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Snowfall inside card
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    setSize()

    const snowflakes: {
      x: number
      y: number
      radius: number
      speed: number
      opacity: number
    }[] = []

    for (let i = 0; i < 80; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.6 + 0.2,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      snowflakes.forEach((flake) => {
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 158, 11, ${flake.opacity})`
        ctx.fill()
        flake.y += flake.speed
        flake.x += Math.sin(flake.y * 0.01) * 0.3
        if (flake.y > canvas.height) {
          flake.y = -5
          flake.x = Math.random() * canvas.width
        }
      })
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterForm) => {
    register(
      {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success('Registration successful! Please verify your email.')
          router.push(`/verify-otp?email=${data.email}`)
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Registration failed')
        },
      },
    )
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
    setGoogleLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#080808' }}
    >
      {/* Card with snowfall inside */}
      <div
        className="w-full max-w-md rounded-2xl border relative overflow-hidden"
        style={{
          backgroundColor: '#111111',
          borderColor: '#1f1f1f',
        }}
      >
        {/* Snowfall Canvas — inside card */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* All content above snow */}
        <div className="relative p-8" style={{ zIndex: 1 }}>
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

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
            <p className="text-sm" style={{ color: '#a1a1aa' }}>
              Start generating amazing ads today
            </p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-white font-medium mb-6 transition-all duration-200 hover:border-amber-500"
            style={{ borderColor: '#1f1f1f', backgroundColor: '#1a1a1a' }}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ backgroundColor: '#1f1f1f' }} />
            <span className="text-sm" style={{ color: '#a1a1aa' }}>OR</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#1f1f1f' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                {...formRegister('name')}
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-all duration-200 focus:border-amber-500"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#1f1f1f' }}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                {...formRegister('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-all duration-200 focus:border-amber-500"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#1f1f1f' }}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...formRegister('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-all duration-200 focus:border-amber-500"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#1f1f1f' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#a1a1aa' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...formRegister('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-all duration-200 focus:border-amber-500"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#1f1f1f' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#a1a1aa' }}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl font-semibold text-black transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: '#f59e0b' }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm mt-6" style={{ color: '#a1a1aa' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold transition-colors hover:text-amber-400"
              style={{ color: '#f59e0b' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}