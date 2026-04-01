'use client'

import { useAds } from '../../../src/hooks/useAds'
import { useCampaigns } from '../../../src/hooks/useCampaigns'
import PageHeader from '../../../components/shared/PageHeader'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { BarChart3, Megaphone, MousePointer, Eye, TrendingUp, Coffee } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function AnalyticsPage() {
  const { data: adsData, isLoading: adsLoading } = useAds()
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns()

  if (adsLoading || campaignsLoading) return <LoadingSpinner />

  const ads = Array.isArray(adsData) ? adsData : (adsData as any)?.data || []
  const campaigns = Array.isArray(campaignsData) ? campaignsData : (campaignsData as any)?.data || []

  // Platform distribution
  const platformData = ads.reduce((acc: any, ad: any) => {
    const existing = acc.find((p: any) => p.platform === ad.platform)
    if (existing) existing.count++
    else acc.push({ platform: ad.platform, count: 1 })
    return acc
  }, [])

  // Status distribution
  const statusData = ads.reduce((acc: any, ad: any) => {
    const existing = acc.find((s: any) => s.status === ad.status)
    if (existing) existing.count++
    else acc.push({ status: ad.status, count: 1 })
    return acc
  }, [])

  const totalAds = ads.length
  const totalCampaigns = campaigns.length
  const publishedAds = ads.filter((a: any) => a.status === 'ACTIVE' || a.status === 'PUBLISHED').length
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'ACTIVE' || c.status === 'PUBLISHED').length

  // Deep Grey & Coffee Palette
  const stats = [
    { label: 'Total Ads', value: totalAds, icon: Megaphone, color: '#1C1917' }, // Stone-900 (Deep Grey)
    { label: 'Published Ads', value: publishedAds, icon: TrendingUp, color: '#78716c' }, // Stone-500
    { label: 'Total Campaigns', value: totalCampaigns, icon: Coffee, color: '#44403c' }, // Stone-800
    { label: 'Active Campaigns', value: activeCampaigns, icon: MousePointer, color: '#A8A29E' }, // Stone-400
  ]

  return (
    <div className="min-h-screen p-6 lg:p-10" style={{ backgroundColor: '#F5F2ED' }}>
      <PageHeader
        title="Insights"
        description="Metric overview of your creative vault"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-[2rem] border-4 border-white p-6 transition-all hover:shadow-xl bg-white/50 backdrop-blur-sm shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: '#f1f5f9' }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-3xl font-black mb-1 text-[#1C1917] tracking-tighter">
                {stat.value}
              </p>
              <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em]">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Platform Distribution */}
        <div className="rounded-[2.5rem] border-4 border-white p-8 bg-white shadow-sm">
          <h3 className="font-black text-xs mb-8 text-[#1C1917] uppercase tracking-[0.3em]">
            Deployment by Platform
          </h3>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="platform"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#A8A29E', fontWeight: 'bold' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} />
                <Tooltip
                  cursor={{ fill: '#F5F2ED' }}
                  contentStyle={{
                    backgroundColor: '#1C1917',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#1C1917" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 opacity-20">
              <Eye className="w-10 h-10 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Data</p>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="rounded-[2.5rem] border-4 border-white p-8 bg-white shadow-sm">
          <h3 className="font-black text-xs mb-8 text-[#1C1917] uppercase tracking-[0.3em]">
            Lifecycle Distribution
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#A8A29E', fontWeight: 'bold' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} />
                <Tooltip
                  cursor={{ fill: '#F5F2ED' }}
                  contentStyle={{
                    backgroundColor: '#1C1917',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#78716c" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 opacity-20">
              <BarChart3 className="w-10 h-10 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Active Flows</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}