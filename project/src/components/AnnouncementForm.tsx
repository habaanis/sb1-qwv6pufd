import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import CityAutocomplete from './CityAutocomplete';

interface AnnouncementFormProps {
  onClose: () => void;
  onSuccess: () => void;
  language: string;
}

const translations = {
  fr: {
    title: 'Déposer une annonce',
    announcementTitle: 'Titre de l\'annonce',
    category: 'Catégorie',
    selectCategory: 'Sélectionnez une catégorie',
    price: 'Prix (TND)',
    description: 'Description',
    photos: 'Photos (jusqu\'à 3)',
    maxPhotos: 'Maximum 3 photos',
    uploadPhoto: 'Télécharger une photo',
    contact: 'Numéro de téléphone',
    email: 'Email (optionnel)',
    city: 'Ville / Délégation',
    adType: 'Type d\'annonce',
    sell: 'Je vends',
    buy: 'Je cherche à acheter',
    exchange: 'Je propose un échange',
    submit: 'Publier l\'annonce',
    cancel: 'Annuler',
    submitting: 'Publication en cours...',
    success: 'Votre annonce a été publiée avec succès !',
    error: 'Une erreur s\'est produite',
    required: 'Tous les champs sont obligatoires',
    categories: {
      vehicles: 'Véhicules',
      house: 'Maison & Jardin',
      electronics: 'Électronique',
      realestate: 'Immobilier',
      sports: 'Sport & Loisirs',
      clothing: 'Vêtements',
      services: 'Services'
    }
  },
  en: {
    title: 'Post an Ad',
    announcementTitle: 'Ad Title',
    category: 'Category',
    selectCategory: 'Select a category',
    price: 'Price (TND)',
    description: 'Description',
    photos: 'Photos (up to 3)',
    maxPhotos: 'Maximum 3 photos',
    uploadPhoto: 'Upload a photo',
    contact: 'Phone Number',
    email: 'Email (optional)',
    city: 'City / Delegation',
    adType: 'Ad Type',
    sell: 'I\'m selling',
    buy: 'I\'m looking to buy',
    exchange: 'I want to exchange',
    submit: 'Publish Ad',
    cancel: 'Cancel',
    submitting: 'Publishing...',
    success: 'Your ad has been published successfully!',
    error: 'An error occurred',
    required: 'All fields are required',
    categories: {
      vehicles: 'Vehicles',
      house: 'House & Garden',
      electronics: 'Electronics',
      realestate: 'Real Estate',
      sports: 'Sports & Leisure',
      clothing: 'Clothing',
      services: 'Services'
    }
  },
  ar: {
    title: 'نشر إعلان',
    announcementTitle: 'عنوان الإعلان',
    category: 'الفئة',
    selectCategory: 'اختر فئة',
    price: 'السعر (دينار)',
    description: 'الوصف',
    photos: 'الصور (حتى 3)',
    maxPhotos: 'الحد الأقصى 3 صور',
    uploadPhoto: 'تحميل صورة',
    contact: 'رقم الهاتف',
    email: 'البريد الإلكتروني (اختياري)',
    city: 'المدينة / المعتمدية',
    adType: 'نوع الإعلان',
    sell: 'أنا أبيع',
    buy: 'أنا أبحث عن شراء',
    exchange: 'أقترح تبادل',
    submit: 'نشر الإعلان',
    cancel: 'إلغاء',
    submitting: 'جاري النشر...',
    success: 'تم نشر إعلانك بنجاح!',
    error: 'حدث خطأ',
    required: 'جميع الحقول مطلوبة',
    categories: {
      vehicles: 'المركبات',
      house: 'المنزل والحديقة',
      electronics: 'الإلكترونيات',
      realestate: 'العقارات',
      sports: 'الرياضة والترفيه',
      clothing: 'الملابس',
      services: 'الخدمات'
    }
  },
  it: {
    title: 'Pubblica un Annuncio',
    announcementTitle: 'Titolo dell\'Annuncio',
    category: 'Categoria',
    selectCategory: 'Seleziona una categoria',
    price: 'Prezzo (TND)',
    description: 'Descrizione',
    photos: 'Foto (fino a 3)',
    maxPhotos: 'Massimo 3 foto',
    uploadPhoto: 'Carica una foto',
    contact: 'Numero di Telefono',
    email: 'Email (opzionale)',
    city: 'Città / Delegazione',
    adType: 'Tipo di Annuncio',
    sell: 'Sto vendendo',
    buy: 'Sto cercando di comprare',
    exchange: 'Voglio scambiare',
    submit: 'Pubblica Annuncio',
    cancel: 'Annulla',
    submitting: 'Pubblicazione...',
    success: 'Il tuo annuncio è stato pubblicato con successo!',
    error: 'Si è verificato un errore',
    required: 'Tutti i campi sono obbligatori',
    categories: {
      vehicles: 'Veicoli',
      house: 'Casa e Giardino',
      electronics: 'Elettronica',
      realestate: 'Immobiliare',
      sports: 'Sport e Tempo Libero',
      clothing: 'Abbigliamento',
      services: 'Servizi'
    }
  },
  ru: {
    title: 'Разместить объявление',
    announcementTitle: 'Название объявления',
    category: 'Категория',
    selectCategory: 'Выберите категорию',
    price: 'Цена (ТНД)',
    description: 'Описание',
    photos: 'Фотографии (до 3)',
    maxPhotos: 'Максимум 3 фото',
    uploadPhoto: 'Загрузить фото',
    contact: 'Номер телефона',
    email: 'Email (необязательно)',
    city: 'Город / Делегация',
    adType: 'Тип объявления',
    sell: 'Я продаю',
    buy: 'Я хочу купить',
    exchange: 'Я хочу обменять',
    submit: 'Опубликовать объявление',
    cancel: 'Отмена',
    submitting: 'Публикация...',
    success: 'Ваше объявление успешно опубликовано!',
    error: 'Произошла ошибка',
    required: 'Все поля обязательны',
    categories: {
      vehicles: 'Транспорт',
      house: 'Дом и сад',
      electronics: 'Электроника',
      realestate: 'Недвижимость',
      sports: 'Спорт и досуг',
      clothing: 'Одежда',
      services: 'Услуги'
    }
  }
};

