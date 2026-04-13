/*
  # Create Tunisian Cities and Governorates Table

  1. New Tables
    - `governorates`
      - `id` (uuid, primary key)
      - `name_fr` (text) - French name
      - `name_ar` (text) - Arabic name
      - `name_en` (text) - English name
      - `created_at` (timestamp)
    
    - `cities`
      - `id` (uuid, primary key)
      - `governorate_id` (uuid, foreign key to governorates)
      - `name_fr` (text) - French name
      - `name_ar` (text) - Arabic name
      - `name_en` (text) - English name
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add public read policies (anyone can view cities and governorates)

  3. Data
    - Insert all 24 Tunisian governorates
    - Insert major cities for each governorate
*/

-- Create governorates table
CREATE TABLE IF NOT EXISTS governorates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate_id uuid REFERENCES governorates(id) ON DELETE CASCADE,
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view governorates"
  ON governorates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view cities"
  ON cities FOR SELECT
  TO public
  USING (true);

-- Insert Tunisian governorates
INSERT INTO governorates (name_fr, name_ar, name_en) VALUES
  ('Tunis', 'تونس', 'Tunis'),
  ('Ariana', 'أريانة', 'Ariana'),
  ('Ben Arous', 'بن عروس', 'Ben Arous'),
  ('Manouba', 'منوبة', 'Manouba'),
  ('Nabeul', 'نابل', 'Nabeul'),
  ('Zaghouan', 'زغوان', 'Zaghouan'),
  ('Bizerte', 'بنزرت', 'Bizerte'),
  ('Béja', 'باجة', 'Beja'),
  ('Jendouba', 'جندوبة', 'Jendouba'),
  ('Le Kef', 'الكاف', 'Le Kef'),
  ('Siliana', 'سليانة', 'Siliana'),
  ('Kairouan', 'القيروان', 'Kairouan'),
  ('Kasserine', 'القصرين', 'Kasserine'),
  ('Sidi Bouzid', 'سيدي بوزيد', 'Sidi Bouzid'),
  ('Sousse', 'سوسة', 'Sousse'),
  ('Monastir', 'المنستير', 'Monastir'),
  ('Mahdia', 'المهدية', 'Mahdia'),
  ('Sfax', 'صفاقس', 'Sfax'),
  ('Gafsa', 'قفصة', 'Gafsa'),
  ('Tozeur', 'توزر', 'Tozeur'),
  ('Kebili', 'قبلي', 'Kebili'),
  ('Gabès', 'قابس', 'Gabes'),
  ('Medenine', 'مدنين', 'Medenine'),
  ('Tataouine', 'تطاوين', 'Tataouine')
ON CONFLICT DO NOTHING;

-- Insert major cities for each governorate
DO $$
DECLARE
  gov_tunis uuid;
  gov_ariana uuid;
  gov_ben_arous uuid;
  gov_manouba uuid;
  gov_nabeul uuid;
  gov_zaghouan uuid;
  gov_bizerte uuid;
  gov_beja uuid;
  gov_jendouba uuid;
  gov_kef uuid;
  gov_siliana uuid;
  gov_kairouan uuid;
  gov_kasserine uuid;
  gov_sidi_bouzid uuid;
  gov_sousse uuid;
  gov_monastir uuid;
  gov_mahdia uuid;
  gov_sfax uuid;
  gov_gafsa uuid;
  gov_tozeur uuid;
  gov_kebili uuid;
  gov_gabes uuid;
  gov_medenine uuid;
  gov_tataouine uuid;
