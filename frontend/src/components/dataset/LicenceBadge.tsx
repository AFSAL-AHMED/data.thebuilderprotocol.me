import React from 'react'
import type { LicenceType } from '../../types'
import { licenceLabel } from '../../lib/utils'
import Badge, { type BadgeVariant, type BadgeSize } from '../ui/Badge'

export interface LicenceBadgeProps {
  licence: LicenceType
  size?: BadgeSize
  variant?: BadgeVariant
  className?: string
}

const licenceVariantMap: Partial<Record<LicenceType, BadgeVariant>> = {
  cc0: 'green',
  mit: 'gray',
  apache_2: 'gray',
  cc_by: 'gray',
  cc_by_sa: 'gray',
  cc_by_nc: 'amber',
  proprietary: 'amber',
  other: 'default',
}

export const LicenceBadge: React.FC<LicenceBadgeProps> = ({
  licence,
  size = 'sm',
  variant,
  className,
}) => {
  const resolvedVariant = variant || licenceVariantMap[licence] || 'gray'
  const label = licenceLabel(licence)

  return (
    <Badge variant={resolvedVariant} size={size} className={className}>
      {label}
    </Badge>
  )
}

export default LicenceBadge
