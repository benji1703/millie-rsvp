'use client'
import { useState, useEffect } from 'react'
import type { Guest } from '@/types'
import LandingStep from './LandingStep'
import RsvpFormStep from './RsvpFormStep'
import ThankYouStep from './ThankYouStep'

type Step = 'landing' | 'form' | 'thanks'

interface Props {
  guest: Guest
}

export default function RsvpFlow({ guest }: Props) {
  const alreadyRsvpd = guest.rsvp_status !== 'pending'
  const [step, setStep] = useState<Step>(alreadyRsvpd ? 'thanks' : 'landing')

  useEffect(() => {
    fetch('/api/rsvp/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: guest.id }),
    }).catch(() => {})
  }, [guest.id])
  const [attended, setAttended] = useState(guest.rsvp_status !== 'declined')
  const [count, setCount] = useState(guest.guest_count ?? 1)
  const [childrenCount, setChildrenCount] = useState(guest.children_count ?? 0)
  const [declining, setDeclining] = useState(false)

  async function handleDecline() {
    setDeclining(true)
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: guest.id, attending: false, guestCount: 0, childrenCount: 0 }),
    })
    setAttended(false)
    setStep('thanks')
  }

  if (step === 'landing') {
    return (
      <LandingStep
        guestName={guest.name}
        onConfirm={() => setStep('form')}
        onDecline={handleDecline}
        declining={declining}
        existingStatus={guest.rsvp_status}
      />
    )
  }

  if (step === 'form') {
    return (
      <RsvpFormStep
        guestId={guest.id}
        defaultCount={guest.guest_count ?? 1}
        defaultChildrenCount={guest.children_count ?? 0}
        childrenAllowed={guest.children_allowed}
        onSuccess={(gc, cc) => {
          setAttended(true)
          setCount(gc)
          setChildrenCount(cc)
          setStep('thanks')
        }}
      />
    )
  }

  return (
    <ThankYouStep
      attending={attended}
      guestCount={count}
      childrenCount={childrenCount}
      onChangeResponse={() => setStep('landing')}
    />
  )
}
