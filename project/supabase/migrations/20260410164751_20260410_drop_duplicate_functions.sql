/*
  # Suppression des versions dupliquées des fonctions RPC

  Les fonctions suivantes ont des doublons avec des signatures différentes.
  On supprime les anciennes versions pour ne garder que les nouvelles (correctes).
*/

-- Supprimer l'ancienne version avec 5 paramètres (p_page_cat en trop)
DROP FUNCTION IF EXISTS public.enterprise_suggest_filtered(text, integer, text, text, text);

-- Supprimer l'ancienne version de search_smart_autocomplete avec signature différente
DROP FUNCTION IF EXISTS public.search_smart_autocomplete(text, integer);
