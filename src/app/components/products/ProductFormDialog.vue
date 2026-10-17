<script setup>
import { ref, watch, computed } from 'vue';
import { Package, Upload } from 'lucide-vue-next';
import { useApp } from '../../../composables/useApp.js';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Label from '../ui/Label.vue';
import Switch from '../ui/Switch.vue';
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
  product: { type: Object, default: null },
  markets: { type: Array, default: () => [] },
  merchants: { type: Array, default: () => [] },
  isMerchant: { type: Boolean, default: false },
  defaultMerchant: { type: Object, default: null },
  defaultMarketId: { type: String, default: '' },
});

const emit = defineEmits(['update:open', 'submit']);

const { productCategories, showToast } = useApp();

const form = ref({
  name: '',
  price: 10000,
  categoryId: '',
  unit: 'kg',
  description: '',
  stock: 50,
  marketId: '',
  merchantId: '',
  placeId: '',
  available: true,
  isTrending: false,
});

const imageFile = ref(null);
const imagePreview = ref(null);
const submitting = ref(false);

const isEditing = computed(() => Boolean(props.product?.id));

const categories = computed(() => productCategories.value);

const merchantsForMarket = computed(() => {
  if (!form.value.marketId) return props.merchants;
  return props.merchants.filter((m) => m.activeMarketId === form.value.marketId);
});

function resolveCategoryId(categoryName, categoryId) {
  if (categoryId) return String(categoryId);
  if (!categoryName) return '';
  const match = categories.value.find((c) => c.name === categoryName);
  return match ? String(match.id) : '';
}

function resetImage(productImage = null) {
  imageFile.value = null;
  imagePreview.value = productImage || null;
}

function onImageChange(e) {
  const file = e.target.files?.[0];
  imageFile.value = file || null;
  imagePreview.value = file ? URL.createObjectURL(file) : props.product?.image || null;
}

function applyMerchantDefaults(merchant) {
  if (!merchant) return;
  form.value.marketId = merchant.activeMarketId || form.value.marketId;
  form.value.merchantId = merchant.id;
  form.value.placeId = merchant.activePlaceId || '';
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    if (props.product) {
      form.value = {
        name: props.product.name,
        price: props.product.price,
        categoryId: resolveCategoryId(props.product.category, props.product.categoryId),
        unit: props.product.unit,
        description: props.product.description || '',
        stock: props.product.stock,
        marketId: props.product.marketId,
        merchantId: props.product.merchantId,
        placeId: props.product.placeId || '',
        available: props.product.available ?? true,
        isTrending: props.product.isTrending ?? false,
      };
      resetImage(props.product.image);
    } else {
      const merchant = props.defaultMerchant;
      form.value = {
        name: '',
        price: 10000,
        categoryId: categories.value[0] ? String(categories.value[0].id) : '',
        unit: 'kg',
        description: '',
        stock: 50,
        marketId: merchant?.activeMarketId || props.defaultMarketId || props.markets[0]?.id || '',
        merchantId: merchant?.id || props.merchants[0]?.id || '',
        placeId: merchant?.activePlaceId || '',
        available: true,
        isTrending: false,
      };
      if (!merchant && props.merchants[0]) {
        applyMerchantDefaults(props.merchants[0]);
      }
      resetImage();
    }
  },
);

watch(
  () => form.value.marketId,
  () => {
    if (props.isMerchant) return;
    const stillValid = merchantsForMarket.value.some((m) => m.id === form.value.merchantId);
    if (!stillValid && merchantsForMarket.value.length) {
      applyMerchantDefaults(merchantsForMarket.value[0]);
    }
  },
);

