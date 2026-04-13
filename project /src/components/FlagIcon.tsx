interface FlagIconProps {
  code: 'fr' | 'ar' | 'en' | 'it' | 'ru';
  size?: 'sm' | 'md' | 'lg';
}

const FlagIcon = ({ code, size = 'md' }: FlagIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-[18px] h-3',
    lg: 'w-6 h-4'
  };

  const flags = {
    fr: (
      <div className={`${sizeClasses[size]} rounded-sm overflow-hidden border border-gray-200 shadow-sm flex`} style={{ borderRadius: '2px' }}>
        <div className="w-1/3 bg-[#002395]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#ED2939]"></div>
      </div>
    ),
    ar: (
      <div className={`${sizeClasses[size]} rounded-sm overflow-hidden border border-gray-200 shadow-sm bg-[#E70013] flex items-center justify-center relative`} style={{ borderRadius: '2px' }}>
        <svg viewBox="0 0 32 32" className="w-4 h-4 absolute">
          <circle cx="16" cy="16" r="5" fill="white" />
          <circle cx="17" cy="16" r="4" fill="#E70013" />
          <path d="M 18 12 L 20 16 L 18 20 L 16 18 L 18 16 L 16 14 Z" fill="white" />
        </svg>
      </div>
    ),
    en: (
      <div className={`${sizeClasses[size]} rounded-sm overflow-hidden border border-gray-200 shadow-sm bg-[#012169] relative`} style={{ borderRadius: '2px' }}>
        <svg viewBox="0 0 60 30" className="w-full h-full">
          <rect width="60" height="30" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="white" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30,0 v30 M0,15 h60" stroke="white" strokeWidth="10"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
        </svg>
      </div>
    ),
    it: (
      <div className={`${sizeClasses[size]} rounded-sm overflow-hidden border border-gray-200 shadow-sm flex`} style={{ borderRadius: '2px' }}>
        <div className="w-1/3 bg-[#009246]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#CE2B37]"></div>
      </div>
    ),
    ru: (
      <div className={`${sizeClasses[size]} rounded-sm overflow-hidden border border-gray-200 shadow-sm flex flex-col`} style={{ borderRadius: '2px' }}>
        <div className="h-1/3 bg-white"></div>
        <div className="h-1/3 bg-[#0039A6]"></div>
        <div className="h-1/3 bg-[#D52B1E]"></div>
      </div>
    )
  };

  return flags[code];
};

export default FlagIcon;
