import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: '#f0fdfa' }}
      >
        <Icon className="w-8 h-8" style={{ color: '#0d9488' }} />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#0f172a' }}>{title}</h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: '#64748b' }}>{description}</p>
      {action && action}
    </div>
  )
}