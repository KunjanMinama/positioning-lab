import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, usePresence } from 'deepspace'
import {
  FlaskConical,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  ExternalLink,
  Users,
  BarChart3,
  Rocket,
  ArrowLeft,
  FileText,
  AlertTriangle,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { computeExperimentStats, type ExperimentStatsResult, type VariantStats } from '@/lib/stats'

interface Experiment {
  slug: string
  title: string
  segment: string
  hypothesis: string
  primaryMetric: string
  minSamplePerVariant: number
  decisionRule: string
  status: 'draft' | 'launched' | 'closed'
  launchedAt?: string
  lockedAt?: string
  isDemo?: boolean
}

interface Variant {
  experimentId: string
  label: string
  headline: string
  subhead: string
  ctaLabel: string
  claims: string
  claimStatus: 'unchecked' | 'ok' | 'flagged'
  approved: boolean
  source: 'ai' | 'human'
}

interface EventItem {
  experimentId: string
  variantId: string
  type: string
  channel: string
  isDemo: boolean
}

export default function ExperimentDetailPage() {
  const { id } = useParams()
  const experimentId = id || ''

  // Realtime queries via DeepSpace RecordRoom
  const { records: expRecords = [] } = useQuery<Experiment>('experiments')
  const { records: varRecords = [] } = useQuery<Variant>('variants')
  const { records: eventRecords = [] } = useQuery<EventItem>('events')

  // Ephemeral Presence across collaborators
  const { users = [] } = usePresence()

  const experiment = expRecords.find((r) => r.recordId === experimentId)
  const variants = varRecords.filter((r) => r.data.experimentId === experimentId)
  const events = eventRecords.filter((r) => r.data.experimentId === experimentId && !r.data.isDemo)

  const [activeTab, setActiveTab] = useState<'variants' | 'launch' | 'live' | 'readout'>('variants')
  const [drafting, setDrafting] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Readout state
  const [generatingReadout, setGeneratingReadout] = useState(false)
  const [readoutData, setReadoutData] = useState<{
    statements: Array<{ text: string; kind: 'evidence' | 'assumption'; references: string[] }>
    recommendation: 'expand' | 'change' | 'stop' | 'collect_more'
    rationale: string
  } | null>(null)

  // Decision Recording Modal State
  const [decisionCall, setDecisionCall] = useState<'expand' | 'change' | 'stop'>('expand')
  const [decisionReason, setDecisionReason] = useState('')
  const [decisionLesson, setDecisionLesson] = useState('')
  const [decisionNextStep, setDecisionNextStep] = useState('')
  const [recordingDecision, setRecordingDecision] = useState(false)
  const [decisionSaved, setDecisionSaved] = useState(false)

  // Compute live statistics and status gate
  const statsResult: ExperimentStatsResult = useMemo(() => {
    const rawVariants = variants.map((v) => {
      const vEvents = events.filter((e) => e.data.variantId === v.recordId)
      const views = vEvents.filter((e) => e.data.type === 'view').length
      const conversions = vEvents.filter((e) => e.data.type === 'copy_command').length
      return {
        id: v.recordId,
        label: v.data.label,
        views: Math.max(views, conversions),
        conversions,
      }
    })

    return computeExperimentStats(rawVariants, experiment?.data.minSamplePerVariant || 50)
  }, [variants, events, experiment])

  // Channel breakdown matrix
  const channelBreakdown = useMemo(() => {
    const channels = ['linkedin', 'x', 'reddit', 'hn', 'discord', 'friend', 'other']
    return channels.map((ch) => {
      const chEvents = events.filter((e) => e.data.channel === ch)
      const views = chEvents.filter((e) => e.data.type === 'view').length
      const conversions = chEvents.filter((e) => e.data.type === 'copy_command').length
      const rate = views > 0 ? (conversions / views) * 100 : 0
      return { channel: ch, views, conversions, rate }
    })
  }, [events])

  if (!experiment) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Experiment not found. <Link to="/experiments" className="text-primary underline">Return to directory</Link>
      </div>
    )
  }

  const expData = experiment.data
  const approvedCount = variants.filter((v) => v.data.approved).length

  // Action: Draft Variants with AI
  const handleDraftVariants = async () => {
    setDrafting(true)
    setActionError(null)
    try {
      const res = await fetch('/api/actions/draftVariants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId }),
      })
      const result = (await res.json()) as any
      if (!result.success) {
        setActionError(result.error || 'Failed to draft variants.')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Draft request failed.')
    } finally {
      setDrafting(false)
    }
  }

  // Action: Approve Variant
  const handleApproveVariant = async (variantId: string) => {
    setApprovingId(variantId)
    setActionError(null)
    try {
      const res = await fetch('/api/actions/approveVariant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      })
      const result = (await res.json()) as any
      if (!result.success) {
        setActionError(result.error || 'Failed to approve variant.')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Approval failed.')
    } finally {
      setApprovingId(null)
    }
  }

  // Action: Launch Experiment
  const handleLaunchExperiment = async () => {
    setLaunching(true)
    setActionError(null)
    try {
      const res = await fetch('/api/actions/launchExperiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId }),
      })
      const result = (await res.json()) as any
      if (result.success) {
        setActiveTab('live')
      } else {
        setActionError(result.error || 'Launch failed.')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Launch failed.')
    } finally {
      setLaunching(false)
    }
  }

  // Action: Generate Readout
  const handleGenerateReadout = async () => {
    setGeneratingReadout(true)
    setActionError(null)
    try {
      const res = await fetch('/api/actions/writeReadout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId }),
      })
      const result = (await res.json()) as any
      if (result.success && result.data?.readout) {
        setReadoutData(result.data.readout)
        setActiveTab('readout')
      } else {
        setActionError(result.error || 'Failed to generate readout.')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Readout request failed.')
    } finally {
      setGeneratingReadout(false)
    }
  }

  // Action: Record Decision & Playbook
  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecordingDecision(true)
    setActionError(null)
    try {
      const res = await fetch('/api/actions/recordDecision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          call: decisionCall,
          reason: decisionReason,
          lesson: decisionLesson,
          nextStep: decisionNextStep,
        }),
      })
      const result = (await res.json()) as any
      if (result.success) {
        setDecisionSaved(true)
      } else {
        setActionError(result.error || 'Failed to save decision.')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setRecordingDecision(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Back and Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            to="/experiments"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Experiments Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-primary" /> {expData.title}
            </h1>
            <span
              className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                expData.status === 'launched'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : expData.status === 'closed'
                  ? 'bg-muted text-muted-foreground border-border'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}
            >
              {expData.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Target Audience: <strong className="text-foreground">{expData.segment}</strong> • Slug:{' '}
            <code className="text-foreground font-mono">/t/{expData.slug}</code>
          </p>
        </div>

        {/* Realtime Collaborator Presence Avatars */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>Presence:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-primary/20 text-[10px] font-bold text-primary flex items-center justify-center border border-background">
                You
              </div>
              {users.slice(0, 3).map((u) => (
                <div
                  key={u.id}
                  className="w-5 h-5 rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-500 flex items-center justify-center border border-background"
                  title={u.name || u.id}
                >
                  ●
                </div>
              ))}
            </div>
          </div>

          {expData.status === 'launched' && (
            <Link
              to={`/t/${expData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Open Live Test Page <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {actionError}
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('variants')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'variants'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> 1. Variants & Claim Guard ({variants.length})
        </button>

        <button
          onClick={() => setActiveTab('launch')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'launch'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" /> 2. Pre-Registration & Launch
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'live'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> 3. Live Dashboard & Status Gate
        </button>

        <button
          onClick={() => setActiveTab('readout')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'readout'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> 4. AI Readout & Decision
        </button>
      </div>

      {/* TAB 1: VARIANTS & CLAIM GUARD */}
      {activeTab === 'variants' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Message Angles & Fact Checking</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Draft 3 distinct angles. Claim Guard automatically verifies factual statements against official docs.
              </p>
            </div>
            {variants.length === 0 && (
              <button
                onClick={handleDraftVariants}
                disabled={drafting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> {drafting ? 'Drafting & Fact-Checking...' : 'Draft 3 Angles with AI'}
              </button>
            )}
          </div>

          {variants.length === 0 ? (
            <div className="p-16 text-center rounded-xl border border-dashed border-border bg-card/40">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary opacity-60" />
              <h3 className="text-sm font-semibold text-foreground">No variants generated yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Click below to generate 3 differentiated positioning angles tailored to your target developer segment.
              </p>
              <button
                onClick={handleDraftVariants}
                disabled={drafting}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> {drafting ? 'Drafting...' : 'Draft Variants Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {variants.map((v) => {
                let parsedClaims: string[] = []
                try {
                  parsedClaims = JSON.parse(v.data.claims || '[]')
                } catch {
                  parsedClaims = []
                }

                return (
                  <div
                    key={v.recordId}
                    className="p-5 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center font-mono">
                          {v.data.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              v.data.claimStatus === 'ok'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}
                          >
                            {v.data.claimStatus === 'ok' ? (
                              <>
                                <ShieldCheck className="w-3 h-3" /> Claim OK
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3 h-3" /> Flagged
                              </>
                            )}
                          </span>
                          {v.data.approved && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">
                              Approved
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-semibold text-base text-foreground leading-snug">
                        {v.data.headline}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {v.data.subhead}
                      </p>

                      <div className="mt-4 pt-3 border-t border-border">
                        <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                          Extracted Claims & Citations:
                        </span>
                        <div className="space-y-1.5">
                          {parsedClaims.map((claim, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] bg-muted/40 p-2 rounded border border-border/50 text-foreground leading-normal"
                            >
                              • {claim}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border">
                      {!v.data.approved ? (
                        <button
                          onClick={() => handleApproveVariant(v.recordId)}
                          disabled={approvingId === v.recordId || v.data.claimStatus === 'flagged'}
                          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          {v.data.claimStatus === 'flagged'
                            ? 'Cannot Approve (Flagged Claims)'
                            : approvingId === v.recordId
                            ? 'Approving...'
                            : 'Approve for Launch'}
                        </button>
                      ) : (
                        <div className="text-center py-1.5 text-xs font-medium text-emerald-600 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LAUNCH & PRE-REGISTRATION */}
      {activeTab === 'launch' && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Launch Readiness Checklist</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pre-registration locks the hypothesis, sample size, and decision rule. Changes after launch are audited.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-xs">
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <CheckCircle2
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  approvedCount >= 2 ? 'text-emerald-500' : 'text-muted-foreground opacity-40'
                }`}
              />
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  At least 2 approved variants ({approvedCount}/2 approved)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Controlled positioning tests require at least two distinct angles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <CheckCircle2
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  variants.every((v) => !v.data.approved || v.data.claimStatus === 'ok')
                    ? 'text-emerald-500'
                    : 'text-destructive'
                }`}
              />
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  Claim Guard verification passed
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All approved variants are free of ungrounded or exaggerated technical claims.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  Decision Rule Pre-Registered
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono bg-muted/40 p-2 rounded border border-border mt-1">
                  "{expData.decisionRule}"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  Sample Size Pre-Registered
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Minimum {expData.minSamplePerVariant || 50} unique visitors required per variant before any winner can be declared.
                </p>
              </div>
            </div>
          </div>

          {expData.status === 'draft' ? (
            <button
              onClick={handleLaunchExperiment}
              disabled={launching || approvedCount < 2}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
            >
              <Rocket className="w-4 h-4" /> {launching ? 'Launching...' : 'Lock Pre-Registration & Launch Live'}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Experiment launched. Hypothesis and decision rules are locked.</span>
              </div>
              <button
                onClick={() => setActiveTab('live')}
                className="font-semibold underline flex items-center gap-1"
              >
                Go to Live Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE DASHBOARD & STATUS GATE */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Status Gate Banner */}
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              statsResult.statusGate === 'not_enough_data'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : statsResult.statusGate === 'directional'
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded font-bold bg-background/50 border border-current">
                  Gate: {statsResult.statusGate.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-semibold">
                  {statsResult.statusGate === 'not_enough_data'
                    ? 'Collecting Evidence'
                    : statsResult.statusGate === 'directional'
                    ? 'Directional Trend'
                    : 'Statistically Significant Separation'}
                </span>
              </div>
              <p className="text-xs mt-2 leading-relaxed max-w-3xl">
                {statsResult.statusReason}
              </p>
            </div>

            <button
              onClick={handleGenerateReadout}
              disabled={generatingReadout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shrink-0 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              {generatingReadout ? 'Writing Readout...' : 'Write AI Readout'}
            </button>
          </div>

          {/* Wilson Score Interval Chart */}
          <div className="p-6 rounded-xl border border-border bg-card space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Primary Intent Metric: "Copy Command" (95% Wilson Interval)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Point estimate and 95% confidence intervals modeling true developer intent.
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Total Events: {events.length}
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {statsResult.variants.map((v: VariantStats) => (
                <div key={v.variantId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      Variant {v.label}: {v.conversions} / {v.views} clicks ({(v.conversionRate * 100).toFixed(1)}%)
                    </span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      95% CI: [{(v.interval.lower * 100).toFixed(1)}% – {(v.interval.upper * 100).toFixed(1)}%]
                    </span>
                  </div>

                  {/* Visual CI Bar */}
                  <div className="h-6 w-full bg-secondary rounded-lg relative overflow-hidden flex items-center">
                    {/* Confidence Interval Spread */}
                    <div
                      className="absolute h-full bg-primary/20 border-x-2 border-primary/60"
                      style={{
                        left: `${v.interval.lower * 100}%`,
                        width: `${Math.max(2, (v.interval.upper - v.interval.lower) * 100)}%`,
                      }}
                    />
                    {/* Point Estimate Marker */}
                    <div
                      className="absolute w-1.5 h-full bg-primary z-10"
                      style={{
                        left: `${v.conversionRate * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Breakdown Table */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Traffic Channel Breakdown</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Conversion rates by source channel (?src=&lt;channel&gt;).
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Visitors (Views)</th>
                    <th className="px-6 py-3">Conversions</th>
                    <th className="px-6 py-3">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {channelBreakdown.map((row) => (
                    <tr key={row.channel} className="hover:bg-muted/30">
                      <td className="px-6 py-3 font-mono font-medium capitalize text-foreground">
                        {row.channel}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{row.views}</td>
                      <td className="px-6 py-3 text-muted-foreground">{row.conversions}</td>
                      <td className="px-6 py-3 font-mono font-semibold text-foreground">
                        {row.rate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI READOUT & DECISION PLAYBOOK */}
      {activeTab === 'readout' && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Statistical Readout & Executive Recommendation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Statements are strictly labeled as Evidence or Assumption to maintain rigor.
              </p>
            </div>
            <button
              onClick={handleGenerateReadout}
              disabled={generatingReadout}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Re-generate Readout
            </button>
          </div>

          {!readoutData ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/40">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary opacity-50" />
              <h3 className="text-sm font-semibold text-foreground">No readout generated yet</h3>
              <button
                onClick={handleGenerateReadout}
                disabled={generatingReadout}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
              >
                {generatingReadout ? 'Writing...' : 'Generate Readout'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Executive Recommendation Box */}
              <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    Call: {readoutData.recommendation.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Status: {statsResult.statusGate}
                  </span>
                </div>
                <p className="text-xs text-foreground font-medium">{readoutData.rationale}</p>
              </div>

              {/* Tagged Statements */}
              <div className="p-6 rounded-xl border border-border bg-card space-y-3 shadow-xs">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                  Tagged Analysis Statements
                </h3>
                {readoutData.statements.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2.5 text-xs"
                  >
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 mt-0.5 ${
                        s.kind === 'evidence'
                          ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                          : 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                      }`}
                    >
                      {s.kind}
                    </span>
                    <p className="text-foreground leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>

              {/* Record Decision & Playbook Form */}
              <div className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Record Final Decision & Save to Playbook
                  </h3>
                </div>

                {decisionSaved ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
                    ✓ Decision successfully recorded and published to Playbooks!
                  </div>
                ) : (
                  <form onSubmit={handleRecordDecision} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Strategic Call
                      </label>
                      <div className="flex gap-3">
                        {(['expand', 'change', 'stop'] as const).map((call) => (
                          <button
                            key={call}
                            type="button"
                            onClick={() => setDecisionCall(call)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize border cursor-pointer ${
                              decisionCall === call
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'border-input bg-background text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {call}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Reason for Call
                      </label>
                      <input
                        type="text"
                        required
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        placeholder="e.g. Statistical gate favors Variant B; copy rate exceeded target threshold."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Key Lesson Learned
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={decisionLesson}
                          onChange={(e) => setDecisionLesson(e.target.value)}
                          placeholder="e.g. Full-stack developers value pre-configured SQLite & auth far more than deploy speed."
                          className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Recommended Next Step
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={decisionNextStep}
                          onChange={(e) => setDecisionNextStep(e.target.value)}
                          placeholder="e.g. Update the official docs homepage hero with Variant B copy."
                          className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={recordingDecision}
                      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                    >
                      {recordingDecision ? 'Saving...' : 'Publish to Playbook Archive'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
