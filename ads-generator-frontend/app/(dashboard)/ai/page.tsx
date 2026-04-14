'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Sparkles, Loader2, Copy, Save, RefreshCw, Image as ImageIcon } from 'lucide-react' 
import { useCreateAd } from '../../../src/hooks/useAds'
import { generateAdApi, generateVariationsApi } from '../../../src/store/ai.query'

const platforms = ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'GOOGLE', 'LINKEDIN', 'TIKTOK']
const tones = ['Professional', 'Friendly', 'Humorous', 'Inspirational', 'Urgent', 'Casual']

const generateSchema = z.object({
  prompt: z.string().min(10, 'Please describe your product in at least 10 characters'),
  platform: z.string().min(1, 'Please select a platform'),
  tone: z.string().optional(),
  targetAudience: z.string().optional(),
  productName: z.string().optional(),
  includeImage: z.boolean().optional(),
})

type GenerateForm = z.infer<typeof generateSchema>

const SnowCanvas = ({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) => {
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

    const flakes = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 0.5,
      speed: Math.random() * 1 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    let id: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      flakes.forEach((f) => {
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`
        ctx.fill()
        f.y += f.speed
        f.x += Math.sin(f.y * 0.01) * 0.4
        if (f.y > canvas.height) {
          f.y = -5
          f.x = Math.random() * canvas.width
        }
      })
      id = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(id)
  }, [canvasRef])

  return null
}

export default function AiPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generatedAd, setGeneratedAd] = useState<any>(null)
  const [variations, setVariations] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false)
  const { mutate: saveAd, isPending: isSaving } = useCreateAd()

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: { includeImage: false }
  })

  const includeImageValue = watch('includeImage');

  const onGenerate = async (data: GenerateForm) => {
    setIsGenerating(true)
    try {
      const result = await generateAdApi({
        prompt: data.prompt,
        platform: data.platform as any,
        tone: data.tone,
        targetAudience: data.targetAudience,
        productName: data.productName,
        includeImage: data.includeImage,
      })
      setGeneratedAd(result)
      setVariations([])
      toast.success('Narrative Fabricated')
    } catch {
      toast.error('Generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const onGenerateVariations = async () => {
    const data = getValues()
    setIsGeneratingVariations(true)
    try {
      const result = await generateVariationsApi({
        prompt: data.prompt,
        platform: data.platform as any,
        tone: data.tone,
        targetAudience: data.targetAudience,
        productName: data.productName,
        includeImage: false,
      })
      setVariations(result)
      toast.success('Variations expanded')
    } catch {
      toast.error('Failed to iterate')
    } finally {
      setIsGeneratingVariations(false)
    }
  }

  const handleSave = (title: string, body: string) => {
    const data = getValues()
    saveAd(
      { title, body, platform: data.platform as any, prompt: data.prompt },
      { onSuccess: () => toast.success('Moved to Vault') }
    )
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to Clipboard')
  }

  return (
    // Update: BG changed from Toffee to Light Mint
    <div className="min-h-screen p-6 lg:p-10" style={{ backgroundColor: '#F0FFF4' }}>
      <div className="max-w-3xl mx-auto w-full pb-20">
        
        {/* Header - Professional Typography */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            <span className="text-[#1C1917]">AI</span> 
            <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent"> AD GENERATOR</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Precision Creative Suite</p>
        </div>

        {/* Form Container */}
        <div className="p-1 rounded-[3.5rem] bg-[#98D1C9] shadow-2xl mb-12 border-2 border-white/50">
          <div
            className="rounded-[3.1rem] border relative overflow-hidden"
            style={{
              backgroundColor: '#0d9488', 
              borderColor: '#0f766e',
            }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />
            <SnowCanvas canvasRef={canvasRef} />

            <div className="relative p-10 z-10">
              <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-300" /> Describe Your Narrative
              </h2>

              <form onSubmit={handleSubmit(onGenerate)} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-emerald-100 uppercase tracking-widest flex items-center gap-2 mb-2">
                    Core Concept
                  </label>
                  <textarea
                    {...register('prompt')}
                    rows={3}
                    placeholder="Describe your product story..."
                    className="w-full px-6 py-4 rounded-2xl text-white placeholder-emerald-200/50 outline-none border-2 border-white/10 focus:border-white transition-all bg-white/10 resize-none font-medium"
                  />
                  {errors.prompt && <p className="text-amber-300 text-[10px] font-bold mt-1">{errors.prompt.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Platform</label>
                    <select {...register('platform')} className="w-full px-5 py-3 rounded-xl text-white border-2 border-white/10 bg-white/10 outline-none focus:border-white appearance-none cursor-pointer">
                      <option value="" className="bg-[#0d9488]">Select</option>
                      {platforms.map(p => <option key={p} value={p} className="bg-[#0d9488]">{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Tone</label>
                    <select {...register('tone')} className="w-full px-5 py-3 rounded-xl text-white border-2 border-white/10 bg-white/10 outline-none focus:border-white appearance-none cursor-pointer">
                      <option value="" className="bg-[#0d9488]">Select</option>
                      {tones.map(t => <option key={t} value={t} className="bg-[#0d9488]">{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Product Name</label>
                    <input {...register('productName')} type="text" className="w-full px-5 py-3 rounded-xl text-white border-2 border-white/10 bg-white/10 outline-none focus:border-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Target Audience</label>
                    <input {...register('targetAudience')} type="text" className="w-full px-5 py-3 rounded-xl text-white border-2 border-white/10 bg-white/10 outline-none focus:border-white" />
                  </div>
                </div>

                {/* IMAGE TOGGLE */}
                <div 
                  className="flex items-center justify-between p-5 rounded-2xl border border-white/20 mt-2 transition-all cursor-pointer"
                  style={{ backgroundColor: includeImageValue ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)' }}
                  onClick={() => setValue('includeImage', !includeImageValue)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${includeImageValue ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'}`}>
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white">Generate Visuals</p>
                      <p className="text-[10px] text-white/70">Create using Stable Diffusion</p>
                    </div>
                  </div>
                  <button type="button" className={`w-12 h-6 rounded-full relative transition-all ${includeImageValue ? 'bg-amber-400' : 'bg-white/20'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeImageValue ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex-[2] py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    style={{ backgroundColor: '#f59e0b', color: '#000' }}
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Engage Generation
                  </button>

                  <button
                    type="button"
                    onClick={onGenerateVariations}
                    disabled={isGeneratingVariations}
                    className="flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-3 border-2 border-white/30"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    {isGeneratingVariations ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />} Iterate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-6 max-w-2xl mx-auto">
          {generatedAd && (
            <div className="rounded-3xl border p-8 bg-white/70 backdrop-blur-sm shadow-xl border-emerald-100">
              {generatedAd.ad.imageUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden border-4 border-white shadow-2xl aspect-video relative">
                  <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${generatedAd.ad.imageUrl}`} alt="Visual" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-emerald-900/10">
                <h3 className="font-black text-2xl text-emerald-950 uppercase tracking-tighter">Engineered Ad</h3>
                <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase bg-emerald-900 text-white tracking-widest">{generatedAd.generatedBy}</span>
              </div>
              <h4 className="font-black text-xl mb-3 text-emerald-950 uppercase tracking-tight">{generatedAd.ad.title}</h4>
              <p className="text-base text-slate-800 leading-relaxed font-medium italic mb-8">"{generatedAd.ad.body}"</p>
              <div className="flex gap-3">
                <button onClick={() => handleCopy(`${generatedAd.ad.title}\n${generatedAd.ad.body}`)} className="flex-1 py-4 rounded-xl font-bold bg-white border border-emerald-100 text-slate-700 text-xs uppercase tracking-widest shadow-sm">Copy</button>
                <button onClick={() => handleSave(generatedAd.ad.title, generatedAd.ad.body)} className="flex-[2] py-4 rounded-xl font-bold bg-emerald-900 text-white text-xs uppercase tracking-widest shadow-lg">Secure to Vault</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
