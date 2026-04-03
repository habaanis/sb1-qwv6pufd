import React from 'react';
import { SubscriptionTier } from '../lib/subscriptionTiers';

interface TierDebugBadgeProps {
  tier: SubscriptionTier;
  rawValue?: string | null;
  enabled?: boolean;
}

export const TierDebugBadge: React.FC<TierDebugBadgeProps> = ({
  tier,
  rawValue,
  enabled = false
}) => {
  if (!enabled) return null;

  const tierColors: Record<SubscriptionTier, string> = {
    decouverte: 'bg-gray-500',
    artisan: 'bg-purple-600',
    premium: 'bg-green-600',
    elite: 'bg-black',
    custom: 'bg-blue-600'
  };

  return (
    <div className="absolute top-2 left-2 z-20">
      <div className={`${tierColors[tier]} text-white px-2 py-1 rounded text-[10px] font-mono shadow-lg`}>
        <div className="font-bold">{tier.toUpperCase()}</div>
        {rawValue && (
          <div className="text-[8px] opacity-80 mt-0.5">
            DB: {rawValue}
          </div>
        )}
      </div>
    </div>
  );
};
