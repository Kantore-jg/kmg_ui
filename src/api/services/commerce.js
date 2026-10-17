import { apiClient, extractData, extractList } from '../client.js';
import {
  mapCommerce,
  commerceToApi,
  mapCommerceProduct,
  mapCommerceStock,
  mapCommerceSale,
  mapCommerceUser,
  mapCommerceCategory,
} from '../mappers.js';

export const COMMERCE_ID_KEY = 'akaguriro_commerce_id';

export function getCommerceId() {
  return localStorage.getItem(COMMERCE_ID_KEY);
}

export function setCommerceId(id) {
  if (id) {
    localStorage.setItem(COMMERCE_ID_KEY, String(id));
  } else {
    localStorage.removeItem(COMMERCE_ID_KEY);
  }
}

function commerceConfig(config = {}) {
  const headers = { ...(config.headers || {}) };
  const commerceId = getCommerceId();
  if (commerceId) {
    headers['X-Commerce-Id'] = commerceId;
  }
  return { ...config, headers };
}

async function commerceRequest(method, url, data, config = {}) {
  const response = await apiClient({
    method,
    url,
    data,
    ...commerceConfig(config),
  });
  return response;
}

// ——— Admin ———

export async function fetchCommerces(params = {}) {
  const { data } = await apiClient.get('/commerces', { params });
  return extractList({ data }).map(mapCommerce);
}

export async function fetchCommerce(id) {
  const { data } = await apiClient.get(`/commerces/${id}`);
  return mapCommerce(extractData({ data }));
}

export async function createCommerce(payload) {
  const { data } = await apiClient.post('/commerces', commerceToApi(payload));
  return mapCommerce(extractData({ data }));
}

export async function updateCommerce(id, payload) {
  const { data } = await apiClient.put(`/commerces/${id}`, commerceToApi(payload));
  return mapCommerce(extractData({ data }));
}

export async function createCommerceOwner(commerceId, payload) {
  const { data } = await apiClient.post(`/commerces/${commerceId}/owner`, {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    password: payload.password,
    password_confirmation: payload.passwordConfirmation || payload.password,
  });
  return extractData({ data });
}

// ——— Current commerce ———

export async function fetchCurrentCommerce() {
  const { data } = await commerceRequest('get', '/commerces/current/');
  return mapCommerce(extractData({ data }));
}

export async function updateCurrentCommerce(payload) {
  const { data } = await commerceRequest('put', '/commerces/current/', commerceToApi(payload));
  return mapCommerce(extractData({ data }));
}

export async function fetchCommerceDashboard() {
  const { data } = await commerceRequest('get', '/commerces/current/dashboard');
  return extractData({ data });
}

export async function fetchCommerceReport(type, params = {}) {
  const { data } = await commerceRequest('get', `/commerces/current/reports/${type}`, null, { params });
  return extractData({ data });
}

// Users

export async function fetchCommerceUsers() {
  const { data } = await commerceRequest('get', '/commerces/current/users');
  return extractList({ data }).map(mapCommerceUser);
}

export async function createCommerceUser(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/users', {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    password: payload.password,
    password_confirmation: payload.passwordConfirmation || payload.password,
    role: payload.role || 'seller',
    is_active: payload.isActive ?? true,
  });
  return mapCommerceUser(extractData({ data }));
}

export async function updateCommerceUser(id, payload) {
  const body = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.phone !== undefined) body.phone = payload.phone || null;
  if (payload.role !== undefined) body.role = payload.role;
  if (payload.isActive !== undefined) body.is_active = payload.isActive;
  if (payload.password) {
    body.password = payload.password;
    body.password_confirmation = payload.passwordConfirmation || payload.password;
  }
  const { data } = await commerceRequest('put', `/commerces/current/users/${id}`, body);
  return mapCommerceUser(extractData({ data }));
}

// Categories

export async function fetchCommerceCategories() {
  const { data } = await commerceRequest('get', '/commerces/current/categories');
  return extractList({ data }).map(mapCommerceCategory);
}

export async function createCommerceCategory(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/categories', {
    name: payload.name,
    description: payload.description || null,
  });
  return mapCommerceCategory(extractData({ data }));
}

// Products

export async function fetchCommerceProducts(params = {}) {
  const { data } = await commerceRequest('get', '/commerces/current/products', null, { params });
  return extractList({ data }).map(mapCommerceProduct);
}

export async function createCommerceProduct(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/products', {
    category_id: payload.categoryId || null,
    name: payload.name,
    sku: payload.sku || null,
    barcode: payload.barcode || null,
    unit: payload.unit || 'unit',
    purchase_price: payload.purchasePrice ?? 0,
    sale_price: payload.salePrice ?? 0,
    min_stock: payload.minStock ?? 0,
    max_stock: payload.maxStock || null,
    vat_rate: payload.vatRate || null,
    status: payload.status || 'active',
  });
  return mapCommerceProduct(extractData({ data }));
}

