interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>{title}</h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>{description}</p>
        )}
      </div>
      {action && action}
    </div>
  )
}