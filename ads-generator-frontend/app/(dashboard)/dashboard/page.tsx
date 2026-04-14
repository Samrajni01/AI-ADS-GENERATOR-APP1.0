'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMe } from '../../../src/hooks/useAuth'
import { useAds } from '../../../src/hooks/useAds'
import { useCampaigns } from '../../../src/hooks/useCampaigns'
import {
  Sparkles,
  Megaphone,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Leaf
} from 'lucide-react'
import Link from 'next/link'

// Updated to "FallingLeaves" with Red/Amber tones
const FallingLeaves = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const petals: any[] = []
    // Red Spring / Fall colors
    const colors = ['rgba(153, 27, 27, opacity)', 'rgba(180, 83, 9, opacity)', 'rgba(254, 243, 199, opacity)']
    
    for (let i = 0; i < 40; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 6 + 4,
        speed: Math.random() * 1.2 + 0.5,
        angle: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    let animId: number
    const drawPetal = (ctx: any, x: number, y: number, size: number, rotation: number, color: string, opacity: number) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.beginPath()
      ctx.fillStyle = color.replace('opacity', String(opacity))
      // Leaf shape
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size, -size, size * 2, 0);
      ctx.quadraticCurveTo(size, size, 0, 0);
      ctx.fill(); ctx.restore()
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      petals.forEach((petal) => {
        drawPetal(ctx, petal.x, petal.y, petal.size, petal.rotation, petal.color, petal.opacity)
        petal.y += petal.speed; petal.x += Math.sin(petal.angle) * 0.5
        petal.angle += 0.01; petal.rotation += petal.rotationSpeed
        if (petal.y > canvas.height + 20) { petal.y = -20; petal.x = Math.random() * canvas.width }
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" style={{ zIndex: 0 }} />
}

const TypewriterText = () => {
  const phrases = ['Generate Amazing Ads with AI', 'Design High-End Visuals', 'Power Your Growth with Intelligence']
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const phrase = phrases[currentPhrase]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < phrase.length) {
          setDisplayText(phrase.slice(0, charIndex + 1)); setCharIndex(prev => prev + 1)
        } else { setTimeout(() => setIsDeleting(true), 2000) }
      } else {
        if (charIndex > 0) {
          setDisplayText(phrase.slice(0, charIndex - 1)); setCharIndex(prev => prev - 1)
        } else {
          setIsDeleting(false); setCurrentPhrase(prev => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? 30 : 60)
    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, currentPhrase])

  return (
    <h1 className="text-4xl md:text-6xl font-black mb-6 text-red-950 uppercase tracking-tighter leading-[0.9]">
      {displayText}<span className="inline-block w-1.5 h-12 ml-2 align-middle animate-pulse bg-amber-600" />
    </h1>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: user } = useMe()
  const { data: ads } = useAds()
  const { data: campaigns } = useCampaigns()

  const adsList = (ads as any)?.data || (Array.isArray(ads) ? ads : [])
  const campaignsList = (campaigns as any)?.data || (Array.isArray(campaigns) ? campaigns : [])
  
  const totalAds = adsList.length || 0
  const totalCampaigns = campaignsList.length || 0
  const publishedAds = adsList.filter((a: any) => a.status === 'ACTIVE').length || 0;
  const recentAds = adsList.slice(0, 3) || []

  const stats = [
    { label: 'Total Assets', value: totalAds, icon: Megaphone, bg: '#fee2e2', color: '#991b1b' },
    { label: 'Active Reach', value: publishedAds, icon: TrendingUp, bg: '#ffedd5', color: '#b45309' },
    { label: 'Pipelines', value: totalCampaigns, icon: BarChart3, bg: '#fef3c7', color: '#92400e' },
  ]

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#F5F2ED' }}>
      <FallingLeaves />

      <div className="relative p-8 lg:p-12 max-w-7xl mx-auto" style={{ zIndex: 1 }}>
        
        {/* Welcome Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Authenticated Access</h2>
            <p className="text-2xl font-black text-red-950 uppercase tracking-tighter">
              Welcome, <span className="text-amber-700">{user?.name?.split(' ')[0] || 'Samrajni'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-red-900/10 flex items-center justify-center bg-white/50 backdrop-blur-md">
             <Leaf className="w-5 h-5 text-red-900" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[2.5rem] border-2 border-white p-8 bg-white/40 backdrop-blur-sm transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.bg }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <p className="text-4xl font-black mb-1 text-red-950 tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Hero Section - The "Spring Red" Mode */}
        <div className="rounded-[3.5rem] p-12 lg:p-20 mb-12 text-center relative overflow-hidden border border-white shadow-2xl" 
             style={{ background: 'linear-gradient(145deg, #fff7ed 0%, #fee2e2 100%)' }}>
          
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black mb-8 bg-red-900 text-white uppercase tracking-[0.3em] shadow-lg shadow-red-900/20">
            <Sparkles className="w-3.5 h-3.5" /> Engine Active
          </div>
          
          <TypewriterText />
          
          <p className="text-lg mb-10 max-w-2xl mx-auto text-slate-600 font-medium leading-relaxed">
            Harness high-performance <span className="text-red-900 font-bold">Generative AI</span> to transform concepts into high-converting visual assets instantly.
          </p>
          
          <button 
            onClick={() => router.push('/ai')} 
            className="group inline-flex items-center gap-4 px-12 py-5 rounded-2xl font-black text-white text-sm uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl" 
            style={{ background: 'linear-gradient(135deg, #7f1d1d, #b45309)' }}
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Start Generating
          </button>
        </div>

        {/* Recent Creations Section */}
        {recentAds.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="font-black text-2xl text-red-950 uppercase tracking-tighter">Recent Output</h3>
              <Link href="/ads" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-900 hover:gap-4 transition-all">
                View Gallery <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentAds.map((ad: any) => (
                <div key={ad.id} className="rounded-[2.5rem] border border-white p-8 bg-white/60 backdrop-blur-md transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[9px] px-3 py-1 rounded-full font-black bg-red-900 text-white uppercase tracking-tighter">{ad.platform}</span>
                    <span className="text-[9px] px-3 py-1 rounded-full font-black bg-amber-100 text-amber-700 uppercase tracking-tighter border border-amber-200">{ad.status}</span>
                  </div>
                  <h4 className="font-black text-red-950 mb-3 line-clamp-1 uppercase tracking-tight">{ad.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium italic">"{ad.body}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}