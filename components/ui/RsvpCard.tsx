interface Props {
  children: React.ReactNode
  centered?: boolean
  padding?: string
}

export default function RsvpCard({ children, centered = true, padding = 'p-8' }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 120% 90% at 50% 30%, #FFFFFF 0%, #EDE6D8 60%, #E0D5C5 100%)',
      }}
    >
      {/* Ambient glow blob — top */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '40vw',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.028,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      {/* Glass card */}
      <div
        className={`relative w-full max-w-sm rounded-[28px] ${padding} animate-fade-up${centered ? ' text-center' : ''}`}
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(40px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
          boxShadow: '0 2px 0 0 rgba(255,255,255,0.8) inset, 0 4px 6px rgba(0,0,0,0.02), 0 12px 32px rgba(0,0,0,0.06), 0 40px 96px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
