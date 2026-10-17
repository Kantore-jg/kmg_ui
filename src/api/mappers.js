import { resolveStorageUrl } from './client.js';
import { normalizePlaceStatus, placeStatusToApi } from '../utils/placeStatus.js';

const REQUEST_STATUS_TO_UI = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  assigned: 'approved',
};

export function mapProductCategory(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    productsCount: c.products_count ?? 0,
    marketsCount: c.markets_count ?? 0,
  };
}

export function productCategoryToApi(data) {
  return {
    name: data.name,
    description: data.description || null,
  };
}

export function mapMarket(m) {
  const categories = m.product_categories?.length
    ? m.product_categories.map(mapProductCategory)
    : [];
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
    totalPlaces: m.total_places ?? 0,
    occupiedPlaces: m.occupied_places ?? 0,
    image: resolveStorageUrl(m.image),
    coverImage: resolveStorageUrl(m.cover_image || m.image),
    administrativeLocation,
    productCategories: categories.map((c) => c.name),
    marketProductCategories: categories,
    productCategoryIds: m.product_category_ids?.length
      ? m.product_category_ids
      : categories.map((c) => c.id).filter(Boolean),
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
  const categoryNames = p.category
    ? p.category.split(',').map((name) => name.trim()).filter(Boolean)
    : [];

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
    category: p.category || categoryNames.join(', '),
    categoryIds: p.product_category_ids || [],
    categories: categoryNames,
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
    productsCount: m.products_count ?? 0,
  };
}

export function mapProduct(p) {
  const primaryImage = p.images?.find((i) => i.is_primary) || p.images?.[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    category: p.category?.name || 'Général',
    categoryId: p.category?.id || p.category_id,
    image: resolveStorageUrl(primaryImage?.path) || null,
    marketId: p.market?.id || p.market_id,
    merchantId: p.merchant?.id || p.user_id,
    placeNumber: p.place?.number || '',
    placeId: p.place?.id || p.place_id,
    available: p.available ?? true,
    description: p.description || '',
    unit: p.unit || 'unit',
    isTrending: p.is_trending ?? false,
    stock: p.stock ?? 0,
    viewCount: p.view_count ?? 0,
    createdAt: p.created_at?.split('T')[0] || '',
  };
}

export function mapPlaceRequest(r) {
  const categoryNames = r.category
    ? r.category.split(',').map((name) => name.trim()).filter(Boolean)
    : [];

  return {
    id: r.id,
    merchantName: r.merchant_name,
    merchantPhone: r.merchant_phone,
    activityType: r.description?.split('\n\n')[0] || categoryNames.join(', ') || '',
    category: r.category || '',
    categoryIds: r.product_category_ids || [],
    categories: categoryNames,
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

export function mapSaleItem(item) {
  return {
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    productUnit: item.product_unit || 'unit',
    unitPrice: Number(item.unit_price),
    quantity: item.quantity,
    lineTotal: Number(item.line_total),
  };
}

export function mapSale(s) {
  const paidAmount = Number(s.paid_amount ?? s.total ?? 0);
  const total = Number(s.total ?? 0);
  const remainingAmount = Number(s.remaining_amount ?? Math.max(total - paidAmount, 0));

  return {
    id: s.id,
    invoiceNumber: s.invoice_number,
    merchantId: s.user_id,
    merchantName: s.merchant?.name || '',
    merchantPhone: s.merchant?.phone || '',
    merchantEmail: s.merchant?.email || '',
    marketId: s.market_id,
    marketName: s.market?.name || '',
    placeId: s.place_id,
    placeNumber: s.place?.number || '',
    clientName: s.client_name,
    clientPhone: s.client_phone || '',
    clientEmail: s.client_email || '',
    paymentType: s.payment_type,
    subtotal: Number(s.subtotal),
    total,
    paidAmount,
    remainingAmount,
    notes: s.notes || '',
    items: (s.items || []).map(mapSaleItem),
    createdAt: s.created_at?.split('T')[0] || '',
    createdAtFull: s.created_at || '',
  };
}

export function saleToApi(data) {
  return {
    market_id: data.marketId,
    place_id: data.placeId || null,
    client_name: data.clientName,
    client_phone: data.clientPhone || null,
    client_email: data.clientEmail || null,
    payment_type: data.paymentType,
    paid_amount: data.paidAmount ?? data.paid_amount ?? 0,
    notes: data.notes || null,
    items: (data.items || []).map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
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
  SUPER_ADMIN: 'Super Administrateur',
  ADMIN_MARCHE: 'Admin Marché',
  PROPRIETAIRE_MARCHE: 'Propriétaire Marché',
  COMMERCANT: 'Commerçant',
  COMMERCE_USER: 'Commerce indépendant',
  USER: 'Utilisateur',
};

export const COMMERCE_ROLE_LABELS = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  cashier: 'Caissier',
  stock_manager: 'Gestionnaire de stock',
  seller: 'Vendeur',
};

export function mapCommerce(c) {
  return {
    id: c.id,
    name: c.name,
    type: c.type || '',
    rccm: c.rccm || '',
    nif: c.nif || '',
    phone: c.phone || '',
    email: c.email || '',
    address: c.address || '',
    province: c.province || '',
    commune: c.commune || '',
    zone: c.zone || '',
    colline: c.colline || '',
    description: c.description || '',
    logoUrl: resolveStorageUrl(c.logo_url),
    status: c.status || 'active',
    usersCount: c.commerce_users_count ?? 0,
    createdAt: c.created_at?.split('T')[0] || '',
  };
}

export function commerceToApi(data) {
  return {
    name: data.name,
    type: data.type || null,
    rccm: data.rccm || null,
    nif: data.nif || null,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    province: data.province || null,
    commune: data.commune || null,
    zone: data.zone || null,
    colline: data.colline || null,
    description: data.description || null,
    status: data.status || 'active',
  };
}

export function mapCommerceCategory(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
  };
}

export function mapCommerceProduct(p) {
  return {
    id: p.id,
    commerceId: p.commerce_id,
    categoryId: p.category_id,
    categoryName: p.category?.name || '',
    name: p.name,
    sku: p.sku || '',
    barcode: p.barcode || '',
    unit: p.unit || 'unit',
    purchasePrice: Number(p.purchase_price ?? 0),
    salePrice: Number(p.sale_price ?? 0),
    minStock: Number(p.min_stock ?? 0),
    maxStock: p.max_stock != null ? Number(p.max_stock) : null,
    vatRate: p.vat_rate != null ? Number(p.vat_rate) : null,
    status: p.status || 'active',
    createdAt: p.created_at?.split('T')[0] || '',
  };
}

export function mapCommerceStock(s) {
  return {
    id: s.id,
    commerceId: s.commerce_id,
    name: s.name,
    location: s.location || '',
    managerUserId: s.manager_user_id,
    managerName: s.manager?.name || '',
    status: s.status || 'active',
    items: (s.items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product?.name || '',
      sku: item.product?.sku || '',
      quantity: Number(item.quantity ?? 0),
      avgPurchasePrice: Number(item.avg_purchase_price ?? 0),
    })),
    createdAt: s.created_at?.split('T')[0] || '',
  };
}

