import { logger } from '../logging/distributedLogger';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemePreferences {
  mode: ThemeMode;
  autoSwitchTime?: {
    darkStart: string;
    lightStart: string;
  };
}

class DarkModeManager {
  private currentMode: ThemeMode = 'auto';
  private actualTheme: 'light' | 'dark' = 'light';
  private mediaQuery: MediaQueryList | null = null;
  private autoSwitchInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const saved = this.loadPreferences();
    this.currentMode = saved.mode;

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    }

    this.applyTheme();

    if (this.currentMode === 'auto') {
      this.startAutoSwitch(saved.autoSwitchTime);
    }

    logger.info('Dark mode manager initialized', { mode: this.currentMode });
  }

  setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    this.savePreferences({ mode });

    if (mode === 'auto') {
      this.startAutoSwitch();
    } else {
      this.stopAutoSwitch();
    }

    this.applyTheme();

    logger.info('Theme mode changed', { mode });
  }

  getMode(): ThemeMode {
    return this.currentMode;
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.actualTheme;
  }

  private applyTheme(): void {
    let theme: 'light' | 'dark' = 'light';

    if (this.currentMode === 'dark') {
      theme = 'dark';
    } else if (this.currentMode === 'light') {
      theme = 'light';
    } else {
      theme = this.determineAutoTheme();
    }

    this.actualTheme = theme;

    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      document.documentElement.setAttribute('data-theme', theme);

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          theme === 'dark' ? '#1a1a1a' : '#ffffff'
        );
      }
    }

    this.dispatchThemeChange(theme);
  }

  private determineAutoTheme(): 'light' | 'dark' {
    const preferences = this.loadPreferences();

    if (preferences.autoSwitchTime) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const { darkStart, lightStart } = preferences.autoSwitchTime;

      if (currentTime >= darkStart || currentTime < lightStart) {
        return 'dark';
      } else {
        return 'light';
      }
    }

    if (this.mediaQuery && this.mediaQuery.matches) {
      return 'dark';
    }

    const hour = new Date().getHours();
    if (hour >= 20 || hour < 7) {
      return 'dark';
    }

    return 'light';
  }

  private handleSystemThemeChange(e: MediaQueryListEvent): void {
    if (this.currentMode === 'auto') {
      logger.debug('System theme changed', { dark: e.matches });
      this.applyTheme();
    }
  }

  private startAutoSwitch(times?: { darkStart: string; lightStart: string }): void {
    this.stopAutoSwitch();

    const checkInterval = 60000;

    this.autoSwitchInterval = setInterval(() => {
      if (this.currentMode === 'auto') {
        const newTheme = this.determineAutoTheme();

        if (newTheme !== this.actualTheme) {
          logger.info('Auto-switching theme', { from: this.actualTheme, to: newTheme });
          this.applyTheme();
        }
      }
    }, checkInterval);

    logger.debug('Auto-switch started');
  }

  private stopAutoSwitch(): void {
    if (this.autoSwitchInterval) {
      clearInterval(this.autoSwitchInterval);
      this.autoSwitchInterval = null;
      logger.debug('Auto-switch stopped');
    }
  }

  setAutoSwitchTimes(darkStart: string, lightStart: string): void {
    const preferences = this.loadPreferences();
    preferences.autoSwitchTime = { darkStart, lightStart };
    this.savePreferences(preferences);

    if (this.currentMode === 'auto') {
      this.startAutoSwitch({ darkStart, lightStart });
      this.applyTheme();
    }

    logger.info('Auto-switch times updated', { darkStart, lightStart });
  }

  private loadPreferences(): ThemePreferences {
    try {
      const saved = localStorage.getItem('theme-preferences');

      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      logger.error('Failed to load theme preferences', error as Error);
    }

    return {
      mode: 'auto',
      autoSwitchTime: {
        darkStart: '20:00',
        lightStart: '07:00'
      }
    };
  }

  private savePreferences(preferences: Partial<ThemePreferences>): void {
    try {
      const current = this.loadPreferences();
      const updated = { ...current, ...preferences };

      localStorage.setItem('theme-preferences', JSON.stringify(updated));
    } catch (error) {
      logger.error('Failed to save theme preferences', error as Error);
    }
  }

  private dispatchThemeChange(theme: 'light' | 'dark'): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('theme-changed', { detail: { theme } })
      );
    }
  }

  onThemeChange(callback: (theme: 'light' | 'dark') => void): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('theme-changed', ((e: CustomEvent) => {
        callback(e.detail.theme);
      }) as EventListener);
    }
  }

  toggle(): void {
    const newMode = this.actualTheme === 'dark' ? 'light' : 'dark';
    this.setMode(newMode);
  }
}

export const darkModeManager = new DarkModeManager();

export function setThemeMode(mode: ThemeMode): void {
  darkModeManager.setMode(mode);
}

export function getThemeMode(): ThemeMode {
  return darkModeManager.getMode();
}

export function getCurrentTheme(): 'light' | 'dark' {
  return darkModeManager.getCurrentTheme();
}

export function toggleTheme(): void {
  darkModeManager.toggle();
}

export function onThemeChange(callback: (theme: 'light' | 'dark') => void): void {
  darkModeManager.onThemeChange(callback);
}

export function setAutoSwitchTimes(darkStart: string, lightStart: string): void {
  darkModeManager.setAutoSwitchTimes(darkStart, lightStart);
}

if (typeof window !== 'undefined') {
  (window as any).darkMode = darkModeManager;
}
