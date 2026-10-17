<script setup>
import { ref, computed, watch } from 'vue';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Printer,
  Receipt,
  Banknote,
  CreditCard,
} from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import { usePrintReport } from '../../../../composables/usePrintReport.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import SaleCheckoutDialog from '../../sales/SaleCheckoutDialog.vue';
import Badge from '../../ui/Badge.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import { Card, CardContent } from '../../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

const { addSale, loadSales } = useApp();
const {
  isMerchant,
  scopedProducts,
  scopedSales,
  scopedMerchants,
  assignedMerchant,
  assignedMarketId,
} = useAdminScope();

const { openInvoicePrint, openSaleReceiptPrint } = usePrintReport();

const searchQuery = ref('');
const merchantFilter = ref('all');
const paymentFilter = ref('all');
const dateFrom = ref('');
const dateTo = ref('');
const cart = ref([]);
const checkoutOpen = ref(false);
const saving = ref(false);
const activeTab = ref(isMerchant.value ? 'pos' : 'history');
const productSearchQuery = ref('');

const availableProducts = computed(() =>
  scopedProducts.value.filter((p) => p.available !== false && p.stock > 0),
);

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const filteredProducts = computed(() => {
  const q = normalizeText(productSearchQuery.value.trim());
  if (!q) return [];

  return availableProducts.value.filter((product) => {
    const haystack = [
      product.name,
      product.category,
      product.unit,
      product.placeNumber,
    ]
      .filter(Boolean)
      .map(normalizeText)
      .join(' ');

    return haystack.includes(q);
  });
});

const cartTotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

const cartItemCount = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity, 0),
);

const filteredSales = computed(() =>
  scopedSales.value.filter((s) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      s.invoiceNumber.toLowerCase().includes(q) ||
      s.clientName.toLowerCase().includes(q) ||
      s.merchantName.toLowerCase().includes(q);
    const matchesMerchant =
      merchantFilter.value === 'all' || s.merchantId == merchantFilter.value;
    const matchesPayment =
      paymentFilter.value === 'all' || s.paymentType === paymentFilter.value;
    const matchesFrom = !dateFrom.value || s.createdAt >= dateFrom.value;
    const matchesTo = !dateTo.value || s.createdAt <= dateTo.value;
    return matchesQuery && matchesMerchant && matchesPayment && matchesFrom && matchesTo;
  }),
);

const salesTotal = computed(() =>
  filteredSales.value.reduce((sum, s) => sum + s.total, 0),
);

const creditTotal = computed(() =>
  filteredSales.value.reduce((sum, s) => sum + (s.remainingAmount || 0), 0),
);

const cashTotal = computed(() =>
  filteredSales.value
    .filter((s) => s.paymentType === 'cash')
    .reduce((sum, s) => sum + s.total, 0),
);

const electronicTotal = computed(() =>
  filteredSales.value
    .filter((s) => s.paymentType === 'electronic')
    .reduce((sum, s) => sum + s.total, 0),
);

const formatPrice = (n) => Number(n).toLocaleString('fr-FR');

const paymentLabel = (type) =>
  type === 'cash' ? 'Espèces' : type === 'electronic' ? 'Électronique' : type === 'credit' ? 'Crédit' : type;

const getCartQty = (productId) =>
  cart.value.find((item) => item.id === productId)?.quantity || 0;

const addToCart = (product) => {
  const existing = cart.value.find((item) => item.id === product.id);
  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity += 1;
    }
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      quantity: 1,
    });
  }
};

const updateCartQty = (productId, delta) => {
  const item = cart.value.find((i) => i.id === productId);
  if (!item) return;
  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    cart.value = cart.value.filter((i) => i.id !== productId);
  } else if (newQty <= item.stock) {
    item.quantity = newQty;
  }
};

const removeFromCart = (productId) => {
  cart.value = cart.value.filter((i) => i.id !== productId);
};

const clearCart = () => {
  cart.value = [];
};

const clearProductSearch = () => {
  productSearchQuery.value = '';
};

const openCheckout = () => {
  if (cart.value.length === 0) return;
  checkoutOpen.value = true;
};

const handleCheckout = async (payload) => {
  saving.value = true;
  try {
    const created = await addSale(payload);
    if (created) {
      checkoutOpen.value = false;
      clearCart();
      openInvoicePrint(created.id);
    }
  } finally {
    saving.value = false;
  }
};

const applyDateFilter = () => {
  const params = {};
  if (dateFrom.value) params.from = dateFrom.value;
  if (dateTo.value) params.to = dateTo.value;
  if (paymentFilter.value !== 'all') params.payment_type = paymentFilter.value;
  if (searchQuery.value) params.search = searchQuery.value;
  loadSales(params);
};

