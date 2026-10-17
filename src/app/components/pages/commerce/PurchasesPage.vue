<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import {
  fetchCommerceStocks,
  fetchCommerceProducts,
  fetchCashRegisters,
  createCommercePurchase,
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
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();

const stocks = ref([]);
const products = ref([]);
const registers = ref([]);
const submitting = ref(false);

const form = ref({
  stockId: '',
  supplierName: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  paymentStatus: 'paid',
  paidFromCash: false,
  cashRegisterId: '',
  notes: '',
  items: [{ productId: '', quantity: 1, unitCost: 0 }],
});

const lineTotal = computed(() =>
  form.value.items.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0), 0),
);

onMounted(async () => {
  try {
    [stocks.value, products.value, registers.value] = await Promise.all([
      fetchCommerceStocks(),
      fetchCommerceProducts(),
      fetchCashRegisters(),
    ]);
    if (stocks.value.length) form.value.stockId = String(stocks.value[0].id);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
});

function addLine() {
  form.value.items.push({ productId: '', quantity: 1, unitCost: 0 });
}

function removeLine(index) {
  if (form.value.items.length > 1) form.value.items.splice(index, 1);
}

function onProductChange(line) {
  const product = products.value.find((p) => String(p.id) === String(line.productId));
  if (product) line.unitCost = product.purchasePrice;
}

async function submit() {
  if (!form.value.stockId || !form.value.items.every((l) => l.productId && l.quantity > 0)) {
    showToast('Remplissez le stock et les lignes', 'error');
    return;
  }
  submitting.value = true;
  try {
    await createCommercePurchase({
      stockId: Number(form.value.stockId),
      supplierName: form.value.supplierName,
      purchaseDate: form.value.purchaseDate,
      paymentStatus: form.value.paymentStatus,
      paidFromCash: form.value.paidFromCash,
      cashRegisterId: form.value.paidFromCash ? Number(form.value.cashRegisterId) : null,
      notes: form.value.notes,
      items: form.value.items.map((l) => ({
        productId: Number(l.productId),
        quantity: Number(l.quantity),
        unitCost: Number(l.unitCost),
      })),
    });
    showToast('Entrée stock enregistrée', 'success');
    form.value.items = [{ productId: '', quantity: 1, unitCost: 0 }];
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Entrées stock" subtitle="Achats et réapprovisionnement" />

    <Card>
      <CardHeader><CardTitle class="text-base">Nouvelle entrée</CardTitle></CardHeader>
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
          <div class="grid gap-1.5"><Label>Fournisseur</Label><Input v-model="form.supplierName" /></div>
          <div class="grid gap-1.5"><Label>Date *</Label><Input v-model="form.purchaseDate" type="date" /></div>
          <div class="grid gap-1.5">
            <Label>Paiement</Label>
            <Select v-model="form.paymentStatus">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="partial">Partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.paidFromCash" type="checkbox" class="rounded" />
          Payé depuis la caisse
        </label>

        <div v-if="form.paidFromCash" class="grid gap-1.5 max-w-xs">
          <Label>Caisse</Label>
          <Select v-model="form.cashRegisterId">
            <SelectTrigger><SelectValue placeholder="Caisse" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="r in registers" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <Label>Lignes</Label>
            <Button variant="outline" size="sm" @click="addLine"><Plus class="w-4 h-4" /> Ligne</Button>
          </div>
          <div v-for="(line, index) in form.items" :key="index" class="grid grid-cols-12 gap-2 items-end">
            <div class="col-span-5 grid gap-1">
              <Select v-model="line.productId" @update:model-value="onProductChange(line)">
                <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in products" :key="p.id" :value="String(p.id)">{{ p.name }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="col-span-3"><Input v-model.number="line.quantity" type="number" min="0.001" step="any" placeholder="Qté" /></div>
            <div class="col-span-3"><Input v-model.number="line.unitCost" type="number" min="0" placeholder="Coût unit." /></div>
            <div class="col-span-1">
              <Button variant="ghost" size="sm" class="text-destructive" @click="removeLine(index)"><Trash2 class="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center border-t pt-4">
          <span class="font-semibold">Total : {{ formatFbu(lineTotal) }}</span>
          <Button :disabled="submitting" @click="submit">{{ submitting ? 'Enregistrement...' : 'Enregistrer l\'entrée' }}</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
