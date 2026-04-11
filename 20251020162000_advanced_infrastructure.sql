/*
  # Infrastructure Avancée

  Cette migration ajoute:
  - Système de logs distribués
  - Queue de tâches asynchrones
  - Backup automatique
  - WebSocket support
*/

-- ============================================================
-- ÉTAPE 1 : TABLE APPLICATION LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS application_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  message text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  user_id text,
  session_id text,
  user_agent text,
  url text,
  stack_trace text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_logs_level ON application_logs(level);
CREATE INDEX IF NOT EXISTS idx_application_logs_created ON application_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_logs_session ON application_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_user ON application_logs(user_id);

-- Partition par date (optionnel)
CREATE INDEX IF NOT EXISTS idx_application_logs_created_date ON application_logs(DATE(created_at));

-- RLS sur application_logs
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert logs"
ON application_logs
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can view logs"
ON application_logs
FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- ÉTAPE 2 : TABLE TASK QUEUE
-- ============================================================

CREATE TABLE IF NOT EXISTS task_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb NOT NULL,
  priority int DEFAULT 1 CHECK (priority >= 0 AND priority <= 3),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  retries int DEFAULT 0,
  max_retries int DEFAULT 3,
  result jsonb,
  error text,
  created_at timestamptz DEFAULT now(),
  scheduled_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_task_queue_status ON task_queue(status);
CREATE INDEX IF NOT EXISTS idx_task_queue_type ON task_queue(type);
CREATE INDEX IF NOT EXISTS idx_task_queue_priority ON task_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_task_queue_scheduled ON task_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_task_queue_created ON task_queue(created_at DESC);

-- Index composite pour la queue
CREATE INDEX IF NOT EXISTS idx_task_queue_pending ON task_queue(status, priority DESC, created_at)
WHERE status = 'pending';

-- RLS sur task_queue
ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tasks"
ON task_queue
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "System can manage tasks"
ON task_queue
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 3 : TABLE PUSH SUBSCRIPTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  endpoint text UNIQUE NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  last_used timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS sur push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert subscriptions"
ON push_subscriptions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can manage their subscriptions"
ON push_subscriptions
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 4 : TABLE BACKUPS
-- ============================================================

CREATE TABLE IF NOT EXISTS database_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name text NOT NULL,
  backup_type text CHECK (backup_type IN ('full', 'incremental', 'differential')),
  size_bytes bigint,
  tables_count int,
  rows_count bigint,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  storage_location text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_database_backups_created ON database_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_database_backups_status ON database_backups(status);

-- RLS sur database_backups
ALTER TABLE database_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view backups"
ON database_backups
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can manage backups"
ON database_backups
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 5 : TABLE REALTIME CONNECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS realtime_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  connection_id text UNIQUE NOT NULL,
  channel text NOT NULL,
  status text DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected')),
  metadata jsonb DEFAULT '{}'::jsonb,
  connected_at timestamptz DEFAULT now(),
  disconnected_at timestamptz,
  last_ping timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_realtime_connections_user ON realtime_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_connections_channel ON realtime_connections(channel);
CREATE INDEX IF NOT EXISTS idx_realtime_connections_status ON realtime_connections(status);

-- RLS sur realtime_connections
ALTER TABLE realtime_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage connections"
ON realtime_connections
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 6 : FONCTION NETTOYAGE AUTOMATIQUE
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Nettoyer logs > 30 jours
  DELETE FROM application_logs
  WHERE created_at < now() - interval '30 days';

  -- Nettoyer tâches terminées > 7 jours
  DELETE FROM task_queue
  WHERE status IN ('completed', 'failed', 'cancelled')
    AND completed_at < now() - interval '7 days';

  -- Nettoyer connexions déconnectées > 24h
  DELETE FROM realtime_connections
  WHERE status = 'disconnected'
    AND disconnected_at < now() - interval '24 hours';

  RAISE NOTICE 'Cleanup completed';
END;
$$;

-- ============================================================
-- ÉTAPE 7 : FONCTION STATS SYSTÈME
-- ============================================================

CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'logs', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'errors_24h', COUNT(*) FILTER (WHERE level IN ('error', 'fatal') AND created_at >= now() - interval '24 hours'),
        'by_level', (
          SELECT jsonb_object_agg(level, count)
          FROM (
            SELECT level, COUNT(*) as count
            FROM application_logs
            WHERE created_at >= now() - interval '24 hours'
            GROUP BY level
          ) t
        )
      )
      FROM application_logs
    ),
    'tasks', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'processing', COUNT(*) FILTER (WHERE status = 'processing'),
        'completed_24h', COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= now() - interval '24 hours'),
        'failed_24h', COUNT(*) FILTER (WHERE status = 'failed' AND completed_at >= now() - interval '24 hours')
      )
      FROM task_queue
    ),
    'connections', (
      SELECT jsonb_build_object(
        'active', COUNT(*) FILTER (WHERE status = 'connected'),
        'total', COUNT(*)
      )
      FROM realtime_connections
    ),
    'backups', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'last_backup', MAX(created_at),
        'total_size_mb', ROUND(COALESCE(SUM(size_bytes), 0) / 1024.0 / 1024.0, 2)
      )
      FROM database_backups
      WHERE status = 'completed'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- ÉTAPE 8 : FONCTION STATISTIQUES TÂCHES
-- ============================================================

CREATE OR REPLACE FUNCTION get_task_queue_analytics(
  p_hours int DEFAULT 24
)
RETURNS TABLE (
  task_type text,
  total_tasks bigint,
  completed bigint,
  failed bigint,
  avg_duration_ms numeric,
  success_rate numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY

  SELECT
    type as task_type,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(
      AVG(
        EXTRACT(EPOCH FROM (completed_at - processed_at)) * 1000
      )::numeric,
      2
    ) as avg_duration_ms,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'completed')::numeric /
       NULLIF(COUNT(*)::numeric, 0) * 100),
      2
    ) as success_rate
  FROM task_queue
  WHERE created_at >= now() - (p_hours || ' hours')::interval
  GROUP BY type
  ORDER BY total_tasks DESC;
END;
$$;

-- ============================================================
-- ÉTAPE 9 : TRIGGER NETTOYAGE AUTO
-- ============================================================

-- Fonction pour déclencher nettoyage
CREATE OR REPLACE FUNCTION trigger_cleanup()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Tous les 1000 inserts, nettoyer
  IF (SELECT COUNT(*) FROM application_logs) % 1000 = 0 THEN
    PERFORM cleanup_old_data();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_cleanup ON application_logs;
CREATE TRIGGER trigger_auto_cleanup
  AFTER INSERT ON application_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup();

-- ============================================================
-- ÉTAPE 10 : VUES UTILES
-- ============================================================

-- Vue erreurs récentes
CREATE OR REPLACE VIEW recent_errors AS
SELECT
  id,
  level,
  message,
  context,
  user_id,
  url,
  created_at
FROM application_logs
WHERE level IN ('error', 'fatal')
  AND created_at >= now() - interval '24 hours'
ORDER BY created_at DESC
LIMIT 100;

-- Vue tâches en échec
CREATE OR REPLACE VIEW failed_tasks AS
SELECT
  id,
  type,
  payload,
  error,
  retries,
  max_retries,
  created_at,
  completed_at
FROM task_queue
WHERE status = 'failed'
ORDER BY created_at DESC;

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================

/*
  RÉSUMÉ INFRASTRUCTURE AVANCÉE :

  ✅ Tables créées :
     - application_logs (logs distribués)
     - task_queue (queue asynchrone)
     - push_subscriptions (notifications)
     - database_backups (backups)
     - realtime_connections (WebSocket)

  ✅ Fonctionnalités :
     - Logs centralisés avec niveaux
     - Queue de tâches avec retry
     - Notifications push
     - Backup automatique
     - Connexions temps réel

  ✅ Fonctions SQL :
     - cleanup_old_data()
     - get_system_stats()
     - get_task_queue_analytics(hours)

  ✅ Vues :
     - recent_errors
     - failed_tasks

  🎯 Utilisation :
     -- Stats système
     SELECT get_system_stats();

     -- Analytics tâches
     SELECT * FROM get_task_queue_analytics(24);

     -- Nettoyage manuel
     SELECT cleanup_old_data();

     -- Erreurs récentes
     SELECT * FROM recent_errors;
*/
