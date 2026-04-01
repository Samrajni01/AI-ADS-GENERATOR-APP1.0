'use client'

import { useState } from 'react'
import { useCampaigns, useCreateCampaign, useDeleteCampaign } from '../../../src/hooks/useCampaigns'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { Megaphone, Trash2, Plus, Globe, Lock, Copy, Check, Layout, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import axiosInstance from '../../../lib/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { updateCampaignApi } from '@/src/store/campaigns.query'

const statusColors: Record<string, { dot: string }> = {
  DRAFT: { dot: '#eab308' },
  ACTIVE: { dot: '#22c55e' },
}

const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
})

type CreateForm = z.infer<typeof createSchema>

export default function CampaignsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: campaigns, isLoading, refetch } = useCampaigns()
  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign()
  const { mutate: deleteCampaign } = useDeleteCampaign()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  })

  // Streamlined Columns
  const columns = ['DRAFT', 'ACTIVE']

  const onSubmit = (data: CreateForm) => {
    createCampaign({ name: data.name, description: data.description || '' }, {
      onSuccess: () => {
        toast.success('Campaign created!')
        setShowForm(false)
        reset()
        refetch()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create campaign')
      },
    })
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteCampaign(id, {
      onSuccess: () => { toast.success('Deleted!'); setDeletingId(null) },
      onError: () => { toast.error('Failed!'); setDeletingId(null) },
    })
  }

  const handleTogglePublic = async (id: string) => {
    try {
      await axiosInstance.patch(`/campaigns/${id}/toggle-public`)
      toast.success('Visibility updated!')
      refetch()
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleCopyLink = async (id: string) => {
    const portfolioUrl = `${window.location.origin}/portfolio/${id}`
    navigator.clipboard.writeText(portfolioUrl)
    setCopiedId(id)
    toast.success('Portfolio link copied!')

    try {
      await updateCampaignApi(id, { status: 'ACTIVE' });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (error) {
      console.error("Status update failed", error);
    }
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) return <LoadingSpinner />

  const campaignsList = Array.isArray(campaigns) 
    ? campaigns 
    : (campaigns as any)?.data?.data || (campaigns as any)?.data || []

  return (
    // Updated Main BG to Light Brown (#F5F2ED)
    <div className="min-h-screen flex flex-col p-6 lg:p-10" style={{ backgroundColor: '#F5F2ED' }}>
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10 shrink-0 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-900 to-red-700 shadow-xl shadow-red-200">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-red-950 via-red-800 to-amber-700 bg-clip-text text-transparent tracking-tight">
              Campaign Pipeline
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-70">
              Manage and deploy your creative assets
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-red-900 hover:bg-red-800 transition-all shadow-lg shadow-red-900/20"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex gap-8 overflow-x-auto pb-10 max-w-7xl mx-auto w-full">
        {columns.map((colStatus) => (
          <div key={colStatus} className="flex flex-col min-w-[380px] flex-1">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: statusColors[colStatus].dot }} />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">{colStatus}</h3>
                <span className="text-[10px] font-black text-slate-400 bg-white/50 border border-slate-200 px-3 py-1 rounded-full">
                  {campaignsList.filter((c: any) => c.status === colStatus || (colStatus === 'ACTIVE' && c.status === 'PUBLISHED')).length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-red-900 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Column Body - Transparent to let the Light Brown show through */}
            <div className="flex-1 rounded-[2.5rem] p-4 space-y-5 overflow-y-auto border-2 border-dashed border-slate-300/50 min-h-[500px]">
              {campaignsList
                .filter((c: any) => (c.status === colStatus || (colStatus === 'ACTIVE' && c.status === 'PUBLISHED')))
                .map((campaign: any) => {
                  const totalAssets = (campaign._count?.ads || 0) + (campaign._count?.media || 0);
                  const nameParts = campaign.name.split(' ');
                  const firstName = nameParts[0];
                  const restName = nameParts.slice(1).join(' ');

                  return (
                    <motion.div
                      key={campaign.id}
                      layoutId={campaign.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => router.push(`/portfolio/${campaign.id}`)}
                      className="group relative rounded-3xl p-6 cursor-pointer shadow-md hover:shadow-2xl transition-all border border-white/10"
                      style={{ background: 'linear-gradient(145deg, #7f1d1d 0%, #991b1b 50%, #b45309 100%)' }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
                          <Layout className="w-5 h-5 text-amber-400" />
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(campaign.id); }}
                          className="p-2 rounded-xl hover:bg-red-500/40 text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter mb-2">
                        {firstName} <span className="text-amber-500 block text-xs tracking-[0.3em] font-medium opacity-80">{restName}</span>
                      </h2>

                      <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleTogglePublic(campaign.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${campaign.isPublic ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-white border border-white/20'}`}
                        >
                          {campaign.isPublic ? <><Globe size={11} /> Public</> : <><Lock size={11} /> Private</>}
                        </button>

                        {campaign.isPublic && (
                          <button
                            onClick={() => handleCopyLink(campaign.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-sm"
                          >
                            {copiedId === campaign.id ? <Check size={11} /> : <Copy size={11} />}
                            {copiedId === campaign.id ? 'Copied' : 'Share'}
                          </button>
                        )}
                        <span className="ml-auto text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{totalAssets} Assets</span>
                      </div>
                    </motion.div>
                  )
              })}

              {colStatus === 'DRAFT' && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="w-full py-6 border-2 border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-red-400 hover:text-red-900 transition-all bg-white/40 group"
                >
                  <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Create New Draft</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Kept consistent with the Red theme */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-red-950/20 backdrop-blur-md">
            <motion.div 
              className="w-full max-w-md rounded-[3rem] p-10 bg-white shadow-2xl border border-slate-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="font-black text-3xl mb-8 text-red-950 uppercase tracking-tighter leading-none">Initialize<br/>Campaign</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-[0.2em]">Folder Reference</label>
                  <input {...register('name')} type="text" placeholder="E.G. SUMMER_REELS_26" className="w-full px-5 py-5 rounded-2xl border-2 border-slate-50 focus:border-red-900 outline-none font-black text-slate-700 transition-all bg-slate-50/50" />
                  {errors.name && <p className="text-red-600 text-[10px] font-bold mt-2">{errors.name.message}</p>}
                </div>
                <div className="flex gap-4">
                  <button type="submit" disabled={isCreating} className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-red-950 hover:bg-red-900 shadow-xl shadow-red-900/20 transition-all">
                    {isCreating ? 'Deploying...' : 'Create Folder'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}