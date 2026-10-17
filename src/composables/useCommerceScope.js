import { ref, computed, onMounted } from 'vue';
import { getStoredUser } from '../api/services/auth.js';
import { fetchCurrentCommerce, getCommerceId, setCommerceId } from '../api/services/commerce.js';
import { COMMERCE_ROLE_LABELS } from '../api/mappers.js';

const ALL_PERMISSIONS = [
  'canManageUsers',
  'canManageProducts',
  'canManageStocks',
  'canManageSales',
  'canManageCash',
  'canViewReports',
  'canManageSettings',
];

const ROLE_PERMISSIONS = {
  owner: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  cashier: ['canManageSales', 'canManageCash', 'canViewReports'],
  stock_manager: ['canManageProducts', 'canManageStocks', 'canViewReports'],
  seller: ['canManageSales', 'canViewReports'],
};

export function useCommerceScope() {
  const user = computed(() => getStoredUser() || {});
  const currentCommerce = ref(null);
  const loading = ref(false);

  const commerceRole = computed(() => {
    const memberships = user.value.commerceMemberships || [];
    const commerceId = getCommerceId() || user.value.commerceId;
    const match = memberships.find((m) => String(m.commerceId) === String(commerceId));
    return match?.role || user.value.commerceRole || null;
  });

  const commerceRoleLabel = computed(() =>
    COMMERCE_ROLE_LABELS[commerceRole.value] || commerceRole.value || '—',
  );

  const permissions = computed(() => ROLE_PERMISSIONS[commerceRole.value] || []);

  const canManageUsers = computed(() => permissions.value.includes('canManageUsers'));
  const canManageProducts = computed(() => permissions.value.includes('canManageProducts'));
  const canManageStocks = computed(() => permissions.value.includes('canManageStocks'));
  const canManageSales = computed(() => permissions.value.includes('canManageSales'));
  const canManageCash = computed(() => permissions.value.includes('canManageCash'));
  const canViewReports = computed(() => permissions.value.includes('canViewReports'));
  const canManageSettings = computed(() => permissions.value.includes('canManageSettings'));

  async function loadCommerce() {
    loading.value = true;
    try {
      currentCommerce.value = await fetchCurrentCommerce();
    } catch {
      currentCommerce.value = null;
    } finally {
      loading.value = false;
    }
  }

  function switchCommerce(commerceId) {
    setCommerceId(commerceId);
    return loadCommerce();
  }

  onMounted(() => {
    if (getCommerceId() || user.value.commerceId) {
      if (!getCommerceId() && user.value.commerceId) {
        setCommerceId(user.value.commerceId);
      }
      void loadCommerce();
    }
  });

  return {
    user,
    currentCommerce,
    loading,
    commerceRole,
    commerceRoleLabel,
    canManageUsers,
    canManageProducts,
    canManageStocks,
    canManageSales,
    canManageCash,
    canViewReports,
    canManageSettings,
    loadCommerce,
    switchCommerce,
  };
}
