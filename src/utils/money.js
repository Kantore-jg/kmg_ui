export function formatFbu(amount) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} FBu`;
}
