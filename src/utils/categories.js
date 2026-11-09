import { sameId } from './ids.js';

export function findMarketById(markets, marketId) {
  return markets.find((m) => sameId(m.id, marketId)) || null;
}
