import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { useFormTranslation } from '../hooks/useFormTranslation';

interface EntrepriseAvisFormProps {
  entrepriseId: string;
  onSuccess?: () => void;
}

export default function EntrepriseAvisForm({ entrepriseId, onSuccess }: EntrepriseAvisFormProps) {
  const { label, placeholder, button, message, submission_lang } = useFormTranslation();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert(message('champ_requis'));
      return;
    }

    if (!comment.trim()) {
      alert(message('champ_requis'));
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('avis_entreprise')
        .insert({
          entreprise_id: entrepriseId,
          note: rating,
          commentaire: comment.trim(),
          date: new Date().toISOString(),
          submission_lang
        });

      if (insertError) {
        console.error('Erreur insertion:', insertError);
        alert(message('erreur'));
        return;
      }

      setSuccessMessage(message('succes'));
      setRating(0);
      setComment('');

      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert(message('erreur'));
    }
  };

  return (
    <div
      style={{
        border: '1px solid #D4AF37',
        borderRadius: '6px',
        padding: '4px',
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 50
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '3px' }}>
          <div
            style={{
              display: 'flex',
              gap: '2px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '3px'
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '1px'
                }}
              >
                <Star
                  style={{
                    width: '14px',
                    height: '14px',
                    fill: star <= rating ? '#D4AF37' : '#E5E7EB',
                    color: star <= rating ? '#D4AF37' : '#D1D5DB'
                  }}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p
              style={{
                textAlign: 'center',
                fontSize: '9px',
                color: '#D4AF37',
                marginBottom: '2px'
              }}
            >
              {rating === 1 && 'Très mauvais'}
              {rating === 2 && 'Mauvais'}
              {rating === 3 && 'Moyen'}
              {rating === 4 && 'Bon'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '3px' }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={500}
            style={{
              width: '100%',
              padding: '4px',
              borderRadius: '4px',
              border: '1px solid #D4AF37',
              fontSize: '10px',
              resize: 'vertical',
              outline: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#D4AF37'
            }}
            placeholder={placeholder('votre_commentaire')}
          />
          <p
            style={{
              textAlign: 'right',
              fontSize: '8px',
              color: '#D4AF37',
              marginTop: '1px'
            }}
          >
            {comment.length}/500
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="submit"
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              background: '#064E3B',
              color: '#D4AF37',
              border: '1px solid #D4AF37',
              fontSize: '9px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Send style={{ width: '10px', height: '10px' }} />
            {button('envoyer')}
          </button>
        </div>

        {successMessage && (
          <p
            style={{
              marginTop: '3px',
              textAlign: 'center',
              fontSize: '9px',
              color: '#D4AF37',
              fontWeight: '600'
            }}
          >
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
}
