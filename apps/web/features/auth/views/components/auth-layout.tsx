'use client'

import { useState, useEffect } from 'react'

const SLIDES = [
  {
    title: 'Analyse de données financières',
    description: 'Visualisez et interprétez vos portefeuilles en temps réel avec des tableaux de bord intuitifs.',
    stat: '2M+',
    statLabel: 'données traitées / jour',
    gradient: 'from-[#534AB7] to-[#7C74D6]',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
        <rect x="8" y="40" width="12" height="32" rx="2" fill="white" fillOpacity="0.3" />
        <rect x="24" y="28" width="12" height="44" rx="2" fill="white" fillOpacity="0.5" />
        <rect x="40" y="16" width="12" height="56" rx="2" fill="white" fillOpacity="0.7" />
        <rect x="56" y="24" width="12" height="48" rx="2" fill="white" fillOpacity="0.9" />
        <path d="M8 36 L24 24 L40 12 L56 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="36" r="3" fill="white" />
        <circle cx="24" cy="24" r="3" fill="white" />
        <circle cx="40" cy="12" r="3" fill="white" />
        <circle cx="56" cy="20" r="3" fill="white" />
      </svg>
    ),
  },
  {
    title: 'Rapports automatisés',
    description: 'Générez des rapports PDF et Excel professionnels en un clic, prêts à être partagés.',
    stat: '98%',
    statLabel: 'de précision sur les exports',
    gradient: 'from-[#3D35A0] to-[#534AB7]',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
        <rect x="16" y="8" width="48" height="60" rx="4" fill="white" fillOpacity="0.2" />
        <rect x="16" y="8" width="48" height="60" rx="4" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
        <rect x="24" y="22" width="32" height="3" rx="1.5" fill="white" fillOpacity="0.8" />
        <rect x="24" y="31" width="24" height="3" rx="1.5" fill="white" fillOpacity="0.6" />
        <rect x="24" y="40" width="28" height="3" rx="1.5" fill="white" fillOpacity="0.6" />
        <rect x="24" y="49" width="20" height="3" rx="1.5" fill="white" fillOpacity="0.4" />
        <circle cx="56" cy="56" r="14" fill="white" fillOpacity="0.15" />
        <path d="M50 56 L54 60 L62 52" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Collaboration d\'équipe',
    description: 'Invitez vos collaborateurs, gérez les accès et travaillez ensemble sur vos analyses.',
    stat: '500+',
    statLabel: 'institutions utilisatrices',
    gradient: 'from-[#6B63CC] to-[#8B84E0]',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
        <circle cx="28" cy="28" r="12" fill="white" fillOpacity="0.3" />
        <circle cx="52" cy="28" r="12" fill="white" fillOpacity="0.3" />
        <circle cx="40" cy="44" r="12" fill="white" fillOpacity="0.5" />
        <path d="M16 60 C16 52 21 48 28 48" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M64 60 C64 52 59 48 52 48" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 60 C28 54 33 50 40 50 C47 50 52 54 52 60" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length)
        setAnimating(false)
      }, 400)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]

  return (
    <div className="min-h-screen flex">
      {/* Left panel — slider */}
      <div
        className={`hidden lg:flex flex-col justify-between w-[52%] bg-gradient-to-br ${slide.gradient} transition-all duration-700 p-12 relative overflow-hidden`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm text-white font-bold text-xl px-4 py-2 rounded-xl border border-white/20">
              BARTHE
            </div>
            <span className="text-white/60 text-sm font-medium">Platform</span>
          </div>
        </div>

        {/* Slide content */}
        <div
          className={`relative z-10 transition-all duration-400 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        >
          <div className="mb-8">{slide.icon}</div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {slide.title}
          </h2>
          <p className="text-white/75 text-lg leading-relaxed mb-8">
            {slide.description}
          </p>

          {/* Stat */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 inline-block">
            <div className="text-4xl font-black text-white">{slide.stat}</div>
            <div className="text-white/65 text-sm mt-0.5">{slide.statLabel}</div>
          </div>
        </div>

        {/* Dots */}
        <div className="relative z-10 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F4F0] p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="bg-[#534AB7] text-white font-bold text-xl px-4 py-2 rounded-xl">
              BARTHE
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
