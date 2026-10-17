<script setup>
import { ref, computed, watch } from 'vue';
import { Upload } from 'lucide-vue-next';
import { fetchPaymentMethods } from '../../../api/services/data.js';
import { getErrorMessage } from '../../../api/client.js';
import { useApp } from '../../../composables/useApp.js';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Label from '../ui/Label.vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const props = defineProps({
  open: { type: Boolean, default: false },
  merchant: { type: Object, default: null },
  marketName: { type: String, default: '' },
  marketId: { type: [Number, String], default: null },
  places: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:open', 'submit']);
const { showToast } = useApp();

const now = new Date();
const periodYear = ref(now.getFullYear());
const periodMonth = ref(now.getMonth() + 1);
const placeId = ref(null);
const paymentMethodId = ref(null);
const paymentMethods = ref([]);
const file = ref(null);
const fileName = ref('');
const loadingMethods = ref(false);

const months = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

const occupiedPlaces = computed(() =>
  props.places.filter((p) => {
    const dbId = p.placeId || p.id;
    return (
      p.status === 'occupied' &&
      (p.merchantId === props.merchant?.id ||
        dbId === props.merchant?.activePlaceId ||
        String(dbId) === String(props.merchant?.activePlaceId))
    );
  }),
);

const selectedPlace = computed(() =>
  occupiedPlaces.value.find((p) => {
    const dbId = p.placeId || p.id;
    return String(dbId) === String(placeId.value);
  }),
);

const rentAmount = computed(() => {
  const place = selectedPlace.value;
  if (!place) return 0;
  if (place.block?.rentAmount != null) return Number(place.block.rentAmount);
  return 0;
});

const years = computed(() => {
  const y = now.getFullYear();
  return [y - 1, y, y + 1];
});

async function loadMethods() {
  if (!props.marketId) {
    paymentMethods.value = [];
    return;
  }
  loadingMethods.value = true;
  try {
    paymentMethods.value = await fetchPaymentMethods({
      market_id: props.marketId,
      is_active: true,
    });
  } catch (error) {
    showToast(getErrorMessage(error, 'Impossible de charger les banques'), 'error');
    paymentMethods.value = [];
  } finally {
    loadingMethods.value = false;
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    periodYear.value = now.getFullYear();
    periodMonth.value = now.getMonth() + 1;
    placeId.value = props.merchant?.activePlaceId
      || occupiedPlaces.value[0]?.placeId
      || occupiedPlaces.value[0]?.id
      || null;
    paymentMethodId.value = null;
    file.value = null;
    fileName.value = '';
    await loadMethods();
  },
);

const close = () => emit('update:open', false);

const onFileChange = (e) => {
  const selected = e.target.files?.[0];
  file.value = selected || null;
  fileName.value = selected?.name || '';
};

const handleSubmit = () => {
  if (!props.merchant || !placeId.value || !paymentMethodId.value || !file.value) return;
  if (rentAmount.value <= 0) {
    showToast('Le loyer du bloc n\'est pas configuré', 'error');
    return;
  }
  emit('submit', {
    merchantId: props.merchant.id,
    merchantName: props.merchant.name,
    marketId: props.marketId,
    marketName: props.marketName,
    placeId: placeId.value,
    periodYear: Number(periodYear.value),
    periodMonth: Number(periodMonth.value),
    paymentMethodId: paymentMethodId.value,
    amount: rentAmount.value,
    file: file.value,
  });
  close();
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Upload class="w-5 h-5 text-primary" />
          Transmettre un loyer
        </DialogTitle>
        <DialogDescription>
          Déclarez le paiement du loyer pour une place occupée (PDF ou image).
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label>Place</Label>
          <Select v-model="placeId">
            <SelectTrigger><SelectValue placeholder="Sélectionner une place" /></SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="p in occupiedPlaces"
                :key="p.placeId || p.id"
                :value="p.placeId || p.id"
              >
                Étal {{ p.number || p.id }} — {{ p.blockName || 'Bloc' }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label>Année</Label>
            <Select :model-value="String(periodYear)" @update:model-value="periodYear = Number($event)">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="y in years" :key="y" :value="String(y)">{{ y }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Mois</Label>
            <Select :model-value="String(periodMonth)" @update:model-value="periodMonth = Number($event)">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="m in months" :key="m.value" :value="String(m.value)">
                  {{ m.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Banque / moyen de paiement</Label>
          <Select v-model="paymentMethodId">
            <SelectTrigger>
              <SelectValue :placeholder="loadingMethods ? 'Chargement...' : 'Choisir la banque'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="pm in paymentMethods" :key="pm.id" :value="pm.id">
                {{ pm.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Montant (BIF)</Label>
          <Input :model-value="rentAmount" type="number" readonly class="bg-muted" />
          <p class="text-xs text-muted-foreground">Montant issu du loyer du bloc.</p>
        </div>

        <div class="space-y-2">
          <Label for="rec-file">Fichier justificatif</Label>
          <Input id="rec-file" type="file" accept="image/*,.pdf" @change="onFileChange" required />
          <p v-if="fileName" class="text-xs text-muted-foreground">{{ fileName }}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button type="submit" :disabled="!file || !placeId || !paymentMethodId">Soumettre</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
