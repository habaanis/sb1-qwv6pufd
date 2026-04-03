import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { supabase, getEtablissementsCount } from '../lib/BoltDatabase';
import { Language } from '../lib/i18n';

interface CompanyCountCardProps {
  language: Language;
}

const translations = {
  fr: {
    before: '',
    after: ' entreprises tunisiennes font déjà partie du réseau Dalil Tounes.',
    sub: 'Un réseau qui grandit chaque jour',
  },
  en: {
    before: '',
    after: ' Tunisian companies are already part of the Dalil Tounes network.',
    sub: 'A network that grows every day',
  },
  ar: {
    before: 'انضمت بالفعل ',
    after: ' شركة تونسية إلى شبكة دليل تونس.',
    sub: 'شبكة تنمو كل يوم',
  },
  it: {
    before: '',
    after: ' aziende tunisine fanno già parte della rete Dalil Tounes.',
    sub: 'Una rete che cresce ogni giorno',
  },
  ru: {
    before: 'Уже ',
    after: ' тунисских компаний являются частью сети Dalil Tounes.',
    sub: 'Сеть, которая растёт каждый день',
  },
};

export default function CompanyCountCard({ language }: CompanyCountCardProps) {
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const t = translations[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    async function fetchCount() {
      try {
        const count = await getEtablissementsCount();
        setTotal(count);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du nombre :', error);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCount();

    const subscription = supabase
      .channel('entreprise-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entreprise' },
        async () => {
          const newCount = await getEtablissementsCount();
          setTotal(newCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center justify-center text-center py-12 my-10 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-[2px] bg-[#D62828]/60 rounded-full" />

      <h3
        className={`text-2xl md:text-3xl font-medium text-[#D62828] leading-snug max-w-3xl transition-all duration-500 ${
          isRTL ? 'text-right' : 'text-center'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {t.before}
        {isLoading ? '...' : <CountUp end={total} duration={2.5} separator=" " />}
        {t.after}
      </h3>

      <p
        className={`text-gray-600 text-base md:text-lg mt-3 ${
          isRTL ? 'text-right' : 'text-center'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {t.sub}
      </p>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-[2px] bg-[#D62828]/60 rounded-full" />
    </div>
  );
}
