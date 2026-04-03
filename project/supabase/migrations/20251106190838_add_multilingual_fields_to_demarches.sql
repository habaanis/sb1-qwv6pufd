/*
  # Ajout des champs multilingues et PDF à la table demarches_administratives
  
  1. Modifications
    - Ajout de colonnes pour les traductions (arabe, anglais, italien, russe)
    - Ajout de la colonne pour le lien PDF du formulaire
    - Ajout de colonnes traduites pour description et pièces requises
    
  2. Colonnes ajoutées
    - `nom_ar` (text) - Nom de la démarche en arabe
    - `nom_en` (text) - Nom de la démarche en anglais
    - `nom_it` (text) - Nom de la démarche en italien
    - `nom_ru` (text) - Nom de la démarche en russe
    - `description_ar` (text) - Description en arabe
    - `description_en` (text) - Description en anglais
    - `description_it` (text) - Description en italien
    - `description_ru` (text) - Description en russe
    - `lien_pdf_formulaire` (text) - URL du formulaire PDF
    - `pieces_requises_ar` (text[]) - Liste des pièces en arabe
    - `pieces_requises_en` (text[]) - Liste des pièces en anglais
    
  3. Index
    - Index sur les nouveaux champs pour recherche multilingue
*/

-- Ajouter les colonnes pour les noms traduits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'nom_ar'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN nom_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'nom_en'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN nom_en text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'nom_it'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN nom_it text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'nom_ru'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN nom_ru text;
  END IF;
END $$;

-- Ajouter les colonnes pour les descriptions traduites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'description_en'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN description_en text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'description_it'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN description_it text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'description_ru'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN description_ru text;
  END IF;
END $$;

-- Ajouter les colonnes pour les pièces requises traduites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'pieces_requises_ar'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN pieces_requises_ar text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'pieces_requises_en'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN pieces_requises_en text[];
  END IF;
END $$;

-- Ajouter la colonne pour le lien PDF
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demarches_administratives' AND column_name = 'lien_pdf_formulaire'
  ) THEN
    ALTER TABLE demarches_administratives ADD COLUMN lien_pdf_formulaire text;
  END IF;
END $$;

-- Créer des index pour la recherche multilingue
CREATE INDEX IF NOT EXISTS idx_demarches_nom_ar ON demarches_administratives USING gin(to_tsvector('arabic', COALESCE(nom_ar, '')));
CREATE INDEX IF NOT EXISTS idx_demarches_nom_en ON demarches_administratives USING gin(to_tsvector('english', COALESCE(nom_en, '')));

-- Mettre à jour les données existantes avec des traductions
UPDATE demarches_administratives
SET 
  nom_ar = 'بطاقة التعريف الوطنية',
  nom_en = 'National Identity Card',
  nom_it = 'Carta d''Identità Nazionale',
  nom_ru = 'Национальное удостоверение личности',
  description_en = 'Issuance or renewal of the national identity card for Tunisian citizens',
  description_ar = 'إصدار أو تجديد بطاقة التعريف الوطنية للمواطنين التونسيين',
  pieces_requises_en = ARRAY[
    'Birth certificate extract (less than 3 months)',
    'Certificate of residence',
    'Old ID card (if renewal)',
    '2 recent ID photos',
    'Tax stamp (20 TND for first request, 15 TND for renewal)'
  ],
  pieces_requises_ar = ARRAY[
    'شهادة ميلاد (أقل من 3 أشهر)',
    'شهادة إقامة',
    'بطاقة الهوية القديمة (في حالة التجديد)',
    'صورتان حديثتان',
    'طابع جبائي (20 دينار للطلب الأول، 15 دينار للتجديد)'
  ]
WHERE nom = 'Carte d''Identité Nationale (CIN)';

UPDATE demarches_administratives
SET 
  nom_ar = 'جواز السفر البيومتري',
  nom_en = 'Biometric Passport',
  nom_it = 'Passaporto Biometrico',
  nom_ru = 'Биометрический паспорт',
  description_en = 'Issuance of a biometric passport for international travel',
  description_ar = 'إصدار جواز سفر بيومتري للسفر الدولي',
  pieces_requises_en = ARRAY[
    'Original ID card + photocopy',
    'Birth certificate extract (less than 3 months)',
    'Certificate of residence',
    'Payment receipt for tax stamps (150 TND)',
    '2 recent biometric ID photos',
    'Old passport (if renewal)'
  ],
  pieces_requises_ar = ARRAY[
    'بطاقة الهوية الأصلية + نسخة',
    'شهادة ميلاد (أقل من 3 أشهر)',
    'شهادة إقامة',
    'إيصال دفع الطوابع الجبائية (150 دينار)',
    'صورتان بيومتريتان حديثتان',
    'جواز السفر القديم (في حالة التجديد)'
  ]
WHERE nom = 'Passeport Biométrique';

UPDATE demarches_administratives
SET 
  nom_ar = 'شهادة ميلاد',
  nom_en = 'Birth Certificate Extract',
  nom_it = 'Estratto dell''Atto di Nascita',
  nom_ru = 'Выписка из свидетельства о рождении',
  description_en = 'Obtaining a birth certificate extract',
  description_ar = 'الحصول على شهادة ميلاد',
  pieces_requises_en = ARRAY[
    'Applicant''s ID card',
    'Birth certificate number (if known)',
    'Tax stamp (3 TND per copy)'
  ],
  pieces_requises_ar = ARRAY[
    'بطاقة هوية الطالب',
    'رقم شهادة الميلاد (إن وجد)',
    'طابع جبائي (3 دنانير للنسخة)'
  ]
