export const PLACE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
};

const PLACE_STATUS_ALIASES = {
  libre: PLACE_STATUS.AVAILABLE,
  available: PLACE_STATUS.AVAILABLE,
  occupée: PLACE_STATUS.OCCUPIED,
  occupied: PLACE_STATUS.OCCUPIED,
  maintenance: PLACE_STATUS.MAINTENANCE,
  réservée: PLACE_STATUS.RESERVED,
  reserved: PLACE_STATUS.RESERVED,
};

export function normalizePlaceStatus(status) {
  return PLACE_STATUS_ALIASES[status] || status || PLACE_STATUS.AVAILABLE;
}

export function placeStatusLabel(status) {
  switch (normalizePlaceStatus(status)) {
    case PLACE_STATUS.AVAILABLE:
      return 'Libre';
    case PLACE_STATUS.OCCUPIED:
      return 'Occupée';
    case PLACE_STATUS.MAINTENANCE:
      return 'Maintenance';
    case PLACE_STATUS.RESERVED:
      return 'Réservée';
    default:
      return String(status || '');
  }
}

export function placeStatusBadgeVariant(status) {
  switch (normalizePlaceStatus(status)) {
    case PLACE_STATUS.OCCUPIED:
      return 'default';
    case PLACE_STATUS.AVAILABLE:
      return 'secondary';
    default:
      return 'outline';
  }
}

export function isPlaceOccupied(status) {
  return normalizePlaceStatus(status) === PLACE_STATUS.OCCUPIED;
}

export function isPlaceAvailable(status) {
  return normalizePlaceStatus(status) === PLACE_STATUS.AVAILABLE;
}

export function placeStatusToApi(status) {
  return normalizePlaceStatus(status);
}
