<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import {
  fetchCommerceStocks,
  fetchCommerceProducts,
  createCommerceStockExit,
} from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';

const { showToast } = useApp();

const stocks = ref([]);
const products = ref([]);
const submitting = ref(false);

const REASONS = [
  { value: 'LOSS', label: 'Perte' },
  { value: 'DAMAGED', label: 'Endommagé' },
  { value: 'INTERNAL_USE', label: 'Usage interne' },
  { value: 'ADJUSTMENT', label: 'Ajustement' },
  { value: 'OTHER', label: 'Autre' },
];

const form = ref({
  stockId: '',
  reason: 'LOSS',
  items: [{ productId: '', quantity: 1 }],
});

onMounted(async () => {
  try {
    [stocks.value, products.value] = await Promise.all([
      fetchCommerceStocks(),
      fetchCommerceProducts(),
    ]);
    if (stocks.value.length) form.value.stockId = String(stocks.value[0].id);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
});

function addLine() {
  form.value.items.push({ productId: '', quantity: 1 });
}

function removeLine(index) {
  if (form.value.items.length > 1) form.value.items.splice(index, 1);
}

async function submit() {
  if (!form.value.stockId || !form.value.items.every((l) => l.productId && l.quantity > 0)) {
    showToast('Remplissez tous les champs', 'error');
    return;
  }
  submitting.value = true;
  try {
    await createCommerceStockExit({
      stockId: Number(form.value.stockId),
      reason: form.value.reason,
      items: form.value.items.map((l) => ({
        productId: Number(l.productId),
        quantity: Number(l.quantity),
      })),
    });
    showToast('Sortie enregistrée', 'success');
    form.value.items = [{ productId: '', quantity: 1 }];
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Sorties stock" subtitle="Pertes, ajustements et usages internes" />

    <Card>
      <CardHeader><CardTitle class="text-base">Nouvelle sortie</CardTitle></CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="grid gap-1.5">
            <Label>Stock *</Label>
            <Select v-model="form.stockId">
              <SelectTrigger><SelectValue placeholder="Stock" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in stocks" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-1.5">
            <Label>Motif *</Label>
            <Select v-model="form.reason">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in REASONS" :key="r.value" :value="r.value">{{ r.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <Label>Produits</Label>
            <Button variant="outline" size="sm" @click="addLine"><Plus class="w-4 h-4" /> Ligne</Button>
          </div>
          <div v-for="(line, index) in form.items" :key="index" class="grid grid-cols-12 gap-2 items-end">
            <div class="col-span-8">
              <Select v-model="line.productId">
                <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in products" :key="p.id" :value="String(p.id)">{{ p.name }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="col-span-3"><Input v-model.number="line.quantity" type="number" min="0.001" step="any" placeholder="Qté" /></div>
            <div class="col-span-1">
              <Button variant="ghost" size="sm" class="text-destructive" @click="removeLine(index)"><Trash2 class="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <div class="flex justify-end border-t pt-4">
          <Button :disabled="submitting" @click="submit">{{ submitting ? 'Enregistrement...' : 'Enregistrer la sortie' }}</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
