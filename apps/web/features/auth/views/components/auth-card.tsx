interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0]">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#534AB7] text-white font-bold text-lg px-4 py-2 rounded-lg mb-4">
            BARTHE
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
