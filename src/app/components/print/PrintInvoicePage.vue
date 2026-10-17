<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApp } from '../../../composables/useApp.js';
import PrintLayout from './PrintLayout.vue';

const route = useRoute();
const { getSale } = useApp();

const sale = ref(null);
const loading = ref(true);

const saleId = computed(() => route.query.sale);

onMounted(async () => {
  if (saleId.value) {
    sale.value = await getSale(saleId.value);
  }
  loading.value = false;
});

const formatPrice = (n) => Number(n || 0).toLocaleString('fr-FR');

const paymentLabel = computed(() => {
  if (!sale.value) return '';
  if (sale.value.paymentType === 'cash') return 'Espèces (Cash)';
  if (sale.value.paymentType === 'electronic') return 'Électronique';
  if (sale.value.paymentType === 'credit') return 'Crédit';
  return sale.value.paymentType;
});

const paidAmount = computed(() => Number(sale.value?.paidAmount ?? sale.value?.total ?? 0));

const remainingAmount = computed(() =>
  Number(sale.value?.remainingAmount ?? Math.max(Number(sale.value?.total ?? 0) - paidAmount.value, 0)),
);

const saleDate = computed(() => {
  if (!sale.value?.createdAtFull) return '';
  return new Date(sale.value.createdAtFull).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

const printedAt = computed(() =>
  new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
);
</script>

<template>
  <PrintLayout back-path="/admin/sales" title="Facture de vente">
    <div v-if="loading" class="print-document text-center py-20 text-gray-500">
      Chargement de la facture...
    </div>

    <div v-else-if="!sale" class="print-document text-center py-20 text-gray-500">
      Facture introuvable.
    </div>

    <div v-else class="print-document">
      <header class="print-document__header">
        <div class="flex justify-between items-start gap-6">
          <div>
            <p class="print-document__brand">AKAGURIRO</p>
            <!-- <p class="print-document__subtitle">Système de gestion des marchés</p> -->
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-gray-900">FACTURE</p>
            <p class="font-mono text-sm text-gray-600 mt-1">{{ sale.invoiceNumber }}</p>
          </div>
        </div>
        <div class="print-document__meta mt-4">
          <span><strong>Date :</strong> {{ saleDate }}</span>
          <span><strong>Marché :</strong> {{ sale.marketName }}</span>
          <span v-if="sale.placeNumber"><strong>Place :</strong> {{ sale.placeNumber }}</span>
          <span><strong>Paiement :</strong> {{ paymentLabel }}</span>
          <span><strong>Payé :</strong> {{ formatPrice(paidAmount) }} FBU</span>
          <span v-if="remainingAmount > 0"><strong>Reste :</strong> {{ formatPrice(remainingAmount) }} FBU</span>
        </div>
        <div>
          <p class="font-semibold">Client : {{ sale.clientName }}</p>
          <p v-if="sale.clientPhone" class="text-sm text-gray-600">{{ sale.clientPhone }}</p>
        </div>
      </header>

      <!-- <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div class="rounded-lg border border-gray-200 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Commerçant</p>
          <p class="font-semibold">{{ sale.merchantName }}</p>
          <p v-if="sale.merchantPhone" class="text-sm text-gray-600">{{ sale.merchantPhone }}</p>
          <p v-if="sale.merchantEmail" class="text-sm text-gray-600">{{ sale.merchantEmail }}</p>
        </div>
        <div class="rounded-lg border border-gray-200 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Client</p>
          <p class="font-semibold">{{ sale.clientName }}</p>
          <p v-if="sale.clientPhone" class="text-sm text-gray-600">{{ sale.clientPhone }}</p>
          <p v-if="sale.clientEmail" class="text-sm text-gray-600">{{ sale.clientEmail }}</p>
        </div>
      </div> -->

      <table class="print-table w-full mb-6">
        <thead>
          <tr>
            <th class="text-left">Produit</th>
            <th class="text-center">Qté</th>
            <th class="text-right">Prix unit.</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sale.items" :key="item.id">
            <td>
              {{ item.productName }}
              <span class="text-gray-500 text-xs">({{ item.productUnit }})</span>
            </td>
            <td class="text-center">{{ item.quantity }}</td>
            <td class="text-right">{{ formatPrice(item.unitPrice) }} FBU</td>
            <td class="text-right font-medium">{{ formatPrice(item.lineTotal) }} FBU</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-right font-semibold pt-4">Sous-total</td>
            <td class="text-right font-semibold pt-4">{{ formatPrice(sale.subtotal) }} FBU</td>
          </tr>
          <tr>
            <td colspan="3" class="text-right font-bold text-lg">Total</td>
            <td class="text-right font-bold text-lg text-red-600">{{ formatPrice(sale.total) }} FBU</td>
          </tr>
        </tfoot>
      </table>


      <footer class="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p>Merci pour votre achat !</p>
      </footer>
    </div>
  </PrintLayout>
</template>
