import React from 'react'
import type { DatasetCategory } from '../../types'
import { categoryLabel } from '../../lib/utils'
import Badge, { type BadgeVariant, type BadgeSize } from '../ui/Badge'

export interface CategoryBadgeProps {
  category: DatasetCategory
  size?: BadgeSize
  className?: string
}

const categoryVariantMap: Record<DatasetCategory, BadgeVariant> = {
  ai_ml: 'gold',
  nlp: 'blue',
  computer_vision: 'amber',
  scientific_research: 'green',
  climate_environment: 'green',
  geospatial: 'blue',
  software_engineering: 'gray',
  public_data: 'default',
  language_culture: 'amber',
  other: 'gray',
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'sm',
  className,
}) => {
  const variant = categoryVariantMap[category] || 'default'
  const label = categoryLabel(category)

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  )
}

export default CategoryBadge
