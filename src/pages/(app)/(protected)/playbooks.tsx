import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'deepspace'
import {
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Tag,
} from 'lucide-react'

interface PlaybookItem {
  experimentId: string
  title: string
  hypothesis: string
  result: string
  lesson: string
  nextStep: string
  tags: string
}

export default function PlaybooksPage() {
  const { records = [], status: queryStatus } = useQuery<PlaybookItem>('playbooks')
  const [filter, setFilter] = useState<'all' | 'expand' | 'change' | 'stop'>('all')

  const filtered = records.filter((r) => {
    if (filter === 'all') return true
    return r.data.result.toLowerCase().includes(filter) || r.data.tags.toLowerCase().includes(filter)
  })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-violet-500" /> Positioning Playbook Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Institutional memory of finished positioning experiments, statistical readouts, and strategic decisions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'expand', 'change', 'stop'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium capitalize transition-colors cursor-pointer ${
              filter === item
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {queryStatus === 'loading' ? (
        <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
          Loading playbooks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-dashed border-border bg-card/40">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-violet-500 opacity-50" />
          <h3 className="text-sm font-semibold text-foreground">No playbooks logged yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            When you complete an experiment and record an Expand, Change, or Stop decision, it is archived here as a repeatable playbook entry.
          </p>
          <Link
            to="/experiments"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
          >
            Go to Experiments
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isExpand = item.data.result.toLowerCase().includes('expand')
            const isChange = item.data.result.toLowerCase().includes('change')

            return (
              <div
                key={item.recordId}
                className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                          isExpand
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : isChange
                            ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        {isExpand ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : isChange ? (
                          <RefreshCw className="w-3 h-3" />
                        ) : (
                          <AlertOctagon className="w-3 h-3" />
                        )}
                        {item.data.result.split('—')[0]}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{item.data.title}</h3>
                  </div>

                  <Link
                    to={`/experiments/${item.data.experimentId}`}
                    className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    View Experiment <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-muted/20 p-4 rounded-lg border border-border/50">
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Key Takeaway & Lesson:</span>
                    <p className="text-foreground leading-relaxed">{item.data.lesson}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Actionable Next Step:</span>
                    <p className="text-foreground leading-relaxed">{item.data.nextStep}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  <span className="font-mono">{item.data.tags}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
