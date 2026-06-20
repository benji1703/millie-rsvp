import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'בריתה מילי ארביב',
  description: 'הזמנה אישית לחגיגת בריתה מילי ארביב',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white border border-parchment rounded-2xl shadow-paper p-8 text-center animate-fade-up">

        <div className="divider-ornament mb-7">✦</div>

        <h1 className="font-serif text-5xl font-normal text-charcoal mb-1 leading-snug">
          מילי ארביב
        </h1>
        <p className="font-serif text-2xl font-normal text-charcoal/70 mb-1">
          בריתה
        </p>
        <p className="font-sans text-xs text-gold tracking-widest mb-7">
          3.7.2026
        </p>

        <div className="divider-ornament mb-7">✦</div>

        <p className="font-sans text-sm text-charcoal/60 leading-relaxed mb-1.5">
          דף זה מיועד להזמנות אישיות בלבד.
        </p>
        <p className="font-sans text-sm text-charcoal/60 leading-relaxed">
          הקישור לאישורי ההגעה ישלח ישירות על ידי משפחת ארביב.
        </p>

        <div className="divider-ornament mt-7 mb-5">✦</div>

        <p className="font-sans text-xs text-gold tracking-widest">
          משפחת ארביב
        </p>

      </div>
    </div>
  )
}
