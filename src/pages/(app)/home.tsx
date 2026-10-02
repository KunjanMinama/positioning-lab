import { Link } from 'react-router-dom'
import { useQuery } from 'deepspace'
import {
  FlaskConical,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react'

interface Experiment {
  slug: string
  title: string
  segment: string
  status: 'draft' | 'launched' | 'closed'
  hypothesis: string
  minSamplePerVariant: number
  primaryMetric: string
  isDemo?: boolean
}

interface Fact {
  statement: string
  status: string
}

interface Playbook {
  title: string
  result: string
}

export default function HomePage() {
  const { records: experiments = [] } = useQuery<Experiment>('experiments', {
    orderBy: 'createdAt',
    orderDir: 'desc',
  })
  const { records: facts = [] } = useQuery<Fact>('facts')
  const { records: playbooks = [] } = useQuery<Playbook>('playbooks')

  const activeCount = experiments.filter((e) => e.data.status === 'launched').length
  const draftCount = experiments.filter((e) => e.data.status === 'draft').length
  const closedCount = experiments.filter((e) => e.data.status === 'closed').length

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-primary" /> Positioning Lab Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-native positioning hypotheses, fact-checked claim guards, and pre-registered experiments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/experiments/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> New Experiment
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Tests
            </span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{activeCount}</span>
            <span className="text-xs text-muted-foreground font-mono">running</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Verified Facts
            </span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{facts.length || 7}</span>
            <span className="text-xs text-muted-foreground font-mono">Claim Guard</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Playbooks Logged
            </span>
            <BookOpen className="w-4 h-4 text-violet-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{playbooks.length}</span>
            <span className="text-xs text-muted-foreground font-mono">learnings</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Draft Pipeline
            </span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{draftCount}</span>
            <span className="text-xs text-muted-foreground font-mono">in prep</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/experiments"
          className="p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-primary mb-2">
              <FlaskConical className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Experiments Workspace</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Create, approve variants with Claim Guard, and monitor live conversion rates.
            </p>
          </div>
          <span className="text-[11px] font-medium text-primary mt-4 inline-block">
            View All Experiments →
          </span>
        </Link>

        <Link
          to="/facts"
          className="p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-sky-500 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Claim Guard Facts</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Ground technical assertions against verified DeepSpace SDK documentation.
            </p>
          </div>
          <span className="text-[11px] font-medium text-sky-500 mt-4 inline-block">
            Manage Fact Registry →
          </span>
        </Link>

        <Link
          to="/playbooks"
          className="p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-violet-500 mb-2">
              <BookOpen className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Playbooks & Decisions</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Review completed experiments, logged decisions (Expand/Change/Stop), and takeaways.
            </p>
          </div>
          <span className="text-[11px] font-medium text-violet-500 mt-4 inline-block">
            Browse Playbooks →
          </span>
        </Link>
      </div>

      {/* Recent Experiments Section */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Experiments</h2>
          <Link to="/experiments" className="text-xs text-primary hover:underline font-medium">
            View All ({experiments.length})
          </Link>
        </div>

        {experiments.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FlaskConical className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No experiments created yet.</p>
            <p className="text-xs mt-1">Start by pre-registering your first positioning hypothesis.</p>
            <Link
              to="/experiments/new"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Create First Experiment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {experiments.slice(0, 5).map((exp) => (
              <div
                key={exp.recordId}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                <div>
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
                    <h3 className="text-sm font-semibold text-foreground">{exp.data.title}</h3>
                    {exp.data.isDemo && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    <span className="font-medium text-foreground">Segment:</span> {exp.data.segment} •{' '}
                    <span className="font-medium text-foreground">Hypothesis:</span> {exp.data.hypothesis}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/experiments/${exp.recordId}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
