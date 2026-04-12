/*
  # Configuration de l'authentification en mode auto-confirmation
  
  1. Création de la fonction trigger
    - Fonction pour créer automatiquement un profil dans la table appropriée (candidates ou profiles)
    - Utilise les métadonnées user_type pour déterminer le type d'utilisateur
    
  2. Trigger
    - Déclenchement après chaque nouvelle inscription (INSERT sur auth.users)
    - Création automatique du profil candidat ou entreprise
    
  3. Sécurité
    - Le trigger s'exécute avec les privilèges de sécurité pour accéder aux tables
    
  Note: L'auto-confirmation doit être activée dans le dashboard Supabase :
  Authentication > Settings > Enable email confirmations = OFF
*/

-- Fonction pour créer automatiquement le profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_type_value text;
BEGIN
  -- Récupérer le type d'utilisateur depuis les métadonnées
  user_type_value := NEW.raw_user_meta_data->>'user_type';
  
  -- Si c'est un candidat, créer une ligne dans la table candidates
  IF user_type_value = 'candidate' THEN
    INSERT INTO public.candidates (
      id,
      created_by,
      full_name,
      email,
      visibility,
      is_premium,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email,
      'private',
      false,
      NOW(),
      NOW()
    );
  END IF;
  
  -- Toujours créer une ligne dans profiles pour tous les utilisateurs
  INSERT INTO public.profiles (
    id,
    email,
    role,
    is_premium,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'user',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger qui s'exécute après chaque nouvelle inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