BEGIN
  -- Get governorate IDs
  SELECT id INTO gov_tunis FROM governorates WHERE name_en = 'Tunis';
  SELECT id INTO gov_ariana FROM governorates WHERE name_en = 'Ariana';
  SELECT id INTO gov_ben_arous FROM governorates WHERE name_en = 'Ben Arous';
  SELECT id INTO gov_manouba FROM governorates WHERE name_en = 'Manouba';
  SELECT id INTO gov_nabeul FROM governorates WHERE name_en = 'Nabeul';
  SELECT id INTO gov_zaghouan FROM governorates WHERE name_en = 'Zaghouan';
  SELECT id INTO gov_bizerte FROM governorates WHERE name_en = 'Bizerte';
  SELECT id INTO gov_beja FROM governorates WHERE name_en = 'Beja';
  SELECT id INTO gov_jendouba FROM governorates WHERE name_en = 'Jendouba';
  SELECT id INTO gov_kef FROM governorates WHERE name_en = 'Le Kef';
  SELECT id INTO gov_siliana FROM governorates WHERE name_en = 'Siliana';
  SELECT id INTO gov_kairouan FROM governorates WHERE name_en = 'Kairouan';
  SELECT id INTO gov_kasserine FROM governorates WHERE name_en = 'Kasserine';
  SELECT id INTO gov_sidi_bouzid FROM governorates WHERE name_en = 'Sidi Bouzid';
  SELECT id INTO gov_sousse FROM governorates WHERE name_en = 'Sousse';
  SELECT id INTO gov_monastir FROM governorates WHERE name_en = 'Monastir';
  SELECT id INTO gov_mahdia FROM governorates WHERE name_en = 'Mahdia';
  SELECT id INTO gov_sfax FROM governorates WHERE name_en = 'Sfax';
  SELECT id INTO gov_gafsa FROM governorates WHERE name_en = 'Gafsa';
  SELECT id INTO gov_tozeur FROM governorates WHERE name_en = 'Tozeur';
  SELECT id INTO gov_kebili FROM governorates WHERE name_en = 'Kebili';
  SELECT id INTO gov_gabes FROM governorates WHERE name_en = 'Gabes';
  SELECT id INTO gov_medenine FROM governorates WHERE name_en = 'Medenine';
  SELECT id INTO gov_tataouine FROM governorates WHERE name_en = 'Tataouine';

  -- Insert cities for Tunis
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_tunis, 'Tunis', 'تونس', 'Tunis'),
    (gov_tunis, 'Carthage', 'قرطاج', 'Carthage'),
    (gov_tunis, 'La Marsa', 'المرسى', 'La Marsa'),
    (gov_tunis, 'Sidi Bou Said', 'سيدي بو سعيد', 'Sidi Bou Said'),
    (gov_tunis, 'Le Bardo', 'باردو', 'Le Bardo'),
    (gov_tunis, 'La Goulette', 'حلق الوادي', 'La Goulette');

  -- Insert cities for Ariana
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_ariana, 'Ariana', 'أريانة', 'Ariana'),
    (gov_ariana, 'Raoued', 'رواد', 'Raoued'),
    (gov_ariana, 'Soukra', 'سكرة', 'Soukra'),
    (gov_ariana, 'Ettadhamen', 'التضامن', 'Ettadhamen');

  -- Insert cities for Ben Arous
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_ben_arous, 'Ben Arous', 'بن عروس', 'Ben Arous'),
    (gov_ben_arous, 'Hammam-Lif', 'حمام الأنف', 'Hammam-Lif'),
    (gov_ben_arous, 'Radès', 'رادس', 'Rades'),
    (gov_ben_arous, 'Mégrine', 'المقرين', 'Megrine'),
    (gov_ben_arous, 'Ezzahra', 'الزهراء', 'Ezzahra');

  -- Insert cities for Manouba
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_manouba, 'Manouba', 'منوبة', 'Manouba'),
    (gov_manouba, 'Den Den', 'دندن', 'Den Den'),
    (gov_manouba, 'Douar Hicher', 'دوار هيشر', 'Douar Hicher'),
    (gov_manouba, 'Oued Ellil', 'وادي الليل', 'Oued Ellil');

  -- Insert cities for Nabeul
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_nabeul, 'Nabeul', 'نابل', 'Nabeul'),
    (gov_nabeul, 'Hammamet', 'الحمامات', 'Hammamet'),
    (gov_nabeul, 'Grombalia', 'قرمبالية', 'Grombalia'),
    (gov_nabeul, 'Kélibia', 'قليبية', 'Kelibia'),
    (gov_nabeul, 'Menzel Bouzelfa', 'منزل بوزلفة', 'Menzel Bouzelfa'),
    (gov_nabeul, 'Korba', 'قربة', 'Korba');

  -- Insert cities for Zaghouan
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_zaghouan, 'Zaghouan', 'زغوان', 'Zaghouan'),
    (gov_zaghouan, 'Bir Mcherga', 'بئر مشارقة', 'Bir Mcherga'),
    (gov_zaghouan, 'El Fahs', 'الفحص', 'El Fahs');

  -- Insert cities for Bizerte
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_bizerte, 'Bizerte', 'بنزرت', 'Bizerte'),
    (gov_bizerte, 'Menzel Bourguiba', 'منزل بورقيبة', 'Menzel Bourguiba'),
    (gov_bizerte, 'Mateur', 'ماطر', 'Mateur'),
    (gov_bizerte, 'Ras Jebel', 'رأس الجبل', 'Ras Jebel'),
    (gov_bizerte, 'Sejnane', 'سجنان', 'Sejnane');

  -- Insert cities for Béja
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_beja, 'Béja', 'باجة', 'Beja'),
    (gov_beja, 'Medjez el-Bab', 'مجاز الباب', 'Medjez el-Bab'),
    (gov_beja, 'Testour', 'تستور', 'Testour'),
    (gov_beja, 'Goubellat', 'قبلاط', 'Goubellat');

  -- Insert cities for Jendouba
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_jendouba, 'Jendouba', 'جندوبة', 'Jendouba'),
    (gov_jendouba, 'Tabarka', 'طبرقة', 'Tabarka'),
    (gov_jendouba, 'Aïn Draham', 'عين دراهم', 'Ain Draham'),
    (gov_jendouba, 'Fernana', 'فرنانة', 'Fernana');

  -- Insert cities for Le Kef
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_kef, 'Le Kef', 'الكاف', 'Le Kef'),
    (gov_kef, 'Dahmani', 'الدهماني', 'Dahmani'),
    (gov_kef, 'Tajerouine', 'تاجروين', 'Tajerouine'),
    (gov_kef, 'Nebeur', 'نبر', 'Nebeur');

  -- Insert cities for Siliana
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_siliana, 'Siliana', 'سليانة', 'Siliana'),
    (gov_siliana, 'Maktar', 'مكثر', 'Maktar'),
    (gov_siliana, 'Bargou', 'برقو', 'Bargou'),
    (gov_siliana, 'Bou Arada', 'بوعرادة', 'Bou Arada');

  -- Insert cities for Kairouan
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_kairouan, 'Kairouan', 'القيروان', 'Kairouan'),
    (gov_kairouan, 'Haffouz', 'حفوز', 'Haffouz'),
    (gov_kairouan, 'Sbikha', 'السبيخة', 'Sbikha'),
    (gov_kairouan, 'Nasrallah', 'نصر الله', 'Nasrallah');

  -- Insert cities for Kasserine
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_kasserine, 'Kasserine', 'القصرين', 'Kasserine'),
    (gov_kasserine, 'Sbeitla', 'سبيطلة', 'Sbeitla'),
    (gov_kasserine, 'Fériana', 'فريانة', 'Feriana'),
    (gov_kasserine, 'Thala', 'تالة', 'Thala');

  -- Insert cities for Sidi Bouzid
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_sidi_bouzid, 'Sidi Bouzid', 'سيدي بوزيد', 'Sidi Bouzid'),
    (gov_sidi_bouzid, 'Jilma', 'جلمة', 'Jilma'),
    (gov_sidi_bouzid, 'Regueb', 'الرقاب', 'Regueb'),
    (gov_sidi_bouzid, 'Menzel Bouzaiane', 'منزل بوزيان', 'Menzel Bouzaiane');

  -- Insert cities for Sousse
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_sousse, 'Sousse', 'سوسة', 'Sousse'),
    (gov_sousse, 'Hammam Sousse', 'حمام سوسة', 'Hammam Sousse'),
    (gov_sousse, 'Msaken', 'مساكن', 'Msaken'),
    (gov_sousse, 'Kalaa Kebira', 'القلعة الكبيرة', 'Kalaa Kebira'),
    (gov_sousse, 'Enfidha', 'النفيضة', 'Enfidha');

  -- Insert cities for Monastir
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_monastir, 'Monastir', 'المنستير', 'Monastir'),
    (gov_monastir, 'Moknine', 'المكنين', 'Moknine'),
    (gov_monastir, 'Ksar Hellal', 'قصر هلال', 'Ksar Hellal'),
    (gov_monastir, 'Jemmal', 'جمال', 'Jemmal'),
    (gov_monastir, 'Téboulba', 'طبلبة', 'Teboulba');

  -- Insert cities for Mahdia
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_mahdia, 'Mahdia', 'المهدية', 'Mahdia'),
    (gov_mahdia, 'Ksour Essef', 'قصور الساف', 'Ksour Essef'),
    (gov_mahdia, 'El Jem', 'الجم', 'El Jem'),
    (gov_mahdia, 'Chebba', 'الشابة', 'Chebba');

  -- Insert cities for Sfax
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_sfax, 'Sfax', 'صفاقس', 'Sfax'),
    (gov_sfax, 'Sakiet Ezzit', 'ساقية الزيت', 'Sakiet Ezzit'),
    (gov_sfax, 'Sakiet Eddaier', 'ساقية الدائر', 'Sakiet Eddaier'),
    (gov_sfax, 'Mahres', 'محرس', 'Mahres'),
    (gov_sfax, 'Agareb', 'عقارب', 'Agareb');

  -- Insert cities for Gafsa
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_gafsa, 'Gafsa', 'قفصة', 'Gafsa'),
    (gov_gafsa, 'Metlaoui', 'المتلوي', 'Metlaoui'),
    (gov_gafsa, 'Redeyef', 'الرديف', 'Redeyef'),
    (gov_gafsa, 'Mdhilla', 'المظيلة', 'Mdhilla');

  -- Insert cities for Tozeur
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_tozeur, 'Tozeur', 'توزر', 'Tozeur'),
    (gov_tozeur, 'Nefta', 'نفطة', 'Nefta'),
    (gov_tozeur, 'Degache', 'دقاش', 'Degache');

  -- Insert cities for Kebili
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_kebili, 'Kebili', 'قبلي', 'Kebili'),
    (gov_kebili, 'Douz', 'دوز', 'Douz'),
    (gov_kebili, 'Souk Lahad', 'سوق الأحد', 'Souk Lahad');

  -- Insert cities for Gabès
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_gabes, 'Gabès', 'قابس', 'Gabes'),
    (gov_gabes, 'Mareth', 'مارث', 'Mareth'),
    (gov_gabes, 'El Hamma', 'الحامة', 'El Hamma'),
    (gov_gabes, 'Matmata', 'مطماطة', 'Matmata');

  -- Insert cities for Medenine
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_medenine, 'Medenine', 'مدنين', 'Medenine'),
    (gov_medenine, 'Djerba', 'جربة', 'Djerba'),
    (gov_medenine, 'Zarzis', 'جرجيس', 'Zarzis'),
    (gov_medenine, 'Houmt Souk', 'حومة السوق', 'Houmt Souk'),
    (gov_medenine, 'Ben Guerdane', 'بن قردان', 'Ben Guerdane');

  -- Insert cities for Tataouine
  INSERT INTO cities (governorate_id, name_fr, name_ar, name_en) VALUES
    (gov_tataouine, 'Tataouine', 'تطاوين', 'Tataouine'),
    (gov_tataouine, 'Ghomrassen', 'غمراسن', 'Ghomrassen'),
    (gov_tataouine, 'Remada', 'رمادة', 'Remada');
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cities_governorate_id ON cities(governorate_id);
CREATE INDEX IF NOT EXISTS idx_cities_name_fr ON cities(name_fr);
CREATE INDEX IF NOT EXISTS idx_cities_name_ar ON cities(name_ar);
CREATE INDEX IF NOT EXISTS idx_cities_name_en ON cities(name_en);
