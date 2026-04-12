import React, { ReactNode } from 'react';

interface SignatureCardProps {
  children: ReactNode;
  tier?: 'decouverte' | 'artisan' | 'premium' | 'elite' | 'custom';
  isPremium?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SignatureCard = ({
  children,
  tier,
  isPremium = false,
  onClick,
  className = ''
}: SignatureCardProps) => {
  const getTierStyles = () => {
    if (tier) {
      switch (tier) {
        case 'decouverte':
          return {
            backgroundColor: '#FFFFFF',
            borderColor: '#D4AF37',
            borderWidth: '2px',
            borderStyle: 'solid',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.3), 0 4px 12px rgba(212, 175, 55, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)'
          };
        case 'artisan':
          return {
            backgroundColor: '#4A1D43',
            borderColor: '#D4AF37',
            borderWidth: '2px',
            borderStyle: 'solid',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.4), 0 8px 32px rgba(212,175,55,0.2), 0 4px 16px rgba(0,0,0,0.15)'
          };
        case 'premium':
          return {
            backgroundColor: '#064E3B',
            borderColor: '#D4AF37',
            borderWidth: '2px',
            borderStyle: 'solid',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.4), 0 8px 32px rgba(212,175,55,0.2), 0 4px 16px rgba(0,0,0,0.15)'
          };
        case 'elite':
          return {
            backgroundColor: '#121212',
            borderColor: '#D4AF37',
            borderWidth: '2px',
            borderStyle: 'solid',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.4), 0 8px 32px rgba(212,175,55,0.2), 0 4px 16px rgba(0,0,0,0.15)'
          };
        case 'custom':
          return {
            backgroundColor: '#F9FAFB',
            borderColor: '#9CA3AF',
            borderWidth: '2px',
            borderStyle: 'dashed',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          };
        default:
          return {
            backgroundColor: '#FFFFFF',
            borderColor: '#D4AF37',
            borderWidth: '2px',
            borderStyle: 'solid',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.3), 0 4px 12px rgba(212, 175, 55, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)'
          };
      }
    }

    return isPremium
      ? {
          backgroundColor: '#4A1D43',
          borderColor: '#D4AF37',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.4), 0 8px 32px rgba(212,175,55,0.2), 0 4px 16px rgba(0,0,0,0.15)'
        }
      : {
          backgroundColor: '#FFFFFF',
          borderColor: '#D4AF37',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.3), 0 4px 12px rgba(212, 175, 55, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)'
        };
  };

  const styles = getTierStyles();
  const showShineEffect = tier === 'artisan' || tier === 'premium' || tier === 'elite' || isPremium;

  return (
    <div
      onClick={onClick}
      style={{
        ...styles,
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate'
      }}
      className={`
        group
        hover:-translate-y-1
        ${onClick ? 'cursor-pointer' : ''}
        ${tier === 'elite' ? 'modal-shine-elite' : tier === 'premium' ? 'modal-shine-premium' : ''}
        ${className}
      `}
    >
      {showShineEffect && (
        <>
          <div
            className="absolute inset-0 rounded-[16px] pointer-events-none shine-effect"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.4) 30%, rgba(255, 255, 255, 0.8) 50%, rgba(212, 175, 55, 0.4) 70%, transparent 100%)',
              maxWidth: '100%',
              width: '100%'
            }}
          />
          <style>{`
            @keyframes shine {
              0% {
                transform: translateX(-150%) skewX(-15deg);
                opacity: 0;
              }
              30% {
                opacity: 1;
              }
              70% {
                opacity: 1;
              }
              100% {
                transform: translateX(150%) skewX(-15deg);
                opacity: 0;
              }
            }
            .shine-effect {
              animation: shine 2s ease-in-out 0.3s;
              transform: translateX(-150%) skewX(-15deg);
              opacity: 0;
              max-width: 100%;
              contain: paint;
            }
            .group:hover .shine-effect {
              animation: shine 1.5s ease-in-out;
            }
          `}</style>
        </>
      )}
      {children}
    </div>
  );
};

export default SignatureCard;
