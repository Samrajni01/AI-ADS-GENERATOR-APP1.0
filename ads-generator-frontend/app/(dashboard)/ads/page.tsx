'use client'

import { useState, useEffect } from 'react'
import { useAds, useDeleteAd, useUpdateAd } from '../../../src/hooks/useAds'
import { useCampaigns } from '../../../src/hooks/useCampaigns' 
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import EmptyState from '../../../components/shared/EmptyState'
import { Megaphone, Trash2, Edit, Plus, Calendar, Layers, Sparkles } from 'lucide-react' 
import { toast } from 'sonner'
import Link from 'next/link'
import { Ad } from '../../../src/types/ad.types'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdsPage() {
  const { data: ads, isLoading: adsLoading } = useAds()
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns()
  const { mutate: deleteAd } = useDeleteAd()
  const { mutate: updateAd } = useUpdateAd()
  
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const campaigns = Array.isArray(campaignsData) ? campaignsData : (campaignsData as any)?.data || [];
  
  useEffect(() => {
    if (ads && ads.length > 0 && !selectedAdId) {
      setSelectedAdId(ads[0].id)
    }
  }, [ads, selectedAdId])

  const selectedAd = ads?.find((ad: Ad) => ad.id === selectedAdId)

  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteAd(id, {
      onSuccess: () => {
        toast.success('Ad deleted!')
        setDeletingId(null)
        if (selectedAdId === id) setSelectedAdId(ads?.[0]?.id || null)
      }
    })
  }

  const handleCampaignChange = (adId: string, campaignId: string) => {
    const cid = campaignId === "" ? null : campaignId;
    updateAd({ id: adId, payload: { campaignId: cid } }, {
        onSuccess: () => toast.success('Pipeline Updated!'),
    });
  }

  if (adsLoading || campaignsLoading) return <LoadingSpinner />

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col px-6 lg:px-10" style={{ backgroundColor: '#F5F2ED' }}>
      
      {/* Editorial Header */}
      <div className="mb-8 pt-4 flex items-end justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-red-900 flex items-center justify-center shadow-xl shadow-red-900/20">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-black text-red-950 uppercase tracking-tighter leading-none">
              Content <span className="text-red-900/40">Vault</span>
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Archive of AI-Generated Narratives</p>
        </motion.div>

        <Link
          href="/ai"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-red-900 shadow-xl shadow-red-900/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> New Creation
        </Link>
      </div>

      {!ads || ads.length === 0 ? (
        <EmptyState icon={Sparkles} title="The vault is empty" description="Start your first AI generation to fill this space." />
      ) : (
        <div className="flex-1 flex overflow-hidden rounded-[3.5rem] border-[6px] border-white bg-white/40 backdrop-blur-md shadow-2xl shadow-stone-200">
          
          {/* LEFT PANE: Master List */}
          <div className="w-80 lg:w-96 border-r-4 border-white overflow-y-auto bg-white/20">
            {ads.map((ad: Ad) => {
              const isActive = selectedAdId === ad.id;
              return (
                <motion.div
                  key={ad.id}
                  onClick={() => setSelectedAdId(ad.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`p-8 cursor-pointer border-b-2 border-white transition-all relative ${
                    isActive ? 'bg-white shadow-inner' : 'hover:bg-white/40'
                  }`}
                >
                  {isActive && (
                    <motion.div layoutId="activeBar" className="absolute left-0 top-0 bottom-0 w-2 bg-red-900" />
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-900/60">{ad.platform}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{new Date(ad.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className={`text-base font-black uppercase tracking-tighter leading-tight ${isActive ? 'text-red-950' : 'text-slate-400'}`}>
                    {ad.title}
                  </h4>
                </motion.div>
              );
            })}
          </div>

          {/* RIGHT PANE: Detail View */}
          <div className="flex-1 overflow-y-auto bg-white p-16">
            <AnimatePresence mode="wait">
              {selectedAd ? (
                <motion.div 
                  key={selectedAd.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                  className="max-w-3xl space-y-12"
                >
                  {/* Status & Pipeline Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white bg-red-950">
                        {selectedAd.platform}
                      </span>
                      <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 border-stone-100 bg-stone-50 text-stone-500">
                        {selectedAd.status === 'ACTIVE' ? 'PUBLISHED' : selectedAd.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-stone-300" />
                      <select
                        className="text-[10px] font-black uppercase tracking-widest p-3 px-5 border-2 border-stone-50 rounded-2xl bg-stone-50 outline-none focus:border-red-900 transition-all cursor-pointer"
                        value={selectedAd.campaignId || ""}
                        onChange={(e) => handleCampaignChange(selectedAd.id, e.target.value)}
                      >
                        <option value="">Standalone Asset</option>
                        {campaigns.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Editorial Content */}
                  <div className="space-y-8">
                    <h2 className="text-7xl font-black text-red-950 uppercase tracking-tighter leading-[0.85]">{selectedAd.title}</h2>
                    <div className="flex items-center gap-4 text-[11px] font-black text-stone-400 uppercase tracking-[0.3em]">
                      <Calendar className="w-4 h-4" /> Logged {new Date(selectedAd.createdAt).toLocaleDateString()}
                    </div>
                    
                    {/* DOUBLE BORDER GREEN CARD */}
                    <div className="p-1 rounded-[3.5rem] border-4 border-[#065f46]"> 
                      <div className="p-12 rounded-[3.1rem] border-2 border-dashed border-[#065f46]/20 bg-[#ecfdf5] relative">
                         <span className="absolute -top-5 -left-5 p-4 bg-[#065f46] rounded-2xl text-white shadow-xl shadow-emerald-900/20">
                            <Sparkles className="w-5 h-5" />
                         </span>
                        <p className="text-2xl text-[#064e3b] leading-relaxed font-semibold italic select-all">
                          "{selectedAd.body}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Refined Footer Actions */}
                  <div className="flex items-center gap-6 pt-12">
                    <Link
                      href={`/ai?edit=${selectedAd.id}`}
                      className="flex-1 flex items-center justify-center gap-4 px-10 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all bg-red-900 text-white shadow-2xl shadow-red-900/30 hover:translate-y-[-2px] active:translate-y-[0px]"
                    >
                      <Edit className="w-4 h-4" /> Edit Composition
                    </Link>
                    <button
                      onClick={() => handleDelete(selectedAd.id)}
                      disabled={deletingId === selectedAd.id}
                      className="p-6 rounded-2xl transition-all bg-stone-50 text-stone-400 border-2 border-stone-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                    >
                      {deletingId === selectedAd.id ? '...' : <Trash2 className="w-6 h-6" />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] font-black text-stone-200 uppercase tracking-[0.5em]">
                  Select from Vault
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}