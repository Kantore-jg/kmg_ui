<script setup>
import { ref, watch, computed } from 'vue';
import { categoriesForMarket } from '../../../utils/categories.js';
import ProductCategoryMultiSelect from '../markets/ProductCategoryMultiSelect.vue';
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
  productCategoryIds: [],
});

const isEditing = computed(() => Boolean(props.place?.placeId));

const blocksForMarket = computed(() =>
  props.blocks.filter((b) => String(b.marketId) === String(form.value.marketId)),
);

const selectedMarket = computed(() =>
  props.markets.find((m) => String(m.id) === String(form.value.marketId)) || null,
);

const availableCategories = computed(() =>
  categoriesForMarket(selectedMarket.value),
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
        productCategoryIds: [...(props.place.categoryIds || [])],
      };
      return;
    }
    form.value = {
      id: '',
      marketId: props.defaultMarketId || props.markets[0]?.id || '',
      blockId: props.defaultBlockId ? String(props.defaultBlockId) : '',
      productCategoryIds: [],
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

    const allowed = new Set(availableCategories.value.map((c) => String(c.id)));
    form.value.productCategoryIds = form.value.productCategoryIds.filter((id) =>
      allowed.has(String(id)),
    );
  },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!form.value.id.trim() || !form.value.marketId || !form.value.blockId) return;
  if (!form.value.productCategoryIds.length) return;

  emit('submit', {
    ...(props.place || {}),
    id: form.value.id.trim(),
    marketId: form.value.marketId,
    blockId: Number(form.value.blockId) || form.value.blockId,
    productCategoryIds: form.value.productCategoryIds,
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
          <Label>Marché</Label>
          <Select v-model="form.marketId">
            <SelectTrigger>
              <SelectValue placeholder="Choisir un marché" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="m in markets" :key="m.id" :value="m.id">
                {{ m.name }}
              </SelectItem>
            </SelectContent>
          </Select>
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
          <Label>Catégories d'activité</Label>
          <ProductCategoryMultiSelect
            v-model="form.productCategoryIds"
            :options="availableCategories"
            placeholder="Choisir catégories..."
            :disabled="!availableCategories.length"
          />
          <p v-if="!availableCategories.length" class="text-xs text-muted-foreground">
            Aucune catégorie configurée pour ce marché.
          </p>
          
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button
            type="submit"
            :disabled="!form.blockId || !form.productCategoryIds.length || !availableCategories.length"
          >
            {{ isEditing ? 'Mettre à jour' : 'Créer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
