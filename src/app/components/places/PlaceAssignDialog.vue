<script setup>
import { ref, watch } from 'vue';
import { MapPin } from 'lucide-vue-next';
import Button from '../ui/Button.vue';
import Label from '../ui/Label.vue';
import Input from '../ui/Input.vue';
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
import { PLACE_STATUS, normalizePlaceStatus } from '../../../utils/placeStatus.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  place: { type: Object, default: null },
  merchants: { type: Array, default: () => [] },
  marketName: { type: String, default: '' },
});

const emit = defineEmits(['update:open', 'submit']);

const merchantId = ref('all_free');
const status = ref(PLACE_STATUS.AVAILABLE);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen || !props.place) return;
    merchantId.value = props.place.merchantId || 'all_free';
    status.value = normalizePlaceStatus(props.place.status);
  },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!props.place) return;

  let finalStatus = status.value;
  let finalMerchantId = merchantId.value;

  if (merchantId.value === 'all_free') {
    finalStatus = PLACE_STATUS.AVAILABLE;
    finalMerchantId = undefined;
  } else if (merchantId.value !== 'all_free') {
    finalStatus = status.value === PLACE_STATUS.MAINTENANCE
      ? PLACE_STATUS.MAINTENANCE
      : PLACE_STATUS.OCCUPIED;
  }

  emit('submit', {
    placeId: props.place.id,
    marketId: props.place.marketId,
    status: finalStatus,
    merchantId: finalMerchantId === 'all_free' ? undefined : finalMerchantId,
  });
  close();
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md" v-if="place">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <MapPin class="w-5 h-5 text-primary" />
          Affectation d'étal {{ place.id }}
        </DialogTitle>
        <DialogDescription>
          {{ marketName }} — {{ place.blockName }}, {{ place.rowName }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label>Code de l'emplacement</Label>
          <Input :model-value="place.id" readonly class="bg-muted" />
        </div>

        <div class="space-y-2">
          <Label>Commerçant assigné</Label>
          <Select v-model="merchantId">
            <SelectTrigger>
              <SelectValue placeholder="Choisir un commerçant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_free">Aucun (libérer l'étal)</SelectItem>
              <SelectItem v-for="m in merchants" :key="m.id" :value="m.id">
                {{ m.name }} ({{ m.category }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Statut technique</Label>
          <Select v-model="status">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="PLACE_STATUS.AVAILABLE">Libre</SelectItem>
              <SelectItem :value="PLACE_STATUS.OCCUPIED">Occupée</SelectItem>
              <SelectItem :value="PLACE_STATUS.MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button type="submit">Enregistrer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