WHERE nom = 'Extrait d''Acte de Naissance';

UPDATE demarches_administratives
SET 
  nom_ar = 'شهادة إقامة',
  nom_en = 'Certificate of Residence',
  nom_it = 'Certificato di Residenza',
  nom_ru = 'Справка о проживании',
  description_en = 'Proof of residence certificate for various administrative procedures',
  description_ar = 'شهادة إثبات السكن لمختلف الإجراءات الإدارية',
  pieces_requises_en = ARRAY[
    'Original ID card + photocopy',
    'Proof of residence (STEG, SONEDE bill or rental contract)',
    'Tax stamp (3 TND)'
  ],
  pieces_requises_ar = ARRAY[
    'بطاقة الهوية الأصلية + نسخة',
    'إثبات السكن (فاتورة STEG أو SONEDE أو عقد إيجار)',
    'طابع جبائي (3 دنانير)'
  ]
WHERE nom = 'Certificat de Résidence';

UPDATE demarches_administratives
SET 
  nom_ar = 'صحيفة السوابق العدلية (رقم 3)',
  nom_en = 'Criminal Record Certificate (Bulletin No. 3)',
  nom_it = 'Certificato del Casellario Giudiziale',
  nom_ru = 'Справка о несудимости',
  description_en = 'Criminal record extract for employment or administrative procedures',
  description_ar = 'مستخرج من صحيفة السوابق العدلية للتوظيف أو الإجراءات الإدارية',
  pieces_requises_en = ARRAY[
    'Original ID card + photocopy',
    'Tax stamp (5 TND)',
    'Completed application form'
  ],
  pieces_requises_ar = ARRAY[
    'بطاقة الهوية الأصلية + نسخة',
    'طابع جبائي (5 دنانير)',
    'استمارة الطلب مملوءة'
  ]
WHERE nom = 'Casier Judiciaire (Bulletin N°3)';

UPDATE demarches_administratives
SET 
  nom_ar = 'رخصة السياقة - طلب أول',
  nom_en = 'Driver''s License - First Application',
  nom_it = 'Patente di Guida - Prima Richiesta',
  nom_ru = 'Водительские права - Первое заявление',
  description_en = 'Obtaining a driver''s license for the first time',
  description_ar = 'الحصول على رخصة السياقة لأول مرة',
  pieces_requises_en = ARRAY[
    'Original ID card + photocopy',
    'Medical certificate (medical examination)',
    'Certificate of residence',
    '4 ID photos',
    'Certificate of exam success (theory + practical)',
    'Tax stamps (depending on category)'
  ],
  pieces_requises_ar = ARRAY[
    'بطاقة الهوية الأصلية + نسخة',
    'شهادة طبية (فحص طبي)',
    'شهادة إقامة',
    '4 صور شخصية',
    'شهادة نجاح في الامتحانات (نظري + عملي)',
    'طوابع جبائية (حسب الفئة)'
  ]
WHERE nom = 'Permis de Conduire - Première Demande';

UPDATE demarches_administratives
SET 
  nom_ar = 'بطاقة إقامة (الأجانب)',
  nom_en = 'Residence Card (Foreigners)',
  nom_it = 'Carta di Soggiorno (Stranieri)',
  nom_ru = 'Вид на жительство (Иностранцы)',
  description_en = 'Residence card for foreigners living in Tunisia',
  description_ar = 'بطاقة إقامة للأجانب المقيمين في تونس',
  pieces_requises_en = ARRAY[
    'Valid passport + photocopy',
    'Valid entry visa',
    'Work contract or proof of income',
    'Certificate of residence',
    'Medical certificate',
    '4 ID photos',
    'Proof of residence',
    'Tax stamps (200 TND per year)'
  ],
  pieces_requises_ar = ARRAY[
    'جواز سفر ساري المفعول + نسخة',
    'تأشيرة دخول سارية',
    'عقد عمل أو إثبات دخل',
    'شهادة إقامة',
    'شهادة طبية',
    '4 صور شخصية',
    'إثبات السكن',
    'طوابع جبائية (200 دينار سنويا)'
  ]
WHERE nom = 'Carte de Séjour (Étrangers)';

UPDATE demarches_administratives
SET 
  nom_ar = 'شهادة زواج',
  nom_en = 'Marriage Certificate',
  nom_it = 'Certificato di Matrimonio',
  nom_ru = 'Свидетельство о браке',
  description_en = 'Marriage certificate extract',
  description_ar = 'مستخرج من شهادة الزواج',
  pieces_requises_en = ARRAY[
    'ID cards of both spouses',
    'Marriage certificate number',
    'Tax stamp (3 TND)'
  ],
  pieces_requises_ar = ARRAY[
    'بطاقات هوية الزوجين',
    'رقم شهادة الزواج',
    'طابع جبائي (3 دنانير)'
  ]
WHERE nom = 'Certificat de Mariage';