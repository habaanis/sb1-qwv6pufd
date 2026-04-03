// src/components/TeacherSignupModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { addTeacher } from '../lib/BoltDatabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherSignupModal({ isOpen, onClose }: Props) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [form, setForm] = useState({
    nom: '',
    matiere: '',
    ville: '',
    telephone: '',
    email: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await addTeacher(form);
    setLoading(false);
    if (error) {
      alert(t.common.error);
      return;
    }
    alert(t.education.modal.success);
    setForm({
      nom: '',
      matiere: '',
      ville: '',
      telephone: '',
      email: '',
      description: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t.education.modal.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 gap-3">
          <input className="input" placeholder={t.education.modal.fName} value={form.nom} onChange={(e) => handleChange('nom', e.target.value)} required />
          <input className="input" placeholder={t.education.modal.fSubject} value={form.matiere} onChange={(e) => handleChange('matiere', e.target.value)} required />
          <input className="input" placeholder={t.education.modal.fCity} value={form.ville} onChange={(e) => handleChange('ville', e.target.value)} required />
          <input className="input" placeholder={t.education.modal.fPhone} value={form.telephone} onChange={(e) => handleChange('telephone', e.target.value)} />
          <input className="input" placeholder={t.education.modal.fEmail} type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          <textarea className="input min-h-[90px]" placeholder={t.education.modal.fDesc} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center px-5 py-3 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t.common.loading : t.education.modal.submit}
          </button>
        </form>
      </div>
      <style>{`
        .input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          outline: none;
          font-size: 14px;
        }
        .input:focus {
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(251,146,60,.2);
        }
      `}</style>
    </div>
  );
}
