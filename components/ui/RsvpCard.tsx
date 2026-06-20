interface Props {
  children: React.ReactNode
  centered?: boolean
  padding?: string
}

export default function RsvpCard({ children, centered = true, padding = 'p-8' }: Props) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-5">
      <div className={`w-full max-w-sm bg-white border border-parchment rounded-2xl shadow-paper ${padding} animate-fade-up${centered ? ' text-center' : ''}`}>
        {children}
      </div>
    </div>
  )
}
