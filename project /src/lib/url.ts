export function buildEntrepriseUrl(params: {
  q?: string;
  ville?: string;
  categorie?: string;
  selected_id?: string;
}) {
  const sp = new URLSearchParams();
  if (params.q && params.q.trim().length) sp.set('q', params.q.trim());
  if (params.ville && params.ville.trim().length) sp.set('ville', params.ville.trim());
  if (params.categorie && params.categorie.trim().length) sp.set('categorie', params.categorie.trim());
  if (params.selected_id && params.selected_id.trim().length) sp.set('selected_id', params.selected_id.trim());
  const qs = sp.toString();
  return qs ? `#/entreprises?${qs}` : '#/entreprises';
}

export function getHashQueryParams() {
  const hash = window.location.hash;
  const qs = hash.includes('?') ? hash.substring(hash.indexOf('?') + 1) : '';
  return new URLSearchParams(qs);
}

export function useNavigate() {
  return (path: string) => {
    window.location.hash = path;
  };
}
