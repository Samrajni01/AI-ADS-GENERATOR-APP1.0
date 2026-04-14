'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

const phrases = [
  'Generate Amazing Ads with AI',
  'Create Ads that Convert',
  'Power Your Marketing with AI',
  'Transform Ideas into Winning Ads',
  'Reach Your Audience Effectively',
]

export default function AnimatedHeading() {
  const router = useRouter()
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const phrase = phrases[currentPhrase]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < phrase.length) {
          setDisplayText(phrase.slice(0, charIndex + 1))
          setCharIndex((prev) => prev + 1)
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setDisplayText(phrase.slice(0, charIndex - 1))
          setCharIndex((prev) => prev - 1)
        } else {
          setIsDeleting(false)
          setCurrentPhrase((prev) => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? 40 : 80)

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, currentPhrase])

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {/* Badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
        style={{
          backgroundColor: '#ccfbf1',
          color: '#0d9488',
        }}
      >
        <Sparkles className="w-4 h-4" />
        AI-Powered Ad Generator
      </div>

      {/* Animated Heading */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4"
        style={{ color: '#0f172a' }}
      >
        {displayText}
        <span
          className="inline-block w-0.5 h-10 ml-1 align-middle animate-pulse"
          style={{ backgroundColor: '#0d9488' }}
        />
      </h1>

      {/* Subtitle */}
      <p
        className="text-lg mb-10 max-w-xl"
        style={{ color: '#64748b' }}
      >
        Use the power of GPT-4 to create high-converting ads for
        Facebook, Instagram, Google and more — in seconds.
      </p>

      {/* CTA Button */}
      <button
        onClick={() => router.push('/ai')}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-200 hover:opacity-90 hover:scale-105 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #0d9488, #0f766e)',
          boxShadow: '0 8px 32px rgba(13, 148, 136, 0.3)',
        }}
      >
        <Sparkles className="w-5 h-5" />
        Generate Your First Ad
      </button>

      {/* Stats row */}
      <div className="flex items-center gap-8 mt-12">
        {[
          { label: 'Ads Generated', value: '10K+' },
          { label: 'Platforms', value: '6' },
          { label: 'Happy Users', value: '500+' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: '#0d9488' }}
            >
              {stat.value}
            </p>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}