watch(
  () => form.value.merchantId,
  (merchantId) => {
    if (props.isMerchant || !merchantId) return;
    const merchant = props.merchants.find((m) => m.id === merchantId);
    if (merchant) applyMerchantDefaults(merchant);
  },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!form.value.name.trim()) {
    showToast('La désignation du produit est requise', 'error');
    return;
  }
  if (form.value.price <= 0) {
    showToast('Le prix doit être supérieur à 0', 'error');
    return;
  }
  if (!form.value.marketId) {
    showToast('Sélectionnez un marché', 'error');
    return;
  }
  if (!form.value.merchantId && !props.isMerchant) {
    showToast('Sélectionnez un commerçant', 'error');
    return;
  }
  if (!form.value.categoryId) {
    showToast('Sélectionnez une catégorie', 'error');
    return;
  }
  if (!isEditing.value && !imageFile.value) {
    showToast('Une image est requise pour créer un produit', 'error');
    return;
  }

  const merchant = props.merchants.find((m) => m.id === form.value.merchantId)
    || props.defaultMerchant;

  submitting.value = true;
  emit('submit', {
    ...(props.product || {}),
    name: form.value.name.trim(),
    price: Number(form.value.price),
    categoryId: Number(form.value.categoryId),
    unit: form.value.unit.trim(),
    description: form.value.description.trim(),
    stock: Number(form.value.stock),
    marketId: form.value.marketId,
    merchantId: form.value.merchantId || props.defaultMerchant?.id,
    placeId: form.value.placeId || merchant?.activePlaceId || null,
    placeNumber: merchant?.activePlaceNumber || '',
    available: form.value.available,
    isTrending: form.value.isTrending,
    imageFile: imageFile.value,
  });
  submitting.value = false;
  close();
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Package class="w-5 h-5 text-primary" />
          {{ isEditing ? 'Modifier le produit' : 'Ajouter un produit' }}
        </DialogTitle>
       
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="p-name">Désignation</Label>
          <Input id="p-name" v-model="form.name" placeholder="ex. Mukeke frais" required />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label for="p-price">Prix (BIF)</Label>
            <Input id="p-price" v-model.number="form.price" type="number" min="1" required />
          </div>
          <div class="space-y-2">
            <Label for="p-unit">Unité</Label>
            <Input id="p-unit" v-model="form.unit" placeholder="kg" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label>Catégorie</Label>
            <Select v-model="form.categoryId">
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="cat in categories" :key="cat.id" :value="String(cat.id)">
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="p-stock">Stock</Label>
            <Input id="p-stock" v-model.number="form.stock" type="number" min="0" />
          </div>
        </div>

        <template v-if="!isMerchant">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label>Marché</Label>
              <Select v-model="form.marketId">
                <SelectTrigger>
                  <SelectValue placeholder="Marché" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="m in markets" :key="m.id" :value="m.id">
                    {{ m.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Commerçant</Label>
              <Select v-model="form.merchantId">
                <SelectTrigger>
                  <SelectValue placeholder="Commerçant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="m in merchantsForMarket" :key="m.id" :value="m.id">
                    {{ m.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </template>

        <div class="space-y-2">
          <Label for="p-desc">Description</Label>
          <textarea
            id="p-desc"
            v-model="form.description"
            rows="3"
            class="flex w-full rounded-xl border border-input bg-input-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>

        <div class="flex items-center justify-between gap-4 py-1">
          <div class="flex items-center gap-2">
            <Switch :checked="form.available" @update:checked="form.available = $event" />
            <Label class="font-normal">Disponible à la vente</Label>
          </div>
          <div class="flex items-center gap-2">
            <Switch :checked="form.isTrending" @update:checked="form.isTrending = $event" />
            <Label class="font-normal">En tendance</Label>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Image du produit</Label>
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-xl bg-muted border overflow-hidden shrink-0">
              <img v-if="imagePreview" :src="imagePreview" alt="Aperçu" class="w-full h-full object-cover" />
            </div>
            <label class="cursor-pointer">
              <span class="inline-flex items-center gap-2 text-xs font-semibold text-primary border border-input px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <Upload class="w-4 h-4" />
                {{ isEditing ? "Changer l'image" : 'Sélectionner une image' }}
              </span>
              <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
            </label>
          </div>
          <p v-if="!isEditing && !imageFile" class="text-xs text-muted-foreground">Image requise pour la création</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button type="submit" :disabled="submitting || (!isEditing && !imageFile)">
            {{ isEditing ? 'Enregistrer' : 'Ajouter' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>