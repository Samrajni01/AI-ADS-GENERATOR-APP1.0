'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Lock, Globe, Loader2 } from 'lucide-react'
import { useMe, useUpdateMe, useChangePassword } from '../../../src/hooks/useAuth'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { getInitials } from '../../../lib/utils'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
})

const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'Required'),
  newPassword: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
]

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { data: user, isLoading } = useMe()
  const { mutate: updateMe, isPending: isUpdating } = useUpdateMe()
  const { mutate: changePassword, isPending: isChanging } = useChangePassword()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'language'>('profile')
  const [selectedLang, setSelectedLang] = useState('en')

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = (data: ProfileForm) => {
    updateMe(data, {
      onSuccess: () => toast.success('Profile updated!'),
      onError: () => toast.error('Failed to update profile'),
    })
  }

  const onPasswordSubmit = (data: PasswordForm) => {
    changePassword(
      { oldPassword: data.oldPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success('Password changed!')
          resetPassword()
        },
        onError: () => toast.error('Failed to change password'),
      },
    )
  }

  if (isLoading) return <LoadingSpinner />

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'language', label: 'Language', icon: Globe },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          Manage your account settings
        </p>
      </div>

      {/* Avatar */}
      <div
        className="rounded-2xl border p-6 mb-6 flex items-center gap-4"
        style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ backgroundColor: '#0d9488' }}
        >
          {user?.name ? getInitials(user.name) : <User className="w-8 h-8" />}
        </div>
        <div>
          <p className="font-bold text-lg" style={{ color: '#0f172a' }}>
            {user?.name || 'User'}
          </p>
          <p className="text-sm" style={{ color: '#64748b' }}>
            {user?.email}
          </p>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
            style={{
              backgroundColor: user?.isVerified ? '#dcfce7' : '#fef9c3',
              color: user?.isVerified ? '#166534' : '#854d0e',
            }}
          >
            {user?.isVerified ? '✓ Verified' : '⚠ Not Verified'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6"
        style={{ backgroundColor: '#f1f5f9' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab.key ? '#ffffff' : 'transparent',
                color: activeTab === tab.key ? '#0d9488' : '#64748b',
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
        >
          <h3 className="font-bold text-lg mb-6" style={{ color: '#0f172a' }}>
            Profile Information
          </h3>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f172a' }}>
                Full Name
              </label>
              <input
                {...profileRegister('name')}
                type="text"
                className="w-full px-4 py-3 rounded-xl outline-none border transition-all focus:border-teal-500"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}
              />
              {profileErrors.name && (
                <p className="text-red-400 text-xs mt-1">{profileErrors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f172a' }}>
                Email
              </label>
              <input
                {...profileRegister('email')}
                type="email"
                className="w-full px-4 py-3 rounded-xl outline-none border transition-all focus:border-teal-500"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}
              />
              {profileErrors.email && (
                <p className="text-red-400 text-xs mt-1">{profileErrors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f172a' }}>
                Phone
              </label>
              <input
                type="text"
                placeholder="Add your phone number"
                className="w-full px-4 py-3 rounded-xl outline-none border transition-all focus:border-teal-500"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#0d9488' }}
            >
              {isUpdating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
        >
          <h3 className="font-bold text-lg mb-6" style={{ color: '#0f172a' }}>
            Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f172a' }}>
                Current Password
              </label>
              <input
                {...passwordRegister('oldPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl outline-none border transition-all focus:border-teal-500"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}
              />
              {passwordErrors.oldPassword && (
                <p className="text-red-400 text-xs mt-1">{passwordErrors.oldPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f172a' }}>
                New Password
              </label>
              <input
                {...passwordRegister('newPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl outline-none border transition-all focus:border-teal-500"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#0f172a' }}>
                Confirm New Password
              </label>
              <input
                {...passwordRegister('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl outline-none border transition-all focus:border-teal-500"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isChanging}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#0d9488' }}
            >
              {isChanging ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Language Tab */}
      {activeTab === 'language' && (
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
        >
          <h3 className="font-bold text-lg mb-6" style={{ color: '#0f172a' }}>
            Language Preference
          </h3>
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code)
                  toast.success(`Language changed to ${lang.label}`)
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                style={{
                  borderColor: selectedLang === lang.code ? '#0d9488' : '#e2e8f0',
                  backgroundColor: selectedLang === lang.code ? '#f0fdfa' : '#f8fafc',
                }}
              >
                <span className="font-medium text-sm" style={{ color: '#0f172a' }}>
                  {lang.label}
                </span>
                {selectedLang === lang.code && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#ccfbf1', color: '#0d9488' }}
                  >
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}