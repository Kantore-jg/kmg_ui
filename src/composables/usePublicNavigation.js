import { useRouter } from 'vue-router';
import { useApp } from './useApp.js';
import { toIdString } from '../utils/ids.js';

export function usePublicNavigation() {
  const router = useRouter();
  const {
    setPublicTab,
    setSelectedMarketId,
    setSelectedMerchantId,
  } = useApp();

  const goHome = () => {
    setSelectedMarketId(null);
    setSelectedMerchantId(null);
    setPublicTab('home');
    router.push('/');
  };

  const goToTab = (tab) => {
    const paths = {
      home: '/',
      merchants: '/merchants',
      request: '/request',
      auth: '/login',
    };
    setSelectedMarketId(null);
    setSelectedMerchantId(null);
    setPublicTab(tab);
    router.push(paths[tab] || '/');
  };

  const goToMarketsList = () => {
    setSelectedMarketId(null);
    setSelectedMerchantId(null);
    setPublicTab('markets');
    router.push('/markets');
  };

  const goToMarket = (marketId) => {
    if (marketId == null) return goToMarketsList();
    setSelectedMarketId(marketId);
    setPublicTab('markets');
    router.push(`/markets/${toIdString(marketId)}`);
  };

  const goToMerchantsList = () => {
    setSelectedMerchantId(null);
    setSelectedMarketId(null);
    setPublicTab('merchants');
    router.push('/merchants');
  };

  return {
    goHome,
    goToTab,
    goToMarketsList,
    goToMarket,
    goToMerchantsList,
  };
}
