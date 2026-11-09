<script setup>
import { ref, watch, computed } from 'vue';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Label from '../ui/Label.vue';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  place: { type: Object, default: null },
  markets: { type: Array, default: () => [] },
  blocks: { type: Array, default: () => [] },
  defaultMarketId: { type: String, default: '' },
  defaultBlockId: { type: [String, Number], default: '' },
});

const emit = defineEmits(['update:open', 'submit', 'create-block']);

const form = ref({
  id: '',
  marketId: '',
  blockId: '',
  category: '',
});

const isEditing = computed(() => Boolean(props.place?.placeId));

const blocksForMarket = computed(() =>
  props.blocks.filter((b) => String(b.marketId) === String(form.value.marketId)),
);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    if (props.place) {
      form.value = {
        id: props.place.id || '',
        marketId: props.place.marketId || props.defaultMarketId || props.markets[0]?.id || '',
        blockId: props.place.blockId ? String(props.place.blockId) : props.defaultBlockId ? String(props.defaultBlockId) : '',
        category: props.place.category || '',
      };
      return;
    }
    form.value = {
      id: '',
      marketId: props.defaultMarketId || props.markets[0]?.id || '',
      blockId: props.defaultBlockId ? String(props.defaultBlockId) : '',
      category: '',
    };
  },
);

watch(
  () => form.value.marketId,
  () => {
    const stillValidBlock = blocksForMarket.value.some(
      (b) => String(b.id) === String(form.value.blockId),
    );
    if (!stillValidBlock) {
      form.value.blockId = blocksForMarket.value[0]?.id
        ? String(blocksForMarket.value[0].id)
        : '';
    }
  },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!form.value.id.trim() || !form.value.marketId || !form.value.blockId) return;

  emit('submit', {
    ...(props.place || {}),
    id: form.value.id.trim(),
    marketId: form.value.marketId,
    blockId: Number(form.value.blockId) || form.value.blockId,
    category: form.value.category.trim() || null,
  });
  close();
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="place-id">Code étal</Label>
          <Input
            id="place-id"
            v-model="form.id"
            placeholder="ex. A-04"
            required
        />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Bloc</Label>
            <button
              type="button"
              class="text-xs font-semibold text-primary hover:underline"
              @click="emit('create-block', form.marketId)"
            >
              + Nouveau bloc
            </button>
          </div>
          <Select v-model="form.blockId" :disabled="!blocksForMarket.length">
            <SelectTrigger>
              <SelectValue :placeholder="blocksForMarket.length ? 'Choisir un bloc' : 'Aucun bloc — créez-en un'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="b in blocksForMarket"
                :key="b.id"
                :value="String(b.id)"
              >
                {{ b.name }}{{ b.code ? ` (${b.code})` : '' }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="!blocksForMarket.length" class="text-xs text-muted-foreground">
            Créez d'abord un bloc pour ce marché.
          </p>
        </div>

        <div class="space-y-2">
          <Label for="place-category">Activité (optionnel)</Label>
          <Input
            id="place-category"
            v-model="form.category"
            placeholder="ex. Vivres, Textiles..."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button
            type="submit"
            :disabled="!form.blockId"
          >
            {{ isEditing ? 'Mettre à jour' : 'Créer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
