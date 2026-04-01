'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  Megaphone,
  BarChart3,
  Image,
  Settings,
  LogOut,
  Trash2,
  X,
  User,
  ChevronRight,
} from 'lucide-react'
import { useMe, useLogout, useDeleteMe } from '../../src/hooks/useAuth'
import { getInitials } from '../../lib/utils'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ai', label: 'Generate Ad', icon: Sparkles },
  { href: '/ads', label: 'My Ads', icon: Megaphone },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/media', label: 'Media', icon: Image },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: user } = useMe()
  const { logout } = useLogout()
  const { mutate: deleteAccount } = useDeleteMe()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        toast.success('Account deleted successfully')
        router.push('/login')
      },
      onError: () => {
        toast.error('Failed to delete account')
      },
    })
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '280px',
          backgroundColor: '#0f172a',
          borderRight: '1px solid #1e293b',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#0d9488' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">AdsGenerator</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div
          className="p-4 mx-4 mt-4 rounded-xl"
          style={{ backgroundColor: '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: '#0d9488' }}
            >
              {user?.name ? getInitials(user.name) : <User className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: '#94a3b8' }}>
                {user?.email || ''}
              </p>
            </div>
            <Link href="/settings">
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: isActive ? '#0d9488' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#1e293b'
                    e.currentTarget.style.color = '#ffffff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }
                }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div
          className="p-4 border-t space-y-1"
          style={{ borderColor: '#1e293b' }}
        >
          {/* Settings */}
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full"
            style={{ color: '#94a3b8' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => { logout(); onClose() }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full"
            style={{ color: '#94a3b8' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>

          {/* Delete Account */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full"
              style={{ color: '#f87171' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d1515'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium text-sm">Delete Account</span>
            </button>
          ) : (
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: '#2d1515' }}
            >
              <p className="text-xs text-red-400 mb-2">
                Are you sure? This cannot be undone!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}