export default function AnnouncementForm({ onClose, onSuccess, language }: AnnouncementFormProps) {
  const t = translations[language as keyof typeof translations] || translations.fr;
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    titre: '',
    categorie: '',
    prix: '',
    description: '',
    contact_tel: '',
    user_email: '',
    localisation_ville: '',
    type_annonce: 'sell'
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'Véhicules', label: t.categories.vehicles },
    { value: 'Maison & Jardin', label: t.categories.house },
    { value: 'Électronique', label: t.categories.electronics },
    { value: 'Immobilier', label: t.categories.realestate },
    { value: 'Sport & Loisirs', label: t.categories.sports },
    { value: 'Vêtements', label: t.categories.clothing },
    { value: 'Services', label: t.categories.services }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 3) {
      setError(t.maxPhotos);
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.titre || !formData.categorie || !formData.prix || !formData.description ||
        !formData.contact_tel || !formData.localisation_ville) {
      setError(t.required);
      return;
    }

    setLoading(true);

    try {
      // Préparer les données pour Supabase - STRICTE CORRESPONDANCE avec les colonnes
      const annonceData = {
        titre: formData.titre.trim(),
        categorie: formData.categorie,
        prix: parseFloat(formData.prix),
        description: formData.description.trim(),
        contact_tel: formData.contact_tel.trim(),
        user_email: formData.user_email?.trim() || null,
        localisation_ville: formData.localisation_ville.trim(),
        type_annonce: formData.type_annonce,
        photo_url: photos.length > 0 ? photos : [],
        statut_moderation: 'approved'
      };

      // LOG DE DÉBOGAGE - Données prêtes pour Supabase
      console.log('=== DONNÉES PRÊTES POUR SUPABASE ===');
      console.log('Formulaire AnnouncementForm - Annonce Locale');
      console.log('Données formatées:', JSON.stringify(annonceData, null, 2));
      console.log('Types des champs:');
      console.log('- titre (string):', typeof annonceData.titre, annonceData.titre);
      console.log('- categorie (string):', typeof annonceData.categorie, annonceData.categorie);
      console.log('- prix (number):', typeof annonceData.prix, annonceData.prix);
      console.log('- description (string):', typeof annonceData.description, annonceData.description);
      console.log('- contact_tel (string):', typeof annonceData.contact_tel, annonceData.contact_tel);
      console.log('- user_email (string|null):', typeof annonceData.user_email, annonceData.user_email);
      console.log('- localisation_ville (string):', typeof annonceData.localisation_ville, annonceData.localisation_ville);
      console.log('- type_annonce (string):', typeof annonceData.type_annonce, annonceData.type_annonce);
      console.log('- photo_url (array):', Array.isArray(annonceData.photo_url), annonceData.photo_url);
      console.log('- statut_moderation (string):', typeof annonceData.statut_moderation, annonceData.statut_moderation);
      console.log('=====================================');

      // Validation du prix
      if (isNaN(annonceData.prix) || annonceData.prix < 0) {
        console.error('❌ ERREUR: Le prix doit être un nombre positif');
        setError('Le prix doit être un nombre valide');
        setLoading(false);
        return;
      }

      // Validation de l'email si présent
      if (annonceData.user_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(annonceData.user_email)) {
          console.error('❌ ERREUR: Format email invalide:', annonceData.user_email);
          setError('Format email invalide');
          setLoading(false);
          return;
        }
      }

      console.log('✅ Validation réussie. Envoi à Supabase...');

      const { data, error: insertError } = await supabase
        .from('annonces_locales')
        .insert([annonceData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ ERREUR Supabase:', insertError);
        console.error('Code:', insertError.code);
        console.error('Message:', insertError.message);
        console.error('Details:', insertError.details);
        throw insertError;
      }

      console.log('✅ SUCCÈS: Annonce locale créée dans Supabase');
      console.log('Données créées:', data);
      console.log('ID annonce:', data?.id);
      onSuccess();
    } catch (err: any) {
      console.error('❌ ERREUR INATTENDUE:', err);
      setError(`${t.error}: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.announcementTitle} *
            </label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.category} *
              </label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                required
              >
                <option value="">{t.selectCategory}</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.price} *
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.description} *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.photos}
            </label>
            <div className="flex flex-wrap gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#D62828] transition-colors">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.contact} *
              </label>
              <input
                type="tel"
                value={formData.contact_tel}
                onChange={(e) => setFormData({ ...formData, contact_tel: e.target.value })}
                placeholder="+216 XX XXX XXX"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.email}
              </label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.city} *
            </label>
            <CityAutocomplete
              value={formData.localisation_ville}
              onChange={(value) => setFormData({ ...formData, localisation_ville: value })}
              placeholder={t.city}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t.adType} *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="type_annonce"
                  value="sell"
                  checked={formData.type_annonce === 'sell'}
                  onChange={(e) => setFormData({ ...formData, type_annonce: e.target.value })}
                  className="sr-only peer"
                />
                <div className="px-6 py-3 rounded-xl border-2 border-gray-200 peer-checked:border-[#D62828] peer-checked:bg-orange-50 text-center font-semibold transition-all">
                  {t.sell}
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="type_annonce"
                  value="buy"
                  checked={formData.type_annonce === 'buy'}
                  onChange={(e) => setFormData({ ...formData, type_annonce: e.target.value })}
                  className="sr-only peer"
                />
                <div className="px-6 py-3 rounded-xl border-2 border-gray-200 peer-checked:border-[#D62828] peer-checked:bg-orange-50 text-center font-semibold transition-all">
                  {t.buy}
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="type_annonce"
                  value="exchange"
                  checked={formData.type_annonce === 'exchange'}
                  onChange={(e) => setFormData({ ...formData, type_annonce: e.target.value })}
                  className="sr-only peer"
                />
                <div className="px-6 py-3 rounded-xl border-2 border-gray-200 peer-checked:border-[#D62828] peer-checked:bg-orange-50 text-center font-semibold transition-all">
                  {t.exchange}
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D62828] to-[#b91c1c] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
