'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const Rainfall = () => {
  const drops = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden h-full z-0">
      {drops.map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-[#3A5154] opacity-20"
          style={{
            width: '1px',
            height: Math.random() * 80 + 40 + 'px',
            left: Math.random() * 100 + '%',
            top: -150,
          }}
          animate={{
            y: ['0vh', '120vh'],
          }}
          transition={{
            duration: Math.random() * 2 + 1.5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default function PublicPortfolioPage() {
  const { campaignId } = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/public/${campaignId}`)
        if (res.data?.data) {
        setCampaign(res.data.data)
      }
      } catch (err) {
        console.error("Fetch Error:", err)
      } finally {
        setLoading(false)
        setTimeout(() => setShowIntro(false), 2200)
      }
    }
    if (campaignId) fetchCampaign()
  }, [campaignId])

  if (loading && showIntro) {
    return (
      <div className="min-h-screen bg-[#3A5154] flex items-center justify-center">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#D4A373] text-xl font-light tracking-[0.4em] uppercase"
        >
          Initializing...
        </motion.h2>
      </div>
    )
  }

  const media = campaign?.media ?? []
  const ads = campaign?.ads ?? []
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  return (
    <div className="min-h-screen bg-[#3A5154] overflow-x-hidden">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="fixed inset-0 z-[100] bg-[#3A5154] flex items-center justify-center"
          >
            <motion.div className="text-center">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-[#D4A373] text-5xl font-serif italic tracking-widest"
              >
                Welcome to the Portfolio
              </motion.h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 1 }}
                className="h-[1px] bg-[#D4A373] mt-4 mx-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen border-[16px] border-[#3A5154] relative">
        <div className="w-full min-h-[calc(100vh-32px)] border-[8px] border-[#D4A373] bg-[#D9D1C7] relative">
          
          <main className="max-w-7xl mx-auto px-8 py-20 relative">
            
            {/* HEADER SECTION */}
            <div className="text-center mb-32 flex flex-col items-center">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-8xl md:text-[11rem] font-black text-[#3A5154] uppercase tracking-tighter leading-none"
              >
                {campaign?.name || "Summer"}
              </motion.h1>
              
              <div className="mt-4 relative inline-block">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-[#D4A373] text-2xl font-medium tracking-[0.4em] uppercase italic pb-2"
                >
                  Visual Narrative
                </motion.p>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 2.2, duration: 0.8 }}
                  className="h-[4px] w-full bg-[#D4A373] origin-left rounded-full"
                />
              </div>
            </div>

            {/* STAGGERED MEDIA MASONRY */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12 mb-40">
              {media.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`break-inside-avoid group ${index % 2 === 0 ? 'md:mt-20' : 'md:mt-0'}`}
                >
                  <div className="bg-[#D4A373] p-4 shadow-[0_20px_50px_rgba(58,81,84,0.15)] transition-all duration-500 hover:shadow-2xl">
                    <div className="w-full overflow-hidden relative bg-[#F5F5F5] aspect-auto">
                      <img 
                        src={`${backendUrl}${item.url}`}
                        alt="Campaign Asset"
                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x800?text=Asset+Found';
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-[10px] text-[#3A5154] font-black uppercase tracking-[0.3em]">
                      Ref. 00{index + 1}
                    </span>
                    <div className="flex-grow h-[1px] bg-[#3A5154]/20" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* STAGGERED ADS SECTION */}
            <div className="mt-60 max-w-5xl mx-auto relative min-h-[60vh]">
              <Rainfall />
              <div className="relative z-10 pt-20">
                <h3 className="text-[#D4A373] text-xs font-bold tracking-[0.8em] uppercase text-center mb-32">
                  Campaign Methodology
                </h3>

                <div className="space-y-40">
                  {ads.map((ad: any, i: number) => (
                    <motion.div 
                      key={ad.id}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-12 md:gap-24`}
                    >
                      {/* Side Label */}
                      <div className="flex-shrink-0">
                        <span className="text-[#D4A373] font-serif italic text-7xl opacity-20 block">
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="max-w-xl">
                        <h4 className="text-4xl font-black text-[#3A5154] uppercase tracking-tight mb-8 leading-none">
                          {ad.title}
                        </h4>
                        <div className="relative">
                          <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-[#D4A373] opacity-30" />
                          <p className="text-[#3A5154]/90 text-2xl leading-relaxed font-medium">
                            {ad.body}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}