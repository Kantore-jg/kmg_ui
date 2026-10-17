import { apiClient, extractData, extractList } from '../client.js';
import {
  mapMarket,
  mapProductCategory,
  productCategoryToApi,
  mapBlock,
  mapPlace,
  mapMerchant,
  mapProduct,
  mapPlaceRequest,
  mapReceipt,
  mapPaymentMethod,
  paymentMethodToApi,
  mapSale,
  mapUser,
  saleToApi,
  marketToApi,
  userToApi,
  blockToApi,
  placeToApi,
  productToApi,
  placeRequestToApi,
} from '../mappers.js';
import { getStoredUser } from './auth.js';

const PER_PAGE = Number(import.meta.env.VITE_API_PAGE_SIZE);

if (!Number.isFinite(PER_PAGE) || PER_PAGE <= 0) {
  throw new Error('VITE_API_PAGE_SIZE must be a positive number');
}

function appendScalar(formData, key, value) {
  if (value === undefined || value === null || value === '') return;
  formData.append(key, String(value));
}

function appendArray(formData, key, values) {
  if (!Array.isArray(values)) return;
  values.forEach((value, index) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(`${key}[${index}]`, String(value));
    }
  });
}

function marketToFormData(market) {
  const formData = new FormData();
  const api = marketToApi(market);

  appendScalar(formData, 'name', api.name);
  appendScalar(formData, 'province', api.province);
  appendScalar(formData, 'commune', api.commune);
  appendScalar(formData, 'zone', api.zone);
  appendScalar(formData, 'colline', api.colline);
  appendScalar(formData, 'location', api.location);
  appendScalar(formData, 'description', api.description);
  appendScalar(formData, 'total_places', api.total_places);
  appendArray(formData, 'product_category_ids', api.product_category_ids);

  if (market.imageFile) {
    formData.append('image', market.imageFile);
    formData.append('cover_image', market.imageFile);
  }

  return formData;
}

function productToFormData(product) {
  const formData = new FormData();
  const api = productToApi(product);

  Object.entries(api).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
    } else {
      formData.append(key, String(value));
    }
  });

  if (product.imageFile) {
    formData.append('images[0]', product.imageFile);
  }

  return formData;
}

async function fetchScopedList(endpoint, params = {}) {
  const baseParams = { per_page: PER_PAGE, ...params };
  const firstResponse = await apiClient.get(endpoint, { params: { ...baseParams, page: 1 } });
  const firstPayload = firstResponse.data;
  const firstPage = extractList(firstResponse);
  const meta = firstPayload?.meta;

  if (!meta?.last_page || meta.last_page <= 1) {
    return firstPage;
  }

  const pages = [firstPage];
  for (let page = 2; page <= meta.last_page; page += 1) {
    const response = await apiClient.get(endpoint, { params: { ...baseParams, page } });
    pages.push(extractList(response));
  }

  return pages.flat();
}

export async function fetchProductCategories() {
  const { data } = await apiClient.get('/product-categories');
  return extractList({ data }).map(mapProductCategory);
}

export async function fetchAllProductCategories() {
  const { data } = await apiClient.get('/product-categories/manage');
  return extractList({ data }).map(mapProductCategory);
}

export async function createProductCategory(category) {
  const { data } = await apiClient.post('/product-categories', productCategoryToApi(category));
  return mapProductCategory(extractData({ data }));
}

export async function updateProductCategoryApi(id, category) {
  const { data } = await apiClient.put(`/product-categories/${id}`, productCategoryToApi(category));
  return mapProductCategory(extractData({ data }));
}

export async function deleteProductCategoryApi(id) {
  await apiClient.delete(`/product-categories/${id}`);
}

export async function fetchMarkets() {
  return (await fetchScopedList('/markets')).map(mapMarket);
}

export async function fetchPlaces(params = {}) {
  return (await fetchScopedList('/places', params)).map(mapPlace);
}

export async function fetchMerchants(params = {}) {
  return (await fetchScopedList('/merchants', params)).map(mapMerchant);
}

export async function fetchUsers(params = {}) {
  return (await fetchScopedList('/users', params)).map(mapUser);
}

export async function createUser(user) {
  const { data } = await apiClient.post('/users', userToApi(user));
  return mapUser(extractData({ data }));
}

export async function updateUserApi(id, user) {
  const { data } = await apiClient.put(`/users/${id}`, userToApi(user));
  return mapUser(extractData({ data }));
}

export async function deleteUserApi(id) {
  await apiClient.delete(`/users/${id}`);
}

export async function fetchProducts(params = {}) {
  return (await fetchScopedList('/products', params)).map(mapProduct);
}

const MARKET_OPS_ROLES = ['SUPER_ADMIN', 'ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE'];
const SALES_LIST_ROLES = ['SUPER_ADMIN', 'ADMIN_MARCHE'];

export async function fetchPlaceRequests(user = getStoredUser()) {
  const isAdmin = MARKET_OPS_ROLES.includes(user?.role);
  const endpoint = isAdmin ? '/place-requests' : '/my/place-requests';
  return (await fetchScopedList(endpoint)).map(mapPlaceRequest);
}

export async function fetchSales(params = {}, user = getStoredUser()) {
  if (user?.role === 'PROPRIETAIRE_MARCHE') {
    return [];
  }
  const isAdmin = SALES_LIST_ROLES.includes(user?.role);
  const endpoint = isAdmin ? '/sales' : '/my/sales';
  return (await fetchScopedList(endpoint, params)).map(mapSale);
}

