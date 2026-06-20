const WAZE_URL = 'https://waze.com/ul?q=%D7%97%D7%A0%D7%99%D7%95%D7%9F+%D7%9E%D7%A8%D7%98%D7%99%D7%9F+%D7%93%D7%A8%D7%95%D7%A7%D7%A8+%D7%A8%D7%A2%D7%A0%D7%A0%D7%94&navigate=yes'

export default function WazeButton() {
  return (
    <a
      href={WAZE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full border border-black/[0.10] hover:border-black/20 active:scale-95 transition-all text-[12px] font-sans font-light text-charcoal/50 hover:text-charcoal/75 touch-manipulation select-none"
    >
      <svg width="14" height="14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 4C17.6 4 6 15.6 6 30c0 8.4 4 15.8 10.2 20.6L14 56l6.2-2c3.6 1.4 7.6 2 11.8 2 14.4 0 26-11.6 26-26S46.4 4 32 4z" fill="#33CCFF" stroke="#1A1A1A" strokeWidth="2"/>
        <circle cx="24" cy="30" r="3" fill="#1A1A1A"/>
        <circle cx="40" cy="30" r="3" fill="#1A1A1A"/>
        <path d="M24 38c2 3 14 3 16 0" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      נווט בוויז
    </a>
  )
}
