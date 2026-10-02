/**
 * Collection Schemas
 *
 * All collections with columns and RBAC permissions.
 * Single source of truth — imported by both worker and frontend.
 *
 * Add schemas by creating a file in src/schemas/ and importing it here.
 */

import type { CollectionSchema } from 'deepspace/schema'
import { usersSchema } from './schemas/users-schema'
import { settingsSchema } from './schemas/admin-schema'
import {
  experimentsSchema,
  variantsSchema,
  visitorsSchema,
  eventsSchema,
  surveyResponsesSchema,
  factsSchema,
  claimChecksSchema,
  decisionsSchema,
  playbooksSchema,
  ideasSchema,
  aiUsageSchema,
} from './schemas/positioning-schemas'

export const schemas: CollectionSchema[] = [
  usersSchema,
  settingsSchema,
  experimentsSchema,
  variantsSchema,
  visitorsSchema,
  eventsSchema,
  surveyResponsesSchema,
  factsSchema,
  claimChecksSchema,
  decisionsSchema,
  playbooksSchema,
  ideasSchema,
  aiUsageSchema,
]

