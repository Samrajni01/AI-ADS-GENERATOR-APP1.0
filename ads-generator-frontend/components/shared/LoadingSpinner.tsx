'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function LoadingSpinner() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#080808' }}
    >
      {/* Outer ring */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="absolute w-32 h-32 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'transparent',
            borderTopColor: '#0d9488',
            borderRightColor: '#0d9488',
            animationDuration: '1.5s',
          }}
        />
        <div
          className="absolute w-24 h-24 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'transparent',
            borderBottomColor: '#f59e0b',
            borderLeftColor: '#f59e0b',
            animationDuration: '1s',
            animationDirection: 'reverse',
          }}
        />
        {/* Center icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#0d9488' }}
        >
          <Sparkles className="w-7 h-7 text-white animate-pulse" />
        </div>
      </div>

      {/* Floating particles */}
      <div className="relative w-48 h-8 mb-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: i % 2 === 0 ? '#0d9488' : '#f59e0b',
              left: `${i * 25}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s',
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-lg font-semibold text-white">
        Loading{dots}
      </p>
      <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
        Please wait while we set things up
      </p>
    </div>
  )
}