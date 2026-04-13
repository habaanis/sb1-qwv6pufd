/**
 * Form Persistence - Système de sauvegarde automatique des formulaires
 *
 * Utilisation : Sauvegarde automatique dans localStorage pour éviter la perte de données
 */

export interface FormData {
  [key: string]: any;
}

export interface FormPersistenceOptions {
  formId: string;
  autoSave?: boolean;
  autoSaveDelay?: number; // ms
}

class FormPersistenceManager {
  private storagePrefix = 'dalilTounes_form_';
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Sauvegarder les données d'un formulaire
   */
  saveForm(formId: string, data: FormData): void {
    try {
      const key = this.getStorageKey(formId);
      const timestamp = new Date().toISOString();
      const payload = {
        data,
        timestamp,
        formId,
      };
      localStorage.setItem(key, JSON.stringify(payload));
      console.log(`💾 Formulaire "${formId}" sauvegardé`, { timestamp, fieldCount: Object.keys(data).length });
    } catch (error) {
      console.error(`❌ Erreur sauvegarde formulaire "${formId}"`, error);
    }
  }

  /**
   * Charger les données d'un formulaire
   */
  loadForm(formId: string): FormData | null {
    try {
      const key = this.getStorageKey(formId);
      const stored = localStorage.getItem(key);

      if (!stored) {
        console.log(`📭 Aucune donnée sauvegardée pour "${formId}"`);
        return null;
      }

      const payload = JSON.parse(stored);
      console.log(`📂 Formulaire "${formId}" chargé`, {
        savedAt: payload.timestamp,
        fieldCount: Object.keys(payload.data).length
      });

      return payload.data;
    } catch (error) {
      console.error(`❌ Erreur chargement formulaire "${formId}"`, error);
      return null;
    }
  }

  /**
   * Supprimer les données d'un formulaire
   */
  clearForm(formId: string): void {
    try {
      const key = this.getStorageKey(formId);
      localStorage.removeItem(key);
      console.log(`🗑️ Formulaire "${formId}" supprimé du cache`);
    } catch (error) {
      console.error(`❌ Erreur suppression formulaire "${formId}"`, error);
    }
  }

  /**
   * Sauvegarder avec délai (debounce)
   */
  autoSaveForm(formId: string, data: FormData, delay: number = 1000): void {
    // Annuler le timer précédent
    const existingTimer = this.autoSaveTimers.get(formId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Créer un nouveau timer
    const timer = setTimeout(() => {
      this.saveForm(formId, data);
      this.autoSaveTimers.delete(formId);
    }, delay);

    this.autoSaveTimers.set(formId, timer);
  }

  /**
   * Vérifier si un formulaire a des données sauvegardées
   */
  hasStoredData(formId: string): boolean {
    const key = this.getStorageKey(formId);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Obtenir l'âge des données sauvegardées (en minutes)
   */
  getDataAge(formId: string): number | null {
    try {
      const key = this.getStorageKey(formId);
      const stored = localStorage.getItem(key);

      if (!stored) return null;

      const payload = JSON.parse(stored);
      const savedTime = new Date(payload.timestamp).getTime();
      const now = Date.now();
      const ageMinutes = Math.floor((now - savedTime) / 1000 / 60);

      return ageMinutes;
    } catch {
      return null;
    }
  }

  /**
   * Obtenir tous les formulaires sauvegardés
   */
  getAllSavedForms(): string[] {
    const forms: string[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const formId = key.replace(this.storagePrefix, '');
          forms.push(formId);
        }
      }
    } catch (error) {
      console.error('❌ Erreur liste formulaires', error);
    }

    return forms;
  }

  /**
   * Nettoyer les vieux formulaires (> X jours)
   */
  cleanOldForms(maxAgeDays: number = 7): void {
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;

    try {
      const forms = this.getAllSavedForms();

      forms.forEach(formId => {
        const key = this.getStorageKey(formId);
        const stored = localStorage.getItem(key);

        if (stored) {
          const payload = JSON.parse(stored);
          const savedTime = new Date(payload.timestamp).getTime();

          if (now - savedTime > maxAgeMs) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      });

      if (cleaned > 0) {
        console.log(`🧹 ${cleaned} formulaire(s) obsolète(s) nettoyé(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage formulaires', error);
    }
  }

  private getStorageKey(formId: string): string {
    return `${this.storagePrefix}${formId}`;
  }

  /**
   * Hook React pour la persistance automatique
   */
  usePersistence<T extends FormData>(
    formId: string,
    initialData: T,
    autoSaveDelay: number = 1000
  ): {
    data: T;
    saveData: (newData: T) => void;
    loadData: () => T | null;
    clearData: () => void;
    hasStored: boolean;
  } {
    const saveData = (newData: T) => {
      this.autoSaveForm(formId, newData, autoSaveDelay);
    };

    const loadData = (): T | null => {
      return this.loadForm(formId) as T | null;
    };

    const clearData = () => {
      this.clearForm(formId);
    };

    const hasStored = this.hasStoredData(formId);

    return {
      data: initialData,
      saveData,
      loadData,
      clearData,
      hasStored,
    };
  }
}

export const formPersistence = new FormPersistenceManager();

// Exposer dans window pour debugging
if (typeof window !== 'undefined') {
  (window as any).formPersistence = formPersistence;
}

// Nettoyer les vieux formulaires au démarrage (> 7 jours)
if (typeof window !== 'undefined') {
  formPersistence.cleanOldForms(7);
}
