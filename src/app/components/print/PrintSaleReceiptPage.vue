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

const formatPrice = (value) => Number(value || 0).toLocaleString('fr-FR');

const paymentLabel = computed(() => {
  if (!sale.value) return '';
  if (sale.value.paymentType === 'cash') return 'Espèces';
  if (sale.value.paymentType === 'electronic') return 'Électronique';
  if (sale.value.paymentType === 'credit') return 'Crédit';
  return sale.value.paymentType || '—';
});

const paidAmount = computed(() => Number(sale.value?.paidAmount ?? sale.value?.total ?? 0));

const remainingAmount = computed(() =>
  Number(
    sale.value?.remainingAmount ??
      Math.max(Number(sale.value?.total ?? 0) - paidAmount.value, 0),
  ),
);

const receiptDate = computed(() => {
  if (!sale.value?.createdAtFull) return '';
  return new Date(sale.value.createdAtFull).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});
</script>

<template>
  <PrintLayout back-path="/admin/sales" title="Reçu de vente">
    <div v-if="loading" class="receipt-shell">
      <div class="receipt-paper receipt-paper--loading">Chargement du reçu...</div>
    </div>

    <div v-else-if="!sale" class="receipt-shell">
      <div class="receipt-paper receipt-paper--loading">Reçu introuvable.</div>
    </div>

    <div v-else class="receipt-shell">
      <article class="receipt-paper">
        <header class="receipt-header">
          <div class="receipt-brand">AKAGURIRO</div>
          <div class="receipt-subtitle">Reçu de vente</div>
          <div class="receipt-line" />
          <div class="receipt-meta">
            <div class="receipt-meta-row">
              <span>n°</span>
              <strong>{{ sale.invoiceNumber }}</strong>
            </div>
            <div class="receipt-meta-row">
              <span>Date</span>
              <strong>{{ receiptDate }}</strong>
            </div>
            <div class="receipt-meta-row">
              <span>Marché</span>
              <strong>{{ sale.marketName }}</strong>
            </div>
            <!-- <div v-if="sale.placeNumber" class="receipt-meta-row">
              <span>Étal</span>
              <strong>{{ sale.placeNumber }}</strong>
            </div> -->
            <div class="receipt-meta-row">
              <span>Paiement</span>
              <strong>{{ paymentLabel }}</strong>
            </div>
            <div class="receipt-client">
              <span>Client :</span>
              <strong>{{ sale.clientName }}</strong>
            </div>

          </div>
        </header>

        <!-- <section class="receipt-block">
          <div class="receipt-section-title">Client</div>
          <div class="receipt-client">{{ sale.clientName }}</div>
          <div v-if="sale.clientPhone" class="receipt-muted">{{ sale.clientPhone }}</div>
          <div v-if="sale.clientEmail" class="receipt-muted">{{ sale.clientEmail }}</div>
        </section> -->

        <div class="receipt-line" />

        <section class="receipt-block">
          <div class="receipt-items-header">
            <span>Qté</span>
            <span>Produit</span>
            <span class="text-right">Total</span>
          </div>

          <div
            v-for="item in sale.items"
            :key="item.id"
            class="receipt-item"
          >
            <span class="receipt-item-qty">{{ item.quantity }}x</span>
            <span class="receipt-item-name">{{ item.productName }}</span>
            <span class="receipt-item-total">{{ formatPrice(item.lineTotal) }}</span>
          </div>
        </section>

        <div class="receipt-line" />

        <section class="receipt-totals">
          <div class="receipt-total-row">
            <span>Sous-total</span>
            <strong>{{ formatPrice(sale.subtotal) }} FBU</strong>
          </div>
          <div class="receipt-total-row">
            <span>Total</span>
            <strong>{{ formatPrice(sale.total) }} FBU</strong>
          </div>
          <div class="receipt-total-row">
            <span>Payé</span>
            <strong>{{ formatPrice(paidAmount) }} FBU</strong>
          </div>
          <div v-if="remainingAmount > 0" class="receipt-total-row receipt-total-row--due">
            <span>Reste</span>
            <strong>{{ formatPrice(remainingAmount) }} FBU</strong>
          </div>
          <div v-else class="receipt-total-row receipt-total-row--paid">
            <span>Solde</span>
            <strong>Réglé</strong>
          </div>
        </section>

        <div class="receipt-line" />

        <footer class="receipt-footer">
          <div>Merci pour votre achat.</div>
          <!-- <div v-if="sale.merchantName" class="receipt-muted">Vendu par {{ sale.merchantName }}</div> -->
        </footer>
      </article>
    </div>
  </PrintLayout>
</template>

<style scoped>
.receipt-shell {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.receipt-paper {
  width: min(80mm, 100%);
  max-width: 320px;
  background: #fff;
  color: #111;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.35;
  padding: 14px 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.receipt-paper--loading {
  text-align: center;
  color: #6b7280;
}

.receipt-header {
  text-align: center;
}

.receipt-brand {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.receipt-subtitle {
  font-size: 11px;
  margin-top: 2px;
  text-transform: uppercase;
}

.receipt-line {
  border-top: 1px dashed #111;
  margin: 10px 0;
}

.receipt-meta {
  display: grid;
  gap: 3px;
  text-align: left;
}

.receipt-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.receipt-meta-row span {
  color: #4b5563;
}

.receipt-meta-row strong {
  font-weight: 700;
  text-align: right;
}

.receipt-block {
  margin-top: 2px;
}

.receipt-section-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4b5563;
  margin-bottom: 4px;
}

.receipt-client {
  font-weight: 700;
}

.receipt-muted {
  color: #4b5563;
  word-break: break-word;
}

.receipt-items-header,
.receipt-item {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 8px;
  align-items: start;
}

.receipt-items-header {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4b5563;
  margin-bottom: 6px;
}

.receipt-item {
  padding: 2px 0;
}

.receipt-item-qty {
  white-space: nowrap;
}

.receipt-item-name {
  word-break: break-word;
}

.receipt-item-total {
  white-space: nowrap;
  text-align: right;
}

.receipt-totals {
  display: grid;
  gap: 4px;
}

.receipt-total-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.receipt-total-row strong {
  white-space: nowrap;
}

.receipt-total-row--due {
  color: #b91c1c;
  font-weight: 700;
}

.receipt-total-row--paid {
  color: #166534;
  font-weight: 700;
}

.receipt-footer {
  margin-top: 4px;
  text-align: center;
  display: grid;
  gap: 4px;
}

@media print {
  .receipt-shell {
    padding: 0;
  }

  .receipt-paper {
    width: 80mm;
    max-width: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 4mm 3mm 5mm;
    font-size: 11px;
  }

  .receipt-line {
    border-top-color: #000;
  }

  .receipt-muted,
  .receipt-meta-row span,
  .receipt-items-header {
    color: #000;
  }

  @page {
    size: 80mm auto;
    margin: 4mm;
  }
}
</style>
