/**
 * Navigation Config
 *
 * Add one entry per nav item. Routes are handled by generouted
 * (file-based routing in src/pages/), this just controls what
 * appears in the navigation bar.
 */

import type { Role } from './constants'

export interface NavItem {
  path: string
  label: string
  roles?: Role[]
  devOnly?: boolean
}

export const nav: NavItem[] = [
  { path: '/home', label: 'Dashboard' },
  { path: '/experiments', label: 'Experiments' },
  { path: '/facts', label: 'Claim Guard Facts' },
  { path: '/playbooks', label: 'Playbooks' },
  { path: '/backlog', label: 'Idea Backlog' },
  { path: '/settings', label: 'Settings' },
]
