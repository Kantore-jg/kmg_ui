import { computed } from 'vue';
import { useApp } from './useApp.js';
import { PLACE_STATUS } from '../utils/placeStatus.js';

export function useAdminScope() {
  const {
    currentUser,
    markets,
    merchants,
    places,
    blocks,
    products,
    requests,
    receipts,
    sales,
    users,
  } = useApp();

  const isSuperAdmin = computed(() => currentUser.value.role === 'SUPER_ADMIN');
  const isMarketAdmin = computed(() => currentUser.value.role === 'ADMIN_MARCHE');
  const isMarketOwner = computed(() => currentUser.value.role === 'PROPRIETAIRE_MARCHE');
  const isMerchant = computed(() => currentUser.value.role === 'COMMERCANT');

  const assignedMarketId = computed(() =>
    isMarketAdmin.value || isMarketOwner.value ? currentUser.value.marketId : null,
  );

  const assignedMerchantId = computed(() =>
    isMerchant.value ? currentUser.value.merchantId : null,
  );

  const assignedMerchant = computed(() =>
    assignedMerchantId.value
      ? merchants.value.find((m) => m.id === assignedMerchantId.value)
      : null,
  );

  const scopedMarkets = computed(() => {
    if (assignedMarketId.value) {
      return markets.value.filter((m) => m.id == assignedMarketId.value);
    }
    return markets.value;
  });

  const scopedPlaces = computed(() =>
    places.value.filter(
      (p) => !assignedMarketId.value || p.marketId == assignedMarketId.value,
    ),
  );

  const scopedBlocks = computed(() =>
    blocks.value.filter(
      (b) => !assignedMarketId.value || b.marketId == assignedMarketId.value,
    ),
  );

  const scopedMerchants = computed(() => {
    if (isMerchant.value && assignedMerchantId.value) {
      return merchants.value.filter((m) => m.id === assignedMerchantId.value);
    }
    if (assignedMarketId.value) {
      return merchants.value.filter((m) => m.activeMarketId == assignedMarketId.value);
    }
    return merchants.value;
  });

  const scopedProducts = computed(() => {
    if (isMerchant.value && assignedMerchantId.value) {
      return products.value.filter((p) => p.merchantId === assignedMerchantId.value);
    }
    if (assignedMarketId.value) {
      return products.value.filter((p) => p.marketId == assignedMarketId.value);
    }
    return products.value;
  });

  const scopedRequests = computed(() =>
    requests.value.filter(
      (r) => !assignedMarketId.value || r.requestedMarketId == assignedMarketId.value,
    ),
  );

  // L'API filtre déjà les utilisateurs selon le rôle de l'acteur.
  const scopedUsers = computed(() => users.value);

  const scopedReceipts = computed(() => {
    if (isMerchant.value && assignedMerchantId.value) {
      return receipts.value.filter((r) => r.merchantId === assignedMerchantId.value);
    }
    if (assignedMarketId.value) {
      return receipts.value.filter((r) => r.marketId == assignedMarketId.value);
    }
    return receipts.value;
  });

  const scopedPendingRequests = computed(() =>
    scopedRequests.value.filter((r) => r.status === 'pending'),
  );

  const scopedSales = computed(() => {
    if (isMerchant.value && assignedMerchantId.value) {
      return sales.value.filter((s) => s.merchantId === assignedMerchantId.value);
    }
    if (assignedMarketId.value) {
      return sales.value.filter((s) => s.marketId == assignedMarketId.value);
    }
    return sales.value;
  });

  const scopedPendingReceipts = computed(() =>
    scopedReceipts.value.filter((r) => r.status === 'pending'),
  );

  const scopedApprovedReceipts = computed(() =>
    scopedReceipts.value.filter((r) => r.status === 'approved'),
  );

  const scopedApprovedReceiptsTotal = computed(() =>
    scopedApprovedReceipts.value.reduce((sum, r) => sum + r.amount, 0),
  );

  const scopedSalesTotal = computed(() =>
    scopedSales.value.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
  );

  const scopedTotalPlaces = computed(() => scopedPlaces.value.length);

  const scopedOccupiedPlaces = computed(() =>
    scopedPlaces.value.filter((p) => p.status === PLACE_STATUS.OCCUPIED).length,
  );

  const scopedFreePlaces = computed(
    () => scopedTotalPlaces.value - scopedOccupiedPlaces.value,
  );

  const scopedOccupationRate = computed(() => {
    if (!scopedTotalPlaces.value) return 0;
    return Math.round((scopedOccupiedPlaces.value / scopedTotalPlaces.value) * 100);
  });

  const scopedMarketOccupation = computed(() =>
    scopedMarkets.value.map((market) => {
      const marketPlaces = scopedPlaces.value.filter((p) => p.marketId == market.id);
      const occupied = marketPlaces.filter((p) => p.status === PLACE_STATUS.OCCUPIED).length;
      const total = marketPlaces.length || market.totalPlaces || 0;
      return {
        id: market.id,
        name: market.name,
        occupied,
        total,
        rate: total ? Math.round((occupied / total) * 100) : 0,
      };
    }),
  );

  const scopedWeeklyReceiptActivity = computed(() => {
    const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    const counts = days.map(() => 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    scopedReceipts.value.forEach((receipt) => {
      if (!receipt.submittedDate) return;
      const date = new Date(receipt.submittedDate);
      if (Number.isNaN(date.getTime()) || date < weekAgo) return;
      counts[date.getDay()] += 1;
    });

    return days.map((label, index) => ({ label, value: counts[index] }));
  });

  const scopedReceiptStatusBreakdown = computed(() => {
    const totals = { approved: 0, pending: 0, rejected: 0 };
    scopedReceipts.value.forEach((receipt) => {
      if (totals[receipt.status] !== undefined) {
        totals[receipt.status] += receipt.amount;
      }
    });

    return [
      { label: 'Validés', value: totals.approved, color: '#2e7d32' },
      { label: 'En attente', value: totals.pending, color: '#f9a825' },
      { label: 'Rejetés', value: totals.rejected, color: '#e53935' },
    ].filter((segment) => segment.value > 0);
  });

  const findMarket = (id) => markets.value.find((m) => m.id === id);
  const findMerchant = (id) => merchants.value.find((m) => m.id === id);

  return {
    currentUser,
    markets,
    merchants,
    places,
    blocks,
    products,
    requests,
    receipts,
    sales,
    users,
    isSuperAdmin,
    isMarketAdmin,
    isMarketOwner,
    isMerchant,
    assignedMarketId,
    assignedMerchantId,
    assignedMerchant,
    scopedMarkets,
    scopedPlaces,
    scopedBlocks,
    scopedMerchants,
    scopedProducts,
    scopedRequests,
    scopedUsers,
    scopedReceipts,
    scopedSales,
    scopedPendingRequests,
    scopedPendingReceipts,
    scopedApprovedReceipts,
    scopedApprovedReceiptsTotal,
    scopedSalesTotal,
    scopedTotalPlaces,
    scopedOccupiedPlaces,
    scopedFreePlaces,
    scopedOccupationRate,
    scopedMarketOccupation,
    scopedWeeklyReceiptActivity,
    scopedReceiptStatusBreakdown,
    findMarket,
    findMerchant,
  };
}
