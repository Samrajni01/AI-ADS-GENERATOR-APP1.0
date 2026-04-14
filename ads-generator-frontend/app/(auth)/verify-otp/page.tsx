'use client'

import { useRef, useState, Suspense } from 'react' // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, Zap, Mail } from 'lucide-react'
import { useVerifyOtp, useSendOtp } from '../../../src/hooks/useAuth'

// 1. Move your main logic into a sub-component
function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { mutate: verifyOtp, isPending } = useVerifyOtp()
  const { mutate: sendOtp, isPending: isResending } = useSendOtp()

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pasted)) return
    const newOtp = pasted.split('')
    while (newOtp.length < 6) newOtp.push('')
    setOtp(newOtp)
    inputRefs.current[5]?.focus()
  }

  const handleVerify = () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }
    verifyOtp(
      { email, otp: otpString },
      {
        onSuccess: () => {
          toast.success('Email verified successfully!')
          // Kept your window.location change
          window.location.href = '/dashboard' 
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Invalid OTP')
        },
      },
    )
  }

  const handleResend = () => {
    sendOtp(
      { email },
      {
        onSuccess: () => {
          toast.success('OTP resent successfully!')
          setOtp(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to resend OTP')
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

        {/* Email icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #f59e0b' }}
          >
            <Mail className="w-8 h-8" style={{ color: '#f59e0b' }} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Verify your email
          </h1>
          <p className="text-sm" style={{ color: '#a1a1aa' }}>
            We sent a 6-digit code to
          </p>
          <p
            className="text-sm font-semibold mt-1"
            style={{ color: '#f59e0b' }}
          >
            {email}
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-3 justify-center mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-bold text-white rounded-xl border outline-none transition-all duration-200 focus:border-amber-500"
              style={{
                backgroundColor: '#1a1a1a',
                borderColor: digit ? '#f59e0b' : '#1f1f1f',
              }}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isPending}
          className="w-full py-3 px-4 rounded-xl font-semibold text-black transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2 mb-4"
          style={{ backgroundColor: '#f59e0b' }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend OTP */}
        <div className="text-center mb-4">
          <span className="text-sm" style={{ color: '#a1a1aa' }}>
            Didn&apos;t receive the code?{' '}
          </span>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm font-semibold transition-colors hover:text-amber-400"
            style={{ color: '#f59e0b' }}
          >
            {isResending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>

        {/* Back to register */}
        <p className="text-center text-sm" style={{ color: '#a1a1aa' }}>
          Wrong email?{' '}
          <Link
            href="/register"
            className="font-semibold transition-colors hover:text-amber-400"
            style={{ color: '#f59e0b' }}
          >
            Go back
          </Link>
        </p>
      </div>
    </div>
  )
}

// 2. Wrap it here for Next.js 15 compatibility
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}