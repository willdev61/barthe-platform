'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3, Upload, Brain, FileText, GitCompareArrows,
  Shield, ChevronRight, Star, CheckCircle2, TrendingUp,
  ArrowRight, Zap, Globe, Lock, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Scroll reveal hook ──────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ── Animated counter ────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const duration = 1800
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setVal(Math.floor(ease * to))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to])
  return <span ref={ref}>{val}{suffix}</span>
}

// ── Testimonials slider ─────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "BARTHE a transformé notre processus d'analyse. Ce qui prenait 3 jours se fait maintenant en 20 minutes avec une précision que nous n'avions jamais atteinte.",
    author: "Mamadou Diallo",
    role: "Directeur Crédit, BDI Sénégal",
    rating: 5,
  },
  {
    quote: "Les ratios financiers générés par l'IA sont d'une qualité remarquable. Nos analystes se concentrent désormais sur la décision, pas sur les calculs.",
    author: "Aïssatou Traoré",
    role: "Responsable Analyse, BCEAO Côte d'Ivoire",
    rating: 5,
  },
  {
    quote: "Le rapport PDF est directement présentable aux comités de crédit. Un gain de temps et de crédibilité considérable pour nos équipes.",
    author: "Kofi Mensah",
    role: "Chef de Projet Financement, BRVM Ghana",
    rating: 5,
  },
]

