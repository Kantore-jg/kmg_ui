/** Compare IDs safely (API returns numbers, routes use strings). */
export function sameId(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export function toIdString(id) {
  return id == null ? '' : String(id);
}