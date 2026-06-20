'use client'
import { signIn } from 'next-auth/react'
import RsvpCard from '@/components/ui/RsvpCard'

export default function LoginPage() {
  return (
    <RsvpCard>
      <div className="divider-ornament mb-8">✦</div>
      <h1 className="font-serif text-3xl font-normal text-charcoal mb-2">ניהול הזמנות</h1>
      <p className="font-sans text-xs text-gold tracking-widest mb-8">בריתה מילי ארביב</p>
      <button
        onClick={() => signIn('google', { callbackUrl: '/admin' })}
        className="btn-primary w-full py-4 px-6"
      >
        התחבר עם Google
      </button>
      <div className="divider-ornament mt-8">✦</div>
    </RsvpCard>
  )
}
