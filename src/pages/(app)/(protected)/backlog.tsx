import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutations } from 'deepspace'
import {
  Lightbulb,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react'

interface IdeaItem {
  title: string
  hypothesis: string
  impact: number
  confidence: number
  effort: number
  score: number
  status: 'backlog' | 'promoted' | 'archived'
}

export default function BacklogPage() {
  const navigate = useNavigate()
  const { records = [], status: queryStatus } = useQuery<IdeaItem>('ideas', {
    orderBy: 'createdAt',
    orderDir: 'desc',
  })
  const { create, put } = useMutations<IdeaItem>('ideas')

  const [title, setTitle] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [impact, setImpact] = useState(4)
  const [confidence, setConfidence] = useState(3)
  const [effort, setEffort] = useState(2)
  const [adding, setAdding] = useState(false)

  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !hypothesis) return
    setAdding(true)

    const score = Number(((impact * confidence) / effort).toFixed(1))
    try {
      await create({
        title,
        hypothesis,
        impact,
        confidence,
        effort,
        score,
        status: 'backlog',
      })
      setTitle('')
      setHypothesis('')
    } finally {
      setAdding(false)
    }
  }

  const handlePromote = async (idea: { recordId: string; data: IdeaItem }) => {
    await put(idea.recordId, { status: 'promoted' })
    // Navigate to create new experiment
    navigate(`/experiments/new?title=${encodeURIComponent(idea.data.title)}&hyp=${encodeURIComponent(idea.data.hypothesis)}`)
  }

  // Sort ideas by ICE score descending
  const sortedIdeas = [...records].sort((a, b) => (b.data.score || 0) - (a.data.score || 0))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Lightbulb className="w-6 h-6 text-amber-500" /> Positioning Idea Backlog & ICE Scoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prioritize positioning hypotheses with ICE framework: (Impact × Confidence) / Effort.
          </p>
        </div>
      </div>

      {/* Add New Idea Form */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4 text-primary" /> Capture New Positioning Hypothesis
        </h3>
        <form onSubmit={handleAddIdea} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Idea Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lead with Edge Latency & Multi-Region SQLite"
              className="w-full text-xs px-3.5 py-2 rounded-lg border border-input bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Hypothesis to Test
            </label>
            <textarea
              required
              rows={2}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="e.g. Highlighting distributed SQLite Durable Objects closer to users will attract backend systems engineers."
              className="w-full text-xs px-3.5 py-2 rounded-lg border border-input bg-background text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Impact (1–5): <span className="font-bold text-primary">{impact}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Confidence (1–5): <span className="font-bold text-primary">{confidence}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Effort (1–5, lower is faster): <span className="font-bold text-primary">{effort}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={effort}
                onChange={(e) => setEffort(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-muted-foreground">
              Calculated ICE Score: <strong className="text-foreground">{((impact * confidence) / effort).toFixed(1)}</strong>
            </span>
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {adding ? 'Saving...' : 'Add to Backlog'}
            </button>
          </div>
        </form>
      </div>

      {/* Ideas Table / Grid */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Ranked Ideas ({sortedIdeas.length})
          </h3>
        </div>

        {queryStatus === 'loading' ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Loading backlog...
          </div>
        ) : sortedIdeas.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No backlog ideas recorded yet. Add your first positioning hypothesis above.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedIdeas.map((idea) => (
              <div
                key={idea.recordId}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> ICE {idea.data.score}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">{idea.data.title}</h4>
                    {idea.data.status === 'promoted' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Promoted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{idea.data.hypothesis}</p>
                  <p className="text-[11px] font-mono text-muted-foreground pt-1">
                    Impact: {idea.data.impact} • Confidence: {idea.data.confidence} • Effort: {idea.data.effort}
                  </p>
                </div>

                {idea.data.status !== 'promoted' ? (
                  <button
                    onClick={() => handlePromote(idea)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors shrink-0 cursor-pointer"
                  >
                    Promote to Test <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Promoted
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
