import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'deepspace'
import {
  FlaskConical,
  PlusCircle,
  Search,
  ExternalLink,
  ArrowRight,
  Filter,
  Lock,
} from 'lucide-react'

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
  isDemo?: boolean
}

export default function ExperimentsListPage() {
  const { records = [], status: queryStatus } = useQuery<Experiment>('experiments', {
    orderBy: 'createdAt',
    orderDir: 'desc',
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'launched' | 'closed'>('all')

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.data.segment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.data.slug.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || r.data.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-primary" /> Experiments Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-registered positioning tests, public landing links, and conversion funnels.
          </p>
        </div>
        <Link
          to="/experiments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Create Experiment
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search experiments by title, segment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {(['all', 'launched', 'draft', 'closed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer capitalize ${
                statusFilter === filter
                  ? 'bg-secondary text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Experiments Grid */}
      {queryStatus === 'loading' ? (
        <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
          Loading experiments from SQLite RecordRoom...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-dashed border-border bg-card/40">
          <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">No matching experiments found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search filter or create a new experiment to begin testing.
          </p>
          <Link
            to="/experiments/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Pre-Register New Experiment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((exp) => (
            <div
              key={exp.recordId}
              className="p-5 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        exp.data.status === 'launched'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : exp.data.status === 'closed'
                          ? 'bg-muted text-muted-foreground border-border'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {exp.data.status}
                    </span>
                    {exp.data.isDemo && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        DEMO
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Min N: {exp.data.minSamplePerVariant || 50}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-foreground mb-1">
                  {exp.data.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 font-medium">
                  Audience: <span className="text-foreground">{exp.data.segment}</span>
                </p>

                <div className="space-y-2 text-xs bg-muted/30 p-3 rounded-lg border border-border/60">
                  <div>
                    <span className="font-semibold text-muted-foreground">Hypothesis:</span>
                    <p className="text-foreground mt-0.5 line-clamp-2">{exp.data.hypothesis}</p>
                  </div>
                  <div className="pt-2 border-t border-border/40 flex items-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-muted-foreground text-[11px]">
                        Pre-Registered Decision Rule:
                      </span>
                      <p className="text-foreground text-[11px] mt-0.5 line-clamp-2">
                        {exp.data.decisionRule}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                <Link
                  to={`/t/${exp.data.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  /t/{exp.data.slug} <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  to={`/experiments/${exp.recordId}`}
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