export function mapCommerceSaleItem(item) {
  return {
    id: item.id,
    productId: item.product_id,
    productName: item.product?.name || '',
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    unitCost: Number(item.unit_cost ?? 0),
    lineTotal: Number(item.line_total),
  };
}

export function mapCommerceSale(s) {
  return {
    id: s.id,
    commerceId: s.commerce_id,
    stockId: s.stock_id,
    stockName: s.stock?.name || '',
    cashSessionId: s.cash_session_id,
    paymentMethod: s.payment_method || 'cash',
    totalAmount: Number(s.total_amount ?? 0),
    totalCost: Number(s.total_cost ?? 0),
    userId: s.user_id,
    userName: s.user?.name || '',
    soldAt: s.sold_at?.split('T')[0] || s.sold_at || '',
    notes: s.notes || '',
    items: (s.items || []).map(mapCommerceSaleItem),
    createdAt: s.created_at?.split('T')[0] || '',
  };
}

export function mapCommerceUser(u) {
  return {
    id: u.id,
    commerceId: u.commerce_id,
    userId: u.user_id,
    role: u.role?.value || u.role,
    roleLabel: COMMERCE_ROLE_LABELS[u.role?.value || u.role] || u.role,
    isActive: u.is_active ?? true,
    name: u.user?.name || '',
    email: u.user?.email || '',
    phone: u.user?.phone || '',
    createdAt: u.created_at?.split('T')[0] || '',
  };
}

export function mapUser(u) {
  const role = u.roles?.[0] || 'USER';
  const memberships = u.commerce_memberships || [];
  const firstMembership = memberships[0] || null;

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
    commerceId: firstMembership?.commerce_id || null,
    commerceRole: firstMembership?.role || null,
    commerceMemberships: memberships.map((m) => ({
      id: m.id,
      commerceId: m.commerce_id,
      role: m.role,
      isActive: m.is_active ?? true,
      commerceName: m.commerce_name || '',
    })),
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
    total_places: data.totalPlaces,
    product_category_ids: data.productCategoryIds || [],
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
    product_category_ids: data.productCategoryIds || [],
  };
}

export function productToApi(data) {
  const payload = {
    market_id: data.marketId,
    place_id: data.placeId || null,
    category_id: data.categoryId || null,
    name: data.name,
    description: data.description,
    price: data.price,
    unit: data.unit || 'unit',
    stock: data.stock ?? 0,
    available: data.available ?? true,
    is_trending: data.isTrending ?? false,
  };

  if (data.merchantId) {
    payload.user_id = data.merchantId;
  }

  return payload;
}

export function placeRequestToApi(data) {
  const descriptionParts = [data.activityType, data.description].filter(Boolean);

  return {
    market_id: data.requestedMarketId,
    merchant_name: data.merchantName,
    merchant_phone: data.merchantPhone,
    product_category_ids: data.productCategoryIds || [],
    description: descriptionParts.join('\n\n') || null,
  };
}
