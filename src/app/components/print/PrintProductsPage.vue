<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApp } from '../../../composables/useApp.js';
import { useAdminScope } from '../../../composables/useAdminScope.js';
import PrintLayout from './PrintLayout.vue';
import { getAdministrativeLocationLabel } from '../../../utils/burundiLocations.js';

const route = useRoute();
const { currentUser } = useApp();
const {
  scopedProducts,
  scopedMerchants,
  scopedMarkets,
  isMerchant,
  isMarketAdmin,
  assignedMarketId,
  assignedMerchant,
  findMarket,
  findMerchant,
} = useAdminScope();

const selectedMarketId = computed(() => {
  if (route.query.market) return route.query.market;
  if (isMarketAdmin.value) return assignedMarketId.value;
  if (isMerchant.value) return assignedMerchant.value?.activeMarketId;
  return null;
});

const selectedMerchantId = computed(() => {
  if (route.query.merchant) return route.query.merchant;
  if (isMerchant.value) return assignedMerchant.value?.id;
  return null;
});

const market = computed(() =>
  selectedMarketId.value ? findMarket(selectedMarketId.value) : null,
);

const merchant = computed(() =>
  selectedMerchantId.value ? findMerchant(selectedMerchantId.value) : null,
);

const products = computed(() => {
  let list = scopedProducts.value;
  if (selectedMarketId.value) {
    list = list.filter((p) => p.marketId == selectedMarketId.value);
  }
  if (selectedMerchantId.value) {
    list = list.filter((p) => p.merchantId == selectedMerchantId.value);
  }
  return [...list].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
});

const availableCount = computed(() =>
  products.value.filter((p) => p.available !== false).length,
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

const formatPrice = (n) => Number(n).toLocaleString('fr-FR');

const pageTitle = computed(() => {
  if (isMerchant.value) return 'Catalogue de mes produits';
  if (merchant.value) return `Catalogue — ${merchant.value.name}`;
  if (market.value) return `Catalogue produits — ${market.value.name}`;
  return 'Catalogue des produits';
});

const backPath = computed(() =>
  isMerchant.value ? '/admin/products' : '/admin/products',
);

onMounted(() => {
  document.title = `${pageTitle.value} — Akaguriro`;
});
</script>

<template>
  <PrintLayout :title="`Impression — ${pageTitle}`" :back-path="backPath">
    <div class="print-document">
      <header class="print-document__header">
        <div class="print-document__brand">AKAGURIRO</div>
        <div class="print-document__subtitle">République du Burundi — Catalogue produits</div>
        <!-- <h1 class="print-document__title">{{ pageTitle }}</h1> -->
        <div class="print-document__meta">
          <span v-if="market"><strong>Marché :</strong> {{ market.name }} ({{ getAdministrativeLocationLabel(market) }})</span>
          <span v-if="merchant"><strong>Commerçant :</strong> {{ merchant.name }}</span>
          <span v-if="merchant"><strong>Étal :</strong> {{ merchant.activePlaceNumber || '—' }}</span>
          <!-- <span><strong>Édité par :</strong> {{ currentUser.name }}</span> -->
          <span><strong>Date :</strong> {{ printedAt }}</span>
        </div>
      </header>

      <div class="print-document__stats">
        <!-- <div class="print-document__stat">
          <div class="print-document__stat-label">Total produits</div>
          <div class="print-document__stat-value">{{ products.length }}</div>
        </div> -->
        <!-- <div class="print-document__stat">
          <div class="print-document__stat-label">Disponibles</div>
          <div class="print-document__stat-value">{{ availableCount }}</div>
        </div> -->
        <div v-if="!isMerchant" class="print-document__stat">
          <div class="print-document__stat-label">Commerçants</div>
          <div class="print-document__stat-value">{{ scopedMerchants.length }}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Produit</th>
            <th>Catégorie</th>
            <th v-if="!isMerchant && !merchant">Commerçant</th>
            <th>Étal</th>
            <th>Prix (BIF)</th>
            <th>Unité</th>
            <th>Stock</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!products.length">
            <td :colspan="isMerchant || merchant ? 8 : 9" style="text-align:center;color:#9ca3af;padding:2rem">
              Aucun produit à afficher.
            </td>
          </tr>
          <tr v-for="(p, idx) in products" :key="p.id">
            <td>{{ idx + 1 }}</td>
            <td>
              <strong>{{ p.name }}</strong>
              <div v-if="p.description" style="font-size:0.7rem;color:#6b7280;margin-top:0.15rem">
                {{ p.description }}
              </div>
            </td>
            <td>{{ p.category }}</td>
            <td v-if="!isMerchant && !merchant">{{ findMerchant(p.merchantId)?.name || '—' }}</td>
            <td>{{ p.placeNumber || '—' }}</td>
            <td><strong>{{ formatPrice(p.price) }}</strong></td>
            <td>{{ p.unit }}</td>
            <td>{{ p.stock }}</td>
            <td>
              <span :class="p.available !== false ? 'badge-print badge-print--success' : 'badge-print badge-print--danger'">
                {{ p.available !== false ? 'Disponible' : 'Indisponible' }}
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
