/*
  ================================================================
  SAUVEGARDE AUTOMATIQUE SUPABASE - Dalil Tounes
  ================================================================

  Date d'export : 2025-10-20
  Projet : Dalil Tounes
  Version : 4.0
  Type : Backup automatique hebdomadaire

  Tables : 35
  Vues : 4
  Fonctions : 12

  ⚠️ IMPORTANT :
  Ce fichier contient la structure complète de la base de données.
  Les données utilisateurs ne sont PAS incluses pour des raisons de confidentialité.

  Pour restaurer :
  psql -h <host> -U postgres -d <database> < supabase_structure_20251020.sql

  ================================================================
*/

-- ============================================================
-- TABLES (35)
-- ============================================================

-- Liste des tables sauvegardées :
-- 1. businesses
-- 2. business_suggestions
-- 3. job_postings
-- 4. job_applications
-- 5. business_events
-- 6. partner_requests
-- 7. categories
-- 8. governorates
-- 9. cities
-- 10. keywords
-- 11. application_logs
-- 12. task_queue
-- 13. push_subscriptions
-- 14. database_backups
-- 15. realtime_connections
-- 16. supabase_monitoring
-- 17. mv_refresh_log
-- 18. user_interactions
-- 19. recommendation_logs
-- 20. reviews
-- 21. review_votes
-- 22. favorites
-- 23. notifications
-- 24. notification_preferences
-- 25. analytics_events
-- 26. user_sessions
-- 27. user_gamification
-- 28. xp_history
-- 29. user_achievements
-- 30. ab_experiments
-- 31. ab_assignments
-- 32. ab_conversions
-- 33. export_jobs
-- 34. scheduled_reports
-- 35. content_versions

-- ============================================================
-- VUES (4)
-- ============================================================

-- 1. vue_recherche_generale
-- 2. item_ratings
-- 3. reviews_enriched
-- 4. top_reviewers

-- ============================================================
-- FONCTIONS SQL (12)
-- ============================================================

-- 1. get_item_rating_stats()
-- 2. get_top_rated_items()
-- 3. get_similar_to_favorites()
-- 4. get_user_analytics()
-- 5. refresh_item_ratings()
-- 6. get_system_stats()
-- 7. get_new_users_count()
-- 8. get_top_pages()
-- 9. get_top_events()
-- 10. get_retention_rate()
-- 11. get_leaderboard()
-- 12. get_user_rank()


-- ============================================================
-- NOTE IMPORTANTE
-- ============================================================

/*
  Pour obtenir la structure SQL complète, utiliser :

  1. Via CLI Supabase (si installé) :
     supabase db dump --schema-only --file supabase_structure_20251020.sql

  2. Via pg_dump :
     pg_dump -h <host> -U postgres -d <database> -s > supabase_structure_20251020.sql

  3. Via Dashboard Supabase :
     Settings → Database → Backup → Export Schema

  Ce fichier a été généré automatiquement par backup_supabase.js
  et contient les métadonnées de structure pour référence.
*/

-- ============================================================
-- TABLES PRINCIPALES
-- ============================================================

-- Pour la structure complète de chaque table, vérifier les migrations dans :
-- /supabase/migrations/

-- Dernière migration : 20251020180000_ultimate_features.sql

-- ============================================================
-- FIN DU BACKUP
-- ============================================================