export async function fetchSale(id) {
  const { data } = await apiClient.get(`/sales/${id}`);
  return mapSale(extractData({ data }));
}

export async function createSale(sale) {
  const { data } = await apiClient.post('/sales', saleToApi(sale));
  return mapSale(extractData({ data }));
}

export async function fetchReceipts(user = getStoredUser()) {
  const isAdmin = MARKET_OPS_ROLES.includes(user?.role);
  const endpoint = isAdmin ? '/receipts' : '/my/receipts';
  return (await fetchScopedList(endpoint)).map(mapReceipt);
}

export async function createMarket(market) {
  if (market.imageFile) {
    const { data } = await apiClient.post('/markets', marketToFormData(market));
    return mapMarket(extractData({ data }));
  }
  const { data } = await apiClient.post('/markets', marketToApi(market));
  return mapMarket(extractData({ data }));
}

export async function updateMarket(id, market) {
  if (market.imageFile) {
    const formData = marketToFormData(market);
    formData.append('_method', 'PUT');
    const { data } = await apiClient.post(`/markets/${id}`, formData);
    return mapMarket(extractData({ data }));
  }
  const { data } = await apiClient.put(`/markets/${id}`, marketToApi(market));
  return mapMarket(extractData({ data }));
}

export async function deleteMarketApi(id) {
  await apiClient.delete(`/markets/${id}`);
}

export async function fetchBlocks(marketId) {
  const { data } = await apiClient.get(`/markets/${marketId}/blocks`);
  return extractList({ data }).map(mapBlock);
}

export async function createBlock(marketId, block) {
  const { data } = await apiClient.post(`/markets/${marketId}/blocks`, blockToApi(block));
  return mapBlock(extractData({ data }));
}

export async function updateBlockApi(id, block) {
  const { data } = await apiClient.put(`/market-blocks/${id}`, blockToApi(block));
  return mapBlock(extractData({ data }));
}

export async function deleteBlockApi(id) {
  await apiClient.delete(`/market-blocks/${id}`);
}

export async function createPlace(place) {
  const { data } = await apiClient.post('/places', placeToApi(place));
  return mapPlace(extractData({ data }));
}

export async function updatePlaceApi(placeId, payload) {
  const { data } = await apiClient.put(`/places/${placeId}`, payload);
  return mapPlace(extractData({ data }));
}

export async function deletePlaceApi(placeId) {
  await apiClient.delete(`/places/${placeId}`);
}

export async function assignPlaceChief(placeId, userId) {
  const { data } = await apiClient.post(`/places/${placeId}/assign-chief`, { user_id: userId });
  return mapPlace(extractData({ data }));
}

export async function createProduct(product) {
  if (product.imageFile) {
    const { data } = await apiClient.post('/products', productToFormData(product));
    return mapProduct(extractData({ data }));
  }
  const { data } = await apiClient.post('/products', productToApi(product));
  return mapProduct(extractData({ data }));
}

export async function updateProductApi(id, product) {
  if (product.imageFile) {
    const formData = productToFormData(product);
    formData.append('_method', 'PUT');
    const { data } = await apiClient.post(`/products/${id}`, formData);
    return mapProduct(extractData({ data }));
  }
  const { data } = await apiClient.put(`/products/${id}`, productToApi(product));
  return mapProduct(extractData({ data }));
}

export async function deleteProductApi(id) {
  await apiClient.delete(`/products/${id}`);
}

export async function createPlaceRequest(request) {
  const { data } = await apiClient.post('/place-requests', placeRequestToApi(request));
  return mapPlaceRequest(extractData({ data }));
}

export async function approvePlaceRequest(id, placeId = null) {
  const { data } = await apiClient.post(`/place-requests/${id}/approve`, placeId ? { place_id: placeId } : {});
  return mapPlaceRequest(extractData({ data }));
}

export async function rejectPlaceRequest(id, reason) {
  const { data } = await apiClient.post(`/place-requests/${id}/reject`, { reason });
  return mapPlaceRequest(extractData({ data }));
}

export async function createReceipt(formData) {
  const { data } = await apiClient.post('/receipts', formData);
  return mapReceipt(extractData({ data }));
}

export async function approveReceipt(id) {
  const { data } = await apiClient.post(`/receipts/${id}/approve`);
  return mapReceipt(extractData({ data }));
}

export async function rejectReceipt(id, reason) {
  const { data } = await apiClient.post(`/receipts/${id}/reject`, { reason });
  return mapReceipt(extractData({ data }));
}

export async function fetchPaymentMethods(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  });
  const suffix = query.toString() ? `?${query}` : '';
  const { data } = await apiClient.get(`/payment-methods${suffix}`);
  return extractList({ data }).map(mapPaymentMethod);
}

export async function createPaymentMethod(payload) {
  const { data } = await apiClient.post('/payment-methods', paymentMethodToApi(payload));
  return mapPaymentMethod(extractData({ data }));
}

export async function updatePaymentMethod(id, payload) {
  const { data } = await apiClient.put(`/payment-methods/${id}`, paymentMethodToApi(payload));
  return mapPaymentMethod(extractData({ data }));
}

export async function deletePaymentMethod(id) {
  const { data } = await apiClient.delete(`/payment-methods/${id}`);
  return mapPaymentMethod(extractData({ data }));
}

export async function fetchRentSummary(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.set(key, String(value));
    }
  });
  const suffix = query.toString() ? `?${query}` : '';
  const { data } = await apiClient.get(`/rent-summary${suffix}`);
  return extractData({ data });
}
