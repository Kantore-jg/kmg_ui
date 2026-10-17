<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Plus, Minus, Trash2 } from 'lucide-vue-next';
import {
  fetchCommerceProducts,
  fetchCommerceStocks,
  fetchCashRegisters,
  createCommerceSale,
} from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();

const products = ref([]);
const stocks = ref([]);
const registers = ref([]);
const searchQuery = ref('');
const stockId = ref('');
const registerId = ref('');
const paymentMethod = ref('cash');
const cart = ref([]);
const submitting = ref(false);

const filteredProducts = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return products.value.filter((p) =>
    p.status === 'active' && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
  );
});

const cartTotal = computed(() =>
  cart.value.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
);

onMounted(async () => {
  try {
    [products.value, stocks.value, registers.value] = await Promise.all([
      fetchCommerceProducts(),
      fetchCommerceStocks(),
      fetchCashRegisters(),
    ]);
    if (stocks.value.length) stockId.value = String(stocks.value[0].id);
    if (registers.value.length) registerId.value = String(registers.value[0].id);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
});

function addToCart(product) {
  const existing = cart.value.find((l) => l.productId === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.value.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.salePrice,
      quantity: 1,
    });
  }
}

function updateQty(index, delta) {
  const line = cart.value[index];
  line.quantity = Math.max(1, line.quantity + delta);
}

function removeLine(index) {
  cart.value.splice(index, 1);
}

async function validateSale() {
  if (!cart.value.length) {
    showToast('Le panier est vide', 'error');
    return;
  }
  if (!stockId.value) {
    showToast('Sélectionnez un stock', 'error');
    return;
  }
  submitting.value = true;
  try {
    await createCommerceSale({
      stockId: Number(stockId.value),
      cashRegisterId: paymentMethod.value !== 'credit' ? Number(registerId.value) : null,
      paymentMethod: paymentMethod.value,
      items: cart.value.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
    });
    showToast('Vente enregistrée', 'success');
    cart.value = [];
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Nouvelle vente" subtitle="Point de vente" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Rechercher un produit..." class="pl-9 bg-card" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            type="button"
            class="bs-card p-4 text-left hover:border-primary/50 transition-colors"
            @click="addToCart(product)"
          >
            <p class="font-medium">{{ product.name }}</p>
            <p class="text-xs text-muted-foreground">{{ product.sku || product.unit }}</p>
            <p class="text-primary font-semibold mt-1">{{ formatFbu(product.salePrice) }}</p>
          </button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle class="text-base">Panier</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-3">
            <div class="space-y-1">
              <label class="text-xs text-muted-foreground">Stock</label>
              <Select v-model="stockId">
                <SelectTrigger><SelectValue placeholder="Stock" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in stocks" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-1">
              <label class="text-xs text-muted-foreground">Paiement</label>
              <Select v-model="paymentMethod">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile money</SelectItem>
                  <SelectItem value="bank">Banque</SelectItem>
                  <SelectItem value="card">Carte</SelectItem>
                  <SelectItem value="credit">Crédit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="paymentMethod !== 'credit'" class="space-y-1">
              <label class="text-xs text-muted-foreground">Caisse</label>
              <Select v-model="registerId">
                <SelectTrigger><SelectValue placeholder="Caisse" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="r in registers" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div v-if="!cart.length" class="text-sm text-muted-foreground text-center py-6">Panier vide</div>
          <ul v-else class="space-y-3 max-h-48 overflow-y-auto">
            <li v-for="(line, index) in cart" :key="line.productId" class="flex items-center gap-2 text-sm">
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ line.name }}</p>
                <p class="text-xs text-muted-foreground">{{ formatFbu(line.unitPrice) }}</p>
              </div>
              <div class="flex items-center gap-1">
                <Button variant="outline" size="sm" class="h-7 w-7 p-0" @click="updateQty(index, -1)"><Minus class="w-3 h-3" /></Button>
                <span class="w-6 text-center">{{ line.quantity }}</span>
                <Button variant="outline" size="sm" class="h-7 w-7 p-0" @click="updateQty(index, 1)"><Plus class="w-3 h-3" /></Button>
              </div>
              <Button variant="ghost" size="sm" class="h-7 w-7 p-0 text-destructive" @click="removeLine(index)">
                <Trash2 class="w-3 h-3" />
              </Button>
            </li>
          </ul>

          <div class="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span class="text-primary">{{ formatFbu(cartTotal) }}</span>
          </div>

          <Button class="w-full" :disabled="submitting || !cart.length" @click="validateSale">
            {{ submitting ? 'Validation...' : 'Valider la vente' }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
