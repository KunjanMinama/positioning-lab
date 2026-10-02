/**
 * Database Schemas for Positioning Lab.
 *
 * Implements strict RBAC permissions across all collections.
 * Anonymous visitors have NO direct read/write access to records rooms;
 * visitor actions and event writes must flow through validated Server Actions.
 */

import type { CollectionSchema } from 'deepspace/schema'

export const experimentsSchema: CollectionSchema = {
  name: 'experiments',
  columns: [
    { name: 'slug', storage: 'text', interpretation: 'plain' },
    { name: 'title', storage: 'text', interpretation: 'plain' },
    { name: 'segment', storage: 'text', interpretation: 'plain' },
    { name: 'hypothesis', storage: 'text', interpretation: 'plain' },
    { name: 'primaryMetric', storage: 'text', interpretation: 'plain' },
    { name: 'minSamplePerVariant', storage: 'number', interpretation: 'plain' },
    { name: 'decisionRule', storage: 'text', interpretation: 'plain' },
    { name: 'status', storage: 'text', interpretation: 'plain' }, // 'draft' | 'launched' | 'closed'
    { name: 'launchedAt', storage: 'text', interpretation: 'plain' },
    { name: 'endsAt', storage: 'text', interpretation: 'plain' },
    { name: 'lockedAt', storage: 'text', interpretation: 'plain' },
    { name: 'createdBy', storage: 'text', interpretation: 'plain' },
    { name: 'isDemo', storage: 'number', interpretation: { kind: 'boolean' } },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const variantsSchema: CollectionSchema = {
  name: 'variants',
  columns: [
    { name: 'experimentId', storage: 'text', interpretation: 'plain' },
    { name: 'label', storage: 'text', interpretation: 'plain' }, // 'A', 'B', 'C'
    { name: 'headline', storage: 'text', interpretation: 'plain' },
    { name: 'subhead', storage: 'text', interpretation: 'plain' },
    { name: 'ctaLabel', storage: 'text', interpretation: 'plain' },
    { name: 'claims', storage: 'text', interpretation: 'plain' }, // JSON stringified array of claims
    { name: 'claimStatus', storage: 'text', interpretation: 'plain' }, // 'unchecked' | 'ok' | 'flagged'
    { name: 'approved', storage: 'number', interpretation: { kind: 'boolean' } },
    { name: 'source', storage: 'text', interpretation: 'plain' }, // 'ai' | 'human'
    { name: 'isDemo', storage: 'number', interpretation: { kind: 'boolean' } },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: true, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const visitorsSchema: CollectionSchema = {
  name: 'visitors',
  columns: [
    { name: 'experimentId', storage: 'text', interpretation: 'plain' },
    { name: 'variantId', storage: 'text', interpretation: 'plain' },
    { name: 'channel', storage: 'text', interpretation: 'plain' },
    { name: 'firstSeenAt', storage: 'text', interpretation: 'plain' },
    { name: 'isBot', storage: 'number', interpretation: { kind: 'boolean' } },
  ],
  permissions: {
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const eventsSchema: CollectionSchema = {
  name: 'events',
  columns: [
    { name: 'experimentId', storage: 'text', interpretation: 'plain' },
    { name: 'variantId', storage: 'text', interpretation: 'plain' },
    { name: 'visitorId', storage: 'text', interpretation: 'plain' },
    { name: 'type', storage: 'text', interpretation: 'plain' }, // 'view' | 'copy_command' | 'docs_click' | 'tried_it'
    { name: 'channel', storage: 'text', interpretation: 'plain' },
    { name: 'ts', storage: 'text', interpretation: 'plain' },
    { name: 'isDemo', storage: 'number', interpretation: { kind: 'boolean' } },
  ],
  permissions: {
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const surveyResponsesSchema: CollectionSchema = {
  name: 'surveyResponses',
  columns: [
    { name: 'experimentId', storage: 'text', interpretation: 'plain' },
    { name: 'variantId', storage: 'text', interpretation: 'plain' },
    { name: 'visitorId', storage: 'text', interpretation: 'plain' },
    { name: 'text', storage: 'text', interpretation: 'plain' },
    { name: 'themeId', storage: 'text', interpretation: 'plain' },
    { name: 'ts', storage: 'text', interpretation: 'plain' },
  ],
  permissions: {
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const factsSchema: CollectionSchema = {
  name: 'facts',
  columns: [
    { name: 'statement', storage: 'text', interpretation: 'plain' },
    { name: 'source', storage: 'text', interpretation: 'plain' },
    { name: 'verifiedBy', storage: 'text', interpretation: 'plain' },
    { name: 'verifiedAt', storage: 'text', interpretation: 'plain' },
    { name: 'status', storage: 'text', interpretation: 'plain' }, // 'verified' | 'retired'
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const claimChecksSchema: CollectionSchema = {
  name: 'claimChecks',
  columns: [
    { name: 'variantId', storage: 'text', interpretation: 'plain' },
    { name: 'claim', storage: 'text', interpretation: 'plain' },
    { name: 'matchedFactId', storage: 'text', interpretation: 'plain' },
    { name: 'verdict', storage: 'text', interpretation: 'plain' }, // 'supported' | 'unsupported' | 'unclear'
    { name: 'reason', storage: 'text', interpretation: 'plain' },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: true, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const decisionsSchema: CollectionSchema = {
  name: 'decisions',
  columns: [
    { name: 'experimentId', storage: 'text', interpretation: 'plain' },
    { name: 'call', storage: 'text', interpretation: 'plain' }, // 'expand' | 'change' | 'stop'
    { name: 'reason', storage: 'text', interpretation: 'plain' },
    { name: 'statusAtDecision', storage: 'text', interpretation: 'plain' },
    { name: 'ts', storage: 'text', interpretation: 'plain' },
    { name: 'decidedBy', storage: 'text', interpretation: 'plain' },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const playbooksSchema: CollectionSchema = {
  name: 'playbooks',
  columns: [
    { name: 'experimentId', storage: 'text', interpretation: 'plain' },
    { name: 'title', storage: 'text', interpretation: 'plain' },
    { name: 'hypothesis', storage: 'text', interpretation: 'plain' },
    { name: 'result', storage: 'text', interpretation: 'plain' },
    { name: 'lesson', storage: 'text', interpretation: 'plain' },
    { name: 'nextStep', storage: 'text', interpretation: 'plain' },
    { name: 'tags', storage: 'text', interpretation: 'plain' }, // JSON array or comma-separated
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const ideasSchema: CollectionSchema = {
  name: 'ideas',
  columns: [
    { name: 'title', storage: 'text', interpretation: 'plain' },
    { name: 'hypothesis', storage: 'text', interpretation: 'plain' },
    { name: 'impact', storage: 'number', interpretation: 'plain' }, // 1-5
    { name: 'confidence', storage: 'number', interpretation: 'plain' }, // 1-5
    { name: 'effort', storage: 'number', interpretation: 'plain' }, // 1-5
    { name: 'score', storage: 'number', interpretation: 'plain' }, // (impact * confidence) / effort
    { name: 'status', storage: 'text', interpretation: 'plain' }, // 'backlog' | 'promoted' | 'archived'
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: true, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const aiUsageSchema: CollectionSchema = {
  name: 'aiUsage',
  columns: [
    { name: 'userId', storage: 'text', interpretation: 'plain' },
    { name: 'day', storage: 'text', interpretation: 'plain' }, // YYYY-MM-DD
    { name: 'calls', storage: 'number', interpretation: 'plain' },
    { name: 'tokensEstimate', storage: 'number', interpretation: 'plain' },
  ],
  permissions: {
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: false, create: false, update: false, delete: false },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
