'use client'

import { useRef, useState } from 'react'
import { useMedia, useUploadMedia, useDeleteMedia } from '../../../src/hooks/useMedia'
import { useCampaigns, useAddMediaToCampaign } from '../../../src/hooks/useCampaigns' 
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import EmptyState from '../../../components/shared/EmptyState'
import { Image, Upload, Trash2, Plus, Sparkles, X, ChevronDown, Layout, Maximize2 } from 'lucide-react'
import { toast } from 'sonner'
import { Media } from '../../../src/types/media.types'
import { formatDate } from '../../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function MediaPage() {
  const router = useRouter()
  const { data: media, isLoading } = useMedia()
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia()
  const { mutate: deleteMedia } = useDeleteMedia()
  
  const { data: campaignsResponse } = useCampaigns();
  const { mutate: addMediaToCampaign } = useAddMediaToCampaign();

  const campaigns = (() => {
    const resp = campaignsResponse as any;
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    return [];
  })();

  const [selectedImage, setSelectedImage] = useState<Media | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    uploadMedia(file, {
      onSuccess: () => toast.success('File uploaded successfully!'),
      onError: () => toast.error('Failed to upload file'),
    })
  }

  const handleDelete = (id: string) => {
    deleteMedia(id, {
      onSuccess: () => toast.success('File deleted!'),
      onError: () => toast.error('Failed to delete file'),
    })
  }

  if (isLoading) return <LoadingSpinner />

  // Warm, Earthy Tones to match the light brown background
  const warmGradients = [
    'linear-gradient(135deg, #7f1d1d 0%, #b45309 100%)', // Red to Amber
    'linear-gradient(135deg, #451a03 0%, #92400e 100%)', // Deep Brown to Orange
    'linear-gradient(135deg, #78350f 0%, #d97706 100%)', // Amber variant
  ]

  return (
    <div className="min-h-screen pb-20 px-6 lg:px-10" style={{ backgroundColor: '#F5F2ED' }}>
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-12 pt-8">
          <motion.div className="flex items-end justify-between" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-900 shadow-lg shadow-red-900/20">
                  <Image className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-black text-red-950 uppercase tracking-tighter">Media Studio</h1>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Curate your high-end visual assets</p>
            </div>

            <div className="flex gap-4">
              <motion.button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-red-900 shadow-xl shadow-red-900/20"
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Add Media'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] as File)} />

        {!media || media.length === 0 ? (
          <EmptyState icon={Sparkles} title="No media yet" description="Upload your professional shots to start building campaigns." />
        ) : (
          /* True Masonry Grid */
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {media.map((item: Media, index: number) => (
                <motion.div
                  key={item.id}
                  className="break-inside-avoid relative group rounded-[2.5rem] p-3 border border-white/50 bg-white/40 backdrop-blur-sm shadow-sm hover:shadow-2xl transition-all"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {/* Media Wrapper */}
                  <div className="relative rounded-[2rem] overflow-hidden cursor-pointer group-hover:shadow-lg transition-all" onClick={() => setSelectedImage(item)}>
                    <img 
                      src={`http://localhost:3001${item.url}`} 
                      alt={item.originalName} 
                      className="w-full h-auto object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-red-950/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-4">
                      <div className="flex justify-end">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                           <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-amber-400 w-4 h-4" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">View Asset</span>
                      </div>
                    </div>
                  </div>

                  {/* Details & Actions */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[11px] font-black text-red-950 truncate max-w-[150px] uppercase tracking-tighter">{item.originalName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(item.createdAt)}</p>
                      </div>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-md transition-transform active:scale-95"
                        style={{ background: warmGradients[index % warmGradients.length] }}
                      >
                        <span className="flex items-center gap-2"><Layout className="w-3 h-3" /> Add to Campaign</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {activeDropdown === item.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute bottom-full left-0 w-full mb-3 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                          >
                            <div className="max-h-40 overflow-y-auto custom-scrollbar">
                              {campaigns.length > 0 ? (
                                campaigns.map((camp: any) => (
                                  <button 
                                    key={camp.id} 
                                    className="w-full text-left px-4 py-3 text-[10px] font-bold text-slate-600 hover:bg-orange-50 hover:text-red-900 rounded-xl transition-colors uppercase tracking-widest"
                                    onClick={() => {
                                      addMediaToCampaign({ campaignId: camp.id, mediaId: item.id }, {
                                        onSuccess: () => {
                                          toast.success(`Moved to ${camp.name}`);
                                          setActiveDropdown(null);
                                        }
                                      })
                                    }}
                                  >
                                    {camp.name}
                                  </button>
                                ))
                              ) : (
                                <button onClick={() => router.push('/campaigns')} className="w-full py-3 text-[10px] font-black text-red-900 uppercase tracking-widest">Create First Campaign</button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Fullscreen Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-red-950/95 flex items-center justify-center p-6 backdrop-blur-xl"
              onClick={() => setSelectedImage(null)}
            >
              <button className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors">
                <X className="w-10 h-10" />
              </button>
              <motion.img 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                src={`http://localhost:3001${selectedImage.url}`} 
                className="max-w-full max-h-full rounded-3xl shadow-2xl border-4 border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}