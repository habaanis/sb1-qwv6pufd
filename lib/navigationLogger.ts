/**
 * Navigation Logger - Système de débogage pour tracer les navigations
 *
 * Utilisation : Logs tous les changements de page avec raison et timestamp
 */

export type NavigationReason =
  | 'user_click_logo'
  | 'user_click_menu'
  | 'hash_change'
  | 'redirect_missing_data'
  | 'redirect_error'
  | 'programmatic'
  | 'back_navigation'
  | 'form_submit'
  | 'auth_change';

interface NavigationLog {
  timestamp: string;
  from: string;
  to: string;
  reason: NavigationReason;
  blocked?: boolean;
  metadata?: Record<string, any>;
}

class NavigationLogger {
  private logs: NavigationLog[] = [];
  private maxLogs = 50;
  private enabled = true;

  log(from: string, to: string, reason: NavigationReason, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const log: NavigationLog = {
      timestamp,
      from,
      to,
      reason,
      metadata
    };

    this.logs.push(log);

    // Garder seulement les 50 derniers logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log dans la console avec style
    const emoji = this.getEmoji(reason);
    const style = this.getStyle(reason);

    console.log(
      `%c${emoji} Navigation ${reason}`,
      style,
      `\n  De: ${from}\n  Vers: ${to}`,
      metadata ? `\n  Metadata:` : '',
      metadata || ''
    );
  }

  blockNavigation(from: string, to: string, reason: NavigationReason, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const log: NavigationLog = {
      timestamp,
      from,
      to,
      reason,
      blocked: true,
      metadata
    };

    this.logs.push(log);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.warn(
      `🚫 Navigation vers Home BLOQUÉE`,
      `\n  De: ${from}\n  Vers: ${to}\n  Raison: ${reason}`,
      metadata ? `\n  Metadata:` : '',
      metadata || ''
    );
  }

  allowNavigation(from: string, to: string, reason: NavigationReason, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    console.log(
      `✅ Navigation vers Home AUTORISÉE`,
      `\n  De: ${from}\n  Vers: ${to}\n  Raison: ${reason}`,
      metadata ? `\n  Metadata:` : '',
      metadata || ''
    );

    this.log(from, to, reason, metadata);
  }

  private getEmoji(reason: NavigationReason): string {
    const emojiMap: Record<NavigationReason, string> = {
      user_click_logo: '🏠',
      user_click_menu: '📱',
      hash_change: '🔗',
      redirect_missing_data: '⚠️',
      redirect_error: '❌',
      programmatic: '⚙️',
      back_navigation: '◀️',
      form_submit: '📝',
      auth_change: '🔐'
    };
    return emojiMap[reason] || '➡️';
  }

  private getStyle(reason: NavigationReason): string {
    if (reason === 'redirect_missing_data' || reason === 'redirect_error') {
      return 'color: #ff6b6b; font-weight: bold; padding: 2px 4px; background: #fff5f5;';
    }
    if (reason === 'user_click_logo' || reason === 'user_click_menu') {
      return 'color: #51cf66; font-weight: bold; padding: 2px 4px; background: #f3faf7;';
    }
    return 'color: #228be6; font-weight: bold; padding: 2px 4px; background: #f0f7ff;';
  }

  getLogs(): NavigationLog[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 10): NavigationLog[] {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
    console.log('🧹 Logs de navigation effacés');
  }

  enable() {
    this.enabled = true;
    console.log('✅ Navigation logger activé');
  }

  disable() {
    this.enabled = false;
    console.log('❌ Navigation logger désactivé');
  }

  printReport() {
    console.group('📊 Rapport Navigation');
    console.log(`Total navigations: ${this.logs.length}`);

    const byReason = this.logs.reduce((acc, log) => {
      acc[log.reason] = (acc[log.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Par raison:', byReason);

    const blocked = this.logs.filter(l => l.blocked).length;
    console.log(`Navigations bloquées: ${blocked}`);

    console.log('\nDernières navigations:');
    this.getRecentLogs(5).forEach(log => {
      console.log(`  ${log.blocked ? '🚫' : '✅'} ${log.from} → ${log.to} (${log.reason})`);
    });

    console.groupEnd();
  }
}

export const navigationLogger = new NavigationLogger();

// Exposer dans window pour debugging en console
if (typeof window !== 'undefined') {
  (window as any).navigationLogger = navigationLogger;
}
