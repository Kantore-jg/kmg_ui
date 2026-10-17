<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApp } from '../../../composables/useApp.js';
import { useAdminScope } from '../../../composables/useAdminScope.js';
import PrintLayout from './PrintLayout.vue';
import { getAdministrativeLocationLabel } from '../../../utils/burundiLocations.js';
import {
  PLACE_STATUS,
  isPlaceAvailable,
  isPlaceOccupied,
  placeStatusLabel,
} from '../../../utils/placeStatus.js';

const route = useRoute();
const { currentUser } = useApp();
const {
  scopedPlaces,
  scopedMarkets,
  isMarketAdmin,
  isMarketOwner,
  assignedMarketId,
  findMarket,
  findMerchant,
} = useAdminScope();

const selectedMarketId = computed(() => {
  if (route.query.market) return route.query.market;
  if (isMarketAdmin.value || isMarketOwner.value) return assignedMarketId.value;
  return null;
});

const market = computed(() =>
  selectedMarketId.value ? findMarket(selectedMarketId.value) : null,
);

const places = computed(() => {
  if (!selectedMarketId.value) return scopedPlaces.value;
  return scopedPlaces.value.filter((p) => p.marketId == selectedMarketId.value);
});

const occupiedCount = computed(() =>
  places.value.filter((p) => p.status === PLACE_STATUS.OCCUPIED).length,
);
const freeCount = computed(() =>
  places.value.filter((p) => p.status === PLACE_STATUS.AVAILABLE).length,
);

const printedAt = computed(() =>
  new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
);

const statusBadgeClass = (status) => {
  if (isPlaceOccupied(status)) return 'badge-print badge-print--success';
  if (isPlaceAvailable(status)) return 'badge-print badge-print--muted';
  return 'badge-print badge-print--warning';
};

const statusLabel = (status) => {
  return placeStatusLabel(status);
};

onMounted(() => {
  document.title = `Emplacements — ${market.value?.name || 'Akaguriro'}`;
});
</script>

<template>
  <PrintLayout title="Impression — Emplacements" back-path="/admin/places">
    <div class="print-document">
      <header class="print-document__header">
        <div class="print-document__brand">AKAGURIRO</div>
        <!-- <div class="print-document__subtitle">République du Burundi — Rapport officiel</div> -->
        <h1 class="print-document__title">
          Plan des emplacements
          <template v-if="market"> — {{ market.name }}</template>
        </h1>
        <div class="print-document__meta">
          <span v-if="market"><strong>Marché :</strong> {{ market.name }} ({{ getAdministrativeLocationLabel(market) }})</span>
          <!-- <span><strong>Édité par :</strong> {{ currentUser.name }}</span> -->
          <span><strong>Date :</strong> {{ printedAt }}</span>
        </div>
      </header>

      <div class="print-document__stats">
        <div class="print-document__stat">
          <div class="print-document__stat-label">Total étals</div>
          <div class="print-document__stat-value">{{ places.length }}</div>
        </div>
        <div class="print-document__stat">
          <div class="print-document__stat-label">Occupés</div>
          <div class="print-document__stat-value">{{ occupiedCount }}</div>
        </div>
        <div class="print-document__stat">
          <div class="print-document__stat-label">Libres</div>
          <div class="print-document__stat-value">{{ freeCount }}</div>
        </div>
        <div class="print-document__stat">
          <div class="print-document__stat-label">Taux occupation</div>
          <div class="print-document__stat-value">
            {{ places.length ? Math.round((occupiedCount / places.length) * 100) : 0 }}%
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Étal</th>
            <th>Marché</th>
            <th>Bloc / Allée</th>
            <th>Filière</th>
            <th>Occupant</th>
            <th>Téléphone</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!places.length">
            <td colspan="8" style="text-align:center;color:#9ca3af;padding:2rem">
              Aucun emplacement à afficher.
            </td>
          </tr>
          <tr v-for="(place, idx) in places" :key="place.placeId || place.id">
            <td>{{ idx + 1 }}</td>
            <td><strong>{{ place.id }}</strong></td>
            <td>{{ findMarket(place.marketId)?.name || '—' }}</td>
            <td>{{ place.blockName }} · {{ place.rowName }}</td>
            <td>{{ place.category || '—' }}</td>
            <td>{{ findMerchant(place.merchantId)?.name || '—' }}</td>
            <td>{{ findMerchant(place.merchantId)?.phone || '—' }}</td>
            <td>
              <span :class="statusBadgeClass(place.status)">
                {{ statusLabel(place.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <footer class="print-document__footer">
        <span>Document Akaguriro</span>
        <span>{{ printedAt }}</span>
      </footer>
    </div>
  </PrintLayout>
</template>