function TestimonialSlider() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % TESTIMONIALS.length)
        setAnimating(false)
      }, 400)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const t = TESTIMONIALS[current]

  return (
    <div className="relative">
      <div
        className={cn(
          'transition-all duration-400',
          animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
        )}
      >
        <div className="flex gap-1 mb-5">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <blockquote className="text-xl lg:text-2xl text-foreground font-medium leading-relaxed mb-6">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <div>
          <p className="font-semibold text-foreground">{t.author}</p>
          <p className="text-sm text-muted-foreground">{t.role}</p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-8">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground'
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── Feature card ────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, title, description, delay = 0,
}: {
  icon: React.ElementType; title: string; description: string; delay?: number
}) {
  return (
    <div
      className="reveal group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

// ── Step card ───────────────────────────────────────────────────────
function StepCard({ step, title, description, icon: Icon }: {
  step: number; title: string; description: string; icon: React.ElementType
}) {
  return (
    <div className="reveal relative flex gap-5">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0 animate-pulse-ring">
          {step}
        </div>
        {step < 4 && <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent mt-2" />}
      </div>
      <div className="pb-10">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Mock dashboard card ─────────────────────────────────────────────
function MockScoreCard() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-border/50 p-5 w-56">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score global</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-score-favorable-bg text-score-favorable font-medium">Favorable</span>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-4xl font-bold text-score-favorable">82</span>
        <span className="text-muted-foreground text-sm mb-1">/100</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-score-favorable rounded-full" style={{ width: '82%' }} />
      </div>
    </div>
  )
}

function MockRatioCard({ label, value, status }: { label: string; value: string; status: 'ok' | 'warn' }) {
  return (
    <div className="bg-white rounded-xl shadow-lg shadow-black/5 border border-border/50 p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full',
        status === 'ok' ? 'bg-score-favorable-bg' : 'bg-score-reserve-bg'
      )}>
        {status === 'ok'
          ? <CheckCircle2 className="w-4 h-4 text-score-favorable" />
          : <TrendingUp className="w-4 h-4 text-score-reserve" />}
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────
export default function LandingPage() {
  useReveal()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">BARTHE</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Fonctionnalités', 'Comment ça marche', 'Témoignages'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-').replace(/[àá]/g, 'a').replace(/ç/g, 'c').replace(/[éèê]/g, 'e').replace("'", '-')}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Se connecter
            </Link>
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Demander une démo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-border px-6 py-4 space-y-3">
            {['Fonctionnalités', 'Comment ça marche', 'Témoignages'].map((item) => (
              <a key={item} href="#" className="block text-sm text-muted-foreground py-1" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" className="text-center py-2 text-sm font-medium border border-border rounded-lg">Se connecter</Link>
              <Link href="/login" className="text-center py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg">Demander une démo</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[oklch(0.2_0.1_275)] to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.45_0.18_275/0.3),transparent)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(oklch(1_0_0/1) 1px, transparent 1px), linear-gradient(90deg, oklch(1_0_0/1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6 animate-fade-in">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Propulsé par l&apos;IA · Afrique francophone</span>
            </div>

            <h1
              className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-up"
              style={{ animationDelay: '100ms' }}
            >
              Analysez vos{' '}
              <span
                className="animate-gradient"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #6366f1, #818cf8, #a78bfa)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Business Plans
              </span>{' '}
              en 20 minutes
            </h1>

            <p
              className="text-lg text-slate-300 leading-relaxed mb-10 max-w-lg animate-fade-up"
              style={{ animationDelay: '200ms' }}
            >
              BARTHE automatise l&apos;analyse financière des Business Plans pour les institutions de financement en Afrique. Upload Excel → Analyse LLM → Score → Rapport PDF.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                Démarrer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#comment-ca-marche"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl font-medium hover:bg-white/15 transition-colors text-sm"
              >
                Voir la démo
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Trust badges */}
            <div
              className="flex flex-wrap items-center gap-6 mt-10 animate-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              {[
                { icon: Shield, label: 'Données sécurisées' },
                { icon: Globe, label: 'Multi-pays' },
                { icon: Lock, label: 'RGPD compliant' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-slate-400 text-xs">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating cards */}
          <div className="hidden lg:flex items-center justify-center relative h-[480px]">
            {/* Main card */}
            <div className="absolute animate-float">
              <MockScoreCard />
            </div>

            {/* Ratio cards */}
            <div className="absolute top-8 right-0 animate-float-delayed w-52">
              <MockRatioCard label="Taux EBITDA" value="24.3%" status="ok" />
            </div>
            <div className="absolute bottom-16 right-4 animate-float w-52" style={{ animationDelay: '0.8s' }}>
              <MockRatioCard label="Levier financier" value="2.1x" status="ok" />
            </div>
            <div className="absolute top-20 left-0 animate-float-delayed w-52">
              <MockRatioCard label="DSCR" value="1.05x" status="warn" />
            </div>

            {/* Glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-75" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 animate-bounce">
          <span className="text-xs">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-400 to-transparent" />
        </div>
      </section>

      {/* ── Stats marquee ── */}
      <section className="bg-primary py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              {[
                '✦ 500+ dossiers analysés',
                '✦ 20 min par analyse',
                '✦ 98% de précision',
                '✦ 12 pays couverts',
                '✦ 50+ institutions clientes',
                '✦ Rapports PDF en 1 clic',
                '✦ Analyse LLM avancée',
                '✦ Support 24/7',
              ].map((item) => (
                <span key={item} className="text-sm font-medium text-primary-foreground opacity-90">{item}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats section ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 500, suffix: '+', label: 'Dossiers analysés', desc: 'Chaque mois' },
              { value: 98, suffix: '%', label: 'Précision LLM', desc: 'Validée par experts' },
              { value: 20, suffix: ' min', label: 'Temps moyen', desc: 'Par analyse complète' },
              { value: 12, suffix: '', label: 'Pays couverts', desc: 'Afrique francophone' },
            ].map(({ value, suffix, label, desc }, i) => (
              <div key={i} className="reveal text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                <p className="text-4xl lg:text-5xl font-bold text-primary mb-1">
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="fonctionnalites" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Fonctionnalités</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-4">
              Tout ce dont votre institution a besoin
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              De l&apos;import du fichier Excel à la génération du rapport PDF, BARTHE prend en charge l&apos;intégralité du processus d&apos;analyse.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard delay={0} icon={Upload} title="Import Excel & PDF" description="Uploadez vos Business Plans en format Excel ou PDF. Notre moteur de parsing extrait automatiquement toutes les données financières." />
            <FeatureCard delay={100} icon={Brain} title="Analyse LLM avancée" description="L'IA normalise, calcule les ratios clés (EBITDA, DSCR, levier) et génère une synthèse narrative complète en français." />
            <FeatureCard delay={200} icon={TrendingUp} title="Score & notation" description="Chaque dossier reçoit un score de 0 à 100 avec classification Favorable / Réservé / Défavorable basé sur vos seuils personnalisés." />
            <FeatureCard delay={0} icon={FileText} title="Rapport PDF automatique" description="Générez des rapports PDF professionnels prêts pour les comités de crédit, avec logo, ratios, alertes et synthèse IA." />
            <FeatureCard delay={100} icon={GitCompareArrows} title="Comparatif multi-dossiers" description="Comparez jusqu'à 5 Business Plans côte à côte avec tableau de bord et graphiques radar pour une prise de décision éclairée." />
            <FeatureCard delay={200} icon={Shield} title="Audit & traçabilité" description="Chaque action est tracée dans un journal d'audit complet. Conformité totale avec les exigences réglementaires bancaires." />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="comment-ca-marche" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="reveal">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Comment ça marche</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-6">
                  De l&apos;upload au rapport en 4 étapes
                </h2>
                <p className="text-muted-foreground mb-12">
                  Un workflow entièrement automatisé qui élimine les tâches répétitives et vous permet de vous concentrer sur la décision.
                </p>
              </div>

              <div>
                <StepCard step={1} icon={Upload} title="Uploadez le Business Plan" description="Importez le fichier Excel ou PDF du Business Plan. Notre parser intelligent reconnaît automatiquement la structure." />
                <StepCard step={2} icon={Brain} title="L'IA analyse les données" description="Le moteur LLM normalise les données, calcule 8 ratios financiers clés et identifie les alertes critiques." />
                <StepCard step={3} icon={TrendingUp} title="Score et recommandations" description="Obtenez un score global 0-100 avec classification et recommandations basées sur vos seuils personnalisés." />
                <StepCard step={4} icon={FileText} title="Rapport PDF généré" description="Téléchargez le rapport PDF complet avec votre logo, prêt à être présenté au comité de crédit." />
              </div>
            </div>

            {/* Visual mockup */}
            <div className="reveal hidden lg:block sticky top-24">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
                <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                  {/* Mock header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="flex-1 mx-4 h-5 bg-muted rounded-md" />
                  </div>
                  {/* Mock content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-40 bg-muted rounded-lg" />
                      <div className="px-3 py-1 bg-score-favorable-bg text-score-favorable text-xs font-semibold rounded-full">Favorable · 82/100</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "CA", val: "425M FCFA" },
                        { label: "EBITDA", val: "103M FCFA" },
                        { label: "DSCR", val: "1.8x" },
                        { label: "Levier", val: "2.1x" },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-muted/40 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="font-bold text-foreground mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded-full w-full" />
                      <div className="h-3 bg-muted rounded-full w-4/5" />
                      <div className="h-3 bg-muted rounded-full w-3/4" />
                    </div>
                    <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
                      Télécharger le rapport PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="temoignages" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Témoignages</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-8">
                Ils nous font confiance
              </h2>
              <TestimonialSlider />
            </div>

            {/* Stats panel */}
            <div className="reveal grid grid-cols-2 gap-4">
              {[
                { value: '3j → 20min', label: 'Temps d\'analyse réduit', color: 'bg-primary/5 border-primary/20' },
                { value: '98%', label: 'Taux de satisfaction client', color: 'bg-score-favorable-bg border-score-favorable/20' },
                { value: '50+', label: 'Institutions clientes', color: 'bg-blue-50 border-blue-200' },
                { value: '12 pays', label: 'Présence en Afrique', color: 'bg-amber-50 border-amber-200' },
              ].map(({ value, label, color }, i) => (
                <div key={i} className={cn('rounded-2xl border p-6', color)} style={{ transitionDelay: `${i * 80}ms` }}>
                  <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[oklch(0.2_0.1_275)] to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,oklch(0.45_0.18_275/0.25),transparent)]" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6 text-xs font-medium text-primary">
              <Zap className="w-3.5 h-3.5" />
              Démarrez en moins de 5 minutes
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Prêt à transformer votre analyse crédit ?
            </h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">
              Rejoignez plus de 50 institutions financières en Afrique qui utilisent BARTHE pour analyser leurs Business Plans plus rapidement et plus précisément.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                Démarrer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:contact@barthe.app"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-medium hover:bg-white/15 transition-colors text-sm"
              >
                Contacter l&apos;équipe
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-white font-bold">BARTHE</span>
                <p className="text-xs text-slate-500">Analyse de Business Plans · Afrique</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Se connecter</Link>
              <a href="mailto:contact@barthe.app" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Confidentialité</a>
            </div>

            <p className="text-xs text-slate-600">© 2026 BARTHE · Tous droits réservés</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
