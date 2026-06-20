'use client'
import { signIn } from 'next-auth/react'
import RsvpCard from '@/components/ui/RsvpCard'

export default function LoginPage() {
  return (
    <RsvpCard>
      <div className="divider-line w-10 mx-auto mb-8" />
      <h1 className="font-serif text-3xl font-light text-charcoal mb-2">ניהול הזמנות</h1>
      <p className="font-sans text-sm text-charcoal/65 tracking-[0.08em] mb-8">בריתה מילי ארביב</p>
      <button
        onClick={() => signIn('google', { callbackUrl: '/admin' })}
        className="btn-primary w-full py-4 px-6"
      >
        התחבר עם Google
      </button>
      <div className="divider-line w-10 mx-auto mt-8" />
    </RsvpCard>
  )
}
