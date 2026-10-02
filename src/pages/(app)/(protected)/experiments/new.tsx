import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FlaskConical,
  Lock,
  ArrowLeft,
  Sparkles,
  Info,
  Terminal,
} from 'lucide-react'

export default function NewExperimentPage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [segment, setSegment] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [minSamplePerVariant, setMinSamplePerVariant] = useState(50)
  const [decisionRule, setDecisionRule] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(generated)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/actions/createExperiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          segment,
          hypothesis,
          decisionRule,
          primaryMetric: 'copy_command',
          minSamplePerVariant: Number(minSamplePerVariant),
        }),
      })

      const result = (await res.json()) as any
      if (result.success && result.data?.recordId) {
        navigate(`/experiments/${result.data.recordId}`)
      } else {
        setError(result.error || 'Failed to create experiment.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <Link
        to="/experiments"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Experiments
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <FlaskConical className="w-6 h-6 text-primary" /> Pre-Register New Experiment
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lock in your positioning hypothesis, target segment, and decision rule before drafting copy.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-xl border border-border bg-card space-y-5 shadow-xs">
          {/* Experiment Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Experiment Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Unified Backend vs Single-Command Shipping"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Public URL Slug <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center">
              <span className="text-xs px-3 py-2.5 bg-muted text-muted-foreground border border-r-0 border-input rounded-l-lg font-mono">
                /t/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="unified-backend-test"
                className="w-full text-xs px-3.5 py-2.5 rounded-r-lg border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-mono">
              Visitors will view this test at <code className="text-foreground">/t/{slug || ':slug'}?src=&lt;channel&gt;</code>
            </p>
          </div>

          {/* Target Audience Segment */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Target Developer Segment <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="e.g. Full-stack TypeScript builders building AI agents on Cloudflare Workers"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Hypothesis */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Positioning Hypothesis <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="e.g. Positioning DeepSpace as a unified backend that eliminates 5 SaaS vendors will achieve higher CLI copy conversions than leading with deployment speed."
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            />
          </div>

          {/* Pre-Registered Decision Rule */}
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Lock className="w-3.5 h-3.5" /> Pre-Registered Decision Rule (Mandatory)
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Define in advance what action you will take for each statistical outcome before looking at traffic.
              This prevents post-hoc rationalization.
            </p>
            <textarea
              required
              rows={3}
              value={decisionRule}
              onChange={(e) => setDecisionRule(e.target.value)}
              placeholder="e.g. Expand: If Variant B achieves >= 20% conversion and 95% Wilson CI is strictly above Variant A, expand message to docs hero. Change: If overlapping CIs, test pricing angle. Stop: If < 5% copy rate."
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            />
          </div>

          {/* Sample Size and Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Minimum Sample Per Variant (N)
              </label>
              <input
                type="number"
                min={10}
                max={5000}
                value={minSamplePerVariant}
                onChange={(e) => setMinSamplePerVariant(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                The Status Gate will enforce "Not enough data" until all variants reach this threshold.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Primary Intent Metric
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-muted/40 text-xs font-medium text-foreground">
                <Terminal className="w-4 h-4 text-primary" />
                <span>copy_command (`npx deepspace`)</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Measurable proxy for developer intent.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/experiments"
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>Creating Experiment...</>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Pre-Register & Continue to Variants
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
