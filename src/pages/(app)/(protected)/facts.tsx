import { useState } from 'react'
import { useQuery, useMutations } from 'deepspace'
import {
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { SEED_FACTS, type Fact } from '@/lib/claimGuard'

interface FactItem {
  statement: string
  source: string
  verifiedBy: string
  verifiedAt: string
  status: 'verified' | 'retired'
}

export default function FactsRegistryPage() {
  const { records = [], status: queryStatus } = useQuery<FactItem>('facts')
  const { create, put, remove } = useMutations<FactItem>('facts')

  const [statement, setStatement] = useState('')
  const [source, setSource] = useState('')
  const [adding, setAdding] = useState(false)

  // Seed default facts if collection is completely empty
  const handleSeedDefaults = async () => {
    for (const seed of SEED_FACTS) {
      await create({
        statement: seed.statement,
        source: seed.source,
        verifiedBy: 'system',
        verifiedAt: new Date().toISOString(),
        status: 'verified',
      })
    }
  }

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statement || !source) return
    setAdding(true)

    try {
      await create({
        statement,
        source,
        verifiedBy: 'admin',
        verifiedAt: new Date().toISOString(),
        status: 'verified',
      })
      setStatement('')
      setSource('')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-sky-500" /> Claim Guard Fact Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verified technical assertions extracted directly from official DeepSpace documentation.
          </p>
        </div>
        {records.length === 0 && (
          <button
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary border border-border text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" /> Seed Verified Docs Facts
          </button>
        )}
      </div>

      {/* Add New Verified Fact Form */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4 text-primary" /> Register New Verified Fact
        </h3>
        <form onSubmit={handleAddFact} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Factual Technical Statement
            </label>
            <input
              type="text"
              required
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="e.g. AI proxy routes Anthropic and OpenAI without storing API keys in application code."
              className="w-full text-xs px-3.5 py-2 rounded-lg border border-input bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Official Documentation URL Source
            </label>
            <input
              type="url"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="https://docs.deep.space/sdk-reference/worker/ai"
              className="w-full text-xs px-3.5 py-2 rounded-lg border border-input bg-background text-foreground font-mono text-[11px]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {adding ? 'Verifying & Saving...' : 'Add Verified Fact'}
            </button>
          </div>
        </form>
      </div>

      {/* Facts Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Active Verified Facts ({records.length > 0 ? records.length : SEED_FACTS.length})
          </h3>
        </div>

        <div className="divide-y divide-border">
          {(records.length > 0 ? records : SEED_FACTS.map((s: Fact) => ({ recordId: s.id, data: { ...s, verifiedBy: 'docs', verifiedAt: '2026-10-02', status: 'verified' as const } }))).map(
            (fact: { recordId: string; data: FactItem }) => (
              <div key={fact.recordId} className="p-4 px-6 flex items-start justify-between gap-4 hover:bg-muted/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-xs font-semibold text-foreground">{fact.data.statement}</p>
                  </div>
                  <div className="pl-6 flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                    <a
                      href={fact.data.source}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-primary inline-flex items-center gap-1"
                    >
                      {fact.data.source} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {records.length > 0 && (
                  <button
                    onClick={() => remove(fact.recordId)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                    title="Retire Fact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
