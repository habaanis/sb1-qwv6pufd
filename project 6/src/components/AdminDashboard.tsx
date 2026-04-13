import { useState, useEffect } from 'react';
import { supabase } from '../lib/BoltDatabase';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import logger from '../lib/logging/distributedLogger';
import taskQueue from '../lib/queue/taskQueue';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadDashboardData = async () => {
    try {
      const { data: stats } = await supabase.rpc('get_system_stats');
      setSystemStats(stats);

      const qStats = await taskQueue.getQueueStats();
      setQueueStats(qStats);

      const errors = await logger.getRecentLogs(20, 'error' as any);
      setRecentErrors(errors);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      await supabase.rpc('cleanup_old_data');
      alert('Cleanup completed successfully');
      loadDashboardData();
    } catch (error) {
      alert('Cleanup failed: ' + error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Open Admin Dashboard"
      >
        Admin
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* System Stats */}
          {systemStats && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">System Overview</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total Logs</div>
                  <div className="text-2xl font-bold">{systemStats.logs?.total || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Errors (24h)</div>
                  <div className="text-2xl font-bold text-red-600">
                    {systemStats.logs?.errors_24h || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Active Connections</div>
                  <div className="text-2xl font-bold text-green-600">
                    {systemStats.connections?.active || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t.admin.status.backups}</div>
                  <div className="text-2xl font-bold">{systemStats.backups?.total || 0}</div>
                </div>
              </div>

              {systemStats.backups?.last_backup && (
                <div className="mt-4 text-sm text-gray-600">
                  Last backup: {new Date(systemStats.backups.last_backup).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Task Queue Stats */}
          {queueStats && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Task Queue</h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-bold">{queueStats.total}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t.admin.status.pending}</div>
                  <div className="text-2xl font-bold text-yellow-600">{queueStats.pending}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t.admin.status.processing}</div>
                  <div className="text-2xl font-bold text-blue-600">{queueStats.processing}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t.admin.status.completed}</div>
                  <div className="text-2xl font-bold text-green-600">{queueStats.completed}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t.admin.status.failed}</div>
                  <div className="text-2xl font-bold text-red-600">{queueStats.failed}</div>
                </div>
              </div>
            </div>
          )}

          {/* Logs by Level */}
          {systemStats?.logs?.by_level && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Logs by Level (24h)</h3>

              <div className="space-y-2">
                {Object.entries(systemStats.logs.by_level).map(([level, count]: [string, any]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="capitalize">{level}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            level === 'error' || level === 'fatal'
                              ? 'bg-red-600'
                              : level === 'warn'
                              ? 'bg-yellow-600'
                              : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${(count / systemStats.logs.total) * 100}%`
                          }}
                        />
                      </div>
                      <span className="font-bold w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Errors</h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentErrors.map((error, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                    <div className="font-medium text-sm">{error.message}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(error.timestamp).toLocaleString()}
                      {error.url && ` • ${error.url}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={handleCleanup}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Run Cleanup
            </button>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
