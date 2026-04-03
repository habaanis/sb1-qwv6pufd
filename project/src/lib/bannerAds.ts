import { supabase as BoltDatabase } from './BoltDatabase';

export interface BannerEntreprise {
  id: string;
  nom: string;
  image_url: string | null;
}

export async function getHomeBannerEntreprises(): Promise<BannerEntreprise[]> {
  const { data, error } = await BoltDatabase
    .from('entreprise')
    .select('id, nom, image_url')
    .eq('home_featured', true)
    .limit(12);

  if (error) {
    console.error('Erreur Supabase (home banner):', error.message);
    return [];
  }

  return (data as BannerEntreprise[]) ?? [];
}

export async function getCitizensBannerEntreprises(): Promise<BannerEntreprise[]> {
  const { data, error } = await BoltDatabase
    .from('entreprise')
    .select('id, nom, image_url')
    .eq('featured', true)
    .limit(12);

  if (error) {
    console.error('Erreur Supabase (citizens banner):', error.message);
    return [];
  }

  return (data as BannerEntreprise[]) ?? [];
}
