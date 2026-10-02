import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { seo } from '../seo'
import {
  ShieldCheck,
  Scale,
  GitBranch,
  Terminal,
  ArrowRight,
  Lock,
  BarChart3,
  Cpu,
} from 'lucide-react'

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
        {/* Navigation Bar */}
        <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shadow-sm">
              PL
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight">Positioning Lab</span>
              <span className="ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                GTM Science
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all"
            >
              Open Lab <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-20 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs text-muted-foreground mb-6 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI-Native Positioning & Developer Marketing System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.12]">
            Stop Guessing Copy. <br />
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-400 bg-clip-text text-transparent">
              Prove Positioning with Real Experiments.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Generating marketing copy with AI is easy. The hard part is deciding what matters,
            keeping technical claims 100% accurate, and learning honestly from real developer traffic.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              Launch an Experiment <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/t/demo-preview"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary/80 border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-all"
            >
              View Public Test Page Demo
            </Link>
          </div>

          {/* Principle Cards Grid */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left w-full">
            <div className="p-5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs shadow-xs hover:border-primary/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-card-foreground">Pre-Registered Rules</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hypotheses and decision rules are locked before seeing live data. No silent peeking or shifting goalposts.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs shadow-xs hover:border-primary/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-card-foreground">Claim Guard</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every marketing claim is cross-checked against verified documentation. Unsubstantiated claims block launch.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs shadow-xs hover:border-primary/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center mb-3">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-card-foreground">Wilson Score Intervals</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No misleading percentage comparisons. 95% Wilson confidence intervals model uncertainty on small traffic.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs shadow-xs hover:border-primary/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-card-foreground">Strict Status Gate</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The engine refuses to declare winners without sufficient sample size. Readout generation code enforces reality.
              </p>
            </div>
          </div>

          {/* Primary Metric Note */}
          <div className="mt-12 p-4 rounded-xl bg-muted/40 border border-border max-w-2xl w-full flex items-start gap-3 text-left">
            <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Primary Developer Intent Proxy: "Copy Command"
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                We measure clicks on <code className="px-1.5 py-0.5 bg-background rounded text-foreground font-mono text-[11px] border border-border">npm create deepspace</code> as our primary high-intent proxy for developer interest.
              </p>
            </div>
          </div>
        </section>

        {/* Independent Experiment Footer */}
        <footer className="border-t border-border/40 py-6 px-6 text-center text-xs text-muted-foreground bg-muted/20">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>
              Independent technical evaluation project built on the{' '}
              <a
                href="https://deep.space"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground"
              >
                DeepSpace Platform
              </a>
              . Not an official DeepSpace page.
            </p>
            <p className="font-mono text-[11px]">
              Privacy by Default • Anonymous UUIDs • Zero PII Stored
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

