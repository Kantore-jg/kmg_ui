<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import {
  fetchCommerceStocks,
  fetchCommerceProducts,
  createCommerceTransfer,
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

const form = ref({
  fromStockId: '',
  toStockId: '',
  notes: '',
  items: [{ productId: '', quantity: 1 }],
});

onMounted(async () => {
  try {
    [stocks.value, products.value] = await Promise.all([
      fetchCommerceStocks(),
      fetchCommerceProducts(),
    ]);
    if (stocks.value.length >= 2) {
      form.value.fromStockId = String(stocks.value[0].id);
      form.value.toStockId = String(stocks.value[1].id);
    } else if (stocks.value.length === 1) {
      form.value.fromStockId = String(stocks.value[0].id);
    }
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
  if (!form.value.fromStockId || !form.value.toStockId || form.value.fromStockId === form.value.toStockId) {
    showToast('Sélectionnez deux stocks différents', 'error');
    return;
  }
  submitting.value = true;
  try {
    await createCommerceTransfer({
      fromStockId: Number(form.value.fromStockId),
      toStockId: Number(form.value.toStockId),
      notes: form.value.notes,
      items: form.value.items.map((l) => ({
        productId: Number(l.productId),
        quantity: Number(l.quantity),
      })),
    });
    showToast('Transfert enregistré', 'success');
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
    <PageHeader title="Transferts" subtitle="Déplacer des produits entre stocks" />

    <Card>
      <CardHeader><CardTitle class="text-base">Nouveau transfert</CardTitle></CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="grid gap-1.5">
            <Label>Stock source *</Label>
            <Select v-model="form.fromStockId">
              <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in stocks" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-1.5">
            <Label>Stock destination *</Label>
            <Select v-model="form.toStockId">
              <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in stocks" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid gap-1.5"><Label>Notes</Label><Input v-model="form.notes" /></div>

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
            <div class="col-span-3"><Input v-model.number="line.quantity" type="number" min="0.001" step="any" /></div>
            <div class="col-span-1">
              <Button variant="ghost" size="sm" class="text-destructive" @click="removeLine(index)"><Trash2 class="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <div class="flex justify-end border-t pt-4">
          <Button :disabled="submitting" @click="submit">{{ submitting ? 'Enregistrement...' : 'Enregistrer le transfert' }}</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
