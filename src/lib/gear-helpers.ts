import type { GearItem } from '@/types';

export const CATEGORY_LABELS: Record<GearItem['category'], string> = {
  body: 'Camera bodies',
  lens: 'Lenses',
  lighting: 'Lighting',
  accessory: 'Accessories',
  bag: 'Bags & cases',
};

export const CATEGORY_ORDER: GearItem['category'][] = [
  'body',
  'lens',
  'lighting',
  'accessory',
  'bag',
];

export const CONDITION_LABELS: Record<GearItem['condition'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  'needs-repair': 'Needs repair',
};

export const CONDITION_STYLES: Record<GearItem['condition'], string> = {
  excellent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  good: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  fair: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'needs-repair': 'bg-red-500/10 text-red-600 border-red-500/20',
};
