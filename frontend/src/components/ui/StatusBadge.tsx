import React from 'react'
import type { DatasetStatus } from '../../types'
import { statusLabel } from '../../lib/utils'
import Badge, { type BadgeVariant, type BadgeSize } from './Badge'

export interface StatusBadgeProps {
  status: DatasetStatus
  size?: BadgeSize
  className?: string
}

const statusVariantMap: Record<DatasetStatus, BadgeVariant> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
  correction_requested: 'blue',
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  className,
}) => {
  const variant = statusVariantMap[status] || 'default'
  const label = statusLabel(status)

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  )
}

export default StatusBadge
