'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Bell, Sun, Moon, User, X, MessageCircle, UserPlus, Rocket } from 'lucide-react'
import { useMe } from '../../src/hooks/useAuth'
import { getInitials } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: user } = useMe()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // --- Notification State ---
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)
  const notifications = [
    { id: 1, text: "Hey! How is this app going?", icon: <MessageCircle size={14}/> },
    { id: 2, text: "Refer to your friend!", icon: <UserPlus size={14}/> },
    { id: 3, text: "Are you bored? Create an ad!", icon: <Rocket size={14}/> }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <header className="h-16 border-b bg-background" />

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b bg-background border-border relative z-[100]">
      
      {/* Left — Hamburger */}
      <button
        onClick={onMenuClick}
        className="flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-accent"
      >
        <span className="w-5 h-0.5 bg-foreground rounded-full" />
        <span className="w-5 h-0.5 bg-foreground rounded-full" />
        <span className="w-5 h-0.5 bg-foreground rounded-full" />
      </button>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg transition-colors hover:bg-accent text-muted-foreground"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Bell with Dropdown Logic */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            className={`p-2 rounded-lg transition-all relative ${isNotifyOpen ? 'bg-accent text-teal-600' : 'text-muted-foreground hover:bg-accent'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-600 border-2 border-background" />
          </button>

          <AnimatePresence>
            {isNotifyOpen && (
              <>
                {/* Backdrop to close when clicking outside */}
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifyOpen(false)} />
                
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 bg-popover shadow-xl rounded-xl border border-border z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-border flex justify-between items-center bg-muted/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notifications</span>
                    <X size={14} className="cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => setIsNotifyOpen(false)} />
                  </div>
                  
                  <div className="py-1">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-accent flex gap-3 transition-colors cursor-pointer group">
                        <div className="text-teal-600 mt-0.5 group-hover:scale-110 transition-transform">{n.icon}</div>
                        <p className="text-xs text-foreground font-medium">{n.text}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-2 bg-muted/30 text-center border-t border-border">
                    <button className="text-[10px] font-semibold text-teal-600 hover:underline">Mark all as read</button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <Link href="/settings">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-opacity hover:opacity-80 bg-teal-600 shadow-sm">
            {user?.name ? getInitials(user.name) : <User className="w-4 h-4" />}
          </div>
        </Link>
      </div>
    </header>
  )
}