export async function updateCommerceProduct(id, payload) {
  const { data } = await commerceRequest('put', `/commerces/current/products/${id}`, {
    category_id: payload.categoryId || null,
    name: payload.name,
    sku: payload.sku || null,
    barcode: payload.barcode || null,
    unit: payload.unit || 'unit',
    purchase_price: payload.purchasePrice ?? 0,
    sale_price: payload.salePrice ?? 0,
    min_stock: payload.minStock ?? 0,
    max_stock: payload.maxStock || null,
    vat_rate: payload.vatRate || null,
    status: payload.status || 'active',
  });
  return mapCommerceProduct(extractData({ data }));
}

export async function deleteCommerceProduct(id) {
  await commerceRequest('delete', `/commerces/current/products/${id}`);
}

export async function importCommerceProducts(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await commerceRequest('post', '/commerces/current/products/import', formData);
  return extractData({ data });
}

export async function exportCommerceProducts() {
  const { data } = await commerceRequest('get', '/commerces/current/products/export');
  return extractData({ data });
}

// Stocks

export async function fetchCommerceStocks(params = {}) {
  const { data } = await commerceRequest('get', '/commerces/current/stocks', null, { params });
  return extractList({ data }).map(mapCommerceStock);
}

export async function fetchCommerceStock(id) {
  const { data } = await commerceRequest('get', `/commerces/current/stocks/${id}`);
  return mapCommerceStock(extractData({ data }));
}

export async function createCommerceStock(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/stocks', {
    name: payload.name,
    location: payload.location || null,
    manager_user_id: payload.managerUserId || null,
    status: payload.status || 'active',
  });
  return mapCommerceStock(extractData({ data }));
}

export async function updateCommerceStock(id, payload) {
  const { data } = await commerceRequest('put', `/commerces/current/stocks/${id}`, {
    name: payload.name,
    location: payload.location || null,
    manager_user_id: payload.managerUserId || null,
    status: payload.status || 'active',
  });
  return mapCommerceStock(extractData({ data }));
}

// Purchases

export async function fetchCommercePurchases() {
  const { data } = await commerceRequest('get', '/commerces/current/purchases');
  return extractList({ data });
}

export async function createCommercePurchase(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/purchases', {
    stock_id: payload.stockId,
    supplier_name: payload.supplierName || null,
    purchase_date: payload.purchaseDate,
    payment_status: payload.paymentStatus || 'paid',
    paid_from_cash: payload.paidFromCash ?? false,
    cash_register_id: payload.cashRegisterId || null,
    cash_motif: payload.cashMotif || null,
    notes: payload.notes || null,
    items: (payload.items || []).map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_cost: item.unitCost,
    })),
  });
  return extractData({ data });
}

// Stock exits

export async function createCommerceStockExit(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/stock-exits', {
    stock_id: payload.stockId,
    reason: payload.reason,
    items: (payload.items || []).map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_cost: item.unitCost ?? null,
    })),
  });
  return extractData({ data });
}

// Transfers

export async function fetchCommerceTransfers() {
  const { data } = await commerceRequest('get', '/commerces/current/transfers');
  return extractList({ data });
}

export async function createCommerceTransfer(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/transfers', {
    from_stock_id: payload.fromStockId,
    to_stock_id: payload.toStockId,
    notes: payload.notes || null,
    items: (payload.items || []).map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_cost: item.unitCost ?? null,
    })),
  });
  return extractData({ data });
}

// Movements

export async function fetchCommerceMovements(params = {}) {
  const { data } = await commerceRequest('get', '/commerces/current/movements', null, { params });
  return extractList({ data });
}

// Cash registers & sessions

export async function fetchCashRegisters() {
  const { data } = await commerceRequest('get', '/commerces/current/cash-registers');
  return extractList({ data });
}

export async function fetchCurrentCashSession(cashRegisterId) {
  const params = cashRegisterId ? { cash_register_id: cashRegisterId } : {};
  const { data } = await commerceRequest('get', '/commerces/current/cash-sessions/current', null, { params });
  const payload = extractData({ data });
  return payload ?? null;
}

export async function openCashSession(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/cash-sessions/open', {
    cash_register_id: payload.cashRegisterId,
    opening_float: payload.openingFloat ?? 0,
    notes: payload.notes || null,
  });
  return extractData({ data });
}

export async function closeCashSession(sessionId, payload) {
  const { data } = await commerceRequest('post', `/commerces/current/cash-sessions/${sessionId}/close`, {
    closing_counted: payload.closingCounted,
    notes: payload.notes || null,
  });
  return extractData({ data });
}

export async function createCashMovement(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/cash-sessions/movements', {
    cash_session_id: payload.cashSessionId,
    type: payload.type,
    amount: payload.amount,
    motif: payload.motif || null,
  });
  return extractData({ data });
}

// Sales

export async function fetchCommerceSales(params = {}) {
  const { data } = await commerceRequest('get', '/commerces/current/sales', null, { params });
  return extractList({ data }).map(mapCommerceSale);
}

export async function createCommerceSale(payload) {
  const { data } = await commerceRequest('post', '/commerces/current/sales', {
    stock_id: payload.stockId,
    cash_register_id: payload.cashRegisterId || null,
    payment_method: payload.paymentMethod || 'cash',
    cash_motif: payload.cashMotif || null,
    sold_at: payload.soldAt || null,
    notes: payload.notes || null,
    items: (payload.items || []).map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice ?? null,
    })),
  });
  return mapCommerceSale(extractData({ data }));
}
