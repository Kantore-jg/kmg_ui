import { useRouter } from 'vue-router';

export function usePrintReport() {
  const router = useRouter();

  const openPrint = (type, query = {}) => {
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    router.push({ path: `/admin/print/${type}`, query: cleanQuery });
  };

  const openMerchantsPrint = (marketId) => openPrint('merchants', { market: marketId });
  const openPlacesPrint = (marketId) => openPrint('places', { market: marketId });

  return {
    openPrint,
    openMerchantsPrint,
    openPlacesPrint,
  };
}
