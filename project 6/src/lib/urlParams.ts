export function readParams() {
  const h = window.location.hash || '';
  const qs = h.includes('?') ? h.substring(h.indexOf('?')) : window.location.search;
  const sp = new URLSearchParams(qs);
  return {
    q: sp.get('q') || '',
    ville: sp.get('ville') || '',
    categorie: sp.get('categorie') || '',
    selected_id: sp.get('selected_id') || ''
  };
}
