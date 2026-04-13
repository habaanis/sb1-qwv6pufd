interface SimpleEventCardProps {
  event: {
    titre: string;
    ville: string;
    date_debut: string;
    type_affichage?: string;
    secteur_evenement?: string;
  };
}

export default function SimpleEventCard({ event }: SimpleEventCardProps) {
  return (
    <div className="bg-[#F8F9FA] rounded-lg p-4 text-[#4A1D43]" style={{ border: '2px solid #D4AF37' }}>
      <h3 className="text-xl font-bold mb-2 text-[#4A1D43]">{event.titre}</h3>
      <p className="text-sm text-[#4A1D43]/80">Ville: {event.ville}</p>
      <p className="text-sm text-[#4A1D43]/80">Date: {event.date_debut}</p>
      <p className="text-sm text-[#4A1D43]/80">Type: {event.type_affichage || 'Non défini'}</p>
      <p className="text-sm text-[#4A1D43]/80">Secteur: {event.secteur_evenement || 'Non défini'}</p>
    </div>
  );
}
