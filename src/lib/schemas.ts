/**
 * Zod validation schemas for Server Actions and AI responses in Positioning Lab.
 *
 * Ensures all client inputs and AI-generated outputs are rigorously validated at runtime.
 */

import { z } from 'zod'
import { ALLOWED_CHANNELS } from './assign'

// --- Server Action Input Schemas ---

export const createExperimentInputSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with single dashes'),
  segment: z.string().min(3).max(150),
  hypothesis: z.string().min(10).max(500),
  decisionRule: z
    .string()
    .min(10)
    .max(500)
    .describe('Pre-registered decision rule defining when to expand, change, or stop'),
  primaryMetric: z.literal('copy_command').default('copy_command'),
  minSamplePerVariant: z.number().int().min(10).max(5000).default(50),
  endsAt: z.string().optional(),
})

export type CreateExperimentInput = z.infer<typeof createExperimentInputSchema>

export const recordEventInputSchema = z.object({
  slug: z.string().min(1),
  visitorId: z.string().min(10).max(100),
  type: z.enum(['view', 'copy_command', 'docs_click', 'tried_it']),
  channel: z.enum(ALLOWED_CHANNELS).default('other'),
  isDemo: z.boolean().default(false),
})

export type RecordEventInput = z.infer<typeof recordEventInputSchema>

export const submitSurveyInputSchema = z.object({
  slug: z.string().min(1),
  visitorId: z.string().min(10).max(100),
  text: z
    .string()
    .min(2)
    .max(500)
    .transform((str) => str.replace(/<[^>]*>?/gm, '').trim()), // strip HTML tags
})

export type SubmitSurveyInput = z.infer<typeof submitSurveyInputSchema>

export const recordDecisionInputSchema = z.object({
  experimentId: z.string().min(1),
  call: z.enum(['expand', 'change', 'stop']),
  reason: z.string().min(10).max(1000),
  lesson: z.string().min(10).max(1000),
  nextStep: z.string().min(5).max(500),
})

export type RecordDecisionInput = z.infer<typeof recordDecisionInputSchema>

// --- AI Output Schemas ---

export const aiVariantItemSchema = z.object({
  label: z.enum(['A', 'B', 'C']),
  angle: z.string().min(3).max(50),
  headline: z.string().min(10).max(120),
  subhead: z.string().min(15).max(250),
  ctaLabel: z.string().min(2).max(40),
  claims: z.array(z.string().min(5).max(150)).min(1).max(5),
})

export const aiDraftVariantsOutputSchema = z.object({
  variants: z.array(aiVariantItemSchema).length(3),
})

export type AiDraftVariantsOutput = z.infer<typeof aiDraftVariantsOutputSchema>

export const aiReadoutStatementSchema = z.object({
  text: z.string().min(5).max(300),
  kind: z.enum(['evidence', 'assumption']),
  references: z.array(z.string()).default([]),
})

export const aiReadoutOutputSchema = z.object({
  statements: z.array(aiReadoutStatementSchema).min(2).max(10),
  recommendation: z.enum(['expand', 'change', 'stop', 'collect_more']),
  rationale: z.string().min(10).max(500),
})

export type AiReadoutOutput = z.infer<typeof aiReadoutOutputSchema>
