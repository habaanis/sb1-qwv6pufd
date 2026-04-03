import React, { ReactNode } from 'react';
import { Star, Award, GraduationCap } from 'lucide-react';

interface PremiumWrapperProps {
  isPremium?: boolean;
  children: ReactNode;
  className?: string;
  showBadge?: boolean;
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  variant?: 'card' | 'banner' | 'subtle' | 'none';
  badgeType?: 'premium' | 'certified' | 'education';
  customBadgeText?: string;
}

export default function PremiumWrapper({
  isPremium = false,
  children,
  className = '',
  showBadge = true,
  badgePosition = 'top-right',
  variant = 'card',
  badgeType = 'premium',
  customBadgeText,
}: PremiumWrapperProps) {
  if (!isPremium) {
    return <div className={className}>{children}</div>;
  }

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  const variantClasses = {
    card: 'border-2 border-amber-400 bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 hover:border-amber-300 transition-all duration-300 hover:scale-[1.02] group',
    banner: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300',
    subtle: 'border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50',
    none: '',
  };

  const getBadgeContent = () => {
    if (customBadgeText) {
      return {
        text: customBadgeText,
        icon: <Star className="w-3 h-3 fill-current" />
      };
    }

    const badges = {
      premium: {
        text: 'PREMIUM',
        icon: <Star className="w-3 h-3 fill-current" />
      },
      certified: {
        text: 'TALENT CERTIFIÉ',
        icon: <Award className="w-3 h-3 fill-current" />
      },
      education: {
        text: 'HAUT DIPLÔME',
        icon: <GraduationCap className="w-3 h-3 fill-current" />
      }
    };

    return badges[badgeType] || badges.premium;
  };

  const badge = getBadgeContent();

  return (
    <div className={`relative ${variantClasses[variant]} ${className}`}>
      {/* Effet de scintillement au hover */}
      {variant === 'card' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer" />
        </div>
      )}

      {showBadge && (
        <div className={`absolute ${positionClasses[badgePosition]} z-10`}>
          <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse hover:from-yellow-400 hover:to-amber-400 transition-all">
            {badge.icon}
            {badge.text}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

export function PremiumBadge({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold rounded-full shadow-lg ${sizeClasses[size]} ${className}`}
    >
      <Star className={`${iconSizes[size]} fill-current`} />
      PREMIUM
    </span>
  );
}

export function PremiumGlow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-400/20 rounded-lg blur-xl animate-pulse" />
      <div className="relative">{children}</div>
    </div>
  );
}
