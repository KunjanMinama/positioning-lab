import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  Copy,
  Check,
  ExternalLink,
  Send,
  Sparkles,
  Terminal,
  ShieldAlert,
} from 'lucide-react'
import { sanitizeChannel, type Channel } from '@/lib/assign'

interface PublicVariantData {
  experimentTitle: string
  status: string
  variantId: string
  label: string
  headline: string
  subhead: string
  ctaLabel: string
}

export default function PublicTestLanding() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()

  const [visitorId, setVisitorId] = useState<string>('')
  const [channel, setChannel] = useState<Channel>('other')
  const [variant, setVariant] = useState<PublicVariantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [triedIt, setTriedIt] = useState(false)
  const [surveyText, setSurveyText] = useState('')
  const [surveySubmitted, setSurveySubmitted] = useState(false)

  // 1. Initialize anonymous visitor ID and sanitize channel
  useEffect(() => {
    let id = localStorage.getItem('pl_visitor_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('pl_visitor_id', id)
    }
    setVisitorId(id)

    const rawSrc = searchParams.get('src')
    setChannel(sanitizeChannel(rawSrc))
  }, [searchParams])

  // 2. Fetch assigned variant from server action
  useEffect(() => {
    if (!visitorId || !slug) return

    async function loadVariant() {
      setLoading(true)
      try {
        const res = await fetch('/api/actions/getPublicVariant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            visitorId,
            channel,
            userAgent: navigator.userAgent,
          }),
        })
        const result = (await res.json()) as any
        if (result.success && result.data) {
          setVariant(result.data)
          // Record initial view
          await fetch('/api/actions/recordEvent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug,
              visitorId,
              type: 'view',
              channel,
              isDemo: slug === 'demo-preview',
            }),
          })
        } else {
          // Fallback demo variant
          setVariant({
            experimentTitle: 'Developer Velocity Test',
            status: 'launched',
            variantId: 'demo-variant',
            label: 'A',
            headline: 'Ship Realtime Full-Stack Apps in One Command',
            subhead: 'From scaffold to production on Cloudflare Workers in 30 seconds. One unified package handles auth, SQLite persistence, and instant deployment.',
            ctaLabel: 'Copy: npx deepspace',
          })
        }
      } catch {
        setVariant({
          experimentTitle: 'Developer Velocity Test',
          status: 'launched',
          variantId: 'demo-variant',
          label: 'A',
          headline: 'Ship Realtime Full-Stack Apps in One Command',
          subhead: 'From scaffold to production on Cloudflare Workers in 30 seconds. One unified package handles auth, SQLite persistence, and instant deployment.',
          ctaLabel: 'Copy: npx deepspace',
        })
      } finally {
        setLoading(false)
      }
    }

    loadVariant()
  }, [slug, visitorId, channel])

  // Handle Primary Metric Conversion
  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText('npx deepspace')
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)

      // Record high-intent conversion event
      await fetch('/api/actions/recordEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          visitorId,
          type: 'copy_command',
          channel,
          isDemo: slug === 'demo-preview',
        }),
      })
    } catch (e) {
      console.error('Clipboard copy failed', e)
    }
  }

  // Handle Secondary Docs Click
  const handleDocsClick = async () => {
    try {
      await fetch('/api/actions/recordEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          visitorId,
          type: 'docs_click',
          channel,
          isDemo: slug === 'demo-preview',
        }),
      })
    } catch {}
  }

  // Handle Secondary "I tried it"
  const handleTriedIt = async () => {
    setTriedIt(true)
    try {
      await fetch('/api/actions/recordEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          visitorId,
          type: 'tried_it',
          channel,
          isDemo: slug === 'demo-preview',
        }),
      })
    } catch {}
  }

  // Handle Micro-Survey Submission
  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!surveyText.trim()) return

    try {
      await fetch('/api/actions/submitSurvey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          visitorId,
          text: surveyText,
        }),
      })
      setSurveySubmitted(true)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <Sparkles className="w-4 h-4 text-primary" /> Loading experiment variant...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Top Banner: Independent Experiment Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>
          <strong>Independent Experiment</strong> — Live message test run by an applicant. Not an official DeepSpace endorsement.
        </span>
      </div>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-muted-foreground mb-6">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span>Active Test Angle (Variant {variant?.label || 'A'})</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.18] max-w-2xl">
          {variant?.headline}
        </h1>

        <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
          {variant?.subhead}
        </p>

        {/* Primary CTA: Copy Command */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleCopyCommand}
            className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-semibold transition-all shadow-md cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied `npx deepspace`!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> {variant?.ctaLabel || 'Copy: npx deepspace'}
              </>
            )}
          </button>

          <a
            href="https://docs.deep.space"
            target="_blank"
            rel="noreferrer"
            onClick={handleDocsClick}
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-lg text-sm font-medium border border-border bg-card text-card-foreground hover:bg-secondary transition-colors"
          >
            Read Docs <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </div>

        {/* Secondary Engagement Action */}
        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <button
            onClick={handleTriedIt}
            disabled={triedIt}
            className={`hover:underline cursor-pointer ${triedIt ? 'text-emerald-500 font-medium' : ''}`}
          >
            {triedIt ? '✓ Thanks for letting us know!' : 'Already tried it? Click here.'}
          </button>
        </div>

        {/* 1-Question Micro-Survey */}
        <div className="mt-14 w-full max-w-md p-5 rounded-xl border border-border/80 bg-card text-left shadow-xs">
          <h4 className="text-xs font-semibold text-card-foreground mb-1">
            Quick question (10 seconds)
          </h4>
          <p className="text-[11px] text-muted-foreground mb-3">
            What were you hoping to find when you clicked this link? (No personal info stored).
          </p>

          {surveySubmitted ? (
            <div className="text-xs text-emerald-500 font-medium py-2">
              ✓ Thank you for your feedback! It helps improve our positioning.
            </div>
          ) : (
            <form onSubmit={handleSubmitSurvey} className="flex gap-2">
              <input
                type="text"
                value={surveyText}
                onChange={(e) => setSurveyText(e.target.value)}
                maxLength={500}
                placeholder="e.g. Realtime collaborative editor with SQLite..."
                className="flex-1 text-xs px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!surveyText.trim()}
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-6 text-center text-xs text-muted-foreground bg-muted/20">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Independent experiment conducted on the{' '}
            <a
              href="https://deep.space"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              DeepSpace Platform
            </a>
            .
          </p>
          <p className="font-mono text-[10px]">
            Channel: <span className="font-semibold">{channel}</span> • Assigned via deterministic FNV-1a hash
          </p>
        </div>
      </footer>
    </div>
  )
}
