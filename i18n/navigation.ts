import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Locale-aware navigation (MOTIR-7948) for the switcher and the catalogue-reader
 * cards. Nothing in the tree is converted to these here: every existing link
 * still targets an English, unprefixed address, which `as-needed` serves
 * unchanged.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
