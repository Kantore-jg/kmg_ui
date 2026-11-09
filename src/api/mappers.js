import { resolveStorageUrl } from './client.js';
import { normalizePlaceStatus, placeStatusToApi } from '../utils/placeStatus.js';

const REQUEST_STATUS_TO_UI = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  assigned: 'approved',
};

export function mapMarket(m) {
  const province = m.province || '';
  const administrativeLocation = [province, m.commune, m.zone, m.colline].filter(Boolean).join(' > ');

  return {
    id: m.id,
    name: m.name,
    slug: m.slug,
    province,
    commune: m.commune || '',
    zone: m.zone || '',
    colline: m.colline || '',
    location: m.location || '',
    description: m.description || '',
    totalPlaces: m.places_count ?? m.total_places ?? 0,
    occupiedPlaces: m.occupied_places ?? 0,
    image: resolveStorageUrl(m.image),
    coverImage: resolveStorageUrl(m.cover_image || m.image),
    administrativeLocation,
    latitude: m.latitude,
    longitude: m.longitude,
    isActive: m.is_active ?? true,
    visitCount: m.visit_count ?? 0,
  };
}

export function mapBlock(b) {
  return {
    id: b.id,
    marketId: b.market_id,
    name: b.name,
    code: b.code || '',
    description: b.description || '',
    rentAmount: Number(b.rent_amount ?? 0),
    totalPlaces: b.total_places ?? b.places_count ?? 0,
    placesCount: b.places_count ?? b.total_places ?? 0,
    isActive: b.is_active ?? true,
  };
}

export function mapPlace(p) {
  const status = normalizePlaceStatus(p.status);

  return {
    id: p.number || String(p.id),
    placeId: p.id,
    number: p.number,
    blockId: p.market_block_id || p.block?.id || null,
    blockName: p.block?.name || '—',
    block: p.block ? mapBlock(p.block) : null,
    rowName: p.number || '',
    status,
    merchantId: p.chief?.id || null,
    category: p.category || '',
    marketId: p.market_id,
    qrCode: p.qr_code,
    latitude: p.latitude,
    longitude: p.longitude,
  };
}

export function mapMerchant(m) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone || '',
    image: m.image || null,
    category: m.category || 'Commerce Général',
    activePlaceId: m.active_place_id || null,
    activePlaceNumber: m.active_place_number || '',
    activeMarketId: m.active_market_id || m.managed_market_id || null,
    joinedDate: m.joined_date,
    verified: m.verified ?? false,
    bio: m.bio || '',
  };
}

export function mapPlaceRequest(r) {
  return {
    id: r.id,
    merchantName: r.merchant_name,
    merchantPhone: r.merchant_phone,
    activityType: r.category || r.description?.split('\n\n')[0] || '',
    category: r.category || '',
    requestedMarketId: r.market_id,
    marketName: r.market?.name,
    assignedPlaceNumber: r.place?.number || '',
    description: r.description || '',
    submittedDate: r.created_at?.split('T')[0] || '',
    status: REQUEST_STATUS_TO_UI[r.status] || r.status,
    rejectionReason: r.rejection_reason,
    placeId: r.place_id,
  };
}

export function mapReceipt(r) {
  const periodLabel = r.period_year && r.period_month
    ? new Date(r.period_year, r.period_month - 1, 1).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    : (r.created_at
      ? new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      : '');

  return {
    id: r.id,
    merchantId: r.user_id,
    merchantName: r.user?.name || '',
    marketId: r.market_id,
    marketName: r.market?.name || '',
    placeId: r.place_id,
    periodYear: r.period_year || null,
    periodMonth: r.period_month || null,
    paymentMethodId: r.payment_method_id || r.payment_method?.id || null,
    paymentMethodName: r.payment_method?.name || '',
    month: periodLabel,
    amount: Number(r.amount || 0),
    receiptImage: r.file_url,
    submittedDate: r.created_at?.split('T')[0] || '',
    status: r.status,
    reference: r.reference,
  };
}

export function mapPaymentMethod(m) {
  return {
    id: m.id,
    marketId: m.market_id,
    marketName: m.market?.name || '',
    name: m.name,
    type: m.type || 'bank',
    accountNumber: m.account_number || '',
    accountName: m.account_name || '',
    isActive: m.is_active ?? true,
  };
}

export function paymentMethodToApi(data) {
  return {
    market_id: data.marketId || null,
    name: data.name,
    type: data.type || 'bank',
    account_number: data.accountNumber || null,
    account_name: data.accountName || null,
    is_active: data.isActive ?? true,
  };
}

const ROLE_LABELS = {
  SUPER_ADMIN: 'Admin système',
  ADMIN_MARCHE: 'Gestionnaire du marché',
  PROPRIETAIRE_MARCHE: 'Propriétaire',
  COMMERCANT: 'Commerçant',
  USER: 'Utilisateur',
};

export function mapUser(u) {
  const role = u.roles?.[0] || 'USER';

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    avatar: resolveStorageUrl(u.avatar),
    role,
    roleLabel: ROLE_LABELS[role] || role,
    isActive: u.is_active ?? true,
    marketId: u.managed_market_id || u.active_market_id || null,
    marketName: u.managed_market?.name || u.active_market?.name || '',
    merchantId: role === 'COMMERCANT' ? u.id : null,
    permissions: u.permissions || [],
    createdAt: u.created_at?.split('T')[0] || '',
  };
}

function normalizePhone(phone) {
  if (phone === undefined || phone === null) return null;
  const normalized = String(phone).trim().replace(/\s+/g, '');
  return normalized || null;
}

export function userToApi(data) {
  const payload = {
    name: data.name,
    email: data.email,
    role: data.role,
    is_active: data.isActive ?? true,
    managed_market_id: ['ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE'].includes(data.role)
      ? (data.marketId || null)
      : null,
  };

  const phone = normalizePhone(data.phone);
  if (phone) {
    payload.phone = phone;
  }

  if (data.password) {
    payload.password = data.password;
  }

  return payload;
}

export function marketToApi(data) {
  const province = data.province || '';
  return {
    name: data.name,
    province,
    commune: data.commune || null,
    zone: data.zone || null,
    colline: data.colline || null,
    location: data.location,
    description: data.description,
  };
}

export function blockToApi(data) {
  return {
    name: data.name,
    code: data.code || null,
    description: data.description || null,
    rent_amount: data.rentAmount ?? data.rent_amount ?? 0,
    is_active: data.isActive ?? true,
  };
}

export function placeToApi(data) {
  return {
    market_id: data.marketId,
    market_block_id: data.blockId || null,
    number: data.id || data.number,
    status: placeStatusToApi(data.status),
    category: data.category || null,
  };
}

export function placeRequestToApi(data) {
  return {
    market_id: data.requestedMarketId,
    place_id: data.placeId || null,
    merchant_name: data.merchantName,
    merchant_phone: data.merchantPhone,
    category: data.activityType || data.category || null,
    description: data.description || null,
  };
}