const clearFilters = () => {
  searchQuery.value = '';
  merchantFilter.value = 'all';
  paymentFilter.value = 'all';
  dateFrom.value = '';
  dateTo.value = '';
  loadSales();
};

watch([dateFrom, dateTo], () => {
  if (!isMerchant.value) applyDateFilter();
});

const pageTitle = computed(() =>
  isMerchant.value ? 'Point de vente' : 'Gestion des ventes',
);
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="pageTitle"
      :subtitle="
        isMerchant
          ? ''
          : ''
      "
    />

    <div v-if="isMerchant" class="flex gap-2">
      <Button
        :variant="activeTab === 'pos' ? 'default' : 'outline'"
        class="rounded-full"
        @click="activeTab = 'pos'"
      >
        <ShoppingCart class="w-4 h-4" />
        Nouvelle vente
      </Button>
      <Button
        :variant="activeTab === 'history' ? 'default' : 'outline'"
        class="rounded-full"
        @click="activeTab = 'history'"
      >
        <Receipt class="w-4 h-4" />
        Mes ventes
      </Button>
    </div>

    <!-- POS Interface for merchants -->
    <div v-if="isMerchant && activeTab === 'pos'" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 space-y-4">
        <div class="space-y-3">
          
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              v-model="productSearchQuery"
              class="pl-9 bg-card"
              placeholder="Nom du produit, catégorie, unité..."
            />
          </div>
        </div>
        <div
          v-if="availableProducts.length === 0"
          class="bs-card p-12 text-center text-muted-foreground text-sm"
        >
          Aucun produit disponible en stock.
        </div>
        <div
          v-else-if="productSearchQuery.trim() && filteredProducts.length === 0"
          class="bs-card p-12 text-center text-muted-foreground text-sm space-y-2"
        >
          <p>Aucun produit ne correspond à votre recherche.</p>
          <Button variant="outline" size="sm" @click="clearProductSearch">
            Réinitialiser la recherche
          </Button>
        </div>
        <div v-else-if="filteredProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            type="button"
            class="bs-card-hover p-4 text-left transition-colors"
            @click="addToCart(product)"
          >
            <div class="flex justify-between items-start gap-2">
              <h3 class="font-semibold text-sm">{{ product.name }}</h3>
              <Badge v-if="getCartQty(product.id)" class="bg-primary/15 text-primary border-0">
                {{ getCartQty(product.id) }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground mt-1">{{ product.category }}</p>
            <div class="flex justify-between items-center mt-3">
              <span class="font-bold text-primary">{{ formatPrice(product.price) }} FBU</span>
              <span class="text-xs text-muted-foreground">Stock: {{ product.stock }}</span>
            </div>
          </button>
        </div>
        <div v-else class="bs-card p-12 text-center text-muted-foreground text-sm space-y-2">
          <p>rechercher un produit</p>
        </div>
      </div>

      <div class="space-y-4">
        <Card class="sticky top-20">
          <CardContent class="p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold flex items-center gap-2">
                <ShoppingCart class="w-5 h-5 text-primary" />
                Panier
              </h2>
              <Badge v-if="cartItemCount" class="bg-primary text-white border-0">
                {{ cartItemCount }}
              </Badge>
            </div>

            <div v-if="cart.length === 0" class="text-sm text-muted-foreground text-center py-8">
              Le panier est vide. Cliquez sur un produit pour l'ajouter.
            </div>

            <div v-else class="space-y-3 max-h-80 overflow-y-auto">
              <div
                v-for="item in cart"
                :key="item.id"
                class="flex items-center gap-3 p-3 rounded-lg bg-muted/40"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ item.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatPrice(item.price) }} FBU / {{ item.unit }}
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <Button variant="outline" size="sm" class="h-7 w-7 p-0" @click="updateCartQty(item.id, -1)">
                    <Minus class="w-3 h-3" />
                  </Button>
                  <span class="w-6 text-center text-sm font-medium">{{ item.quantity }}</span>
                  <Button variant="outline" size="sm" class="h-7 w-7 p-0" @click="updateCartQty(item.id, 1)">
                    <Plus class="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" class="h-7 w-7 p-0 text-destructive" @click="removeFromCart(item.id)">
                    <Trash2 class="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div v-if="cart.length" class="pt-3 border-t border-border space-y-3">
              <div class="flex justify-between font-semibold">
                <span>Total</span>
                <span class="text-primary">{{ formatPrice(cartTotal) }} FBU</span>
              </div>
              <Button class="w-full rounded-full" @click="openCheckout">
                Valider le paiement
              </Button>
              <Button variant="outline" class="w-full" @click="clearCart">
                Vider le panier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Sales history -->
    <div v-if="!isMerchant || activeTab === 'history'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Ventes" :value="filteredSales.length" :icon="Receipt" color="primary" />
        <StatCard
          title="Chiffre d'affaires"
          :value="`${formatPrice(salesTotal)} FBU`"
          :icon="ShoppingCart"
          color="success"
        />
        <StatCard
          title="Espèces"
          :value="`${formatPrice(cashTotal)} FBU`"
          :icon="Banknote"
          color="warning"
        />
        <StatCard
          title="Électronique"
          :value="`${formatPrice(electronicTotal)} FBU`"
          :icon="CreditCard"
          color="secondary"
        />
        <StatCard
          title="Crédit dû"
          :value="`${formatPrice(creditTotal)} FBU`"
          :icon="CreditCard"
          color="secondary"
        />
      </div>

      <FilterBar
        :show-clear="searchQuery || merchantFilter !== 'all' || paymentFilter !== 'all' || dateFrom || dateTo"
        @clear="clearFilters"
      >
        <div class="flex-1 space-y-1 w-full">
          <label class="text-xs font-medium text-muted-foreground">Recherche</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="Facture, client, commerçant..." class="pl-9 bg-card" />
          </div>
        </div>
        <div v-if="!isMerchant" class="space-y-1 w-full sm:w-44">
          <label class="text-xs font-medium text-muted-foreground">Commerçant</label>
          <Select v-model="merchantFilter">
            <SelectTrigger class="bg-card">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous commerçants</SelectItem>
              <SelectItem v-for="m in scopedMerchants" :key="m.id" :value="String(m.id)">
                {{ m.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1 w-full sm:w-40">
          <label class="text-xs font-medium text-muted-foreground">Paiement</label>
          <Select v-model="paymentFilter">
            <SelectTrigger class="bg-card">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous modes</SelectItem>
              <SelectItem value="cash">Espèces</SelectItem>
              <SelectItem value="electronic">Électronique</SelectItem>
              <SelectItem value="credit">Crédit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1 w-full sm:w-40">
          <label class="text-xs font-medium text-muted-foreground">Du</label>
          <Input v-model="dateFrom" type="date" class="bg-card" />
        </div>
        <div class="space-y-1 w-full sm:w-40">
          <label class="text-xs font-medium text-muted-foreground">Au</label>
          <Input v-model="dateTo" type="date" class="bg-card" />
        </div>
      </FilterBar>

      <Card>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facture</TableHead>
                <TableHead v-if="!isMerchant">Commerçant</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead class="text-right">Montant</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="filteredSales.length === 0">
                <TableCell :colspan="isMerchant ? 6 : 7" class="text-center text-muted-foreground py-12">
                  Aucune vente trouvée pour cette période.
                </TableCell>
              </TableRow>
              <TableRow v-for="sale in filteredSales" :key="sale.id">
                <TableCell class="font-mono text-sm">{{ sale.invoiceNumber }}</TableCell>
                <TableCell v-if="!isMerchant">{{ sale.merchantName }}</TableCell>
                <TableCell>
                  <div>{{ sale.clientName }}</div>
                  <div v-if="sale.clientPhone" class="text-xs text-muted-foreground">
                    {{ sale.clientPhone }}
                  </div>
                </TableCell>
                <TableCell>{{ sale.createdAt }}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{{ paymentLabel(sale.paymentType) }}</Badge>
                  <p v-if="sale.paymentType === 'credit'" class="mt-1 text-xs text-muted-foreground">
                    Payé: {{ formatPrice(sale.paidAmount) }} FBU
                    <span v-if="sale.remainingAmount > 0">
                      · Reste: {{ formatPrice(sale.remainingAmount) }} FBU
                    </span>
                  </p>
                </TableCell>
                <TableCell class="text-right font-medium">
                  {{ formatPrice(sale.total) }} FBU
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" @click="openInvoicePrint(sale.id)">
                      <Printer class="w-4 h-4" />
                      Facture
                    </Button>
                    <Button variant="outline" size="sm" @click="openSaleReceiptPrint(sale.id)">
                      <Receipt class="w-4 h-4" />
                      Reçu
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <SaleCheckoutDialog
      v-model:open="checkoutOpen"
      :cart="cart"
      :market-id="assignedMerchant?.activeMarketId || assignedMarketId"
      :place-id="assignedMerchant?.activePlaceId"
      :saving="saving"
      @submit="handleCheckout"
    />
  </div>
</template>
