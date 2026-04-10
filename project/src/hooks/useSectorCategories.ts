import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface CategoryOption {
  value: string;
  label: string;
  count?: number;
}

export interface SubCategoryOption {
  value: string;
  label: string;
  count?: number;
}

export function useSectorCategories(secteur: string) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [secteur]);

  const loadCategories = async () => {
    if (!secteur) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('entreprise')
        .select('"catégorie"')
        .contains('secteur', [secteur])
        .not('"catégorie"', 'is', null);

      if (queryError) throw queryError;

      const categoryCounts: Record<string, number> = {};
      data?.forEach((row: any) => {
        const cats = row['catégorie'];
        const catList = Array.isArray(cats) ? cats : (cats ? [cats] : []);
        catList.forEach((cat: string) => {
          if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      });

      const catOptions: CategoryOption[] = Object.entries(categoryCounts)
        .map(([value, count]) => ({
          value,
          label: value,
          count
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setCategories(catOptions);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategoriesByCategory = async (selectedCategory: string) => {
    if (!selectedCategory) {
      setSubCategories([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error: queryError } = await supabase
        .from('entreprise')
        .select('"sous-catégories"')
        .contains('secteur', [secteur])
        .contains('"catégorie"', [selectedCategory])
        .not('"sous-catégories"', 'is', null);

      if (queryError) throw queryError;

      const subCatCounts: Record<string, number> = {};
      data?.forEach((row: any) => {
        const subCats = row['sous-catégories'];
        const subCatList = Array.isArray(subCats) ? subCats : (subCats ? [subCats] : []);
        subCatList.forEach((subCat: string) => {
          if (subCat) subCatCounts[subCat] = (subCatCounts[subCat] || 0) + 1;
        });
      });

      const subCatOptions: SubCategoryOption[] = Object.entries(subCatCounts)
        .map(([value, count]) => ({
          value,
          label: value,
          count
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setSubCategories(subCatOptions);
    } catch (err) {
      console.error('Erreur chargement sous-catégories:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    subCategories,
    loading,
    error,
    loadSubCategoriesByCategory
  };
}
