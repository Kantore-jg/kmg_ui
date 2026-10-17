import { sameId } from './ids.js';

export function categoriesForMarket(market) {
  if (!market) return [];

  if (market.marketProductCategories?.length) {
    return market.marketProductCategories;
  }

  return [];
}

export function findMarketById(markets, marketId) {
  return markets.find((m) => sameId(m.id, marketId)) || null;
}

export function placeHasCategory(place, categoryName) {
  if (!categoryName || categoryName === 'all') return true;
  if (place?.categories?.length) {
    return place.categories.includes(categoryName);
  }
  return place?.category === categoryName
    || place?.category?.split(',').map((n) => n.trim()).includes(categoryName);
}