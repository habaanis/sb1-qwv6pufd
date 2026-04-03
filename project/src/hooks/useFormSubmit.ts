import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFormTranslation } from './useFormTranslation';
import { supabase } from '../lib/supabaseClient';

interface FormSubmitOptions {
  tableName: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showAlert?: boolean;
  validateData?: (data: any) => boolean;
}

export function useFormSubmit(options: FormSubmitOptions) {
  const { language } = useLanguage();
  const { message } = useFormTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async <T extends Record<string, any>>(formData: T) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (options.validateData && !options.validateData(formData)) {
        throw new Error(message('champ_requis'));
      }

      const dataToSubmit = {
        ...formData,
        langue: language,
        submission_lang: language,
      };

      const { error: supabaseError } = await supabase
        .from(options.tableName)
        .insert([dataToSubmit]);

      if (supabaseError) {
        throw supabaseError;
      }

      if (options.showAlert !== false) {
        alert(message('succes'));
      }

      if (options.onSuccess) {
        options.onSuccess();
      }

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : message('erreur');
      setError(errorMessage);

      if (options.showAlert !== false) {
        alert(errorMessage);
      }

      if (options.onError && err instanceof Error) {
        options.onError(err);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submit,
    isSubmitting,
    error,
    language,
    submission_lang: language,
  };
}
